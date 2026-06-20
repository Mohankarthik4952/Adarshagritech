import { useEffect, useState } from "react";
import "./adminpages.css";

const Payments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState("");

  const token = localStorage.getItem("adminToken");

  /* =========================
     LOAD PAYMENTS
  ========================= */

  const fetchPayments = async () => {
    try {
      setLoading(true);

      const response = await fetch("http://localhost:5000/api/admin/payments", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load payments");
      }

      setPayments(data.payments || []);
    } catch (error) {
      console.error("PAYMENT ERROR:", error);

      alert(error.message || "Failed to load payments");

      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  /* =========================
     APPROVE PAYMENT
  ========================= */

  const approvePayment = async (paymentId) => {
    try {
      setProcessingId(paymentId);

      const response = await fetch(
        `http://localhost:5000/api/admin/payments/${paymentId}/approve`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Approval failed");
      }

      alert("Payment Approved Successfully ✅");

      await fetchPayments();
    } catch (error) {
      console.error("APPROVE ERROR:", error);

      alert(error.message || "Approval failed");
    } finally {
      setProcessingId("");
    }
  };

  /* =========================
     REJECT PAYMENT
  ========================= */

  const rejectPayment = async (paymentId) => {
    try {
      const reason = prompt("Enter rejection reason");

      if (!reason?.trim()) return;

      setProcessingId(paymentId);

      const response = await fetch(
        `http://localhost:5000/api/admin/payments/${paymentId}/reject`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            rejectionReason: reason,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Rejection failed");
      }

      alert("Payment Rejected ❌");

      await fetchPayments();
    } catch (error) {
      console.error("REJECT ERROR:", error);

      alert(error.message || "Rejection failed");
    } finally {
      setProcessingId("");
    }
  };

  /* =========================
     LOADING
  ========================= */

  if (loading) {
    return (
      <div className="admin-page">
        <h2>Loading Payments...</h2>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="page-header">
        <h1>Payment Verification</h1>
        <p>Verify Dealer & Customer Payments</p>
      </div>

      <div className="admin-table-card">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Payment For</th>
              <th>User</th>
              <th>Role</th>
              <th>Amount</th>
              <th>Method</th>
              <th>App</th>
              <th>UTR</th>
              <th>Screenshot</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {payments.length === 0 ? (
              <tr>
                <td colSpan="10">No Payments Found</td>
              </tr>
            ) : (
              payments.map((payment) => {
                const isOutstanding =
                  payment.paymentCategory === "OUTSTANDING_PAYMENT";

                const isProcessing = processingId === payment._id;

                const screenshotUrl = payment.paymentProof
                  ? payment.paymentProof.startsWith("http")
                    ? payment.paymentProof
                    : `http://localhost:5000${payment.paymentProof}`
                  : "";

                const displayName =
                  payment.dealerName ||
                  payment.customerName ||
                  payment.orderId?.dealerName ||
                  payment.orderId?.customerName ||
                  "-";

                return (
                  <tr key={payment._id}>
                    <td>
                      {isOutstanding
                        ? "Outstanding Payment"
                        : payment.orderId?.orderNo || payment.orderNo || "-"}
                    </td>

                    <td>{displayName}</td>

                    <td>{payment.role || "-"}</td>

                    <td>
                      ₹
                      {Number(payment.amount || 0).toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </td>

                    <td>{payment.paymentType || "-"}</td>

                    <td>
                      {payment.paymentType === "CASH"
                        ? "N/A"
                        : payment.paymentApp || "-"}
                    </td>

                    <td>
                      {payment.paymentType === "CASH"
                        ? "N/A"
                        : payment.utrNumber || "-"}
                    </td>

                    <td>
                      {payment.paymentType === "CASH" ? (
                        "N/A"
                      ) : screenshotUrl ? (
                        <a
                          href={screenshotUrl}
                          target="_blank"
                          rel="noreferrer"
                        >
                          View
                        </a>
                      ) : (
                        "-"
                      )}
                    </td>

                    <td>
                      <span
                        className={
                          payment.status === "APPROVED"
                            ? "approved-badge"
                            : payment.status === "REJECTED"
                              ? "rejected-badge"
                              : "pending-badge"
                        }
                      >
                        {(payment.status || "")
                          .replaceAll("_", " ")
                          .toUpperCase()}
                      </span>
                    </td>

                    <td>
                      {payment.status === "VERIFICATION_PENDING" ? (
                        <div
                          style={{
                            display: "flex",
                            gap: "10px",
                          }}
                        >
                          <button
                            className="approve-btn"
                            disabled={isProcessing}
                            onClick={() => approvePayment(payment._id)}
                          >
                            {isProcessing ? "Approving..." : "Approve"}
                          </button>

                          <button
                            className="reject-btn"
                            disabled={isProcessing}
                            onClick={() => rejectPayment(payment._id)}
                          >
                            {isProcessing ? "Processing..." : "Reject"}
                          </button>
                        </div>
                      ) : (
                        <span style={{ color: "#888" }}>—</span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Payments;
