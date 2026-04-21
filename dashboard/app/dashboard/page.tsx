"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Search {
  id: string;
  query: string;
  timestamp: string;
  device: string;
  source: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [searches, setSearches] = useState<Search[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("api_token");

    console.log("TOKEN:", token);

    if (!token) {
      router.replace("/login");
      return;
    }

    fetch("https://search-tracker-nxb4.onrender.com/api/searches", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        console.log("STATUS:", res.status);
        return res.json();
      })
      .then((data) => {
        console.log("DATA:", data);
        setSearches(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("ERROR:", err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b px-6 py-4 flex justify-between">
        <h1 className="font-bold">Search Tracker</h1>

        <button
          onClick={() => {
            localStorage.removeItem("api_token");
            router.replace("/login");
          }}
          className="text-red-500"
        >
          Logout
        </button>
      </header>

      <div className="p-6">
        <h2 className="font-semibold mb-4">
          Recent Searches ({searches.length})
        </h2>

        {loading ? (
          <p>Loading...</p>
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