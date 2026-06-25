import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import API_URL from "../../config/api";

import "./dealerpages.css";

export default function DealerInvoices() {
  const navigate = useNavigate();

  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [downloadingId, setDownloadingId] = useState("");

  /* =================================
     FETCH INVOICES
  ================================= */

  const fetchInvoices = async () => {
    try {
      const token = localStorage.getItem("dealerToken");

      if (!token) {
        navigate("/dealer/login");
        return;
      }

      const res = await axios.get(`${API_URL}/api/dealer/invoices`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setInvoices(res.data.invoices || []);
    } catch (error) {
      console.error("INVOICE ERROR:", error);

      if (error.response?.status === 401) {
        localStorage.removeItem("dealerToken");

        alert("Session expired. Please login again.");

        navigate("/dealer/login");

        return;
      }

      alert(error.response?.data?.message || "Failed to load invoices");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  /* =================================
     VIEW INVOICE
  ================================= */

  const viewInvoice = (invoice) => {
    setSelectedInvoice(invoice);
  };

  const closeInvoice = () => {
    setSelectedInvoice(null);
  };

  /* =================================
     DOWNLOAD INVOICE
  ================================= */

  const downloadInvoice = async (invoiceId) => {
    try {
      const token = localStorage.getItem("dealerToken");

      if (!token) {
        navigate("/dealer/login");
        return;
      }

      setDownloadingId(invoiceId);

      const response = await axios.get(
        `${API_URL}/api/dealer/invoices/${invoiceId}/download`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.data.success || !response.data.pdfUrl) {
        throw new Error("PDF URL not found");
      }

      const pdfUrl = response.data.pdfUrl;

      window.open(
        pdfUrl.startsWith("http") ? pdfUrl : `${API_URL}${pdfUrl}`,
        "_blank",
      );
    } catch (error) {
      console.error("DOWNLOAD ERROR:", error);

      if (error.response?.status === 401) {
        localStorage.removeItem("dealerToken");

        alert("Session expired. Please login again.");

        navigate("/dealer/login");

        return;
      }

      alert(
        error.response?.data?.message ||
          error.message ||
          "Failed to download invoice",
      );
    } finally {
      setDownloadingId("");
    }
  };

  /* =================================
     LOADING
  ================================= */

  if (loading) {
    return (
      <div className="dealer-page">
        <h2>Loading Invoices...</h2>
      </div>
    );
  }

  return (
    <div className="dealer-page">
      <div className="page-header">
        <h1>My Invoices</h1>

        <p>View all generated invoices</p>
      </div>

      {invoices.length === 0 ? (
        <div className="dealer-empty-box">No invoices found</div>
      ) : (
        <div className="dealer-table-wrapper">
          <table className="dealer-table">
            <thead>
              <tr>
                <th>Invoice No</th>
                <th>Order No</th>
                <th>Payment Type</th>
                <th>Total Amount</th>
                <th>Paid Amount</th>
                <th>Balance Amount</th>
                <th>Invoice Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {invoices.map((invoice) => (
                <tr key={invoice._id || invoice.invoiceNo}>
                  <td>{invoice.invoiceNo}</td>

                  <td>{invoice.orderNo}</td>

                  <td>
                    <span className="dealer-approved-badge">
                      {invoice.paymentType?.replaceAll("_", " ") || "-"}
                    </span>
                  </td>

                  <td>
                    ₹{Number(invoice.grandTotal || 0).toLocaleString("en-IN")}
                  </td>

                  <td>
                    ₹{Number(invoice.paidAmount || 0).toLocaleString("en-IN")}
                  </td>

                  <td>
                    ₹
                    {Number(
                      invoice.balanceAmount ?? invoice.grandTotal ?? 0,
                    ).toLocaleString("en-IN")}
                  </td>

                  <td>
                    {invoice.invoiceStatus === "PAID" ? (
                      <span className="dealer-approved-badge">PAID</span>
                    ) : invoice.invoiceStatus === "PARTIALLY_PAID" ? (
                      <span className="dealer-processing-badge">
                        PARTIALLY PAID
                      </span>
                    ) : (
                      <span className="dealer-pending-badge">UNPAID</span>
                    )}
                  </td>

                  <td>
                    {invoice.createdAt
                      ? new Date(invoice.createdAt).toLocaleDateString()
                      : "-"}
                  </td>

                  <td>
                    <button
                      className="dealer-view-btn"
                      onClick={() => viewInvoice(invoice)}
                    >
                      View
                    </button>

                    <button
                      className="dealer-download-btn"
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
        <div className="invoice-modal-overlay">
          <div className="invoice-modal">
            <div className="invoice-modal-header">
              <h1 className="invoice-title">TAX INVOICE</h1>

              <button onClick={closeInvoice}>✕</button>
            </div>

            <div className="invoice-modal-body">
              <div className="invoice-info-section">
                <div>
                  <p>
                    <strong>Invoice No :</strong> {selectedInvoice.invoiceNo}
                  </p>

                  <p>
                    <strong>Payment Type :</strong>{" "}
                    {selectedInvoice.paymentType?.replaceAll("_", " ") || "-"}
                  </p>

                  <p>
                    <strong>Date :</strong>{" "}
                    {selectedInvoice.createdAt
                      ? new Date(selectedInvoice.createdAt).toLocaleDateString()
                      : "-"}
                  </p>
                </div>

                <div>
                  <p>
                    <strong>Order No :</strong> {selectedInvoice.orderNo}
                  </p>

                  <p>
                    <strong>Payment Status :</strong>{" "}
                    {selectedInvoice.paymentStatus}
                  </p>
                </div>
              </div>

              <hr />

              <div className="invoice-address-section">
                <div className="invoice-address-card">
                  <h3>From</h3>

                  <p>
                    <strong>Sunrise Agri Products</strong>
                  </p>

                  <p>
                    <strong>GST :</strong>{" "}
                    {selectedInvoice.companyGSTNumber || "37ARLPG5201F1Z3"}
                  </p>

                  <p>
                    <strong>Phone :</strong>{" "}
                    {selectedInvoice.companyPhoneNumber || "8341198888"}
                  </p>

                  <p>
                    <strong>Address :</strong>{" "}
                    {selectedInvoice.companyAddress ||
                      "Door No. 15-146, Gayathri Towers, Ground Floor, Shop No. 5, Side of Sub-Register office road, Nandigama, Krishna Dist, A.P. 522185"}
                  </p>

                  <h4>Bank Details</h4>

                  <p>
                    <strong>Account Number : </strong>
                    {"52950400000060"}
                  </p>
                  <p>
                    <strong>IFSC : </strong>
                    {"BARB0NANDIG	"}
                  </p>
                </div>

                <div className="invoice-address-card">
                  <h3>To</h3>

                  <p>
                    <strong>Dealer Name :</strong>{" "}
                    {selectedInvoice.dealerName || "-"}
                  </p>

                  <p>
                    <strong>Shop Name :</strong>{" "}
                    {selectedInvoice.shopName || "-"}
                  </p>

                  <p>
                    <strong>Dealer GST :</strong>{" "}
                    {selectedInvoice.dealerGSTNumber}
                  </p>

                  <p>
                    <strong>Phone :</strong>{" "}
                    {selectedInvoice.dealerPhoneNumber || "-"}
                  </p>
                </div>
              </div>

              <hr />

              <h3>Products</h3>

              <div className="invoice-products-wrapper">
                <table className="dealer-table invoice-products-table">
                  <thead>
                    <tr>
                      <th>S.No</th>
                      <th>Product</th>
                      <th>Size</th>
                      <th>No. Of Cases</th>
                      <th>Discount %</th>
                      <th>Final Price</th>
                    </tr>
                  </thead>

                  <tbody>
                    {(selectedInvoice.items || []).length > 0 ? (
                      selectedInvoice.items.map((item, index) => (
                        <tr key={`${item.productId}-${item.size}-${index}`}>
                          <td>{index + 1}</td>

                          <td>{item.productName}</td>

                          <td>{item.size || "-"}</td>

                          <td>{item.quantity || item.cases || 1}</td>

                          <td>{item.discount || 0}%</td>

                          <td>
                            ₹
                            {Number(item.finalPrice || 0).toLocaleString(
                              "en-IN",
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6">No products found</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="invoice-total-box">
                <h2>
                  Total Amount : ₹
                  {Number(selectedInvoice.grandTotal || 0).toLocaleString(
                    "en-IN",
                  )}
                </h2>

                <h3>
                  Paid Amount : ₹
                  {Number(selectedInvoice.paidAmount || 0).toLocaleString(
                    "en-IN",
                  )}
                </h3>

                <h3>
                  Current Invoice Balance : ₹
                  {Number(selectedInvoice.balanceAmount || 0).toLocaleString(
                    "en-IN",
                  )}
                </h3>

                <h3>
                  Invoice Status : {selectedInvoice.invoiceStatus || "UNPAID"}
                </h3>
              </div>

              <div className="invoice-footer">
                <p>Thank you for doing business with Sunrise Agri Products</p>

                <p>
                  Sunrise Agri Products Since
                  <strong> @2014</strong>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
