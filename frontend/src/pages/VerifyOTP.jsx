import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { verifyOTP, forgotPassword } from "../services/customerService";
import { FaArrowLeft } from "react-icons/fa";
import "./auth.css";

const VerifyOTP = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const email = location.state?.email;

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);

  const [timer, setTimer] = useState(120);
  const [resendTimer, setResendTimer] = useState(60);

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
    if (!/^[0-9]?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

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
      return alert("Enter complete OTP");
    }

    try {
      setLoading(true);

      await verifyOTP({
        email,
        otp: finalOtp,
      });

      alert("OTP verified successfully ✅");

      navigate("/customer/reset-password", {
        state: { email },
      });
    } catch (error) {
      console.error(error);
      alert(error.message || "Invalid OTP ❌");
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     RESEND OTP
  ========================= */
  const handleResend = async () => {
    try {
      await forgotPassword({ email });

      alert("OTP resent successfully ✅");

      setTimer(120);
      setResendTimer(60);
    } catch (error) {
      console.error(error);
      alert(error.message || "Failed to resend OTP ❌");
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
              maxLength="1"
              className="otp-box"
              value={digit}
              onChange={(e) => handleChange(e.target.value, index)}
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
