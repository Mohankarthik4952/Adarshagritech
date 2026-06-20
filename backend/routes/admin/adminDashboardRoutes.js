import express from "express";

import Order from "../../models/Order.js";
import Product from "../../models/Product.js";
import Customer from "../../models/Customer.js";
import Dealer from "../../models/Dealer.js";
import Payment from "../../models/Payment.js";
import Invoice from "../../models/Invoice.js";

import { protect, adminOnly } from "../../middleware/authMiddleware.js";

const router = express.Router();

/* =========================
   ADMIN DASHBOARD STATS
========================= */

router.get("/stats", protect, adminOnly, async (req, res) => {
  try {
    const today = new Date();

    /* =========================
       MONTH START
    ========================= */

    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    /* =========================
       FINANCIAL YEAR START (MAY)
    ========================= */

    const financialYearStart =
      today.getMonth() >= 4
        ? new Date(today.getFullYear(), 4, 1)
        : new Date(today.getFullYear() - 1, 4, 1);

    /* =========================
       MONTHLY SALES
    ========================= */

    const monthlyOrders = await Order.find({
      createdAt: {
        $gte: startOfMonth,
      },
      status: {
        $ne: "REJECTED",
      },
    });

    const monthlySales = monthlyOrders.reduce(
      (sum, order) => sum + Number(order.totalAmount || 0),
      0,
    );

    /* =========================
       ANNUAL SALES
    ========================= */

    const annualOrders = await Order.find({
      createdAt: {
        $gte: financialYearStart,
      },
      status: {
        $ne: "REJECTED",
      },
    });

    const annualSales = annualOrders.reduce(
      (sum, order) => sum + Number(order.totalAmount || 0),
      0,
    );

    /* =========================
       DEALER OUTSTANDING
    ========================= */

    const pendingInvoices = await Invoice.find({
      role: "DEALER",
      balanceAmount: {
        $gt: 0,
      },
    });

    const dealerPendingAmount = pendingInvoices.reduce(
      (sum, invoice) => sum + Number(invoice.balanceAmount || 0),
      0,
    );

    /* =========================
       TOTAL AMOUNT RECEIVED
    ========================= */

    const approvedPayments = await Payment.aggregate([
      {
        $match: {
          status: "APPROVED",
        },
      },
      {
        $group: {
          _id: null,
          total: {
            $sum: "$amount",
          },
        },
      },
    ]);

    const totalAmountReceived = approvedPayments[0]?.total || 0;

    /* =========================
       TOTAL PRODUCTS
    ========================= */

    const totalProducts = await Product.countDocuments();

    /* =========================
       TOTAL CUSTOMERS
    ========================= */

    const totalCustomers = await Customer.countDocuments();

    /* =========================
       TOTAL DEALERS
    ========================= */

    const totalDealers = await Dealer.countDocuments();

    /* =========================
       TOTAL ORDERS
    ========================= */

    const totalOrders = await Order.countDocuments({
      status: {
        $ne: "REJECTED",
      },
    });

    return res.status(200).json({
      success: true,

      monthlySales: Number(monthlySales.toFixed(2)),

      annualSales: Number(annualSales.toFixed(2)),

      dealerPendingAmount: Number(dealerPendingAmount.toFixed(2)),

      totalAmountReceived: Number(totalAmountReceived.toFixed(2)),

      totalProducts,

      totalCustomers,

      totalDealers,

      totalOrders,
    });
  } catch (err) {
    console.error("ADMIN DASHBOARD ERROR:", err);

    return res.status(500).json({
      success: false,
      message: "Failed to load dashboard stats",
    });
  }
});

/* =========================
   ANNUAL SALES CHART
========================= */

router.get("/sales-chart", protect, adminOnly, async (req, res) => {
  try {
    const months = [
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
      "Jan",
      "Feb",
      "Mar",
      "Apr",
    ];

    const today = new Date();

    const financialYearStart =
      today.getMonth() >= 4
        ? new Date(today.getFullYear(), 4, 1)
        : new Date(today.getFullYear() - 1, 4, 1);

    const orders = await Order.find({
      createdAt: {
        $gte: financialYearStart,
      },
      status: {
        $ne: "REJECTED",
      },
    });

    const monthlyTotals = {};

    orders.forEach((order) => {
      const month = new Date(order.createdAt).toLocaleString("default", {
        month: "short",
      });

      monthlyTotals[month] =
        (monthlyTotals[month] || 0) + Number(order.totalAmount || 0);
    });

    const result = months.map((month) => ({
      month,
      sales: monthlyTotals[month] || 0,
    }));

    return res.json(result);
  } catch (err) {
    console.error("SALES CHART ERROR:", err);

    return res.status(500).json({
      message: "Chart data failed",
    });
  }
});

/* =========================
   MARK DEALER PAYMENT RECEIVED
========================= */

router.put("/mark-payment/:orderNo", protect, adminOnly, async (req, res) => {
  try {
    const order = await Order.findOne({
      orderNo: req.params.orderNo,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    order.paymentStatus = "RECEIVED";
    order.verifiedAt = new Date();

    await order.save();

    return res.json({
      success: true,
      message: "Payment marked as received",
    });
  } catch (err) {
    console.error("MARK PAYMENT ERROR:", err);

    return res.status(500).json({
      success: false,
      message: "Update failed",
    });
  }
});

export default router;
