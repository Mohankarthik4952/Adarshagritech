// src/admin/pages/AddProduct.jsx

import { useEffect, useState } from "react";
import API_URL from "../../config/api";

import "./adminpages.css";

const AddProduct = () => {
  const token = localStorage.getItem("adminToken");

  /* =========================
     STATE
  ========================= */

  const [loading, setLoading] = useState(false);

  const [products, setProducts] = useState([]);

  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    productId: "",
    name: "",
    images: [],
    stockStatus: "AVAILABLE",
    sizes: [],
  });

  const [sizeInputs, setSizeInputs] = useState({});

  const availableSizes = [
    "1L",
    "500ml",
    "250ml",
    "275ml",
    "495ml",
    "120gms",
    "495ml",
    "350gms",
    "300gms",
    "250gms",
    "125gms",
  ];

  /* =========================
     FETCH PRODUCTS
  ========================= */

  const fetchProducts = async () => {
    try {
      const res = await fetch(`${API_URL}/api/admin/products`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to fetch products");
      }

      setProducts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("FETCH PRODUCTS ERROR:", error);

      setProducts([]);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  /* =========================
     HANDLE SIZE CHANGE
  ========================= */

  const handleSizeChange = (size) => {
    let updatedSizes = [...form.sizes];

    if (updatedSizes.includes(size)) {
      updatedSizes = updatedSizes.filter((s) => s !== size);
    } else {
      updatedSizes.push(size);
    }

    setForm({
      ...form,

      sizes: updatedSizes,
    });
  };

  /* =========================
     HANDLE SIZE INPUT
  ========================= */

  const handleSizeInput = (size, field, value) => {
    setSizeInputs((prev) => ({
      ...prev,

      [size]: {
        ...(prev[size] || {}),

        [field]: value,
      },
    }));
  };

  /* =========================
     HANDLE IMAGE
  ========================= */

  const handleImage = (e) => {
    const selectedImages = Array.from(e.target.files).slice(0, 2);

    setForm({
      ...form,
      images: selectedImages,
    });
  };

  /* =========================
     RESET FORM
  ========================= */

  const resetForm = () => {
    setForm({
      productId: "",
      name: "",
      images: [],
      stockStatus: "AVAILABLE",
      sizes: [],
    });

    setSizeInputs({});

    setEditingId(null);
  };

  /* =========================
     HANDLE EDIT
  ========================= */

  const handleEdit = (product) => {
    setEditingId(product._id);

    setForm({
      productId: product.productId,
      name: product.name,
      images: [],
      stockStatus: product.stockStatus,
      sizes: product.sizes.map((s) => s.size),
    });

    const updatedInputs = {};

    product.sizes.forEach((sizeObj) => {
      updatedInputs[sizeObj.size] = {
        mrp: sizeObj.mrp,

        bottlesPerCase: sizeObj.bottlesPerCase,
      };
    });

    setSizeInputs(updatedInputs);

    window.scrollTo({
      top: 0,

      behavior: "smooth",
    });
  };

  /* =========================
     HANDLE DELETE
  ========================= */

  const handleDelete = async (id) => {
    try {
      const confirmDelete = window.confirm(
        "Are you sure you want to delete this product?",
      );

      if (!confirmDelete) {
        return;
      }

      const res = await fetch(`${API_URL}/api/admin/products/${id}`, {
        method: "DELETE",

        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to delete product");
      }

      alert("Product deleted successfully ✅");

      fetchProducts();
    } catch (error) {
      console.error("DELETE PRODUCT ERROR:", error);

      alert(error.message || "Failed to delete product");
    }
  };

  /* =========================
     SAVE PRODUCT
  ========================= */

  const saveProduct = async () => {
    try {
      /* VALIDATION */

      if (!form.productId.trim()) {
        alert("Enter Product ID");

        return;
      }

      if (!form.name.trim()) {
        alert("Enter Product Name");

        return;
      }

      if (!editingId && form.images.length === 0) {
        alert("Add at least one product image");
        return;
      }

      if (form.sizes.length === 0) {
        alert("Select at least one size");

        return;
      }

      /* SIZE VALIDATION */

      const invalidSizes = form.sizes.filter(
        (size) =>
          !sizeInputs[size]?.mrp ||
          Number(sizeInputs[size]?.mrp) <= 0 ||
          !sizeInputs[size]?.bottlesPerCase ||
          Number(sizeInputs[size]?.bottlesPerCase) <= 0,
      );

      if (invalidSizes.length > 0) {
        alert("Enter valid MRP and Bottles per Case for all selected sizes");

        return;
      }

      /* SIZE DATA */

      const sizeData = form.sizes.map((size) => ({
        size,

        mrp: Number(sizeInputs[size]?.mrp),

        bottlesPerCase: Number(sizeInputs[size]?.bottlesPerCase),
      }));

      /* FORM DATA */

      const formData = new FormData();

      formData.append("productId", form.productId.trim());

      formData.append("name", form.name.trim());

      formData.append("stockStatus", form.stockStatus);

      if (form.images.length > 0) {
        form.images.forEach((file) => {
          formData.append("images", file);
        });
      }

      formData.append("sizes", JSON.stringify(sizeData));

      setLoading(true);

      let res;

      /* UPDATE */

      if (editingId) {
        res = await fetch(`${API_URL}/api/admin/products/${editingId}`, {
          method: "PUT",

          headers: {
            Authorization: `Bearer ${token}`,
          },

          body: formData,
        });
      } else {
        /* ADD */
        res = await fetch(`${API_URL}/api/admin/products`, {
          method: "POST",

          headers: {
            Authorization: `Bearer ${token}`,
          },

          body: formData,
        });
      }

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to save product");
      }

      alert(
        editingId
          ? "Product updated successfully ✅"
          : "Product added successfully ✅",
      );

      resetForm();

      fetchProducts();
    } catch (error) {
      console.error("SAVE PRODUCT ERROR:", error);

      alert(error.message || "Failed to save product");
    } finally {
      setLoading(false);
    }
  };

  /* =========================
   IMAGE URL
========================= */

  const getImageUrl = (image) => {
    if (!image) return "";

    // Handle object format
    if (typeof image === "object") {
      image = image.url || image.path || "";
    }

    // Convert Windows paths
    image = String(image).replace(/\\/g, "/");

    // External URL
    if (image.startsWith("http")) {
      return image;
    }

    // Ensure leading slash
    const cleanPath = image.startsWith("/") ? image : `/${image}`;

    return `${API_URL}${cleanPath}`;
  };

  /* =========================
     UI
  ========================= */

  return (
    <div className="page-container">
      <h2>{editingId ? "Edit Product" : "Add Product"}</h2>

      {/* FORM */}

      <div className="product-form">
        <input
          type="text"
          placeholder="Product ID"
          value={form.productId}
          onChange={(e) =>
            setForm({
              ...form,

              productId: e.target.value,
            })
          }
        />

        <input
          type="text"
          placeholder="Product Name"
          value={form.name}
          onChange={(e) =>
            setForm({
              ...form,

              name: e.target.value,
            })
          }
        />

        <input type="file" accept="image/*" multiple onChange={handleImage} />

        <select
          value={form.stockStatus}
          onChange={(e) =>
            setForm({
              ...form,

              stockStatus: e.target.value,
            })
          }
        >
          <option value="AVAILABLE">Available</option>

          <option value="NOT_AVAILABLE">Not Available</option>
        </select>
      </div>

      {/* SIZE CHECKBOXES */}

      <h3>Select Available Sizes</h3>

      <div className="size-checkboxes">
        {availableSizes.map((size) => (
          <label key={size}>
            <input
              type="checkbox"
              checked={form.sizes.includes(size)}
              onChange={() => handleSizeChange(size)}
            />

            {size}
          </label>
        ))}
      </div>

      {/* SIZE TABLE */}

      {form.sizes.length > 0 && (
        <div className="table-wrapper">
          <table className="size-table">
            <thead>
              <tr>
                <th>Size</th>

                <th>MRP per Bottle</th>

                <th>Bottles per Case</th>
              </tr>
            </thead>

            <tbody>
              {form.sizes.map((size) => (
                <tr key={size}>
                  <td>{size}</td>

                  <td>
                    <input
                      type="number"
                      placeholder="MRP"
                      value={sizeInputs[size]?.mrp || ""}
                      onChange={(e) =>
                        handleSizeInput(size, "mrp", e.target.value)
                      }
                    />
                  </td>

                  <td>
                    <input
                      type="number"
                      placeholder="Bottles"
                      value={sizeInputs[size]?.bottlesPerCase || ""}
                      onChange={(e) =>
                        handleSizeInput(size, "bottlesPerCase", e.target.value)
                      }
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* SAVE BUTTON */}

      <button
        className="save-product-btn"
        onClick={saveProduct}
        disabled={loading}
      >
        {loading
          ? editingId
            ? "Updating..."
            : "Saving..."
          : editingId
            ? "Update Product"
            : "Save Product"}
      </button>

      {/* PRODUCTS LIST */}

      <h3>Products List</h3>

      <div className="table-wrapper">
        <table className="products-table">
          <thead>
            <tr>
              <th>Product ID</th>

              <th>Image</th>

              <th>Name</th>

              <th>Sizes</th>

              <th>Stock</th>

              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {products.length === 0 ? (
              <tr>
                <td
                  colSpan="6"
                  style={{
                    textAlign: "center",
                  }}
                >
                  No products found
                </td>
              </tr>
            ) : (
              products.map((p) => (
                <tr key={p._id}>
                  <td>{p.productId}</td>

                  <td>
                    {p.images?.length > 0 ? (
                      <div className="product-images">
                        {p.images.map((image, index) => (
                          <img
                            key={index}
                            src={getImageUrl(image)}
                            alt={p.name}
                            className="product-thumbnail"
                            onError={(e) => {
                              e.target.style.display = "none";
                            }}
                          />
                        ))}
                      </div>
                    ) : p.image ? (
                      <img
                        src={getImageUrl(p.image)}
                        alt={p.name}
                        className="product-thumbnail"
                        onError={(e) => {
                          e.target.style.display = "none";
                        }}
                      />
                    ) : (
                      "No Image"
                    )}
                  </td>

                  <td>{p.name}</td>

                  <td>{(p.sizes || []).map((s) => s.size).join(", ")}</td>

                  <td>{p.stockStatus}</td>

                  <td>
                    <div className="action-buttons">
                      <button
                        className="edit-btn"
                        onClick={() => handleEdit(p)}
                      >
                        Edit
                      </button>

                      <button
                        className="delete-btn"
                        onClick={() => handleDelete(p._id)}
                      >
                        Delete
                      </button>
                    </div>
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

export default AddProduct;
