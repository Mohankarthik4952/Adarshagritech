import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Admin from "../../models/Admin.js";

import {
  adminForgotPassword,
  adminVerifyResetOTP,
  resetAdminPassword,
} from "../../controllers/authController.js";

const router = express.Router();

/* ==================================
   FIXED ADMIN CREDENTIALS
================================== */
const ADMIN_EMAIL =
  process.env.ADMIN_EMAIL?.trim().toLowerCase() ||
  "sunriseagriproducts@gmail.com";

const ADMIN_PHONE = process.env.ADMIN_PHONE?.trim() || "";

/* ==================================
   TEMP OTP STORAGE (LOGIN OTP ONLY)
================================== */
const adminOTPStore = {};

/* ==================================
   TEMP PASSWORD STORAGE
================================== */
let adminPasswordHash = null;

/* ==================================
   ADMIN LOGIN (SEND OTP)
================================== */
router.post("/login", async (req, res) => {
  console.log("================================");
  console.log("ADMIN LOGIN BODY:");
  console.log(req.body);
  console.log("================================");

  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    const normalizedIdentifier = identifier.trim().toLowerCase();

    const validAdmin =
      normalizedIdentifier === ADMIN_EMAIL || identifier.trim() === ADMIN_PHONE;

    if (!validAdmin) {
      return res.status(401).json({
        message: "Unauthorized admin",
      });
    }

    if (!adminPasswordHash) {
      return res.status(400).json({
        message: "Password not set",
      });
    }

    const isMatch = await bcrypt.compare(password, adminPasswordHash);

    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid password",
      });
    }

    const token = jwt.sign(
      { role: "admin" },
      process.env.JWT_SECRET || "SECRET_KEY",
      { expiresIn: "1d" },
    );

    return res.json({
      success: true,
      token,
      admin: {
        role: "admin",
        email: ADMIN_EMAIL,
        phone: ADMIN_PHONE,
      },
    });
  } catch (error) {
    console.error("ADMIN LOGIN ERROR:", error);

    return res.status(500).json({
      message: "Login failed",
    });
  }
});

/* ==================================
   VERIFY LOGIN OTP
================================== */
router.post("/verify-otp", (req, res) => {
  const { identifier, otp } = req.body;

  if (!identifier || !otp) {
    return res.status(400).json({
      message: "Identifier and OTP are required",
    });
  }

  const record = adminOTPStore[identifier];

  if (!record) {
    return res.status(400).json({
      message: "OTP not found",
    });
  }

  if (Date.now() > record.expiresAt) {
    delete adminOTPStore[identifier];

    return res.status(400).json({
      message: "OTP expired",
    });
  }

  if (record.otp !== otp) {
    return res.status(401).json({
      message: "Invalid OTP",
    });
  }

  delete adminOTPStore[identifier];

  if (!adminPasswordHash) {
    return res.json({
      success: true,
      step: "CREATE_PASSWORD",
    });
  }

  res.json({
    success: true,
    step: "PASSWORD_REQUIRED",
  });
});

/* ==================================
   RESEND LOGIN OTP
================================== */
router.post("/resend-otp", (req, res) => {
  const { identifier } = req.body;

  const normalizedIdentifier = String(identifier).trim().toLowerCase();

  if (
    normalizedIdentifier !== ADMIN_EMAIL &&
    identifier.trim() !== ADMIN_PHONE
  ) {
    return res.status(401).json({
      message: "Unauthorized admin",
    });
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  adminOTPStore[identifier] = {
    otp,
    expiresAt: Date.now() + 2 * 60 * 1000,
  };

  console.log("RESEND LOGIN OTP:", otp);

  res.json({
    success: true,
    message: "OTP resent successfully",
  });
});

/* ==================================
   CREATE ADMIN PASSWORD
================================== */
router.post("/create-password", async (req, res) => {
  try {
    const { password } = req.body;

    if (!password || password.length < 8) {
      return res.status(400).json({
        message: "Password must be at least 8 characters",
      });
    }

    adminPasswordHash = await bcrypt.hash(password, 10);

    res.json({
      success: true,
      message: "Password created successfully",
      step: "LOGIN_COMPLETE",
    });
  } catch (error) {
    console.error("CREATE PASSWORD ERROR:", error);

    res.status(500).json({
      message: "Failed to create password",
    });
  }
});

/* ==================================
   VERIFY ADMIN PASSWORD
================================== */
router.post("/verify-password", async (req, res) => {
  try {
    const { password } = req.body;

    if (!adminPasswordHash) {
      return res.status(400).json({
        message: "Password not set",
      });
    }

    const isMatch = await bcrypt.compare(password, adminPasswordHash);

    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid password",
      });
    }

    const token = jwt.sign(
      {
        role: "admin",
      },
      process.env.JWT_SECRET || "SECRET_KEY",
      {
        expiresIn: "1d",
      },
    );

    res.json({
      success: true,
      token,
      admin: {
        role: "admin",
        email: ADMIN_EMAIL,
        phone: ADMIN_PHONE,
      },
    });
  } catch (error) {
    console.error("VERIFY PASSWORD ERROR:", error);

    res.status(500).json({
      message: "Failed to verify password",
    });
  }
});

/* ==================================
   CHANGE PASSWORD
================================== */
router.post("/change-password", async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!adminPasswordHash) {
      return res.status(400).json({
        message: "Password not set",
      });
    }

    const isMatch = await bcrypt.compare(oldPassword, adminPasswordHash);

    if (!isMatch) {
      return res.status(401).json({
        message: "Wrong old password",
      });
    }

    adminPasswordHash = await bcrypt.hash(newPassword, 10);

    res.json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("CHANGE PASSWORD ERROR:", error);

    res.status(500).json({
      message: "Failed to change password",
    });
  }
});

/* ==================================
   FORGOT PASSWORD FLOW
   (Uses authController.js)
================================== */
router.post("/forgot-password", adminForgotPassword);

router.post("/verify-reset-otp", adminVerifyResetOTP);

router.post("/reset-password", resetAdminPassword);

export default router;
