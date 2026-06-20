import rateLimit from "express-rate-limit";

/* ===============================
   GLOBAL RATE LIMITER
================================ */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // 🚩 change if needed
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests. Please try again later.",
  },
});

/* ===============================
   AUTH-SPECIFIC LIMITER
================================ */
export const authLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 20, // 🚩 OTP / Login protection
  message: {
    success: false,
    message: "Too many login attempts. Try again later.",
  },
});
