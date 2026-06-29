import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";

import API_URL from "../../config/api";

import "./dealerpages.css";

const PayOutstanding = () => {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [totalOutstanding, setTotalOutstanding] = useState(0);

  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("UPI");
  const [paymentApp, setPaymentApp] = useState("PHONEPE");
  const [utrNumber, setUtrNumber] = useState("");
  const [paymentProof, setPaymentProof] = useState(null);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  /* =========================
     FETCH DATA
  ========================= */

  const fetchOutstandingData = useCallback(async () => {
    try {
      const token = localStorage.getItem("dealerToken");

      if (!token) {
        navigate("/dealer/login");
        return;
      }

      setLoading(true);

      const [summaryResponse, ordersResponse] = await Promise.all([
        fetch(`${API_URL}/api/dealer/dashboard/summary`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),

        fetch(`${API_URL}/api/dealer/orders`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
      ]);

      if (summaryResponse.status === 401 || ordersResponse.status === 401) {
        localStorage.removeItem("dealerToken");

        alert("Session expired. Please login again.");

        navigate("/dealer/login");

        return;
      }

      const summaryData = await summaryResponse.json();
      const ordersData = await ordersResponse.json();

      if (summaryResponse.ok && summaryData.success) {
        setTotalOutstanding(
          Number(
            summaryData.outstandingAmount || summaryData.pendingBills || 0,
          ),
        );
      }

      if (ordersResponse.ok && ordersData.success) {
        const pendingOrders = (ordersData.orders || [])
          .map((order) => {
            const totalAmount = Number(order.totalAmount || 0);

            const paidAmount = Number(order.paidAmount || 0);

            const balanceAmount =
              order.balanceAmount !== undefined && order.balanceAmount !== null
                ? Number(order.balanceAmount)
                : Math.max(totalAmount - paidAmount, 0);

            return {
              ...order,
              totalAmount,
              paidAmount,
              balanceAmount,
            };
          })
          .filter((order) => Number(order.balanceAmount || 0) > 0);

        setOrders(pendingOrders);
      }
    } catch (error) {
      console.error("OUTSTANDING FETCH ERROR:", error);

      alert(error.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchOutstandingData();
  }, [fetchOutstandingData]);

  /* =========================
     FILE CHANGE
  ========================= */

  const handleFileChange = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "application/pdf",
    ];

    if (!allowedTypes.includes(file.type)) {
      alert("Only JPG, PNG, WEBP or PDF files are allowed");

      e.target.value = "";

      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("File size should be less than 5 MB");

      e.target.value = "";

      return;
    }

    setPaymentProof(file);
  };

  /* =========================
     SUBMIT PAYMENT
  ========================= */

  const handleSubmit = async () => {
    try {
      if (submitting) return;

      const amount = Number(paymentAmount);

      if (isNaN(amount) || amount <= 0) {
        alert("Enter a valid payment amount");
        return;
      }

      if (amount > Number(totalOutstanding)) {
        alert(
          `Amount cannot exceed ₹${Number(totalOutstanding).toLocaleString(
            "en-IN",
          )}`,
        );

        return;
      }

      if (
        paymentMethod === "UPI" &&
        (!utrNumber || utrNumber.trim().length < 10)
      ) {
        alert("UTR Number must contain at least 10 digits");

        return;
      }

      const token = localStorage.getItem("dealerToken");

      if (!token) {
        alert("Please login again");

        navigate("/dealer/login");

        return;
      }

      setSubmitting(true);

      const payload = {
        amount,

        paymentType: paymentMethod,

        paymentApp: paymentMethod === "UPI" ? paymentApp : "",

        utrNumber: paymentMethod === "UPI" ? utrNumber.trim() : "",

        paymentProof: "",
      };

      const response = await fetch(
        `${API_URL}/api/dealer/payment/pay-outstanding`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",

            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify(payload),
        },
      );

      const data = await response.json();

      if (response.status === 401) {
        localStorage.removeItem("dealerToken");

        alert("Session expired. Please login again.");

        navigate("/dealer/login");

        return;
      }

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Payment submission failed");
      }

      alert("Payment submitted successfully.\n\nWaiting for admin approval.");

      setPaymentAmount("");
      setUtrNumber("");
      setPaymentProof(null);

      navigate("/dealer/transaction-history");
    } catch (error) {
      console.error("OUTSTANDING PAYMENT ERROR:", error);

      alert(error.message || "Payment failed");
    } finally {
      setSubmitting(false);
    }
  };
  /* =========================
   OPEN PAYMENT APP
========================= */

  const openPaymentApp = () => {
    const amount = Number(paymentAmount);

    if (!amount || amount <= 0) {
      alert("Please enter payment amount first");
      return;
    }

    const upiId = "9848871389-2@ybl";

    const merchantName = "Adarsh Agri Tech";

    const upiLink =
      `upi://pay?pa=${upiId}` +
      `&pn=${encodeURIComponent(merchantName)}` +
      `&am=${amount}` +
      `&cu=INR`;

    window.location.href = upiLink;
  };

  /* =========================
     LOADING
  ========================= */

  if (loading) {
    return (
      <div className="orders-loading">
        <h2>Loading outstanding details...</h2>
      </div>
    );
  }

  return (
    <div className="dealer-orders-page">
      <div className="page-header">
        <h1>Pay Outstanding Amount</h1>

        <p>Clear pending dealer balance</p>
      </div>

      <div className="outstanding-summary-card">
        <h3>Total Outstanding Amount</h3>

        <h1>
          ₹
          {Number(totalOutstanding).toLocaleString("en-IN", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </h1>
      </div>

      <div className="payment-card">
        <h3>Payment Details</h3>

        <div className="payment-form-grid">
          <div>
            <label>Amount Paying</label>

            <input
              type="number"
              min="1"
              max={totalOutstanding}
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(e.target.value)}
              className="payment-input"
            />
          </div>

          <div>
            <label>Payment Method</label>

            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="payment-input"
            >
              <option value="UPI">UPI</option>

              <option value="CASH">CASH</option>
            </select>
          </div>

          {paymentMethod === "UPI" && (
            <>
              <div>
                <label>Payment App</label>

                <select
                  value={paymentApp}
                  onChange={(e) => setPaymentApp(e.target.value)}
                  className="payment-input"
                >
                  <option value="PHONEPE">PhonePe</option>

                  <option value="GPAY">Google Pay</option>

                  <option value="PAYTM">Paytm</option>
                </select>
              </div>

              <div className="payment-app-action">
                <button
                  type="button"
                  className="open-payment-app-btn"
                  onClick={openPaymentApp}
                >
                  Open Payment App
                </button>
              </div>

              <div>
                <label>UTR Number</label>

                <input
                  type="text"
                  value={utrNumber}
                  onChange={(e) =>
                    setUtrNumber(e.target.value.replace(/\s/g, ""))
                  }
                  className="payment-input"
                  placeholder="Enter UTR Number"
                />
              </div>

              <div>
                <label>Screenshot (Optional)</label>

                <input
                  type="file"
                  accept=".jpg,.jpeg,.png,.webp,.pdf"
                  onChange={handleFileChange}
                  className="payment-input"
                />
              </div>
            </>
          )}
        </div>

        <button
          className="pay-outstanding-btn"
          onClick={handleSubmit}
          disabled={submitting || Number(totalOutstanding) <= 0}
        >
          {submitting ? "Submitting..." : "Submit Payment"}
        </button>
      </div>

      <div className="orders-table-card">
        <div className="table-wrapper">
          <table className="orders-table">
            <thead>
              <tr>
                <th>Order No</th>
                <th>Total Amount</th>
                <th>Paid Amount</th>
                <th>Balance Amount</th>
              </tr>
            </thead>

            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan="4">No outstanding orders found</td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order._id}>
                    <td>{order.orderNo}</td>

                    <td>
                      ₹
                      {order.totalAmount.toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </td>

                    <td>
                      ₹
                      {order.paidAmount.toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </td>

                    <td>
                      ₹
                      {order.balanceAmount.toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PayOutstanding;
