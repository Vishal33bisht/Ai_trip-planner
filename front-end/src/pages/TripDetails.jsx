import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../services/api";
import "../App.css"; // Reuse main styles or create a new CSS file

const TripDetails = () => {
  const { id } = useParams();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTrip = async () => {
      try {
        const res = await api.get(`/itineraries/${id}`);
        setTrip(res.data);
      } catch (err) {
        setError("Failed to load itinerary. Please try again.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTrip();
  }, [id]);

  if (loading) return <div className="loading">Loading your dream trip...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!trip) return <div>No trip found.</div>;

  return (
    <div className="trip-details-container" style={{ padding: "2rem", maxWidth: "800px", margin: "0 auto" }}>
      <Link to="/plan-trip">← Back to Planner</Link>
      
      <h1>Trip to {trip.city} ✈️</h1>
      <div className="trip-summary">
        <p><strong>Duration:</strong> {trip.days} Days</p>
        <p><strong>Budget:</strong> ₹{trip.budget}</p>
      </div>

      <div className="itinerary-timeline">
        {trip.plan.map((day) => (
          <div key={day.id} className="day-card" style={{ 
            border: "1px solid #ddd", 
            borderRadius: "10px", 
            padding: "1.5rem", 
            margin: "1rem 0",
            backgroundColor: "#f9f9f9"
          }}>
            <h3>Day {day.day_number}</h3>
            <div className="day-part">
              <strong>🌅 Morning:</strong>
              <p>{day.morning}</p>
            </div>
            <div className="day-part">
              <strong>☀️ Afternoon:</strong>
              <p>{day.afternoon}</p>
            </div>
            <div className="day-part">
              <strong>🌙 Evening:</strong>
              <p>{day.evening}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TripDetails;