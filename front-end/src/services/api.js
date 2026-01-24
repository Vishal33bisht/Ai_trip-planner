import axios from "axios";

// Use environment variable for API URL
const API_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export async function getCities() {
  const response = await api.get("/cities");
  return response.data;
}

export async function createItinerary(data) {
  const response = await api.post("/itineraries", data);
  return response.data;
}

export default api;