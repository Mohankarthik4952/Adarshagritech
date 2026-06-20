export const isStrongPassword = (password) => {
  if (!password) return false;

  const minLength = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[@$!%*?&#]/.test(password);

  return minLength && hasUpper && hasLower && hasNumber && hasSpecial;
};
