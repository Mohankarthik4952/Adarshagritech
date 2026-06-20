import express from "express";
import Order from "../models/Order.js";
import Payment from "../models/Payment.js";
import Invoice from "../models/Invoice.js";
import { protect, dealerOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

/* =================================
   DEALER DASHBOARD SUMMARY
================================= */

router.get("/summary", protect, dealerOnly, async (req, res) => {
  try {
    const dealerId = req.user.id;

    console.log("================================");
    console.log("DEALER DASHBOARD");
    console.log("DEALER ID:", dealerId);
    console.log("================================");

    /* =========================
       ORDERS
    ========================= */

    const orders = await Order.find({
      userId: dealerId,
      role: "DEALER",
    }).sort({ createdAt: -1 });

    /* =========================
       APPROVED PAYMENTS
    ========================= */

    const transactions = await Payment.find({
      userId: dealerId,
      role: "DEALER",
      status: "APPROVED",
    }).sort({ createdAt: -1 });

    /* =========================
       TOTAL PAID AMOUNT
    ========================= */

    const totalPaidAmount = transactions.reduce(
      (sum, tx) => sum + Number(tx.amount || 0),
      0,
    );

    /* =========================
       ALL INVOICES
    ========================= */

    const invoices = await Invoice.find({
      userId: dealerId,
      role: "DEALER",
    });

    /* =========================
       PENDING INVOICES
    ========================= */

    const pendingInvoices = invoices.filter(
      (invoice) => Number(invoice.balanceAmount || 0) > 0,
    );

    /* =========================
       TOTAL PENDING AMOUNT
    ========================= */

    const pendingBills = pendingInvoices.reduce(
      (sum, invoice) => sum + Number(invoice.balanceAmount || 0),
      0,
    );

    /* =========================
       OUTSTANDING AMOUNT
    ========================= */

    const outstandingAmount = pendingBills;

    /* =========================
       PARTIALLY PAID INVOICES
    ========================= */

    const partiallyPaidOrders = pendingInvoices.filter(
      (invoice) =>
        Number(invoice.paidAmount || 0) > 0 &&
        Number(invoice.balanceAmount || 0) > 0,
    ).length;

    /* =========================
       RECENT ORDERS
    ========================= */

    const updatedOrders = orders.map((order) => ({
      ...order.toObject(),

      totalAmount: Number(order.totalAmount || 0),

      paidAmount: Number(order.paidAmount || 0),

      balanceAmount:
        order.balanceAmount !== undefined && order.balanceAmount !== null
          ? Number(order.balanceAmount)
          : Math.max(
              Number(order.totalAmount || 0) - Number(order.paidAmount || 0),
              0,
            ),
    }));

    console.log("PENDING BILLS AMOUNT:", pendingBills);
    console.log("OUTSTANDING AMOUNT:", outstandingAmount);
    console.log("TOTAL PAID:", totalPaidAmount);

    return res.status(200).json({
      success: true,

      pendingBills,

      outstandingAmount,

      partiallyPaidOrders,

      orders: orders.length,

      totalPaidAmount,

      invoices: invoices.length,

      recentOrders: updatedOrders.slice(0, 5),

      recentTransactions: transactions.slice(0, 5),
    });
  } catch (error) {
    console.error("DASHBOARD SUMMARY ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard summary",
    });
  }
});

export default router;
