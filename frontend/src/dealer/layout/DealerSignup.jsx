import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";

import {
  validateRequired,
  validateEmail,
  validatePhone,
  validatePassword,
  validatePasswordMatch,
  validateGST,
} from "../../utils/validators";

import { registerDealer } from "../../services/dealerService";

import "../../pages/auth.css";

const DealerSignup = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    shopName: "",
    gst: "",
    village: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    /* =====================
       VALIDATIONS
    ===================== */

    if (!validateRequired(form.name)) {
      return alert("Name is required");
    }

    if (!validateRequired(form.shopName)) {
      return alert("Shop name is required");
    }

    if (!validateGST(form.gst)) {
      return alert("Invalid GST Number format");
    }

    if (!validateRequired(form.village)) {
      return alert("Village is required");
    }

    if (!validateEmail(form.email)) {
      return alert("Invalid email address");
    }

    if (!validatePhone(form.phone)) {
      return alert("Phone must be 10 digits");
    }

    if (!validatePassword(form.password)) {
      return alert("Password must be at least 6 characters");
    }

    if (!validatePasswordMatch(form.password, form.confirmPassword)) {
      return alert("Passwords do not match");
    }

    /* =====================
       API CALL
    ===================== */

    try {
      setLoading(true);

      await registerDealer({
        ...form,
        name: form.name.trim(),
        shopName: form.shopName.trim(),
        gst: form.gst.trim().toUpperCase(),
        village: form.village.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim(),
        password: form.password.trim(),
      });

      alert("Dealer account created successfully 🎉");

      navigate("/dealer/login");
    } catch (error) {
      console.error(error);

      alert(error.message || "Email or Phone is already exists");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <button type="button" className="back-btn" onClick={() => navigate("/")}>
        <FaArrowLeft />
        <span>Back</span>
      </button>
      <form className="auth-form" onSubmit={handleSubmit}>
        <h2>Dealer Signup</h2>

        <input
          type="text"
          name="name"
          placeholder="Dealer Name"
          value={form.name}
          onChange={handleChange}
        />

        <input
          type="text"
          name="shopName"
          placeholder="Shop Name"
          value={form.shopName}
          onChange={handleChange}
        />

        <input
          type="text"
          name="gst"
          placeholder="GST Number"
          value={form.gst.toUpperCase()}
          onChange={handleChange}
        />

        <input
          type="text"
          name="village"
          placeholder="Village"
          value={form.village}
          onChange={handleChange}
        />

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
        />

        <input
          type="text"
          name="phone"
          placeholder="Phone Number"
          value={form.phone}
          onChange={handleChange}
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
        />

        <input
          type="password"
          name="confirmPassword"
          placeholder="Confirm Password"
          value={form.confirmPassword}
          onChange={handleChange}
        />

        <button type="submit" disabled={loading}>
          {loading ? "Creating account..." : "Signup"}
        </button>
      </form>
    </div>
  );
};

export default DealerSignup;
