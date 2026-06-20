import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { validateEmail } from "../utils/validators";
import { forgotPassword } from "../services/customerService";
import { FaArrowLeft } from "react-icons/fa";
import "./auth.css";

const ForgotPassword = () => {
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

      const res = await forgotPassword({ email });

      console.log("FORGOT RESPONSE:", res);

      alert("OTP sent successfully ✅");

      // ✅ FIX: correct route
      navigate("/customer/verify-otp", {
        state: { email },
      });
    } catch (error) {
      console.error("FORGOT ERROR:", error);
      alert(error.message || "Failed to send OTP ❌");
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
