"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";

interface Search {
  id: string;
  query: string;
  timestamp: string;
  device: string;
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

  // Auto-refresh every 10 seconds
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

  // Device short label
  function deviceLabel(d: string) {
    return d.length > 12 ? d.slice(0, 12) + "…" : d;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
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
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard label="Total searches" value={searches.length} />
          <StatCard
            label="Unique devices"
            value={new Set(searches.map((s) => s.device)).size}
          />
          <StatCard
            label="Auto-refresh"
            value="Every 10s"
            isText
          />
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Filters</h2>
          <form onSubmit={handleFilter} className="flex flex-wrap gap-3 items-end">
            <div className="flex-1 min-w-[180px]">
              <label className="block text-xs text-gray-500 mb-1">Keyword</label>
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="e.g. python"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">From date</label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">To date</label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              Apply
            </button>
            <button
              type="button"
              onClick={handleClear}
              className="px-4 py-2 border border-gray-300 hover:bg-gray-50 text-gray-600 text-sm font-medium rounded-lg transition-colors"
            >
              Clear
            </button>
          </form>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-700">
              Recent Searches{" "}
              <span className="text-gray-400 font-normal">({searches.length})</span>
            </h2>
            <span className="text-xs text-indigo-500 animate-pulse">● Live</span>
          </div>

          {error && (
            <div className="px-5 py-3 bg-red-50 text-red-600 text-sm">{error}</div>
          )}

          {loading ? (
            <div className="px-5 py-12 text-center text-gray-400 text-sm">
              Loading searches…
            </div>
          ) : searches.length === 0 ? (
            <div className="px-5 py-12 text-center text-gray-400 text-sm">
              No searches found. Try adjusting your filters or start searching on Google!
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-left text-xs text-gray-500 uppercase tracking-wide">
                    <th className="px-5 py-3 font-semibold">Query</th>
                    <th className="px-5 py-3 font-semibold">Date &amp; Time</th>
                    <th className="px-5 py-3 font-semibold">Device</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {searches.map((s) => (
                    <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3 font-medium text-gray-900 max-w-xs truncate">
                        {s.query}
                      </td>
                      <td className="px-5 py-3 text-gray-500 whitespace-nowrap">
                        {formatDate(s.timestamp)}
                      </td>
                      <td className="px-5 py-3">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700">
                          {deviceLabel(s.device)}
                        </span>
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

function StatCard({
  label,
  value,
  isText,
}: {
  label: string;
  value: number | string;
  isText?: boolean;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 px-5 py-4">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className={`font-bold text-gray-900 ${isText ? "text-lg" : "text-2xl"}`}>
        {value}
      </p>
    </div>
  );
}
