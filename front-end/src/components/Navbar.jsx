import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

const Navbar = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("userEmail");
    if (savedUser) setUser(savedUser);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userEmail");
    setUser(null);
    navigate("/");
  };

  return (
    <header className="w-full bg-white px-10 py-4 flex justify-between items-center shadow-sm">
      <h1 className="font-semibold text-gray-800 cursor-pointer" onClick={() => navigate("/")}>
        TripCraft AI
      </h1>

      <nav className="hidden md:flex gap-8 text-gray-600">
        <button onClick={() => navigate("/")}>Home</button>
        <button onClick={() => navigate("/")}>Plan Trip</button>
      </nav>

      <div className="flex gap-3 items-center">
        {user ? (
          <>
            <span className="font-medium text-gray-700">
              {user.split("@")[0]} {/* Display name-like */}
            </span>

            <button
              className="bg-gray-300 px-4 py-2 rounded-lg"
              onClick={handleLogout}
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <button
              className="text-gray-700 border px-4 py-2 rounded-lg"
              onClick={() => navigate("/login")}
            >
              Login
            </button>
            <button
              className="bg-teal-500 text-white px-4 py-2 rounded-lg"
              onClick={() => navigate("/signup")}
            >
              Sign Up
            </button>
          </>
        )}
      </div>
    </header>
  );
};

export default Navbar;
