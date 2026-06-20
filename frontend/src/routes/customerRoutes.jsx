import { Routes, Route, Navigate } from "react-router-dom";

import CustomerLayout from "../customer/layout/CustomerLayout";
import ProtectedRoute from "../utils/ProtectedRoute";

/* AUTH PAGES */
import CustomerLogin from "../customer/layout/CustomerLogin";
import CustomerSignup from "../customer/layout/CustomerSignup";
import ForgotPassword from "../pages/ForgotPassword";
import VerifyOTP from "../pages/VerifyOTP";
import ResetPassword from "../pages/ResetPassword";

/* CUSTOMER PAGES */
import Home from "../customer/pages/Home";
import Products from "../customer/pages/Products";
import Cart from "../customer/pages/Cart";
import MyOrders from "../customer/pages/MyOrders";
import Transaction from "../customer/pages/Transaction";
import TransactionHistory from "../customer/pages/TransactionHistory";
import CustomerInvoices from "../customer/pages/CustomerInvoices";

const CustomerRoutes = () => {
  return (
    <Routes>
      {/* AUTH ROUTES */}
      <Route path="login" element={<CustomerLogin />} />
      <Route path="signup" element={<CustomerSignup />} />
      <Route path="forgot-password" element={<ForgotPassword />} />
      <Route path="verify-otp" element={<VerifyOTP />} />
      <Route path="reset-password" element={<ResetPassword />} />

      {/* PROTECTED ROUTES */}
      <Route element={<ProtectedRoute role="customer" />}>
        <Route element={<CustomerLayout />}>
          {/* Default redirect */}
          <Route index element={<Navigate to="home" replace />} />

          {/* Dashboard Pages */}
          <Route path="home" element={<Home />} />

          <Route path="products" element={<Products />} />

          <Route path="cart" element={<Cart />} />

          <Route path="myorders" element={<MyOrders />} />

          <Route path="transaction" element={<Transaction />} />

          <Route path="transaction-history" element={<TransactionHistory />} />

          {/* CUSTOMER INVOICES */}
          <Route path="invoices" element={<CustomerInvoices />} />
        </Route>
      </Route>

      {/* FALLBACK */}
      <Route path="*" element={<Navigate to="login" replace />} />
    </Routes>
  );
};

export default CustomerRoutes;
