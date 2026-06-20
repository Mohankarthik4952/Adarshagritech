import { useState } from "react";

import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";

import {
  validateEmail,
  validatePhone,
  validatePassword,
} from "../../utils/validators";

import { loginDealer } from "../../services/dealerService";

import "../../pages/auth.css";

const DealerLogin = () => {
  const navigate = useNavigate();

  /* =========================
     STATE
  ========================= */

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

    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  /* =========================
     SUBMIT LOGIN
  ========================= */

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log("DEALER LOGIN SUBMIT ✅");

    let { identifier, password } = form;

    identifier = identifier.trim();

    password = password.trim();

    /* =========================
       VALIDATION
    ========================= */

    if (!validateEmail(identifier) && !validatePhone(identifier)) {
      return setErrorMsg("Enter valid Email or Phone number");
    }

    if (!validatePassword(password)) {
      return setErrorMsg("Enter your password");
    }

    /* =========================
       LOGIN API
    ========================= */

    try {
      setLoading(true);

      setErrorMsg("");

      const res = await loginDealer({
        identifier,
        password,
      });

      console.log("DEALER LOGIN RESPONSE:", res);

      const { token, dealer } = res;

      /* =========================
         TOKEN CHECK
      ========================= */

      if (!token) {
        throw new Error("Login failed");
      }

      /* =========================
         SAVE AUTH
      ========================= */

      localStorage.setItem("dealerToken", token);

      localStorage.setItem("dealerAuth", JSON.stringify(dealer));

      console.log("DEALER TOKEN SAVED:", localStorage.getItem("token"));

      /* =========================
         SUCCESS
      ========================= */

      navigate("/dealer/home", {
        replace: true,
      });
    } catch (error) {
      console.error("DEALER LOGIN ERROR:", error);

      setErrorMsg(error.message || "Invalid email/phone or password");
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     UI
  ========================= */

  return (
    <div className="auth-container">
      <button type="button" className="back-btn" onClick={() => navigate("/")}>
        <FaArrowLeft />
        <span>Back</span>
      </button>
      <form className="auth-form" onSubmit={handleSubmit}>
        <h2>Dealer Login</h2>

        {/* ERROR */}

        {errorMsg && <p className="error-text">{errorMsg}</p>}

        {/* IDENTIFIER */}

        <input
          type="text"
          name="identifier"
          placeholder="Email or Phone Number"
          value={form.identifier}
          onChange={handleChange}
        />

        {/* PASSWORD */}

        <input
          type="password"
          name="password"
          placeholder="Enter your password"
          value={form.password}
          onChange={handleChange}
        />

        {/* BUTTON */}

        <button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>

        {/* FORGOT PASSWORD */}

        <p
          className="link-text"
          onClick={() => navigate("/dealer/forgot-password")}
        >
          Forgot Password?
        </p>
      </form>
    </div>
  );
};

export default DealerLogin;
