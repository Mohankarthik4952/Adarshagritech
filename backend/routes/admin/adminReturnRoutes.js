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
    const request = await ReturnRequest.findById(req.params.id).populate(
      "dealerId",
    );

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
      let remainingQty = Number(returnItem.returnQuantity || 0);

      const orders = await Order.find({
        userId: request.dealerId,
        role: "DEALER",
        deliveryStatus: "Delivered",
        status: { $ne: "REJECTED" },
      }).sort({ createdAt: 1 });

      for (const order of orders) {
        if (remainingQty <= 0) break;

        const item = order.items.find(
          (orderItem) =>
            orderItem.productId.toString() ===
              returnItem.productId.toString() &&
            orderItem.size === returnItem.size,
        );

        if (!item) continue;

        const totalBottles =
          Number(item.cases || 0) * Number(item.bottlesPerCase || 1);

        const alreadyReturned = Number(item.returnedBottles || 0);

        const available = totalBottles - alreadyReturned;

        if (available <= 0) continue;

        const deductQty = Math.min(available, remainingQty);

        item.returnedBottles = alreadyReturned + deductQty;

        const bottlePriceWithGst =
          Number(returnItem.pricePerBottle || 0) +
          (Number(returnItem.pricePerBottle || 0) *
            Number(returnItem.gstPercent || 0)) /
            100;

        const adjustedAmount = deductQty * bottlePriceWithGst;

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

        if (order.balanceAmount <= 0) {
          order.paymentStatus = "RECEIVED";
        } else if (order.paidAmount > 0) {
          order.paymentStatus = "PARTIAL";
        } else {
          order.paymentStatus = "PENDING";
        }

        await order.save();

        /* =========================
           UPDATE FINAL INVOICE
        ========================= */

        const invoice = await Invoice.findOne({
          orderId: order._id,
          invoiceType: "FINAL",
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

          if (invoice.balanceAmount <= 0) {
            invoice.invoiceStatus = "PAID";
            invoice.paymentStatus = "RECEIVED";
          } else if (invoice.paidAmount > 0) {
            invoice.invoiceStatus = "PARTIALLY_PAID";
            invoice.paymentStatus = "PARTIAL";
          } else {
            invoice.invoiceStatus = "UNPAID";
            invoice.paymentStatus = "PENDING";
          }

          await invoice.save();
        }

        remainingQty -= deductQty;
      }

      if (remainingQty > 0) {
        return res.status(400).json({
          success: false,
          message: `Insufficient quantity available for ${returnItem.productName}`,
        });
      }
    }

    /* =========================
       CALCULATE OUTSTANDING
    ========================= */

    const pendingInvoices = await Invoice.find({
      userId: request.dealerId,
      role: "DEALER",
      invoiceType: "FINAL",
      balanceAmount: { $gt: 0 },
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

      orderNo: "MULTIPLE",

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

    const pdfUrl = await generateInvoicePdf(
      returnInvoice.toObject(),
      totalOutstandingAmount,
    );

    returnInvoice.pdfUrl = pdfUrl;

    await returnInvoice.save();

    /* =========================
       UPDATE REQUEST
    ========================= */

    request.approvalStatus = "APPROVED";

    request.approvedBy = req.user.id;

    request.approvedAt = new Date();

    request.returnInvoiceId = returnInvoice._id;

    request.returnInvoiceNo = returnInvoice.invoiceNo;

    await request.save();

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
