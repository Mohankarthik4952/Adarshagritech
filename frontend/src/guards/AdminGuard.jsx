import { Navigate } from "react-router-dom";

const AdminGuard = ({ children }) => {
  const token = localStorage.getItem("adminToken");
  const role = localStorage.getItem("role");

  if (!token) {
    return <Navigate to="/" replace />;
  }

  if (role !== "ADMIN") {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default AdminGuard;
