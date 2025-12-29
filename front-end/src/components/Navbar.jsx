import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

const Navbar = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem("userEmail");
    if (savedUser) setUser(savedUser);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("token");
    localStorage.removeItem("userEmail");
    setUser(null);
    navigate("/");
    setMobileMenuOpen(false);
  };

  const handleNavClick = (path) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  return (
    <header className="w-full bg-white px-6 md:px-10 py-4 flex justify-between items-center shadow-md sticky top-0 z-50">
      {/* Logo */}
      <h1
        className="font-bold text-xl md:text-2xl text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-purple-600 cursor-pointer"
        onClick={() => handleNavClick("/")}
      >
        ✈️ TripCraft AI
      </h1>

      {/* Desktop Navigation */}
      <nav className="hidden md:flex gap-8 text-gray-700 font-medium">
        <button
          onClick={() => handleNavClick("/")}
          className="hover:text-teal-500 transition-colors"
        >
          Home
        </button>
        
        {user && (
          <>
            <button
              onClick={() => handleNavClick("/plan-trip")}
              className="hover:text-teal-500 transition-colors"
            >
              📝 Plan Trip
            </button>
            <button
              onClick={() => handleNavClick("/explore-nearby")}
              className="hover:text-teal-500 transition-colors flex items-center gap-1"
            >
              🗺️ Explore Nearby
            </button>
          </>
        )}
      </nav>

      {/* Right Side - Auth Buttons */}
      <div className="hidden md:flex gap-3 items-center">
        {user ? (
          <>
            <div className="flex items-center gap-2 bg-gradient-to-r from-teal-50 to-purple-50 px-4 py-2 rounded-full">
              <span className="text-2xl">👤</span>
              <span className="font-semibold text-gray-800">
                {user.split("@")[0]}
              </span>
            </div>

            <button
              className="bg-gradient-to-r from-gray-600 to-gray-700 text-white px-5 py-2 rounded-lg font-medium hover:from-gray-700 hover:to-gray-800 transition-all shadow-md hover:shadow-lg"
              onClick={handleLogout}
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <button
              className="text-gray-700 border-2 border-gray-300 px-5 py-2 rounded-lg font-medium hover:bg-gray-100 transition-all"
              onClick={() => handleNavClick("/login")}
            >
              Login
            </button>
            <button
              className="bg-gradient-to-r from-teal-500 to-teal-600 text-white px-5 py-2 rounded-lg font-medium hover:from-teal-600 hover:to-teal-700 transition-all shadow-md hover:shadow-lg"
              onClick={() => handleNavClick("/signup")}
            >
              Sign Up
            </button>
          </>
        )}
      </div>

      {/* Mobile Menu Button */}
      <button
        className="md:hidden text-gray-700 text-3xl"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
      >
        {mobileMenuOpen ? "✕" : "☰"}
      </button>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="absolute top-full left-0 w-full bg-white shadow-lg md:hidden z-50">
          <nav className="flex flex-col p-4 gap-3">
            <button
              onClick={() => handleNavClick("/")}
              className="text-left py-2 px-4 hover:bg-gray-100 rounded-lg font-medium text-gray-700"
            >
              Home
            </button>

            {user && (
              <>
                <button
                  onClick={() => handleNavClick("/plan-trip")}
                  className="text-left py-2 px-4 hover:bg-gray-100 rounded-lg font-medium text-gray-700"
                >
                  📝 Plan Trip
                </button>
                <button
                  onClick={() => handleNavClick("/explore-nearby")}
                  className="text-left py-2 px-4 hover:bg-gray-100 rounded-lg font-medium text-gray-700"
                >
                  🗺️ Explore Nearby
                </button>
              </>
            )}

            <hr className="my-2" />

            {user ? (
              <>
                <div className="flex items-center gap-2 py-2 px-4 bg-gradient-to-r from-teal-50 to-purple-50 rounded-lg">
                  <span className="text-2xl">👤</span>
                  <span className="font-semibold text-gray-800">
                    {user.split("@")[0]}
                  </span>
                </div>
                <button
                  className="bg-gradient-to-r from-gray-600 to-gray-700 text-white py-2 px-4 rounded-lg font-medium w-full"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <button
                  className="text-gray-700 border-2 border-gray-300 py-2 px-4 rounded-lg font-medium w-full hover:bg-gray-100"
                  onClick={() => handleNavClick("/login")}
                >
                  Login
                </button>
                <button
                  className="bg-gradient-to-r from-teal-500 to-teal-600 text-white py-2 px-4 rounded-lg font-medium w-full"
                  onClick={() => handleNavClick("/signup")}
                >
                  Sign Up
                </button>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Navbar;
