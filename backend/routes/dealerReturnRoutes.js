import express from "express";

import Order from "../models/Order.js";
import Dealer from "../models/Dealer.js";
import ReturnRequest from "../models/ReturnRequest.js";

import { protect, dealerOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

/* =================================
   RETURN WINDOW
================================= */

const isReturnWindowOpen = () => {
  const today = new Date();

  const year = today.getFullYear();

  const startDate = new Date(year, 2, 1, 0, 0, 0); // March 1

  const endDate = new Date(year, 4, 31, 23, 59, 59); // May 31

  return today >= startDate && today <= endDate;
};

/* =================================
   FINANCIAL YEAR (APR → MAR)
================================= */

const getFinancialYear = (date = new Date()) => {
  const year = date.getFullYear();

  return date.getMonth() >= 3 ? `${year}-${year + 1}` : `${year - 1}-${year}`;
};

/* =================================
   GET RETURN STATUS
================================= */

router.get("/status", protect, dealerOnly, async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      isReturnWindowOpen: isReturnWindowOpen(),
      financialYear: getFinancialYear(),
      returnStartDate: "March 1",
      returnEndDate: "May 31",
    });
  } catch (error) {
    console.error("RETURN STATUS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to check return status",
    });
  }
});

/* =================================
   GET RETURNABLE PRODUCTS
================================= */

router.get("/orders", protect, dealerOnly, async (req, res) => {
  try {
    const financialYear = getFinancialYear();

    const orders = await Order.find({
      userId: req.user.id,
      role: "DEALER",

      $or: [
        { deliveryStatus: "Delivered" },
        { status: "COMPLETED" },
        { status: "PLACED" },
      ],

      status: {
        $ne: "REJECTED",
      },
    }).lean();

    const approvedReturns = await ReturnRequest.find({
      dealerId: req.user.id,
      financialYear,
      approvalStatus: "APPROVED",
    }).lean();

    const pendingReturns = await ReturnRequest.find({
      dealerId: req.user.id,
      financialYear,
      approvalStatus: "PENDING",
    }).lean();

    const approvedKeys = new Set();
    const pendingKeys = new Set();

    approvedReturns.forEach((request) => {
      (request.items || []).forEach((item) => {
        approvedKeys.add(item.productKey);
      });
    });

    pendingReturns.forEach((request) => {
      (request.items || []).forEach((item) => {
        pendingKeys.add(item.productKey);
      });
    });

    const productsMap = new Map();

    orders.forEach((order) => {
      (order.items || []).forEach((item) => {
        if (!item.productId) return;

        const productId = item.productId.toString();

        const productKey = `${productId}_${item.size || ""}`;

        if (approvedKeys.has(productKey)) return;

        const totalBottles =
          Number(item.cases || 0) * Number(item.bottlesPerCase || 1);

        const alreadyReturned = Number(item.returnedBottles || 0);

        const availableToReturn = Math.max(totalBottles - alreadyReturned, 0);

        if (availableToReturn <= 0) return;

        const gstPercent = Number(item.gstPercent || 0);

        if (!productsMap.has(productKey)) {
          productsMap.set(productKey, {
            productKey,

            productId,

            productName: item.productName || "Unknown Product",

            size: item.size || "",

            mrp: Number(item.mrp || item.pricePerBottle || 0),

            discountPercent: Number(item.discountPercent || 0),

            pricePerBottle: Number(item.pricePerBottle || 0),

            gstPercent,

            orderedBottles: totalBottles,

            availableToReturn,

            pending: pendingKeys.has(productKey),

            orderIds: [String(order._id)],

            orderNos: [order.orderNo],
          });
        } else {
          const existing = productsMap.get(productKey);

          existing.orderedBottles += totalBottles;

          existing.availableToReturn += availableToReturn;

          existing.discountPercent = Number(
            item.discountPercent || existing.discountPercent || 0,
          );

          existing.orderIds.push(String(order._id));

          existing.orderNos.push(order.orderNo);
        }
      });
    });

    const products = Array.from(productsMap.values())
      .filter((product) => product.availableToReturn > 0)
      .sort((a, b) => a.productName.localeCompare(b.productName));

    return res.status(200).json({
      success: true,
      isReturnWindowOpen: isReturnWindowOpen(),
      financialYear,
      products,
    });
  } catch (error) {
    console.error("GET RETURNABLE PRODUCTS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to load return products",
    });
  }
});

/* =================================
   GET MY RETURN REQUESTS
================================= */

router.get("/my-requests", protect, dealerOnly, async (req, res) => {
  try {
    const requests = await ReturnRequest.find({
      dealerId: req.user.id,
    })
      .populate("returnInvoiceId", "invoiceNo pdfUrl grandTotal createdAt")
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      requests,
    });
  } catch (error) {
    console.error("GET RETURN REQUESTS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load return requests",
    });
  }
});

/* =================================
   CREATE RETURN REQUEST
================================= */

router.post("/", protect, dealerOnly, async (req, res) => {
  try {
    if (!isReturnWindowOpen()) {
      return res.status(400).json({
        success: false,
        message: "Returns are allowed only from March 1 to May 31",
      });
    }

    const financialYear = getFinancialYear();

    const { items, remarks } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Return items are required",
      });
    }

    const dealer = await Dealer.findById(req.user.id).lean();

    if (!dealer) {
      return res.status(404).json({
        success: false,
        message: "Dealer not found",
      });
    }

    const returnItems = [];

    let totalAmount = 0;

    for (const requestItem of items) {
      const productId = requestItem.productId.toString();

      const productKey = `${productId}_${requestItem.size || ""}`;

      const existingRequest = await ReturnRequest.findOne({
        dealerId: req.user.id,
        financialYear,
        approvalStatus: {
          $in: ["PENDING", "APPROVED"],
        },
        "items.productKey": productKey,
      });

      if (existingRequest) {
        return res.status(400).json({
          success: false,
          message: `${requestItem.productName} already has a return request`,
        });
      }

      const orderedBottles = Number(requestItem.orderedBottles || 0);

      const availableToReturn = Number(requestItem.availableToReturn || 0);

      const returnQuantity = Number(requestItem.returnQuantity || 0);

      if (returnQuantity <= 0 || returnQuantity > availableToReturn) {
        return res.status(400).json({
          success: false,
          message: `Invalid return quantity for ${requestItem.productName}`,
        });
      }

      const mrp = Number(requestItem.mrp || requestItem.pricePerBottle || 0);

      const discountPercent = Number(requestItem.discountPercent || 0);

      const discountedPrice = Math.max(mrp - (mrp * discountPercent) / 100, 0);

      const gstPercent = Number(requestItem.gstPercent || 0);

      const priceWithGst =
        discountedPrice + (discountedPrice * gstPercent) / 100;

      const returnAmount = Number((priceWithGst * returnQuantity).toFixed(2));

      totalAmount += returnAmount;

      returnItems.push({
        productId,

        productKey,

        productName: requestItem.productName,

        size: requestItem.size || "",

        orderedBottles,

        availableToReturn,

        returnQuantity,

        mrp,

        discountPercent,

        pricePerBottle: Number(discountedPrice.toFixed(2)),

        gstPercent,

        returnAmount,
      });
    }

    console.log("================================");
    console.log("CREATING RETURN REQUEST");
    console.log("Dealer ID:", req.user.id);
    console.log("Dealer Name:", dealer.dealerName);
    console.log("Items:", returnItems.length);
    console.log("Total Amount:", totalAmount);
    console.log("================================");

    const returnRequest = await ReturnRequest.create({
      dealerId: req.user.id,

      dealerName: dealer.dealerName || dealer.name || dealer.shopName || "",

      shopName: dealer.shopName || "",

      dealerPhoneNumber: dealer.phone || "",

      financialYear,

      orderId: null,

      orderNo: "MULTIPLE",

      items: returnItems,

      totalAmount: Number(totalAmount.toFixed(2)),

      remarks: remarks || "",

      approvalStatus: "PENDING",
    });

    console.log("RETURN REQUEST SAVED:", returnRequest._id);

    return res.status(201).json({
      success: true,
      message: "Return request submitted successfully",
      returnRequest,
    });
  } catch (error) {
    console.error("CREATE RETURN ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to submit return request",
    });
  }
});

export default router;
