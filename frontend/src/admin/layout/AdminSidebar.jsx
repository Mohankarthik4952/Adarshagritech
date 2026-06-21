// src/admin/layout/AdminSidebar.jsx

import { NavLink } from "react-router-dom";

import {
  FaHome,
  FaPlusSquare,
  FaBoxOpen,
  FaClipboardList,
  FaMoneyCheckAlt,
  FaFileInvoice,
  FaHistory,
  FaUndo,
  FaTags,
} from "react-icons/fa";

import "./adminLayout.css";

const AdminSidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <>
      <aside
        className={`admin-sidebar ${sidebarOpen ? "admin-sidebar-open" : ""}`}
      >
        <div className="admin-sidebar-top">
          <h2>Admin Panel</h2>
        </div>

        <nav className="admin-menu">
          <NavLink
            to="/admin/home"
            end
            onClick={closeSidebar}
            className={({ isActive }) =>
              isActive ? "admin-link active" : "admin-link"
            }
          >
            <FaHome />
            <span>Home</span>
          </NavLink>

          <NavLink
            to="/admin/add-product"
            onClick={closeSidebar}
            className={({ isActive }) =>
              isActive ? "admin-link active" : "admin-link"
            }
          >
            <FaPlusSquare />
            <span>Add Products</span>
          </NavLink>

          <NavLink
            to="/admin/dealer-products"
            onClick={closeSidebar}
            className={({ isActive }) =>
              isActive ? "admin-link active" : "admin-link"
            }
          >
            <FaBoxOpen />
            <span>Dealer Products</span>
          </NavLink>

          <NavLink
            to="/admin/customer-products"
            onClick={closeSidebar}
            className={({ isActive }) =>
              isActive ? "admin-link active" : "admin-link"
            }
          >
            <FaBoxOpen />
            <span>Customer Products</span>
          </NavLink>

          <NavLink
            to="/admin/orders"
            onClick={closeSidebar}
            className={({ isActive }) =>
              isActive ? "admin-link active" : "admin-link"
            }
          >
            <FaClipboardList />
            <span>Orders</span>
          </NavLink>

          <NavLink
            to="/admin/payments"
            onClick={closeSidebar}
            className={({ isActive }) =>
              isActive ? "admin-link active" : "admin-link"
            }
          >
            <FaMoneyCheckAlt />
            <span>Payment Verification</span>
          </NavLink>

          <NavLink
            to="/admin/price-list"
            onClick={closeSidebar}
            className={({ isActive }) =>
              isActive ? "admin-link active" : "admin-link"
            }
          >
            <FaTags />
            <span>Price List</span>
          </NavLink>

          <NavLink
            to="/admin/invoices"
            onClick={closeSidebar}
            className={({ isActive }) =>
              isActive ? "admin-link active" : "admin-link"
            }
          >
            <FaFileInvoice />
            <span>All Invoices</span>
          </NavLink>

          <NavLink
            to="/admin/returns"
            onClick={closeSidebar}
            className={({ isActive }) =>
              isActive ? "admin-link active" : "admin-link"
            }
          >
            <FaUndo />
            <span>Returns</span>
          </NavLink>

          <NavLink
            to="/admin/transactions"
            onClick={closeSidebar}
            className={({ isActive }) =>
              isActive ? "admin-link active" : "admin-link"
            }
          >
            <FaHistory />
            <span>Transaction History</span>
          </NavLink>
        </nav>
      </aside>

      {sidebarOpen && (
        <div className="admin-sidebar-overlay" onClick={closeSidebar} />
      )}
    </>
  );
};

export default AdminSidebar;
