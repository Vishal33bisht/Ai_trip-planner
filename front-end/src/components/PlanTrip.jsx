import { useState } from "react";
import api from "../services/api.js";
import "../pages/PlanTrip.css";
import { useNavigate } from "react-router-dom";

const PlanTrip = () => {
  const navigate = useNavigate();
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

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

  // ✅ VALIDATION FUNCTION
  const validateForm = () => {
    const newErrors = {};

    // ✅ City Validation - Remove whitespace and check if empty
    if (!form.city.trim()) {
      newErrors.city = "City name is required";
    } else if (form.city.trim().length < 2) {
      newErrors.city = "City name must be at least 2 characters";
    }

    // ✅ Days Validation
    if (!form.days || form.days < 1) {
      newErrors.days = "Trip must be at least 1 day";
    } else if (form.days > 90) {
      newErrors.days = "Trip cannot exceed 90 days";
    }

    // ✅ Budget Validation
    if (!form.budget || form.budget < 500) {
      newErrors.budget = "Budget must be at least ₹500";
    } else if (form.budget > 10000000) {
      newErrors.budget = "Budget cannot exceed ₹1 crore";
    }

    // ✅ Interests Validation
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

  // ✅ VALIDATE BEFORE SUBMITTING
  if (!validateForm()) {
    return;
  }

  setLoading(true);
  setErrors({});

  try {
    // ✅ Clean city name before sending
    const cleanedForm = {
      ...form,
      city: form.city.trim(),
    };

    // ✅ CORRECT: Use /itineraries (not /api/itineraries)
    const response = await api.post("/itineraries", cleanedForm);
    
    console.log("Success:", response.data);
    alert(`Itinerary for ${cleanedForm.city} generated successfully!`);
    navigate(`/trip/${response.data.id}`);
  } catch (error) {
    console.error("Error creating itinerary:", error);

    if (error.response?.data?.detail) {
      if (typeof error.response.data.detail === "string") {
        setErrors({ general: error.response.data.detail });
      } else {
        const backendErrors = {};
        error.response.data.detail.forEach((err) => {
          backendErrors[err.loc[1]] = err.msg;
        });
        setErrors(backendErrors);
      }
    } else {
      setErrors({
        general: "Failed to create itinerary. Please make sure you are logged in.",
      });
    }
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="trip-container">
      <h2 className="form-title">Plan Your Trip</h2>

      <form className="trip-form" onSubmit={handleSubmit}>
        {/* ✅ SHOW GENERAL ERRORS */}
        {errors.general && (
          <div className="error-message" style={{ 
            padding: "10px", 
            background: "#fee", 
            border: "1px solid #fcc", 
            borderRadius: "5px",
            marginBottom: "15px",
            color: "#c33"
          }}>
            {errors.general}
          </div>
        )}

        {/* ✅ SIMPLE CITY INPUT - NO AUTOCOMPLETE */}
        <div className="form-group">
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
            <span className="field-error" style={{ color: "red", fontSize: "12px" }}>
              {errors.city}
            </span>
          )}
          <p className="info-text" style={{ fontSize: "12px", color: "#666", marginTop: "5px" }}>
            💡 Tip: Enter any Indian city name (works for 40+ major cities)
          </p>
        </div>

        {/* Days Input */}
        <div className="form-group">
          <input
            type="number"
            placeholder="No. of Days (1-90)"
            value={form.days}
            onChange={(e) => {
              setForm({ ...form, days: parseInt(e.target.value) || "" });
              setErrors({ ...errors, days: "" });
            }}
            min="1"
            max="90"
            className={errors.days ? "input-error" : ""}
            required
          />
          {errors.days && (
            <span className="field-error" style={{ color: "red", fontSize: "12px" }}>
              {errors.days}
            </span>
          )}
        </div>

        {/* Budget Input */}
        <div className="form-group">
          <input
            type="number"
            placeholder="Budget (₹)"
            value={form.budget}
            onChange={(e) => {
              setForm({ ...form, budget: parseInt(e.target.value) || "" });
              setErrors({ ...errors, budget: "" });
            }}
            min="500"
            className={errors.budget ? "input-error" : ""}
            required
          />
          {errors.budget && (
            <span className="field-error" style={{ color: "red", fontSize: "12px" }}>
              {errors.budget}
            </span>
          )}
        </div>

        {/* Travel Style */}
        <select
          value={form.travelStyle}
          onChange={(e) => setForm({ ...form, travelStyle: e.target.value })}
        >
          <option value="budget">Budget Travel</option>
          <option value="mid-range">Mid-Range</option>
          <option value="luxury">Luxury</option>
        </select>

        {/* Accommodation */}
        <select
          value={form.accommodation}
          onChange={(e) => setForm({ ...form, accommodation: e.target.value })}
        >
          <option value="">Accommodation Preference</option>
          <option value="budget">Budget Hotel (₹1k–₹3k/night)</option>
          <option value="mid-range">Mid-Range (₹3k–₹7k/night)</option>
          <option value="luxury">Luxury (₹7k+)</option>
          <option value="hostel">Hostel</option>
          <option value="airbnb">Airbnb / Homestay</option>
        </select>

        {/* Travel Pace */}
        <select
          value={form.pace}
          onChange={(e) => setForm({ ...form, pace: e.target.value })}
        >
          <option value="">Travel Pace</option>
          <option value="slow">Slow & Relaxing 😌</option>
          <option value="moderate">Standard (Balanced) 🙂</option>
          <option value="fast">Fast & Packed 😎</option>
        </select>

        {/* Transport Mode */}
        <select
          value={form.transportMode}
          onChange={(e) => setForm({ ...form, transportMode: e.target.value })}
        >
          <option value="">Transport Mode</option>
          <option value="walking">Walking</option>
          <option value="public">Public Transport</option>
          <option value="taxi">Taxi / Ride-hailing</option>
          <option value="rental">Rental Car / Scooter</option>
        </select>

        {/* Trip Interests */}
        <div className="interests-section">
          <label>Trip Interests (Optional):</label>
          {[
            "Historical Sites",
            "Beaches",
            "Museums",
            "Nightlife",
            "Nature & Hiking",
            "Amusement Parks",
          ].map((interest) => (
            <label key={interest} className="checkbox-label">
              <input
                type="checkbox"
                checked={form.interests.includes(interest)}
                onChange={() => handleCheckboxChange(interest)}
                disabled={
                  form.interests.length >= 10 &&
                  !form.interests.includes(interest)
                }
              />
              {interest}
            </label>
          ))}
          {errors.interests && (
            <span className="field-error" style={{ color: "red", fontSize: "12px" }}>
              {errors.interests}
            </span>
          )}
          <p className="info-text" style={{ fontSize: "12px", color: "#666" }}>
            {form.interests.length}/10 interests selected
          </p>
        </div>

        {/* Submit Button */}
        <button className="submit-btn" type="submit" disabled={loading}>
          {loading ? "🔄 Generating Itinerary..." : "✈️ Generate AI Itinerary"}
        </button>
      </form>
    </div>
  );
};

export default PlanTrip;
