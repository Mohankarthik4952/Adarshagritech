import { useEffect, useState } from "react";
import "./dealerpages.css";

const Documents = () => {
  /* =================================
     GET DEALER DATA
  ================================= */

  const dealer =
    JSON.parse(localStorage.getItem("dealerAuth")) ||
    JSON.parse(localStorage.getItem("dealer")) ||
    {};

  console.log("Dealer Data:", dealer);

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

  /* =================================
     FETCH DOCUMENTS
  ================================= */

  const fetchDocuments = async () => {
    try {
      if (!dealerId) {
        console.log("Dealer ID not found");
        return;
      }

      const res = await fetch(`${API_URL}/api/documents/${dealerId}`);

      const data = await res.json();

      setUploadedDocs(data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  /* =================================
     HANDLE FILE CHANGE
  ================================= */

  const handleFileChange = (e) => {
    setDocuments((prev) => ({
      ...prev,
      [e.target.name]: e.target.files[0],
    }));
  };

  /* =================================
     UPLOAD DOCUMENTS
  ================================= */

  const uploadDocuments = async () => {
    try {
      if (!dealerId) {
        alert("Dealer ID not found. Please login again.");
        return;
      }

      const formData = new FormData();

      formData.append("dealerId", dealerId);

      Object.keys(documents).forEach((key) => {
        if (documents[key]) {
          formData.append(key, documents[key]);
        }
      });

      const response = await fetch(`${API_URL}/api/documents/upload`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      console.log("UPLOAD RESPONSE:", data);

      if (!response.ok) {
        throw new Error(data.message || "Upload failed");
      }

      alert("Documents uploaded successfully ✅");

      fetchDocuments();
    } catch (error) {
      console.error("UPLOAD ERROR:", error);

      alert(error.message);
    }
  };

  /* =================================
     FILE URL
  ================================= */

  const getFileUrl = (path) => {
    if (!path) return "#";

    return `${API_URL}${path}`;
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
            onChange={handleFileChange}
          />

          {uploadedDocs.gstCertificate && (
            <a
              href={getFileUrl(uploadedDocs.gstCertificate)}
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

          <input type="file" name="shopPhoto" onChange={handleFileChange} />

          {uploadedDocs.shopPhoto && (
            <a
              href={getFileUrl(uploadedDocs.shopPhoto)}
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

          <input type="file" name="dealerSelfie" onChange={handleFileChange} />

          {uploadedDocs.dealerSelfie && (
            <a
              href={getFileUrl(uploadedDocs.dealerSelfie)}
              target="_blank"
              rel="noreferrer"
              className="document-link"
            >
              View Uploaded Selfie
            </a>
          )}
        </div>

        <button className="upload-btn" onClick={uploadDocuments}>
          Upload Documents
        </button>
      </div>
    </div>
  );
};

export default Documents;
