import express from "express";

import Order from "../../models/Order.js";

import { protect, adminOnly } from "../../middleware/authMiddleware.js";

const router = express.Router();

/* ===============================
   GET ALL ORDERS (ADMIN)
================================ */

router.get("/", protect, adminOnly, async (req, res) => {
  try {
    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .populate("userId", "name phone email village nearBusStand shopName")
      .populate("invoiceId", "invoiceNo invoiceStatus paymentStatus");

    return res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    console.error("GET ORDERS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch orders",
    });
  }
});

/* ===============================
   GET SINGLE ORDER
================================ */

router.get("/:id", protect, adminOnly, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("userId", "name phone email village nearBusStand shopName")
      .populate("invoiceId");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    return res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("GET ORDER ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch order",
    });
  }
});

/* ===============================
   UPDATE ORDER STATUS
================================ */

router.put("/:id/status", protect, adminOnly, async (req, res) => {
  try {
    const { status } = req.body;

    const allowedStatuses = [
      "PLACED",
      "PROCESSING",
      "DISPATCHED",
      "DELIVERED",
      "CANCELLED",
    ];

    if (!status || !allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order status",
      });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    order.status = status;

    await order.save();

    return res.status(200).json({
      success: true,
      message: "Order status updated successfully",
      order,
    });
  } catch (error) {
    console.error("UPDATE ORDER ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update order",
    });
  }
});

/* ===============================
   DELETE ORDER
================================ */

router.delete("/:id", protect, adminOnly, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    await order.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Order deleted successfully",
    });
  } catch (error) {
    console.error("DELETE ORDER ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to delete order",
    });
  }
});

export default router;
