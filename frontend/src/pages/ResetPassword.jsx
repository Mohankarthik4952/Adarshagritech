// src/pages/ResetPassword.jsx

import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";

import { resetPassword as customerResetPassword } from "../services/customerService";

import { resetPassword as dealerResetPassword } from "../services/dealerService";

import "../pages/auth.css";

const ResetPassword = ({ role = "customer" }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const email = location.state?.email;
  const userRole = location.state?.role || role;

  const [form, setForm] = useState({
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleChange = (e) => {
    setErrorMsg("");

    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      return setErrorMsg("Reset session expired. Please try again.");
    }

    if (!form.password || form.password.length < 6) {
      return setErrorMsg("Password must be at least 6 characters");
    }

    if (form.password !== form.confirmPassword) {
      return setErrorMsg("Passwords do not match");
    }

    try {
      setLoading(true);
      setErrorMsg("");

      if (userRole === "dealer") {
        await dealerResetPassword({
          email,
          password: form.password,
        });
      } else {
        await customerResetPassword({
          email,
          password: form.password,
        });
      }

      alert("Password reset successful ✅");

      if (userRole === "dealer") {
        navigate("/dealer/login", {
          replace: true,
        });
      } else {
        navigate("/customer/login", {
          replace: true,
        });
      }
    } catch (error) {
      console.error("RESET ERROR:", error);

      setErrorMsg(error.message || "Password reset failed");
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
        <h2>Reset Password</h2>

        {errorMsg && <p className="error-text">{errorMsg}</p>}

        <input
          type="password"
          name="password"
          placeholder="New Password"
          value={form.password}
          onChange={handleChange}
        />

        <input
          type="password"
          name="confirmPassword"
          placeholder="Confirm New Password"
          value={form.confirmPassword}
          onChange={handleChange}
        />

        <button type="submit" disabled={loading}>
          {loading ? "Updating..." : "Reset Password"}
        </button>
      </form>
    </div>
  );
};

export default ResetPassword;
