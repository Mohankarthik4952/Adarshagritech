import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API_URL from "../../config/api";

import axios from "axios";

import {
  FaWhatsapp,
  FaYoutube,
  FaInstagram,
  FaPlayCircle,
} from "react-icons/fa";

import "../../pages/public/public.css";

import logo from "../../assets/adarsh.jpeg";

const HomePage = () => {
  const navigate = useNavigate();

  const [videos, setVideos] = useState([]);
  const [loadingVideos, setLoadingVideos] = useState(true);

  /* =========================
     FETCH YOUTUBE VIDEOS
  ========================= */

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/youtube/reviews`);

        if (response.data.success) {
          setVideos(response.data.videos || []);
        }
      } catch (error) {
        console.error("VIDEO FETCH ERROR:", error);
      } finally {
        setLoadingVideos(false);
      }
    };

    fetchVideos();
  }, []);

  return (
    <div className="home-page">
      {/* ================= HEADER ================= */}

      <header className="home-header">
        <div className="home-logo">
          <img src={logo} alt="Sunrise Agri Products" />

          <h2>Adarsh Agri Tech</h2>
        </div>

        <div className="auth-buttons">
          <button
            onClick={() =>
              navigate("/select-role", {
                state: { action: "login" },
              })
            }
          >
            Login
          </button>

          <button
            onClick={() =>
              navigate("/select-role", {
                state: { action: "signup" },
              })
            }
          >
            Signup
          </button>
        </div>
      </header>

      {/* ================= HERO ================= */}

      <section className="hero-section">
        <div className="hero-content">
          <h1>Welcome To Adarsh Agri Tech</h1>

          <p>
            Trusted agricultural products and farming solutions for better crop
            growth and farmer success.
          </p>

          <button
            className="hero-btn"
            onClick={() =>
              navigate("/select-role", {
                state: { action: "login" },
              })
            }
          >
            Get Started
          </button>
        </div>
      </section>

      {/* ================= VIDEOS ================= */}

      <section className="reviews">
        <h2>Customer Review Videos</h2>

        <p className="reviews-subtitle">
          Watch real farmer experiences and product reviews
        </p>

        {loadingVideos ? (
          <div className="loading-videos">
            <h3>Loading videos...</h3>
          </div>
        ) : videos.length === 0 ? (
          <div className="loading-videos">
            <h3>No videos available</h3>
          </div>
        ) : (
          <div className="video-grid">
            {videos.map((video) => (
              <div className="video-card" key={video.videoId}>
                <div className="video-header">
                  <FaPlayCircle />

                  <span>{video.title}</span>
                </div>

                <iframe
                  src={`https://www.youtube.com/embed/${video.videoId}`}
                  title={video.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />

                <div className="video-date">
                  {new Date(video.publishedAt).toLocaleDateString("en-IN"),"SUBSCRIBE"}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ================= FOOTER ================= */}

      <footer className="home-footer">
        <div className="social-links">
          <a href="https://chat.whatsapp.com/Ih8uMFNsKs5DBKIqbgt2fx" target="_blank" rel="noreferrer">
            <FaWhatsapp className="icon whatsapp" />
          </a>

          <a
            href="https://www.youtube.com/@sunriserythunestam9989"
            target="_blank"
            rel="noreferrer"
          >
            <FaYoutube className="icon youtube" />
          </a>

          <a
            href="https://www.instagram.com/sunrise_9989/"
            target="_blank"
            rel="noreferrer"
          >
            <FaInstagram className="icon instagram" />
          </a>
        </div>

        <p className="copyright">Adarsh Agri Tech</p>
        
        <p className="designer-credits">
          Designed by <span className="designer-name">G. Mohan Karthik</span> | <a href="tel:+918499082784">+91 8499082784</a>
        </p>
      </footer>
    </div>
  );
};

export default HomePage;