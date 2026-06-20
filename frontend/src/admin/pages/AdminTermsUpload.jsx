// src/admin/pages/AdminTermsUpload.jsx

import { useState } from "react";
import axios from "axios";

import "./adminpages.css";

const AdminTermsUpload = () => {
  const token = localStorage.getItem("adminToken");

  /* =========================
     STATE
  ========================= */
  const [file, setFile] = useState(null);

  const [loading, setLoading] = useState(false);

  /* =========================
     HANDLE FILE CHANGE
  ========================= */
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];

    if (!selectedFile) return;

    /* PDF VALIDATION */
    if (selectedFile.type !== "application/pdf") {
      alert("Only PDF files are allowed");

      return;
    }

    setFile(selectedFile);
  };

  /* =========================
     UPLOAD FILE
  ========================= */
  const uploadFile = async () => {
    try {
      if (!file) {
        alert("Please select a PDF file");

        return;
      }

      setLoading(true);

      const formData = new FormData();

      formData.append("file", file);

      await axios.post("http://localhost:5000/api/terms/upload", formData, {
        headers: {
          Authorization: `Bearer ${token}`,

          "Content-Type": "multipart/form-data",
        },
      });

      alert("Terms & Conditions uploaded successfully ✅");

      setFile(null);
    } catch (error) {
      console.error("UPLOAD TERMS ERROR:", error);

      alert("Failed to upload file ❌");
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     DELETE FILE
  ========================= */
  const deleteFile = async () => {
    try {
      const confirmDelete = window.confirm(
        "Are you sure you want to delete the Terms & Conditions file?",
      );

      if (!confirmDelete) return;

      setLoading(true);

      await axios.delete("http://localhost:5000/api/terms", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      alert("Terms & Conditions deleted successfully ❌");

      setFile(null);
    } catch (error) {
      console.error("DELETE TERMS ERROR:", error);

      alert("Failed to delete file ❌");
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     UI
  ========================= */
  return (
    <div className="terms-page">
      {/* HEADER */}
      <div className="terms-header">
        <h2>Terms & Conditions</h2>

        <p>
          Upload and manage Terms & Conditions PDF for dealers and customers.
        </p>
      </div>

      {/* CARD */}
      <div className="terms-card">
        {/* FILE INPUT */}
        <div className="terms-input-group">
          <label>Select PDF File</label>

          <input
            type="file"
            accept="application/pdf"
            onChange={handleFileChange}
          />
        </div>

        {/* FILE PREVIEW */}
        {file && (
          <div className="selected-file">
            <span>📄 {file.name}</span>
          </div>
        )}

        {/* ACTION BUTTONS */}
        <div className="terms-actions">
          <button
            className="upload-btn"
            onClick={uploadFile}
            disabled={loading}
          >
            {loading ? "Uploading..." : "Upload PDF"}
          </button>

          <button
            className="delete-terms-btn"
            onClick={deleteFile}
            disabled={loading}
          >
            Delete PDF
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminTermsUpload;
