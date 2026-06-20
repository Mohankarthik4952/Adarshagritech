// src/admin/pages/AdminSocialLinks.jsx

import { useState, useEffect } from "react";
import axios from "axios";

import "./adminpages.css";

const AdminSocialLinks = () => {
  const token = localStorage.getItem("adminToken");

  /* =========================
     STATE
  ========================= */
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    whatsapp: "",
    youtube: "",
    instagram: "",
  });

  /* =========================
     FETCH SOCIAL LINKS
  ========================= */
  useEffect(() => {
    fetchLinks();
  }, []);

  const fetchLinks = async () => {
    try {
      setLoading(true);

      const res = await axios.get("http://localhost:5000/api/social", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.data) {
        setForm({
          whatsapp: res.data.whatsapp || "",

          youtube: res.data.youtube || "",

          instagram: res.data.instagram || "",
        });
      }
    } catch (error) {
      console.error("FETCH SOCIAL LINKS ERROR:", error);
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     HANDLE CHANGE
  ========================= */
  const handleChange = (field, value) => {
    setForm({
      ...form,
      [field]: value,
    });
  };

  /* =========================
     SAVE SOCIAL LINKS
  ========================= */
  const handleSubmit = async () => {
    try {
      if (!form.whatsapp && !form.youtube && !form.instagram) {
        alert("Please enter at least one social link");
        return;
      }

      setLoading(true);

      await axios.post("http://localhost:5000/api/social/save", form, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      alert("Social links saved successfully ✅");
    } catch (error) {
      console.error("SAVE SOCIAL LINKS ERROR:", error);

      alert("Failed to save social links ❌");
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     UI
  ========================= */
  return (
    <div className="social-links-page">
      {/* HEADER */}
      <div className="social-header">
        <h2>Social Links Management</h2>

        <p>
          Update WhatsApp, YouTube, and Instagram links for your website footer.
        </p>
      </div>

      {/* FORM CARD */}
      <div className="social-card">
        {/* WHATSAPP */}
        <div className="social-input-group">
          <label>WhatsApp Link</label>

          <input
            type="text"
            placeholder="Enter WhatsApp Link"
            value={form.whatsapp}
            onChange={(e) => handleChange("whatsapp", e.target.value)}
          />
        </div>

        {/* YOUTUBE */}
        <div className="social-input-group">
          <label>YouTube Link</label>

          <input
            type="text"
            placeholder="Enter YouTube Link"
            value={form.youtube}
            onChange={(e) => handleChange("youtube", e.target.value)}
          />
        </div>

        {/* INSTAGRAM */}
        <div className="social-input-group">
          <label>Instagram Link</label>

          <input
            type="text"
            placeholder="Enter Instagram Link"
            value={form.instagram}
            onChange={(e) => handleChange("instagram", e.target.value)}
          />
        </div>

        {/* SAVE BUTTON */}
        <button
          className="social-save-btn"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? "Saving..." : "Save Social Links"}
        </button>
      </div>
    </div>
  );
};

export default AdminSocialLinks;
