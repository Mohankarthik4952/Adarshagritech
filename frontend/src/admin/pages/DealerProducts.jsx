// src/admin/pages/DealerProducts.jsx

import { useEffect, useState } from "react";

import "./adminpages.css";

const DealerProducts = () => {
  /* =================================
     TOKEN
  ================================= */

  const token = localStorage.getItem("adminToken");

  /* =================================
     STATES
  ================================= */

  const [products, setProducts] = useState([]);

  const [loading, setLoading] = useState(false);

  const [dealerConfig, setDealerConfig] = useState({});

  /* =================================
     FETCH PRODUCTS
  ================================= */

  const fetchProducts = async () => {
    try {
      setLoading(true);

      const res = await fetch("http://localhost:5000/api/admin/products", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      const safeProducts = Array.isArray(data)
        ? data
        : Array.isArray(data.products)
          ? data.products
          : [];

      setProducts(safeProducts);

      /* =========================
           INITIAL CONFIG
        ========================= */

      const initial = {};

      safeProducts.forEach((product) => {
        initial[product._id] = {
          visible: product.visibleToDealers || false,

          description: product.dealerDescription || "",

          discount:
            product.dealerDiscountPercent !== undefined &&
            product.dealerDiscountPercent !== null
              ? String(product.dealerDiscountPercent)
              : "",

          gst:
            product.gstPercent !== undefined && product.gstPercent !== null
              ? String(product.gstPercent)
              : "",

          stockQuantity:
            product.sizes?.[0]?.stockQuantity !== undefined &&
            product.sizes?.[0]?.stockQuantity !== null
              ? String(product.sizes[0].stockQuantity)
              : "0",
        };
      });

      console.log("INITIAL DEALER CONFIG:", initial);

      setDealerConfig(initial);
    } catch (error) {
      console.log("FETCH DEALER PRODUCTS ERROR:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  /* =================================
     HANDLE CHANGE
  ================================= */

  const handleChange = (productId, field, value) => {
    setDealerConfig((prev) => ({
      ...prev,

      [productId]: {
        ...prev[productId],

        [field]: value,
      },
    }));
  };

  /* =================================
     SAVE DEALER PRODUCTS
  ================================= */

  const saveDealerProducts = async () => {
    try {
      setLoading(true);

      const payload = products.map((product) => ({
        productId: product._id,

        selected: dealerConfig[product._id]?.visible || false,

        description: dealerConfig[product._id]?.description || "",

        discount: Number(dealerConfig[product._id]?.discount || 0),

        gstPercent: Number(dealerConfig[product._id]?.gst || 0),

        stockQuantity: Number(dealerConfig[product._id]?.stockQuantity || 0),
      }));

      console.log("DEALER PAYLOAD:", payload);

      const response = await fetch(
        "http://localhost:5000/api/admin/dealer-products",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",

            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            products: payload,
          }),
        },
      );

      const data = await response.json();

      console.log("SAVE RESPONSE:", data);

      if (!response.ok) {
        throw new Error(data.message || "Failed to save dealer products");
      }

      alert("Dealer products saved successfully ✅");

      await fetchProducts();
    } catch (error) {
      console.error("SAVE DEALER PRODUCTS ERROR:", error);

      alert(error.message || "Failed to save dealer products");
    } finally {
      setLoading(false);
    }
  };

  /* =================================
     IMAGE URL
  ================================= */

  const getImageUrl = (product) => {
    let image = "";

    if (Array.isArray(product?.images) && product.images.length > 0) {
      image = product.images[0];
    } else if (product?.image) {
      image = product.image;
    }

    if (!image) {
      return "/no-image.png";
    }

    if (image.startsWith("http")) {
      return image;
    }

    return `http://localhost:5000${image}`;
  };

  /* =================================
     FINAL PRICE
  ================================= */

  const getFinalPrice = (product, discount, gst) => {
    if (!product.sizes || product.sizes.length === 0) {
      return 0;
    }

    const mrp = product.sizes[0]?.mrp || 0;

    const discountValue = Number(discount) || 0;

    const gstValue = Number(gst) || 0;

    const priceAfterDiscount = mrp - (mrp * discountValue) / 100;

    const gstAmount = (priceAfterDiscount * gstValue) / 100;

    const finalPrice = priceAfterDiscount + gstAmount;

    return finalPrice.toFixed(2);
  };

  return (
    <div className="dealer-products-page">
      {/* HEADER */}

      <div className="page-header">
        <h2>Dealer Products Management</h2>

        <button
          className="save-btn"
          onClick={saveDealerProducts}
          disabled={loading}
        >
          {loading ? "Saving..." : "Save Dealer Products"}
        </button>
      </div>

      {/* TABLE */}

      <div className="table-wrapper">
        <table className="products-table">
          <thead>
            <tr>
              <th>Select</th>
              <th>Image</th>
              <th>Product ID</th>
              <th>Name</th>
              <th>Cases Left</th>
              <th>Description</th>
              <th>Discount %</th>
              <th>GST %</th>
              <th>Final Price</th>
            </tr>
          </thead>

          <tbody>
            {products.length === 0 ? (
              <tr>
                <td colSpan="9" style={{ textAlign: "center" }}>
                  No products found
                </td>
              </tr>
            ) : (
              products.map((product) => (
                <tr key={product._id}>
                  {/* SELECT */}

                  <td>
                    <input
                      type="checkbox"
                      checked={dealerConfig[product._id]?.visible || false}
                      onChange={(e) =>
                        handleChange(product._id, "visible", e.target.checked)
                      }
                    />
                  </td>

                  {/* IMAGE */}

                  <td>
                    <img
                      src={getImageUrl(product)}
                      alt={product.name}
                      className="product-image"
                      onError={(e) => {
                        e.target.src = "/no-image.png";
                      }}
                    />
                  </td>

                  {/* PRODUCT ID */}

                  <td>{product.productId}</td>

                  {/* NAME */}

                  <td>{product.name}</td>

                  {/* DESCRIPTION */}

                  <td>
                    <input
                      type="number"
                      min="0"
                      value={dealerConfig[product._id]?.stockQuantity || ""}
                      onChange={(e) =>
                        handleChange(
                          product._id,
                          "stockQuantity",
                          e.target.value,
                        )
                      }
                      className="table-input"
                    />
                  </td>

                  <td>
                    <input
                      type="text"
                      placeholder="Description"
                      value={dealerConfig[product._id]?.description || ""}
                      onChange={(e) =>
                        handleChange(product._id, "description", e.target.value)
                      }
                      className="table-input"
                    />
                  </td>

                  {/* DISCOUNT */}

                  <td>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      placeholder="Discount %"
                      value={dealerConfig[product._id]?.discount || ""}
                      onChange={(e) =>
                        handleChange(product._id, "discount", e.target.value)
                      }
                      className="table-input"
                    />
                  </td>

                  <td>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      placeholder="GST %"
                      value={dealerConfig[product._id]?.gst || ""}
                      onChange={(e) =>
                        handleChange(product._id, "gst", e.target.value)
                      }
                      className="table-input"
                    />
                  </td>

                  {/* FINAL PRICE */}

                  <td>
                    ₹
                    {getFinalPrice(
                      product,
                      dealerConfig[product._id]?.discount,
                      dealerConfig[product._id]?.gst,
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DealerProducts;
