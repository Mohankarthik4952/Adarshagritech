// src/customer/pages/Products.jsx

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API_URL from "../../config/api";

import { FaShoppingCart, FaBolt, FaBoxOpen } from "react-icons/fa";

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
     IMAGE URL
  ========================= */

  const getImageUrl = (imagePath) => {
    if (!imagePath) {
      return "/no-image.png";
    }

    if (imagePath.startsWith("http")) {
      return imagePath;
    }

    const cleanPath = imagePath.startsWith("/") ? imagePath : `/${imagePath}`;

    return `${API_URL}${cleanPath}`;
  };

  /* =========================
     ADD TO CART
  ========================= */

  const addToCart = (product) => {
    const cart = JSON.parse(localStorage.getItem("customerCart")) || [];

    cart.push(product);

    localStorage.setItem("customerCart", JSON.stringify(cart));

    alert("Product added to cart 🛒");
  };

  /* =========================
     BUY NOW
  ========================= */

  const buyNow = (product) => {
    localStorage.setItem("checkoutProducts", JSON.stringify([product]));

    navigate("/customer/transaction");
  };

  /* =========================
     UI
  ========================= */

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
            const size =
              product.selectedSize || product.sizes?.[0]?.size || "N/A";

            const mrp = Number(product.mrp || 0);

            const finalPrice = Number(product.finalPrice || mrp);

            const discount = Number(product.discountPercent || 0);

            const acreCoverage = Number(product.acreCoverage || 1);

            const acres = Number(acreValues[product._id] || 0);

            const quantity = acres > 0 ? Math.ceil(acres / acreCoverage) : 0;

            const totalPrice = finalPrice * quantity;

            return (
              <div className="customer-product-card" key={product._id}>
                {/* IMAGE */}

                <div className="product-image-wrapper">
                  <img
                    src={getImageUrl(product.image)}
                    alt={product.name}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "/no-image.png";
                    }}
                  />
                </div>

                {/* CONTENT */}

                <div className="product-content">
                  <h3>{product.name}</h3>

                  <p className="product-description">
                    {product.description || "No description available"}
                  </p>

                  <div className="product-size">
                    Size:
                    <span>{size}</span>
                  </div>

                  <div className="product-size">
                    Covers:
                    <span>
                      {acreCoverage} Acre
                      {acreCoverage > 1 ? "s" : ""}
                    </span>
                  </div>

                  <div className="price-section">
                    <div className="mrp-price">
                      Original:
                      <span>₹{mrp.toLocaleString("en-IN")}</span>
                    </div>

                    <div className="discount-price">
                      Discount:
                      <span>{discount}%</span>
                    </div>

                    <div className="final-price">
                      ₹
                      {finalPrice.toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
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
                    <span>
                      ₹
                      {totalPrice.toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </div>

                  <div className="non-returnable">
                    Products are non-returnable
                  </div>

                  <div className="product-buttons">
                    <button
                      className="cart-btn"
                      onClick={() => {
                        if (!acres || acres <= 0) {
                          alert("Please enter acres");
                          return;
                        }

                        addToCart({
                          productId: product._id,

                          productName: product.name,

                          size,

                          acres,

                          acreCoverage,

                          quantity,

                          unitPrice: finalPrice,

                          mrp,

                          discountPercent: discount,

                          price: totalPrice,

                          image: product.image,
                        });
                      }}
                    >
                      <FaShoppingCart />
                      Add To Cart
                    </button>

                    <button
                      className="buy-btn"
                      onClick={() => {
                        if (!acres || acres <= 0) {
                          alert("Please enter acres");
                          return;
                        }

                        buyNow({
                          productId: product._id,

                          productName: product.name,

                          size,

                          acres,

                          acreCoverage,

                          quantity,

                          unitPrice: finalPrice,

                          mrp,

                          discountPercent: discount,

                          price: totalPrice,

                          image: product.image,
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
