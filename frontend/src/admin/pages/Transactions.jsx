// src/admin/pages/Transactions.jsx

import { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";

import API_URL from "../../config/api";

import "./adminpages.css";

const Transactions = () => {
  const navigate = useNavigate();

  /* =========================
     STATES
  ========================= */

  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);

  const [search, setSearch] = useState("");

  const [selectedRole, setSelectedRole] = useState("ALL");

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  /* =========================
     HELPERS
  ========================= */

  const getToken = () => localStorage.getItem("adminToken");

  const getFileUrl = (path) => {
    if (!path) return "";

    if (path.startsWith("http")) {
      return path;
    }

    return `${API_URL}${path}`;
  };

  /* =========================
     FETCH TRANSACTIONS
  ========================= */

  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true);

      const token = getToken();

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

        navigate("/admin/login");

        return;
      }

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch transactions");
      }

      const safeTransactions = Array.isArray(data.payments)
        ? data.payments
        : Array.isArray(data.transactions)
          ? data.transactions
          : Array.isArray(data)
            ? data
            : [];

      setTransactions(safeTransactions);
    } catch (error) {
      console.error("FETCH TRANSACTIONS ERROR:", error);

      alert(error.message || "Failed to fetch transactions");

      setTransactions([]);
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  /* =========================
     FILTERED DATA
  ========================= */

  const filteredTransactions = useMemo(() => {
    return transactions.filter((transaction) => {
      const transactionDate = new Date(
        transaction.paymentDate || transaction.createdAt,
      );

      if (fromDate && transactionDate < new Date(fromDate)) {
        return false;
      }

      if (toDate) {
        const endDate = new Date(toDate);

        endDate.setHours(23, 59, 59, 999);

        if (transactionDate > endDate) {
          return false;
        }
      }

      if (selectedRole !== "ALL" && transaction.role !== selectedRole) {
        return false;
      }

      if (search.trim()) {
        const searchValue = search.toLowerCase().trim();

        const orderNo = transaction.orderId?.orderNo?.toLowerCase() || "";

        const userName = (
          transaction.customerName ||
          transaction.dealerName ||
          transaction.userId?.name ||
          transaction.userId?.shopName ||
          ""
        ).toLowerCase();

        const utrNumber = transaction.utrNumber?.toLowerCase() || "";

        return (
          orderNo.includes(searchValue) ||
          userName.includes(searchValue) ||
          utrNumber.includes(searchValue)
        );
      }

      return true;
    });
  }, [transactions, search, selectedRole, fromDate, toDate]);

  /* =========================
     SUMMARY
  ========================= */

  const totalAmount = filteredTransactions.reduce(
    (sum, transaction) => sum + Number(transaction.amount || 0),
    0,
  );

  /* =========================
     UI
  ========================= */

  return (
    <div className="transactions-page">
      <div className="transactions-header">
        <h2>Transactions Management</h2>

        <p>View all dealer and customer transactions.</p>
      </div>

      {/* FILTERS */}

      <div className="transaction-filters">
        <input
          type="text"
          placeholder="Search by Order No, User or UTR"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="transaction-search"
        />

        <select
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value)}
        >
          <option value="ALL">All Roles</option>
          <option value="DEALER">Dealer</option>
          <option value="CUSTOMER">Customer</option>
        </select>

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
          <h3>Total Transactions</h3>

          <h2>{filteredTransactions.length}</h2>
        </div>

        <div className="summary-card">
          <h3>Total Amount</h3>

          <h2>
            ₹
            {totalAmount.toLocaleString("en-IN", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </h2>
        </div>
      </div>

      {/* TABLE */}

      {loading ? (
        <div className="loading-box">
          <h3>Loading transactions...</h3>
        </div>
      ) : filteredTransactions.length === 0 ? (
        <div className="empty-transactions">No transactions found</div>
      ) : (
        <div className="transactions-table-wrapper">
          <table className="transactions-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Role</th>
                <th>Order No</th>
                <th>Amount</th>
                <th>Payment Type</th>
                <th>App</th>
                <th>UTR</th>
                <th>Screenshot</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>

            <tbody>
              {filteredTransactions.map((transaction) => {
                const displayName =
                  transaction.customerName ||
                  transaction.dealerName ||
                  transaction.userId?.shopName ||
                  transaction.userId?.name ||
                  "-";

                return (
                  <tr key={transaction._id}>
                    <td>{displayName}</td>

                    <td>
                      <span
                        className={`transaction-role ${transaction.role?.toLowerCase()}`}
                      >
                        {transaction.role || "-"}
                      </span>
                    </td>

                    <td>{transaction.orderId?.orderNo || "-"}</td>

                    <td>
                      ₹
                      {Number(transaction.amount || 0).toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </td>

                    <td>{transaction.paymentType || "-"}</td>

                    <td>
                      {transaction.paymentType === "CASH"
                        ? "N/A"
                        : transaction.paymentApp || "-"}
                    </td>

                    <td>
                      {transaction.paymentType === "CASH"
                        ? "N/A"
                        : transaction.utrNumber || "-"}
                    </td>

                    <td>
                      {transaction.paymentProof ? (
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
                        className={`status-badge ${
                          transaction.status === "APPROVED"
                            ? "approved-badge"
                            : transaction.status === "REJECTED"
                              ? "rejected-badge"
                              : "pending-badge"
                        }`}
                      >
                        {(transaction.status || "-")
                          .replaceAll("_", " ")
                          .toUpperCase()}
                      </span>
                    </td>

                    <td>
                      {transaction.createdAt
                        ? new Date(
                            transaction.paymentDate || transaction.createdAt,
                          ).toLocaleDateString("en-IN")
                        : "-"}
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

export default Transactions;
