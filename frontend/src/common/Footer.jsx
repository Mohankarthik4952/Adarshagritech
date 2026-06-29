import { useEffect, useState } from "react";
import axios from "axios";
import { FaWhatsapp, FaYoutube, FaInstagram } from "react-icons/fa";

import API_URL from "../config/api";

import "./styles/footer.css";

export default function Footer() {
  /* =========================
     STATES
  ========================= */

  const [pdf, setPdf] = useState("");
  const [social, setSocial] = useState({});
  const [showModal, setShowModal] = useState(false);

  /* =========================
     LOAD DATA
  ========================= */

  useEffect(() => {
    fetchPdf();
    fetchSocial();
  }, []);

  /* =========================
     FETCH TERMS PDF
  ========================= */

  const fetchPdf = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/terms`);

      if (res.data?.fileUrl) {
        const cleanPath = res.data.fileUrl.replace(/^\/+/, "");

        setPdf(`${API_URL}/${cleanPath}`);
      }
    } catch (err) {
      console.error("PDF fetch error:", err);
    }
  };

  /* =========================
     FETCH SOCIAL LINKS
  ========================= */

  const fetchSocial = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/social`);

      if (res.data) {
        setSocial(res.data);
      }
    } catch (err) {
      console.error("Social fetch error:", err);
    }
  };

  return (
    <>
      {/* =========================
          FOOTER
      ========================= */}

      <footer className="dashboard-footer">
        <div className="dashboard-footer-container">
          {/* =========================
              SOCIAL ICONS
          ========================= */}

          <div className="dashboard-footer-icons">
            {/* WHATSAPP */}

            <a
              href={
                social?.whatsapp ||
                "https://chat.whatsapp.com/Ih8uMFNsKs5DBKIqbgt2fx"
              }
              target="_blank"
              rel="noopener noreferrer"
              className="dashboard-icon whatsapp"
            >
              <FaWhatsapp />

              <span>WhatsApp</span>
            </a>

            {/* YOUTUBE */}

            <a
              href={
                social?.youtube ||
                "https://www.youtube.com/@sunriserythunestam9989"
              }
              target="_blank"
              rel="noopener noreferrer"
              className="dashboard-icon youtube"
            >
              <FaYoutube />

              <span>YouTube</span>
            </a>

            {/* INSTAGRAM */}

            <a
              href={
                social?.instagram || "https://www.instagram.com/sunrise_9989/"
              }
              target="_blank"
              rel="noopener noreferrer"
              className="dashboard-icon instagram"
            >
              <FaInstagram />

              <span>Instagram</span>
            </a>
          </div>

          {/* =========================
              TERMS
          ========================= */}

          <div className="dashboard-footer-terms">
            {pdf ? (
              <>
                <button
                  type="button"
                  className="terms-btn"
                  onClick={() => setShowModal(true)}
                >
                  Terms & Conditions
                </button>

                <a
                  href={pdf}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Download PDF
                </a>
              </>
            ) : (
              <p>No Terms Uploaded</p>
            )}
          </div>

          {/* =========================
              COPYRIGHT
          ========================= */}

          <p className="dashboard-footer-text">© Adarsh Agri Tech</p>
        </div>
      </footer>

      {/* =========================
          PDF MODAL
      ========================= */}

      {showModal && (
        <div className="dashboard-modal" onClick={() => setShowModal(false)}>
          <div
            className="dashboard-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            {/* CLOSE BUTTON */}

            <button
              type="button"
              className="dashboard-close-btn"
              onClick={() => setShowModal(false)}
            >
              ✖
            </button>

            {/* PDF */}

            <iframe
              src={pdf}
              title="Terms & Conditions"
              width="100%"
              height="100%"
            />
          </div>
        </div>
      )}
    </>
  );
}
