/* =============================
   ADMIN EMAIL VALIDATION
============================= */

export const validateAdminEmail = (email) => {
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  return pattern.test(email);
};

/* =============================
   ADMIN PHONE VALIDATION
============================= */

export const validateAdminPhone = (phone) => {
  const pattern = /^[0-9]{10}$/;

  return pattern.test(phone);
};

/* =============================
   STRONG PASSWORD VALIDATION
============================= */
export const validateAdminPassword = (password) => {
  if (!password) {
    return "Password is required";
  }

  if (password.length < 8) {
    return "Password must be at least 8 characters";
  }

  if (!/[A-Z]/.test(password)) {
    return "Password must contain an uppercase letter";
  }

  if (!/[0-9]/.test(password)) {
    return "Password must contain a number";
  }

  return "";
};

/* =============================
   PASSWORD MATCH
============================= */

export const validateAdminPasswordMatch = (password, confirmPassword) => {
  return password === confirmPassword;
};

// OTP validation

export const validateAdminOTP = (otp) => {
  const pattern = /^[0-9]{6}$/;
  return pattern.test(otp);
};

export const validateEmailOrPhone = (value) => {
  if (!value) {
    return "Email or phone required";
  }

  const emailRegex = /\S+@\S+\.\S+/;
  const phoneRegex = /^[0-9]{10}$/;

  if (!emailRegex.test(value) && !phoneRegex.test(value)) {
    return "Enter valid email or phone";
  }

  return "";
};
