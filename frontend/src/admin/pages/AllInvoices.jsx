// src/admin/pages/AllInvoices.jsx

import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import API_URL from "../../config/api";

import "./adminpages.css";

export default function AllInvoices() {
  const navigate = useNavigate();

  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedInvoice, setSelectedInvoice] = useState(null);

  const [error, setError] = useState("");

  const [downloadingId, setDownloadingId] = useState("");

  /* =========================
     TOKEN CONFIG
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
     HANDLE SESSION EXPIRED
  ========================= */

  const handleUnauthorized = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("admin");
    localStorage.removeItem("adminAuth");

    alert("Session expired. Please login again.");

    navigate("/admin/login");
  };

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
     FETCH INVOICES
  ========================= */

  const fetchInvoices = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("adminToken");

      if (!token) {
        handleUnauthorized();
        return;
      }

      const response = await axios.get(
        `${API_URL}/api/admin/invoices`,
        getConfig(),
      );

      const data = response.data;

      const safeInvoices = Array.isArray(data?.invoices) ? data.invoices : [];

      safeInvoices.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
      );

      setInvoices(safeInvoices);
    } catch (error) {
      console.error("FETCH INVOICES ERROR:", error);

      if (error.response?.status === 401) {
        handleUnauthorized();
        return;
      }

      setError(
        error.response?.data?.message ||
          error.message ||
          "Failed to load invoices",
      );

      setInvoices([]);
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  /* =========================
     CLOSE MODAL
  ========================= */

  const closeInvoice = () => {
    setSelectedInvoice(null);
  };

  /* =========================
     DOWNLOAD PDF
  ========================= */

  const downloadInvoice = async (invoiceId) => {
    try {
      setDownloadingId(invoiceId);

      const response = await axios.get(
        `${API_URL}/api/admin/invoices/${invoiceId}/download`,
        getConfig(),
      );

      if (response.status === 401) {
        handleUnauthorized();
        return;
      }

      if (!response.data.success || !response.data.pdfUrl) {
        throw new Error("Invoice PDF not found");
      }

      window.open(getFileUrl(response.data.pdfUrl), "_blank");
    } catch (error) {
      console.error("DOWNLOAD ERROR:", error);

      alert(
        error.response?.data?.message ||
          error.message ||
          "Failed to download invoice",
      );
    } finally {
      setDownloadingId("");
    }
  };

  /* =========================
     HELPERS
  ========================= */

  const formatCurrency = (amount) => {
    return Number(amount || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString("en-IN");
  };

  /* =========================
     LOADING
  ========================= */

  if (loading) {
    return (
      <div className="admin-page">
        <div className="loading-box">
          <h2>Loading invoices...</h2>
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
          <h3>{error}</h3>

          <button className="retry-btn" onClick={fetchInvoices}>
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
          <h1>All Invoices</h1>

          <p>Manage all dealer and customer invoices</p>
        </div>

        <button className="refresh-btn" onClick={fetchInvoices}>
          Refresh
        </button>
      </div>

      {invoices.length === 0 ? (
        <div className="empty-box">
          <h3>No invoices found</h3>
        </div>
      ) : (
        <div className="table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Invoice No</th>
                <th>Order No</th>
                <th>Role</th>
                <th>Name</th>
                <th>Total</th>
                <th>Payment Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {invoices.map((invoice) => (
                <tr key={invoice._id}>
                  <td>{invoice.invoiceNo || "-"}</td>

                  <td>{invoice.orderNo || "-"}</td>

                  <td>{invoice.role || "-"}</td>

                  <td>
                    {invoice.role === "DEALER"
                      ? invoice.dealerName || invoice.shopName || "-"
                      : invoice.customerName || "-"}
                  </td>

                  <td>₹{formatCurrency(invoice.grandTotal)}</td>

                  <td>
                    <span
                      className={`invoice-status-badge ${
                        invoice.paymentStatus === "RECEIVED"
                          ? "paid"
                          : invoice.paymentStatus === "PARTIAL"
                            ? "partial"
                            : "pending"
                      }`}
                    >
                      {invoice.paymentStatus || "PENDING"}
                    </span>
                  </td>

                  <td>{formatDate(invoice.createdAt)}</td>

                  <td className="action-buttons">
                    <button
                      className="admin-view-btn"
                      onClick={() => setSelectedInvoice(invoice)}
                    >
                      View
                    </button>

                    <button
                      className="admin-download-btn"
                      disabled={downloadingId === invoice._id}
                      onClick={() => downloadInvoice(invoice._id)}
                    >
                      {downloadingId === invoice._id
                        ? "Downloading..."
                        : "Download"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedInvoice && (
        <div className="invoice-modal-overlay" onClick={closeInvoice}>
          <div
            className="invoice-modal admin-invoice-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="invoice-modal-header">
              <h1 className="invoice-title">INVOICE</h1>

              <button className="invoice-close-btn" onClick={closeInvoice}>
                ✕
              </button>
            </div>

            <div className="invoice-modal-body">
              <div className="invoice-info-section">
                <div>
                  <p>
                    <strong>Invoice No :</strong>{" "}
                    {selectedInvoice.invoiceNo || "-"}
                  </p>

                  <p>
                    <strong>Date :</strong>{" "}
                    {formatDate(selectedInvoice.createdAt)}
                  </p>
                </div>

                <div>
                  <p>
                    <strong>Order No :</strong> {selectedInvoice.orderNo || "-"}
                  </p>

                  <p>
                    <strong>Role :</strong> {selectedInvoice.role || "-"}
                  </p>

                  <p>
                    <strong>Payment Status :</strong>{" "}
                    {selectedInvoice.paymentStatus || "-"}
                  </p>
                </div>
              </div>

              <hr />

              <div className="invoice-address-section">
                <div className="invoice-address-card">
                  <h3>From</h3>

                  <p>
                    <strong>
                      {selectedInvoice.companyName || "Sunrise Agri Products"}
                    </strong>
                  </p>

                  <p>GST : {selectedInvoice.companyGSTNumber || "-"}</p>

                  {selectedInvoice.companyPhoneNumber && (
                    <p>{selectedInvoice.companyPhoneNumber}</p>
                  )}

                  {selectedInvoice.companyAddress && (
                    <p>{selectedInvoice.companyAddress}</p>
                  )}
                </div>

                <div className="invoice-address-card">
                  <h3>To</h3>

                  {selectedInvoice.role === "DEALER" ? (
                    <>
                      <p>
                        <strong>Dealer Name :</strong>{" "}
                        {selectedInvoice.dealerName || "-"}
                      </p>

                      <p>
                        <strong>Shop Name :</strong>{" "}
                        {selectedInvoice.shopName || "-"}
                      </p>

                      <p>
                        <strong>GST Number :</strong>{" "}
                        {selectedInvoice.dealerGSTNumber || "-"}
                      </p>

                      <p>
                        <strong>Phone :</strong>{" "}
                        {selectedInvoice.dealerPhoneNumber || "-"}
                      </p>
                    </>
                  ) : (
                    <>
                      <p>
                        <strong>Customer Name :</strong>{" "}
                        {selectedInvoice.customerName || "-"}
                      </p>

                      <p>
                        <strong>Phone :</strong>{" "}
                        {selectedInvoice.customerPhoneNumber || "-"}
                      </p>

                      <p>
                        <strong>Village :</strong>{" "}
                        {selectedInvoice.customerVillage || "-"}
                      </p>

                      <p>
                        <strong>Pincode :</strong>{" "}
                        {selectedInvoice.customerPincode || "-"}
                      </p>

                      <p>
                        <strong>Near Bus Stand :</strong>{" "}
                        {selectedInvoice.customerNearBusStand || "-"}
                      </p>
                    </>
                  )}
                </div>
              </div>

              <hr />

              <h3>Products</h3>

              <table className="admin-table invoice-products-table">
                <thead>
                  <tr>
                    <th>S.No</th>
                    <th>Product</th>
                    <th>Size</th>
                    <th>MRP</th>
                    <th>Discount %</th>
                    <th>Quantity</th>
                    <th>Final Price</th>
                  </tr>
                </thead>

                <tbody>
                  {(selectedInvoice.items || []).length > 0 ? (
                    selectedInvoice.items.map((item, index) => (
                      <tr key={index}>
                        <td>{index + 1}</td>

                        <td>{item.productName || "-"}</td>

                        <td>{item.size || "-"}</td>

                        <td>₹{formatCurrency(item.mrp)}</td>

                        <td>
                          {Number(item.discountPercent || item.discount || 0)}%
                        </td>

                        <td>{item.quantity || item.cases || 1}</td>

                        <td>₹{formatCurrency(item.finalPrice)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7">No products found</td>
                    </tr>
                  )}
                </tbody>
              </table>

              <div className="invoice-total-box">
                <h2>
                  Total Amount : ₹{formatCurrency(selectedInvoice.grandTotal)}
                </h2>
              </div>

              <div className="invoice-footer">
                <p>Thank you for choosing Sunrise Agri Products</p>

                <p>
                  Sunrise Agri Products <strong>© 2014</strong>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
