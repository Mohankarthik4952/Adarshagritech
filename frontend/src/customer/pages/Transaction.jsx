// src/customer/pages/Transaction.jsx

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { FaMoneyBillWave, FaCheckCircle } from "react-icons/fa";

import { QRCodeCanvas } from "qrcode.react";

import API_URL from "../../config/api";

import "./customerpages.css";

const Transaction = () => {
  const navigate = useNavigate();

  /* =========================
     STATES
  ========================= */

  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);

  const [loading, setLoading] = useState(false);

  const [paymentApp, setPaymentApp] = useState("PHONEPE");

  const [utrNumber, setUtrNumber] = useState("");

  const [paymentProof, setPaymentProof] = useState(null);

  /* =========================
     COMPANY UPI
  ========================= */

  const upiId = "8499082784@ybl";

  const upiLink =
    `upi://pay?pa=${upiId}` +
    `&pn=Sunrise Agri Products` +
    `&am=${Number(total).toFixed(2)}` +
    `&cu=INR`;

  /* =========================
     LOAD PRODUCTS
  ========================= */

  useEffect(() => {
    const items = JSON.parse(localStorage.getItem("checkoutProducts")) || [];

    const storedAmount = Number(localStorage.getItem("transactionAmount") || 0);

    setProducts(items);

    if (storedAmount > 0) {
      setTotal(storedAmount);
    } else {
      const totalAmount = items.reduce(
        (sum, item) => sum + Number(item.price || item.finalPrice || 0),
        0,
      );

      setTotal(totalAmount);
    }

    return () => {
      setProducts([]);
    };
  }, []);

  /* =========================
     SUBMIT ORDER
  ========================= */

  const submitOrder = async () => {
    try {
      if (loading) return;

      const token =
        localStorage.getItem("customerToken") || localStorage.getItem("token");

      if (!token) {
        alert("Please login again");

        navigate("/customer/login");

        return;
      }

      if (products.length === 0) {
        alert("No products selected");

        return;
      }

      if (!utrNumber.trim()) {
        alert("Please enter UTR number");

        return;
      }

      if (utrNumber.trim().length < 10) {
        alert("UTR number must contain at least 10 characters");

        return;
      }

      if (!paymentProof) {
        alert("Please upload payment screenshot");

        return;
      }

      setLoading(true);

      let paymentProofPath = "";

      /* =========================
         UPLOAD SCREENSHOT
      ========================= */

      const formData = new FormData();

      formData.append("paymentProof", paymentProof);

      const uploadResponse = await fetch(`${API_URL}/api/payment/upload`, {
        method: "POST",

        headers: {
          Authorization: `Bearer ${token}`,
        },

        body: formData,
      });

      const uploadData = await uploadResponse.json();

      if (uploadResponse.status === 401) {
        localStorage.removeItem("customerToken");

        localStorage.removeItem("token");

        alert("Session expired. Please login again.");

        navigate("/customer/login");

        return;
      }

      if (!uploadResponse.ok) {
        throw new Error(uploadData.message || "Screenshot upload failed");
      }

      paymentProofPath = uploadData.filePath || uploadData.url || "";

      /* =========================
         CREATE ORDER
      ========================= */

      const response = await fetch(`${API_URL}/api/customer/orders`, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",

          Authorization: `Bearer ${token}`,
        },

        body: JSON.stringify({
          products,

          totalAmount: total,

          paymentType: "PAY_NOW",

          paymentApp,

          utrNumber: utrNumber.trim(),

          paymentProof: paymentProofPath,
        }),
      });

      const data = await response.json();

      if (response.status === 401) {
        localStorage.removeItem("customerToken");

        localStorage.removeItem("token");

        alert("Session expired. Please login again.");

        navigate("/customer/login");

        return;
      }

      if (!response.ok) {
        throw new Error(data.message || "Order submission failed");
      }

      alert(
        "Order submitted successfully ✅\n\nWaiting for admin verification.",
      );

      localStorage.removeItem("customerCart");

      localStorage.removeItem("checkoutProducts");

      localStorage.removeItem("transactionAmount");

      navigate("/customer/myorders");
    } catch (error) {
      console.error("CUSTOMER ORDER ERROR:", error);

      alert(error.message || "Order submission failed");
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     EMPTY STATE
  ========================= */

  if (products.length === 0) {
    return (
      <div className="empty-cart-page">
        <h2>No products selected</h2>
      </div>
    );
  }

  return (
    <div className="customer-transaction-page">
      <div className="page-header">
        <h1>
          <FaMoneyBillWave />
          Payment Summary
        </h1>

        <p>Review your selected products before payment</p>
      </div>

      <div className="transaction-table-wrapper">
        <table className="transaction-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Size</th>
              <th>Acres</th>
              <th>Quantity</th>
              <th>Price</th>
            </tr>
          </thead>

          <tbody>
            {products.map((product, index) => (
              <tr key={`${product.productId}-${product.size}-${index}`}>
                <td>{product.productName}</td>

                <td>{product.size}</td>

                <td>{product.acres}</td>

                <td>{product.quantity}</td>

                <td>
                  ₹
                  {Number(product.price || 0).toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="payment-summary-card">
        <div className="summary-row">
          <span>Total Products</span>

          <strong>{products.length}</strong>
        </div>

        <div className="summary-row">
          <span>Grand Total</span>

          <strong>
            ₹
            {Number(total).toLocaleString("en-IN", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </strong>
        </div>

        <div className="qr-payment-box">
          <h3>Scan & Pay</h3>

          <QRCodeCanvas value={upiLink} size={220} />

          <p>
            UPI ID:
            <strong>{upiId}</strong>
          </p>

          <p>
            Amount:
            <strong>
              ₹
              {Number(total).toLocaleString("en-IN", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </strong>
          </p>
        </div>

        <div className="payment-section">
          <label>Select Payment App</label>

          <select
            value={paymentApp}
            onChange={(e) => setPaymentApp(e.target.value)}
            className="payment-input"
          >
            <option value="PHONEPE">PhonePe</option>

            <option value="GPAY">Google Pay</option>

            <option value="PAYTM">Paytm</option>
          </select>

          <button
            type="button"
            className="open-upi-btn"
            onClick={() => window.open(upiLink)}
          >
            Open Payment App
          </button>
        </div>

        <div className="payment-section">
          <label>UTR Number</label>

          <input
            type="text"
            value={utrNumber}
            onChange={(e) => setUtrNumber(e.target.value)}
            placeholder="Enter UTR Number"
            className="payment-input"
          />
        </div>

        <div className="payment-section">
          <label>Payment Screenshot</label>

          <input
            type="file"
            accept="image/*"
            onChange={(e) => setPaymentProof(e.target.files?.[0] || null)}
            className="payment-input"
          />
        </div>

        <button className="pay-btn" onClick={submitOrder} disabled={loading}>
          <FaCheckCircle />

          {loading ? "Submitting..." : "Submit Order"}
        </button>
      </div>
    </div>
  );
};

export default Transaction;
