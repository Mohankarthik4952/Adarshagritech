import { NavLink } from "react-router-dom";

import {
  FaHome,
  FaBox,
  FaShoppingCart,
  FaClipboardList,
  FaMoneyBillWave,
  FaTimes,
  FaHistory,
  FaFileInvoice,
} from "react-icons/fa";

import "./customerLayout.css";

const CustomerSidebar = ({ setSidebarOpen }) => {
  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <aside className="sidebar">
      {/* =========================
          SIDEBAR TOP
      ========================= */}

      <div className="sidebar-top">
        <h2 className="title">Customer Panel</h2>

        <button className="close-btn" onClick={closeSidebar}>
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

        {/* =========================
            CUSTOMER INVOICES
        ========================= */}

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
