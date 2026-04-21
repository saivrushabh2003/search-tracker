"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";

interface Search {
  id: string;
  query: string;
  timestamp: string;
  device: string;
  source: string;
  createdAt: string;
}

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso));
}

export default function DashboardPage() {
  const router = useRouter();

  const [searches, setSearches] = useState<Search[]>([]);
  const [loading, setLoading] = useState(true);
  const [sourceFilter, setSourceFilter] = useState("");

  const tokenRef = useRef<string>("");

  const fetchSearches = useCallback(async () => {
    const token = tokenRef.current;
    if (!token) return;

    const apiUrl = process.env.NEXT_PUBLIC_API_URL;

    try {
      const res = await fetch(`${apiUrl}/api/searches`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 401 || res.status === 403) {
        localStorage.removeItem("api_token");
        router.replace("/login");
        return;
      }

      const data: Search[] = await res.json();

      setSearches(data);
      setLoading(false);
    } catch (err) {
      console.error("Fetch error:", err);
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    const token = localStorage.getItem("api_token");
    if (!token) {
      router.replace("/login");
      return;
    }

    tokenRef.current = token;
    fetchSearches();
  }, [fetchSearches, router]);

  // ✅ FILTER
  const filteredSearches = searches.filter(
    (s) => !sourceFilter || s.source === sourceFilter
  );

  // ✅ TOP SEARCHES
  const topSearches = Object.entries(
    filteredSearches.reduce((acc, s) => {
      const key = s.query.toLowerCase();
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-gray-50">

      {/* HEADER */}
      <header className="bg-white border-b px-6 py-4 flex justify-between">
        <h1 className="font-bold text-lg">Search Tracker</h1>
        <button
          onClick={() => {
            localStorage.removeItem("api_token");
            router.replace("/login");
          }}
          className="text-red-500 text-sm"
        >
          Logout
        </button>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-6">

        {/* FILTER */}
        <div className="flex items-center gap-3">
          <label className="text-sm">Filter:</label>
          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            className="border px-3 py-2 rounded"
          >
            <option value="">All</option>
            <option value="Google">Google</option>
            <option value="YouTube">YouTube</option>
            <option value="Amazon">Amazon</option>
          </select>
        </div>

        {/* 🔥 TOP SEARCHES */}
        <div className="bg-white rounded-xl border p-4">
          <h3 className="text-sm font-semibold mb-3 text-gray-700">
            🔥 Top Searches
          </h3>

          {topSearches.length === 0 ? (
            <p className="text-sm text-gray-400">No data yet</p>
          ) : (
            <ul className="space-y-2">
              {topSearches.map(([query, count], i) => (
                <li key={query} className="flex justify-between text-sm">
                  <span>{i + 1}. {query}</span>
                  <span className="font-semibold">{count}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* TABLE */}
        <div className="bg-white rounded-xl border overflow-hidden">

          <div className="px-5 py-3 border-b">
            <h2 className="text-sm font-semibold">
              Recent Searches ({filteredSearches.length})
            </h2>
          </div>

          {loading ? (
            <div className="p-5 text-gray-400">Loading...</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-xs uppercase text-gray-500">
                  <th className="px-5 py-3 text-left">Query</th>
                  <th className="px-5 py-3 text-left">Source</th>
                  <th className="px-5 py-3 text-left">Date</th>
                  <th className="px-5 py-3 text-left">Device</th>
                </tr>
              </thead>

              <tbody>
                {filteredSearches.map((s) => (
                  <tr key={s.id} className="border-t">

                    <td className="px-5 py-3">{s.query}</td>

                    <td className="px-5 py-3">
                      <span
                        className="px-2 py-1 rounded text-xs"
                        style={{
                          background:
                            s.source === "Google" ? "#e3f2fd" :
                            s.source === "YouTube" ? "#ffebee" :
                            s.source === "Amazon" ? "#fff3e0" :
                            "#eee"
                        }}
                      >
                        {s.source}
                      </span>
                    </td>

                    <td className="px-5 py-3">
                      {formatDate(s.timestamp)}
                    </td>

                    <td className="px-5 py-3">
                      {s.device}
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          )}

        </div>

      </main>
    </div>
  );
}