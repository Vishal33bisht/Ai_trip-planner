const CTA = () => {
  return (
    <section
      className="mx-auto my-20 w-4/5 text-center text-white py-16 rounded-3xl"
      style={{
        background:
          "linear-gradient(to right,#1ea19d,#e4835e)"
      }}
    >
      <h3 className="text-3xl font-bold">
        Ready to Plan Your Next Adventure?
      </h3>
      <p className="mt-2">
        Join thousands who found their perfect trips with TripCraft AI.
      </p>

      <div className="flex justify-center gap-4 mt-8">
        <button className="bg-white text-gray-700 px-6 py-3 rounded-lg font-semibold">
          Start Planning Now
        </button>
        <button className="border border-white px-6 py-3 rounded-lg font-semibold">
          Learn More
        </button>
      </div>

      <div className="flex justify-center gap-16 mt-10 font-semibold">
        <div><span className="text-2xl">40+</span><br/>Cities Covered</div>
        <div><span className="text-2xl">88%</span><br/>Budget Accuracy</div>
        <div><span className="text-2xl">10K+</span><br/>Happy Travelers</div>
      </div>
    </section>
  );
};

export default CTA;
