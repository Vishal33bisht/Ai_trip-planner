const features = [
  {
    title: "Detailed Itineraries",
    desc: "Get hour-by-hour breakdowns optimized by sophisticated LLMs."
  },
  {
    title: "Budget Accuracy",
    desc: "Plans stay within ±10% of your budget across transport and meals."
  },
  {
    title: "Personalized Experiences",
    desc: "Unique trips tailored to your interests and travel style."
  },
];

const smallPoints = [
  { title: "Lightning Fast", desc: "Get your itinerary in minutes." },
  { title: "Secure & Private", desc: "We never share your data." },
  { title: "Collaborative", desc: "Share plans with friends easily." },
  { title: "Always Improving", desc: "AI learns from feedback." },
];

const Features = () => {
  return (
    <section className="py-24 bg-gray-50 text-center">
      <h3 className="text-3xl font-bold text-gray-800">Why Choose TripCraft AI?</h3>
      <p className="text-gray-500 mt-2">
        Experience the future of travel planning with AI-powered itineraries
      </p>

      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 px-10">
        {features.map((f) => (
          <div key={f.title} className="bg-white p-6 rounded-2xl shadow">
            <h4 className="font-semibold text-lg">{f.title}</h4>
            <p className="text-gray-500 mt-2">{f.desc}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16 px-10 text-left text-gray-700">
        {smallPoints.map((p) => (
          <div key={p.title}>
            <h5 className="font-semibold">{p.title}</h5>
            <p className="text-gray-500">{p.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Features;
