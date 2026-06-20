import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = ({ role }) => {
  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("role");

  // ❌ Not logged in
  if (!token) {
    return <Navigate to="/" />;
  }

  // ❌ Wrong role
  if (role && userRole !== role) {
    return <Navigate to="/" />;
  }

  // ✅ Access allowed
  return <Outlet />;
};

export default ProtectedRoute;
