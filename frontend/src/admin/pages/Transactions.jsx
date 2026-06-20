import { useEffect, useState } from "react";
import "./adminpages.css";

const Transactions = () => {
  const token = localStorage.getItem("adminToken");

  const [loading, setLoading] = useState(false);

  const [transactions, setTransactions] = useState([]);

  const [fromDate, setFromDate] = useState("");

  const [toDate, setToDate] = useState("");

  /* =========================
     FETCH TRANSACTIONS
  ========================= */

  const fetchTransactions = async () => {
    try {
      setLoading(true);

      const res = await fetch("http://localhost:5000/api/admin/payments", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error("Failed to fetch transactions");
      }

      const data = await res.json();

      console.log("TRANSACTION DATA:", data);

      setTransactions(data.payments || data.transactions || []);
    } catch (error) {
      console.error("FETCH TRANSACTIONS ERROR:", error);

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

  const filteredTransactions = transactions.filter((t) => {
    const transactionDate = new Date(t.createdAt);

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

    return true;
  });

  return (
    <div className="transactions-page">
      {/* HEADER */}

      <div className="transactions-header">
        <h2>Transactions Management</h2>

        <p>View all dealer and customer transactions.</p>
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

      {/* TABLE */}

      {loading ? (
        <p>Loading transactions...</p>
      ) : filteredTransactions.length === 0 ? (
        <div className="empty-transactions">No transactions found</div>
      ) : (
        <div className="transactions-table-wrapper">
          <table className="transactions-table">
            <thead>
              <tr>
                <th>User ID</th>
                <th>Role</th>
                <th>Order No</th>
                <th>Amount</th>
                <th>Method</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>

            <tbody>
              {filteredTransactions.map((transaction) => (
                <tr key={transaction._id}>
                  <td>{transaction.userId || "-"}</td>

                  <td>
                    <span
                      className={`transaction-role ${transaction.role?.toLowerCase()}`}
                    >
                      {transaction.role || "-"}
                    </span>
                  </td>

                  <td>{transaction.orderId?.orderNo || "-"}</td>

                  <td>₹{Number(transaction.amount || 0).toLocaleString()}</td>

                  <td>{transaction.method || "-"}</td>

                  <td>{transaction.status || "-"}</td>

                  <td>
                    {transaction.createdAt
                      ? new Date(transaction.createdAt).toLocaleDateString()
                      : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Transactions;
