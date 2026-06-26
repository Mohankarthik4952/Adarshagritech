import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";

import {
  verifyOTP as customerVerifyOTP,
  forgotPassword as customerForgotPassword,
} from "../services/customerService";

import {
  verifyOTP as dealerVerifyOTP,
  forgotPassword as dealerForgotPassword,
} from "../services/dealerService";

import "./auth.css";

const VerifyOTP = ({ role = "customer" }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const email = location.state?.email;
  const userRole = location.state?.role || role;

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);

  const [timer, setTimer] = useState(120);
  const [resendTimer, setResendTimer] = useState(60);

  useEffect(() => {
    if (!email) {
      navigate(`/${userRole}/forgot-password`, { replace: true });
    }
  }, [email, userRole, navigate]);

  /* =========================
     OTP TIMER
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
     OTP INPUT
  ========================= */

  const handleChange = (value, index) => {
    if (!/^\d?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;

    setOtp(newOtp);

    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  /* =========================
     BACKSPACE / ARROWS
  ========================= */

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace") {
      e.preventDefault();

      const newOtp = [...otp];

      if (newOtp[index] !== "") {
        newOtp[index] = "";
        setOtp(newOtp);
      } else if (index > 0) {
        document.getElementById(`otp-${index - 1}`)?.focus();
        newOtp[index - 1] = "";
        setOtp(newOtp);
      }
    }

    if (e.key === "ArrowLeft" && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus();
    }

    if (e.key === "ArrowRight" && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  /* =========================
     PASTE OTP
  ========================= */

  const handlePaste = (e) => {
    e.preventDefault();

    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);

    if (!pasted) return;

    const values = pasted.split("");

    const newOtp = [...otp];

    values.forEach((digit, index) => {
      newOtp[index] = digit;
    });

    setOtp(newOtp);

    const focusIndex = Math.min(values.length, 5);

    document.getElementById(`otp-${focusIndex}`)?.focus();
  };

  /* =========================
     VERIFY OTP
  ========================= */

  const handleVerify = async (e) => {
    e.preventDefault();

    const finalOtp = otp.join("");

    if (finalOtp.length !== 6) {
      return alert("Enter complete OTP");
    }

    try {
      setLoading(true);

      if (userRole === "dealer") {
        await dealerVerifyOTP({
          email,
          otp: finalOtp,
        });

        navigate("/dealer/reset-password", {
          state: {
            email,
            role: "dealer",
          },
        });
      } else {
        await customerVerifyOTP({
          email,
          otp: finalOtp,
        });

        navigate("/customer/reset-password", {
          state: {
            email,
            role: "customer",
          },
        });
      }

      alert("OTP verified successfully ✅");
    } catch (error) {
      console.error(error);
      alert(error.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     RESEND OTP
  ========================= */

  const handleResend = async () => {
    try {
      if (userRole === "dealer") {
        await dealerForgotPassword({ email });
      } else {
        await customerForgotPassword({ email });
      }

      alert("OTP resent successfully ✅");

      setTimer(120);
      setResendTimer(60);
    } catch (error) {
      console.error(error);
      alert(error.message || "Failed to resend OTP");
    }
  };

  const minutes = Math.floor(timer / 60);
  const seconds = timer % 60;

  return (
    <div className="auth-container">
      <button type="button" className="back-btn" onClick={() => navigate("/")}>
        <FaArrowLeft />
        <span>Back</span>
      </button>

      <form className="auth-form" onSubmit={handleVerify}>
        <h2>Verify OTP</h2>

        <div className="otp-box-container">
          {otp.map((digit, index) => (
            <input
              key={index}
              id={`otp-${index}`}
              type="text"
              inputMode="numeric"
              maxLength="1"
              className="otp-box"
              value={digit}
              onChange={(e) => handleChange(e.target.value, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              onPaste={handlePaste}
              autoComplete="one-time-code"
            />
          ))}
        </div>

        <p className="otp-timer">
          OTP expires in: {minutes}:{seconds < 10 ? `0${seconds}` : seconds}
        </p>

        <button type="submit" disabled={loading || timer === 0}>
          {loading ? "Verifying..." : "Verify OTP"}
        </button>

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

export default VerifyOTP;
