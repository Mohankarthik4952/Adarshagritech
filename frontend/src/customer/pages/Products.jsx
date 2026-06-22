import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { FaShoppingCart, FaBolt, FaBoxOpen } from "react-icons/fa";

import API_URL from "../../config/api";
import getImageUrl from "../../utils/getImageUrl";

import "./customerpages.css";

const Products = () => {
  const navigate = useNavigate();

  /* =========================
     STATES
  ========================= */

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [acreValues, setAcreValues] = useState({});

  /* =========================
     FETCH PRODUCTS
  ========================= */

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);

        const response = await fetch(`${API_URL}/api/customer-products`);

        const data = await response.json();

        console.log("CUSTOMER PRODUCTS:", data);

        if (data.success) {
          setProducts(data.products || []);
        } else {
          setProducts([]);
        }
      } catch (error) {
        console.error("PRODUCT FETCH ERROR:", error);

        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  /* =========================
     FORMAT PRICE
  ========================= */

  const formatCurrency = (amount) =>
    Number(amount || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  /* =========================
     ADD TO CART
  ========================= */

  const addToCart = (cartItem) => {
    const cart = JSON.parse(localStorage.getItem("customerCart")) || [];

    const existingIndex = cart.findIndex(
      (item) =>
        item.productId === cartItem.productId && item.size === cartItem.size,
    );

    if (existingIndex !== -1) {
      cart[existingIndex].acres += cartItem.acres;

      cart[existingIndex].quantity += cartItem.quantity;

      cart[existingIndex].price += cartItem.price;
    } else {
      cart.push(cartItem);
    }

    localStorage.setItem("customerCart", JSON.stringify(cart));

    alert("Product added to cart 🛒");
  };

  /* =========================
     BUY NOW
  ========================= */

  const buyNow = (product) => {
    localStorage.removeItem("checkoutProducts");

    localStorage.setItem("checkoutProducts", JSON.stringify([product]));

    localStorage.setItem("transactionAmount", product.price);

    navigate("/customer/transaction");
  };

  return (
    <div className="customer-products-page">
      <div className="page-header">
        <h1>Available Products</h1>

        <p>Explore all agricultural products</p>
      </div>

      {loading ? (
        <div className="loading-box">
          <h2>Loading products...</h2>
        </div>
      ) : products.length === 0 ? (
        <div className="empty-products">
          <FaBoxOpen />

          <h2>No products available</h2>
        </div>
      ) : (
        <div className="customer-products-grid">
          {products.map((product) => {
            const sizeData = product.sizes?.[0] || {};

            const selectedSize = sizeData.size || "";

            const mrp = Number(sizeData.mrp || 0);

            const discount = Number(
              product.customerDiscountPercent || product.discountPercent || 0,
            );

            const finalPrice = mrp - (mrp * discount) / 100;

            const acreCoverage = Number(sizeData.acreCoverage || 1);

            const acres = Number(acreValues[product._id] || 0);

            const quantity = acres > 0 ? Math.ceil(acres / acreCoverage) : 0;

            const totalPrice = finalPrice * quantity;

            const image = product.images?.[0] || product.image || "";

            const stockQuantity = Number(sizeData.stockQuantity || 0);

            return (
              <div className="customer-product-card" key={product._id}>
                <div className="product-image-wrapper">
                  <img
                    src={getImageUrl(image)}
                    alt={product.name}
                    onError={(e) => {
                      e.target.src = "/no-image.png";
                    }}
                  />
                </div>

                <div className="product-content">
                  <h3>{product.name}</h3>

                  <p className="product-description">
                    {product.customerDescription ||
                      product.description ||
                      "No description available"}
                  </p>

                  <div className="product-size">
                    Size:
                    <span>{selectedSize}</span>
                  </div>

                  <div className="product-size">
                    Covers:
                    <span>
                      {acreCoverage} Acre
                      {acreCoverage > 1 ? "s" : ""}
                    </span>
                  </div>

                  <div className="product-size">
                    Stock:
                    <span>{stockQuantity} Bottles</span>
                  </div>

                  <div className="price-section">
                    <div className="mrp-price">
                      Original:
                      <span>₹{formatCurrency(mrp)}</span>
                    </div>

                    <div className="discount-price">
                      Discount:
                      <span>{discount}%</span>
                    </div>

                    <div className="final-price">
                      ₹{formatCurrency(finalPrice)}
                    </div>
                  </div>

                  <div className="acre-input-box">
                    <label>Enter Acres</label>

                    <input
                      type="number"
                      min="1"
                      step="0.1"
                      placeholder="Enter acres"
                      value={acreValues[product._id] || ""}
                      onChange={(e) =>
                        setAcreValues((prev) => ({
                          ...prev,
                          [product._id]: e.target.value,
                        }))
                      }
                    />
                  </div>

                  <div className="required-qty">
                    Required Bottles:
                    <span>{quantity}</span>
                  </div>

                  <div className="required-qty">
                    Total Amount:
                    <span>₹{formatCurrency(totalPrice)}</span>
                  </div>

                  <div className="non-returnable">
                    Products are non-returnable
                  </div>

                  <div className="product-buttons">
                    <button
                      className="cart-btn"
                      disabled={quantity <= 0 || quantity > stockQuantity}
                      onClick={() => {
                        if (acres <= 0) {
                          alert("Please enter acres");
                          return;
                        }

                        if (quantity > stockQuantity) {
                          alert("Insufficient stock available");
                          return;
                        }

                        addToCart({
                          productId: product._id,
                          productName: product.name,
                          size: selectedSize,
                          acres,
                          acreCoverage,
                          quantity,
                          unitPrice: finalPrice,
                          mrp,
                          discountPercent: discount,
                          price: totalPrice,
                          image,
                        });
                      }}
                    >
                      <FaShoppingCart />
                      Add To Cart
                    </button>

                    <button
                      className="buy-btn"
                      disabled={quantity <= 0 || quantity > stockQuantity}
                      onClick={() => {
                        if (acres <= 0) {
                          alert("Please enter acres");
                          return;
                        }

                        if (quantity > stockQuantity) {
                          alert("Insufficient stock available");
                          return;
                        }

                        buyNow({
                          productId: product._id,
                          productName: product.name,
                          size: selectedSize,
                          acres,
                          acreCoverage,
                          quantity,
                          unitPrice: finalPrice,
                          mrp,
                          discountPercent: discount,
                          price: totalPrice,
                          image,
                        });
                      }}
                    >
                      <FaBolt />
                      Buy Now
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Products;
