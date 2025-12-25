const Footer = () => {
  return (
    <footer className="bg-white py-16 px-10 text-gray-600">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
        <div>
          <h4 className="font-bold text-gray-800 mb-3">TripCraft AI</h4>
          <p className="text-sm">
            Plan your perfect trip with AI-powered itineraries.
          </p>
        </div>

        <div>
          <h4 className="font-semibold text-gray-800 mb-3">Product</h4>
          <ul className="space-y-1 text-sm">
            <li>Features</li>
            <li>Pricing</li>
            <li>FAQ</li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-gray-800 mb-3">Company</h4>
          <ul className="space-y-1 text-sm">
            <li>About Us</li>
            <li>Contact</li>
            <li>Careers</li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-gray-800 mb-3">Legal</h4>
          <ul className="space-y-1 text-sm">
            <li>Privacy Policy</li>
            <li>Terms of Service</li>
            <li>Cookie Policy</li>
          </ul>
        </div>
      </div>

      <div className="text-sm text-gray-500 text-center mt-12">
        © 2025 TripCraft AI. All rights reserved.<br />
        Powered by OpenAI, Gemini & DeepSeek
      </div>
    </footer>
  );
};

export default Footer;
