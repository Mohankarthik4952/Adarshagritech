import { apiService } from "./apiService";

export const requestPasswordReset = async (data) => {
  return apiService.post("/auth/forgot-password", data);
};

export const verifyOTP = async (data) => {
  return apiService.post("/auth/verify-otp", data);
};

export const resetPassword = async (data) => {
  return apiService.post("/auth/reset-password", data);
};
