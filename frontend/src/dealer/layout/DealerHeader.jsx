import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FaCamera, FaSignOutAlt, FaChevronDown } from "react-icons/fa";

import API_URL from "../../config/api";

import logo from "../../assets/sunrise.png";
import defaultProfile from "../../assets/profile.jpg";

import "./dealerLayout.css";

const DealerHeader = () => {
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const [profileImage, setProfileImage] = useState(defaultProfile);
  const [dealerName, setDealerName] = useState("Dealer");

  const dropdownRef = useRef(null);

  /* =========================
     LOAD DEALER DATA
  ========================= */

  useEffect(() => {
    try {
      const dealerData =
        localStorage.getItem("dealerAuth") || localStorage.getItem("dealer");

      if (!dealerData) return;

      const dealer = JSON.parse(dealerData);

      setDealerName(
        dealer?.name || dealer?.dealerName || dealer?.fullName || "Dealer",
      );

      if (dealer?.profileImage) {
        setProfileImage(
          dealer.profileImage.startsWith("http")
            ? dealer.profileImage
            : `${API_URL}${dealer.profileImage}`,
        );
      }
    } catch (error) {
      console.error("Dealer data load error:", error);
    }
  }, []);

  /* =========================
     CLOSE DROPDOWN
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
    localStorage.removeItem("dealerToken");
    localStorage.removeItem("dealerAuth");
    localStorage.removeItem("dealer");

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

      if (!file.type.startsWith("image/")) {
        alert("Only image files are allowed");
        return;
      }

      if (file.size > 2 * 1024 * 1024) {
        alert("Image size must be less than 2MB");
        return;
      }

      const token =
        localStorage.getItem("dealerToken") || localStorage.getItem("token");

      const formData = new FormData();

      formData.append("profile", file);

      const response = await fetch(`${API_URL}/api/profile/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Upload failed");
        return;
      }

      if (data?.profileImage) {
        const imageUrl = data.profileImage.startsWith("http")
          ? data.profileImage
          : `${API_URL}${data.profileImage}`;

        setProfileImage(imageUrl);

        const dealer = JSON.parse(localStorage.getItem("dealerAuth")) || {};

        dealer.profileImage = data.profileImage;

        localStorage.setItem("dealerAuth", JSON.stringify(dealer));
      }

      alert("Profile image updated successfully");

      setOpen(false);
    } catch (error) {
      console.error("Profile upload error:", error);

      alert("Profile upload failed");
    }
  };

  return (
    <header className="dealer-header">
      <div
        className="dealer-header-left"
        onClick={() => navigate("/dealer/home")}
      >
        <img src={logo} alt="Sunrise Agri Products" className="dealer-logo" />

        <div className="dealer-title-wrapper">
          <h2 className="dealer-title">Sunrise Agri Products</h2>

          <p className="dealer-greeting">Good Afternoon {dealerName}</p>
        </div>
      </div>

      <div className="dealer-header-right" ref={dropdownRef}>
        <div className="profile-wrapper" onClick={() => setOpen(!open)}>
          <img
            src={profileImage}
            alt="Profile"
            className="profile-pic"
            onError={(e) => {
              e.target.src = defaultProfile;
            }}
          />

          <FaChevronDown className="profile-arrow" />
        </div>

        {open && (
          <div className="profile-dropdown">
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
