import { useEffect, useState } from "react";
import { FaMoneyCheckAlt, FaCheckCircle, FaClock } from "react-icons/fa";
import "./customerpages.css";

const TransactionHistory = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadTransactions = async () => {
      try {
        setLoading(true);

        const token =
          localStorage.getItem("customerToken") ||
          localStorage.getItem("token");

        const res = await fetch(
          "http://localhost:5000/api/customer/payments/history",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const data = await res.json();

        console.log("CUSTOMER PAYMENT HISTORY:", data);

        if (data.success) {
          setTransactions(data.payments || []);
        } else {
          setTransactions([]);
        }
      } catch (error) {
        console.error("Transaction fetch error:", error);
        setError("Failed to load transactions");
        setTransactions([]);
      } finally {
        setLoading(false);
      }
    };

    loadTransactions();
  }, []);

  const totalAmount = transactions.reduce(
    (sum, tx) => sum + Number(tx.amount || 0),
    0,
  );

  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="loading-box">
        <h2>Loading transactions...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="loading-box">
        <h2>{error}</h2>
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
              <h3>Total Amount Paid</h3>
              <h2>₹{totalAmount.toFixed(2)}</h2>
            </div>
          </div>

          <div className="transactions-table-wrapper">
            <table className="transactions-table">
              <thead>
                <tr>
                  <th>Order No</th>
                  <th>Amount</th>
                  <th>Payment App</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {transactions.map((tx) => (
                  <tr key={tx._id}>
                    <td>{tx.orderId?.orderNo || "N/A"}</td>

                    <td>₹{Number(tx.amount || 0).toFixed(2)}</td>

                    <td>{tx.paymentApp || "-"}</td>

                    <td>{formatDate(tx.paymentDate || tx.createdAt)}</td>

                    <td>
                      <span
                        className={`transaction-badge ${
                          tx.status === "APPROVED" ? "completed" : "pending"
                        }`}
                      >
                        {tx.status === "APPROVED" ? (
                          <>
                            <FaCheckCircle />
                            Approved
                          </>
                        ) : (
                          <>
                            <FaClock />
                            {tx.status}
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
