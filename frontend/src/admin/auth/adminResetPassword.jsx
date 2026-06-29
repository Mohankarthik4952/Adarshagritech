import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaEye, FaEyeSlash } from "react-icons/fa";
import { resetAdminPassword } from "../../services/adminService";
import "./adminAuth.css";

const AdminResetPassword = () => {
  const navigate = useNavigate();

  // Fixed admin email
  const ADMIN_EMAIL = "adarshagritech389@gmail.com";

  // Form State
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Show / Hide Password State
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Handle Reset Password
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!password || password.length < 6) {
      alert("Password must be at least 6 characters");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    try {
      setLoading(true);

      const res = await resetAdminPassword({
        email: ADMIN_EMAIL,
        password: password.trim(),
      });

      console.log("RESET PASSWORD RESPONSE:", res);

      alert("Password reset successfully ✅");

      // Redirect to Admin Login
      navigate("/admin/login", {
        replace: true,
      });
    } catch (error) {
      console.error("RESET PASSWORD ERROR:", error);

      alert(error.message || "Failed to reset password ❌");
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
        onClick={() => navigate("/admin/verify-otp")}
      >
        <FaArrowLeft />
        <span>Back</span>
      </button>

      {/* Reset Password Form */}
      <form className="admin-auth-card" onSubmit={handleSubmit}>
        <h2>Reset Admin Password</h2>

        {/* New Password */}
        <div
          style={{
            position: "relative",
            marginBottom: "15px",
          }}
        >
          <input
            type={showPassword ? "text" : "password"}
            placeholder="New Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              paddingRight: "45px",
            }}
          />

          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            style={{
              position: "absolute",
              right: "12px",
              top: "50%",
              transform: "translateY(-50%)",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              color: "#64748b",
              width: "auto",
              padding: 0,
            }}
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </button>
        </div>

        {/* Confirm Password */}
        <div
          style={{
            position: "relative",
            marginBottom: "15px",
          }}
        >
          <input
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            style={{
              paddingRight: "45px",
            }}
          />

          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            style={{
              position: "absolute",
              right: "12px",
              top: "50%",
              transform: "translateY(-50%)",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              color: "#64748b",
              width: "auto",
              padding: 0,
            }}
          >
            {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
          </button>
        </div>

        {/* Submit Button */}
        <button type="submit" disabled={loading}>
          {loading ? "Updating Password..." : "Reset Password"}
        </button>
      </form>
    </div>
  );
};

export default AdminResetPassword;
