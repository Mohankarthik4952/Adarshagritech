// src/admin/pages/PriceList.jsx

import { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";

import API_URL from "../../config/api";

import "./adminpages.css";

const PriceList = () => {
  const navigate = useNavigate();

  const fileInputRef = useRef(null);

  /* =========================
     STATES
  ========================= */

  const [lists, setLists] = useState([]);
  const [file, setFile] = useState(null);

  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const [deletingId, setDeletingId] = useState("");

  /* =========================
     IMAGE URL
  ========================= */

  const getFileUrl = (path) => {
    if (!path) return "";

    if (path.startsWith("http")) {
      return path;
    }

    return `${API_URL}${path}`;
  };

  /* =========================
     FETCH PRICE LISTS
  ========================= */

  const fetchLists = useCallback(async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("adminToken");

      if (!token) {
        navigate("/admin/login");
        return;
      }

      const response = await fetch(`${API_URL}/api/admin/pricelist`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.status === 401) {
        localStorage.removeItem("adminToken");
        localStorage.removeItem("admin");
        localStorage.removeItem("adminAuth");

        navigate("/admin/login");
        return;
      }

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch price lists");
      }

      const safeLists = Array.isArray(data)
        ? data
        : Array.isArray(data.priceLists)
          ? data.priceLists
          : [];

      safeLists.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      setLists(safeLists);
    } catch (error) {
      console.error("FETCH PRICE LIST ERROR:", error);

      alert(error.message || "Failed to load price lists");

      setLists([]);
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchLists();
  }, [fetchLists]);

  /* =========================
     FILE CHANGE
  ========================= */

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];

    if (!selectedFile) return;

    const allowedTypes = ["image/png", "image/jpg", "image/jpeg"];

    if (!allowedTypes.includes(selectedFile.type)) {
      alert("Only PNG, JPG and JPEG images are allowed");

      e.target.value = "";

      return;
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
      alert("Maximum file size allowed is 5 MB");

      e.target.value = "";

      return;
    }

    setFile(selectedFile);
  };

  /* =========================
     UPLOAD IMAGE
  ========================= */

  const handleUpload = async () => {
    try {
      if (uploading) return;

      if (!file) {
        alert("Please select an image");
        return;
      }

      const token = localStorage.getItem("adminToken");

      if (!token) {
        navigate("/admin/login");
        return;
      }

      setUploading(true);

      const formData = new FormData();

      formData.append("file", file);

      const response = await fetch(`${API_URL}/api/admin/pricelist/upload`, {
        method: "POST",

        headers: {
          Authorization: `Bearer ${token}`,
        },

        body: formData,
      });

      const data = await response.json();

      if (response.status === 401) {
        localStorage.removeItem("adminToken");

        navigate("/admin/login");

        return;
      }

      if (!response.ok) {
        throw new Error(data.message || "Upload failed");
      }

      alert("Price list uploaded successfully ✅");

      setFile(null);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      await fetchLists();
    } catch (error) {
      console.error("UPLOAD ERROR:", error);

      alert(error.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  /* =========================
     DELETE IMAGE
  ========================= */

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this price list?",
    );

    if (!confirmed) return;

    try {
      setDeletingId(id);

      const token = localStorage.getItem("adminToken");

      const response = await fetch(`${API_URL}/api/admin/pricelist/${id}`, {
        method: "DELETE",

        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.status === 401) {
        localStorage.removeItem("adminToken");

        navigate("/admin/login");

        return;
      }

      if (!response.ok) {
        throw new Error(data.message || "Delete failed");
      }

      alert("Price list deleted successfully");

      setLists((prev) => prev.filter((item) => item._id !== id));
    } catch (error) {
      console.error("DELETE ERROR:", error);

      alert(error.message || "Delete failed");
    } finally {
      setDeletingId("");
    }
  };

  /* =========================
     VIEW IMAGE
  ========================= */

  const handleView = (filePath) => {
    window.open(getFileUrl(filePath), "_blank");
  };

  return (
    <div className="price-list-page">
      <div className="price-header">
        <div>
          <h2>Price List Management</h2>

          <p>Upload and manage dealer price list images.</p>
        </div>

        <button className="refresh-btn" onClick={fetchLists} disabled={loading}>
          Refresh
        </button>
      </div>

      <div className="upload-box">
        <input
          ref={fileInputRef}
          type="file"
          accept=".png,.jpg,.jpeg,image/png,image/jpeg"
          onChange={handleFileChange}
        />

        <button onClick={handleUpload} disabled={uploading}>
          {uploading ? "Uploading..." : "Upload Image"}
        </button>
      </div>

      {file && (
        <div className="preview-box">
          <h4>Preview</h4>

          <img
            src={URL.createObjectURL(file)}
            alt="Preview"
            className="price-list-image"
          />

          <p>{file.name}</p>
        </div>
      )}

      {loading ? (
        <div className="loading-box">
          <h3>Loading price lists...</h3>
        </div>
      ) : lists.length === 0 ? (
        <div className="empty-price-list">No price list images uploaded</div>
      ) : (
        <div className="price-files-grid">
          {lists.map((item) => (
            <div key={item._id} className="price-file-card">
              <img
                src={getFileUrl(item.filePath)}
                alt={item.fileName}
                className="price-list-image"
                loading="lazy"
              />

              <h4>{item.fileName || "Price List"}</h4>

              <small>
                {new Date(item.createdAt).toLocaleDateString("en-IN")}
              </small>

              <div className="file-actions">
                <button
                  className="download-btn"
                  onClick={() => handleView(item.filePath)}
                >
                  View
                </button>

                <button
                  className="delete-btn"
                  disabled={deletingId === item._id}
                  onClick={() => handleDelete(item._id)}
                >
                  {deletingId === item._id ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PriceList;
