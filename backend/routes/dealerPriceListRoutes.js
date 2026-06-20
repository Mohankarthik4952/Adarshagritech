import express from "express";
import PriceList from "../models/PriceList.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const lists = await PriceList.find().sort({
      createdAt: -1,
    });

    res.status(200).json(lists);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch price lists",
    });
  }
});

export default router;
