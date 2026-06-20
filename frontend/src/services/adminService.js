import { apiService } from "./apiService";

/* ADD PRODUCT */

export const addProduct = async (data) => {
  return await apiService.post("/admin/products", data);
};

/* GET PRODUCTS */

export const getAllProducts = async () => {
  return await apiService.get("/admin/products");
};

/* GET ORDERS */

export const getAllOrders = async () => {
  return await apiService.get("/admin/orders");
};

/* GET TRANSACTIONS */

export const getAllTransactions = async () => {
  return await apiService.get("/admin/transactions");
};

export const adminLogin = (data) => {
  return apiService.post("/admin/login", data);
};

export const verifyAdminOTP = (data) => {
  return apiService.post("/admin/verify-otp", data);
};

export const createAdminPassword = (data) => {
  return apiService.post("/admin/create-password", data);
};

export const verifyAdminPassword = (data) => {
  return apiService.post("/admin/verify-password", data);
};

export const resendAdminOTP = (data) => {
  return apiService.post("/admin/resend-otp", data);
};

export const resetAdminPassword = (data) => {
  return apiService.post("/admin/reset-password", data);
};

export const sendAdminResetOTP = (data) => {
  return apiService.post("/admin/forgot-password", data);
};

export const verifyAdminResetOTP = (data) => {
  return apiService.post("/admin/verify-reset-otp", data);
};
