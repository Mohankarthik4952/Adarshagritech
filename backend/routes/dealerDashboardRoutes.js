import express from "express";
import Order from "../models/Order.js";
import Payment from "../models/Payment.js";
import Invoice from "../models/Invoice.js";
import { protect, dealerOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/summary", protect, dealerOnly, async (req, res) => {
  try {
    const dealerId = req.user.id;

    const [
      recentOrdersData,
      transactions,
      invoices,
      allOrders,
      ordersCount,
      invoicesCount,
    ] = await Promise.all([
      Order.find({
        userId: dealerId,
        role: "DEALER",
      })
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),

      Payment.find({
        userId: dealerId,
        role: "DEALER",
        status: "APPROVED",
      })
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),

      Invoice.find({
        userId: dealerId,
        role: "DEALER",
      }).lean(),

      Order.find({
        userId: dealerId,
        role: "DEALER",
      }).lean(),

      Order.countDocuments({
        userId: dealerId,
        role: "DEALER",
      }),

      Invoice.countDocuments({
        userId: dealerId,
        role: "DEALER",
      }),
    ]);

    /* ==========================
       TOTAL PAID
    ========================== */

    const totalPaidAmount = transactions.reduce(
      (sum, tx) => sum + Number(tx.amount || 0),
      0,
    );

    /* ==========================
       PENDING BILLS
       (USE ORDERS)
    ========================== */

    const pendingOrders = allOrders.filter(
      (order) => Number(order.balanceAmount || 0) > 0,
    );

    const pendingBills = pendingOrders.reduce(
      (sum, order) => sum + Number(order.balanceAmount || 0),
      0,
    );

    const outstandingAmount = pendingBills;

    const partiallyPaidOrders = pendingOrders.filter(
      (order) =>
        Number(order.paidAmount || 0) > 0 &&
        Number(order.balanceAmount || 0) > 0,
    ).length;

    /* ==========================
       RECENT ORDERS
    ========================== */

    const recentOrders = recentOrdersData.map((order) => ({
      ...order,

      totalAmount: Number(order.totalAmount || 0),

      paidAmount: Number(order.paidAmount || 0),

      returnAdjustedAmount: Number(order.returnAdjustedAmount || 0),

      totalReturnedAmount: Number(order.totalReturnedAmount || 0),

      balanceAmount:
        order.balanceAmount !== undefined && order.balanceAmount !== null
          ? Number(order.balanceAmount)
          : Math.max(
              Number(order.totalAmount || 0) -
                Number(order.paidAmount || 0) -
                Number(order.returnAdjustedAmount || 0),
              0,
            ),
    }));

    return res.status(200).json({
      success: true,

      pendingBills,

      outstandingAmount,

      partiallyPaidOrders,

      orders: ordersCount,

      invoices: invoicesCount,

      totalPaidAmount,

      recentOrders,

      recentTransactions: transactions,
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
