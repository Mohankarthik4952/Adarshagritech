import express from "express";

const router = express.Router();

import {
  customerSignup,
  customerLogin,
  dealerSignup,
  dealerLogin,
  adminLogin,
  forgotPassword,
  verifyOTP,
  resetPassword,
} from "../controllers/authController.js";

router.post("/customer/signup", customerSignup);

router.post("/customer/login", customerLogin);

router.post("/customer/forgot-password", forgotPassword);

router.post("/customer/verify-otp", verifyOTP);

router.post("/customer/reset-password", resetPassword);

router.post("/dealer/signup", dealerSignup);

router.post("/dealer/login", dealerLogin);

router.post("/admin/login", adminLogin);

router.post("/dealer/forgot-password", forgotPassword);

router.post("/dealer/verify-otp", verifyOTP);

router.post("/dealer/reset-password", resetPassword);

export default router;
