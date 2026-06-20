import { apiService } from "./apiService";
import axios from "axios";

const API = "http://localhost:5000/api";

/* DEALER PRODUCTS */

export const getDealerProducts = async () => {
  try {
    const token =
      localStorage.getItem("token") || localStorage.getItem("dealerToken");

    const response = await axios.get(`${API}/dealer/products`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error) {
    console.log("Dealer products fetch error:", error);

    return [];
  }
};

/* ADD TO CART / ORDER */

export const placeDealerOrder = async (data) => {
  return await apiService.post("/dealer/orders", data);
};

/* GET DEALER ORDERS */

export const getDealerOrders = async () => {
  return await apiService.get("/dealer/orders");
};

/* TRANSACTION HISTORY */

export const getDealerTransactions = async () => {
  return await apiService.get("/dealer/transactions");
};

export const registerDealer = async (data) => {
  return await apiService.post("/dealer/signup", data);
};

export const loginDealer = async (data) => {
  return await apiService.post("/dealer/login", data);
};

export const payOutstanding = async (data) => {
  return await apiService.post("/dealer/payment/pay-outstanding", data);
};
