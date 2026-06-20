// src/routes/ProtectedRoute.jsx

import { Navigate, Outlet, useLocation } from "react-router-dom";

const ProtectedRoute = ({ role }) => {
  const location = useLocation();

  /* =========================
     TOKEN
  ========================= */

  const token =
    localStorage.getItem("token") ||
    localStorage.getItem("dealerToken") ||
    localStorage.getItem("customerToken") ||
    localStorage.getItem("adminToken");

  /* =========================
     AUTH USER
  ========================= */

  let authUser = null;

  if (role === "customer") {
    authUser =
      localStorage.getItem("customerAuth") || localStorage.getItem("customer");
  }

  if (role === "dealer") {
    authUser =
      localStorage.getItem("dealerAuth") || localStorage.getItem("dealer");
  }

  if (role === "admin") {
    authUser =
      localStorage.getItem("adminAuth") || localStorage.getItem("admin");
  }

  /* =========================
     DEBUG
  ========================= */

  console.log("ProtectedRoute Role:", role);
  console.log("ProtectedRoute Token:", token);
  console.log("ProtectedRoute Auth User:", authUser);

  /* =========================
     NOT LOGGED IN
  ========================= */

  if (!token || !authUser) {
    if (role === "customer") {
      return (
        <Navigate to="/customer/login" state={{ from: location }} replace />
      );
    }

    if (role === "dealer") {
      return <Navigate to="/dealer/login" state={{ from: location }} replace />;
    }

    if (role === "admin") {
      return <Navigate to="/admin/login" state={{ from: location }} replace />;
    }

    return <Navigate to="/" replace />;
  }

  /* =========================
     AUTHORIZED
  ========================= */

  return <Outlet />;
};

export default ProtectedRoute;
