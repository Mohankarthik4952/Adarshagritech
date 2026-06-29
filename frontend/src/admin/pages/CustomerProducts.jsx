import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";

import API_URL from "../../config/api";
import "./adminpages.css";

const CustomerProducts = () => {
  const navigate = useNavigate();

  /* =========================
     STATE
  ========================= */

  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [customerConfig, setCustomerConfig] = useState({});
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  /* =========================
     TOKEN
  ========================= */

  const getToken = () => localStorage.getItem("adminToken");

  /* =========================
     FETCH PRODUCTS
  ========================= */

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const token = getToken();

      if (!token) {
        alert("Admin session expired. Please login again.");

        navigate("/admin/login");

        return;
      }

      const res = await fetch(`${API_URL}/api/customer-products/admin/all`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (res.status === 401) {
        localStorage.removeItem("adminToken");

        alert("Session expired. Please login again.");

        navigate("/admin/login");

        return;
      }

      if (!res.ok) {
        throw new Error(data.message || "Failed to fetch products");
      }

      const safeProducts = Array.isArray(data)
        ? data
        : Array.isArray(data.products)
          ? data.products
          : [];

      setProducts(safeProducts);

      const initial = {};

      safeProducts.forEach((product) => {
        initial[product._id] = {
          visible: product.visibleToCustomers || false,

          description: product.customerDescription || "",

          price:
            product.customerPrice ??
            product.sizes?.find(
              (s) =>
                s.size ===
                (product.customerSelectedSize || product.sizes?.[0]?.size),
            )?.price ??
            0,

          discount: product.customerDiscountPercent || "",

          selectedSize:
            product.customerSelectedSize || product.sizes?.[0]?.size || "",
        };
      });

      setCustomerConfig(initial);
    } catch (error) {
      console.error("FETCH CUSTOMER PRODUCTS ERROR:", error);

      setError(error.message || "Failed to load products");

      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  /* =========================
     HANDLE CHANGE
  ========================= */

  const handleChange = (productId, field, value) => {
    setCustomerConfig((prev) => ({
      ...prev,

      [productId]: {
        ...prev[productId],

        [field]:
          field === "discount"
            ? Math.min(100, Math.max(0, Number(value) || 0))
            : field === "price"
              ? Math.max(0, Number(value) || 0)
              : value,
      },
    }));
  };

  /* =========================
     SELECTED SIZE
  ========================= */

  const getSelectedSizeData = (product) => {
    const selectedSize = customerConfig[product._id]?.selectedSize;

    return (
      product.sizes?.find((size) => size.size === selectedSize) ||
      product.sizes?.[0]
    );
  };

  /* =========================
     PRODUCT MRP
  ========================= */

  const getProductMRP = (product) => {
    const sizeData = getSelectedSizeData(product);

    return Number(sizeData?.mrp || 0);
  };

  /* =========================
     FINAL PRICE
  ========================= */
  const getFinalPrice = (price, discount) => {
    const priceValue = Number(price || 0);
    const discountValue = Number(discount || 0);

    const discountedPrice =
      discountValue > 0
        ? priceValue - (priceValue * discountValue) / 100
        : priceValue;

    return discountedPrice.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  /* =========================
     SAVE PRODUCTS
  ========================= */

  const saveCustomerProducts = async () => {
    try {
      if (loading) return;

      const invalidProduct = products.find((product) => {
        const config = customerConfig[product._id];

        return (
          config?.visible &&
          (!config.description?.trim() ||
            config.discount === "" ||
            !config.selectedSize)
        );
      });

      if (invalidProduct) {
        alert("Description, Size and Discount are required");

        return;
      }

      setLoading(true);

      const token = getToken();

      if (!token) {
        alert("Admin session expired.");

        navigate("/admin/login");

        return;
      }

      const payload = filteredProducts.map((product) => ({
        productId: product._id,

        selected: customerConfig[product._id]?.visible || false,

        description: customerConfig[product._id]?.description || "",

        price: Number(customerConfig[product._id]?.price || 0),

        discount: Number(customerConfig[product._id]?.discount || 0),

        selectedSize: customerConfig[product._id]?.selectedSize || "",
      }));

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

      if (res.status === 401) {
        localStorage.removeItem("adminToken");

        alert("Session expired. Please login again.");

        navigate("/admin/login");

        return;
      }

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
  const filteredProducts = products.filter((product) => {
    const keyword = search.toLowerCase();

    return (
      product.productId?.toLowerCase().includes(keyword) ||
      product.name?.toLowerCase().includes(keyword)
    );
  });

  /* =========================
     LOADING
  ========================= */

  if (loading && filteredProducts.length === 0) {
    return (
      <div className="dealer-products-page">
        <div className="loading-box">
          <h2>Loading products...</h2>
        </div>
      </div>
    );
  }

  /* =========================
     ERROR
  ========================= */

  if (error) {
    return (
      <div className="dealer-products-page">
        <div className="error-box">
          <h2>{error}</h2>

          <button className="save-btn" onClick={fetchProducts}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="dealer-products-page">
      <div className="page-header">
        <h2>Customer Products Management</h2>

        <input
          type="text"
          className="search-input"
          placeholder="Search Product ID or Name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <button
          className="save-btn"
          onClick={saveCustomerProducts}
          disabled={loading}
        >
          {loading ? "Saving..." : "Save Customer Products"}
        </button>
      </div>

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
              <th>Price</th>
              <th>Description</th>
              <th>Discount %</th>
              <th>Final Price</th>
            </tr>
          </thead>

          <tbody>
            {filteredProducts.length === 0 ? (
              <tr>
                <td colSpan="9" style={{ textAlign: "center" }}>
                  No products found
                </td>
              </tr>
            ) : (
              filteredProducts.map((product) => (
                <tr key={product._id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={customerConfig[product._id]?.visible || false}
                      onChange={(e) =>
                        handleChange(product._id, "visible", e.target.checked)
                      }
                    />
                  </td>

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

                  <td>{product.productId}</td>

                  <td>{product.name}</td>

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

                  <td>₹{getProductMRP(product).toLocaleString("en-IN")}</td>

                  <td>
                    <input
                      type="number"
                      min="0"
                      placeholder="Price"
                      value={customerConfig[product._id]?.price || ""}
                      onChange={(e) =>
                        handleChange(product._id, "price", e.target.value)
                      }
                      className="table-input"
                    />
                  </td>

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

                  <td>
                    ₹
                    {getFinalPrice(
                      customerConfig[product._id]?.price,
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
