// src/customer/pages/Cart.jsx

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { FaTrash, FaShoppingCart, FaArrowRight } from "react-icons/fa";

import getImageUrl from "../../utils/getImageUrl";

import "./customerpages.css";

const Cart = () => {
  const navigate = useNavigate();

  /* =========================
     STATES
  ========================= */

  const [cartItems, setCartItems] = useState([]);

  /* =========================
     LOAD CART
  ========================= */

  useEffect(() => {
    try {
      const cart = JSON.parse(localStorage.getItem("customerCart")) || [];

      setCartItems(Array.isArray(cart) ? cart : []);
    } catch (error) {
      console.error("CART LOAD ERROR:", error);

      setCartItems([]);
    }
  }, []);

  /* =========================
     REMOVE ITEM
  ========================= */

  const removeItem = (index) => {
    const updated = cartItems.filter((_, i) => i !== index);

    setCartItems(updated);

    localStorage.setItem("customerCart", JSON.stringify(updated));
  };

  /* =========================
     TOTAL
  ========================= */

  const getTotal = () => {
    return cartItems.reduce((sum, item) => {
      const quantity = Number(item.quantity || 1);

      const price = Number(item.finalPrice || item.price || 0);

      return sum + price * quantity;
    }, 0);
  };

  /* =========================
     PROCEED TO PAYMENT
  ========================= */

  const proceedToPayment = () => {
    if (cartItems.length === 0) {
      alert("Your cart is empty");

      return;
    }

    localStorage.removeItem("checkoutProducts");
    localStorage.removeItem("buyNowProduct");
    localStorage.removeItem("transactionAmount");

    localStorage.setItem("checkoutProducts", JSON.stringify(cartItems));

    localStorage.setItem("transactionAmount", getTotal());

    navigate("/customer/transaction");
  };

  return (
    <div className="customer-cart-page">
      <div className="page-header">
        <h1>
          <FaShoppingCart />
          Your Cart
        </h1>

        <p>Review your selected products before payment</p>
      </div>

      {cartItems.length === 0 ? (
        <div className="empty-cart">
          <FaShoppingCart />

          <h2>Your cart is empty</h2>

          <button onClick={() => navigate("/customer/products")}>
            Browse Products
          </button>
        </div>
      ) : (
        <>
          <div className="cart-table-wrapper">
            <table className="cart-table">
              <thead>
                <tr>
                  <th>Image</th>

                  <th>Product</th>

                  <th>Size</th>

                  <th>Quantity</th>

                  <th>Price</th>

                  <th>Remove</th>
                </tr>
              </thead>

              <tbody>
                {cartItems.map((item, index) => (
                  <tr key={`${item.productId}-${item.size}-${index}`}>
                    <td>
                      <img
                        src={getImageUrl(item.image)}
                        alt={item.productName || item.name || "Product"}
                        className="cart-product-image"
                        onError={(e) => {
                          e.target.src = "/no-image.png";
                        }}
                      />
                    </td>

                    <td>{item.productName || item.name || "-"}</td>

                    <td>{item.size || "-"}</td>

                    <td>{item.quantity || 1}</td>

                    <td>
                      ₹
                      {Number(
                        item.finalPrice || item.price || 0,
                      ).toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </td>

                    <td>
                      <button
                        className="remove-cart-btn"
                        onClick={() => removeItem(index)}
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="cart-summary-card">
            <div className="summary-row">
              <span>Total Items</span>

              <strong>{cartItems.length}</strong>
            </div>

            <div className="summary-row total-row">
              <span>Total Amount</span>

              <strong>
                ₹
                {getTotal().toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </strong>
            </div>

            <button className="payment-btn" onClick={proceedToPayment}>
              Proceed To Payment
              <FaArrowRight />
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Cart;
