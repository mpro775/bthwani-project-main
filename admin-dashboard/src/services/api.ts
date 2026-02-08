import axios from "axios";

const api = axios.create({
  baseURL: "https://api.bthwani.com/api/v1", // dev via Vite proxy; set prod via env
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("adminToken") || localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export { api };
