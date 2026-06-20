import Order from "../models/Order.js";

/* ===============================
   CUSTOMER PLACE ORDER
================================ */
export const placeCustomerOrder = async (req, res) => {
  try {
    const userId = req.user.id;

    const { customerName, items, totalAmount } = req.body;

    const orderCount = await Order.countDocuments();
    const orderNo = `ORD-${1000 + orderCount + 1}`;

    const order = await Order.create({
      orderNo,
      userId,
      role: "CUSTOMER",
      customerName,
      items,
      totalAmount,
      status: "PENDING",
      paymentStatus: "PENDING",
    });

    res.status(201).json({
      success: true,
      order,
    });
  } catch (err) {
    res.status(500).json({
      message: "Failed to place order",
    });
  }
};

/* ===============================
   CUSTOMER ORDERS (ALL)
================================ */
export const getCustomerOrders = async (req, res) => {
  try {
    const userId = req.user.id;

    const orders = await Order.find({
      userId,
      role: "CUSTOMER",
    }).sort({ createdAt: -1 });

    res.json(orders);
  } catch (err) {
    res.status(500).json({
      message: "Failed to fetch customer orders",
    });
  }
};

/* ===============================
   CUSTOMER ORDER HISTORY
================================ */
export const getCustomerOrderHistory = async (req, res) => {
  try {
    const userId = req.user.id;

    const orders = await Order.find({
      userId,
      role: "CUSTOMER",
      paymentStatus: "PAID",
    }).sort({ createdAt: -1 });

    res.json(orders);
  } catch (err) {
    res.status(500).json({
      message: "Failed to fetch order history",
    });
  }
};
