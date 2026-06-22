import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";

import {
  FaBoxOpen,
  FaCheckCircle,
  FaClock,
  FaTimesCircle,
  FaTruck,
  FaRedo,
  FaFileInvoice,
} from "react-icons/fa";

import API_URL from "../../config/api";

import "./customerpages.css";

const MyOrders = () => {
  const navigate = useNavigate();

  /* =================================
     STATES
  ================================= */

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* =================================
     FETCH ORDERS
  ================================= */

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const token =
        localStorage.getItem("customerToken") || localStorage.getItem("token");

      if (!token) {
        navigate("/customer/login");
        return;
      }

      const response = await fetch(`${API_URL}/api/customer/orders/my-orders`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      console.log("CUSTOMER ORDERS:", data);

      if (response.status === 401) {
        localStorage.removeItem("customerToken");
        localStorage.removeItem("token");

        alert("Session expired. Please login again.");

        navigate("/customer/login");

        return;
      }

      if (!response.ok) {
        throw new Error(data.message || "Failed to load orders");
      }

      if (Array.isArray(data)) {
        setOrders(data);
      } else if (data.success) {
        setOrders(data.orders || []);
      } else {
        setOrders([]);
      }
    } catch (error) {
      console.error("ORDERS FETCH ERROR:", error);

      setError(error.message || "Failed to load orders");

      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  /* =================================
     HELPERS
  ================================= */

  const formatCurrency = (amount) => {
    return Number(amount || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString("en-IN");
  };

  const getPaymentStatus = (status) => {
    const normalized = String(status || "PENDING").toUpperCase();

    switch (normalized) {
      case "RECEIVED":
      case "PAID":
        return {
          label: "Paid",
          icon: <FaCheckCircle />,
          className: "paid",
        };

      case "REJECTED":
        return {
          label: "Rejected",
          icon: <FaTimesCircle />,
          className: "rejected",
        };

      case "VERIFICATION_PENDING":
        return {
          label: "Verification Pending",
          icon: <FaClock />,
          className: "processing",
        };

      default:
        return {
          label: "Pending",
          icon: <FaClock />,
          className: "pending",
        };
    }
  };

  const getOrderStatus = (status) => {
    const normalized = String(status || "").toUpperCase();

    switch (normalized) {
      case "DELIVERED":
        return {
          label: "Delivered",
          className: "completed",
        };

      case "SHIPPED":
        return {
          label: "Shipped",
          className: "processing",
        };

      case "CANCELLED":
        return {
          label: "Cancelled",
          className: "rejected",
        };

      default:
        return {
          label: "Processing",
          className: "pending",
        };
    }
  };

  /* =================================
     LOADING
  ================================= */

  if (loading) {
    return (
      <div className="loading-box">
        <h2>Loading orders...</h2>
      </div>
    );
  }

  /* =================================
     ERROR
  ================================= */

  if (error) {
    return (
      <div className="loading-box">
        <h2>{error}</h2>

        <button className="retry-btn" onClick={fetchOrders}>
          <FaRedo />
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="customer-orders-page">
      <div className="page-header">
        <h1>My Orders</h1>

        <p>View all your placed orders</p>
      </div>

      {orders.length === 0 ? (
        <div className="empty-orders">
          <FaBoxOpen className="empty-icon" />

          <h2>No Orders Found</h2>

          <p>Your orders will appear here after placing orders</p>
        </div>
      ) : (
        <div className="orders-table-wrapper">
          <table className="orders-table">
            <thead>
              <tr>
                <th>Order No</th>
                <th>Date</th>
                <th>Products</th>
                <th>Total</th>
                <th>Payment</th>
                <th>Delivery</th>
                <th>Invoice</th>
              </tr>
            </thead>

            <tbody>
              {orders.map((order) => {
                const payment = getPaymentStatus(order.paymentStatus);

                const delivery = getOrderStatus(
                  order.deliveryStatus || order.status,
                );

                return (
                  <tr key={order._id}>
                    <td>{order.orderNo || "N/A"}</td>

                    <td>{formatDate(order.createdAt)}</td>

                    <td>
                      {order.items
                        ?.map((item) => item.productName)
                        .join(", ") || "-"}
                    </td>

                    <td>₹{formatCurrency(order.totalAmount)}</td>

                    <td>
                      <span className={`payment-badge ${payment.className}`}>
                        {payment.icon}

                        {payment.label}
                      </span>
                    </td>

                    <td>
                      <span className={`status-badge ${delivery.className}`}>
                        <FaTruck />

                        {delivery.label}
                      </span>
                    </td>

                    <td>
                      {order.invoiceGenerated ? (
                        <button
                          className="invoice-btn"
                          onClick={() => navigate("/customer/invoices")}
                        >
                          <FaFileInvoice />
                          View
                        </button>
                      ) : (
                        "-"
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default MyOrders;
