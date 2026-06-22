import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import "./adminpages.css";
import API_URL from "../../config/api";

export default function AdminReturnRequests() {
  const navigate = useNavigate();

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState("");
  const [error, setError] = useState("");

  /* =========================
     CONFIG
  ========================= */

  const getConfig = () => {
    const token = localStorage.getItem("adminToken");

    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  };

  /* =========================
     FILE URL
  ========================= */

  const getFileUrl = (path) => {
    if (!path) return "#";

    if (path.startsWith("http")) {
      return path;
    }

    return `${API_URL}${path}`;
  };

  /* =========================
     LOAD REQUESTS
  ========================= */

  const loadRequests = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("adminToken");

      if (!token) {
        localStorage.removeItem("adminToken");

        alert("Admin session expired");

        navigate("/admin/login");

        return;
      }

      const response = await axios.get(
        `${API_URL}/api/admin/returns`,
        getConfig(),
      );

      if (response.data?.success) {
        setRequests(
          Array.isArray(response.data.requests) ? response.data.requests : [],
        );
      } else {
        setRequests([]);
      }
    } catch (error) {
      console.error("LOAD RETURN REQUESTS ERROR:", error);

      if (error.response?.status === 401) {
        localStorage.removeItem("adminToken");

        alert("Session expired. Please login again.");

        navigate("/admin/login");

        return;
      }

      setError(
        error.response?.data?.message ||
          error.message ||
          "Failed to load return requests",
      );

      setRequests([]);
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  /* =========================
     APPROVE
  ========================= */

  const approveRequest = async (id) => {
    const confirmed = window.confirm("Approve this return request?");

    if (!confirmed) return;

    try {
      setActionLoading(id);

      await axios.put(
        `${API_URL}/api/admin/returns/${id}/approve`,
        {},
        getConfig(),
      );

      alert("Return request approved successfully");

      loadRequests();
    } catch (error) {
      console.error("APPROVE ERROR:", error);

      alert(
        error.response?.data?.message ||
          error.message ||
          "Failed to approve request",
      );
    } finally {
      setActionLoading("");
    }
  };

  /* =========================
     REJECT
  ========================= */

  const rejectRequest = async (id) => {
    const rejectionReason = prompt("Enter rejection reason");

    if (rejectionReason === null) return;

    if (!rejectionReason.trim()) {
      alert("Rejection reason is required");

      return;
    }

    try {
      setActionLoading(id);

      await axios.put(
        `${API_URL}/api/admin/returns/${id}/reject`,
        {
          rejectionReason: rejectionReason.trim(),
        },
        getConfig(),
      );

      alert("Return request rejected");

      loadRequests();
    } catch (error) {
      console.error("REJECT ERROR:", error);

      alert(
        error.response?.data?.message ||
          error.message ||
          "Failed to reject request",
      );
    } finally {
      setActionLoading("");
    }
  };

  /* =========================
     LOADING
  ========================= */

  if (loading) {
    return <div className="admin-return-page">Loading return requests...</div>;
  }

  /* =========================
     ERROR
  ========================= */

  if (error) {
    return (
      <div className="admin-return-page">
        <div className="error-box">
          <h3>{error}</h3>

          <button onClick={loadRequests}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-return-page">
      <div className="page-header">
        <h2>Return Products</h2>
      </div>

      <div className="admin-table-wrapper">
        <table className="admin-return-table">
          <thead>
            <tr>
              <th>S.No</th>
              <th>Dealer</th>
              <th>Shop Name</th>
              <th>Products</th>
              <th>Total Amount</th>
              <th>Status</th>
              <th>Invoice</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {requests.length === 0 ? (
              <tr>
                <td colSpan="8">No return requests found</td>
              </tr>
            ) : (
              requests.map((request, index) => (
                <tr key={request._id}>
                  <td>{index + 1}</td>

                  <td>{request.dealerName || request.dealerId?.name || "-"}</td>

                  <td>
                    {request.shopName || request.dealerId?.shopName || "-"}
                  </td>

                  <td>
                    {(request.items || [])
                      .map(
                        (item) =>
                          `${item.productName} (${item.returnQuantity})`,
                      )
                      .join(", ")}
                  </td>

                  <td>
                    ₹
                    {Number(request.totalAmount || 0).toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </td>

                  <td>
                    <span
                      className={`status-badge ${
                        request.approvalStatus?.toLowerCase() || ""
                      }`}
                    >
                      {request.approvalStatus || "-"}
                    </span>
                  </td>

                  <td>
                    {request.returnInvoiceId?.pdfUrl ? (
                      <a
                        href={getFileUrl(request.returnInvoiceId.pdfUrl)}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Download
                      </a>
                    ) : (
                      "-"
                    )}
                  </td>

                  <td>
                    {request.approvalStatus === "PENDING" ? (
                      <div className="action-buttons">
                        <button
                          className="approve-btn"
                          disabled={actionLoading === request._id}
                          onClick={() => approveRequest(request._id)}
                        >
                          {actionLoading === request._id
                            ? "Processing..."
                            : "Approve"}
                        </button>

                        <button
                          className="reject-btn"
                          disabled={actionLoading === request._id}
                          onClick={() => rejectRequest(request._id)}
                        >
                          {actionLoading === request._id
                            ? "Processing..."
                            : "Reject"}
                        </button>
                      </div>
                    ) : (
                      "-"
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
