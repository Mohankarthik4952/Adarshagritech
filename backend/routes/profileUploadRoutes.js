import express from "express";
import multer from "multer";
import path from "path";
import Admin from "../models/Admin.js";
import Dealer from "../models/Dealer.js";
import Customer from "../models/Customer.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

/* =========================
   MULTER CONFIG
========================= */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/profiles");
  },
  filename: (req, file, cb) => {
    cb(
      null,
      `${req.user.role}_${req.user.id}_${Date.now()}${path.extname(
        file.originalname
      )}`
    );
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png/;
    const isValid =
      allowed.test(file.mimetype) &&
      allowed.test(path.extname(file.originalname).toLowerCase());

    cb(isValid ? null : new Error("Only images allowed"), isValid);
  },
});

/* =========================
   PROFILE UPLOAD ROUTE
========================= */
router.post("/upload", protect, upload.single("profile"), async (req, res) => {
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
      return res.status(404).json({ message: "User not found" });
    }

    user.profileImage = `/uploads/profiles/${req.file.filename}`;
    await user.save();

    res.json({
      success: true,
      profileImage: user.profileImage,
    });
  } catch (error) {
    res.status(500).json({ message: "Profile upload failed" });
  }
});

export default router;
