import React, { useState } from "react";

export default function ReportIssue() {
  const [formData, setFormData] = useState({
    url: "",
    classification: "Phishing",
    comment: "",
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setMessage("");
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) {
      setError("You must be logged in to report a URL.");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/url/report", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Report failed");

      setMessage("✅ Report submitted successfully.");
      setFormData({ url: "", classification: "Phishing", comment: "" });
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen p-4 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Report a URL</h1>
      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded shadow">
        {message && <p className="text-green-600">{message}</p>}
        {error && <p className="text-red-600">{error}</p>}

        <div>
          <label className="block mb-1 font-semibold">URL</label>
          <input
            type="text"
            name="url"
            className="w-full border p-2 rounded"
            value={formData.url}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label className="block mb-1 font-semibold">Classification</label>
          <select
            name="classification"
            className="w-full border p-2 rounded"
            value={formData.classification}
            onChange={handleChange}
          >
            <option value="Phishing">Phishing</option>
            <option value="False Positive">False Positive</option>
          </select>
        </div>

        <div>
          <label className="block mb-1 font-semibold">Comment (optional)</label>
          <textarea
            name="comment"
            rows="3"
            className="w-full border p-2 rounded"
            value={formData.comment}
            onChange={handleChange}
          />
        </div>

        <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Submit Report
        </button>
      </form>
    </div>
  );
}
