import express from "express";
import Payment from "../../models/Payment.js";
import Order from "../../models/Order.js";
import { protect, customerOnly } from "../../middleware/authMiddleware.js";
import { sendOrderNotification } from "../../utils/sendOrderNotification.js";

const router = express.Router();

/* =====================================================
   CUSTOMER PAY NOW
===================================================== */

router.post("/", protect, customerOnly, async (req, res) => {
  try {
    const { orderId, amount, paymentApp, utrNumber, paymentProof } = req.body;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: "Order ID is required",
      });
    }

    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({
        success: false,
        message: "Valid amount is required",
      });
    }

    if (!paymentApp?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Payment App is required",
      });
    }

    if (!utrNumber?.trim()) {
      return res.status(400).json({
        success: false,
        message: "UTR Number is required",
      });
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    /* =========================
       VERIFY ORDER OWNERSHIP
    ========================= */

    if (
      String(order.userId) !== String(req.user.id) ||
      order.role !== "CUSTOMER"
    ) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized access",
      });
    }

    /* =========================
       PREVENT DUPLICATE PAYMENTS
    ========================= */

    const existingPayment = await Payment.findOne({
      orderId,
      status: {
        $in: ["VERIFICATION_PENDING", "APPROVED"],
      },
    });

    if (existingPayment) {
      return res.status(400).json({
        success: false,
        message: "Payment already submitted for this order",
      });
    }

    /* =========================
       VERIFY AMOUNT
    ========================= */

    const orderAmount = Number(order.totalAmount || 0);

    if (Number(amount) !== orderAmount) {
      return res.status(400).json({
        success: false,
        message: `Payment amount must be ₹${orderAmount}`,
      });
    }

    /* =========================
       UPDATE ORDER
    ========================= */

    order.paymentType = "PAY_NOW";
    order.paymentStatus = "VERIFICATION_PENDING";
    order.paymentApp = paymentApp.trim();
    order.utrNumber = utrNumber.trim();
    order.paymentProof = paymentProof || "";
    order.paymentDate = new Date();

    await order.save();

    /* =========================
       CREATE PAYMENT
    ========================= */

    const payment = await Payment.create({
      orderId: order._id,

      userId: req.user.id,

      role: "CUSTOMER",

      customerName: order.customerName || "",

      customerPhoneNumber: order.customerPhoneNumber || "",

      amount: Number(amount),

      paymentType: "UPI",

      paymentApp: paymentApp.trim(),

      utrNumber: utrNumber.trim(),

      paymentProof: paymentProof || "",

      status: "VERIFICATION_PENDING",

      paymentDate: new Date(),
    });

    console.log("CUSTOMER PAYMENT CREATED:", payment._id);

    /* =========================
       SEND EMAIL NOTIFICATION
    ========================= */

    void sendOrderNotification({
      role: "CUSTOMER",
      dealer,
      order,
    })
      .then(() => {})
      .catch((err) => {
        console.error(`❌ Order email failed: ${order.orderNo}`);
        console.error(err);
      });

    return res.status(201).json({
      success: true,
      message: "Payment submitted successfully",
      payment,
    });
  } catch (error) {
    console.error("CUSTOMER PAYMENT ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Payment failed",
    });
  }
});

/* =====================================================
   CUSTOMER PAYMENT HISTORY
===================================================== */

router.get("/history", protect, customerOnly, async (req, res) => {
  try {
    console.log("CUSTOMER ID:", req.user.id);

    const payments = await Payment.find({
      userId: req.user.id,
      role: "CUSTOMER",
    })
      .populate("orderId")
      .sort({ createdAt: -1 });

    console.log("CUSTOMER PAYMENTS FOUND:", payments.length);

    return res.status(200).json({
      success: true,
      payments,
    });
  } catch (error) {
    console.error("PAYMENT HISTORY ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load payment history",
    });
  }
});

export default router;
