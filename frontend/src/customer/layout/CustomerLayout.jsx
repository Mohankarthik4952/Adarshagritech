import { useState } from "react";
import { Outlet } from "react-router-dom";

import CustomerHeader from "./CustomerHeader";
import CustomerSidebar from "./CustomerSidebar";

import Footer from "../../common/Footer";

import "./customerLayout.css";

const CustomerLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="layout">
      {/* ================= HEADER ================= */}

      <CustomerHeader setSidebarOpen={setSidebarOpen} />

      {/* ================= BODY ================= */}

      <div className="layout-body">
        {/* ================= SIDEBAR ================= */}

        <div className={`sidebar-container ${sidebarOpen ? "open" : ""}`}>
          <CustomerSidebar setSidebarOpen={setSidebarOpen} />
        </div>

        {/* ================= MOBILE OVERLAY ================= */}

        {sidebarOpen && (
          <div
            className="sidebar-overlay"
            onClick={() => setSidebarOpen(false)}
          ></div>
        )}

        {/* ================= MAIN CONTENT ================= */}

        <main className="layout-main">
          <div className="layout-content">
            <Outlet />
          </div>
        </main>
      </div>

      {/* ================= FOOTER ================= */}

      <Footer />
    </div>
  );
};

export default CustomerLayout;
