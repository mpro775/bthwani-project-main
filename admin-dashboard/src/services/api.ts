import axios from "axios";

export const api = axios.create({
  baseURL: "https://api.bthwani.com/api/v1", // dev via Vite proxy; set prod via env
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
});
