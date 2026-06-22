import express from "express";
const router = express.Router();

/* ===============================
   MODELS
================================ */

import Payment from "../models/Payment.js";
import Order from "../models/Order.js";
import Invoice from "../models/Invoice.js";
import Dealer from "../models/Dealer.js";

/* ===============================
   MIDDLEWARE
================================ */

import { protect } from "../middleware/authMiddleware.js";
import generateInvoicePdf from "../utils/generateInvoicePdf.js";
import { sendOrderNotification } from "../utils/sendOrderNotification.js";

/* ===============================
   PAY NOW
================================ */

router.post("/pay-now", protect, async (req, res) => {
  try {
    const { orderId, paymentApp, utrNumber, paymentProof } = req.body;

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    order.paymentStatus = "VERIFICATION_PENDING";

    order.paymentApp = paymentApp || "";

    order.utrNumber = utrNumber || "";

    order.paymentProof = paymentProof || "";

    order.paymentDate = new Date();

    await order.save();

    await Payment.create({
      userId: req.user.id,

      dealerId: req.user.id,

      role: "DEALER",

      orderId: order._id,

      orderNo: order.orderNo,

      invoiceId: order.invoiceId || null,

      invoiceNo: order.invoiceNumber || "",

      paymentCategory: "ORDER_PAYMENT",

      amount: order.totalAmount,

      paymentType: "UPI",

      paymentApp: paymentApp || "",

      utrNumber: utrNumber || "",

      paymentProof: paymentProof || "",

      status: "VERIFICATION_PENDING",

      paymentDate: new Date(),
    });

    res.status(200).json({
      success: true,
      message: "Payment submitted for verification",
    });
  } catch (error) {
    console.error("PAY NOW ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Payment failed",
    });
  }
});

/* ===============================
   PAY LATER
================================ */

router.post("/pay-later", protect, async (req, res) => {
  console.log("PAY LATER ROUTE HIT");
  console.log("USER:", req.user);
  try {
    const { orderId } = req.body;

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    order.paymentStatus = "PENDING";

    await order.save();

    await Payment.create({
      userId: req.user.id,

      dealerId: req.user.id,

      role: "DEALER",

      orderId: order._id,

      orderNo: order.orderNo,

      invoiceId: order.invoiceId || null,

      invoiceNo: order.invoiceNumber || "",

      paymentCategory: "ORDER_PAYMENT",

      amount: order.totalAmount,

      paymentType: "CREDIT",

      status: "PENDING",

      paymentDate: new Date(),
    });

    res.status(200).json({
      success: true,
      message: "Order placed with Pay Later",
    });
  } catch (error) {
    console.error("PAY LATER ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Pay Later failed",
    });
  }
});

/* ===============================
   PAYMENT HISTORY
================================ */
router.get("/history", protect, async (req, res) => {
  try {
    const payments = await Payment.find({
      dealerId: req.user.id,
    })
      .populate("orderId", "orderNo")
      .sort({ createdAt: -1 });

    res.status(200).json(payments);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to load payment history",
    });
  }
});

/* ===============================
   CHECKOUT
================================ */

router.post("/checkout", protect, async (req, res) => {
  console.log("CHECKOUT ROUTE HIT");
  console.log("USER:", req.user);

  try {
    const {
      products,
      totalAmount,
      paymentType = "PAY_LATER",
      paymentApp,
      utrNumber,
      paymentProof,
      cashReceivedBy,
      cashRemarks,
    } = req.body;

    console.log("CHECKOUT REQUEST:", req.body);

    if (!products || products.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No products selected",
      });
    }

    if (!req.user?.id) {
      return res.status(401).json({
        success: false,
        message: "User ID not found in token",
      });
    }

    /* ===============================
       NORMALIZE PAYMENT TYPE
    ============================== */

    const normalizedPaymentType = String(paymentType || "PAY_LATER")
      .trim()
      .toUpperCase()
      .replace(/\s+/g, "_");

    let paymentStatus = "PENDING";

    if (
      normalizedPaymentType === "PAY_NOW" ||
      normalizedPaymentType === "PAY_CASH"
    ) {
      paymentStatus = "VERIFICATION_PENDING";
    }

    let invoice = null;

    const orderNo = `ORD${Date.now()}`;

    const orderItems = products.map((product) => ({
      productId: product.productId || product._id,

      productName: product.productName || product.name || "",

      size: String(product.size || "").trim(),

      cases: Number(product.cases || 1),

      bottlesPerCase: Number(product.bottlesPerCase || 0),

      mrp: Number(product.mrp || 0),

      discountPercent: Number(product.discountPercent || product.discount || 0),

      pricePerBottle: Number(
        product.pricePerBottle || product.unitPrice || product.price || 0,
      ),

      finalPrice: Number(product.finalPrice || 0),
    }));

    console.log("ORDER ITEMS:", JSON.stringify(orderItems, null, 2));

    const invalidItem = orderItems.find(
      (item) =>
        !item.productId ||
        !item.size ||
        item.cases <= 0 ||
        item.bottlesPerCase <= 0,
    );

    if (invalidItem) {
      return res.status(400).json({
        success: false,
        message: `Invalid product data for ${invalidItem.productName}`,
        invalidItem,
      });
    }

    const dealer = await Dealer.findById(req.user.id);

    if (!dealer) {
      return res.status(404).json({
        success: false,
        message: "Dealer not found",
      });
    }

    /* ===============================
       CREATE ORDER
    ============================== */

    const order = await Order.create({
      orderNo,

      userId: req.user.id,

      userModel: "Dealer",

      role: "DEALER",

      dealerName: dealer.dealerName || "",

      shopName: dealer.shopName || "",

      dealerGSTNumber: dealer.gstNumber || "",

      dealerPhoneNumber: dealer.phone || "",

      items: orderItems,

      totalAmount: Number(totalAmount || 0),

      paidAmount: 0,

      paymentType: normalizedPaymentType,

      paymentStatus,

      paymentApp: paymentApp || "",

      utrNumber: utrNumber || "",

      paymentProof: paymentProof || "",

      cashReceivedBy: cashReceivedBy || "",

      cashRemarks: cashRemarks || "",

      paymentDate:
        normalizedPaymentType === "PAY_NOW" ||
        normalizedPaymentType === "PAY_CASH"
          ? new Date()
          : null,

      status: "COMPLETED",

      deliveryStatus: "Delivered",

      invoiceGenerated: false,
    });

    try {
      sendOrderNotification({
        role: "DEALER",
        dealer,
        order,
      });
    } catch (err) {
      console.error("================================");
      console.error("DEALER EMAIL ERROR");
      console.error("MESSAGE:", err.message);
      console.error("STACK:", err.stack);
      console.error("================================");
    }

    /* ===============================
       CREATE INVOICE
    ============================== */

    const shouldGenerateInvoice = [
      "PAY_LATER",
      "CREDIT",
      "PAY_NOW",
      "PAY_CASH",
    ].includes(normalizedPaymentType);

    if (shouldGenerateInvoice) {
      const invoiceNo = `INV-${Date.now()}-${Math.floor(
        1000 + Math.random() * 9000,
      )}`;

      invoice = await Invoice.create({
        invoiceNo,

        invoiceType: "FINAL",

        paymentType: normalizedPaymentType,

        orderId: order._id,

        orderNo: order.orderNo,

        userId: req.user.id,

        role: "DEALER",

        dealerName: dealer.dealerName || "",

        shopName: dealer.shopName || "",

        dealerGSTNumber: dealer.gstNumber || "",

        dealerPhoneNumber: dealer.phone || "",

        companyName: "Sunrise Agri Products",

        items: orderItems.map((item) => ({
          productId: item.productId,

          productName: item.productName,

          size: item.size,

          quantity: Number(item.cases || 1),

          mrp: Number(item.pricePerBottle || 0),

          discount: Number(item.discountPercent || 0),

          gstPercent: Number(item.gstPercent || 0),

          gstAmount: Number(item.gstAmount || 0),

          finalPrice: Number(item.finalPrice || 0),
        })),

        subTotal: Number(totalAmount || 0),

        grandTotal: Number(totalAmount || 0),

        paidAmount: 0,

        balanceAmount: Number(totalAmount || 0),

        paymentStatus,

        invoiceStatus: "UNPAID",

        isLocked: false,
      });

      order.invoiceGenerated = true;

      order.invoiceId = invoice._id;

      order.invoiceNumber = invoice.invoiceNo;

      await order.save();

      generateInvoicePdf(invoice.toObject())
        .then(async (pdfUrl) => {
          await Invoice.findByIdAndUpdate(invoice._id, {
            pdfUrl,
          });
        })
        .catch((err) => {
          console.error("PDF GENERATION ERROR:", err);
        });

      console.log("FINAL INVOICE CREATED:", invoice.invoiceNo);
    }

    /* ===============================
       CREATE PAYMENT RECORD
    ============================== */

    await Payment.create({
      userId: req.user.id,

      dealerId: req.user.id,

      role: "DEALER",

      orderId: order._id,

      orderNo: order.orderNo,

      invoiceId: invoice?._id || null,

      invoiceNo: invoice?.invoiceNo || "",

      paymentCategory:
        normalizedPaymentType === "PAY_LATER" ||
        normalizedPaymentType === "CREDIT"
          ? "OUTSTANDING_PAYMENT"
          : "ORDER_PAYMENT",

      amount: Number(totalAmount || 0),

      paymentType:
        normalizedPaymentType === "PAY_NOW"
          ? "UPI"
          : normalizedPaymentType === "PAY_CASH"
            ? "CASH"
            : "CREDIT",

      paymentApp: normalizedPaymentType === "PAY_NOW" ? paymentApp || "" : "",

      utrNumber: normalizedPaymentType === "PAY_NOW" ? utrNumber || "" : "",

      paymentProof:
        normalizedPaymentType === "PAY_NOW" ? paymentProof || "" : "",

      cashReceivedBy:
        normalizedPaymentType === "PAY_CASH" ? cashReceivedBy || "" : "",

      cashRemarks:
        normalizedPaymentType === "PAY_CASH" ? cashRemarks || "" : "",

      status: paymentStatus,

      paymentDate:
        normalizedPaymentType === "PAY_NOW" ||
        normalizedPaymentType === "PAY_CASH"
          ? new Date()
          : null,
    });

    return res.status(201).json({
      success: true,

      message:
        normalizedPaymentType === "PAY_NOW" ||
        normalizedPaymentType === "PAY_CASH"
          ? "Order placed successfully. Payment submitted for approval."
          : "Order placed and invoice generated successfully.",

      order,

      invoice,
    });
  } catch (error) {
    console.error("DEALER CHECKOUT ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Checkout failed",
    });
  }
});

/* ===============================
   PAY EXISTING ORDER
================================ */

router.post("/pay-existing-order", protect, async (req, res) => {
  try {
    const { orderId, paymentApp, utrNumber, paymentProof } = req.body;

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    order.paymentStatus = "VERIFICATION_PENDING";
    order.paymentApp = paymentApp || "";
    order.utrNumber = utrNumber || "";
    order.paymentProof = paymentProof || "";
    order.paymentDate = new Date();

    await order.save();

    const payment = await Payment.create({
      orderId: order._id,

      orderNo: order.orderNo,

      invoiceId: order.invoiceId || null,

      invoiceNo: order.invoiceNumber || "",

      userId: req.user.id,

      dealerId: req.user.id,

      role: "DEALER",

      paymentCategory: "ORDER_PAYMENT",

      amount: order.balanceAmount || order.totalAmount,

      paymentType: "UPI",

      paymentApp: paymentApp || "",

      utrNumber: utrNumber || "",

      paymentProof: paymentProof || "",

      status: "VERIFICATION_PENDING",

      paymentDate: new Date(),
    });

    console.log("PAYMENT SAVED:", payment);

    res.status(200).json({
      success: true,
      message: "Payment submitted successfully",
    });
  } catch (error) {
    console.error("PAY EXISTING ORDER ERROR:", error);

    res.status(500).json({
      success: false,
      message: error.message || "Payment failed",
    });
  }
});

/* ===============================
   PAY OUTSTANDING AMOUNT
================================ */

router.post("/pay-outstanding", protect, async (req, res) => {
  try {
    const { amount, paymentType, paymentApp, utrNumber, paymentProof } =
      req.body;

    console.log("================================");
    console.log("PAY OUTSTANDING REQUEST");
    console.log(req.body);
    console.log("================================");

    const paymentAmount = Number(amount);

    if (isNaN(paymentAmount) || paymentAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment amount",
      });
    }

    /* ===============================
       FIND ALL UNPAID INVOICES
    ============================== */

    const invoices = await Invoice.find({
      userId: req.user.id,
      role: "DEALER",
      invoiceType: "FINAL",
      balanceAmount: { $gt: 0 },
    });

    if (!invoices.length) {
      return res.status(404).json({
        success: false,
        message: "No outstanding invoices found",
      });
    }

    /* ===============================
       CALCULATE TOTAL OUTSTANDING
    ============================== */

    const totalOutstanding = invoices.reduce(
      (sum, invoice) => sum + Number(invoice.balanceAmount || 0),
      0,
    );

    console.log("PAYMENT AMOUNT:", paymentAmount);
    console.log("TOTAL OUTSTANDING:", totalOutstanding);

    if (paymentAmount > totalOutstanding) {
      return res.status(400).json({
        success: false,
        message: `Amount cannot exceed ₹${totalOutstanding.toFixed(2)}`,
      });
    }

    /* ===============================
       CREATE PAYMENT RECORD
    ============================== */

    const payment = await Payment.create({
      userId: req.user.id,

      dealerId: req.user.id,

      role: "DEALER",

      paymentCategory: "OUTSTANDING_PAYMENT",

      amount: paymentAmount,

      paymentType: paymentType || "UPI",

      paymentApp: paymentType === "UPI" ? paymentApp || "" : "",

      utrNumber: paymentType === "UPI" ? utrNumber || "" : "",

      paymentProof: paymentProof || "",

      status: "VERIFICATION_PENDING",

      paymentDate: new Date(),
    });

    return res.status(201).json({
      success: true,
      message:
        "Outstanding payment submitted successfully and waiting for admin approval.",
      payment,
    });
  } catch (error) {
    console.error("PAY OUTSTANDING ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Payment failed",
    });
  }
});

export default router;
