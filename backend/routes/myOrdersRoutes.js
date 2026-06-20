import express from "express";

const router = express.Router();

/* =================================
   GET MY ORDERS
================================= */

router.get("/my-orders", async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      orders: [],
    });
  } catch (error) {
    console.error("My Orders Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch orders",
    });
  }
});

export default router;
