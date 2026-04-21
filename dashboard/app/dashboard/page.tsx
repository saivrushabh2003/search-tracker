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
  const [error, setError] = useState("");

  const [keyword, setKeyword] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [sourceFilter, setSourceFilter] = useState(""); // ✅ NEW

  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const tokenRef = useRef<string>("");

  const fetchSearches = useCallback(async () => {
    const token = tokenRef.current;
    if (!token) return;

    const apiUrl = process.env.NEXT_PUBLIC_API_URL;

    const params = new URLSearchParams();
    if (keyword) params.set("q", keyword);
    if (fromDate) params.set("from", new Date(fromDate).toISOString());
    if (toDate) {
      const to = new Date(toDate);
      to.setHours(23, 59, 59, 999);
      params.set("to", to.toISOString());
    }

    try {
      const res = await fetch(`${apiUrl}/api/searches?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 401 || res.status === 403) {
        localStorage.removeItem("api_token");
        router.replace("/login");
        return;
      }

      if (!res.ok) throw new Error("Server error");

      const data: Search[] = await res.json();

      setSearches(data);
      setLastUpdated(new Date());
      setError("");
    } catch {
      setError("Failed to load searches. Retrying…");
    } finally {
      setLoading(false);
    }
  }, [keyword, fromDate, toDate, router]);

  useEffect(() => {
    const token = localStorage.getItem("api_token");
    if (!token) {
      router.replace("/login");
      return;
    }

    tokenRef.current = token;
    fetchSearches();
  }, [fetchSearches, router]);

  useEffect(() => {
    const id = setInterval(fetchSearches, 10000);
    return () => clearInterval(id);
  }, [fetchSearches]);

  function handleLogout() {
    localStorage.removeItem("api_token");
    router.replace("/login");
  }

  function deviceLabel(d: string) {
    return d.length > 12 ? d.slice(0, 12) + "…" : d;
  }

  // ✅ FILTER LOGIC
  const filteredSearches = searches.filter(
    (s) => !sourceFilter || s.source === sourceFilter
  );

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header */}
      <header className="bg-white border-b px-6 py-4 flex justify-between">
        <h1 className="font-bold text-lg">Search Tracker</h1>
        <button onClick={handleLogout} className="text-red-500 text-sm">
          Logout
        </button>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-4">

        {/* ✅ SOURCE FILTER */}
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
                      {deviceLabel(s.device)}
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