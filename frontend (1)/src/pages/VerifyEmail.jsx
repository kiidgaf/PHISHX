import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";

export default function VerifyEmail() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [status, setStatus] = useState("verifying"); // verifying, success, error
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function verify() {
      try {
        const res = await fetch(`http://localhost:5000/auth/verify-email/${token}`, {
          method: "GET",
        });
        const data = await res.json();
        if (res.ok) {
          setStatus("success");
          setMessage(data.message || "Email verified successfully!");
          setTimeout(() => navigate("/login"), 3000); // redirect after 3s
        } else {
          setStatus("error");
          setMessage(data.error || "Verification failed.");
        }
      } catch {
        setStatus("error");
        setMessage("Network error, please try again.");
      }
    }
    verify();
  }, [token, navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 space-y-4 text-center">
      {status === "verifying" && <p className="text-gray-600">Verifying your email...</p>}
      {(status === "success" || status === "error") && (
        <>
          <p className={status === "success" ? "text-green-600" : "text-red-600"}>{message}</p>
          <div className="space-x-4">
            
            <Link
              to="/login"
              className="text-blue-600 hover:underline"
            >
              Login
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
