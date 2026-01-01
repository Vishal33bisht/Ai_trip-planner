import { useNavigate } from "react-router-dom";
import "./Landing.css";

const Hero = () => {
  const navigate = useNavigate();

  return (
    <section className="hero-section">
      {/* Animated Particles */}
      <div className="hero-particles">
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
      </div>

      {/* Hero Content */}
      <div className="hero-content">
        <div className="hero-badge">
          ✨ Powered by Google Gemini AI
        </div>

        <h1 className="hero-title">
          Your Perfect Trip,<br />Planned by AI
        </h1>

        <p className="hero-subtitle">
          We create customized, budget-accurate day-by-day itineraries for 40+ Indian cities. 
          Let AI handle the planning while you focus on the adventure.
        </p>

        <button
          onClick={() => navigate('/plan-trip')}
          className="hero-cta"
        >
          ✈️ Plan My AI Trip
        </button>

        {/* Stats Bar */}
        <div className="hero-stats">
          <div className="hero-stat">
            <span>🏙️</span>
            <span>40+ Cities Supported</span>
          </div>
          <div className="hero-stat">
            <span>💰</span>
            <span>±10% Budget Accuracy</span>
          </div>
          <div className="hero-stat">
            <span>🤖</span>
            <span>AI-Powered Planning</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
