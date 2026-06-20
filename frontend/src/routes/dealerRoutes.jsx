import { Routes, Route, Navigate } from "react-router-dom";

/* LAYOUT */

import DealerLayout from "../dealer/layout/DealerLayout";

/* AUTH */

import DealerLogin from "../dealer/layout/DealerLogin";

import DealerSignup from "../dealer/layout/DealerSignup";

/* PAGES */

import Home from "../dealer/pages/Home";

import Products from "../dealer/pages/Products";

import Cart from "../dealer/pages/Cart";

import MyOrders from "../dealer/pages/MyOrders";

import PriceList from "../dealer/pages/PriceList";

import DealerInvoices from "../dealer/pages/DealerInvoices";

import Documents from "../dealer/pages/Documents";

import Transaction from "../dealer/pages/Transaction";

import TransactionHistory from "../dealer/pages/TransactionHistory";

import PayOutstanding from "../dealer/pages/PayOutstanding";

import DealerReturnProducts from "../dealer/pages/DealerReturnProducts";

/* PROTECTED */

import ProtectedRoute from "../utils/ProtectedRoute";

const DealerRoutes = () => {
  return (
    <Routes>
      {/* AUTH */}

      <Route path="login" element={<DealerLogin />} />

      <Route path="signup" element={<DealerSignup />} />

      {/* PROTECTED */}

      <Route element={<ProtectedRoute role="dealer" />}>
        <Route element={<DealerLayout />}>
          <Route index element={<Navigate to="home" replace />} />

          <Route path="home" element={<Home />} />

          <Route path="products" element={<Products />} />

          <Route path="cart" element={<Cart />} />

          <Route path="orders" element={<MyOrders />} />

          <Route path="transaction" element={<Transaction />} />

          <Route path="transaction-history" element={<TransactionHistory />} />

          <Route path="pay-outstanding" element={<PayOutstanding />} />

          <Route path="returns" element={<DealerReturnProducts />} />

          <Route path="pricelist" element={<PriceList />} />

          <Route path="invoices" element={<DealerInvoices />} />

          <Route path="documents" element={<Documents />} />
        </Route>
      </Route>

      {/* FALLBACK */}

      <Route path="*" element={<Navigate to="login" replace />} />
    </Routes>
  );
};

export default DealerRoutes;
