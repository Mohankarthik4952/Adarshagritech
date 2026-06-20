// src/dealer/pages/TransactionHistory.jsx

import { useEffect, useState } from "react";
import "./dealerpages.css";

const TransactionHistory = () => {
  const token =
    localStorage.getItem("token") || localStorage.getItem("dealerToken");

  const [transactions, setTransactions] = useState([]);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [loading, setLoading] = useState(true);

  /* =========================
     FETCH TRANSACTIONS
  ========================= */

  const fetchTransactions = async () => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/dealer/payment/history",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await response.json();

      console.log("TRANSACTIONS:", data);

      setTransactions(Array.isArray(data) ? data : []);
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
   FILTER
========================= */

  const filteredTransactions = transactions.filter((transaction) => {
    const paymentDate = new Date(
      transaction.paymentDate || transaction.createdAt,
    );

    if (fromDate && paymentDate < new Date(fromDate)) {
      return false;
    }

    if (toDate && paymentDate > new Date(toDate)) {
      return false;
    }

    return true;
  });

  /* =========================
   APPROVED PAYMENTS ONLY
========================= */

  const approvedTransactions = filteredTransactions.filter(
    (transaction) => transaction.status === "APPROVED",
  );

  /* =========================
   TOTAL PAID AMOUNT
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
                    <td>{transaction._id?.slice(-8)}</td>

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
                        {transaction.paymentType}
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
                          href={`http://localhost:5000${transaction.paymentProof}`}
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
                          transaction.status === "APPROVED"
                            ? "completed"
                            : transaction.status === "REJECTED"
                              ? "rejected"
                              : "pending"
                        }`}
                      >
                        {transaction.status}
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
