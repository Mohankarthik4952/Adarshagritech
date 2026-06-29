import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";

import API_URL from "../../config/api";
import "./adminpages.css";

const DealerProducts = () => {
  const navigate = useNavigate();

  /* =================================
     STATES
  ================================= */

  const [products, setProducts] = useState([]);
  const [dealerConfig, setDealerConfig] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  /* =================================
     TOKEN
  ================================= */

  const getToken = () => localStorage.getItem("adminToken");

  /* =================================
     FETCH PRODUCTS
  ================================= */

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

      const res = await fetch(`${API_URL}/api/admin/products`, {
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
        const selectedSize = product.sizes?.[0];

        initial[product._id] = {
          selectedSize: selectedSize?.size || "",

          price:
            selectedSize?.price !== undefined && selectedSize?.price !== null
              ? String(selectedSize.price)
              : "",

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
            selectedSize?.stockQuantity !== undefined &&
            selectedSize?.stockQuantity !== null
              ? String(selectedSize.stockQuantity)
              : "0",
        };
      });

      setDealerConfig(initial);
    } catch (error) {
      console.error("FETCH DEALER PRODUCTS ERROR:", error);

      setError(error.message || "Failed to load products");

      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  /* =================================
     HANDLE CHANGE
  ================================= */

  const handleChange = (productId, field, value) => {
    let updatedValue = value;

    if (field === "discount" || field === "gst") {
      updatedValue = Math.min(100, Math.max(0, Number(value) || 0));
    }

    if (field === "stockQuantity" || field === "price") {
      updatedValue = Math.max(0, Number(value) || 0);
    }

    setDealerConfig((prev) => ({
      ...prev,

      [productId]: {
        ...prev[productId],

        [field]: updatedValue,
      },
    }));
  };

  /* =================================
     SAVE DEALER PRODUCTS
  ================================= */

  const saveDealerProducts = async () => {
    try {
      if (loading) return;

      setLoading(true);

      const token = getToken();

      if (!token) {
        alert("Admin session expired. Please login again.");

        navigate("/admin/login");

        return;
      }

      const payload = filteredProducts.map((product) => ({
        productId: product._id,

        selected: dealerConfig[product._id]?.visible || false,

        description: dealerConfig[product._id]?.description || "",

        price: Number(dealerConfig[product._id]?.price || 0),

        discount: Number(dealerConfig[product._id]?.discount || 0),

        gstPercent: Number(dealerConfig[product._id]?.gst || 0),

        stockQuantity: Number(dealerConfig[product._id]?.stockQuantity || 0),

        selectedSize:
          dealerConfig[product._id]?.selectedSize ||
          product.sizes?.[0]?.size ||
          "",
      }));

      const response = await fetch(`${API_URL}/api/admin/dealer-products`, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",

          Authorization: `Bearer ${token}`,
        },

        body: JSON.stringify({
          products: payload,
        }),
      });

      const data = await response.json();

      if (response.status === 401) {
        localStorage.removeItem("adminToken");

        alert("Session expired. Please login again.");

        navigate("/admin/login");

        return;
      }

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

    return `${API_URL}${image}`;
  };

  /* =================================
     FINAL PRICE
  ================================= */

  const getFinalPrice = (price, discount, gst) => {
    const priceValue = Number(price || 0);

    const discountValue = Number(discount || 0);

    const gstValue = Number(gst || 0);

    const discountedPrice =
      discountValue > 0
        ? priceValue - (priceValue * discountValue) / 100
        : priceValue;

    const gstAmount = (discountedPrice * gstValue) / 100;

    return (discountedPrice + gstAmount).toFixed(2);
  };

  const filteredProducts = products.filter((product) => {
    const keyword = search.toLowerCase();

    return (
      product.productId?.toLowerCase().includes(keyword) ||
      product.name?.toLowerCase().includes(keyword)
    );
  });

  /* =================================
     LOADING
  ================================= */

  if (loading && filteredProducts.length === 0) {
    return (
      <div className="dealer-products-page">
        <div className="loading-box">
          <h2>Loading products...</h2>
        </div>
      </div>
    );
  }

  /* =================================
     ERROR
  ================================= */

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
        <h2>Dealer Products Management</h2>

        <input
          type="text"
          placeholder="Search Product ID or Name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-input"
        />

        <button
          className="save-btn"
          onClick={saveDealerProducts}
          disabled={loading}
        >
          {loading ? "Saving..." : "Save Dealer Products"}
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
              <th>Cases Left</th>
              <th>Size</th>
              <th>MRP</th>
              <th>Price</th>
              <th>Description</th>
              <th>Discount %</th>
              <th>GST %</th>
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
                      checked={dealerConfig[product._id]?.visible || false}
                      onChange={(e) =>
                        handleChange(product._id, "visible", e.target.checked)
                      }
                    />
                  </td>

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

                  <td>{product.productId}</td>

                  <td>{product.name}</td>

                  <td>
                    <input
                      type="number"
                      min="0"
                      className="table-input"
                      value={dealerConfig[product._id]?.stockQuantity || ""}
                      onChange={(e) =>
                        handleChange(
                          product._id,
                          "stockQuantity",
                          e.target.value,
                        )
                      }
                    />
                  </td>
                  <td>
                    <select
                      className="table-input"
                      value={dealerConfig[product._id]?.selectedSize || ""}
                      onChange={(e) => {
                        const selected = product.sizes.find(
                          (s) => s.size === e.target.value,
                        );

                        setDealerConfig((prev) => ({
                          ...prev,
                          [product._id]: {
                            ...prev[product._id],
                            selectedSize: selected.size,
                            price: selected.price || "",
                            stockQuantity: selected.stockQuantity || 0,
                          },
                        }));
                      }}
                    >
                      {product.sizes.map((size) => (
                        <option key={size.size} value={size.size}>
                          {size.size}
                        </option>
                      ))}
                    </select>
                  </td>

                  <td>
                    ₹
                    {Number(
                      product.sizes.find(
                        (s) =>
                          s.size === dealerConfig[product._id]?.selectedSize,
                      )?.mrp || 0,
                    ).toFixed(2)}
                  </td>
                  <td>
                    <input
                      type="number"
                      min="0"
                      className="table-input"
                      placeholder="Price"
                      value={dealerConfig[product._id]?.price || ""}
                      onChange={(e) =>
                        handleChange(product._id, "price", e.target.value)
                      }
                    />
                  </td>

                  <td>
                    <input
                      type="text"
                      className="table-input"
                      placeholder="Description"
                      value={dealerConfig[product._id]?.description || ""}
                      onChange={(e) =>
                        handleChange(product._id, "description", e.target.value)
                      }
                    />
                  </td>

                  <td>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      className="table-input"
                      placeholder="Discount %"
                      value={dealerConfig[product._id]?.discount || ""}
                      onChange={(e) =>
                        handleChange(product._id, "discount", e.target.value)
                      }
                    />
                  </td>

                  <td>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      className="table-input"
                      placeholder="GST %"
                      value={dealerConfig[product._id]?.gst || ""}
                      onChange={(e) =>
                        handleChange(product._id, "gst", e.target.value)
                      }
                    />
                  </td>

                  <td>
                    ₹
                    {getFinalPrice(
                      dealerConfig[product._id]?.price,
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
