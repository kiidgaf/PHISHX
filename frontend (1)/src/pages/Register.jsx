import React, { useState } from "react";
import {useNavigate } from "react-router-dom";

export default function Register() {
  const [formData, setFormData] = useState({ 
    first_name: "",
    last_name: "",
    phone: "",
    country: "",
    email: "",
    password: "",
    confirm_password: "",
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch("http://localhost:5000/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Registration failed");

      navigate("/login");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <form onSubmit={handleSubmit} className="w-full max-w-md bg-white p-6 rounded-xl shadow space-y-4">
        <h2 className="text-2xl font-bold mb-2">Register</h2>
        {error && <p className="text-red-600">{error}</p>}

        <input name="first_name" placeholder="First Name" className="w-full p-2 border rounded" onChange={handleChange} required />
        <input name="last_name" placeholder="Last Name" className="w-full p-2 border rounded" onChange={handleChange} required />
        <input name="phone" placeholder="Phone Number" className="w-full p-2 border rounded" onChange={handleChange} required />
        <input name="country" placeholder="Country" className="w-full p-2 border rounded" onChange={handleChange} required />
        <input name="email" type="email" placeholder="Email" className="w-full p-2 border rounded" onChange={handleChange} required />
        <input name="password" type="password" placeholder="Password" className="w-full p-2 border rounded" onChange={handleChange} required />
        <input name="confirm_password" type="password" placeholder="Confirm Password" className="w-full p-2 border rounded" onChange={handleChange} required />

        <button className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">Register</button>
      </form>
    </div>
  );
}
