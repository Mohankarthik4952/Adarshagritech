import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";

import API_URL from "../../config/api";
import getImageUrl from "../../utils/getImageUrl";

import "./dealerpages.css";

const PriceList = () => {
  const navigate = useNavigate();

  /* =========================
     STATES
  ========================= */

  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(true);

  /* =========================
     FETCH PRICE LISTS
  ========================= */

  const fetchPriceLists = useCallback(async () => {
    try {
      const token = localStorage.getItem("dealerToken");

      setLoading(true);

      const response = await fetch(`${API_URL}/api/dealer/pricelist`, {
        headers: token
          ? {
              Authorization: `Bearer ${token}`,
            }
          : {},
      });

      const data = await response.json();

      if (response.status === 401) {
        localStorage.removeItem("dealerToken");

        alert("Session expired. Please login again.");

        navigate("/dealer/login");

        return;
      }

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch price lists");
      }

      const sortedLists = Array.isArray(data)
        ? [...data].sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
          )
        : [];

      setLists(sortedLists);
    } catch (error) {
      console.error("PRICE LIST FETCH ERROR:", error);

      alert(error.message || "Failed to load price lists");

      setLists([]);
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchPriceLists();
  }, [fetchPriceLists]);

  /* =========================
     REFRESH ON WINDOW FOCUS
  ========================= */

  useEffect(() => {
    const handleFocus = () => {
      fetchPriceLists();
    };

    window.addEventListener("focus", handleFocus);

    return () => {
      window.removeEventListener("focus", handleFocus);
    };
  }, [fetchPriceLists]);

  /* =========================
     FILE URL
  ========================= */

  const getFileUrl = (path) => {
    if (!path) return "";

    return getImageUrl(path);
  };

  /* =========================
     FILE TYPE
  ========================= */

  const isPdf = (path = "") => {
    return path.toLowerCase().includes(".pdf");
  };

  /* =========================
     VIEW FILE
  ========================= */

  const handleView = (path) => {
    const fileUrl = getFileUrl(path);

    if (!fileUrl) {
      alert("File not found");
      return;
    }

    window.open(fileUrl, "_blank");
  };

  /* =========================
     LOADING
  ========================= */

  if (loading) {
    return (
      <div className="dealer-pricelist-page">
        <div className="page-header">
          <h1>Price List</h1>

          <p>Loading latest price list...</p>
        </div>
      </div>
    );
  }

  /* =========================
     EMPTY
  ========================= */

  if (lists.length === 0) {
    return (
      <div className="dealer-pricelist-page">
        <div className="page-header">
          <h1>Price List</h1>

          <p>No price list available</p>
        </div>
      </div>
    );
  }

  const latest = lists[0];

  return (
    <div className="dealer-pricelist-page">
      <div className="page-header">
        <h1>Latest Price List</h1>

        <p>View the latest price list uploaded by admin</p>
      </div>

      {/* LATEST FILE */}

      <div className="latest-pricelist-card">
        {isPdf(latest.filePath) ? (
          <div className="pdf-preview">📄 PDF Document</div>
        ) : (
          <img
            src={getFileUrl(latest.filePath)}
            alt={latest.fileName}
            className="latest-pricelist-image"
            onError={(e) => {
              e.target.src = "/no-image.png";
            }}
          />
        )}

        <div className="latest-pricelist-info">
          <h3>{latest.fileName}</h3>

          <p>
            Uploaded On:{" "}
            {latest.createdAt
              ? new Date(latest.createdAt).toLocaleDateString("en-IN")
              : "-"}
          </p>

          <button
            className="open-file-btn"
            onClick={() => handleView(latest.filePath)}
          >
            {isPdf(latest.filePath) ? "Open PDF" : "View Full Size"}
          </button>
        </div>
      </div>

      {/* PREVIOUS FILES */}

      {lists.length > 1 && (
        <>
          <h2 className="previous-pricelist-title">Previous Price Lists</h2>

          <div className="pricelist-grid">
            {lists.slice(1).map((list) => (
              <div key={list._id || list.filePath} className="pricelist-card">
                {isPdf(list.filePath) ? (
                  <div className="pdf-preview">📄 PDF Document</div>
                ) : (
                  <img
                    src={getFileUrl(list.filePath)}
                    alt={list.fileName}
                    className="dealer-pricelist-image"
                    onError={(e) => {
                      e.target.src = "/no-image.png";
                    }}
                  />
                )}

                <div className="pricelist-info">
                  <h3>{list.fileName}</h3>

                  <p>
                    {list.createdAt
                      ? new Date(list.createdAt).toLocaleDateString("en-IN")
                      : "-"}
                  </p>
                </div>

                <button
                  className="open-file-btn"
                  onClick={() => handleView(list.filePath)}
                >
                  {isPdf(list.filePath) ? "Open PDF" : "View"}
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default PriceList;
