import { useEffect, useState, useCallback } from "react";
import { FaPlayCircle, FaYoutube, FaRedo } from "react-icons/fa";

import API_URL from "../../config/api";

import "./customerpages.css";

const Home = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  /* =========================
     FETCH YOUTUBE VIDEOS
  ========================= */

  const fetchVideos = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      const response = await fetch(`${API_URL}/api/youtube/reviews`);

      const data = await response.json();

      console.log("YOUTUBE VIDEOS:", data);

      if (response.status === 429) {
        setErrorMessage("Video service limit reached. Please try again later.");

        setVideos([]);

        return;
      }

      if (!response.ok) {
        throw new Error(data.message || "Failed to load videos");
      }

      if (data.success) {
        const sortedVideos = [...(data.videos || [])].sort(
          (a, b) => new Date(b.publishedAt || 0) - new Date(a.publishedAt || 0),
        );

        setVideos(sortedVideos);
      } else {
        setVideos([]);
      }
    } catch (error) {
      console.error("VIDEO FETCH ERROR:", error);

      setVideos([]);

      setErrorMessage(error.message || "Unable to load review videos");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVideos();
  }, [fetchVideos]);

  /* =========================
     OPEN VIDEO
  ========================= */

  const openYoutubeVideo = (videoId) => {
    window.open(
      `https://www.youtube.com/watch?v=${videoId}`,
      "_blank",
      "noopener,noreferrer",
    );
  };

  /* =========================
     FORMAT DATE
  ========================= */

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString("en-IN");
  };

  return (
    <div className="customer-home-page">
      {/* HERO SECTION */}

      <div className="customer-hero">
        <div className="hero-content">
          <h1>🌱 Smart Crop Protection Solutions</h1>

          <p>
            Premium agricultural products designed to improve crop health,
            productivity, and farmer success.
          </p>

          <div className="field-manager-info">
            <h3>Field Manager</h3>

            <p>
              <strong>G. Veerabhadra Rao</strong>
            </p>

            <p>
              Contact:{" "}
              <a href="tel:8555859888">
                <strong>8555859888</strong>
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* VIDEOS */}

      <div className="section-header">
        <h2>Customer Review Videos</h2>

        <p>Watch real farmer experiences and product reviews</p>
      </div>
      {loading ? (
        <div className="loading-box">
          <h3>Loading videos...</h3>
        </div>
      ) : errorMessage ? (
        <div className="empty-videos">
          <h3>{errorMessage}</h3>

          <button className="retry-btn" onClick={fetchVideos}>
            <FaRedo />
            Retry
          </button>
        </div>
      ) : videos.length === 0 ? (
        <div className="empty-videos">
          <h3>No review videos available</h3>
        </div>
      ) : (
        <div className="customer-videos-grid">
          {videos.map((video) => (
            <div className="video-card" key={video.videoId}>
              <div className="video-top">
                <FaPlayCircle />

                <span>{video.title}</span>
              </div>

              <iframe
                src={`https://www.youtube.com/embed/${video.videoId}`}
                title={video.title}
                loading="lazy"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />

              <div className="video-info">
                <small>{formatDate(video.publishedAt)}</small>

                <button
                  className="youtube-btn"
                  onClick={() => openYoutubeVideo(video.videoId)}
                >
                  <FaYoutube />
                  Watch on YouTube
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;
