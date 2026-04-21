"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [token, setToken] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!token.trim()) {
      setError("Please enter your API token.");
      return;
    }
    setLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const res = await fetch(`${apiUrl}/api/searches`, {
        headers: { Authorization: `Bearer ${token.trim()}` },
      });
      if (res.status === 403 || res.status === 401) {
        setError("Invalid token. Please check and try again.");
        setLoading(false);
        return;
      }
      if (!res.ok) {
        setError("Could not reach the server. Check your API URL.");
        setLoading(false);
        return;
      }
      localStorage.setItem("api_token", token.trim());
      router.replace("/dashboard");
    } catch {
      setError("Network error. Is the backend running?");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-white px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        <div className="mb-8 text-center">
          <span className="text-4xl">🔍</span>
          <h1 className="mt-3 text-2xl font-bold text-gray-900">Search Tracker</h1>
          <p className="mt-1 text-sm text-gray-500">Enter your API token to access your dashboard</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label htmlFor="token" className="block text-sm font-medium text-gray-700 mb-1">
              API Token
            </label>
            <input
              id="token"
              type="password"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Paste your token here"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              autoFocus
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-sm font-semibold rounded-lg transition-colors"
          >
            {loading ? "Verifying…" : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
