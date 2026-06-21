import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import API_URL from "../../config/api";

import "./dealerpages.css";

export default function DealerReturnProducts() {
  const [products, setProducts] = useState([]);
  const [requests, setRequests] = useState([]);
  const [remarks, setRemarks] = useState("");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [returnWindowOpen, setReturnWindowOpen] = useState(false);
  const [financialYear, setFinancialYear] = useState("");

  const token = localStorage.getItem("dealerToken");

  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      const [productsRes, requestsRes] = await Promise.all([
        axios.get(`${API_URL}/api/dealer/returns/orders`, config),

        axios.get(`${API_URL}/api/dealer/returns/my-requests`, config),
      ]);

      setProducts(
        (productsRes.data.products || []).map((item) => ({
          ...item,
          returnQuantity: "",
        })),
      );

      setReturnWindowOpen(productsRes.data.isReturnWindowOpen || false);

      setFinancialYear(productsRes.data.financialYear || "");

      setRequests(requestsRes.data.requests || []);
    } catch (error) {
      console.error("RETURN PAGE ERROR:", error);

      alert(error.response?.data?.message || "Failed to load return products");
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = (index, value) => {
    const updated = [...products];

    let qty = Number(value);

    if (qty < 0) qty = 0;

    if (qty > updated[index].availableToReturn) {
      qty = updated[index].availableToReturn;
    }

    updated[index].returnQuantity = qty;

    setProducts(updated);
  };

  const selectedItems = useMemo(() => {
    return products
      .filter((item) => Number(item.returnQuantity || 0) > 0)
      .map((item) => ({
        productId: item.productId,
        productName: item.productName,
        size: item.size,
        orderedBottles: item.orderedBottles,
        availableToReturn: item.availableToReturn,
        returnQuantity: Number(item.returnQuantity),

        pricePerBottle: Number(item.pricePerBottle || 0),
        discountPercent: Number(item.discountPercent || 0),
        gstPercent: Number(item.gstPercent || 0),
      }));
  }, [products]);

  const calculatePriceWithGst = (
    pricePerBottle,
    discountPercent,
    gstPercent,
  ) => {
    const price = Number(pricePerBottle || 0);
    const discount = Number(discountPercent || 0);
    const gst = Number(gstPercent || 0);

    const discountedPrice = price - (price * discount) / 100;

    return discountedPrice + (discountedPrice * gst) / 100;
  };

  const estimatedReturnAmount = useMemo(() => {
    return selectedItems.reduce((sum, item) => {
      const priceWithGst = calculatePriceWithGst(
        item.pricePerBottle,
        item.discountPercent,
        item.gstPercent,
      );

      return sum + priceWithGst * Number(item.returnQuantity || 0);
    }, 0);
  }, [selectedItems]);

  const submitReturn = async () => {
    if (!selectedItems.length) {
      alert("Enter return quantity");

      return;
    }

    try {
      setSubmitting(true);

      const response = await axios.post(
        `${API_URL}/api/dealer/returns`,
        {
          items: selectedItems,
          remarks,
        },
        config,
      );

      alert(response.data.message || "Return request submitted successfully");

      setRemarks("");

      await loadData();
    } catch (error) {
      console.error(error);

      alert(error.response?.data?.message || "Failed to submit request");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="return-page">
        <div className="return-loading">Loading return products...</div>
      </div>
    );
  }

  return (
    <div className="return-page">
      <div className="return-header">
        <h2>Return Products</h2>

        {financialYear && (
          <span className="financial-year-badge">FY {financialYear}</span>
        )}
      </div>

      {!returnWindowOpen && (
        <div className="return-warning">
          Product returns are allowed only from March 1 to May 31.
        </div>
      )}

      {products.length === 0 ? (
        <div className="empty-return-products">
          No products available for return.
        </div>
      ) : (
        <>
          <div className="return-summary">
            <div className="summary-card">
              <span>Total Products</span>
              <strong>{products.length}</strong>
            </div>

            <div className="summary-card">
              <span>Selected Items</span>
              <strong>{selectedItems.length}</strong>
            </div>

            <div className="summary-card">
              <span>Estimated Return Value</span>
              <strong>
                ₹
                {estimatedReturnAmount.toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </strong>
            </div>
          </div>

          <div className="return-table-wrapper">
            <table className="return-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Size</th>
                  <th>Ordered Bottles</th>
                  <th>Price + GST</th>
                  <th>Return Bottles</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {products.map((item, index) => {
                  const priceWithGst = calculatePriceWithGst(
                    item.pricePerBottle,
                    item.discountPercent,
                    item.gstPercent,
                  );

                  return (
                    <tr key={item.productKey}>
                      <td>{item.productName}</td>

                      <td>{item.size}</td>

                      <td>{item.availableToReturn}</td>

                      <td>
                        ₹
                        {priceWithGst.toLocaleString("en-IN", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </td>

                      <td>
                        <input
                          className="return-input"
                          type="number"
                          min="0"
                          max={item.availableToReturn}
                          disabled={item.pending || !returnWindowOpen}
                          value={item.returnQuantity || ""}
                          onChange={(e) =>
                            updateQuantity(index, e.target.value)
                          }
                        />
                      </td>

                      <td>
                        <span
                          className={
                            item.pending ? "status-pending" : "status-available"
                          }
                        >
                          {item.pending ? "Pending Approval" : "Available"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <textarea
            className="return-remarks"
            placeholder="Enter remarks (optional)"
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
          />

          <button
            className="return-submit-btn"
            disabled={!returnWindowOpen || !selectedItems.length || submitting}
            onClick={submitReturn}
          >
            {submitting ? "Submitting..." : "Submit Return Request"}
          </button>
        </>
      )}

      <div className="request-history">
        <h3>My Return Requests</h3>

        <div className="return-table-wrapper">
          <table className="return-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Products</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Invoice</th>
              </tr>
            </thead>

            <tbody>
              {requests.length === 0 ? (
                <tr>
                  <td colSpan="5" className="empty-cell">
                    No return requests found
                  </td>
                </tr>
              ) : (
                requests.map((request) => (
                  <tr key={request._id}>
                    <td>{new Date(request.createdAt).toLocaleDateString()}</td>

                    <td>{request.items?.length || 0}</td>

                    <td>
                      ₹
                      {Number(request.totalAmount || 0).toLocaleString("en-IN")}
                    </td>

                    <td>
                      <span
                        className={`status-${request.approvalStatus?.toLowerCase()}`}
                      >
                        {request.approvalStatus}
                      </span>
                    </td>

                    <td>
                      {request.returnInvoiceId?.pdfUrl ? (
                        <a
                          className="download-link"
                          href={`${API_URL}${request.returnInvoiceId.pdfUrl}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Download
                        </a>
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
    </div>
  );
}
