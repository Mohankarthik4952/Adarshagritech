import { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";

import API_URL from "../../config/api";

import StatsCard from "../components/StatsCard";
import SalesChart from "../components/SalesChart";

import "./adminpages.css";

const Home = () => {
  const navigate = useNavigate();

  /* =========================
     STATES
  ========================= */

  const [admin, setAdmin] = useState(null);

  const [stats, setStats] = useState({
    monthlySales: 0,
    annualSales: 0,
    dealerPendingAmount: 0,
    totalAmountReceived: 0,
    totalProducts: 0,
    totalCustomers: 0,
    totalDealers: 0,
    totalOrders: 0,
  });

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  /* =========================
     LOAD ADMIN DATA
  ========================= */

  useEffect(() => {
    try {
      const storedAdmin =
        localStorage.getItem("adminAuth") || localStorage.getItem("admin");

      if (storedAdmin) {
        setAdmin(JSON.parse(storedAdmin));
      }
    } catch (error) {
      console.error("ADMIN PARSE ERROR:", error);

      localStorage.removeItem("admin");
      localStorage.removeItem("adminAuth");
    }
  }, []);

  /* =========================
     FETCH DASHBOARD STATS
  ========================= */

  const fetchDashboardStats = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("adminToken");

      if (!token) {
        navigate("/admin/login");
        return;
      }

      const response = await fetch(`${API_URL}/api/admin/dashboard/stats`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.status === 401) {
        localStorage.removeItem("adminToken");
        localStorage.removeItem("admin");
        localStorage.removeItem("adminAuth");

        alert("Session expired. Please login again.");

        navigate("/admin/login");

        return;
      }

      if (!response.ok) {
        throw new Error(data.message || "Failed to load dashboard stats");
      }

      setStats({
        monthlySales: Number(data.monthlySales || 0),

        annualSales: Number(data.annualSales || 0),

        dealerPendingAmount: Number(data.dealerPendingAmount || 0),

        totalAmountReceived: Number(data.totalAmountReceived || 0),

        totalProducts: Number(data.totalProducts || 0),

        totalCustomers: Number(data.totalCustomers || 0),

        totalDealers: Number(data.totalDealers || 0),

        totalOrders: Number(data.totalOrders || 0),
      });
    } catch (error) {
      console.error("Dashboard stats fetch error:", error);

      setError(error.message || "Failed to load dashboard statistics");
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchDashboardStats();
  }, [fetchDashboardStats]);

  /* =========================
     GREETING
  ========================= */

  const getGreeting = () => {
    const hour = new Date().getHours();

    if (hour < 12) return "Good Morning";

    if (hour < 17) return "Good Afternoon";

    return "Good Evening";
  };

  const adminName = admin?.name || admin?.adminName || admin?.fullName || "GVR";

  const formatCurrency = (amount) => {
    return Number(amount || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  /* =========================
     LOADING
  ========================= */

  if (loading) {
    return (
      <div className="admin-home">
        <div className="loading-box">
          <h2>Loading dashboard...</h2>
        </div>
      </div>
    );
  }

  /* =========================
     ERROR
  ========================= */

  if (error) {
    return (
      <div className="admin-home">
        <div className="error-box">
          <h2>{error}</h2>

          <button className="save-btn" onClick={fetchDashboardStats}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  /* =========================
     UI
  ========================= */

  return (
    <div className="admin-home">
      {/* WELCOME CARD */}

      <div className="admin-welcome-card">
        <h1>
          {getGreeting()}, {adminName}
        </h1>

        <p>Welcome to the Sunrise Agri Products Admin Dashboard.</p>
      </div>

      {/* MAIN STATS */}

      <div className="stats-grid">
        <StatsCard
          title="Monthly Sales"
          value={`₹${formatCurrency(stats.monthlySales)}`}
        />

        <StatsCard
          title="Annual Sales"
          value={`₹${formatCurrency(stats.annualSales)}`}
        />

        <StatsCard
          title="Dealer Outstanding Amount"
          value={`₹${formatCurrency(stats.dealerPendingAmount)}`}
        />

        <StatsCard
          title="Total Amount Received"
          value={`₹${formatCurrency(stats.totalAmountReceived)}`}
        />
      </div>

      {/* EXTRA STATS */}

      <div className="stats-grid extra-stats">
        <StatsCard
          title="Total Products"
          value={stats.totalProducts.toLocaleString("en-IN")}
        />

        <StatsCard
          title="Total Customers"
          value={stats.totalCustomers.toLocaleString("en-IN")}
        />

        <StatsCard
          title="Total Dealers"
          value={stats.totalDealers.toLocaleString("en-IN")}
        />

        <StatsCard
          title="Total Orders"
          value={stats.totalOrders.toLocaleString("en-IN")}
        />
      </div>

      {/* CHART */}

      <div className="chart-section">
        <h2 className="section-title">📈 Sales Overview</h2>

        <SalesChart />
      </div>

      {/* QUICK ACTIONS */}

      <div className="quick-actions">
        <h2 className="section-title">⚡ Quick Actions</h2>

        <div className="actions-grid">
          <Link to="/admin/add-product" className="action-card">
            ➕ Add Product
          </Link>

          <Link to="/admin/orders" className="action-card">
            📦 View Orders
          </Link>

          <Link to="/admin/payments" className="action-card">
            💰 Payment Verification
          </Link>

          <Link to="/admin/invoices" className="action-card">
            🧾 Invoices
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;
