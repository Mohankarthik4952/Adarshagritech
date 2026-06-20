import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./dealerpages.css";

const MyOrders = () => {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  /* =========================
     FETCH ORDERS
  ========================= */

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem("dealerToken");

      const response = await fetch("http://localhost:5000/api/dealer/orders", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        setOrders(data.orders || []);
      } else {
        setOrders([]);
      }
    } catch (error) {
      console.error("Failed to fetch orders", error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  /* =========================
     VIEW INVOICE
  ========================= */

  const viewInvoice = (invoiceId) => {
    if (!invoiceId) {
      alert("Invoice not generated yet");
      return;
    }

    navigate("/dealer/invoices");
  };

  /* =========================
     PAYMENT STATUS
  ========================= */

  const getPaymentStatus = (order) => {
    const paidAmount = Number(order.paidAmount || 0);

    const balanceAmount = Number(
      order.balanceAmount ?? Number(order.totalAmount || 0) - paidAmount,
    );

    if (order.paymentStatus === "VERIFICATION_PENDING") {
      return {
        label: "VERIFICATION PENDING",
        className: "processing-badge",
      };
    }

    if (order.paymentStatus === "RECEIVED" || balanceAmount <= 0) {
      return {
        label: "PAID",
        className: "paid-badge",
      };
    }

    if (paidAmount > 0 && balanceAmount > 0) {
      return {
        label: "PARTIAL",
        className: "partial-badge",
      };
    }

    if (order.paymentStatus === "REJECTED") {
      return {
        label: "REJECTED",
        className: "rejected-badge",
      };
    }

    return {
      label: "PENDING",
      className: "pending-badge",
    };
  };

  /* =========================
     DELIVERY STATUS
  ========================= */

  const getDeliveryStatus = (status) => {
    const normalized = String(status || "").toLowerCase();

    if (normalized === "delivered") {
      return {
        label: "DELIVERED",
        className: "paid-badge",
      };
    }

    if (normalized === "shipped") {
      return {
        label: "SHIPPED",
        className: "processing-badge",
      };
    }

    return {
      label: "DELIVERED",
      className: "paid-badge",
    };
  };

  if (loading) {
    return (
      <div className="orders-loading">
        <h2>Loading orders...</h2>
      </div>
    );
  }

  return (
    <div className="dealer-orders-page">
      <div className="page-header">
        <h1>My Orders</h1>

        <p>View all your orders</p>
      </div>

      {orders.length === 0 ? (
        <div className="empty-orders">
          <h2>No Orders Found</h2>
        </div>
      ) : (
        <>
          <div className="outstanding-payment-section">
            <button
              className="pay-outstanding-btn"
              onClick={() => navigate("/dealer/pay-outstanding")}
            >
              Pay Outstanding Amount
            </button>
          </div>

          <div className="orders-table-card">
            <div className="table-wrapper">
              <table className="orders-table">
                <thead>
                  <tr>
                    <th>Order No</th>
                    <th>Products</th>
                    <th>Total</th>
                    <th>Paid</th>
                    <th>Balance</th>
                    <th>Payment Type</th>
                    <th>Payment Status</th>
                    <th>Delivery Status</th>
                    <th>Invoice</th>
                  </tr>
                </thead>

                <tbody>
                  {orders.map((order) => {
                    const totalAmount = Number(order.totalAmount || 0);

                    const paidAmount = Number(order.paidAmount || 0);

                    const balanceAmount = Number(
                      order.balanceAmount ?? totalAmount - paidAmount,
                    );

                    const payment = getPaymentStatus(order);

                    const delivery = getDeliveryStatus(order.deliveryStatus);

                    return (
                      <tr key={order._id}>
                        <td>{order.orderNo}</td>

                        <td>
                          {order.items
                            ?.map((item) => item.productName || "-")
                            .join(", ")}
                        </td>

                        <td>₹{totalAmount.toLocaleString("en-IN")}</td>

                        <td>₹{paidAmount.toLocaleString("en-IN")}</td>

                        <td>₹{balanceAmount.toLocaleString("en-IN")}</td>

                        <td>
                          {order.paymentType
                            ?.replaceAll("_", " ")
                            ?.toUpperCase() || "-"}
                        </td>

                        <td>
                          <span className={payment.className}>
                            {payment.label}
                          </span>
                        </td>

                        <td>
                          <span className={delivery.className}>
                            {delivery.label}
                          </span>
                        </td>

                        <td>
                          {order.invoiceGenerated ? (
                            <button
                              className="view-invoice-btn"
                              onClick={() => viewInvoice(order.invoiceId)}
                            >
                              View Invoice
                            </button>
                          ) : (
                            <span
                              style={{
                                color: "#999",
                                fontWeight: 500,
                              }}
                            >
                              Not Generated
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default MyOrders;
