import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";

import {
  validateEmail,
  validatePhone,
  validatePassword,
} from "../../utils/validators";

import { loginCustomer } from "../../services/customerService";

import "../../pages/auth.css";

const CustomerLogin = () => {
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

    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  /* =========================
     HANDLE LOGIN
  ========================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    let { identifier, password } = form;

    identifier = identifier.trim();
    password = password.trim();

    /* VALIDATION */
    if (!validateEmail(identifier) && !validatePhone(identifier)) {
      return setErrorMsg("Enter valid Email or Phone number");
    }

    if (!validatePassword(password)) {
      return setErrorMsg("Enter your password");
    }

    try {
      setLoading(true);
      setErrorMsg("");

      /* Clear old auth data */
      localStorage.removeItem("customerToken");
      localStorage.removeItem("customerAuth");
      localStorage.removeItem("dealerAuth");
      localStorage.removeItem("adminAuth");

      /* API LOGIN */
      const res = await loginCustomer({
        identifier,
        password,
      });

      console.log("CUSTOMER LOGIN RESPONSE:", res);

      /* Read response */
      const token = res?.token;
      const customer = res?.customer || res?.user;

      if (!token || !customer) {
        throw new Error("Login failed");
      }

      /* Save auth data */
      localStorage.setItem("customerToken", token);
      localStorage.setItem("customerAuth", JSON.stringify(customer));

      /* Verify save */
      const savedToken = localStorage.getItem("customerToken");
      const savedCustomer = localStorage.getItem("customerAuth");

      if (!savedToken || !savedCustomer) {
        throw new Error("Failed to save login data");
      }

      console.log("TOKEN SAVED:", savedToken);
      console.log("CUSTOMER SAVED:", savedCustomer);

      /* Redirect */
      navigate("/customer/home", {
        replace: true,
      });
    } catch (error) {
      console.error("CUSTOMER LOGIN ERROR:", error);

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
      {/* BACK BUTTON */}
      <button type="button" className="back-btn" onClick={() => navigate("/")}>
        <FaArrowLeft />
        <span>Back</span>
      </button>

      <form className="auth-form" onSubmit={handleSubmit}>
        <h2>Customer Login</h2>

        {errorMsg && <p className="error-text">{errorMsg}</p>}

        <input
          type="text"
          name="identifier"
          placeholder="Email or Phone Number"
          value={form.identifier}
          onChange={handleChange}
        />

        <input
          type="password"
          name="password"
          placeholder="Enter your password"
          value={form.password}
          onChange={handleChange}
        />

        <button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>

        <p
          className="link-text"
          onClick={() => navigate("/customer/forgot-password")}
        >
          Forgot Password?
        </p>
      </form>
    </div>
  );
};

export default CustomerLogin;
