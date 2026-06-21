// src/admin/pages/Orders.jsx

import { useEffect, useMemo, useState } from "react";
import API_URL from "../../config/api";
import "./adminpages.css";

const Orders = () => {
  /* =========================
     STATE
  ========================= */

  const [loading, setLoading] = useState(true);

  const [orders, setOrders] = useState([]);

  const [search, setSearch] = useState("");

  const [selectedFilter, setSelectedFilter] = useState("ALL");

  const token = localStorage.getItem("adminToken");

  /* =========================
     FETCH ALL ORDERS
  ========================= */

  const fetchOrders = async () => {
    try {
      setLoading(true);

      const res = await fetch(`${API_URL}/api/admin/orders`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error(`Failed to load orders (${res.status})`);
      }

      const data = await res.json();

      console.log("ORDERS API RESPONSE:", data);

      const safeOrders = Array.isArray(data?.orders)
        ? data.orders
        : Array.isArray(data)
          ? data
          : [];

      console.log("SAFE ORDERS:", safeOrders);

      setOrders(safeOrders);
    } catch (error) {
      console.error("FETCH ORDERS ERROR:", error);

      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  /* =========================
     GET DISPLAY NAME
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

    return order.customerName || order.userId?.name || "N/A";
  };

  /* =========================
     FILTERED ORDERS
  ========================= */

  const filteredOrders = useMemo(() => {
    let result = [...orders];

    /* FILTER */

    if (selectedFilter !== "ALL") {
      result = result.filter((order) => order.role === selectedFilter);
    }

    /* SEARCH */

    if (search.trim()) {
      const searchValue = search.toLowerCase().trim();

      result = result.filter((order) => {
        const orderNo = order.orderNo?.toLowerCase() || "";

        const customerName = order.customerName?.toLowerCase() || "";

        const dealerName = order.dealerName?.toLowerCase() || "";

        const shopName = order.shopName?.toLowerCase() || "";

        const userName = order.userId?.name?.toLowerCase() || "";

        const userShop = order.userId?.shopName?.toLowerCase() || "";

        return (
          orderNo.includes(searchValue) ||
          customerName.includes(searchValue) ||
          dealerName.includes(searchValue) ||
          shopName.includes(searchValue) ||
          userName.includes(searchValue) ||
          userShop.includes(searchValue)
        );
      });
    }

    return result;
  }, [orders, search, selectedFilter]);

  /* =========================
     DEBUG
  ========================= */

  useEffect(() => {
    console.log("TOTAL ORDERS:", orders.length);
    console.log("FILTER:", selectedFilter);
    console.log("FILTERED ORDERS:", filteredOrders.length);
  }, [orders, selectedFilter, filteredOrders]);

  /* =========================
     UI
  ========================= */

  return (
    <div className="orders-page">
      <div className="orders-header">
        <h2>Orders Management</h2>
      </div>

      <div className="orders-topbar">
        <input
          type="text"
          placeholder="Search by Order No or Name"
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

      {loading ? (
        <p>Loading orders...</p>
      ) : (
        <div className="orders-table-wrapper">
          <table className="orders-table">
            <thead>
              <tr>
                <th>Order No</th>
                <th>Name</th>
                <th>Role</th>
                <th>Total Amount</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>

            <tbody>
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="6">No orders found</td>
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
                        className={`status-badge ${
                          order.status?.toLowerCase() || ""
                        }`}
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
      )}
    </div>
  );
};

export default Orders;
