import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import API_URL from "../../config/api";
import getImageUrl from "../../utils/getImageUrl";

import "./dealerpages.css";

const Documents = () => {
  const navigate = useNavigate();

  /* =================================
     GET DEALER DATA
  ================================= */

  const dealer =
    JSON.parse(localStorage.getItem("dealerAuth")) ||
    JSON.parse(localStorage.getItem("dealer")) ||
    {};

  const dealerId = dealer._id;

  /* =================================
     STATES
  ================================= */

  const [documents, setDocuments] = useState({
    gstCertificate: null,
    shopPhoto: null,
    dealerSelfie: null,
  });

  const [uploadedDocs, setUploadedDocs] = useState({});

  const [uploading, setUploading] = useState(false);

  /* =================================
     FETCH DOCUMENTS
  ================================= */

  const fetchDocuments = async () => {
    try {
      const token = localStorage.getItem("dealerToken");

      if (!token || !dealerId) {
        navigate("/dealer/login");
        return;
      }

      const response = await fetch(`${API_URL}/api/documents/${dealerId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load documents");
      }

      setUploadedDocs(data);
    } catch (error) {
      console.error("FETCH DOCUMENTS ERROR:", error);

      alert(error.message || "Failed to load documents");
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [dealerId]);

  /* =================================
     HANDLE FILE CHANGE
  ================================= */

  const handleFileChange = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      alert("Only JPG, PNG and WEBP images are allowed");

      e.target.value = "";

      return;
    }

    setDocuments((prev) => ({
      ...prev,
      [e.target.name]: file,
    }));
  };

  /* =================================
     UPLOAD DOCUMENTS
  ================================= */

  const uploadDocuments = async () => {
    try {
      if (uploading) return;

      const token = localStorage.getItem("dealerToken");

      if (!token || !dealerId) {
        alert("Please login again");

        navigate("/dealer/login");

        return;
      }

      const hasFiles = Object.values(documents).some((file) => file !== null);

      if (!hasFiles) {
        alert("Please select at least one document");

        return;
      }

      setUploading(true);

      const formData = new FormData();

      formData.append("dealerId", dealerId);

      Object.keys(documents).forEach((key) => {
        if (documents[key]) {
          formData.append(key, documents[key]);
        }
      });

      const response = await fetch(`${API_URL}/api/documents/upload`, {
        method: "POST",

        headers: {
          Authorization: `Bearer ${token}`,
        },

        body: formData,
      });

      const data = await response.json();

      if (response.status === 401) {
        localStorage.removeItem("dealerToken");

        alert("Session expired. Please login again.");

        navigate("/dealer/login");

        return;
      }

      if (!response.ok) {
        throw new Error(data.message || "Upload failed");
      }

      alert("Documents uploaded successfully ✅");

      setDocuments({
        gstCertificate: null,
        shopPhoto: null,
        dealerSelfie: null,
      });

      await fetchDocuments();
    } catch (error) {
      console.error("UPLOAD ERROR:", error);

      alert(error.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="dealer-documents-page">
      <div className="page-header">
        <h1>Upload Documents</h1>

        <p>Upload your dealer verification documents</p>
      </div>

      <div className="documents-card">
        {/* GST */}

        <div className="document-group">
          <label>GST Certificate</label>

          <input
            type="file"
            name="gstCertificate"
            accept="image/*"
            onChange={handleFileChange}
          />

          {uploadedDocs.gstCertificate && (
            <a
              href={getImageUrl(uploadedDocs.gstCertificate)}
              target="_blank"
              rel="noreferrer"
              className="document-link"
            >
              View Uploaded GST
            </a>
          )}
        </div>

        {/* SHOP PHOTO */}

        <div className="document-group">
          <label>Shop Photo</label>

          <input
            type="file"
            name="shopPhoto"
            accept="image/*"
            onChange={handleFileChange}
          />

          {uploadedDocs.shopPhoto && (
            <a
              href={getImageUrl(uploadedDocs.shopPhoto)}
              target="_blank"
              rel="noreferrer"
              className="document-link"
            >
              View Uploaded Shop Photo
            </a>
          )}
        </div>

        {/* SELFIE */}

        <div className="document-group">
          <label>Dealer Selfie</label>

          <input
            type="file"
            name="dealerSelfie"
            accept="image/*"
            onChange={handleFileChange}
          />

          {uploadedDocs.dealerSelfie && (
            <a
              href={getImageUrl(uploadedDocs.dealerSelfie)}
              target="_blank"
              rel="noreferrer"
              className="document-link"
            >
              View Uploaded Selfie
            </a>
          )}
        </div>

        <button
          className="upload-btn"
          onClick={uploadDocuments}
          disabled={uploading}
        >
          {uploading ? "Uploading..." : "Upload Documents"}
        </button>
      </div>
    </div>
  );
};

export default Documents;
