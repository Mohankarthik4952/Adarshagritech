import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaRupeeSign,
  FaShoppingCart,
  FaFileInvoice,
  FaExchangeAlt,
} from "react-icons/fa";

import Greeting from "../components/Greeting";
import API_URL from "../../config/api";

import "./dealerpages.css";

const Home = () => {
  const navigate = useNavigate();

  const [recentOrders, setRecentOrders] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);

  const [pendingBills, setPendingBills] = useState(0);
  const [orderCount, setOrderCount] = useState(0);
  const [totalPaidAmount, setTotalPaidAmount] = useState(0);
  const [invoiceCount, setInvoiceCount] = useState(0);

  const [dealerName, setDealerName] = useState("Dealer");

  const [loading, setLoading] = useState(true);

  /* =========================
     LOAD DEALER NAME
  ========================= */

  useEffect(() => {
    try {
      const dealerData =
        localStorage.getItem("dealerAuth") ||
        localStorage.getItem("dealer") ||
        localStorage.getItem("user");

      if (dealerData) {
        const dealer = JSON.parse(dealerData);

        const name =
          dealer?.name ||
          dealer?.dealerName ||
          dealer?.fullName ||
          dealer?.user?.name ||
          dealer?.user?.dealerName ||
          "Dealer";

        setDealerName(name);
      }
    } catch (error) {
      console.error("DEALER PARSE ERROR:", error);
    }
  }, []);

  /* =========================
     FETCH DASHBOARD
  ========================= */

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const token =
          localStorage.getItem("dealerToken") || localStorage.getItem("token");

        if (!token) {
          navigate("/dealer/login");
          return;
        }

        setLoading(true);

        const response = await fetch(
          `${API_URL}/api/dealer/dashboard/summary`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const data = await response.json();

        if (response.status === 401) {
          localStorage.removeItem("dealerToken");
          localStorage.removeItem("token");

          alert("Session expired. Please login again.");

          navigate("/dealer/login");

          return;
        }

        if (!response.ok) {
          throw new Error(data.message || "Failed to load dashboard");
        }

        setPendingBills(Number(data.pendingBills || 0));

        setOrderCount(Number(data.orders || 0));

        setTotalPaidAmount(Number(data.totalPaidAmount || 0));

        setInvoiceCount(Number(data.invoices || 0));

        setRecentOrders(data.recentOrders || []);

        setRecentTransactions(data.recentTransactions || []);
      } catch (error) {
        console.error("DASHBOARD FETCH ERROR:", error);

        alert(error.message || "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [navigate]);

  /* =========================
     LOADING
  ========================= */

  if (loading) {
    return (
      <div className="dealer-home-page">
        <div className="dealer-loading">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="dealer-home-page">
      <div className="dealer-welcome-card">
        <Greeting name={dealerName} />

        <p>Welcome to your dealer dashboard.</p>
      </div>

      {/* STATS */}

      <div className="dealer-stats-grid">
        <div className="dealer-stat-card">
          <div className="dealer-stat-icon red">
            <FaRupeeSign />
          </div>

          <div className="dealer-stat-content">
            <h3>Pending Bills</h3>

            <h2>
              ₹
              {pendingBills.toLocaleString("en-IN", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </h2>
          </div>
        </div>

        <div className="dealer-stat-card">
          <div className="dealer-stat-icon blue">
            <FaShoppingCart />
          </div>

          <div className="dealer-stat-content">
            <h3>Total Orders</h3>

            <h2>{orderCount}</h2>
          </div>
        </div>

        <div className="dealer-stat-card">
          <div className="dealer-stat-icon green">
            <FaExchangeAlt />
          </div>

          <div className="dealer-stat-content">
            <h3>Total Amount Paid</h3>

            <h2>
              ₹
              {totalPaidAmount.toLocaleString("en-IN", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </h2>
          </div>
        </div>

        <div className="dealer-stat-card">
          <div className="dealer-stat-icon purple">
            <FaFileInvoice />
          </div>

          <div className="dealer-stat-content">
            <h3>Invoices</h3>

            <h2>{invoiceCount}</h2>
          </div>
        </div>
      </div>

      {/* RECENT ORDERS */}

      <div className="dealer-section-card">
        <h2>📦 Recent Orders</h2>

        {recentOrders.length === 0 ? (
          <p>No orders yet.</p>
        ) : (
          <div className="table-wrapper">
            <table className="dealer-table">
              <thead>
                <tr>
                  <th>Order No</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order._id || order.orderNo}>
                    <td>{order.orderNo}</td>

                    <td>
                      ₹
                      {Number(order.totalAmount || 0).toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </td>

                    <td>{order.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* RECENT TRANSACTIONS */}

      <div className="dealer-section-card">
        <h2>💳 Recent Transactions</h2>

        {recentTransactions.length === 0 ? (
          <p>No transactions yet.</p>
        ) : (
          <div className="table-wrapper">
            <table className="dealer-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {recentTransactions.map((tx) => (
                  <tr key={tx._id}>
                    <td>
                      {tx.createdAt
                        ? new Date(tx.createdAt).toLocaleDateString("en-IN")
                        : "-"}
                    </td>

                    <td>
                      ₹
                      {Number(tx.amount || 0).toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </td>

                    <td>{tx.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
