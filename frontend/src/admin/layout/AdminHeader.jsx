// src/admin/layout/AdminHeader.jsx

import { useNavigate } from "react-router-dom";
import logo from "../../assets/sunrise.png";
import "./adminLayout.css";

const AdminHeader = () => {
  const navigate = useNavigate();

  /* =========================
     GET ADMIN NAME
  ========================= */
  const storedAdmin =
    JSON.parse(localStorage.getItem("admin")) ||
    JSON.parse(localStorage.getItem("adminAuth")) ||
    {};

  /* =========================
     LOGOUT
  ========================= */
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("admin");
    localStorage.removeItem("adminAuth");
    localStorage.removeItem("adminToken");

    navigate("/admin/login", {
      replace: true,
    });
  };

  /* =========================
     UI
  ========================= */
  return (
    <header className="admin-header">
      {/* LEFT SIDE */}
      <div
        className="admin-header-left"
        onClick={() => navigate("/admin/home")}
        style={{ cursor: "pointer" }}
      >
        <img src={logo} alt="Sunrise Agri Products Logo" />
        <h2>Sunrise Agri Products</h2>
      </div>

      {/* RIGHT SIDE */}
      <div className="admin-header-right">
        <button type="button" onClick={handleLogout} className="logout-btn">
          Logout
        </button>
      </div>
    </header>
  );
};

export default AdminHeader;
