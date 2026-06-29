// src/admin/auth/adminForgotPassword.jsx

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import { sendAdminResetOTP } from "../../services/adminService";
import "./adminAuth.css";

const AdminForgotPassword = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("adarshagritech389@gmail.com");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ✅ DEFINE trimmedEmail BEFORE USING IT
    const trimmedEmail = email.trim().toLowerCase();

    // Validation
    if (!trimmedEmail || !trimmedEmail.includes("@")) {
      alert("Enter valid email");
      return;
    }

    try {
      setLoading(true);

      // Send OTP
      const res = await sendAdminResetOTP({
        email: trimmedEmail,
      });

      console.log("ADMIN FORGOT PASSWORD RESPONSE:", res);

      alert("OTP sent successfully ✅");

      // Navigate to Verify OTP page
      navigate("/admin/verify-otp", {
        state: {
          email: trimmedEmail,
          reset: true,
        },
      });
    } catch (error) {
      console.error("ADMIN FORGOT PASSWORD ERROR:", error);
      alert(error.message || "Failed to send OTP ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-auth-container">
      {/* Back Button */}
      <button
        type="button"
        className="back-btn"
        onClick={() => navigate("/admin/login")}
      >
        <FaArrowLeft />
        <span>Back</span>
      </button>

      {/* Forgot Password Form */}
      <form className="admin-auth-card" onSubmit={handleSubmit}>
        <h2>Forgot Admin Password</h2>

        <input
          type="email"
          placeholder="Enter admin email"
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

export default AdminForgotPassword;
