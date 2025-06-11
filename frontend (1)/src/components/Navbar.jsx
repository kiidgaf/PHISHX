import React from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const isAdmin = localStorage.getItem("role") === "admin";

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <nav className="bg-blue-900 text-white px-6 py-5 flex justify-between items-center">
      <Link to="/" className="text-xl font-bold">
      <img src="/logo-white.png" alt="PhishX Logo"  className="h-8 w-auto" />
      </Link>
      <div className="space-x-8">
        {token && (
          <>
            <Link to="/" className="hover:underline">
              Dashboard
            </Link>
            <Link to="/history" className="hover:underline">
              History
            </Link>
            {isAdmin && (
          <Link to="/admin" className="hover:underline">
            Management
          </Link>
        )}
            <Link to="/report" className="hover:underline">
              Report
            </Link>
            <button onClick={handleLogout} className="hover:underline">
              Logout
            </button>
          </>
        )}
        {!token && (
          <>
            <Link to="/login" className="hover:underline">
              Login
            </Link>
            <Link to="/register" className="hover:underline">
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
