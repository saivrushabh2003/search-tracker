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
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    const load = async () => {
      const token = localStorage.getItem("api_token");

      if (!token) {
        window.location.href = "/login";
        return;
      }

      try {
        const res = await fetch(
          "https://search-tracker-nxb4.onrender.com/api/searches",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await res.json();
        setSearches(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  // 🔥 FILTER LOGIC
  const filtered = searches.filter((s) =>
    filter === "All" ? true : s.source === filter
  );

  // 🔥 TOP SEARCHES LOGIC
  const topSearches = Object.entries(
    searches.reduce((acc, s) => {
      acc[s.query] = (acc[s.query] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-gray-50">

      {/* HEADER */}
      <div className="bg-white border-b px-6 py-4 flex justify-between">
        <h1 className="font-bold text-lg">Search Tracker</h1>

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

      <div className="p-6 max-w-4xl mx-auto">

        {/* FILTER */}
        <div className="mb-6 flex justify-between items-center">
          <div>
            <span className="mr-2 text-gray-600">Filter:</span>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="border px-3 py-2 rounded"
            >
              <option>All</option>
              <option>Google</option>
              <option>YouTube</option>
              <option>Amazon</option>
            </select>
          </div>

          <div className="text-sm text-gray-500">
            Total: {filtered.length}
          </div>
        </div>

        {/* 🔥 TOP SEARCHES */}
        <div className="bg-white p-4 rounded-xl shadow mb-6">
          <h3 className="font-semibold mb-2">🔥 Top Searches</h3>

          {topSearches.length === 0 ? (
            <p className="text-gray-400 text-sm">No data yet</p>
          ) : (
            topSearches.map(([q, count]) => (
              <div key={q} className="text-sm">
                {q} ({count})
              </div>
            ))
          )}
        </div>

        {/* RECENT SEARCHES */}
        <div>
          <h2 className="font-semibold mb-4">
            Recent Searches ({filtered.length})
          </h2>

          {loading ? (
            <p>Loading...</p>
          ) : filtered.length === 0 ? (
            <p>No data found</p>
          ) : (
            <ul className="space-y-3">
              {filtered.map((s) => (
                <li
                  key={s.id}
                  className="bg-white p-4 rounded-xl border shadow-sm flex justify-between"
                >
                  <div>
                    <div className="font-semibold">{s.query}</div>
                    <div className="text-sm text-gray-500">
                      {s.source}
                    </div>
                  </div>

                  <div className="text-xs text-gray-400">
                    {new Date(s.timestamp).toLocaleString()}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}