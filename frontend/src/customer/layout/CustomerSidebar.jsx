import { NavLink } from "react-router-dom";

import {
  FaHome,
  FaBox,
  FaShoppingCart,
  FaClipboardList,
  FaHistory,
  FaFileInvoice,
  FaTimes,
} from "react-icons/fa";

import "./customerLayout.css";

const CustomerSidebar = ({ sidebarOpen, setSidebarOpen }) => {
  /* =========================
     CLOSE SIDEBAR
  ========================= */

  const closeSidebar = () => {
    // Close only on mobile
    if (window.innerWidth <= 768) {
      setSidebarOpen(false);
    }
  };

  return (
    <aside
      className={`sidebar ${sidebarOpen ? "sidebar-open" : "sidebar-close"}`}
    >
      {/* =========================
          SIDEBAR TOP
      ========================= */}

      <div className="sidebar-top">
        <h2 className="title">Customer Panel</h2>

        {/* Mobile Close Button */}

        <button className="close-btn" onClick={() => setSidebarOpen(false)}>
          <FaTimes />
        </button>
      </div>

      {/* =========================
          NAVIGATION
      ========================= */}

      <nav className="sidebar-nav">
        <NavLink
          to="/customer/home"
          end
          onClick={closeSidebar}
          className={({ isActive }) => (isActive ? "link active" : "link")}
        >
          <FaHome />
          <span>Home</span>
        </NavLink>

        <NavLink
          to="/customer/products"
          onClick={closeSidebar}
          className={({ isActive }) => (isActive ? "link active" : "link")}
        >
          <FaBox />
          <span>Products</span>
        </NavLink>

        <NavLink
          to="/customer/cart"
          onClick={closeSidebar}
          className={({ isActive }) => (isActive ? "link active" : "link")}
        >
          <FaShoppingCart />
          <span>Cart</span>
        </NavLink>

        <NavLink
          to="/customer/myorders"
          onClick={closeSidebar}
          className={({ isActive }) => (isActive ? "link active" : "link")}
        >
          <FaClipboardList />
          <span>My Orders</span>
        </NavLink>

        <NavLink
          to="/customer/transaction-history"
          onClick={closeSidebar}
          className={({ isActive }) => (isActive ? "link active" : "link")}
        >
          <FaHistory />
          <span>Transaction History</span>
        </NavLink>

        <NavLink
          to="/customer/invoices"
          onClick={closeSidebar}
          className={({ isActive }) => (isActive ? "link active" : "link")}
        >
          <FaFileInvoice />
          <span>Invoices</span>
        </NavLink>
      </nav>
    </aside>
  );
};

export default CustomerSidebar;
