import express from "express";
import Order from "../models/Order.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

/* ===============================
   CREATE ORDER
================================ */

router.post("/", protect, async (req, res) => {
  try {
    const { items, totalAmount } = req.body;

    const order = new Order({
      userId: req.user.id,
      role: req.user.role,
      items,
      totalAmount,
    });

    await order.save();

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: "Order creation failed" });
  }
});

/* ===============================
   ADMIN VIEW ALL ORDERS
================================ */

router.get("/admin", protect, async (req, res) => {
  if (req.user.role !== "ADMIN")
    return res.status(403).json({ message: "Access denied" });

  const orders = await Order.find().sort({ createdAt: -1 });

  res.json(orders);
});

/* ===============================
   DEALER ORDERS
================================ */

router.get("/dealer", protect, async (req, res) => {
  if (req.user.role !== "DEALER")
    return res.status(403).json({ message: "Access denied" });

  const orders = await Order.find({
    userId: req.user.id,
  });

  res.json(orders);
});

/* ===============================
   CUSTOMER ORDERS
================================ */

router.get("/customer", protect, async (req, res) => {
  if (req.user.role !== "CUSTOMER")
    return res.status(403).json({ message: "Access denied" });

  const orders = await Order.find({
    userId: req.user.id,
  });

  res.json(orders);
});

export default router;
