import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "./ExploreNearby.css";

const ExploreNearby = () => {
  const navigate = useNavigate();
  const [location, setLocation] = useState(null);
  const [city, setCity] = useState("");
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState(null);
  const [error, setError] = useState("");
  const [manualEntry, setManualEntry] = useState(false); // ✅ NEW
  const [manualCity, setManualCity] = useState(""); // ✅ NEW
  
  const [filters, setFilters] = useState({
    budget: "budget", // budget, mid-range, luxury
    radius: 5, // km
    preferences: ["restaurants", "hotels", "attractions"], // what to search
  });

  // ✅ GET USER'S CURRENT LOCATION
  const getCurrentLocation = () => {
    setLoading(true);
    setError("");
    setManualEntry(false);

    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      setLoading(false);
      setManualEntry(true); // ✅ Show manual entry option
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setLocation({ latitude, longitude });

        // Get city name from coordinates using Reverse Geocoding
        try {
          const cityName = await getCityFromCoordinates(latitude, longitude);
          setCity(cityName);
          setLoading(false);
        } catch (err) {
          setError("Could not determine your city");
          setLoading(false);
        }
      },
      (err) => {
        setError("Unable to retrieve your location. Please try manual entry.");
        setLoading(false);
        setManualEntry(true); // ✅ Show manual entry option
        console.error(err);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  // ✅ REVERSE GEOCODING - Get city name from coordinates
  const getCityFromCoordinates = async (lat, lon) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`
      );
      const data = await response.json();
      
      const cityName = 
        data.address.city || 
        data.address.town || 
        data.address.village || 
        data.address.state_district ||
        data.address.state ||
        "Unknown City";
      
      return cityName;
    } catch (error) {
      console.error("Geocoding error:", error);
      return "Unknown City";
    }
  };

  // ✅ FORWARD GEOCODING - Get coordinates from city name
  const getCoordinatesFromCity = async (cityName) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(cityName)}, India&limit=1`
      );
      const data = await response.json();
      
      if (data && data.length > 0) {
        return {
          latitude: parseFloat(data[0].lat),
          longitude: parseFloat(data[0].lon)
        };
      }
      throw new Error("City not found");
    } catch (error) {
      console.error("Forward geocoding error:", error);
      throw error;
    }
  };

  // ✅ HANDLE MANUAL LOCATION ENTRY
  const handleManualLocation = async () => {
    if (!manualCity.trim()) {
      setError("Please enter a city name");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const coords = await getCoordinatesFromCity(manualCity);
      setLocation(coords);
      setCity(manualCity);
      setManualEntry(false);
      setLoading(false);
    } catch (err) {
      setError("Could not find the city. Please try another name.");
      setLoading(false);
    }
  };

  // ✅ HANDLE PREFERENCE TOGGLE
  const togglePreference = (pref) => {
    if (filters.preferences.includes(pref)) {
      setFilters({
        ...filters,
        preferences: filters.preferences.filter((p) => p !== pref),
      });
    } else {
      setFilters({ ...filters, preferences: [...filters.preferences, pref] });
    }
  };

  // ✅ GENERATE RECOMMENDATIONS
  const generateRecommendations = async () => {
    if (!location || !city) {
      setError("Please set your location first");
      return;
    }

    if (filters.preferences.length === 0) {
      setError("Please select at least one preference");
      return;
    }

    setLoading(true);
    setError("");
    setRecommendations(null);

    try {
      console.log("Sending request:", {
        city: city,
        latitude: location.latitude,
        longitude: location.longitude,
        budget: filters.budget,
        radius: filters.radius,
        preferences: filters.preferences,
      });

      // ✅ FIXED: Use correct endpoint
      const response = await api.post("/nearby-recommendations", {
        city: city,
        latitude: location.latitude,
        longitude: location.longitude,
        budget: filters.budget,
        radius: filters.radius,
        preferences: filters.preferences,
      });

      console.log("Response:", response.data);
      setRecommendations(response.data);
      setLoading(false);
    } catch (err) {
      console.error("Error generating recommendations:", err);
      setError(
        err.response?.data?.detail || 
        "Failed to generate recommendations. Please try again."
      );
      setLoading(false);
    }
  };

  return (
    <div className="explore-nearby-container">
      <div className="explore-header">
        <button className="back-btn" onClick={() => navigate("/")}>
          ← Back
        </button>
        <h1>🗺️ Explore Around Me</h1>
        <p className="subtitle">Discover nearby places tailored to your budget</p>
      </div>

      {/* LOCATION SECTION */}
      <div className="location-section">
        {!location ? (
          <div className="location-prompt">
            <div className="location-icon">📍</div>
            <h3>Set Your Location</h3>
            
            {!manualEntry ? (
              <>
                <p>Allow location access for automatic detection</p>
                <button 
                  className="btn-primary" 
                  onClick={getCurrentLocation}
                  disabled={loading}
                >
                  {loading ? "Getting Location..." : "📍 Use My Current Location"}
                </button>
                
                <div className="or-divider">
                  <span>OR</span>
                </div>
                
                <button 
                  className="btn-secondary-alt"
                  onClick={() => setManualEntry(true)}
                >
                  ✍️ Enter Location Manually
                </button>
              </>
            ) : (
              <div className="manual-entry">
                <p>Enter your city name</p>
                <div className="manual-input-group">
                  <input
                    type="text"
                    placeholder="e.g., Delhi, Mumbai, Jaipur"
                    value={manualCity}
                    onChange={(e) => setManualCity(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleManualLocation()}
                    className="manual-city-input"
                  />
                  <button 
                    className="btn-primary"
                    onClick={handleManualLocation}
                    disabled={loading || !manualCity.trim()}
                  >
                    {loading ? "Locating..." : "Set Location"}
                  </button>
                </div>
                <button 
                  className="btn-link"
                  onClick={() => {
                    setManualEntry(false);
                    setManualCity("");
                    setError("");
                  }}
                >
                  ← Back to auto-detect
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="location-found">
            <div className="location-badge">
              <span className="icon">📍</span>
              <div>
                <p className="location-label">Your Location</p>
                <p className="location-city">{city}</p>
                <p className="location-coords">
                  {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
                </p>
              </div>
            </div>
            <button className="btn-change" onClick={() => {
              setLocation(null);
              setCity("");
              setManualCity("");
              setRecommendations(null);
            }}>
              🔄 Change Location
            </button>
          </div>
        )}
      </div>

      {/* ERROR MESSAGE */}
      {error && (
        <div className="error-message">
          <span className="icon">⚠️</span>
          {error}
        </div>
      )}

      {/* FILTERS SECTION */}
      {location && (
        <div className="filters-section">
          <h3>Customize Your Search</h3>

          {/* Budget Filter */}
          <div className="filter-group">
            <label>💰 Budget Range</label>
            <div className="radio-group">
              <label className={filters.budget === "budget" ? "active" : ""}>
                <input
                  type="radio"
                  name="budget"
                  value="budget"
                  checked={filters.budget === "budget"}
                  onChange={(e) => setFilters({ ...filters, budget: e.target.value })}
                />
                Budget (₹500-2000)
              </label>
              <label className={filters.budget === "mid-range" ? "active" : ""}>
                <input
                  type="radio"
                  name="budget"
                  value="mid-range"
                  checked={filters.budget === "mid-range"}
                  onChange={(e) => setFilters({ ...filters, budget: e.target.value })}
                />
                Mid-Range (₹2000-5000)
              </label>
              <label className={filters.budget === "luxury" ? "active" : ""}>
                <input
                  type="radio"
                  name="budget"
                  value="luxury"
                  checked={filters.budget === "luxury"}
                  onChange={(e) => setFilters({ ...filters, budget: e.target.value })}
                />
                Luxury (₹5000+)
              </label>
            </div>
          </div>

          {/* Radius Filter */}
          <div className="filter-group">
            <label>📏 Search Radius: {filters.radius} km</label>
            <input
              type="range"
              min="1"
              max="20"
              value={filters.radius}
              onChange={(e) => setFilters({ ...filters, radius: parseInt(e.target.value) })}
              className="radius-slider"
            />
          </div>

          {/* Preferences */}
          <div className="filter-group">
            <label>🎯 What are you looking for?</label>
            <div className="checkbox-group">
              <label className={filters.preferences.includes("restaurants") ? "active" : ""}>
                <input
                  type="checkbox"
                  checked={filters.preferences.includes("restaurants")}
                  onChange={() => togglePreference("restaurants")}
                />
                🍽️ Restaurants & Food
              </label>
              <label className={filters.preferences.includes("hotels") ? "active" : ""}>
                <input
                  type="checkbox"
                  checked={filters.preferences.includes("hotels")}
                  onChange={() => togglePreference("hotels")}
                />
                🏨 Hotels & Stays
              </label>
              <label className={filters.preferences.includes("attractions") ? "active" : ""}>
                <input
                  type="checkbox"
                  checked={filters.preferences.includes("attractions")}
                  onChange={() => togglePreference("attractions")}
                />
                🎭 Attractions & Sights
              </label>
              <label className={filters.preferences.includes("shopping") ? "active" : ""}>
                <input
                  type="checkbox"
                  checked={filters.preferences.includes("shopping")}
                  onChange={() => togglePreference("shopping")}
                />
                🛍️ Shopping & Markets
              </label>
              <label className={filters.preferences.includes("cafes") ? "active" : ""}>
                <input
                  type="checkbox"
                  checked={filters.preferences.includes("cafes")}
                  onChange={() => togglePreference("cafes")}
                />
                ☕ Cafes & Bakeries
              </label>
            </div>
          </div>

          {/* Generate Button */}
          <button
            className="btn-generate"
            onClick={generateRecommendations}
            disabled={loading || filters.preferences.length === 0}
          >
            {loading ? "🔄 Generating..." : "✨ Find Nearby Places"}
          </button>
        </div>
      )}

      {/* RECOMMENDATIONS SECTION */}
      {recommendations && (
        <div className="recommendations-section">
          <h2>📍 Nearby Recommendations in {city}</h2>
          <p className="recommendations-subtitle">
            Found {recommendations.places?.length || 0} places within {filters.radius} km
          </p>

          {recommendations.places && recommendations.places.length > 0 ? (
            <div className="recommendations-grid">
              {recommendations.places.map((place, index) => (
                <div key={index} className="place-card">
                  <div className="place-header">
                    <span className="place-icon">
                      {place.type === "restaurant" && "🍽️"}
                      {place.type === "hotel" && "🏨"}
                      {place.type === "attraction" && "🎭"}
                      {place.type === "shopping" && "🛍️"}
                      {place.type === "cafe" && "☕"}
                    </span>
                    <div>
                      <h4>{place.name}</h4>
                      <p className="place-type">{place.category}</p>
                    </div>
                  </div>

                  <p className="place-description">{place.description}</p>

                  <div className="place-details">
                    <span className="detail">
                      <span className="icon">💰</span>
                      {place.price_range}
                    </span>
                    <span className="detail">
                      <span className="icon">📍</span>
                      {place.distance} km away
                    </span>
                    {place.rating && (
                      <span className="detail">
                        <span className="icon">⭐</span>
                        {place.rating}
                      </span>
                    )}
                  </div>

                  {place.address && (
                    <p className="place-address">📍 {place.address}</p>
                  )}

                  <div className="place-actions">
                    <button
                      className="btn-directions"
                      onClick={() => {
                        const lat = place.latitude || location.latitude;
                        const lon = place.longitude || location.longitude;
                        window.open(
                          `https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}`,
                          "_blank"
                        );
                      }}
                    >
                      🧭 Get Directions
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-results">
              <p>No places found. Try adjusting your filters.</p>
            </div>
          )}

          {/* Mini Itinerary */}
          {recommendations.itinerary && (
            <div className="mini-itinerary">
              <h3>🗓️ Suggested Mini Itinerary</h3>
              <div className="itinerary-content">
                <p>{recommendations.itinerary}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ExploreNearby;
