import express from "express";

import Order from "../models/Order.js";
import Dealer from "../models/Dealer.js";
import ReturnRequest from "../models/ReturnRequest.js";

import { protect, dealerOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

/* =================================
   RETURN ELIGIBILITY (75 DAYS)
================================= */

const getReturnDetails = (orderDate) => {
  const returnStartDate = new Date(orderDate);

  // Start from next day
  returnStartDate.setDate(returnStartDate.getDate() + 1);

  const returnExpiryDate = new Date(returnStartDate);

  // 75 days from next day
  returnExpiryDate.setDate(returnExpiryDate.getDate() + 75);

  const now = new Date();

  return {
    eligible: now >= returnStartDate && now <= returnExpiryDate,
    returnStartDate,
    returnExpiryDate,
  };
};

router.get("/status", protect, dealerOnly, async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      returnPolicy: "75 Days From Next Day Of Order",
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
      approvalStatus: "APPROVED",
    }).lean();

    const pendingReturns = await ReturnRequest.find({
      dealerId: req.user.id,
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
      const { eligible, returnStartDate, returnExpiryDate } = getReturnDetails(
        order.createdAt,
      );

      if (!eligible) {
        return;
      }
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

            orderId: String(order._id),

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

            returnStartDate,

            returnExpiryDate,

            daysRemaining: Math.max(
              0,
              Math.ceil(
                (returnExpiryDate - new Date()) / (1000 * 60 * 60 * 24),
              ),
            ),
          });
        } else {
          const existing = productsMap.get(productKey);

          existing.orderedBottles += totalBottles;

          existing.availableToReturn += availableToReturn;

          existing.discountPercent = Number(
            item.discountPercent || existing.discountPercent || 0,
          );

          if (!existing.orderIds.includes(String(order._id))) {
            existing.orderIds.push(String(order._id));
          }

          if (!existing.orderNos.includes(order.orderNo)) {
            existing.orderNos.push(order.orderNo);
          }
        }
      });
    });

    const products = Array.from(productsMap.values())
      .filter((product) => product.availableToReturn > 0)
      .sort((a, b) => a.productName.localeCompare(b.productName));

    return res.status(200).json({
      success: true,
      returnPolicy: "75 Days From Next Day Of Order",
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
      const order = await Order.findOne({
        _id: requestItem.orderId,
        userId: req.user.id,
      });

      if (!order) {
        return res.status(400).json({
          success: false,
          message: "Order not found",
        });
      }

      const { eligible } = getReturnDetails(order.createdAt);

      if (!eligible) {
        return res.status(400).json({
          success: false,
          message: `${requestItem.productName} return period expired`,
        });
      }
      const productId = requestItem.productId.toString();

      const productKey = `${productId}_${requestItem.size || ""}`;

      const existingRequest = await ReturnRequest.findOne({
        dealerId: req.user.id,
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
        orderId: requestItem.orderId,

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

      orderId: returnItems[0]?.orderId || null,
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
