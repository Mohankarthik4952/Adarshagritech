// src/admin/layout/AdminLayout.jsx

import { Outlet } from "react-router-dom";

import AdminHeader from "./AdminHeader";
import AdminSidebar from "./AdminSidebar";

import "./adminLayout.css";

const AdminLayout = () => {
  return (
    <div className="admin-layout">
      {/* HEADER */}
      <AdminHeader />

      {/* BODY */}
      <div className="admin-body">
        {/* SIDEBAR */}
        <AdminSidebar />

        {/* PAGE CONTENT */}
        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
