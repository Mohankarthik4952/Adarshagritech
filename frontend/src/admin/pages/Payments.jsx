import { useEffect, useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";

import API_URL from "../../config/api";

import "./adminpages.css";

const Payments = () => {
  const navigate = useNavigate();

  /* =========================
     STATES
  ========================= */

  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState("");
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  /* =========================
     FETCH PAYMENTS
  ========================= */

  const fetchPayments = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("adminToken");

      if (!token) {
        navigate("/admin/login");
        return;
      }

      const response = await fetch(`${API_URL}/api/admin/payments`, {
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
        throw new Error(data.message || "Failed to load payments");
      }

      const safePayments = Array.isArray(data.payments) ? data.payments : [];

      safePayments.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
      );

      setPayments(safePayments);
    } catch (error) {
      console.error("PAYMENT ERROR:", error);

      setError(error.message || "Failed to load payments");

      setPayments([]);
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  /* =========================
     APPROVE PAYMENT
  ========================= */

  const approvePayment = async (paymentId) => {
    try {
      setProcessingId(paymentId);

      const token = localStorage.getItem("adminToken");

      const response = await fetch(
        `${API_URL}/api/admin/payments/${paymentId}/approve`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await response.json();

      if (response.status === 401) {
        localStorage.removeItem("adminToken");

        navigate("/admin/login");

        return;
      }

      if (!response.ok) {
        throw new Error(data.message || "Approval failed");
      }

      alert("Payment approved successfully ✅");

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
      const rejectionReason = prompt("Enter rejection reason");

      if (!rejectionReason?.trim()) return;

      setProcessingId(paymentId);

      const token = localStorage.getItem("adminToken");

      const response = await fetch(
        `${API_URL}/api/admin/payments/${paymentId}/reject`,
        {
          method: "PUT",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            rejectionReason,
          }),
        },
      );

      const data = await response.json();

      if (response.status === 401) {
        localStorage.removeItem("adminToken");

        navigate("/admin/login");

        return;
      }

      if (!response.ok) {
        throw new Error(data.message || "Rejection failed");
      }

      alert("Payment rejected ❌");

      await fetchPayments();
    } catch (error) {
      console.error("REJECT ERROR:", error);

      alert(error.message || "Rejection failed");
    } finally {
      setProcessingId("");
    }
  };

  /* =========================
     FILTER PAYMENTS
  ========================= */

  const filteredPayments = useMemo(() => {
    let result = [...payments];

    if (statusFilter !== "ALL") {
      result = result.filter((payment) => payment.status === statusFilter);
    }

    if (search.trim()) {
      const value = search.toLowerCase().trim();

      result = result.filter((payment) => {
        const displayName =
          payment.dealerName ||
          payment.customerName ||
          payment.orderId?.dealerName ||
          payment.orderId?.customerName ||
          "";

        return (
          String(payment.orderId?.orderNo || "")
            .toLowerCase()
            .includes(value) ||
          String(displayName).toLowerCase().includes(value) ||
          String(payment.utrNumber || "")
            .toLowerCase()
            .includes(value)
        );
      });
    }

    return result;
  }, [payments, search, statusFilter]);

  /* =========================
     LOADING
  ========================= */

  if (loading) {
    return (
      <div className="admin-page">
        <div className="loading-box">
          <h2>Loading payments...</h2>
        </div>
      </div>
    );
  }

  /* =========================
     ERROR
  ========================= */

  if (error) {
    return (
      <div className="admin-page">
        <div className="error-box">
          <h2>{error}</h2>

          <button className="refresh-btn" onClick={fetchPayments}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="page-header">
        <div>
          <h1>Payment Verification</h1>
          <p>Verify dealer and customer payments</p>
        </div>

        <button className="refresh-btn" onClick={fetchPayments}>
          Refresh
        </button>
      </div>

      <div className="orders-topbar">
        <input
          type="text"
          placeholder="Search by Order No, Name or UTR"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="orders-search"
        />

        <select
          className="payment-filter"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="ALL">All Status</option>
          <option value="VERIFICATION_PENDING">Verification Pending</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
        </select>
      </div>

      <div className="orders-summary">
        <strong>Total Payments: {filteredPayments.length}</strong>
      </div>

      <div className="admin-table-card">
        <div className="admin-table-wrapper">
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
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan="10">No payments found</td>
                </tr>
              ) : (
                filteredPayments.map((payment) => {
                  const isOutstanding =
                    payment.paymentCategory === "OUTSTANDING_PAYMENT";

                  const isProcessing = processingId === payment._id;

                  const screenshotUrl = payment.paymentProof
                    ? payment.paymentProof.startsWith("http")
                      ? payment.paymentProof
                      : `${API_URL}${payment.paymentProof}`
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
                          {String(payment.status || "")
                            .replaceAll("_", " ")
                            .toUpperCase()}
                        </span>
                      </td>

                      <td>
                        {payment.status === "VERIFICATION_PENDING" ? (
                          <div className="action-buttons">
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
    </div>
  );
};

export default Payments;
