import { useEffect, useState } from "react";
import { FaMoneyBillWave, FaCheckCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { QRCodeCanvas } from "qrcode.react";
import API_URL from "../../config/api";
import "./dealerpages.css";

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
  const [paymentType, setPaymentType] = useState("PAY_NOW");

  const [cashReceivedBy, setCashReceivedBy] = useState("");

  const [cashRemarks, setCashRemarks] = useState("");
  const [paymentMode, setPaymentMode] = useState(
    localStorage.getItem("paymentMode") || "PAY_NOW",
  );

  const selectedOrderId = localStorage.getItem("selectedOrderId");
  const isExistingOrder = !!selectedOrderId;

  const upiId = "Q037821057@ybl";

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
      (sum, item) =>
        sum + Number(item.finalPrice || item.totalPrice || item.price || 0),
      0,
    );

    setTotal(totalAmount);

    return () => {
      setProducts([]);
    };
  }, []);

  const clearCheckoutData = () => {
    localStorage.removeItem("dealerCart");
    localStorage.removeItem("checkoutProducts");
    localStorage.removeItem("transactionAmount");
    localStorage.removeItem("paymentMode");
    localStorage.removeItem("selectedOrderId");
  };

  /* =========================
     PAY NOW
  ========================= */

  const startPayment = async () => {
    if (loading) return;
    try {
      setLoading(true);

      const token = localStorage.getItem("dealerToken");

      if (!token) {
        alert("Please login again");
        navigate("/dealer/login");
        return;
      }

      if (paymentType === "PAY_NOW") {
        if (!utrNumber || utrNumber.trim().length < 10) {
          alert("UTR number must be minimum 10 characters");
          return;
        }
      }

      if (paymentType === "PAY_CASH") {
        if (!cashReceivedBy.trim()) {
          alert("Please enter cash received person name");
          return;
        }
      }

      let paymentProofPath = "";

      /* =========================
       UPLOAD SCREENSHOT
    ========================= */

      if (paymentProof) {
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
          localStorage.removeItem("dealerToken");

          alert("Session expired. Please login again.");

          navigate("/dealer/login");

          return;
        }

        if (!uploadResponse.ok) {
          throw new Error(uploadData.message || "Screenshot upload failed");
        }

        paymentProofPath = uploadData.filePath;
      }

      /* =========================
       EXISTING ORDER PAYMENT
    ========================= */

      if (selectedOrderId) {
        const response = await fetch(
          `${API_URL}/api/dealer/payment/pay-existing-order`,
          {
            method: "POST",

            headers: {
              "Content-Type": "application/json",

              Authorization: `Bearer ${token}`,
            },

            body: JSON.stringify({
              orderId: selectedOrderId,

              paymentApp,

              utrNumber,

              paymentProof: paymentProofPath,

              cashReceivedBy,

              cashRemarks,
            }),
          },
        );

        const data = await response.json();
        if (response.status === 401) {
          localStorage.removeItem("dealerToken");

          alert("Session expired. Please login again.");

          navigate("/dealer/login");

          return;
        }

        if (!response.ok) {
          throw new Error(data.message || "Payment failed");
        }

        alert(
          "Payment submitted successfully. Waiting for admin verification.",
        );
      } else {
        /* =========================
         NEW ORDER PAYMENT
      ========================= */

        const response = await fetch(`${API_URL}/api/dealer/payment/checkout`, {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            products: products.map((item) => ({
              productId: item.productId || item._id,

              productName: item.productName || item.name || "",

              size: item.size || "",

              cases: Number(item.cases || 1),

              bottlesPerCase: Number(item.bottlesPerCase || 1),

              mrp: Number(item.mrp || 0),

              price: Number(item.price || item.pricePerBottle || item.mrp || 0),

              discount: Number(item.discount || item.discountPercent || 0),

              finalPrice: Number(item.finalPrice || item.totalPrice || 0),
            })),

            totalAmount: Number(total),

            paymentType,

            paymentApp,

            utrNumber,

            paymentProof: paymentProofPath,

            cashReceivedBy,

            cashRemarks,
          }),
        });

        const data = await response.json();
        if (response.status === 401) {
          localStorage.removeItem("dealerToken");

          alert("Session expired. Please login again.");

          navigate("/dealer/login");

          return;
        }

        if (!response.ok) {
          throw new Error(data.message || "Payment failed");
        }

        alert(
          "Order placed successfully ✅\n\nPayment submitted for admin verification.",
        );
      }

      clearCheckoutData();

      navigate("/dealer/orders");
    } catch (error) {
      console.error(error);

      alert(error.message || "Payment failed");
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     PAY LATER
  ========================= */

  const placePayLaterOrder = async () => {
    if (loading) return;
    try {
      setLoading(true);

      const token = localStorage.getItem("dealerToken");

      if (!token) {
        alert("Please login again");

        navigate("/dealer/login");

        return;
      }

      const response = await fetch(`${API_URL}/api/dealer/orders`, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",

          Authorization: `Bearer ${token}`,
        },

        body: JSON.stringify({
          items: products.map((item) => ({
            productId: item.productId,

            productName: item.productName || item.name || "",

            size: item.size || "",

            cases: Number(item.cases || 1),

            bottlesPerCase: Number(item.bottlesPerCase || 1),

            totalBottles: Number(item.totalBottles || 0),

            quantity: Number(item.quantity || item.totalBottles || 0),

            mrp: Number(item.mrp || 0),

            pricePerBottle: Number(item.pricePerBottle || item.mrp || 0),

            discountPercent: Number(item.discountPercent || 0),

            gstPercent: Number(item.gstPercent || 0),

            gstAmount: Number(item.gstAmount || 0),

            finalPrice: Number(item.finalPrice || 0),
          })),

          paymentType: "PAY_LATER",
        }),
      });

      const data = await response.json();
      if (response.status === 401) {
        localStorage.removeItem("dealerToken");

        alert("Session expired. Please login again.");

        navigate("/dealer/login");

        return;
      }

      if (!response.ok) {
        throw new Error(data.message || "Order failed");
      }

      alert(
        "Order placed successfully ✅\n\nTax invoice generated successfully.",
      );

      clearCheckoutData();

      navigate("/dealer/orders");
    } catch (error) {
      console.error(error);

      alert(error.message || "Failed to place order");
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

        <button
          className="pay-later-btn"
          onClick={() => navigate("/dealer/products")}
        >
          Browse Products
        </button>
      </div>
    );
  }

  return (
    <div className="dealer-transaction-page">
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
              <th>Cases</th>
              <th>Price</th>
            </tr>
          </thead>

          <tbody>
            {products.map((product) => (
              <tr key={`${product.productId}-${product.size}`}>
                <td>{product.productName || product.name || "-"}</td>

                <td>{product.size}</td>

                <td>{product.cases || product.quantity || 1}</td>

                <td>
                  ₹
                  {Number(
                    product.finalPrice || product.price || 0,
                  ).toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </td>
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

          <strong>
            ₹
            {Number(total).toLocaleString("en-IN", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </strong>
        </div>

        <div className="payment-section">
          <label>Payment Method</label>

          <select
            value={paymentType}
            onChange={(e) => {
              setPaymentType(e.target.value);

              localStorage.setItem("paymentMode", e.target.value);

              setPaymentMode(e.target.value);
            }}
            className="payment-input"
          >
            <option value="PAY_NOW">UPI Payment</option>

            <option value="PAY_CASH">Cash Payment</option>

            <option value="PAY_LATER">Pay Later</option>
          </select>
        </div>

        {/* QR CODE */}
        {paymentType === "PAY_NOW" && (
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
        )}
        {/* PAYMENT APP */}
        {paymentType === "PAY_NOW" && (
          <div className="payment-section">
            <label>Select Payment App</label>

            <select
              value={paymentApp}
              onChange={(e) => setPaymentApp(e.target.value)}
              className="payment-input"
            >
              <option value="PHONEPE">PhonePe</option>

              <option value="GPAY">Google Pay</option>
            </select>

            <button
              type="button"
              className="open-upi-btn"
              onClick={() => {
                window.location.href = upiLink;
              }}
            >
              Open Payment App
            </button>
          </div>
        )}
        {/* UTR */}
        {paymentType === "PAY_NOW" && (
          <div className="payment-section">
            <label>UTR Number</label>

            <input
              type="text"
              value={utrNumber}
              maxLength={30}
              onChange={(e) =>
                setUtrNumber(
                  e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""),
                )
              }
            />
          </div>
        )}
        {/* SCREENSHOT */}
        {paymentType === "PAY_NOW" && (
          <div className="payment-section">
            <label>Payment Screenshot</label>

            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files[0];

                if (!file) return;

                const allowedTypes = [
                  "image/jpeg",
                  "image/jpg",
                  "image/png",
                  "image/webp",
                ];

                if (!allowedTypes.includes(file.type)) {
                  alert("Only JPG, PNG and WEBP images are allowed");
                  e.target.value = "";
                  return;
                }

                if (file.size > 5 * 1024 * 1024) {
                  alert("Image size must be less than 5 MB");
                  e.target.value = "";
                  return;
                }

                setPaymentProof(file);
              }}
              className="payment-input"
            />
          </div>
        )}
        {paymentType === "PAY_CASH" && (
          <>
            <div className="payment-section">
              <label>Cash Received By</label>

              <input
                type="text"
                value={cashReceivedBy}
                onChange={(e) => setCashReceivedBy(e.target.value)}
                className="payment-input"
                placeholder="Enter person name"
              />
            </div>

            <div className="payment-section">
              <label>Remarks</label>

              <textarea
                value={cashRemarks}
                onChange={(e) => setCashRemarks(e.target.value)}
                className="payment-input"
                rows="3"
                placeholder="Optional remarks"
              />
            </div>
          </>
        )}
        <div className="payment-buttons">
          {isExistingOrder ? (
            <button
              className="pay-btn"
              onClick={startPayment}
              disabled={loading}
            >
              <FaCheckCircle />

              {loading ? "Processing..." : "Submit Payment"}
            </button>
          ) : paymentMode === "PAY_LATER" ? (
            <button
              className="pay-later-btn"
              onClick={placePayLaterOrder}
              disabled={loading}
            >
              {loading ? "Processing..." : "Place Order"}
            </button>
          ) : (
            <>
              <button
                className="pay-btn"
                onClick={startPayment}
                disabled={loading}
              >
                <FaCheckCircle />

                {loading ? "Processing..." : "Pay Now"}
              </button>

              <button
                className="pay-later-btn"
                onClick={() => {
                  if (loading) return;

                  localStorage.setItem("paymentMode", "PAY_LATER");

                  setPaymentMode("PAY_LATER");

                  placePayLaterOrder();
                }}
                disabled={loading}
              >
                Pay Later
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Transaction;
