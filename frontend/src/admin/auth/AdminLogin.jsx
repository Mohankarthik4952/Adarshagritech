// src/admin/auth/AdminLogin.jsx

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import { validatePassword } from "../../utils/validators";
import API_URL from "../../config/api";
import "../../pages/auth.css";

const AdminLogin = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    identifier: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  /* =========================
     HANDLE INPUT
  ========================= */
  const handleChange = (e) => {
    setErrorMsg("");

    let { name, value } = e.target;

    if (name === "identifier") {
      value = value.toLowerCase();
    }

    setForm({
      ...form,
      [name]: value,
    });
  };

  /* =========================
     HANDLE LOGIN
  ========================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    const identifier = form.identifier.trim().toLowerCase();
    const password = form.password.trim();

    if (!identifier) {
      return setErrorMsg("Enter Email or Phone Number");
    }

    if (!validatePassword(password)) {
      return setErrorMsg("Enter your password");
    }

    try {
      setLoading(true);
      setErrorMsg("");

      console.log("LOGIN REQUEST:", {
        identifier,
        password,
      });

      localStorage.removeItem("token");
      localStorage.removeItem("customerAuth");
      localStorage.removeItem("dealerAuth");
      localStorage.removeItem("adminAuth");

      const response = await fetch(`${API_URL}/api/admin/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          identifier,
          password,
        }),
      });

      const data = await response.json();

      console.log("ADMIN LOGIN RESPONSE:", data);

      if (!response.ok) {
        throw new Error(data.message || "Invalid admin credentials");
      }

      const token = data.token;
      const admin = data.admin || data.user;

      if (!token || !admin) {
        throw new Error("Invalid login response");
      }

      localStorage.setItem("adminToken", token);
      localStorage.setItem("adminAuth", JSON.stringify(admin));

      navigate("/admin/home", {
        replace: true,
      });
    } catch (error) {
      console.error("ADMIN LOGIN ERROR:", error);
      setErrorMsg(error.message || "Invalid admin credentials");
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     UI
  ========================= */
  return (
    <div className="auth-container">
      {/* BACK BUTTON */}
      <button type="button" className="back-btn" onClick={() => navigate("/")}>
        <FaArrowLeft />
        <span>Back</span>
      </button>

      {/* LOGIN FORM */}
      <form className="auth-form" onSubmit={handleSubmit}>
        <h2>Admin Login</h2>

        {errorMsg && <p className="error-text">{errorMsg}</p>}

        <input
          type="text"
          name="identifier"
          placeholder="Admin Email or Phone Number"
          value={form.identifier}
          onChange={handleChange}
        />

        <input
          type="password"
          name="password"
          placeholder="Admin Password"
          value={form.password}
          onChange={handleChange}
        />

        <button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>

        <p
          className="link-text"
          onClick={() => navigate("/admin/forgot-password")}
        >
          Forgot Password?
        </p>
      </form>
    </div>
  );
};

export default AdminLogin;
