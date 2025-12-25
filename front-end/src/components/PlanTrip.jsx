import { useEffect, useState } from "react";
import api from "../services/api.js";
import "../pages/PlanTrip.css";
import { useNavigate } from "react-router-dom";

const PlanTrip = () => {
  const [cities, setCities] = useState([]);
  const [filteredCities, setFilteredCities] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    city: "",
    days: "",
    budget: "",
    travelStyle: "",
    accommodation: "",
    pace: "",
    transportMode: "",
    interests: [],
  });

  useEffect(() => {
    const fetchCities = async () => {
      try {
        const res = await api.get("/cities");
        setCities(res.data);
        setFilteredCities(res.data);
      } catch (err) {
        console.error("Error loading cities", err);
      }
    };
    fetchCities();
  }, []);

  const handleCheckboxChange = (interest) => {
    const updated = [...form.interests];
    if (updated.includes(interest)) {
      setForm({ ...form, interests: updated.filter((i) => i !== interest) });
    } else {
      updated.push(interest);
      setForm({ ...form, interests: updated });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.city || !form.days || !form.budget) {
      alert("Please fill in the required fields (City, Days, Budget)");
      return;
    }
try {
      const response = await api.post("/itineraries", form);
    
      console.log("Success:", response.data);
      alert("Itinerary Generated!");
      
      // 3. Redirect to a details page (we will build this next)
      // navigate(`/trip/${response.data.id}`); 
      
    } catch (error) {
      console.error("Error creating itinerary:", error);
      alert("Failed to create plan. Make sure you are logged in or the backend is running.");
    }
  };

  return (
    <div className="trip-container">
      <h2 className="form-title">Plan Your Trip</h2>

      <form className="trip-form" onSubmit={handleSubmit}>

        {/* 🔍 Searchable City Selection */}
        {/* City Searchable Dropdown */}
        <div className="city-search-box">
          <input
            type="text"
            placeholder="Search City..."
            value={form.city}
            onChange={(e) => {
              const typed = e.target.value.toLowerCase();
              setForm({ ...form, city: e.target.value });

              const filtered = cities.filter((city) =>
                city.name.toLowerCase().includes(typed)
              );
              setFilteredCities(filtered);
              setShowDropdown(true);
            }}
            onFocus={() => setShowDropdown(true)}
          />

          {showDropdown && filteredCities.length > 0 && (
            <ul className="city-dropdown">
              {filteredCities.map((city) => (
                <li
                  key={city.id}
                  onClick={() => {
                    setForm({ ...form, city: city.name });
                    setShowDropdown(false);
                  }}
                >
                  {city.name}
                </li>
              ))}
            </ul>
          )}
        </div>


        {/* Other fields remain unchanged */}
        <input
          type="number"
          placeholder="No. of Days"
          value={form.days}
          onChange={(e) => setForm({ ...form, days: e.target.value })}
          min="1"
        />

        <input
          type="number"
          placeholder="Budget (₹)"
          value={form.budget}
          onChange={(e) => setForm({ ...form, budget: e.target.value })}
          min="1000"
        />

        <select
          value={form.travelStyle}
          onChange={(e) => setForm({ ...form, travelStyle: e.target.value })}
        >
          <option value="">Travel Style</option>
          <option>Relax & Chill</option>
          <option>Adventure & Activities</option>
          <option>Tourist Hotspots</option>
          <option>Food & Culture</option>
          <option>Shopping & Entertainment</option>
        </select>

        <select
          value={form.accommodation}
          onChange={(e) => setForm({ ...form, accommodation: e.target.value })}
        >
          <option value="">Accommodation Preference</option>
          <option>Budget Hotel (₹1k–₹3k/night)</option>
          <option>Mid-Range (₹3k–₹7k/night)</option>
          <option>Luxury (₹7k+)</option>
          <option>Hostel</option>
          <option>Airbnb / Homestay</option>
        </select>

        <select
          value={form.pace}
          onChange={(e) => setForm({ ...form, pace: e.target.value })}
        >
          <option value="">Travel Pace</option>
          <option>Slow & Relaxing 😌</option>
          <option>Standard (Balanced) 🙂</option>
          <option>Fast & Packed 😎</option>
        </select>

        <select
          value={form.transportMode}
          onChange={(e) =>
            setForm({ ...form, transportMode: e.target.value })
          }
        >
          <option value="">Transport Mode</option>
          <option>Walking</option>
          <option>Public Transport</option>
          <option>Taxi / Ride-hailing</option>
          <option>Rental Car / Scooter</option>
        </select>

        <div className="interests-section">
          <label>Trip Interests:</label>
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
              />
              {interest}
            </label>
          ))}
        </div>

        <button className="submit-btn" type="submit">
          Generate AI Itinerary
        </button>
      </form>
    </div>
  );
};

export default PlanTrip;
