import express from "express";

import ReturnRequest from "../../models/ReturnRequest.js";
import Order from "../../models/Order.js";
import Invoice from "../../models/Invoice.js";

import generateInvoicePdf from "../../utils/generateInvoicePdf.js";

import { protect, adminOnly } from "../../middleware/authMiddleware.js";

const router = express.Router();

/* =================================
   GET ALL RETURN REQUESTS
================================= */

router.get("/", protect, adminOnly, async (req, res) => {
  try {
    const requests = await ReturnRequest.find({})
      .populate("dealerId", "name dealerName shopName phone")
      .populate("returnInvoiceId", "invoiceNo pdfUrl")
      .sort({ createdAt: -1 })
      .lean();

    console.log("================================");
    console.log("ADMIN RETURN REQUESTS:", requests.length);

    requests.forEach((request) => {
      console.log({
        id: request._id,
        dealerId: request.dealerId?._id,
        shopName: request.shopName || request.dealerId?.shopName,
        status: request.approvalStatus,
      });
    });

    console.log("================================");

    return res.status(200).json({
      success: true,
      count: requests.length,
      requests,
    });
  } catch (error) {
    console.error("GET RETURN REQUESTS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to load return requests",
    });
  }
});

/* =================================
   GET SINGLE RETURN REQUEST
================================= */

router.get("/:id", protect, adminOnly, async (req, res) => {
  try {
    const request = await ReturnRequest.findById(req.params.id).populate(
      "dealerId",
    );

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Return request not found",
      });
    }

    return res.status(200).json({
      success: true,
      request,
    });
  } catch (error) {
    console.error("GET RETURN REQUEST ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to load request",
    });
  }
});

/* =================================
   APPROVE RETURN REQUEST
================================= */

router.put("/:id/approve", protect, adminOnly, async (req, res) => {
  try {
    const request = await ReturnRequest.findById(req.params.id)
      .populate("dealerId")
      .lean();

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Return request not found",
      });
    }

    if (request.approvalStatus !== "PENDING") {
      return res.status(400).json({
        success: false,
        message: "Return request already processed",
      });
    }

    /* =========================
       PROCESS EACH PRODUCT
    ========================= */

    for (const returnItem of request.items) {
      const order = await Order.findById(returnItem.orderId);

      if (!order) {
        return res.status(400).json({
          success: false,
          message: `Original order not found for ${returnItem.productName}`,
        });
      }

      const item = order.items.find(
        (orderItem) =>
          orderItem.productId.toString() === returnItem.productId.toString() &&
          orderItem.size === returnItem.size,
      );

      if (!item) {
        return res.status(400).json({
          success: false,
          message: `Product not found in original order`,
        });
      }

      const totalBottles =
        Number(item.cases || 0) * Number(item.bottlesPerCase || 1);

      const alreadyReturned = Number(item.returnedBottles || 0);

      const available = totalBottles - alreadyReturned;

      if (available < returnItem.returnQuantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient quantity available for ${returnItem.productName}`,
        });
      }

      item.returnedBottles =
        alreadyReturned + Number(returnItem.returnQuantity);

      const bottlePriceWithGst =
        Number(returnItem.pricePerBottle || 0) +
        (Number(returnItem.pricePerBottle || 0) *
          Number(returnItem.gstPercent || 0)) /
          100;

      const adjustedAmount =
        Number(returnItem.returnQuantity) * bottlePriceWithGst;

      order.totalReturnedAmount =
        Number(order.totalReturnedAmount || 0) + adjustedAmount;

      order.returnAdjustedAmount =
        Number(order.returnAdjustedAmount || 0) + adjustedAmount;

      order.balanceAmount = Math.max(
        Number(order.totalAmount || 0) -
          Number(order.paidAmount || 0) -
          Number(order.returnAdjustedAmount || 0),
        0,
      );

      await order.save();

      const invoice = await Invoice.findOne({
        orderId: order._id,
        role: "DEALER",
      });

      if (invoice) {
        invoice.totalReturnedAmount =
          Number(invoice.totalReturnedAmount || 0) + adjustedAmount;

        invoice.returnAdjustedAmount =
          Number(invoice.returnAdjustedAmount || 0) + adjustedAmount;

        invoice.balanceAmount = Math.max(
          Number(invoice.grandTotal || 0) -
            Number(invoice.paidAmount || 0) -
            Number(invoice.returnAdjustedAmount || 0),
          0,
        );

        await invoice.save();
      }
    }

    /* =========================
       CALCULATE OUTSTANDING
    ========================= */

    const pendingInvoices = await Invoice.find({
      userId: request.dealerId,
      role: "DEALER",
      balanceAmount: { $gt: 0 },
      invoiceType: { $ne: "RETURN" },
    }).lean();

    const totalOutstandingAmount = pendingInvoices.reduce(
      (sum, invoice) => sum + Number(invoice.balanceAmount || 0),
      0,
    );

    /* =========================
       CREATE RETURN INVOICE
    ========================= */

    const returnInvoice = await Invoice.create({
      invoiceNo: `RET-${Date.now()}`,

      invoiceType: "RETURN",

      orderId: null,

      orderNo: request.orderNo || "",

      userId: request.dealerId,

      role: "DEALER",

      paymentType: "PAY_LATER",

      dealerName: request.dealerName,

      shopName: request.shopName,

      dealerGSTNumber: request.dealerId?.gstNumber || "",

      dealerPhoneNumber: request.dealerPhoneNumber || "",

      items: request.items.map((item) => ({
        productId: item.productId,

        productName: item.productName,

        size: item.size,

        quantity: item.returnQuantity,

        mrp: item.pricePerBottle,

        discount: 0,

        gstPercent: item.gstPercent || 0,

        gstAmount:
          (Number(item.pricePerBottle || 0) *
            Number(item.gstPercent || 0) *
            Number(item.returnQuantity || 0)) /
          100,

        finalPrice: item.returnAmount,
      })),

      subTotal: request.totalAmount,

      grandTotal: request.totalAmount,

      paidAmount: request.totalAmount,

      balanceAmount: 0,

      paymentStatus: "RECEIVED",

      invoiceStatus: "PAID",

      isLocked: true,
    });

    /* =========================
       UPDATE REQUEST
    ========================= */

    const updateData = {
      approvalStatus: "APPROVED",
      approvedBy: req.user.id,
      approvedAt: new Date(),
      returnInvoiceId: returnInvoice._id,
      returnInvoiceNo: returnInvoice.invoiceNo,
    };

    if (!request.orderId && request.items?.length > 0) {
      updateData.orderId = request.items[0].orderId || null;
    }

    const updatedRequest = await ReturnRequest.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,
      },
    );

    setImmediate(() => {
      generateInvoicePdf(returnInvoice.toObject(), totalOutstandingAmount)
        .then(async (pdfUrl) => {
          await Invoice.findByIdAndUpdate(returnInvoice._id, {
            pdfUrl,
          });
        })
        .catch((err) => {
          console.error("RETURN PDF ERROR:", err);
        });
    });

    return res.status(200).json({
      success: true,
      message: "Return request approved successfully",

      request,

      returnInvoice,

      totalOutstandingAmount,
    });
  } catch (error) {
    console.error("APPROVE RETURN ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to approve return request",
    });
  }
});

/* =================================
   REJECT RETURN REQUEST
================================= */

router.put("/:id/reject", protect, adminOnly, async (req, res) => {
  try {
    const { rejectionReason } = req.body;

    const request = await ReturnRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Return request not found",
      });
    }

    if (request.approvalStatus !== "PENDING") {
      return res.status(400).json({
        success: false,
        message: "Return request already processed",
      });
    }

    request.approvalStatus = "REJECTED";

    request.rejectionReason = rejectionReason || "";

    request.rejectedAt = new Date();

    await request.save();

    return res.status(200).json({
      success: true,
      message: "Return request rejected successfully",
    });
  } catch (error) {
    console.error("REJECT RETURN ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to reject request",
    });
  }
});

export default router;
