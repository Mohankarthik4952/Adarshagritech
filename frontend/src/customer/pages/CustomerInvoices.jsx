import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import API_URL from "../../config/api";

import "./customerpages.css";

export default function CustomerInvoices() {
  const navigate = useNavigate();

  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  useEffect(() => {
    fetchInvoices();
  }, []);

  /* =========================
     FETCH INVOICES
  ========================= */

  const fetchInvoices = async () => {
    try {
      setLoading(true);

      const token =
        localStorage.getItem("customerToken") || localStorage.getItem("token");

      if (!token) {
        navigate("/customer/login");
        return;
      }

      const res = await axios.get(`${API_URL}/api/customer/invoices`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.status === 401) {
        localStorage.removeItem("customerToken");
        localStorage.removeItem("token");

        alert("Session expired. Please login again.");

        navigate("/customer/login");

        return;
      }

      if (res.data.success) {
        setInvoices(res.data.invoices || []);
      } else {
        setInvoices([]);
      }
    } catch (error) {
      console.error("FETCH INVOICES ERROR:", error.response?.data || error);

      if (error.response?.status === 401) {
        localStorage.removeItem("customerToken");
        localStorage.removeItem("token");

        alert("Session expired. Please login again.");

        navigate("/customer/login");

        return;
      }

      alert(error.response?.data?.message || "Failed to load invoices");

      setInvoices([]);
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     FORMATTERS
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
     DOWNLOAD INVOICE
  ========================= */

  const downloadInvoice = (invoice) => {
    const pdfUrl = invoice.pdfUrl || invoice.invoicePdf || invoice.invoiceFile;

    if (!pdfUrl) {
      alert("Invoice PDF not available");

      return;
    }

    const finalUrl = pdfUrl.startsWith("http") ? pdfUrl : `${API_URL}${pdfUrl}`;

    window.open(finalUrl, "_blank");
  };

  /* =========================
     LOADING
  ========================= */

  if (loading) {
    return (
      <div className="customer-page">
        <div className="loading-box">
          <h2>Loading invoices...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="customer-page">
      <div className="page-header">
        <h1>My Invoices</h1>

        <p>View all generated invoices</p>
      </div>

      {invoices.length === 0 ? (
        <div className="customer-empty-box">
          <h2>No invoices found</h2>
        </div>
      ) : (
        <div className="customer-table-container">
          <table className="customer-table">
            <thead>
              <tr>
                <th>Invoice No</th>
                <th>Order No</th>
                <th>Type</th>
                <th>Total</th>
                <th>Status</th>
                <th>Date</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {invoices.map((invoice) => (
                <tr key={invoice._id}>
                  <td>{invoice.invoiceNo || "-"}</td>

                  <td>{invoice.orderNo || "-"}</td>

                  <td>
                    <span
                      className={
                        invoice.invoiceType === "FINAL"
                          ? "customer-final-badge"
                          : "customer-proforma-badge"
                      }
                    >
                      {invoice.invoiceType || "-"}
                    </span>
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

                  <td>
                    <div
                      style={{
                        display: "flex",
                        gap: "10px",
                        flexWrap: "wrap",
                      }}
                    >
                      <button
                        className="customer-view-btn"
                        onClick={() => setSelectedInvoice(invoice)}
                      >
                        View
                      </button>

                      {(invoice.pdfUrl ||
                        invoice.invoicePdf ||
                        invoice.invoiceFile) && (
                        <button
                          className="customer-view-btn"
                          onClick={() => downloadInvoice(invoice)}
                        >
                          Download
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedInvoice && (
        <div
          className="invoice-modal-overlay"
          onClick={() => setSelectedInvoice(null)}
        >
          <div className="invoice-modal" onClick={(e) => e.stopPropagation()}>
            <div className="invoice-modal-header">
              <h1 className="invoice-title">INVOICE</h1>

              <button
                className="invoice-close-btn"
                onClick={() => setSelectedInvoice(null)}
              >
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
                    <strong>Invoice Type :</strong>{" "}
                    {selectedInvoice.invoiceType || "-"}
                  </p>
                </div>

                <div>
                  <p>
                    <strong>Order No :</strong> {selectedInvoice.orderNo || "-"}
                  </p>

                  <p>
                    <strong>Date :</strong>{" "}
                    {formatDate(selectedInvoice.createdAt)}
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

                  {selectedInvoice.companyAddress && (
                    <p>{selectedInvoice.companyAddress}</p>
                  )}

                  {selectedInvoice.companyPhoneNumber && (
                    <p>{selectedInvoice.companyPhoneNumber}</p>
                  )}
                </div>

                <div className="invoice-address-card">
                  <h3>To</h3>

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
                </div>
              </div>

              <hr />

              <h3>Products</h3>

              <table className="customer-table invoice-products-table">
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
                      <tr key={`${item.productId}-${item.size}-${index}`}>
                        <td>{index + 1}</td>

                        <td>{item.productName || "-"}</td>

                        <td>{item.size || "-"}</td>

                        <td>₹{formatCurrency(item.mrp)}</td>

                        <td>
                          {Number(item.discountPercent || item.discount || 0)}%
                        </td>

                        <td>{item.quantity || 1}</td>

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
                <p>Thank you for purchasing from us.</p>

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
