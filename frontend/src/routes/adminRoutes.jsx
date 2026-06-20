import { Routes, Route, Navigate } from "react-router-dom";
import AdminLayout from "../admin/layout/AdminLayout";
import AdminAuthGuard from "../admin/auth/adminAuthGuard";

/* AUTH PAGES */
import AdminLogin from "../admin/auth/AdminLogin";
import AdminForgotPassword from "../admin/auth/adminForgotPassword";
import AdminResetPassword from "../admin/auth/adminResetPassword";
import AdminVerifyOTP from "../admin/auth/adminVerifyOTP";

/* ADMIN PAGES */
import AddProduct from "../admin/pages/AddProduct";
import AdminSocialLinks from "../admin/pages/AdminSocialLinks";
import AdminTermsUpload from "../admin/pages/AdminTermsUpload";
import AllInvoices from "../admin/pages/AllInvoices";
import CustomerProducts from "../admin/pages/CustomerProducts";
import DealerProducts from "../admin/pages/DealerProducts";
import Home from "../admin/pages/Home";
import Orders from "../admin/pages/Orders";
import PriceList from "../admin/pages/PriceList";
import Transactions from "../admin/pages/Transactions";
import Payments from "../admin/pages/Payments";
import AdminReturnRequests from "../admin/pages/AdminReturnRequests";

const AdminRoutes = () => {
  return (
    <Routes>
      {/* =========================
          PUBLIC AUTH ROUTES
      ========================= */}

      {/* /admin → /admin/login */}
      <Route index element={<Navigate to="login" replace />} />

      <Route path="login" element={<AdminLogin />} />
      <Route path="forgot-password" element={<AdminForgotPassword />} />
      <Route path="verify-otp" element={<AdminVerifyOTP />} />
      <Route path="reset-password" element={<AdminResetPassword />} />

      {/* =========================
          PROTECTED ADMIN ROUTES
      ========================= */}
      <Route element={<AdminAuthGuard />}>
        <Route element={<AdminLayout />}>
          {/* /admin/home */}
          <Route path="home" element={<Home />} />

          {/* Product Management */}
          <Route path="add-product" element={<AddProduct />} />
          <Route path="customer-products" element={<CustomerProducts />} />
          <Route path="dealer-products" element={<DealerProducts />} />

          {/* Orders & Transactions */}
          <Route path="orders" element={<Orders />} />
          <Route path="transactions" element={<Transactions />} />

          {/* Pricing */}
          <Route path="price-list" element={<PriceList />} />

          {/* Invoices */}
          <Route path="invoices" element={<AllInvoices />} />
          <Route path="payments" element={<Payments />} />
          <Route path="returns" element={<AdminReturnRequests />} />
        </Route>
      </Route>

      {/* =========================
          FALLBACK ROUTE
      ========================= */}
      <Route path="*" element={<Navigate to="/admin/login" replace />} />
    </Routes>
  );
};

export default AdminRoutes;
