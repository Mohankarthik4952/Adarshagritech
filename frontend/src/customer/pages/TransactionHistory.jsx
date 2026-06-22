// src/customer/pages/TransactionHistory.jsx

import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";

import {
  FaMoneyCheckAlt,
  FaCheckCircle,
  FaClock,
  FaTimesCircle,
  FaRedo,
} from "react-icons/fa";

import API_URL from "../../config/api";

import "./customerpages.css";

const TransactionHistory = () => {
  const navigate = useNavigate();

  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* =========================
     FETCH TRANSACTIONS
  ========================= */

  const loadTransactions = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const token =
        localStorage.getItem("customerToken") || localStorage.getItem("token");

      if (!token) {
        navigate("/customer/login");
        return;
      }

      const res = await fetch(`${API_URL}/api/customer/payments/history`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      console.log("CUSTOMER PAYMENT HISTORY:", data);

      if (res.status === 401) {
        localStorage.removeItem("customerToken");

        localStorage.removeItem("token");

        alert("Session expired. Please login again.");

        navigate("/customer/login");

        return;
      }

      if (!res.ok) {
        throw new Error(data.message || "Failed to load transactions");
      }

      if (data.success) {
        setTransactions(data.payments || []);
      } else {
        setTransactions([]);
      }
    } catch (error) {
      console.error("TRANSACTION FETCH ERROR:", error);

      setError(error.message || "Failed to load transactions");

      setTransactions([]);
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  /* =========================
     HELPERS
  ========================= */

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString("en-IN");
  };

  const formatCurrency = (amount) => {
    return Number(amount || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const getProofUrl = (path) => {
    if (!path) return null;

    if (path.startsWith("http")) {
      return path;
    }

    return `${API_URL}${path}`;
  };

  /* =========================
     SUMMARY
  ========================= */

  const approvedTransactions = transactions.filter(
    (tx) => tx.status === "APPROVED",
  );

  const totalAmount = approvedTransactions.reduce(
    (sum, tx) => sum + Number(tx.amount || 0),
    0,
  );

  /* =========================
     LOADING
  ========================= */

  if (loading) {
    return (
      <div className="loading-box">
        <h2>Loading transactions...</h2>
      </div>
    );
  }

  /* =========================
     ERROR
  ========================= */

  if (error) {
    return (
      <div className="loading-box">
        <h2>{error}</h2>

        <button className="retry-btn" onClick={loadTransactions}>
          <FaRedo />
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="customer-transactions-page">
      <div className="page-header">
        <h1>
          <FaMoneyCheckAlt />
          Transaction History
        </h1>

        <p>View all your payment transactions</p>
      </div>

      {transactions.length === 0 ? (
        <div className="empty-transactions">
          <FaMoneyCheckAlt />

          <h2>No transactions found</h2>

          <p>Your payment history will appear here</p>
        </div>
      ) : (
        <>
          <div className="transaction-summary-grid">
            <div className="summary-card">
              <h3>Total Transactions</h3>

              <h2>{transactions.length}</h2>
            </div>

            <div className="summary-card">
              <h3>Total Approved Amount</h3>

              <h2>₹{formatCurrency(totalAmount)}</h2>
            </div>
          </div>

          <div className="transactions-table-wrapper">
            <table className="transactions-table">
              <thead>
                <tr>
                  <th>Order No</th>
                  <th>Amount</th>
                  <th>Payment App</th>
                  <th>UTR No</th>
                  <th>Date</th>
                  <th>Proof</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {transactions.map((tx) => (
                  <tr key={tx._id}>
                    <td>{tx.orderId?.orderNo || "-"}</td>

                    <td>₹{formatCurrency(tx.amount)}</td>

                    <td>{tx.paymentApp || "-"}</td>

                    <td>{tx.utrNumber || "-"}</td>

                    <td>{formatDate(tx.paymentDate || tx.createdAt)}</td>

                    <td>
                      {tx.paymentProof ? (
                        <a
                          href={getProofUrl(tx.paymentProof)}
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
                        className={`transaction-badge ${
                          tx.status === "APPROVED"
                            ? "completed"
                            : tx.status === "REJECTED"
                              ? "rejected"
                              : "pending"
                        }`}
                      >
                        {tx.status === "APPROVED" ? (
                          <>
                            <FaCheckCircle />
                            Approved
                          </>
                        ) : tx.status === "REJECTED" ? (
                          <>
                            <FaTimesCircle />
                            Rejected
                          </>
                        ) : (
                          <>
                            <FaClock />
                            {tx.status?.replaceAll("_", " ") || "Pending"}
                          </>
                        )}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default TransactionHistory;
