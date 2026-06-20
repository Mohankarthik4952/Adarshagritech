import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FaCamera, FaSignOutAlt, FaChevronDown } from "react-icons/fa";

import logo from "../../assets/sunrise.png";
import defaultProfile from "../../assets/profile.jpg";

import "./dealerLayout.css";

const DealerHeader = () => {
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const [profileImage, setProfileImage] = useState(defaultProfile);
  const [dealerName, setDealerName] = useState("");

  const dropdownRef = useRef(null);

  /* =========================
     LOAD DEALER DATA
  ========================= */
  useEffect(() => {
    try {
      const dealerData = localStorage.getItem("dealerAuth");

      if (dealerData) {
        const dealer = JSON.parse(dealerData);

        setDealerName(dealer?.name || "");

        if (dealer?.profileImage) {
          setProfileImage(dealer.profileImage);
        }
      }
    } catch (error) {
      console.error("Dealer data load error:", error);
    }
  }, []);

  /* =========================
     CLOSE DROPDOWN OUTSIDE CLICK
  ========================= */
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  /* =========================
     LOGOUT
  ========================= */
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("dealerAuth");

    navigate("/dealer/login", {
      replace: true,
    });
  };

  /* =========================
     PROFILE UPLOAD
  ========================= */
  const handleProfileUpload = async (e) => {
    try {
      const file = e.target.files[0];

      if (!file) return;

      /* IMAGE VALIDATION */
      if (!file.type.startsWith("image/")) {
        alert("Only image files are allowed");
        return;
      }

      if (file.size > 2 * 1024 * 1024) {
        alert("Image size must be less than 2MB");
        return;
      }

      const formData = new FormData();

      formData.append("profile", file);

      const response = await fetch("http://localhost:5000/api/profile/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Upload failed");
        return;
      }

      if (data?.profileImage) {
        /* Update UI */
        setProfileImage(data.profileImage);

        /* Update localStorage */
        const dealer = JSON.parse(localStorage.getItem("dealerAuth")) || {};

        dealer.profileImage = data.profileImage;

        localStorage.setItem("dealerAuth", JSON.stringify(dealer));

        alert("Profile image updated successfully");
      }

      setOpen(false);
    } catch (error) {
      console.error("Profile upload error:", error);

      alert("Profile upload failed");
    }
  };

  return (
    <header className="admin-header">
      {/* =========================
          LEFT SIDE
      ========================= */}
      <div
        className="admin-header-left"
        onClick={() => navigate("/dealer/home")}
        style={{
          cursor: "pointer",
        }}
      >
        <img src={logo} alt="Sunrise Agri Products" className="logo" />

        <h2>Sunrise Agri Products</h2>
      </div>

      {/* =========================
          RIGHT SIDE
      ========================= */}
      <div className="admin-header-right" ref={dropdownRef}>
        {/* PROFILE IMAGE */}
        <div className="profile-wrapper" onClick={() => setOpen(!open)}>
          <img src={profileImage} alt="Profile" className="profile-pic" />

          <span className="profile-arrow">
            <FaChevronDown />
          </span>
        </div>

        {/* DROPDOWN */}
        {open && (
          <div className="profile-dropdown">
            {/* UPLOAD PROFILE */}
            <label className="dropdown-item">
              <FaCamera />
              <span>Upload Profile</span>

              <input
                type="file"
                accept="image/*"
                hidden
                onChange={handleProfileUpload}
              />
            </label>

            {/* LOGOUT */}
            <button className="dropdown-item logout-btn" onClick={logout}>
              <FaSignOutAlt />
              <span>Logout</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default DealerHeader;
