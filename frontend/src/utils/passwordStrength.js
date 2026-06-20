export const checkPasswordStrength = (password) => {
  if (!password) return "Weak";

  if (password.length < 6) return "Weak";

  const hasUpper = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[!@#$%^&*]/.test(password);

  if (hasUpper && hasNumber && hasSpecial && password.length >= 8) {
    return "Strong";
  }

  if ((hasUpper && hasNumber) || password.length >= 6) {
    return "Medium";
  }

  return "Weak";
};
