import Order from "../models/Order.js";

/* ===============================
   DEALER DASHBOARD ORDERS
================================ */
export const getDealerOrders = async (req, res) => {
  try {
    const dealerId = req.user.id;

    const orders = await Order.find({
      dealerId,
    }).sort({ createdAt: -1 });

    res.json(
      orders.map((order) => ({
        id: order._id,
        orderNo: order.orderNo,
        amount: order.totalAmount,
        status: order.status,
        paymentStatus: order.paymentStatus,
        createdAt: order.createdAt,
      }))
    );
  } catch (err) {
    res.status(500).json({
      message: "Failed to fetch dealer orders",
    });
  }
};

/* ===============================
   DEALER PENDING PAYMENTS
================================ */
export const getDealerPendingPayments = async (req, res) => {
  try {
    const dealerId = req.user.id;

    const pendingPayments = await Order.find({
      dealerId,
      paymentStatus: "PENDING",
    });

    res.json(
      pendingPayments.map((order) => ({
        orderNo: order.orderNo,
        amount: order.totalAmount,
        dueDate: order.createdAt,
      }))
    );
  } catch (err) {
    res.status(500).json({
      message: "Failed to fetch pending payments",
    });
  }
};
