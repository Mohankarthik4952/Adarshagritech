import Order from "../models/Order.js";

/* ===============================
   ADMIN DASHBOARD STATS
================================ */
export const getAdminDashboardStats = async (req, res) => {
  try {
    // 🚩 For now static / basic DB counts
    const monthlySales = 250000; // later calculate from payments
    const annualSales = 2480000; // later calculate from payments

    const pendingOrders = await Order.countDocuments({
      status: "PENDING",
    });

    const dealersPendingPayments = await Order.countDocuments({
      type: "DEALER",
      paymentStatus: "PENDING",
    });

    res.json({
      monthlySales,
      annualSales,
      pendingOrders,
      dealersPendingPayments,
    });
  } catch (err) {
    res.status(500).json({
      message: "Failed to fetch admin dashboard stats",
    });
  }
};

/* ===============================
   ADMIN PENDING ORDERS
================================ */
export const getPendingOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      status: "PENDING",
    })
      .sort({ createdAt: -1 })
      .limit(10);

    res.json(
      orders.map((order) => ({
        id: order._id,
        orderNo: order.orderNo,
        customer: order.name,
        type: order.type,
        amount: order.totalAmount,
        status: order.status,
      }))
    );
  } catch (err) {
    res.status(500).json({
      message: "Failed to fetch pending orders",
    });
  }
};
