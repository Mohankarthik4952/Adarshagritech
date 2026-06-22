// src/dealer/pages/TransactionHistory.jsx

import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import API_URL from "../../config/api";
import "./dealerpages.css";

const TransactionHistory = () => {
  const navigate = useNavigate();

  const [transactions, setTransactions] = useState([]);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [loading, setLoading] = useState(true);

  /* =========================
     FETCH TRANSACTIONS
  ========================= */

  const fetchTransactions = async () => {
    try {
      setLoading(true);

      const token =
        localStorage.getItem("dealerToken") || localStorage.getItem("token");

      if (!token) {
        navigate("/dealer/login");
        return;
      }

      const response = await fetch(`${API_URL}/api/dealer/payment/history`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      console.log("TRANSACTIONS:", data);

      if (response.status === 401) {
        localStorage.removeItem("dealerToken");
        localStorage.removeItem("token");

        alert("Session expired. Please login again.");

        navigate("/dealer/login");

        return;
      }

      if (!response.ok) {
        throw new Error(data.message || "Failed to load transactions");
      }

      const transactionList = Array.isArray(data)
        ? data
        : data.transactions || data.payments || [];

      setTransactions(transactionList);
    } catch (error) {
      console.error("Transaction fetch error:", error);

      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  /* =========================
     FILE URL
  ========================= */

  const getFileUrl = (path) => {
    if (!path) return "";

    if (path.startsWith("http")) {
      return path;
    }

    return `${API_URL}${path}`;
  };

  /* =========================
     FILTER TRANSACTIONS
  ========================= */

  const filteredTransactions = useMemo(() => {
    return transactions.filter((transaction) => {
      const paymentDate = new Date(
        transaction.paymentDate || transaction.createdAt,
      );

      if (fromDate) {
        const startDate = new Date(fromDate);
        startDate.setHours(0, 0, 0, 0);

        if (paymentDate < startDate) {
          return false;
        }
      }

      if (toDate) {
        const endDate = new Date(toDate);
        endDate.setHours(23, 59, 59, 999);

        if (paymentDate > endDate) {
          return false;
        }
      }

      return true;
    });
  }, [transactions, fromDate, toDate]);

  /* =========================
     APPROVED PAYMENTS
  ========================= */

  const approvedTransactions = filteredTransactions.filter(
    (transaction) =>
      transaction.status === "APPROVED" || transaction.status === "RECEIVED",
  );

  /* =========================
     TOTAL PAID
  ========================= */

  const totalPaidAmount = approvedTransactions.reduce(
    (sum, transaction) => sum + Number(transaction.amount || 0),
    0,
  );

  return (
    <div className="transactions-page">
      <div className="page-header">
        <h1>Transaction History</h1>

        <p>View all dealer payment transactions</p>
      </div>

      {/* FILTERS */}

      <div className="transaction-filters">
        <div className="filter-group">
          <label>From Date</label>

          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <label>To Date</label>

          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
          />
        </div>
      </div>

      {/* SUMMARY */}

      <div className="transaction-summary">
        <div className="summary-card">
          <h3>Approved Payments</h3>

          <h2>{approvedTransactions.length}</h2>
        </div>

        <div className="summary-card">
          <h3>Total Amount Paid</h3>

          <h2>
            ₹
            {totalPaidAmount.toLocaleString("en-IN", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </h2>
        </div>
      </div>

      {/* TABLE */}

      <div className="transactions-table-card">
        {loading ? (
          <div className="loading-box">
            <h2>Loading transactions...</h2>
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="empty-box">
            <h2>No transactions found</h2>

            <p>Transactions will appear here</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="transactions-table">
              <thead>
                <tr>
                  <th>Transaction ID</th>
                  <th>Payment Date</th>
                  <th>Paid Amount</th>
                  <th>Payment Method</th>
                  <th>UTR Number</th>
                  <th>Payment App</th>
                  <th>Screenshot</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {filteredTransactions.map((transaction) => (
                  <tr key={transaction._id}>
                    <td>{transaction._id?.slice(-8) || "-"}</td>

                    <td>
                      {new Date(
                        transaction.paymentDate || transaction.createdAt,
                      ).toLocaleDateString("en-IN")}
                    </td>

                    <td>
                      ₹
                      {Number(transaction.amount || 0).toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </td>

                    <td>
                      <span
                        className={
                          transaction.paymentType === "CASH"
                            ? "cash-badge"
                            : "upi-badge"
                        }
                      >
                        {transaction.paymentType || "-"}
                      </span>
                    </td>

                    <td>
                      {transaction.paymentType === "CASH"
                        ? "N/A"
                        : transaction.utrNumber || "-"}
                    </td>

                    <td>
                      {transaction.paymentType === "CASH"
                        ? "N/A"
                        : transaction.paymentApp || "-"}
                    </td>

                    <td>
                      {transaction.paymentType === "CASH" ? (
                        "N/A"
                      ) : transaction.paymentProof ? (
                        <a
                          href={getFileUrl(transaction.paymentProof)}
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
                        className={`transaction-status ${
                          transaction.status === "APPROVED" ||
                          transaction.status === "RECEIVED"
                            ? "completed"
                            : transaction.status === "REJECTED"
                              ? "rejected"
                              : "pending"
                        }`}
                      >
                        {transaction.status || "PENDING"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionHistory;
