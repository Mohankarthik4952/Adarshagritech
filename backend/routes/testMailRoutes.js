import express from "express";
import { sendOrderNotification } from "../utils/sendOrderNotification.js";

const router = express.Router();

router.get("/send-test-mail", async (req, res) => {
  try {
    console.log("🚀 TEST MAIL ROUTE HIT");

    const result = sendOrderNotification({
      role: "CUSTOMER",

      customer: {
        name: "Test Customer",
        phone: "9999999999",
        village: "Test Village",
        nearBusStand: "Test Bus Stand",
      },

      order: {
        orderNo: `TEST-${Date.now()}`,
        totalAmount: 1000,

        items: [
          {
            productName: "Test Product",
            size: "1L",
            quantity: 1,
          },
        ],
      },
    });

    return res.json({
      success: true,
      result,
    });
  } catch (error) {
    console.error("❌ TEST MAIL ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
      code: error.code,
      response: error.response,
    });
  }
});

export default router;
