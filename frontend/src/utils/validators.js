export const validateEmail = (email) => {
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return pattern.test(email);
};

export const validatePhone = (phone) => {
  const pattern = /^[0-9]{10}$/;
  return pattern.test(phone);
};

export const validatePassword = (password) => {
  return password && password.length >= 6;
};

export const validateRequired = (value) => {
  return value && value.trim() !== "";
};

export const validatePincode = (pincode) => {
  const pattern = /^[1-9][0-9]{5}$/;
  return pattern.test(pincode);
};

export const validateNumber = (value) => {
  return !isNaN(value);
};

export const validatePasswordMatch = (password, confirmPassword) => {
  return password === confirmPassword;
};

export const validateGST = (gst) => {
  const pattern = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
  return pattern.test(gst);
};
