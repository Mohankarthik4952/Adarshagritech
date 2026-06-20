import { Navigate } from "react-router-dom";

const DealerGuard = ({ children }) => {
  const token = localStorage.getItem("dealerToken");
  const role = localStorage.getItem("role");

  if (!token) {
    return <Navigate to="/" replace />;
  }

  if (role !== "DEALER") {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default DealerGuard;
