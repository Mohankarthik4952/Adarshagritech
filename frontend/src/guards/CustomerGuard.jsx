import { Navigate } from "react-router-dom";

const CustomerGuard = ({ children }) => {
  const token = localStorage.getItem("customerToken");
  const role = localStorage.getItem("role");

  if (!token) {
    return <Navigate to="/" replace />;
  }

  if (role !== "CUSTOMER") {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default CustomerGuard;
