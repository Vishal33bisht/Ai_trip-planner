import { useNavigate } from "react-router-dom";

const Hero = () => {

   const navigate = useNavigate();
  return (
    <section
      className="text-center text-white py-32"
      style={{
        background:
          "linear-gradient(to bottom, #005a7a, #61d5e7)",
      }}
    >
      <h2 className="text-4xl font-bold leading-tight">
        Your Perfect Trip,<br />Planned by AI
      </h2>

      <p className="text-lg opacity-90 mt-4">
        We create customized, budget-accurate day-by-day itineraries for 40+ global cities.
      </p>

      <div className="flex justify-center gap-4 mt-6">
        <button 
      onClick={() => navigate('/plan-trip')}
      className="bg-teal-500 px-6 py-3 rounded-lg font-semibold"
    >
      Plan My AI Trip
    </button>
        
      </div>

      <div className="flex justify-center gap-12 mt-10 opacity-90 text-sm">
        <span>40+ Cities Supported</span>
        <span>±10% Budget Accuracy</span>
        <span>AI-Powered Planning</span>
      </div>
    </section>
  );
};

export default Hero;
