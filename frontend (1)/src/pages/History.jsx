import React, { useEffect, useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function History() {
  const [history, setHistory] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:5000/url/history", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to fetch");
        setHistory(data.history);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchHistory();
  }, []);

  const exportCSV = () => {
    const csvRows = [
      ["URL", "Classification", "Risk Score", "Date"],
      ...history.map(h => [h.url, h.classification, h.risk_score, h.scanned_on])
    ];

    const blob = new Blob([csvRows.map(r => r.join(",")).join("\n")], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "scan_history.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text("Scan History", 14, 15);

    autoTable(doc, {
      head: [["URL", "Classification", "Risk Score", "Date"]],
      body: history.map(h => [h.url, h.classification, h.risk_score, h.scanned_on]),
      startY: 25,
    });

    doc.save("scan_history.pdf");
  };

  return (
    <div className="min-h-screen p-4">
      <h1 className="text-2xl font-bold mb-4">Scan History</h1>
      {error && <p className="text-red-600">{error}</p>}

      <div className="flex gap-4 mb-4">
        <button onClick={exportCSV} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Export CSV
        </button>
        <button onClick={exportPDF} className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">
          Export PDF
        </button>
      </div>

      <div className="overflow-x-auto max-w-4xl">
        <table className="w-full border-collapse border">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-4 py-3">URL</th>
              <th className="border px-4 py-3">Classification</th>
              <th className="border px-4 py-3">Risk Score</th>
              <th className="border px-4 py-3">Date</th>
            </tr>
          </thead>
          <tbody>
            {history.map((record, idx) => (
              <tr key={idx} className="text-sm">
                <td className="border px-4 py-2">{record.url}</td>
                <td className=" border px-4 py-4">
  <span
    className={`text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wide ${
      record.classification === "Phishing"
        ? "bg-red-200 text-red-800"
        : record.classification === "Safe"
        ? "bg-green-200 text-green-800"
        : "bg-yellow-200 text-yellow-800"
    }`}
  >
    {record.classification}
  </span>
</td>
                <td className="border px-4 py-4">{record.risk_score}</td>
                <td className="border px-4 py-4">{new Date(record.scanned_on).toLocaleDateString("en-GB")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
