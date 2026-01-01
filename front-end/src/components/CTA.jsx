import { useNavigate } from "react-router-dom";
import "./Landing.css";

const CTA = () => {
  const navigate = useNavigate();

  return (
    <section className="cta-section">
      <div className="cta-content">
        <h2 className="cta-title">
          Ready to Plan Your Dream Trip?
        </h2>
        <p className="cta-subtitle">
          Join thousands of travelers who trust AI to create their perfect itineraries. 
          Start planning your next adventure in minutes!
        </p>
        <button
          onClick={() => navigate('/plan-trip')}
          className="cta-button"
        >
          🌟 Get Started Free
        </button>
      </div>
    </section>
  );
};

export default CTA;
