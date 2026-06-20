import express from "express";

const router = express.Router();

/* =================================
   GET DEALER INVOICES
================================= */

router.get("/", async (req, res) => {
  try {
    res.status(200).json([]);
  } catch (error) {
    console.error("Invoice Fetch Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch invoices",
    });
  }
});

export default router;
