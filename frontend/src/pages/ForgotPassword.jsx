import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";

import { validateEmail } from "../utils/validators";

import { forgotPassword as customerForgotPassword } from "../services/customerService";
import { forgotPassword as dealerForgotPassword } from "../services/dealerService";

import "./auth.css";

const ForgotPassword = ({ role = "customer" }) => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateEmail(email)) {
      return alert("Enter valid email");
    }

    try {
      setLoading(true);

      if (role === "dealer") {
        await dealerForgotPassword({ email });

        navigate("/dealer/verify-otp", {
          state: {
            email,
            role,
          },
        });
      } else {
        await customerForgotPassword({ email });

        navigate("/customer/verify-otp", {
          state: {
            email,
            role,
          },
        });
      }

      alert("OTP sent successfully ✅");
    } catch (error) {
      console.error(error);

      alert(error.message || "Failed to send OTP");
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
        <h2>Forgot Password</h2>

        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <button type="submit" disabled={loading}>
          {loading ? "Sending OTP..." : "Send OTP"}
        </button>
      </form>
    </div>
  );
};

export default ForgotPassword;
