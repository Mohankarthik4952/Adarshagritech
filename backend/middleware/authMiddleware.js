import jwt from "jsonwebtoken";

/* ===============================
   AUTH TOKEN PROTECTION
================================ */

export const protect = (req, res, next) => {
  try {
    let token = null;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer ")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    console.log("================================");
    console.log("TOKEN RECEIVED:", token);
    console.log("================================");

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authorized, token missing",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    console.log("DECODED USER:", decoded);

    req.user = decoded;

    next();
  } catch (error) {
    console.log("================================");
    console.log("JWT VERIFY ERROR:", error.message);
    console.log("================================");

    return res.status(401).json({
      success: false,
      message: "Not authorized, token invalid",
    });
  }
};

/* ===============================
   ADMIN ONLY
================================ */

export const adminOnly = (req, res, next) => {
  console.log("ADMIN USER:", req.user);

  if (req.user?.role === "ADMIN" || req.user?.role === "admin") {
    return next();
  }

  return res.status(403).json({
    success: false,
    message: `Admin access only. Current role: ${req.user?.role}`,
  });
};

/* ===============================
   DEALER ONLY
================================ */

export const dealerOnly = (req, res, next) => {
  console.log("DEALER ROLE:", req.user?.role);

  if (req.user?.role === "DEALER" || req.user?.role === "dealer") {
    return next();
  }

  return res.status(403).json({
    success: false,
    message: "Dealer access only",
  });
};

/* ===============================
   CUSTOMER ONLY
================================ */

export const customerOnly = (req, res, next) => {
  console.log("CUSTOMER ROLE:", req.user?.role);

  if (req.user?.role === "CUSTOMER" || req.user?.role === "customer") {
    return next();
  }

  return res.status(403).json({
    success: false,
    message: "Customer access only",
  });
};
