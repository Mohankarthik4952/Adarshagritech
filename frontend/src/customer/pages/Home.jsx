import { useEffect, useState } from "react";
import { FaPlayCircle } from "react-icons/fa";
import API_URL from "../../config/api";

import "./customerpages.css";

const Home = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  /* =========================
     FETCH YOUTUBE VIDEOS
  ========================= */

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const response = await fetch(`${API_URL}/api/youtube/reviews`);

        const data = await response.json();

        console.log("YOUTUBE VIDEOS:", data);

        if (data.success) {
          setVideos(data.videos || []);
        } else {
          setVideos([]);
        }
      } catch (error) {
        console.error("VIDEO FETCH ERROR:", error);

        setVideos([]);
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, []);

  return (
    <div className="customer-home-page">
      {/* =========================
          HERO SECTION
      ========================= */}

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

      {/* =========================
          VIDEOS SECTION
      ========================= */}

      <div className="section-header">
        <h2>Customer Review Videos</h2>

        <p>Watch real farmer experiences and product reviews</p>
      </div>

      {loading ? (
        <div className="loading-box">
          <h3>Loading videos...</h3>
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
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />

              <div className="video-info">
                <small>
                  {new Date(video.publishedAt).toLocaleDateString("en-IN")}
                </small>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;
