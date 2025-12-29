import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import "./TripDetails.css";

const TripDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeView, setActiveView] = useState("overview"); // 'overview' or 'daily'

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

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading your dream trip...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <p className="error-message">{error}</p>
        <button onClick={() => navigate("/plan-trip")}>← Back to Planner</button>
      </div>
    );
  }

  if (!trip) return <div className="error-container">No trip found.</div>;

  return (
    <div className="trip-details-wrapper">
      {/* Header Section */}
      <div className="trip-header">
        <Link to="/plan-trip" className="back-link">
          ← Back to Planner
        </Link>
        
        <div className="trip-title-section">
          <h1 className="trip-title">Trip to {trip.city} ✈️</h1>
          <div className="trip-meta">
            <span className="meta-badge">
              <span className="icon">📅</span>
              Duration: {trip.days} Days
            </span>
            <span className="meta-badge">
              <span className="icon">💰</span>
              Budget: ₹{trip.budget.toLocaleString()}
            </span>
          </div>
        </div>

        {/* View Toggle */}
        <div className="view-toggle">
          <button
            className={activeView === "overview" ? "active" : ""}
            onClick={() => setActiveView("overview")}
          >
            📋 Overview
          </button>
          <button
            className={activeView === "daily" ? "active" : ""}
            onClick={() => setActiveView("daily")}
          >
            📆 Daily View
          </button>
        </div>
      </div>

      {/* Content Section */}
      <div className="trip-content">
        {activeView === "overview" ? (
          // Overview Layout (3 columns - like reference image)
          <div className="overview-grid">
            {trip.plan && trip.plan.map((day, index) => (
              <div key={index} className="day-card-overview">
                <div className="day-header">
                  <span className="day-icon">📅</span>
                  <h3>Day {day.day}</h3>
                </div>

                <div className="time-section morning">
                  <div className="time-header">
                    <span className="time-icon">🌅</span>
                    <h4>Morning:</h4>
                  </div>
                  <div className="time-content">
                    <p className="time-label">⏰ 8 AM - 10 AM</p>
                    <p className="activity-text">{day.morning}</p>
                  </div>
                </div>

                <div className="time-section afternoon">
                  <div className="time-header">
                    <span className="time-icon">☀️</span>
                    <h4>Afternoon:</h4>
                  </div>
                  <div className="time-content">
                    <p className="time-label">⏰ 1 PM - 3 PM</p>
                    <p className="activity-text">{day.afternoon}</p>
                  </div>
                </div>

                <div className="time-section evening">
                  <div className="time-header">
                    <span className="time-icon">🌙</span>
                    <h4>Evening:</h4>
                  </div>
                  <div className="time-content">
                    <p className="time-label">⏰ 7 PM</p>
                    <p className="activity-text">{day.evening}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          // Daily View (Single column - detailed)
          <div className="daily-view">
            {trip.plan && trip.plan.map((day, index) => (
              <div key={index} className="day-card-daily">
                <div className="day-badge">
                  <span className="icon">📅</span>
                  Day {day.day}
                </div>

                <div className="daily-section morning-section">
                  <div className="section-icon">🌅</div>
                  <div className="section-content">
                    <h4>Morning:</h4>
                    <p className="activity-description">{day.morning}</p>
                  </div>
                </div>

                <div className="daily-section afternoon-section">
                  <div className="section-icon">☀️</div>
                  <div className="section-content">
                    <h4>Afternoon:</h4>
                    <p className="activity-description">{day.afternoon}</p>
                  </div>
                </div>

                <div className="daily-section evening-section">
                  <div className="section-icon">🌙</div>
                  <div className="section-content">
                    <h4>Evening:</h4>
                    <p className="activity-description">{day.evening}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="trip-actions">
        <button className="btn-secondary" onClick={() => navigate("/plan-trip")}>
          🔄 Plan Another Trip
        </button>
        <button className="btn-primary" onClick={() => window.print()}>
          📥 Save PDF
        </button>
      </div>
    </div>
  );
};

export default TripDetails;
