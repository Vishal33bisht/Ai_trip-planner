import axios from "axios";

const API_URL = "http://127.0.0.1:8000/api";

// Create a single axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// === API Functions ===

// GET list of cities
export async function getCities() {
  const response = await api.get("/cities");
  return response.data;
}

// POST create itinerary
export async function createItinerary(data) {
  const response = await api.post("/itineraries", data);
  return response.data;
}

// Default export
export default api;
