"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [token, setToken] = useState("");
  const router = useRouter();

  const handleLogin = () => {
    if (!token.trim()) return;

    localStorage.setItem("api_token", token);
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-6 rounded-xl shadow w-80">
        <h2 className="text-lg font-semibold mb-4">Search Tracker</h2>

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