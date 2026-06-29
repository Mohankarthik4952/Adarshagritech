// src/admin/layout/AdminLayout.jsx

import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";

import AdminHeader from "./AdminHeader";
import AdminSidebar from "./AdminSidebar";

import "./adminLayout.css";

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 768);

  /* =========================
     CLOSE SIDEBAR ON RESIZE
  ========================= */
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  /* =========================
     PREVENT BODY SCROLL
  ========================= */
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [sidebarOpen]);

  return (
    <div className="admin-layout">
      {/* HEADER */}
      <AdminHeader sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* BODY */}
      <div className="admin-body">
        {/* SIDEBAR */}
        <AdminSidebar
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />

        {/* PAGE CONTENT */}
        <main
          className={`admin-content ${sidebarOpen ? "sidebar-open" : ""}`}
          onClick={() => {
            if (window.innerWidth <= 768 && sidebarOpen) {
              setSidebarOpen(false);
            }
          }}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
