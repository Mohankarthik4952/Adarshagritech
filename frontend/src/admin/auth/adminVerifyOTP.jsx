// src/admin/auth/adminVerifyOTP.jsx

import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";

import {
  verifyAdminResetOTP,
  sendAdminResetOTP,
} from "../../services/adminService";

import "./adminAuth.css";

const AdminVerifyOTP = () => {
  const navigate = useNavigate();
  const location = useLocation();

  /* =========================
     GET EMAIL FROM PREVIOUS PAGE
  ========================= */
  const email = location.state?.email || "";

  console.log("LOCATION STATE:", location.state);
  console.log("EMAIL:", email);

  /* =========================
     STATE
  ========================= */
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(120); // 2 minutes
  const [resendTimer, setResendTimer] = useState(60); // 1 minute

  /* =========================
     OTP EXPIRY TIMER
  ========================= */
  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  /* =========================
     RESEND TIMER
  ========================= */
  useEffect(() => {
    const interval = setInterval(() => {
      setResendTimer((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  /* =========================
     HANDLE OTP INPUT
  ========================= */
  const handleChange = (value, index) => {
    // Allow only numbers
    if (!/^[0-9]?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Move to next box automatically
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  /* =========================
     VERIFY OTP
  ========================= */
  const handleVerify = async (e) => {
    e.preventDefault();

    const finalOtp = otp.join("");

    if (finalOtp.length !== 6) {
      alert("Enter complete OTP");
      return;
    }

    if (!email) {
      alert("Email not found. Please request OTP again.");
      navigate("/admin/forgot-password", {
        replace: true,
      });
      return;
    }

    try {
      setLoading(true);

      await verifyAdminResetOTP({
        email,
        otp: finalOtp,
      });

      alert("OTP verified successfully ✅");

      // Redirect to reset password page
      navigate("/admin/reset-password", {
        state: {
          email,
        },
        replace: true,
      });
    } catch (error) {
      console.error("VERIFY OTP ERROR:", error);
      alert(error.message || "Invalid OTP ❌");
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     RESEND OTP
  ========================= */
  const handleResend = async () => {
    if (!email) {
      alert("Email not found. Please request OTP again.");
      navigate("/admin/forgot-password", {
        replace: true,
      });
      return;
    }

    try {
      await sendAdminResetOTP({
        email,
      });

      alert("OTP resent successfully ✅");

      // Reset timers
      setTimer(120);
      setResendTimer(60);

      // Clear entered OTP
      setOtp(["", "", "", "", "", ""]);

      // Focus first box
      setTimeout(() => {
        document.getElementById("otp-0")?.focus();
      }, 100);
    } catch (error) {
      console.error("RESEND OTP ERROR:", error);
      alert(error.message || "Failed to resend OTP ❌");
    }
  };

  /* =========================
     TIMER FORMAT
  ========================= */
  const minutes = Math.floor(timer / 60);
  const seconds = timer % 60;

  /* =========================
     SHOW MESSAGE IF EMAIL MISSING
  ========================= */
  if (!email) {
    return (
      <div className="admin-auth-container">
        <div className="admin-auth-card">
          <h2>Email Not Found</h2>

          <p className="otp-info">Please request a new OTP.</p>

          <button
            type="button"
            onClick={() =>
              navigate("/admin/forgot-password", {
                replace: true,
              })
            }
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  /* =========================
     UI
  ========================= */
  return (
    <div className="admin-auth-container">
      {/* BACK BUTTON */}
      <button
        type="button"
        className="back-btn"
        onClick={() =>
          navigate("/admin/forgot-password", {
            replace: true,
          })
        }
      >
        <FaArrowLeft />
        <span>Back</span>
      </button>

      {/* OTP FORM */}
      <form className="admin-auth-card" onSubmit={handleVerify}>
        <h2>Verify OTP</h2>

        <p className="otp-info">
          Enter the 6-digit OTP sent to:
          <br />
          <strong>{email}</strong>
        </p>

        {/* OTP BOXES */}
        <div className="otp-box-container">
          {otp.map((digit, index) => (
            <input
              key={index}
              id={`otp-${index}`}
              type="text"
              maxLength="1"
              className="otp-box"
              value={digit}
              onChange={(e) => handleChange(e.target.value, index)}
            />
          ))}
        </div>

        {/* OTP TIMER */}
        <p className="otp-timer">
          OTP expires in: {minutes}:{seconds < 10 ? `0${seconds}` : seconds}
        </p>

        {/* VERIFY BUTTON */}
        <button type="submit" disabled={loading || timer === 0}>
          {loading ? "Verifying..." : "Verify OTP"}
        </button>

        {/* RESEND SECTION */}
        <div className="resend-section">
          {resendTimer > 0 ? (
            <p>Resend OTP in {resendTimer}s</p>
          ) : (
            <button type="button" className="resend-btn" onClick={handleResend}>
              Resend OTP
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default AdminVerifyOTP;
