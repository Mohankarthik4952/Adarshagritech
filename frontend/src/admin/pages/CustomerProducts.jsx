// src/admin/pages/CustomerProducts.jsx

import { useEffect, useState } from "react";
import API_URL from "../../config/api";

import "./adminpages.css";

const CustomerProducts = () => {
  const token = localStorage.getItem("adminToken");

  /* =========================
     STATE
  ========================= */

  const [loading, setLoading] = useState(false);

  const [products, setProducts] = useState([]);

  const [customerConfig, setCustomerConfig] = useState({});

  /* =========================
     FETCH PRODUCTS
  ========================= */

  const fetchProducts = async () => {
    try {
      setLoading(true);

      const res = await fetch(`${API_URL}/api/customer-products/admin/all`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to fetch products");
      }

      const safeProducts = Array.isArray(data)
        ? data
        : Array.isArray(data.products)
          ? data.products
          : [];

      setProducts(safeProducts);

      /* INITIAL VALUES */

      const initial = {};

      safeProducts.forEach((p) => {
        initial[p._id] = {
          visible: p.visibleToCustomers || false,

          description: p.customerDescription || "",

          discount: p.customerDiscountPercent || "",

          selectedSize: p.customerSelectedSize || p.sizes?.[0]?.size || "",
        };
      });

      setCustomerConfig(initial);
    } catch (error) {
      console.error("FETCH CUSTOMER PRODUCTS ERROR:", error);

      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  /* =========================
     HANDLE CHANGE
  ========================= */

  const handleChange = (productId, field, value) => {
    setCustomerConfig((prev) => ({
      ...prev,

      [productId]: {
        ...prev[productId],

        [field]: value,
      },
    }));
  };

  /* =========================
     GET SELECTED SIZE DATA
  ========================= */

  const getSelectedSizeData = (product) => {
    const selectedSize = customerConfig[product._id]?.selectedSize;

    return (
      product.sizes?.find((s) => s.size === selectedSize) || product.sizes?.[0]
    );
  };

  /* =========================
     GET PRODUCT MRP
  ========================= */

  const getProductMRP = (product) => {
    const sizeData = getSelectedSizeData(product);

    return sizeData?.mrp || 0;
  };

  /* =========================
     FINAL PRICE
  ========================= */

  const getFinalPrice = (product, discount) => {
    const mrp = getProductMRP(product);

    const discountValue = Number(discount) || 0;

    const finalPrice = mrp - (mrp * discountValue) / 100;

    return finalPrice.toFixed(2);
  };

  /* =========================
     SAVE CUSTOMER PRODUCTS
  ========================= */

  const saveCustomerProducts = async () => {
    try {
      /* VALIDATION */

      const invalidProduct = products.find((product) => {
        const config = customerConfig[product._id];

        return (
          config?.visible &&
          (!config.description ||
            config.description.trim() === "" ||
            config.discount === "" ||
            !config.selectedSize)
        );
      });

      if (invalidProduct) {
        alert("Description, Size and Discount are required");

        return;
      }

      setLoading(true);

      /* PAYLOAD */

      const payload = products.map((product) => ({
        productId: product._id,

        selected: customerConfig[product._id]?.visible || false,

        description: customerConfig[product._id]?.description || "",

        discount: customerConfig[product._id]?.discount || 0,

        selectedSize: customerConfig[product._id]?.selectedSize || "",
      }));

      /* API */

      const res = await fetch(`${API_URL}/api/customer-products`, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",

          Authorization: `Bearer ${token}`,
        },

        body: JSON.stringify({
          products: payload,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to save customer products");
      }

      alert("Customer products saved successfully ✅");

      fetchProducts();
    } catch (error) {
      console.error("SAVE CUSTOMER PRODUCTS ERROR:", error);

      alert(error.message || "Failed to save customer products");
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     IMAGE URL
  ========================= */

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

    return `${API_URL}${image}`;
  };

  /* =========================
     UI
  ========================= */

  return (
    <div className="dealer-products-page">
      {/* HEADER */}

      <div className="page-header">
        <h2>Customer Products Management</h2>

        <button
          className="save-btn"
          onClick={saveCustomerProducts}
          disabled={loading}
        >
          {loading ? "Saving..." : "Save Customer Products"}
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

              <th>Size</th>

              <th>MRP</th>

              <th>Description</th>

              <th>Discount %</th>

              <th>Final Price</th>
            </tr>
          </thead>

          <tbody>
            {products.length === 0 ? (
              <tr>
                <td
                  colSpan="9"
                  style={{
                    textAlign: "center",
                  }}
                >
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
                      checked={customerConfig[product._id]?.visible || false}
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
                      className="table-product-image"
                      onError={(e) => {
                        e.target.src = "/no-image.png";
                      }}
                    />
                  </td>

                  {/* PRODUCT ID */}

                  <td>{product.productId}</td>

                  {/* NAME */}

                  <td>{product.name}</td>

                  {/* SIZE */}

                  <td>
                    <select
                      className="table-input"
                      value={customerConfig[product._id]?.selectedSize || ""}
                      onChange={(e) =>
                        handleChange(
                          product._id,
                          "selectedSize",
                          e.target.value,
                        )
                      }
                    >
                      <option value="">Select Size</option>

                      {product.sizes?.map((sizeObj, index) => (
                        <option key={index} value={sizeObj.size}>
                          {sizeObj.size}
                        </option>
                      ))}
                    </select>
                  </td>

                  {/* MRP */}

                  <td>₹{getProductMRP(product)}</td>

                  {/* DESCRIPTION */}

                  <td>
                    <input
                      type="text"
                      placeholder="Product description"
                      value={customerConfig[product._id]?.description || ""}
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
                      value={customerConfig[product._id]?.discount || ""}
                      onChange={(e) =>
                        handleChange(product._id, "discount", e.target.value)
                      }
                      className="table-input"
                    />
                  </td>

                  {/* FINAL PRICE */}

                  <td>
                    ₹
                    {getFinalPrice(
                      product,
                      customerConfig[product._id]?.discount,
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

export default CustomerProducts;
