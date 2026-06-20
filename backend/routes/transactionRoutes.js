import express from "express";

const router = express.Router();

/* =================================
   ADMIN TRANSACTIONS
================================= */

router.get("/admin", async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      transactions: [],
    });
  } catch (error) {
    console.error("Admin Transactions Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch admin transactions",
    });
  }
});

/* =================================
   DEALER TRANSACTIONS
================================= */

router.get("/dealer", async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      transactions: [],
    });
  } catch (error) {
    console.error("Dealer Transactions Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch dealer transactions",
    });
  }
});

/* =================================
   CUSTOMER TRANSACTIONS
================================= */

router.get("/customer", async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      transactions: [],
    });
  } catch (error) {
    console.error("Customer Transactions Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch customer transactions",
    });
  }
});

export default router;
