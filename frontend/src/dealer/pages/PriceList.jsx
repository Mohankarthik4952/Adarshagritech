import { useEffect, useState } from "react";
import "./dealerpages.css";

const PriceList = () => {
  /* =========================
     STATES
  ========================= */

  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(true);

  /* =========================
     FETCH PRICE LISTS
  ========================= */

  useEffect(() => {
    const fetchPriceLists = async () => {
      try {
        const response = await fetch(
          "http://localhost:5000/api/dealer/pricelist",
        );

        const data = await response.json();

        const sortedLists = Array.isArray(data)
          ? data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          : [];

        setLists(sortedLists);
      } catch (error) {
        console.error("Price list fetch failed", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPriceLists();
  }, []);

  /* =========================
     IMAGE URL
  ========================= */

  const getImageUrl = (path) => {
    if (!path) return "";

    if (path.startsWith("http")) {
      return path;
    }

    return `http://localhost:5000${path}`;
  };

  /* =========================
     VIEW IMAGE
  ========================= */

  const handleView = (path) => {
    window.open(getImageUrl(path), "_blank");
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

  return (
    <div className="dealer-pricelist-page">
      {/* HEADER */}

      <div className="page-header">
        <h1>Latest Price List</h1>

        <p>View the latest price list uploaded by admin</p>
      </div>

      {/* LATEST IMAGE */}

      <div className="latest-pricelist-card">
        <img
          src={getImageUrl(lists[0].filePath)}
          alt={lists[0].fileName}
          className="latest-pricelist-image"
        />

        <div className="latest-pricelist-info">
          <h3>{lists[0].fileName}</h3>

          <p>
            Uploaded On: {new Date(lists[0].createdAt).toLocaleDateString()}
          </p>

          <button
            className="open-file-btn"
            onClick={() => handleView(lists[0].filePath)}
          >
            View Full Size
          </button>
        </div>
      </div>

      {/* PREVIOUS PRICE LISTS */}

      {lists.length > 1 && (
        <>
          <h2 className="previous-pricelist-title">Previous Price Lists</h2>

          <div className="pricelist-grid">
            {lists.slice(1).map((list) => (
              <div key={list._id} className="pricelist-card">
                <img
                  src={getImageUrl(list.filePath)}
                  alt={list.fileName}
                  className="dealer-pricelist-image"
                />

                <div className="pricelist-info">
                  <h3>{list.fileName}</h3>

                  <p>{new Date(list.createdAt).toLocaleDateString()}</p>
                </div>

                <button
                  className="open-file-btn"
                  onClick={() => handleView(list.filePath)}
                >
                  View
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
