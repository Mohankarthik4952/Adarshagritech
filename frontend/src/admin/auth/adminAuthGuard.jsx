// src/admin/auth/adminAuthGuard.jsx
// REPLACE YOUR ENTIRE FILE WITH THIS CODE

import { Navigate, Outlet, useLocation } from "react-router-dom";

const AdminAuthGuard = () => {
  const location = useLocation();

  /* =========================
     GET TOKEN
     Your login stores token in localStorage as "token"
  ========================= */
  const token = localStorage.getItem("adminToken");

  /* =========================
     IF TOKEN NOT FOUND
     Redirect to admin login page
  ========================= */
  if (!token) {
    return <Navigate to="/admin/login" replace state={{ from: location }} />;
  }

  /* =========================
     AUTHORIZED
     Render protected routes
  ========================= */
  return <Outlet />;
};

export default AdminAuthGuard;
