import express from "express";
import Order from "../models/Order.js";
import Invoice from "../models/Invoice.js";
import Dealer from "../models/Dealer.js";

import { protect, dealerOnly } from "../middleware/authMiddleware.js";

import generateInvoicePdf from "../utils/generateInvoicePdf.js";
import { sendOrderNotification } from "../utils/sendOrderNotification.js";

const router = express.Router();

/* =====================================
   GENERATE UNIQUE INVOICE NUMBER
===================================== */

const generateInvoiceNumber = async () => {
  let invoiceNo;
  let exists = true;

  while (exists) {
    invoiceNo = `INV-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    exists = await Invoice.exists({ invoiceNo });
  }

  return invoiceNo;
};

/* =====================================
   GENERATE UNIQUE ORDER NUMBER
===================================== */

const generateOrderNumber = () => {
  return `ORD-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
};

/* =====================================
   CREATE DEALER ORDER
===================================== */

router.post("/", protect, dealerOnly, async (req, res) => {
  try {
    const { items, paymentType } = req.body;

    const dealerId = req.user.id;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No products selected",
      });
    }

    /* =========================
       NORMALIZE PAYMENT TYPE
    ========================= */

    const normalizedPaymentType = String(paymentType || "")
      .trim()
      .toUpperCase()
      .replace(/\s+/g, "_");

    const allowedPaymentTypes = ["PAY_NOW", "PAY_LATER", "PAY_CASH", "CREDIT"];

    if (!allowedPaymentTypes.includes(normalizedPaymentType)) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment type",
      });
    }

    /* =========================
       FIND DEALER
    ========================= */

    const dealer = await Dealer.findById(dealerId).lean();

    if (!dealer) {
      return res.status(404).json({
        success: false,
        message: "Dealer not found",
      });
    }

    /* =========================
       CALCULATE TOTAL
    ========================= */

    const totalAmount = Number(
      items
        .reduce((sum, item) => {
          return (
            sum + Number(item.finalPrice || item.totalPrice || item.price || 0)
          );
        }, 0)
        .toFixed(2),
    );

    /* =========================
       CREATE ORDER
    ========================= */

    const orderNo = generateOrderNumber();

    const order = new Order({
      orderNo,

      userId: dealerId,

      userModel: "Dealer",

      role: "DEALER",

      dealerName: dealer.dealerName || "",

      shopName: dealer.shopName || "",

      dealerGSTNumber: dealer.gstNumber || "",

      dealerPhoneNumber: dealer.phone || "",

      items,

      totalAmount,

      paidAmount: 0,

      balanceAmount: totalAmount,

      paymentType: normalizedPaymentType,

      paymentStatus:
        normalizedPaymentType === "PAY_NOW" ||
        normalizedPaymentType === "PAY_CASH"
          ? "VERIFICATION_PENDING"
          : "PENDING",

      /* Dealer orders auto delivered */

      status: "COMPLETED",

      deliveryStatus: "Delivered",

      invoiceGenerated: false,
    });
    await order.save();

    void sendOrderNotification({
      role: "DEALER",
      dealer,
      order,
    })
      .then((info) => {})
      .catch((err) => {
        console.error("❌ DEALER EMAIL FAILED:", order.orderNo);

        console.error(err);
      });

    let invoice = null;

    /* =========================
       CREATE INVOICE IMMEDIATELY
       FOR PAY_LATER / CREDIT
    ========================= */

    if (
      normalizedPaymentType === "PAY_LATER" ||
      normalizedPaymentType === "CREDIT"
    ) {
      const invoiceNo = await generateInvoiceNumber();

      const invoiceItems = items.map((item) => ({
        productId: item.productId,

        productName:
          item.productName ||
          item.name ||
          item.product?.name ||
          "Unknown Product",

        size: item.size || "",

        quantity: Number(item.cases || item.quantity || 1),

        mrp: Number(item.pricePerBottle || item.mrp || 0),

        discount: Number(item.discountPercent || item.discount || 0),

        gstPercent: Number(item.gstPercent || 0),

        gstAmount: Number(item.gstAmount || 0),

        finalPrice: Number(
          item.finalPrice || item.totalPrice || item.price || 0,
        ),
      }));

      invoice = await Invoice.create({
        invoiceNo,

        invoiceType: "FINAL",

        paymentType: normalizedPaymentType,

        orderId: order._id,

        orderNo: order.orderNo,

        userId: dealerId,

        role: "DEALER",

        dealerName: dealer.dealerName || "",

        shopName: dealer.shopName || "",

        dealerGSTNumber: dealer.gstNumber || "",

        dealerPhoneNumber: dealer.phone || "",

        items: invoiceItems,

        subTotal: totalAmount,

        grandTotal: totalAmount,

        paidAmount: 0,

        balanceAmount: totalAmount,

        paymentStatus: "PENDING",

        invoiceStatus: "UNPAID",

        isLocked: false,
      });

      /* =========================
         LINK ORDER & INVOICE
      ========================= */

      order.invoiceGenerated = true;

      order.invoiceNumber = invoice.invoiceNo;

      order.invoiceId = invoice._id;

      await order.save();

      /* =========================
         GENERATE PDF IN BACKGROUND
      ========================= */

      setImmediate(async () => {
        try {
          const latestInvoice = await Invoice.findById(invoice._id).lean();

          if (!latestInvoice) return;

          const pdfUrl = await generateInvoicePdf(latestInvoice);

          await Invoice.findByIdAndUpdate(invoice._id, {
            pdfUrl,
          });

          console.log("PDF GENERATED:", invoice.invoiceNo);
        } catch (pdfError) {
          console.error("PDF GENERATION ERROR:", pdfError);
        }
      });

      console.log("FINAL INVOICE CREATED:", invoice.invoiceNo);
    }

    return res.status(201).json({
      success: true,

      order,

      invoice,

      message:
        normalizedPaymentType === "PAY_NOW" ||
        normalizedPaymentType === "PAY_CASH"
          ? "Order placed successfully. Final invoice will be generated after payment approval."
          : "Order placed and invoice generated successfully.",
    });
  } catch (error) {
    console.error("DEALER ORDER ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to place order",
    });
  }
});

/* =====================================
   GET DEALER ORDERS
===================================== */

router.get("/", protect, dealerOnly, async (req, res) => {
  try {
    const orders = await Order.find({
      userId: req.user.id,
      role: "DEALER",
    })
      .populate(
        "invoiceId",
        "paidAmount balanceAmount invoiceStatus invoiceNo pdfUrl",
      )
      .sort({ createdAt: -1 });

    const updatedOrders = orders.map((order) => {
      const totalAmount = Number(order.totalAmount || 0);

      let paidAmount = Number(order.paidAmount || 0);

      let balanceAmount = Number(order.balanceAmount || 0);

      if (order.invoiceId) {
        paidAmount = Number(order.invoiceId.paidAmount ?? paidAmount);

        balanceAmount = Number(order.invoiceId.balanceAmount ?? balanceAmount);
      }

      return {
        ...order.toObject(),

        totalAmount,

        paidAmount,

        balanceAmount,
      };
    });

    return res.status(200).json({
      success: true,

      orders: updatedOrders,
    });
  } catch (error) {
    console.error("GET DEALER ORDERS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load orders",
    });
  }
});

export default router;
