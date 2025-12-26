import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import PlanTrip from "./components/PlanTrip";
import Features from "./components/Features";
import CTA from "./components/CTA";
import Footer from "./components/Footer";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import TripDetails from "./pages/TripDetails";

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route
          path="/"
          element={
            <>
              <Hero />
              <Features />
              <CTA />
            </>
          }
        />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/plan-trip" element={<PlanTrip />} />
        <Route path="/trip/:id" element={<TripDetails />} />
      </Routes>
      <Footer />
    </>
  );
}

export default App;
