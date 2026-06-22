import { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";

import API_URL from "../../config/api";

import "./adminpages.css";

const Orders = () => {
  const navigate = useNavigate();

  /* =========================
     STATES
  ========================= */

  const [loading, setLoading] = useState(true);

  const [orders, setOrders] = useState([]);

  const [search, setSearch] = useState("");

  const [selectedFilter, setSelectedFilter] = useState("ALL");

  const [error, setError] = useState("");

  /* =========================
     FETCH ORDERS
  ========================= */

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("adminToken");

      if (!token) {
        navigate("/admin/login");
        return;
      }

      const response = await fetch(`${API_URL}/api/admin/orders`, {
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
        throw new Error(data.message || "Failed to load orders");
      }

      const safeOrders = Array.isArray(data?.orders)
        ? data.orders
        : Array.isArray(data)
          ? data
          : [];

      safeOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      setOrders(safeOrders);
    } catch (error) {
      console.error("FETCH ORDERS ERROR:", error);

      setError(error.message || "Failed to load orders");

      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  /* =========================
     DISPLAY NAME
  ========================= */

  const getOrderName = (order) => {
    if (order.role === "DEALER") {
      return (
        order.dealerName ||
        order.shopName ||
        order.userId?.shopName ||
        order.userId?.name ||
        "N/A"
      );
    }

    return (
      order.customerName ||
      order.userId?.name ||
      order.userId?.fullName ||
      "N/A"
    );
  };

  /* =========================
     FILTER ORDERS
  ========================= */

  const filteredOrders = useMemo(() => {
    let result = [...orders];

    if (selectedFilter !== "ALL") {
      result = result.filter(
        (order) => String(order.role || "").toUpperCase() === selectedFilter,
      );
    }

    if (search.trim()) {
      const value = search.toLowerCase().trim();

      result = result.filter((order) => {
        const searchFields = [
          order.orderNo,
          order.customerName,
          order.dealerName,
          order.shopName,
          order.userId?.name,
          order.userId?.shopName,
          order.userId?.phone,
        ];

        return searchFields.some((field) =>
          String(field || "")
            .toLowerCase()
            .includes(value),
        );
      });
    }

    return result;
  }, [orders, search, selectedFilter]);

  /* =========================
     LOADING
  ========================= */

  if (loading) {
    return (
      <div className="orders-page">
        <div className="loading-box">
          <h2>Loading orders...</h2>
        </div>
      </div>
    );
  }

  /* =========================
     ERROR
  ========================= */

  if (error) {
    return (
      <div className="orders-page">
        <div className="error-box">
          <h2>{error}</h2>

          <button className="save-btn" onClick={fetchOrders}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="orders-page">
      <div className="orders-header">
        <h2>Orders Management</h2>

        <button className="refresh-btn" onClick={fetchOrders}>
          Refresh
        </button>
      </div>

      <div className="orders-summary">
        <strong>Total Orders: {filteredOrders.length}</strong>
      </div>

      <div className="orders-topbar">
        <input
          type="text"
          placeholder="Search by Order No, Name, Shop or Phone"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="orders-search"
        />

        <div className="filter-buttons">
          <button
            className={selectedFilter === "ALL" ? "active" : ""}
            onClick={() => setSelectedFilter("ALL")}
          >
            All Orders
          </button>

          <button
            className={selectedFilter === "DEALER" ? "active" : ""}
            onClick={() => setSelectedFilter("DEALER")}
          >
            Dealer Orders
          </button>

          <button
            className={selectedFilter === "CUSTOMER" ? "active" : ""}
            onClick={() => setSelectedFilter("CUSTOMER")}
          >
            Customer Orders
          </button>
        </div>
      </div>

      <div className="orders-table-wrapper">
        <table className="orders-table">
          <thead>
            <tr>
              <th>Order No</th>
              <th>Name</th>
              <th>Role</th>
              <th>Total Amount</th>
              <th>Payment Status</th>
              <th>Order Status</th>
              <th>Date</th>
            </tr>
          </thead>

          <tbody>
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan="7">No orders found</td>
              </tr>
            ) : (
              filteredOrders.map((order) => (
                <tr key={order._id}>
                  <td>{order.orderNo || "-"}</td>

                  <td>{getOrderName(order)}</td>

                  <td>{order.role || "-"}</td>

                  <td>
                    ₹
                    {Number(order.totalAmount || 0).toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </td>

                  <td>
                    <span
                      className={`status-badge ${String(
                        order.paymentStatus || "PENDING",
                      )
                        .toLowerCase()
                        .replaceAll("_", "-")}`}
                    >
                      {String(order.paymentStatus || "PENDING").replaceAll(
                        "_",
                        " ",
                      )}
                    </span>
                  </td>

                  <td>
                    <span
                      className={`status-badge ${String(order.status || "")
                        .toLowerCase()
                        .replaceAll("_", "-")}`}
                    >
                      {order.status || "-"}
                    </span>
                  </td>

                  <td>
                    {order.createdAt
                      ? new Date(order.createdAt).toLocaleDateString("en-IN")
                      : "-"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Orders;
