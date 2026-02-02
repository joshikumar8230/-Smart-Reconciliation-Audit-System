import axios from "axios";
export const api = axios.create({
  baseURL: "https://smart-reconciliation-audit-system-xcoi.onrender.com/api",
});
api.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
