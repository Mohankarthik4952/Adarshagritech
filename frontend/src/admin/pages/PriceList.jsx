// src/admin/pages/PriceList.jsx

import { useEffect, useState } from "react";
import API_URL from "../../config/api";
import "./adminpages.css";

const PriceList = () => {
  const token = localStorage.getItem("adminToken");

  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState(null);
  const [lists, setLists] = useState([]);

  /* =========================
     FETCH PRICE LISTS
  ========================= */

  const fetchLists = async () => {
    try {
      setLoading(true);

      const res = await fetch(`${API_URL}/api/admin/pricelist`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      setLists(
        Array.isArray(data)
          ? data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          : [],
      );
    } catch (error) {
      console.error("FETCH PRICE LIST ERROR:", error);

      setLists([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLists();
  }, []);

  /* =========================
     UPLOAD IMAGE
  ========================= */

  const handleUpload = async () => {
    try {
      if (!file) {
        alert("Please select an image");
        return;
      }

      const allowedTypes = ["image/png", "image/jpg", "image/jpeg"];

      if (!allowedTypes.includes(file.type)) {
        alert("Only PNG, JPG and JPEG images are allowed");
        return;
      }

      const formData = new FormData();

      // must match backend upload.single("file")
      formData.append("file", file);

      setLoading(true);

      const res = await fetch(`${API_URL}/api/admin/pricelist/upload`, {
        method: "POST",

        headers: {
          Authorization: `Bearer ${token}`,
        },

        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Upload failed");
      }

      alert("Price list image uploaded successfully ✅");

      setFile(null);

      document.getElementById("priceListInput").value = "";

      fetchLists();
    } catch (error) {
      console.error("UPLOAD ERROR:", error);

      alert(error.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     DELETE IMAGE
  ========================= */

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this image?",
    );

    if (!confirmDelete) return;

    try {
      const res = await fetch(`${API_URL}/api/admin/pricelist/${id}`, {
        method: "DELETE",

        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message);
      }

      alert("Price list deleted successfully");

      fetchLists();
    } catch (error) {
      console.error(error);

      alert("Delete failed");
    }
  };

  /* =========================
     VIEW IMAGE
  ========================= */

  const handleView = (filePath) => {
    window.open(`${API_URL}${filePath}`, "_blank");
  };

  return (
    <div className="price-list-page">
      {/* HEADER */}

      <div className="price-header">
        <h2>Price List Management</h2>

        <p>Upload and manage dealer price list images.</p>
      </div>

      {/* UPLOAD */}

      <div className="upload-box">
        <input
          id="priceListInput"
          type="file"
          accept=".png,.jpg,.jpeg,image/png,image/jpeg"
          onChange={(e) => setFile(e.target.files[0])}
        />

        <button onClick={handleUpload} disabled={loading}>
          {loading ? "Uploading..." : "Upload Image"}
        </button>
      </div>

      {/* EMPTY */}

      {!loading && lists.length === 0 && (
        <div className="empty-price-list">No price list images uploaded</div>
      )}

      {/* IMAGE GRID */}

      <div className="price-files-grid">
        {lists.map((item) => (
          <div key={item._id} className="price-file-card">
            <img
              src={`${API_URL}${item.filePath}`}
              alt={item.fileName}
              className="price-list-image"
            />

            <h4>{item.fileName}</h4>

            <div className="file-actions">
              <button
                className="download-btn"
                onClick={() => handleView(item.filePath)}
              >
                View
              </button>

              <button
                className="delete-btn"
                onClick={() => handleDelete(item._id)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PriceList;
