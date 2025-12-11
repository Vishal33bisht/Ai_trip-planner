import { useState } from "react";

const Signup = () => {
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  const registerUser = async () => {
  const res = await fetch("http://localhost:8000/api/auth/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(form),
  });

  if (res.ok) {
    alert("Account created successfully!");
    window.location.href = "/login";
  } else {
    alert("Signup failed");
  }
};


  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-50">
      <div className="bg-white p-8 shadow rounded-xl w-96">
        <h2 className="text-2xl font-bold text-center mb-6">Create Account</h2>

        <input
          type="text"
          placeholder="Name"
          className="w-full p-3 border rounded mb-3"
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />

        <input
          type="email"
          placeholder="Email"
          className="w-full p-3 border rounded mb-3"
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full p-3 border rounded mb-3"
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />

        <button
          className="w-full bg-teal-600 text-white py-3 rounded-lg"
          onClick={registerUser}
        >
          Sign Up
        </button>
      </div>
    </div>
  );
};

export default Signup;
