import { useEffect, useState } from "react";
import { FaMoneyBillWave, FaCheckCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
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

    setProducts(items);

    const totalAmount = items.reduce(
      (sum, item) => sum + Number(item.price || 0),
      0,
    );

    setTotal(totalAmount);

    return () => {
      setProducts([]);
    };
  }, []);

  /* =========================
     SUBMIT ORDER
  ========================= */

  const submitOrder = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("customerToken");

      if (!token) {
        alert("Please login again");
        navigate("/customer/login");
        return;
      }

      if (!paymentProof) {
        alert("Please upload payment screenshot");
        return;
      }

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

      if (!uploadResponse.ok) {
        throw new Error(uploadData.message || "Screenshot upload failed");
      }

      paymentProofPath = uploadData.filePath;

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

          paymentProof: paymentProofPath,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Order submission failed");
      }

      alert("Order Submitted Successfully. Waiting for Admin Verification.");

      localStorage.removeItem("customerCart");

      localStorage.removeItem("checkoutProducts");

      navigate("/customer/myorders");
    } catch (error) {
      console.error(error);

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
      {/* HEADER */}

      <div className="page-header">
        <h1>
          <FaMoneyBillWave />
          Payment Summary
        </h1>

        <p>Review your selected products before payment</p>
      </div>

      {/* TABLE */}

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
              <tr key={index}>
                <td>{product.productName}</td>

                <td>{product.size}</td>

                <td>{product.acres}</td>

                <td>{product.quantity}</td>

                <td>₹{Number(product.price || 0).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* SUMMARY */}

      <div className="payment-summary-card">
        <div className="summary-row">
          <span>Total Products</span>

          <strong>{products.length}</strong>
        </div>

        <div className="summary-row">
          <span>Grand Total</span>

          <strong>₹{total.toFixed(2)}</strong>
        </div>

        {/* QR CODE */}

        <div className="qr-payment-box">
          <h3>Scan & Pay</h3>

          <QRCodeCanvas value={upiLink} size={220} />

          <p>
            UPI ID:
            <strong>{upiId}</strong>
          </p>

          <p>
            Amount:
            <strong>₹{total.toFixed(2)}</strong>
          </p>
        </div>

        {/* PAYMENT APP */}

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

        {/* SCREENSHOT */}

        <div className="payment-section">
          <label>Payment Screenshot</label>

          <input
            type="file"
            accept="image/*"
            onChange={(e) => setPaymentProof(e.target.files[0])}
            className="payment-input"
          />
        </div>

        {/* SUBMIT */}

        <button className="pay-btn" onClick={submitOrder} disabled={loading}>
          <FaCheckCircle />

          {loading ? "Submitting..." : "Submit Order"}
        </button>
      </div>
    </div>
  );
};

export default Transaction;
