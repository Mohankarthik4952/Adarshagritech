// src/customer/pages/Cart.jsx

import { useEffect, useState } from "react";

import { useNavigate } from "react-router-dom";

import { FaTrash, FaShoppingCart, FaArrowRight } from "react-icons/fa";

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
    const cart = JSON.parse(localStorage.getItem("customerCart")) || [];

    setCartItems(cart);
  }, []);

  /* =========================
     REMOVE ITEM
  ========================= */

  const removeItem = (index) => {
    const updated = [...cartItems];

    updated.splice(index, 1);

    setCartItems(updated);

    localStorage.setItem("customerCart", JSON.stringify(updated));
  };

  /* =========================
     TOTAL
  ========================= */

  const getTotal = () => {
    return cartItems.reduce((sum, item) => sum + Number(item.price || 0), 0);
  };

  /* =========================
     PROCEED TO PAYMENT
  ========================= */

  const proceedToPayment = () => {
    /* REMOVE OLD BUY NOW DATA */

    localStorage.removeItem("checkoutProducts");

    /* SAVE CART ITEMS */

    localStorage.setItem("checkoutProducts", JSON.stringify(cartItems));

    navigate("/customer/transaction");
  };

  return (
    <div className="customer-cart-page">
      {/* PAGE HEADER */}

      <div className="page-header">
        <h1>
          <FaShoppingCart />
          Your Cart
        </h1>

        <p>Review your selected products before payment</p>
      </div>

      {/* EMPTY CART */}

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
          {/* CART TABLE */}

          <div className="cart-table-wrapper">
            <table className="cart-table">
              <thead>
                <tr>
                  <th>Product</th>

                  <th>Size</th>

                  <th>Quantity</th>

                  <th>Price</th>

                  <th>Remove</th>
                </tr>
              </thead>

              <tbody>
                {cartItems.map((item, index) => (
                  <tr key={index}>
                    <td>{item.productName}</td>

                    <td>{item.size}</td>

                    <td>{item.quantity || 1}</td>

                    <td>₹{Number(item.price).toFixed(2)}</td>

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

          {/* SUMMARY */}

          <div className="cart-summary-card">
            <div className="summary-row">
              <span>Total Items</span>

              <strong>{cartItems.length}</strong>
            </div>

            <div className="summary-row total-row">
              <span>Total Amount</span>

              <strong>₹{getTotal().toFixed(2)}</strong>
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
