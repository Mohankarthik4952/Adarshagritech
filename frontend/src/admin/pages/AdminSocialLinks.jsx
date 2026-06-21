import { useState, useEffect } from "react";
import axios from "axios";

import API_URL from "../../config/api";

import "./adminpages.css";

const AdminSocialLinks = () => {
  const token = localStorage.getItem("adminToken");

  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    whatsapp: "",
    youtube: "",
    instagram: "",
  });

  useEffect(() => {
    fetchLinks();
  }, []);

  const fetchLinks = async () => {
    try {
      setLoading(true);

      const res = await axios.get(`${API_URL}/api/social`, {
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

      alert(
        error.response?.data?.message ||
          error.message ||
          "Failed to load social links",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async () => {
    try {
      if (!form.whatsapp && !form.youtube && !form.instagram) {
        alert("Please enter at least one social link");
        return;
      }

      setLoading(true);

      await axios.post(`${API_URL}/api/social/save`, form, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      alert("Social links saved successfully ✅");
    } catch (error) {
      console.error("SAVE SOCIAL LINKS ERROR:", error);

      alert(
        error.response?.data?.message ||
          error.message ||
          "Failed to save social links ❌",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="social-links-page">
      {" "}
      <div className="social-header">
        {" "}
        <h2>Social Links Management</h2>
        <p>
          Update WhatsApp, YouTube, and Instagram links for your website footer.
        </p>
      </div>
      <div className="social-card">
        <div className="social-input-group">
          <label>WhatsApp Link</label>

          <input
            type="text"
            placeholder="Enter WhatsApp Link"
            value={form.whatsapp}
            onChange={(e) => handleChange("whatsapp", e.target.value)}
          />
        </div>

        <div className="social-input-group">
          <label>YouTube Link</label>

          <input
            type="text"
            placeholder="Enter YouTube Link"
            value={form.youtube}
            onChange={(e) => handleChange("youtube", e.target.value)}
          />
        </div>

        <div className="social-input-group">
          <label>Instagram Link</label>

          <input
            type="text"
            placeholder="Enter Instagram Link"
            value={form.instagram}
            onChange={(e) => handleChange("instagram", e.target.value)}
          />
        </div>

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
