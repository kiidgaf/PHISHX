import React, { useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function Dashboard() {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [emailContent, setEmailContent] = useState("");
const [emailResults, setEmailResults] = useState(null);
const [emailError, setEmailError] = useState("");



  const handleScan = async (e) => {
    e.preventDefault();
    setError("");
    setResult(null);

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("You must be logged in.");

      const res = await fetch("http://localhost:5000/url/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ url }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Scan failed");

      setResult(data);
    } catch (err) {
      setError(err.message);
    }
  };

  const generatePDF = (data) => {
    const doc = new jsPDF();
    doc.text("Phishing Scan Report", 14, 15);
  
    autoTable(doc, {
      head: [["Field", "Value"]],
      body: [
        ["URL", data.url],
        ["Classification", data.classification],
        ["Risk Score", `${data.risk_score}%`],
        ["Scanned On", new Date().toLocaleString()],
      ],
      startY: 25,
    });
  
    doc.save(`scan_report_${Date.now()}.pdf`);
  };

  const exportCSV = (data) => {
    const csvHeader = ["Field,Value"];
    const csvRows = [
      ["URL", data.url],
      ["Classification", data.classification],
      ["Risk Score", `${data.risk_score}%`],
      ["Scanned On", new Date().toLocaleString()],
    ];
  
    const csvContent = [
      ...csvHeader,
      ...csvRows.map((row) => row.join(",")),
    ].join("\n");
  
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
  
    link.href = url;
    link.download = `scan_report_${Date.now()}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const handleEmailScan = async (e) => {
  e.preventDefault();
  setEmailError("");
  setEmailResults(null);

  try {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("You must be logged in.");

    const res = await fetch("http://localhost:5000/url/email/scan", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ email_content: emailContent }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Email scan failed");

    setEmailResults(data);
  } catch (err) {
    setEmailError(err.message);
  }
};


  return (
    <div className="min-h-screen p-6 bg-gray-100">
  <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
       <div className="text-center bg-white p-8 rounded-xl shadow-lg max-w-xl w-full space-y-6">
      <h1 className="text-2xl font-bold mb-6">Phishing URL Scanner</h1>

      <form onSubmit={handleScan} className="flex flex-col items-center space-y-4">
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Enter a URL to scan"
          className="w-full max-w-xl border p-2 rounded shadow"
          required
        />
        <button
          type="submit"
          className="ml-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Scan
        </button>
      </form>

      {error && <p className="text-red-600 mb-4">{error}</p>}

      {result && (
        <div className="border p-4 rounded bg-gray-50 max-w-xl">
          <h2 className="font-semibold mb-2">Scan Result:</h2>
          <div className="text-left mb-3">
  <label className="text-sm font-medium text-gray-700 mr-2">URL :</label>
  <input
    type="text"
    readOnly
    value={result.url}
    className="bg-gray-100 px-3 py-2 rounded w-full border border-gray-300 cursor-default text-sm"
  />
</div>
{result && (
  <div className="border p-6 rounded bg-gray-50 max-w-xl w-full">
    <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
      
      {/* Risk Score Circle */}
      <div className="flex flex-col items-center">
        <div
          className={`relative flex items-center justify-center w-24 h-24 rounded-full border-8 ${
            result.risk_score > 70
              ? "border-red-500"
              : result.risk_score > 40
              ? "border-yellow-400"
              : "border-green-500"
          }`}
        >
          <span className="text-xl font-bold">{result.risk_score}%</span>
        </div>
        <span className="mt-2 text-sm text-gray-600">Risk Score</span>
      </div>

      {/* Classification + Date */}
      <div className="text-left space-y-2">
        <p className="text-sm">
          <strong>Classification:</strong>{" "}
          <span
            className={
              result.classification === "Phishing"
                ? "text-red-600"
                : result.classification === "Suspicious"
                ? "text-yellow-600"
                : "text-green-600"
            }
          >
            {result.classification}
          </span>
        </p>
        <p className="text-sm text-gray-700">
          <strong>Date Scanned:</strong> {new Date().toLocaleDateString()}
        </p>
      </div>


    </div>
    <div className="relative inline-block text-left mt-4">
  <button
    onClick={() => setShowExportMenu(!showExportMenu)}
    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
  >
    Generate Report 
  </button>

  {showExportMenu && (
    <div className="absolute mt-2 w-48 bg-white border border-gray-200 rounded shadow-md z-10">
      <button
        onClick={() => {
          generatePDF(result);
          setShowExportMenu(false);
        }}
        className="w-full px-4 py-2 text-left hover:bg-gray-100"
      >
      Generate PDF
      </button>
      <button
        onClick={() => {
          exportCSV(result);
          setShowExportMenu(false);
        }}
        className="w-full px-4 py-2 text-left hover:bg-gray-100"
      >
        Export as CSV
      </button>
    </div>
  )}
</div>

  </div>
)}

         
        </div>
      )}
    </div>
      <div className="bg-white p-6 rounded-xl shadow">
<h2 className="text-xl font-semibold">Scan Email Content</h2>
<form onSubmit={handleEmailScan} className="flex flex-col space-y-4 w-full">
  <textarea
    value={emailContent}
    onChange={(e) => setEmailContent(e.target.value)}
    placeholder="Paste email content here..."
    className="w-full h-40 p-3 border rounded shadow"
    required
  />
  <button
    type="submit"
    className="self-center px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
  >
    Scan Email
  </button>
</form>

{emailError && <p className="text-red-600">{emailError}</p>}

{emailResults && (
  <div className="mt-4 text-left w-full">
    <h3 className="font-semibold mb-2">Scan Summary:</h3>
    <ul className="text-sm mb-4">
      <li><strong>Safe:</strong> {emailResults.summary.safe}</li>
      <li><strong>Suspicious:</strong> {emailResults.summary.suspicious}</li>
      <li><strong>Phishing:</strong> {emailResults.summary.phishing}</li>
    </ul>
    <h4 className="font-semibold mb-2">Detected URLs:</h4>
    <div className="space-y-2">
      {emailResults.scan_results.map((item, idx) => (
        <div key={idx} className="p-3 bg-gray-100 rounded shadow">
          <p><strong>URL:</strong> {item.url}</p>
          <p>
            <strong>Classification:</strong>{" "}
            <span
              className={
                item.classification === "Phishing"
                  ? "text-red-600"
                  : item.classification === "Suspicious"
                  ? "text-yellow-600"
                  : "text-green-600"
              }
            >
              {item.classification}
            </span>
          </p>
          <p><strong>Risk Score:</strong> {item.risk_score}%</p>
        </div>
      ))}
    </div>
  </div>
)}
</div>
    </div>
    </div>
  );
}
