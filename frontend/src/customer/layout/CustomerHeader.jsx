import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FaBars } from "react-icons/fa";

import logo from "../../assets/sunrise.png";
import defaultProfile from "../../assets/profile.jpg";

import "./customerLayout.css";

const CustomerHeader = ({ setSidebarOpen }) => {
  const navigate = useNavigate();
  const dropdownRef = useRef();

  const [open, setOpen] = useState(false);
  const [profileImage, setProfileImage] = useState(defaultProfile);
  const [customer, setCustomer] = useState(null);

  /* =========================
     LOAD CUSTOMER
  ========================= */
  useEffect(() => {
    try {
      const stored = localStorage.getItem("customerAuth");

      if (stored && stored !== "undefined") {
        const parsed = JSON.parse(stored);
        setCustomer(parsed);

        if (parsed?.profileImage) {
          setProfileImage(parsed.profileImage);
        }
      }
    } catch (err) {
      console.error("Customer parse error:", err);
    }
  }, []);

  /* =========================
     CLOSE DROPDOWN
  ========================= */
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /* =========================
     GREETING
  ========================= */
  const getGreeting = () => {
    const hour = new Date().getHours();
    const name = customer?.name || "";

    if (hour < 12) return `Good Morning ${name}`;
    if (hour < 17) return `Good Afternoon ${name}`;
    return `Good Evening ${name}`;
  };

  /* =========================
     LOGOUT
  ========================= */
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("customerAuth");
    localStorage.removeItem("customerToken");
    navigate("/customer/login");
  };

  /* =========================
     PROFILE UPLOAD
  ========================= */
  const handleProfileUpload = async (e) => {
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

    try {
      const formData = new FormData();
      formData.append("profile", file);

      const res = await fetch("/api/profile/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Upload failed");
        return;
      }

      if (data?.profileImage) {
        setProfileImage(data.profileImage);

        const updated = {
          ...customer,
          profileImage: data.profileImage,
        };

        setCustomer(updated);

        localStorage.setItem("customerAuth", JSON.stringify(updated));
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("Upload failed");
    }
  };

  return (
    <header className="header">
      {/* LEFT */}
      <div className="header-left">
        {/* MOBILE MENU BUTTON */}
        <button className="menu-btn" onClick={() => setSidebarOpen(true)}>
          <FaBars />
        </button>

        {/* LOGO + GREETING */}
        <div
          className="header-brand"
          onClick={() => navigate("/customer/home")}
        >
          <img src={logo} alt="logo" className="logo" />

          <h2>{getGreeting()}</h2>
        </div>
      </div>

      {/* RIGHT */}
      <div className="header-right" ref={dropdownRef}>
        <img
          src={profileImage}
          alt="profile"
          className="profile-pic"
          onClick={() => setOpen(!open)}
          onError={(e) => (e.target.src = defaultProfile)}
        />

        {open && (
          <div className="dropdown">
            <label className="upload">
              Upload Profile
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={handleProfileUpload}
              />
            </label>

            <button onClick={logout}>Logout</button>
          </div>
        )}
      </div>
    </header>
  );
};

export default CustomerHeader;
