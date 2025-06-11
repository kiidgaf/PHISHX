import React, { useEffect, useState } from "react";

export default function AdminPanel() {
  const [reports, setReports] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchReports = async () => {
    setError("");
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/admin/feedback", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load reports");
      setReports(data);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleVerify = async (reportId, decision) => {
    setError("");
    setSuccess("");
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/admin/verify-url", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ report_id: reportId, final_decision: decision }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to verify URL");

      setSuccess(data.message);
      fetchReports(); // Refresh list
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen p-4">
      <h1 className="text-2xl font-bold mb-4">Admin Panel: Verify URLs</h1>
      {error && <p className="text-red-600 mb-3">{error}</p>}
      {success && <p className="text-green-600 mb-3">{success}</p>}

      {reports.length === 0 ? (
        <p>No feedback reports found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full table-auto border-collapse border text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="border px-4 py-2">URL</th>
                <th className="border px-4 py-2">Type</th>
                <th className="border px-4 py-2">Comment</th>
                <th className="border px-4 py-2">Status</th>
                <th className="border px-4 py-2">Decision</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((r) => (
                <tr key={r.id}>
                  <td className="border px-4 py-2">{r.url}</td>
                  <td className="border px-4 py-2">{r.classification}</td>
                  <td className="border px-4 py-2">{r.comment || "-"}</td>
                  <td className="border px-4 py-2">{r.status}</td>
                  <td className="border px-4 py-2 space-x-2">
                    <button
                      className="bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700"
                      onClick={() => handleVerify(r.id, "Whitelisted")}
                    >
                      Whitelist
                    </button>
                    <button
                      className="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700"
                      onClick={() => handleVerify(r.id, "Blacklisted")}
                    >
                      Blacklist
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
