// src/admin/layout/AdminHeader.jsx

import { useNavigate } from "react-router-dom";
import { FaBars, FaTimes } from "react-icons/fa";

import logo from "../../assets/sunrise.png";

import "./adminLayout.css";

const AdminHeader = ({ sidebarOpen, setSidebarOpen }) => {
  const navigate = useNavigate();

  /* =========================
     GET ADMIN DATA SAFELY
  ========================= */

  let adminData = {};

  try {
    adminData =
      JSON.parse(localStorage.getItem("admin")) ||
      JSON.parse(localStorage.getItem("adminAuth")) ||
      {};
  } catch (error) {
    console.error("Admin data parse error:", error);
  }

  const adminName = adminData?.name || "Administrator";

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

  return (
    <header className="admin-header">
      {/* MOBILE MENU BUTTON */}

      <button
        type="button"
        className="admin-mobile-toggle"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? <FaTimes /> : <FaBars />}
      </button>

      {/* LEFT SIDE */}

      <div
        className="admin-header-left"
        onClick={() => navigate("/admin/home")}
      >
        <img src={logo} alt="Sunrise Agri Products" />

        <h2>Sunrise Agri Products</h2>
      </div>

      {/* RIGHT SIDE */}

      <div className="admin-header-right">
        <span className="admin-name">Good Afternoon, {adminName}</span>

        <button type="button" className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </header>
  );
};

export default AdminHeader;
