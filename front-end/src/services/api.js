import axios from "axios";

const configuredApiUrl = import.meta.env.VITE_API_BASE_URL?.trim();

export const API_URL =
  configuredApiUrl || (import.meta.env.DEV ? "http://127.0.0.1:8000" : "");

export function ensureApiUrl() {
  if (!API_URL) {
    throw new Error(
      "API URL is not configured. Set VITE_API_BASE_URL in your frontend deployment."
    );
  }

  return API_URL;
}

export async function apiFetch(path, options = {}) {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch(`${ensureApiUrl()}${path}`, {
      ...options,
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    const contentType = response.headers.get("content-type") || "";
    const data = contentType.includes("application/json")
      ? await response.json()
      : await response.text();

    if (!response.ok) {
      const detail =
        typeof data === "object" && data !== null ? data.detail : data;
      throw new Error(detail || "Request failed");
    }

    return data;
  } catch (error) {
    if (error.name === "AbortError") {
      throw new Error("Request timed out. Please check that the backend is running.");
    }

    throw error;
  } finally {
    window.clearTimeout(timeoutId);
  }
}

const api = axios.create({
  baseURL: API_URL ? `${API_URL}/api` : "/api",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 20000,
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    if (!API_URL) {
      throw new Error(
        "API URL is not configured. Set VITE_API_BASE_URL in your frontend deployment."
      );
    }

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
