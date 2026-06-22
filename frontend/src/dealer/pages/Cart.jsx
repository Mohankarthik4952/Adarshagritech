import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API_URL from "../../config/api";
import getImageUrl from "../../utils/getImageUrl";

import "./dealerpages.css";

const Cart = () => {
  const navigate = useNavigate();

  /* =========================
     STATES
  ========================= */

  const [cartItems, setCartItems] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [placingOrder, setPlacingOrder] = useState(false);

  /* =========================
     LOAD CART
  ========================= */

  useEffect(() => {
    const storedCart = JSON.parse(localStorage.getItem("dealerCart")) || [];

    setCartItems(storedCart);

    calculateTotal(storedCart);
  }, []);

  /* =========================
     TOTAL CALCULATION
  ========================= */

  const calculateTotal = (items) => {
    const total = items.reduce(
      (sum, item) => sum + Number(item.finalPrice || 0),
      0,
    );

    setTotalAmount(total);
  };

  /* =========================
     REMOVE ITEM
  ========================= */

  const removeItem = (index) => {
    const updated = cartItems.filter((_, i) => i !== index);

    setCartItems(updated);

    localStorage.setItem("dealerCart", JSON.stringify(updated));

    calculateTotal(updated);
  };

  /* =========================
     PAY NOW
  ========================= */

  const handlePayNow = () => {
    if (placingOrder) return;

    if (cartItems.length === 0) {
      alert("Cart is empty");
      return;
    }

    const token = localStorage.getItem("dealerToken");

    if (!token) {
      alert("Please login again");

      navigate("/dealer/login");

      return;
    }

    localStorage.setItem("checkoutProducts", JSON.stringify(cartItems));

    localStorage.setItem("transactionAmount", totalAmount.toString());

    localStorage.setItem("paymentType", "PAY_NOW");

    navigate("/dealer/transaction");
  };

  /* =========================
     PAY LATER
  ========================= */

  const handlePayLater = async () => {
    try {
      if (placingOrder) return;

      if (cartItems.length === 0) {
        alert("Cart is empty");
        return;
      }

      const token = localStorage.getItem("dealerToken");

      if (!token) {
        alert("Please login again");

        navigate("/dealer/login");

        return;
      }

      setPlacingOrder(true);

      const payload = {
        items: cartItems.map((item) => ({
          productId: item.productId,

          productName: item.productName || item.name || "",

          image: item.image || "",

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
      };

      const response = await fetch(`${API_URL}/api/dealer/orders`, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",

          Authorization: `Bearer ${token}`,
        },

        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Order failed");
      }

      localStorage.removeItem("dealerCart");
      localStorage.removeItem("checkoutProducts");
      localStorage.removeItem("transactionAmount");
      localStorage.removeItem("paymentType");

      setCartItems([]);
      setTotalAmount(0);

      alert(
        "Order placed successfully ✅\n\nTax invoice generated successfully.",
      );

      navigate("/dealer/orders");
    } catch (error) {
      console.error("ORDER ERROR:", error);

      if (
        error.message?.toLowerCase().includes("jwt") ||
        error.message?.toLowerCase().includes("token") ||
        error.message?.toLowerCase().includes("unauthorized")
      ) {
        localStorage.removeItem("dealerToken");

        alert("Session expired. Please login again.");

        navigate("/dealer/login");

        return;
      }

      alert(error.message || "Order failed");
    } finally {
      setPlacingOrder(false);
    }
  };

  return (
    <div className="dealer-cart-page">
      <div className="page-header">
        <h1>Your Cart</h1>

        <p>Review your selected products</p>
      </div>

      {cartItems.length === 0 && (
        <div className="empty-cart">
          <h2>No items in cart</h2>

          <p>Add products to continue</p>
        </div>
      )}

      <div className="cart-items-container">
        {cartItems.map((item, index) => (
          <div
            className="cart-item-card"
            key={`${item.productId}-${item.size}-${index}`}
          >
            <div className="cart-image-box">
              <img
                src={getImageUrl(item.image)}
                alt={item.productName || item.name}
                onError={(e) => {
                  e.target.src = "/no-image.png";
                }}
              />
            </div>

            <div className="cart-details">
              <h3>{item.productName || item.name}</h3>

              <p>
                <strong>Size:</strong> {item.size}
              </p>

              <p>
                <strong>Cases:</strong> {item.cases}
              </p>

              <p>
                <strong>Bottles / Case:</strong> {item.bottlesPerCase || 1}
              </p>

              <p>
                <strong>Total Bottles:</strong> {item.totalBottles || 0}
              </p>

              <p>
                <strong>Discount:</strong> {item.discountPercent || 0}%
              </p>

              <p>
                <strong>GST:</strong> {item.gstPercent || 0}%
              </p>

              <h2>₹{Number(item.finalPrice || 0).toLocaleString("en-IN")}</h2>
            </div>

            <button className="remove-btn" onClick={() => removeItem(index)}>
              Remove
            </button>
          </div>
        ))}
      </div>

      {cartItems.length > 0 && (
        <div className="cart-summary-card">
          <div className="summary-row">
            <span>Total Items</span>

            <strong>{cartItems.length}</strong>
          </div>

          <div className="summary-row">
            <span>Total Amount</span>

            <strong>₹{Number(totalAmount).toLocaleString("en-IN")}</strong>
          </div>

          <div className="cart-actions">
            <button className="paynow-btn" onClick={handlePayNow}>
              Pay Now
            </button>

            <button className="paylater-btn" onClick={handlePayLater}>
              Pay Later
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
