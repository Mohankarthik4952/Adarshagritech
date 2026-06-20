import { apiService } from "./apiService";

/* ===============================
   CUSTOMER AUTH
================================ */

// Signup
export const registerCustomer = async (data) => {
  return await apiService.post("/customer/signup", data);
};

// Login
export const loginCustomer = async (data) => {
  return await apiService.post("/customer/login", data);
};

// OTP Verify
export const verifyOTP = async (data) => {
  return await apiService.post("/customer/verify-otp", data);
};

// Forgot Password
export const forgotPassword = async (data) => {
  return await apiService.post("/customer/forgot-password", data);
};

// Reset Password
export const resetPassword = async (data) => {
  return await apiService.post("/customer/reset-password", data);
};

/* ===============================
   CUSTOMER PRODUCTS
================================ */

export const getCustomerProducts = async () => {
  return await apiService.get("/customer/products");
};

/* ===============================
   CUSTOMER ORDERS
================================ */

export const placeCustomerOrder = async (data) => {
  return await apiService.post("/customer/orders", data);
};

export const getCustomerOrders = async () => {
  return await apiService.get("/customer/orders");
};

/* ===============================
   CUSTOMER TRANSACTIONS
================================ */

export const getCustomerTransactions = async () => {
  return await apiService.get("/transactions/customer");
};
