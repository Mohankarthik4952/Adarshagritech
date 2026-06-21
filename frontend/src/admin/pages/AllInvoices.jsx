import { useEffect, useState } from "react";
import axios from "axios";

import API_URL from "../../config/api";

import "./adminpages.css";

export default function AllInvoices() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      const token = localStorage.getItem("adminToken");

      const res = await axios.get(`${API_URL}/api/admin/invoices`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setInvoices(res.data.invoices || []);
    } catch (error) {
      console.error("FETCH INVOICES ERROR:", error);

      alert(
        error.response?.data?.message ||
          error.message ||
          "Failed to load invoices",
      );
    } finally {
      setLoading(false);
    }
  };

  const closeInvoice = () => {
    setSelectedInvoice(null);
  };

  const downloadInvoice = async (invoiceId) => {
    try {
      const token = localStorage.getItem("adminToken");

      const response = await axios.get(
        `${API_URL}/api/admin/invoices/${invoiceId}/download`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.data.success || !response.data.pdfUrl) {
        throw new Error("PDF URL not found");
      }

      window.open(`${API_URL}${response.data.pdfUrl}`, "_blank");
    } catch (error) {
      console.error("DOWNLOAD ERROR:", error);

      alert(
        error.response?.data?.message ||
          error.message ||
          "Failed to download invoice",
      );
    }
  };

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

  if (loading) {
    return (
      <div className="admin-page">
        <h2>Loading Invoices...</h2>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="page-header">
        <h1>All Invoices</h1>
        <p>Manage all dealer and customer invoices</p>
      </div>

      {invoices.length === 0 ? (
        <div className="empty-box">No invoices found</div>
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
                      ? invoice.dealerName || "-"
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

                  <td>
                    <button
                      className="admin-view-btn"
                      onClick={() => setSelectedInvoice(invoice)}
                    >
                      View
                    </button>

                    <button
                      className="admin-download-btn"
                      onClick={() => downloadInvoice(invoice._id)}
                    >
                      Download
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

              <button onClick={closeInvoice}>✕</button>
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
