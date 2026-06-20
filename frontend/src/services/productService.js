import { apiService } from "./apiService";

/* PRODUCT VISIBILITY */

export const getDealerProducts = async () => {
  return await apiService.get("/dealer/products");
};

export const getCustomerProducts = async () => {
  return await apiService.get("/customer/products");
};
