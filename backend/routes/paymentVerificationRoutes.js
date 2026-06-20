import express from "express";

const router = express.Router();

router.post("/verify", async (req, res) => {
  const { razorpay_payment_id } = req.body;

  console.log("Payment Verified", razorpay_payment_id);

  res.json({ success: true });
});

export default router;
