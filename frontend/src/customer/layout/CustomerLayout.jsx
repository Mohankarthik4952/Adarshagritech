import { useState } from "react";
import { Outlet } from "react-router-dom";

import CustomerHeader from "./CustomerHeader";
import CustomerSidebar from "./CustomerSidebar";

import Footer from "../../common/Footer";

import "./customerLayout.css";

const CustomerLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="layout">
      {/* ================= HEADER ================= */}

      <CustomerHeader
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      {/* ================= BODY ================= */}

      <div className="layout-body">
        {/* ================= SIDEBAR ================= */}

        <CustomerSidebar
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />

        {/* ================= MOBILE OVERLAY ================= */}

        {sidebarOpen && window.innerWidth <= 768 && (
          <div
            className="sidebar-overlay"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* ================= MAIN CONTENT ================= */}

        <main
          className={`layout-main ${sidebarOpen ? "" : "layout-main-full"}`}
        >
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
