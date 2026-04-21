"use client";

import { useEffect, useState } from "react";

interface Search {
  id: string;
  query: string;
  timestamp: string;
  device: string;
  source: string;
}

export default function DashboardPage() {
  const [searches, setSearches] = useState<Search[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const token = localStorage.getItem("api_token");

      console.log("TOKEN FROM STORAGE:", token);

      if (!token) {
        console.log("No token → redirecting to login");
        window.location.href = "/login";
        return;
      }

      try {
        console.log("🚀 Calling API...");

        const res = await fetch(
          "https://search-tracker-nxb4.onrender.com/api/searches",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`, // ✅ critical
            },
          }
        );

        console.log("STATUS:", res.status);

        if (!res.ok) {
          throw new Error("Request failed");
        }

        const data = await res.json();

        console.log("DATA RECEIVED:", data);

        setSearches(data);
      } catch (err) {
        console.error("FETCH ERROR:", err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">

      {/* HEADER */}
      <div className="bg-white border-b px-6 py-4 flex justify-between">
        <h1 className="font-bold">Search Tracker</h1>

        <button
          onClick={() => {
            localStorage.removeItem("api_token");
            window.location.href = "/login";
          }}
          className="text-red-500"
        >
          Logout
        </button>
      </div>

      {/* CONTENT */}
      <div className="p-6">
        <h2 className="font-semibold mb-4">
          Recent Searches ({searches.length})
        </h2>

        {loading ? (
          <p>Loading...</p>
        ) : searches.length === 0 ? (
          <p>No data found</p>
        ) : (
          <ul className="space-y-2">
            {searches.map((s) => (
              <li key={s.id} className="bg-white p-3 rounded border">
                <b>{s.query}</b> — {s.source}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}