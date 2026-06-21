import { useEffect, useState } from "react";

import { FaBoxOpen, FaCheckCircle, FaClock } from "react-icons/fa";
import API_URL from "../../config/api";

import "./customerpages.css";

const MyOrders = () => {
  /* =================================
     STATES
  ================================= */

  const [orders, setOrders] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  /* =================================
     FETCH ORDERS
  ================================= */

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);

        setError("");

        const token =
          localStorage.getItem("customerToken") ||
          localStorage.getItem("token");

        /* API CALL */

        const response = await fetch(
          `${API_URL}/api/customer/orders/my-orders`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const data = await response.json();

        console.log("Orders API Response:", data);

        /* HANDLE RESPONSE */

        if (Array.isArray(data)) {
          setOrders(data);
        } else if (data && Array.isArray(data.orders)) {
          setOrders(data.orders);
        } else {
          setOrders([]);
        }
      } catch (error) {
        console.error("Orders Fetch Error:", error);

        setError("Failed to load orders");

        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

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
      </div>
    );
  }

  return (
    <div className="customer-orders-page">
      {/* =================================
          PAGE HEADER
      ================================= */}

      <div className="page-header">
        <h1>My Orders</h1>

        <p>View all your placed orders</p>
      </div>

      {/* =================================
          EMPTY ORDERS
      ================================= */}

      {orders.length === 0 ? (
        <div className="empty-orders">
          <FaBoxOpen className="empty-icon" />

          <h2>No Orders Found</h2>

          <p>Your orders will appear here after placing orders</p>
        </div>
      ) : (
        <div className="orders-table-wrapper">
          <table className="orders-table">
            {/* TABLE HEAD */}

            <thead>
              <tr>
                <th>Order No</th>

                <th>Date</th>

                <th>Total</th>

                <th>Payment</th>

                <th>Status</th>
              </tr>
            </thead>

            {/* TABLE BODY */}

            <tbody>
              {orders.map((order, index) => {
                const paymentStatus = order?.paymentStatus || "PENDING";

                return (
                  <tr key={order?._id || index}>
                    {/* ORDER NO */}

                    <td>{order?.orderNo || "N/A"}</td>

                    {/* DATE */}

                    <td>
                      {order?.createdAt
                        ? new Date(order.createdAt).toLocaleDateString()
                        : "N/A"}
                    </td>

                    {/* TOTAL */}

                    <td>₹{Number(order.totalAmount || 0).toFixed(2)}</td>

                    {/* PAYMENT */}

                    <td>
                      <span
                        className={`payment-badge ${
                          paymentStatus === "RECEIVED" ? "paid" : "pending"
                        }`}
                      >
                        {paymentStatus === "RECEIVED" ? (
                          <>
                            <FaCheckCircle />
                            Paid
                          </>
                        ) : (
                          <>
                            <FaClock />
                            Pending
                          </>
                        )}
                      </span>
                    </td>

                    {/* STATUS */}

                    <td>
                      <span
                        className={`status-badge ${
                          paymentStatus === "RECEIVED" ? "completed" : "pending"
                        }`}
                      >
                        {paymentStatus === "RECEIVED" ? "Completed" : "Pending"}
                      </span>
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
