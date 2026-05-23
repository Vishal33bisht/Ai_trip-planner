import { useState, useEffect } from "react";
import api from "../services/api.js";
import "../pages/PlanTrip.css";
import { useNavigate } from "react-router-dom";

const PlanTrip = () => {
  const navigate = useNavigate();
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false); // ✅ Dark mode state

  const [form, setForm] = useState({
    city: "",
    days: "",
    budget: "",
    travelStyle: "mid-range",
    accommodation: "hotel",
    pace: "moderate",
    transportMode: "public transport",
    interests: [],
  });

  // ✅ Load dark mode preference from localStorage
  useEffect(() => {
    const savedMode = localStorage.getItem("darkMode");
    if (savedMode === "true") {
      setDarkMode(true);
      document.body.classList.add("dark-mode");
    }
  }, []);

  // ✅ Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.body.classList.toggle("dark-mode");
    localStorage.setItem("darkMode", !darkMode);
  };

  // ✅ VALIDATION FUNCTION
  const validateForm = () => {
    const newErrors = {};

    if (!form.city.trim()) {
      newErrors.city = "City name is required";
    } else if (form.city.trim().length < 2) {
      newErrors.city = "City name must be at least 2 characters";
    }

    if (!form.days || form.days < 1) {
      newErrors.days = "Trip must be at least 1 day";
    } else if (form.days > 90) {
      newErrors.days = "Trip cannot exceed 90 days";
    }

    if (!form.budget || form.budget < 500) {
      newErrors.budget = "Budget must be at least ₹500";
    } else if (form.budget > 10000000) {
      newErrors.budget = "Budget cannot exceed ₹1 crore";
    }

    if (form.interests.length > 10) {
      newErrors.interests = "Select maximum 10 interests";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCheckboxChange = (interest) => {
    const updated = [...form.interests];
    if (updated.includes(interest)) {
      setForm({ ...form, interests: updated.filter((i) => i !== interest) });
    } else {
      updated.push(interest);
      setForm({ ...form, interests: updated });
    }
    setErrors({ ...errors, interests: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Quick client-side auth check
    const token = localStorage.getItem("token");
    if (!token) {
      setErrors({ general: "You are not logged in. Please log in to continue." });
      return;
    }

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const cleanedForm = {
        ...form,
        city: form.city.trim(),
        days: form.days === "" ? null : Number(form.days),
        budget: form.budget === "" ? null : Number(form.budget),
      };

      const response = await api.post("/itineraries", cleanedForm);
      
      console.log("Success:", response.data);
      alert(`Itinerary for ${cleanedForm.city} generated successfully!`);
      navigate(`/trip/${response.data.id}`);
    } catch (error) {
      console.error("Error creating itinerary:", error, error.response || null);

      // If backend returned a 401, prompt user to log in
      if (error.response) {
        if (error.response.status === 401) {
          setErrors({ general: "Authentication required — please log in." });
        } else if (error.response.data?.detail) {
          if (typeof error.response.data.detail === "string") {
            setErrors({ general: error.response.data.detail });
          } else if (Array.isArray(error.response.data.detail)) {
            const backendErrors = {};
            error.response.data.detail.forEach((err) => {
              backendErrors[err.loc[1]] = err.msg;
            });
            setErrors(backendErrors);
          } else {
            setErrors({ general: JSON.stringify(error.response.data) });
          }
        } else {
          setErrors({ general: error.message || "Request failed" });
        }
      } else {
        // Network or CORS error
        setErrors({ general: error.message || "Network error. Check backend/CORS." });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`trip-container ${darkMode ? "dark" : ""}`}>
      <div className="trip-card">
        {/* ✅ Dark Mode Toggle */}
        <button className="dark-mode-toggle" onClick={toggleDarkMode}>
          {darkMode ? "☀️" : "🌙"}
        </button>

        <h2 className="form-title">
          ✈️ Plan Your Dream Trip
        </h2>
        <p className="form-subtitle">Let AI craft the perfect itinerary for you</p>

        <form className="trip-form" onSubmit={handleSubmit}>
          {/* ✅ SHOW GENERAL ERRORS */}
          {errors.general && (
            <div className="error-message">
              {errors.general}
            </div>
          )}

          {/* City Input */}
          <div className="form-group">
            <label className="form-label">📍 Destination</label>
            <input
              type="text"
              placeholder="Enter City Name (e.g., Delhi, Mumbai, Jaipur)"
              value={form.city}
              onChange={(e) => {
                setForm({ ...form, city: e.target.value });
                setErrors({ ...errors, city: "" });
              }}
              className={errors.city ? "input-error" : ""}
              required
            />
            {errors.city && (
              <span className="field-error">{errors.city}</span>
            )}
            <p className="info-text">
              💡 Works for 40+ major Indian cities
            </p>
          </div>

          {/* Days Input */}
          <div className="form-group">
            <label className="form-label">📅 Duration</label>
            <input
              type="number"
              placeholder="No. of Days (1-90)"
              value={form.days}
              onChange={(e) => {
                const raw = e.target.value;
                if (raw === "") {
                  setForm({ ...form, days: "" });
                  setErrors({ ...errors, days: "" });
                  return;
                }
                const val = parseInt(raw, 10);
                if (isNaN(val)) {
                  setForm({ ...form, days: "" });
                  return;
                }
                if (val < 1) {
                  setForm({ ...form, days: "" });
                  setErrors({ ...errors, days: "Trip must be at least 1 day" });
                  return;
                }
                setForm({ ...form, days: val });
                setErrors({ ...errors, days: "" });
              }}
              onKeyDown={(e) => { if (e.key === "-") e.preventDefault(); }}
              min="1"
              max="90"
              className={errors.days ? "input-error" : ""}
              required
            />
            {errors.days && (
              <span className="field-error">{errors.days}</span>
            )}
          </div>

          {/* Budget Input */}
          <div className="form-group">
            <label className="form-label">💰 Budget</label>
            <input
              type="number"
              placeholder="Budget (₹)"
              value={form.budget}
              onChange={(e) => {
                // allow only digits while typing, don't clear the input so users can type multi-digit numbers
                const raw = e.target.value.replace(/[^0-9]/g, "");
                setForm({ ...form, budget: raw });
                if (raw === "") {
                  setErrors({ ...errors, budget: "" });
                } else if (Number(raw) < 500) {
                  setErrors({ ...errors, budget: "Budget must be at least ₹500" });
                } else if (Number(raw) > 10000000) {
                  setErrors({ ...errors, budget: "Budget cannot exceed ₹1 crore" });
                } else {
                  setErrors({ ...errors, budget: "" });
                }
              }}
              onKeyDown={(e) => { if (e.key === "-") e.preventDefault(); }}
              min="500"
              className={errors.budget ? "input-error" : ""}
              required
            />
            {errors.budget && (
              <span className="field-error">{errors.budget}</span>
            )}
          </div>

          {/* Travel Style */}
          <div className="form-group">
            <label className="form-label">🎒 Travel Style</label>
            <select
              value={form.travelStyle}
              onChange={(e) => setForm({ ...form, travelStyle: e.target.value })}
            >
              <option value="budget">Budget Travel</option>
              <option value="mid-range">Mid-Range</option>
              <option value="luxury">Luxury</option>
            </select>
          </div>

          {/* Accommodation */}
          <div className="form-group">
            <label className="form-label">🏨 Accommodation</label>
            <select
              value={form.accommodation}
              onChange={(e) => setForm({ ...form, accommodation: e.target.value })}
            >
              <option value="">Select Preference</option>
              <option value="budget">Budget Hotel (₹1k–₹3k/night)</option>
              <option value="mid-range">Mid-Range (₹3k–₹7k/night)</option>
              <option value="luxury">Luxury (₹7k+)</option>
              <option value="hostel">Hostel</option>
              <option value="airbnb">Airbnb / Homestay</option>
            </select>
          </div>

          {/* Travel Pace */}
          <div className="form-group">
            <label className="form-label">⚡ Travel Pace</label>
            <select
              value={form.pace}
              onChange={(e) => setForm({ ...form, pace: e.target.value })}
            >
              <option value="">Select Pace</option>
              <option value="slow">Slow & Relaxing 😌</option>
              <option value="moderate">Standard (Balanced) 🙂</option>
              <option value="fast">Fast & Packed 😎</option>
            </select>
          </div>

          {/* Transport Mode */}
          <div className="form-group">
            <label className="form-label">🚗 Transport Mode</label>
            <select
              value={form.transportMode}
              onChange={(e) => setForm({ ...form, transportMode: e.target.value })}
            >
              <option value="">Select Transport</option>
              <option value="walking">Walking</option>
              <option value="public">Public Transport</option>
              <option value="taxi">Taxi / Ride-hailing</option>
              <option value="rental">Rental Car / Scooter</option>
            </select>
          </div>

          {/* Trip Interests */}
          <div className="interests-section">
            <label className="section-title">🎯 Trip Interests (Optional)</label>
            {[
              { emoji: "🏛️", name: "Historical Sites" },
              { emoji: "🏖️", name: "Beaches" },
              { emoji: "🏛️", name: "Museums" },
              { emoji: "🎉", name: "Nightlife" },
              { emoji: "🌲", name: "Nature & Hiking" },
              { emoji: "🎢", name: "Amusement Parks" },
            ].map((interest) => (
              <label key={interest.name} className="checkbox-label">
                <input
                  type="checkbox"
                  checked={form.interests.includes(interest.name)}
                  onChange={() => handleCheckboxChange(interest.name)}
                  disabled={
                    form.interests.length >= 10 &&
                    !form.interests.includes(interest.name)
                  }
                />
                <span>{interest.emoji} {interest.name}</span>
              </label>
            ))}
            {errors.interests && (
              <span className="field-error">{errors.interests}</span>
            )}
            <p className="info-text">
              {form.interests.length}/6 interests selected
            </p>
          </div>

          {/* Submit Button */}
          <button className="submit-btn" type="submit" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner"></span> Generating Magic...
              </>
            ) : (
              <>✨ Generate AI Itinerary</>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PlanTrip;
