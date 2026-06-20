// src/dealer/layout/DealerSidebar.jsx

import { NavLink } from "react-router-dom";
import "./dealerLayout.css";
import {
  FaHome,
  FaBoxOpen,
  FaShoppingCart,
  FaClipboardList,
  FaMoneyCheckAlt,
  FaFileInvoice,
  FaHistory,
  FaFileAlt,
  FaBars,
  FaTimes,
  FaWallet,
  FaUndo,
} from "react-icons/fa";

import { useState } from "react";

const DealerSidebar = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  /* =========================
      CLOSE SIDEBAR
  ========================= */

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <>
      {/* =========================
          MOBILE TOGGLE BUTTON
      ========================= */}

      <button
        className="dealer-mobile-toggle"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? <FaTimes /> : <FaBars />}
      </button>

      {/* =========================
          SIDEBAR
      ========================= */}

      <aside
        className={`dealer-sidebar ${sidebarOpen ? "dealer-sidebar-open" : ""}`}
      >
        {/* =========================
            TITLE
        ========================= */}

        <div className="dealer-sidebar-top">
          <h2>Dealer Panel</h2>
        </div>

        {/* =========================
            MENU
        ========================= */}

        <nav className="dealer-menu">
          {/* HOME */}

          <NavLink
            to="/dealer/home"
            end
            onClick={closeSidebar}
            className={({ isActive }) =>
              isActive ? "dealer-link active" : "dealer-link"
            }
          >
            <FaHome />

            <span>Home</span>
          </NavLink>

          {/* PRODUCTS */}

          <NavLink
            to="/dealer/products"
            onClick={closeSidebar}
            className={({ isActive }) =>
              isActive ? "dealer-link active" : "dealer-link"
            }
          >
            <FaBoxOpen />

            <span>Products</span>
          </NavLink>

          {/* CART */}

          <NavLink
            to="/dealer/cart"
            onClick={closeSidebar}
            className={({ isActive }) =>
              isActive ? "dealer-link active" : "dealer-link"
            }
          >
            <FaShoppingCart />

            <span>Cart</span>
          </NavLink>

          {/* ORDERS */}

          <NavLink
            to="/dealer/orders"
            onClick={closeSidebar}
            className={({ isActive }) =>
              isActive ? "dealer-link active" : "dealer-link"
            }
          >
            <FaClipboardList />

            <span>My Orders</span>
          </NavLink>

          {/* PAY OUTSTANDING */}

          <NavLink
            to="/dealer/pay-outstanding"
            onClick={closeSidebar}
            className={({ isActive }) =>
              isActive ? "dealer-link active" : "dealer-link"
            }
          >
            <FaWallet />

            <span>Pay Outstanding</span>
          </NavLink>

          {/* PRICE LIST */}

          <NavLink
            to="/dealer/pricelist"
            onClick={closeSidebar}
            className={({ isActive }) =>
              isActive ? "dealer-link active" : "dealer-link"
            }
          >
            <FaMoneyCheckAlt />

            <span>Price List</span>
          </NavLink>

          {/* INVOICES */}

          <NavLink
            to="/dealer/invoices"
            onClick={closeSidebar}
            className={({ isActive }) =>
              isActive ? "dealer-link active" : "dealer-link"
            }
          >
            <FaFileInvoice />

            <span>Invoices</span>
          </NavLink>

          {/* TRANSACTION HISTORY */}

          <NavLink
            to="/dealer/transaction-history"
            onClick={closeSidebar}
            className={({ isActive }) =>
              isActive ? "dealer-link active" : "dealer-link"
            }
          >
            <FaHistory />

            <span>Transaction History</span>
          </NavLink>

          {/* DOCUMENTS */}

          <NavLink
            to="/dealer/documents"
            onClick={closeSidebar}
            className={({ isActive }) =>
              isActive ? "dealer-link active" : "dealer-link"
            }
          >
            <FaFileAlt />

            <span>Documents</span>
          </NavLink>

          <NavLink
            to="/dealer/returns"
            onClick={closeSidebar}
            className={({ isActive }) =>
              isActive ? "dealer-link active" : "dealer-link"
            }
          >
            <FaUndo />

            <span>Return Products</span>
          </NavLink>
        </nav>
      </aside>

      {/* =========================
          OVERLAY
      ========================= */}

      {sidebarOpen && (
        <div className="dealer-sidebar-overlay" onClick={closeSidebar}></div>
      )}
    </>
  );
};

export default DealerSidebar;
