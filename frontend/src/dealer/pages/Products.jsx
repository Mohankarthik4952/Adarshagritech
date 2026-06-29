import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  FaShoppingCart,
  FaBolt,
  FaMoneyBillWave,
  FaBoxOpen,
} from "react-icons/fa";
import API_URL from "../../config/api";
import getImageUrl from "../../utils/getImageUrl";

import "./dealerpages.css";

const Products = () => {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selection, setSelection] = useState({});
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch(`${API_URL}/api/dealer/products`);

        const data = await res.json();

        console.log("Dealer Products:", data);

        setProducts(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Products fetch error:", error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);
  /* =========================
   FILTER PRODUCTS
========================= */

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(search.toLowerCase()),
  );

  /* =========================
     HANDLE SIZE
  ========================= */

  const handleSizeChange = (productId, size) => {
    setSelection((prev) => ({
      ...prev,

      [productId]: {
        ...prev[productId],

        size,

        cases: 1,
      },
    }));
  };

  /* =========================
     HANDLE CASES
  ========================= */

  const handleCasesChange = (productId, cases) => {
    setSelection((prev) => ({
      ...prev,

      [productId]: {
        ...prev[productId],

        cases: Number(cases),
      },
    }));
  };

  /* =========================
     VALIDATE STOCK
  ========================= */

  const validateStock = (select, sizeData) => {
    const availableCases = Number(sizeData?.stockQuantity || 0);

    if (select.cases > availableCases) {
      alert(`Only ${availableCases} cases available`);
      return false;
    }

    return true;
  };

  /* =========================
     ADD TO CART
  ========================= */

  const addToCart = (
    product,
    sizeData,
    finalPrice,
    totalBottles,
    gst,
    gstAmount,
    priceAfterDiscount,
  ) => {
    const select = selection[product._id];

    if (!select?.size || !select?.cases) {
      alert("Please select size and cases");
      return;
    }

    if (!validateStock(select, sizeData)) {
      return;
    }

    const cart = JSON.parse(localStorage.getItem("dealerCart")) || [];

    cart.push({
      productId: product._id,

      productName: product.name,

      image: product.images?.[0] || "",

      size: select.size,

      cases: Number(select.cases),

      bottlesPerCase: Number(sizeData?.bottlesPerCase || 1),

      totalBottles: Number(totalBottles),

      quantity: Number(totalBottles),

      mrp: Number(sizeData?.mrp || 0),

      pricePerBottle:
        totalBottles > 0
          ? Number((priceAfterDiscount / totalBottles).toFixed(2))
          : 0,

      discountPercent: Number(product.dealerDiscountPercent || 0),

      gstPercent: Number(gst || 0),

      gstAmount: Number(gstAmount || 0),

      finalPrice: Number(finalPrice || 0),
    });

    localStorage.setItem("dealerCart", JSON.stringify(cart));

    alert("Product added to cart 🛒");
  };

  /* =========================
     BUY NOW
  ========================= */

  const buyNow = (
    product,
    sizeData,
    finalPrice,
    totalBottles,
    gst,
    gstAmount,
    priceAfterDiscount,
  ) => {
    const select = selection[product._id];

    if (!select?.size || !select?.cases) {
      alert("Please select size and cases");
      return;
    }

    if (!validateStock(select, sizeData)) {
      return;
    }

    localStorage.setItem(
      "checkoutProducts",
      JSON.stringify([
        {
          productId: product._id,

          productName: product.name,

          image: product.images?.[0] || "",

          size: select.size,

          cases: Number(select.cases),

          bottlesPerCase: Number(sizeData?.bottlesPerCase || 1),

          totalBottles: Number(totalBottles),

          quantity: Number(totalBottles),

          mrp: Number(sizeData?.mrp || 0),

          pricePerBottle:
            totalBottles > 0
              ? Number((priceAfterDiscount / totalBottles).toFixed(2))
              : 0,

          discountPercent: Number(product.dealerDiscountPercent || 0),

          gstPercent: Number(gst || 0),

          gstAmount: Number(gstAmount || 0),

          finalPrice: Number(finalPrice || 0),
        },
      ]),
    );

    navigate("/dealer/transaction");
  };

  /* =========================
     PAY LATER
  ========================= */

  const payLater = async (
    product,
    sizeData,
    finalPrice,
    totalBottles,
    gst,
    gstAmount,
    priceAfterDiscount,
  ) => {
    try {
      const select = selection[product._id];

      if (!select?.size || !select?.cases) {
        alert("Please select size and cases");
        return;
      }

      if (!validateStock(select, sizeData)) {
        return;
      }

      const token = localStorage.getItem("dealerToken");

      const checkoutProduct = {
        productId: product._id,

        productName: product.name,

        image: product.images?.[0] || "",

        size: select.size,

        cases: Number(select.cases),

        bottlesPerCase: Number(sizeData?.bottlesPerCase || 1),

        totalBottles: Number(totalBottles),

        quantity: Number(totalBottles),

        mrp: Number(sizeData?.mrp || 0),

        pricePerBottle:
          totalBottles > 0
            ? Number((priceAfterDiscount / totalBottles).toFixed(2))
            : 0,

        discountPercent: Number(product.dealerDiscountPercent || 0),

        gstPercent: Number(gst || 0),

        gstAmount: Number(gstAmount || 0),

        finalPrice: Number(finalPrice || 0),
      };

      const response = await fetch(`${API_URL}/api/dealer/payment/checkout`, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",

          Authorization: `Bearer ${token}`,
        },

        body: JSON.stringify({
          products: [checkoutProduct],

          totalAmount: Number(finalPrice),

          paymentType: "PAY_LATER",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Order failed");
      }

      alert("Order placed successfully ✅");

      navigate("/dealer/orders");
    } catch (error) {
      console.error(error);

      alert(error.message || "Order failed");
    }
  };

  if (loading) {
    return (
      <div className="loading-box">
        <h2>Loading products...</h2>
      </div>
    );
  }

  return (
    <div className="dealer-products-page">
      <div className="page-header">
        <div>
          <h1>Dealer Products</h1>
          <p>Order products with dealer discounts</p>
        </div>

        <input
          type="text"
          className="product-search"
          placeholder="Search product..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {products.length === 0 ? (
        <div className="empty-products">
          <FaBoxOpen />

          <h2>Products are out of stock</h2>
        </div>
      ) : (
        <div className="dealer-products-grid">
          {filteredProducts.map((product) => {
            const selectedSize = selection[product._id]?.size || "";

            const selectedCases = selection[product._id]?.cases || 1;

            const sizeData = product.sizes?.find(
              (s) => s.size === selectedSize,
            );

            const availableCases = Number(sizeData?.stockQuantity || 0);

            const price = Number(sizeData?.price || product.dealerPrice || 0);

            const bottlesPerCase = Number(sizeData?.bottlesPerCase || 1);

            const totalBottles = bottlesPerCase * selectedCases;

            /* ORIGINAL PRICE (ADMIN PRICE × BOTTLES) */

            const originalPrice = price * totalBottles;

            const discount = Number(product.dealerDiscountPercent || 0);

            const gst = Number(product.gstPercent || 0);

            /* DISCOUNT */

            const discountAmount = (originalPrice * discount) / 100;

            const priceAfterDiscount = originalPrice - discountAmount;

            /* GST */

            const gstAmount = (priceAfterDiscount * gst) / 100;

            /* FINAL */

            const finalPrice = priceAfterDiscount + gstAmount;

            return (
              <div className="dealer-product-card" key={product._id}>
                <div className="product-image-box">
                  <img
                    src={getImageUrl(product.images?.[0])}
                    alt={product.name}
                    onError={(e) => {
                      e.target.src = "/no-image.png";
                    }}
                  />
                </div>

                <div className="product-details">
                  <h2>{product.name}</h2>

                  <p>
                    {product.dealerDescription ||
                      product.description ||
                      "No description available"}
                  </p>

                  <div className="input-group">
                    <label>Select Size</label>

                    <select
                      value={selectedSize}
                      onChange={(e) =>
                        handleSizeChange(product._id, e.target.value)
                      }
                    >
                      <option value="">Select Size</option>

                      {product.sizes?.map((size, index) => (
                        <option key={index} value={size.size}>
                          {size.size}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="input-group">
                    <label>Number of Cases</label>

                    <select
                      value={selectedCases}
                      onChange={(e) =>
                        handleCasesChange(product._id, e.target.value)
                      }
                      disabled={!selectedSize}
                    >
                      {Array.from(
                        { length: Math.max(Math.min(availableCases, 20), 1) },
                        (_, i) => i + 1,
                      ).map((num) => (
                        <option key={num} value={num}>
                          {num}
                        </option>
                      ))}
                    </select>
                  </div>

                  {selectedSize && (
                    <>
                      <div className="stock-info">
                        Cases Left: {availableCases}
                      </div>

                      <div className="price-box">
                        <div className="mrp-price">
                          Original:
                          <span>₹{originalPrice.toFixed(2)}</span>
                        </div>

                        <div className="discount-price">
                          Discount:
                          <span>{discount}%</span>
                        </div>

                        <div className="gst-price">
                          GST:
                          <span>{gst}%</span>
                        </div>

                        <div className="discounted-price">
                          After Discount:
                          <span>₹{priceAfterDiscount.toFixed(2)}</span>
                        </div>

                        <div className="gst-amount">
                          GST Amount:
                          <span>₹{gstAmount.toFixed(2)}</span>
                        </div>

                        <div className="final-price">
                          ₹{finalPrice.toFixed(2)}
                        </div>
                      </div>
                    </>
                  )}

                  <div className="product-actions">
                    <button
                      className="cart-btn"
                      disabled={!selectedSize || availableCases <= 0}
                      onClick={() =>
                        addToCart(
                          product,
                          sizeData,
                          finalPrice,
                          totalBottles,
                          gst,
                          gstAmount,
                          priceAfterDiscount,
                        )
                      }
                    >
                      <FaShoppingCart />
                      Add To Cart
                    </button>

                    <button
                      className="pay-btn"
                      disabled={!selectedSize || availableCases <= 0}
                      onClick={() =>
                        buyNow(
                          product,
                          sizeData,
                          finalPrice,
                          totalBottles,
                          gst,
                          gstAmount,
                          priceAfterDiscount,
                        )
                      }
                    >
                      <FaBolt />
                      Pay Now
                    </button>

                    <button
                      className="later-btn"
                      disabled={!selectedSize || availableCases <= 0}
                      onClick={() =>
                        payLater(
                          product,
                          sizeData,
                          finalPrice,
                          totalBottles,
                          gst,
                          gstAmount,
                          priceAfterDiscount,
                        )
                      }
                    >
                      <FaMoneyBillWave />
                      Pay Later
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
