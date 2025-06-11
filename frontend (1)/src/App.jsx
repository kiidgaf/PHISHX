import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import History from "./pages/History";
import AdminPanel from "./pages/AdminPanel";
import ReportIssue from "./pages/ReportIssue";
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";
import VerifyEmail from "./pages/VerifyEmail";

export default function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/history" element={ <ProtectedRoute>
      <History />
    </ProtectedRoute>} />
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/report" element={<ProtectedRoute>
      <ReportIssue />
    </ProtectedRoute>} />
    <Route path="/verify-email/:token" element={<VerifyEmail/>} />
      </Routes>
    </Router>
  );
}
