import API_URL from "../config/api";

const BASE_URL = `${API_URL}/api`;

/* =================================
   GET TOKEN
================================= */

const getToken = () => {
  return (
    localStorage.getItem("token") ||
    localStorage.getItem("customerToken") ||
    localStorage.getItem("dealerToken") ||
    localStorage.getItem("adminToken")
  );
};

/* =================================
   GENERIC REQUEST
================================= */

const request = async (endpoint, method = "GET", data = null) => {
  try {
    const token = getToken();

    const options = {
      method,
      headers: {},
    };

    /* =========================
       CONTENT TYPE
    ========================= */

    if (!(data instanceof FormData)) {
      options.headers["Content-Type"] = "application/json";
    }

    /* =========================
       AUTH TOKEN
    ========================= */

    if (token) {
      options.headers.Authorization = `Bearer ${token}`;
    }

    /* =========================
       REQUEST BODY
    ========================= */

    if (data) {
      options.body = data instanceof FormData ? data : JSON.stringify(data);
    }

    /* =========================
       FETCH API
    ========================= */

    const response = await fetch(`${BASE_URL}${endpoint}`, options);

    let result = {};

    /* =========================
       SAFE JSON PARSE
    ========================= */

    try {
      result = await response.json();
    } catch (error) {
      console.warn("Invalid JSON response");
    }

    /* =========================
       RESPONSE ERROR
    ========================= */

    if (!response.ok) {
      throw new Error(result.message || "Request failed");
    }

    return result;
  } catch (error) {
    console.error(`API ${method} Error:`, error);
    throw error;
  }
};

/* =================================
   API SERVICE METHODS
================================= */

export const apiService = {
  /* GET */

  get: async (endpoint) => {
    return await request(endpoint, "GET");
  },

  /* POST */

  post: async (endpoint, data) => {
    return await request(endpoint, "POST", data);
  },

  /* PUT */

  put: async (endpoint, data) => {
    return await request(endpoint, "PUT", data);
  },

  /* DELETE */

  delete: async (endpoint) => {
    return await request(endpoint, "DELETE");
  },
};
