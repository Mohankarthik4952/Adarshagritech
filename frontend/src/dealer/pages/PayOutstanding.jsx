import { useEffect, useState } from "react";
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

  useEffect(() => {
    fetchOutstandingData();
  }, []);

  const fetchOutstandingData = async () => {
    try {
      const token = localStorage.getItem("dealerToken");

      /* =========================
         DASHBOARD SUMMARY
      ========================= */

      const summaryResponse = await fetch(
        `${API_URL}/api/dealer/dashboard/summary`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const summaryData = await summaryResponse.json();

      console.log("SUMMARY:", summaryData);

      if (summaryData.success) {
        setTotalOutstanding(
          Number(
            summaryData.outstandingAmount || summaryData.pendingBills || 0,
          ),
        );
      }

      /* =========================
         ORDERS
      ========================= */

      const ordersResponse = await fetch(`${API_URL}/api/dealer/orders`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const ordersData = await ordersResponse.json();

      console.log("ORDERS:", ordersData);

      if (ordersData.success) {
        const pendingOrders = (ordersData.orders || []).map((order) => {
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
        });

        setOrders(
          pendingOrders.filter((order) => Number(order.balanceAmount || 0) > 0),
        );
      }
    } catch (error) {
      console.error("Outstanding fetch error:", error);
    }
  };

  const handleSubmit = async () => {
    try {
      const amount = Number(paymentAmount);

      if (isNaN(amount) || amount <= 0) {
        return alert("Invalid payment amount");
      }

      if (amount > Number(totalOutstanding)) {
        return alert(
          `Amount cannot exceed ₹${Number(totalOutstanding).toLocaleString(
            "en-IN",
          )}`,
        );
      }

      if (
        paymentMethod === "UPI" &&
        (!utrNumber || utrNumber.trim().length < 10)
      ) {
        return alert("UTR Number must contain minimum 10 digits");
      }

      const token = localStorage.getItem("dealerToken");

      if (!token) {
        alert("Please login again");
        navigate("/dealer/login");
        return;
      }

      const payload = {
        amount,

        paymentType: paymentMethod,

        paymentApp: paymentMethod === "UPI" ? paymentApp : "",

        utrNumber: paymentMethod === "UPI" ? utrNumber.trim() : "",

        paymentProof: "",
      };

      console.log("OUTSTANDING PAYMENT PAYLOAD:", payload);

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

      console.log("PAYMENT RESPONSE:", data);

      if (!response.ok || !data.success) {
        return alert(data.message || "Payment submission failed");
      }

      alert("Payment submitted successfully.\n\nWaiting for admin approval.");

      setPaymentAmount("");
      setUtrNumber("");
      setPaymentProof(null);

      navigate("/dealer/transaction-history");
    } catch (error) {
      console.error("OUTSTANDING PAYMENT ERROR:", error);

      alert("Payment failed");
    }
  };
  return (
    <div className="dealer-orders-page">
      <div className="page-header">
        <h1>Pay Outstanding Amount</h1>

        <p>Clear pending dealer balance</p>
      </div>

      <div className="outstanding-summary-card">
        <h3>Total Outstanding Amount</h3>

        <h1>₹{Number(totalOutstanding).toLocaleString("en-IN")}</h1>
      </div>

      <div className="payment-card">
        <h3>Payment Details</h3>

        <div className="payment-form-grid">
          <div>
            <label>Amount Paying</label>

            <input
              type="number"
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

              <div>
                <label>UTR Number</label>

                <input
                  type="text"
                  value={utrNumber}
                  onChange={(e) => setUtrNumber(e.target.value)}
                  className="payment-input"
                />
              </div>

              <div>
                <label>Screenshot</label>

                <input
                  type="file"
                  onChange={(e) => setPaymentProof(e.target.files[0])}
                  className="payment-input"
                />
              </div>
            </>
          )}
        </div>

        <button className="pay-outstanding-btn" onClick={handleSubmit}>
          Submit Payment
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
                      ₹{Number(order.totalAmount || 0).toLocaleString("en-IN")}
                    </td>

                    <td>
                      ₹{Number(order.paidAmount || 0).toLocaleString("en-IN")}
                    </td>

                    <td>
                      ₹
                      {Number(order.balanceAmount || 0).toLocaleString("en-IN")}
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
