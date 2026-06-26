import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";

import {
  validateRequired,
  validatePhone,
  validatePincode,
  validatePassword,
  validatePasswordMatch,
  validateEmail,
} from "../../utils/validators";

import { registerCustomer } from "../../services/customerService";

import "../../pages/auth.css";

const CustomerSignup = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    village: "",
    pincode: "",
    nearBusStand: "",
    cropName: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const {
      name,
      phone,
      email,
      village,
      pincode,
      nearBusStand,
      cropName,
      password,
      confirmPassword,
    } = form;

    /* =========================
       VALIDATIONS
    ========================= */

    if (!validateRequired(name)) {
      return alert("Customer name is required");
    }

    if (!validatePhone(phone)) {
      return alert("Phone number must be 10 digits");
    }

    if (!validateEmail(email)) {
      return alert("Valid email is required");
    }

    if (!validateRequired(village)) {
      return alert("Village name is required");
    }

    if (!validatePincode(pincode)) {
      return alert("Invalid pincode (must be 6 digits)");
    }

    if (!validateRequired(nearBusStand)) {
      return alert("Near bus stand is required");
    }

    if (!validateRequired(cropName)) {
      return alert("Crop name is required");
    }

    if (!validatePassword(password)) {
      return alert("Password must be at least 6 characters");
    }

    if (!validatePasswordMatch(password, confirmPassword)) {
      return alert("Passwords do not match");
    }

    try {
      setLoading(true);

      await registerCustomer({
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim().toLowerCase(),
        village: village.trim(),
        pincode: pincode.trim(),
        nearBusStand: nearBusStand.trim(),
        cropName: cropName.trim(),
        password: password.trim(),
      });

      alert("Customer account created successfully 🎉");

      navigate("/customer/login");
    } catch (error) {
      console.error(error);

      alert(
        error?.response?.data?.message || "Email or Phone is already exists",
      );
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
        <h2>Customer Signup</h2>

        <input
          type="text"
          name="name"
          placeholder="Customer Name"
          value={form.name}
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
          type="email"
          name="email"
          placeholder="Enter your email id"
          value={form.email}
          onChange={handleChange}
        />

        <input
          type="text"
          name="village"
          placeholder="Village Name"
          value={form.village}
          onChange={handleChange}
        />

        <input
          type="text"
          name="pincode"
          placeholder="Pincode"
          value={form.pincode}
          onChange={handleChange}
        />

        <input
          type="text"
          name="nearBusStand"
          placeholder="Near Bus Stand"
          value={form.nearBusStand}
          onChange={handleChange}
        />

        <input
          type="text"
          name="cropName"
          placeholder="Crop Name"
          value={form.cropName}
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
          {loading ? "Creating Account..." : "Signup"}
        </button>
      </form>
    </div>
  );
};

export default CustomerSignup;
