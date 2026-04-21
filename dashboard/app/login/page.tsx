"use client";

import { useState } from "react";

export default function LoginPage() {
  const [token, setToken] = useState("");

  const handleLogin = () => {
    if (!token.trim()) return;

    // ✅ store token
    localStorage.setItem("api_token", token.trim());

    console.log("Saved token:", token);

    // ✅ force redirect
    window.location.href = "/dashboard";
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-6 rounded-xl shadow w-80">
        <h2 className="text-lg font-semibold mb-4">Search Tracker Login</h2>

        <input
          type="text"
          placeholder="Enter API Token"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          className="w-full border px-3 py-2 rounded mb-3"
        />

        <button
          onClick={handleLogin}
          className="w-full bg-blue-500 text-white py-2 rounded"
        >
          Login
        </button>
      </div>
    </div>
  );
}