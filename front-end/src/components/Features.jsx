import "./Landing.css";

const features = [
  {
    icon: "📋",
    title: "Detailed Itineraries",
    desc: "Get hour-by-hour breakdowns optimized by sophisticated AI that understands your preferences and budget constraints.",
  },
  {
    icon: "💰",
    title: "Budget Accuracy",
    desc: "Plans stay within ±10% of your budget across food, transport, activities, and accommodation with smart allocation.",
  },
  {
    icon: "✨",
    title: "Personalized Experiences",
    desc: "Unique trips tailored to your interests, travel style, pace, and accommodation preferences for the perfect journey.",
  },
];

const smallFeatures = [
  {
    icon: "⚡",
    title: "Lightning Fast",
    desc: "Get your complete itinerary in minutes with AI-powered generation.",
  },
  {
    icon: "🔒",
    title: "Secure & Private",
    desc: "We never share your data. Your travel plans stay completely private.",
  },
  {
    icon: "🤝",
    title: "Collaborative",
    desc: "Share plans with friends easily and plan together seamlessly.",
  },
  {
    icon: "📈",
    title: "Always Improving",
    desc: "AI learns from feedback to provide better recommendations.",
  },
];

const Features = () => {
  return (
    <section className="features-section">
      {/* Header */}
      <div className="features-header">
        <h2 className="features-title">Why Choose TripCraft AI?</h2>
        <p className="features-subtitle">
          Experience the future of travel planning with AI-powered itineraries that adapt to your needs
        </p>
      </div>

      {/* Main Feature Cards */}
      <div className="features-grid">
        {features.map((feature) => (
          <div key={feature.title} className="feature-card">
            <div className="feature-icon">{feature.icon}</div>
            <h3 className="feature-title">{feature.title}</h3>
            <p className="feature-desc">{feature.desc}</p>
          </div>
        ))}
      </div>

      {/* Small Features Grid */}
      <div className="small-features">
        {smallFeatures.map((feature) => (
          <div key={feature.title} className="small-feature">
            <div className="small-feature-icon">{feature.icon}</div>
            <div className="small-feature-content">
              <h5>{feature.title}</h5>
              <p>{feature.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Features;
