import express from "express";

import Admin from "../models/Admin.js";
import Dealer from "../models/Dealer.js";
import Customer from "../models/Customer.js";

import { protect } from "../middleware/authMiddleware.js";
import { uploadProfileImage } from "../middleware/uploadMiddleware.js";

const router = express.Router();

/* =========================
   PROFILE UPLOAD ROUTE
========================= */

router.post("/upload", protect, uploadProfileImage, async (req, res) => {
  try {
    let user;

    if (req.user.role === "ADMIN") {
      user = await Admin.findById(req.user.id);
    } else if (req.user.role === "DEALER") {
      user = await Dealer.findById(req.user.id);
    } else if (req.user.role === "CUSTOMER") {
      user = await Customer.findById(req.user.id);
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please select an image",
      });
    }

    user.profileImage = req.file.path;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Profile image uploaded successfully",
      profileImage: user.profileImage,
    });
  } catch (error) {
    console.error("PROFILE UPLOAD ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Profile upload failed",
    });
  }
});

export default router;
