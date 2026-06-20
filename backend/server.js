import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import path from "path";

// 🔹 DB
import connectDB from "./config/db.js";

// 🔹 RATE LIMITER
import { apiLimiter, authLimiter } from "./middleware/rateLimit.js";

// 🔹 AUTH
import authRoutes from "./routes/authRoutes.js";

// 🔹 ADMIN ROUTES
import adminDashboardRoutes from "./routes/admin/adminDashboardRoutes.js";
import adminProductRoutes from "./routes/admin/adminProductRoutes.js";
import adminOrderRoutes from "./routes/admin/adminOrderRoutes.js";
import adminAuthRoutes from "./routes/admin/adminAuthRoutes.js";
import adminPriceListRoutes from "./routes/admin/adminPriceListRoutes.js";
import socialRoutes from "./routes/socialRoutes.js";
import adminInvoiceRoutes from "./routes/admin/adminInvoiceRoutes.js";
import adminPaymentRoutes from "./routes/admin/adminPaymentRoutes.js";
import adminReturnRoutes from "./routes/admin/adminReturnRoutes.js";

// 🔹 DEALER ROUTES
import dealerProductRoutes from "./routes/dealerProductRoutes.js";
import dealerOrderRoutes from "./routes/dealerOrderRoutes.js";
import dealerPaymentRoutes from "./routes/dealerPaymentRoutes.js";
import dealerDashboardRoutes from "./routes/dealerDashboardRoutes.js";
import dealerPriceListRoutes from "./routes/dealerPriceListRoutes.js";
import myOrdersRoutes from "./routes/myOrdersRoutes.js";
import dealerDocumentRoutes from "./routes/documentRoutes.js";
import dealerInvoiceRoutes from "./routes/dealerInvoiceRoutes.js";
import dealerReturnRoutes from "./routes/dealerReturnRoutes.js";

// 🔹 CUSTOMER ROUTES
import customerProductRoutes from "./routes/customer/customerProductRoutes.js";
import customerOrderRoutes from "./routes/customer/customerOrderRoutes.js";
import customerPaymentRoutes from "./routes/customer/customerPaymentRoutes.js";
import customerInvoiceRoutes from "./routes/customer/customerInvoiceRoutes.js";

// 🔹 COMMON ROUTES
import orderRoutes from "./routes/orderRoutes.js";
import transactionRoutes from "./routes/transactionRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import youtubeRoutes from "./routes/public/youtubeRoutes.js";

// 🔹 PROFILE
import profileUploadRoutes from "./routes/profileUploadRoutes.js";
import documentRoutes from "./routes/documentRoutes.js";
import termsAcceptanceRoutes from "./routes/termsAcceptanceRoutes.js";

import invoicePdfRoutes from "./routes/invoicePdfRoutes.js";

/* ===============================
   DATABASE CONNECTION
================================ */

connectDB();

const app = express();

/* ===============================
   GLOBAL MIDDLEWARE
================================ */

app.use(cors());

app.use(express.json());

app.use(
  express.urlencoded({
    extended: true,
  }),
);

/* ===============================
   RATE LIMIT
================================ */

app.use("/api", apiLimiter);

app.use("/api/admin/login", authLimiter);

/* ===============================
   STATIC FILES
================================ */

app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

app.use("/templates", express.static(path.join(process.cwd(), "templates")));

/* ===============================
   AUTH ROUTES
================================ */

app.use("/api", authRoutes);

/* ===============================
   ADMIN ROUTES
================================ */

/* DASHBOARD */

app.use("/api/admin/dashboard", adminDashboardRoutes);
app.use("/api/admin/invoices", adminInvoiceRoutes);
app.use("/api/admin/returns", adminReturnRoutes);

/* PRODUCTS */

app.use("/api/admin", adminProductRoutes);

/* ORDERS */

app.use("/api/admin/orders", adminOrderRoutes);

/* AUTH */

app.use("/api/admin", adminAuthRoutes);

/* PRICE LIST */

app.use("/api/admin/pricelist", adminPriceListRoutes);
app.use("/api/admin/payments", adminPaymentRoutes);

/* SOCIAL */

app.use("/api/social", socialRoutes);

/* ===============================
   DEALER ROUTES
================================ */

app.use("/api/dealer/orders", dealerOrderRoutes);

app.use("/api/dealer/payment", dealerPaymentRoutes);

app.use("/api/dealer/dashboard", dealerDashboardRoutes);

app.use("/api/dealer/pricelist", dealerPriceListRoutes);

app.use("/api/dealer/invoices", dealerInvoiceRoutes);

app.use("/api/orders", myOrdersRoutes);

app.use("/api/dealer/documents", dealerDocumentRoutes);
app.use("/api/dealer/products", dealerProductRoutes);
app.use("/api/terms", termsAcceptanceRoutes);
app.use("/api/dealer/returns", dealerReturnRoutes);

/* ===============================
   CUSTOMER ROUTES
================================ */

app.use("/api/customer-products", customerProductRoutes);

app.use("/api/customer/orders", customerOrderRoutes);

app.use("/api/customer/payments", customerPaymentRoutes);

app.use("/api/customer/invoices", customerInvoiceRoutes);

/* ===============================
   COMMON ROUTES
================================ */

app.use("/api/orders", orderRoutes);

app.use("/api/transactions", transactionRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/invoice-pdf", invoicePdfRoutes);
app.use("/api/youtube", youtubeRoutes);

/* ===============================
   PROFILE ROUTES
================================ */

app.use("/api/profile", profileUploadRoutes);

app.use("/api/documents", documentRoutes);

/* ===============================
   HEALTH CHECK
================================ */

app.get("/", (req, res) => {
  res.json({
    status: "Backend running",

    service: "Sunrise Agri Products",

    time: new Date().toISOString(),
  });
});

/* ===============================
   404 HANDLER
================================ */

app.use((req, res) => {
  console.log("404 ROUTE:", req.method, req.originalUrl);

  res.status(404).json({
    message: "API route not found",
  });
});

/* ===============================
   ERROR HANDLER
================================ */

app.use((err, req, res, next) => {
  console.error("SERVER ERROR:", err);

  res.status(500).json({
    message: err.message || "Internal Server Error",
  });
});

/* ===============================
   SERVER START
================================ */

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`✅ Backend running on http://localhost:${PORT}`);
});
