"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";

interface Search {
  id: string;
  query: string;
  timestamp: string;
  device: string;
  source: string;   // ✅ added
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

  function handleFilter(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    fetchSearches();
  }

  function handleClear() {
    setKeyword("");
    setFromDate("");
    setToDate("");
  }

  function deviceLabel(d: string) {
    return d.length > 12 ? d.slice(0, 12) + "…" : d;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🔍</span>
          <div>
            <h1 className="text-lg font-bold text-gray-900">Search Tracker</h1>
            {lastUpdated && (
              <p className="text-xs text-gray-400">
                Last updated: {formatDate(lastUpdated.toISOString())}
              </p>
            )}
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="text-sm text-gray-500 hover:text-red-600 transition-colors"
        >
          Sign out
        </button>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-6">

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-700">
              Recent Searches ({searches.length})
            </h2>
            <span className="text-xs text-indigo-500 animate-pulse">● Live</span>
          </div>

          {loading ? (
            <div className="px-5 py-12 text-center text-gray-400 text-sm">
              Loading searches…
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-left text-xs text-gray-500 uppercase tracking-wide">
                    <th className="px-5 py-3 font-semibold">Query</th>
                    <th className="px-5 py-3 font-semibold">Source</th>
                    <th className="px-5 py-3 font-semibold">Date & Time</th>
                    <th className="px-5 py-3 font-semibold">Device</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {searches.map((s) => (
                    <tr key={s.id}>
                      <td className="px-5 py-3 font-medium">{s.query}</td>

                      <td className="px-5 py-3">
                        <span
                          className="px-2 py-1 rounded text-xs font-semibold"
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
            </div>
          )}
        </div>

      </main>
    </div>
  );
}