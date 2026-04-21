"use client";

import { useEffect, useState, useMemo } from "react";

interface Search {
  id: string;
  query: string;
  timestamp: string;
  device: string;
  source: string;
}

const SOURCE_CONFIG: Record<string, { emoji: string; color: string; glow: string; bg: string; border: string }> = {
  Google:  { emoji: "🔵", color: "#93c5fd", glow: "rgba(59,130,246,0.3)",  bg: "rgba(59,130,246,0.08)",  border: "rgba(59,130,246,0.2)"  },
  YouTube: { emoji: "🔴", color: "#fca5a5", glow: "rgba(239,68,68,0.3)",   bg: "rgba(239,68,68,0.08)",   border: "rgba(239,68,68,0.2)"   },
  Amazon:  { emoji: "🟡", color: "#fde68a", glow: "rgba(245,158,11,0.3)",  bg: "rgba(245,158,11,0.08)",  border: "rgba(245,158,11,0.2)"  },
  Unknown: { emoji: "⚪", color: "#94a3b8", glow: "rgba(148,163,184,0.2)", bg: "rgba(148,163,184,0.06)", border: "rgba(148,163,184,0.15)" },
};

function getSourceConfig(source: string) {
  return SOURCE_CONFIG[source] ?? SOURCE_CONFIG["Unknown"];
}

function timeAgo(ts: string) {
  const diff = Date.now() - new Date(ts).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1)  return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function DashboardPage() {
  const [searches, setSearches]   = useState<Search[]>([]);
  const [loading, setLoading]     = useState(true);
  const [filter, setFilter]       = useState("All");
  const [searchQ, setSearchQ]     = useState("");
  const [mounted, setMounted]     = useState(false);
  const [error, setError]         = useState("");

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    const load = async () => {
      const token = localStorage.getItem("api_token");
      if (!token) { window.location.href = "/login"; return; }
      try {
        const res = await fetch("https://search-tracker-nxb4.onrender.com/api/searches", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Unauthorized");
        const data = await res.json();
        setSearches(Array.isArray(data) ? data : []);
      } catch {
        setError("Failed to load searches. Check your token.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = useMemo(() => {
    return searches.filter((s) => {
      const matchSource = filter === "All" || s.source === filter;
      const matchQuery  = s.query.toLowerCase().includes(searchQ.toLowerCase());
      return matchSource && matchQuery;
    });
  }, [searches, filter, searchQ]);

  const topSearches = useMemo(() => {
    return Object.entries(
      searches.reduce((acc, s) => {
        acc[s.query] = (acc[s.query] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    ).sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [searches]);

  const stats = useMemo(() => {
    const bySource = searches.reduce((acc, s) => {
      acc[s.source] = (acc[s.source] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const today = searches.filter((s) => {
      const d = new Date(s.timestamp);
      const now = new Date();
      return d.getDate() === now.getDate() && d.getMonth() === now.getMonth();
    }).length;
    return { total: searches.length, today, ...bySource };
  }, [searches]);

  const FILTERS = ["All", "Google", "YouTube", "Amazon"];

  return (
    <div style={{ minHeight: "100vh", background: "#050510", fontFamily: "'Inter', 'Space Grotesk', sans-serif", position: "relative", overflow: "hidden" }}>

      {/* Background orbs */}
      {[
        { w:700, h:700, top:"-200px", left:"-200px", c:"rgba(124,58,237,0.12)", dur:"10s" },
        { w:500, h:500, bottom:"-100px", right:"-100px", c:"rgba(6,182,212,0.10)", dur:"14s" },
        { w:350, h:350, top:"45%", left:"55%", c:"rgba(236,72,153,0.08)", dur:"18s" },
      ].map((o, i) => (
        <div key={i} style={{
          position:"absolute", width:`${o.w}px`, height:`${o.h}px`,
          borderRadius:"50%",
          background:`radial-gradient(circle, ${o.c} 0%, transparent 70%)`,
          top: (o as any).top, left: (o as any).left,
          bottom: (o as any).bottom, right: (o as any).right,
          animation:`orb-float ${o.dur} ease-in-out infinite`,
          pointerEvents:"none", zIndex:0,
        }} />
      ))}

      {/* Grid */}
      <div style={{
        position:"absolute", inset:0,
        backgroundImage:`linear-gradient(rgba(124,58,237,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(124,58,237,0.03) 1px, transparent 1px)`,
        backgroundSize:"60px 60px", pointerEvents:"none", zIndex:0,
      }} />

      {/* NAVBAR */}
      <nav style={{
        position:"sticky", top:0, zIndex:50,
        background:"rgba(5,5,16,0.85)",
        backdropFilter:"blur(24px)",
        borderBottom:"1px solid rgba(255,255,255,0.06)",
        padding:"0 32px",
        display:"flex", alignItems:"center", justifyContent:"space-between",
        height:"64px",
      }}>
        <div style={{ display:"flex", alignItems:"center", gap:"12px" }}>
          <div style={{
            width:"36px", height:"36px", borderRadius:"10px",
            background:"linear-gradient(135deg, rgba(124,58,237,0.5), rgba(6,182,212,0.3))",
            border:"1px solid rgba(124,58,237,0.4)",
            display:"flex", alignItems:"center", justifyContent:"center", fontSize:"18px",
          }}>🔍</div>
          <span style={{
            fontSize:"18px", fontWeight:"800", letterSpacing:"-0.5px",
            background:"linear-gradient(135deg, #a78bfa, #06b6d4)",
            WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text",
          }}>Search Tracker</span>
          <span style={{
            fontSize:"11px", fontWeight:"600", color:"#7c3aed",
            background:"rgba(124,58,237,0.15)", border:"1px solid rgba(124,58,237,0.3)",
            borderRadius:"999px", padding:"2px 8px", letterSpacing:"0.05em",
          }}>LIVE</span>
        </div>

        <div style={{ display:"flex", alignItems:"center", gap:"16px" }}>
          <span style={{ fontSize:"13px", color:"#475569" }}>
            {stats.total} searches tracked
          </span>
          <button
            id="logout-btn"
            onClick={() => { localStorage.removeItem("api_token"); window.location.href = "/login"; }}
            style={{
              padding:"8px 18px", borderRadius:"10px", border:"1px solid rgba(239,68,68,0.3)",
              background:"rgba(239,68,68,0.08)", color:"#f87171",
              fontSize:"13px", fontWeight:"600", cursor:"pointer",
              transition:"all 0.2s ease",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background="rgba(239,68,68,0.18)"; e.currentTarget.style.borderColor="rgba(239,68,68,0.5)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background="rgba(239,68,68,0.08)"; e.currentTarget.style.borderColor="rgba(239,68,68,0.3)"; }}
          >
            ↩ Logout
          </button>
        </div>
      </nav>

      {/* MAIN CONTENT */}
      <div style={{ position:"relative", zIndex:1, maxWidth:"1200px", margin:"0 auto", padding:"40px 24px" }}>

        {/* Page title */}
        <div style={{ marginBottom:"40px", opacity: mounted ? 1 : 0, transform: mounted ? "translateY(0)" : "translateY(16px)", transition:"all 0.6s ease" }}>
          <h1 style={{ fontSize:"36px", fontWeight:"900", letterSpacing:"-1px", color:"#f1f5f9", marginBottom:"8px" }}>
            Intelligence{" "}
            <span style={{
              background:"linear-gradient(135deg, #a78bfa, #06b6d4, #ec4899)",
              backgroundSize:"200% auto",
              WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text",
              animation:"shimmer 3s linear infinite",
            }}>Dashboard</span>
          </h1>
          <p style={{ color:"#475569", fontSize:"15px" }}>Your search history across all platforms, in real-time.</p>
        </div>

        {/* STATS ROW */}
        <div style={{
          display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(180px, 1fr))",
          gap:"16px", marginBottom:"36px",
          opacity: mounted ? 1 : 0, transition:"opacity 0.7s ease 0.1s",
        }}>
          {[
            { label:"Total Searches", value: stats.total, icon:"📊", color:"#a78bfa", glow:"rgba(167,139,250,0.2)" },
            { label:"Today",          value: stats.today,            icon:"📅", color:"#34d399", glow:"rgba(52,211,153,0.2)" },
            { label:"Google",         value: stats["Google"]  || 0,  icon:"🔵", color:"#60a5fa", glow:"rgba(96,165,250,0.2)" },
            { label:"YouTube",        value: stats["YouTube"] || 0,  icon:"🔴", color:"#f87171", glow:"rgba(248,113,113,0.2)" },
            { label:"Amazon",         value: stats["Amazon"]  || 0,  icon:"🟡", color:"#fbbf24", glow:"rgba(251,191,36,0.2)" },
          ].map((stat, i) => (
            <div key={stat.label} style={{
              background:"rgba(255,255,255,0.03)",
              border:"1px solid rgba(255,255,255,0.07)",
              borderRadius:"16px", padding:"20px",
              backdropFilter:"blur(12px)",
              transition:"all 0.3s ease",
              cursor:"default",
              animation:`slideUp 0.5s ease ${i * 0.07}s both`,
            }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.06)";
                e.currentTarget.style.boxShadow = `0 0 24px ${stat.glow}`;
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)";
                e.currentTarget.style.transform = "translateY(-3px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.03)";
                e.currentTarget.style.boxShadow = "none";
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              <div style={{ fontSize:"22px", marginBottom:"10px" }}>{stat.icon}</div>
              <div style={{ fontSize:"28px", fontWeight:"800", color: stat.color, letterSpacing:"-1px", lineHeight:1 }}>{stat.value}</div>
              <div style={{ fontSize:"12px", color:"#64748b", fontWeight:"500", marginTop:"6px", textTransform:"uppercase", letterSpacing:"0.06em" }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* TWO COLUMN LAYOUT */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 320px", gap:"24px", alignItems:"start" }}>

          {/* LEFT — Main feed */}
          <div>
            {/* Search + Filter bar */}
            <div style={{
              background:"rgba(255,255,255,0.03)",
              border:"1px solid rgba(255,255,255,0.07)",
              borderRadius:"16px", padding:"16px",
              display:"flex", gap:"12px", flexWrap:"wrap",
              marginBottom:"20px", backdropFilter:"blur(12px)",
            }}>
              {/* Text search */}
              <div style={{ flex:1, minWidth:"200px", position:"relative" }}>
                <span style={{ position:"absolute", left:"14px", top:"50%", transform:"translateY(-50%)", fontSize:"14px", pointerEvents:"none" }}>🔎</span>
                <input
                  id="search-filter-input"
                  type="text"
                  placeholder="Search your history…"
                  value={searchQ}
                  onChange={(e) => setSearchQ(e.target.value)}
                  style={{
                    width:"100%", background:"rgba(255,255,255,0.04)",
                    border:"1px solid rgba(255,255,255,0.08)", borderRadius:"10px",
                    padding:"10px 14px 10px 38px", color:"#e2e8f0",
                    fontSize:"14px", outline:"none", boxSizing:"border-box",
                    fontFamily:"inherit",
                  }}
                  onFocus={(e) => { e.currentTarget.style.borderColor="rgba(124,58,237,0.5)"; e.currentTarget.style.boxShadow="0 0 0 3px rgba(124,58,237,0.1)"; }}
                  onBlur={(e)  => { e.currentTarget.style.borderColor="rgba(255,255,255,0.08)"; e.currentTarget.style.boxShadow="none"; }}
                />
              </div>

              {/* Source filter buttons */}
              <div style={{ display:"flex", gap:"8px", flexWrap:"wrap" }}>
                {FILTERS.map((f) => (
                  <button
                    key={f}
                    id={`filter-${f.toLowerCase()}`}
                    onClick={() => setFilter(f)}
                    style={{
                      padding:"8px 16px", borderRadius:"10px", border:"1px solid",
                      fontSize:"13px", fontWeight:"600", cursor:"pointer",
                      transition:"all 0.2s ease",
                      fontFamily:"inherit",
                      background: filter === f ? "linear-gradient(135deg, rgba(124,58,237,0.4), rgba(6,182,212,0.25))" : "rgba(255,255,255,0.04)",
                      borderColor: filter === f ? "rgba(124,58,237,0.6)" : "rgba(255,255,255,0.08)",
                      color: filter === f ? "#e2e8f0" : "#64748b",
                      boxShadow: filter === f ? "0 0 12px rgba(124,58,237,0.25)" : "none",
                    }}
                    onMouseEnter={(e) => { if (filter !== f) { e.currentTarget.style.color="#94a3b8"; e.currentTarget.style.borderColor="rgba(255,255,255,0.15)"; } }}
                    onMouseLeave={(e) => { if (filter !== f) { e.currentTarget.style.color="#64748b"; e.currentTarget.style.borderColor="rgba(255,255,255,0.08)"; } }}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {/* Results label */}
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"14px", padding:"0 2px" }}>
              <span style={{ fontSize:"13px", color:"#475569", fontWeight:"500" }}>
                {loading ? "Loading…" : `${filtered.length} result${filtered.length !== 1 ? "s" : ""}`}
              </span>
              {!loading && !error && (
                <span style={{ fontSize:"12px", color:"#334155" }}>
                  Showing latest 100 entries
                </span>
              )}
            </div>

            {/* Error state */}
            {error && (
              <div style={{
                background:"rgba(239,68,68,0.08)", border:"1px solid rgba(239,68,68,0.25)",
                borderRadius:"14px", padding:"20px", textAlign:"center", color:"#f87171",
                fontSize:"14px",
              }}>
                ⚠️ {error}
              </div>
            )}

            {/* Loading state */}
            {loading && !error && (
              <div style={{ display:"flex", flexDirection:"column", gap:"12px" }}>
                {[1,2,3,4,5].map((i) => (
                  <div key={i} style={{
                    background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.06)",
                    borderRadius:"14px", padding:"20px",
                    animation:`pulse-glow 1.5s ease-in-out ${i*0.1}s infinite`,
                  }}>
                    <div style={{ height:"14px", width:"60%", background:"rgba(255,255,255,0.06)", borderRadius:"6px", marginBottom:"10px" }} />
                    <div style={{ height:"12px", width:"30%", background:"rgba(255,255,255,0.04)", borderRadius:"6px" }} />
                  </div>
                ))}
              </div>
            )}

            {/* Empty state */}
            {!loading && !error && filtered.length === 0 && (
              <div style={{
                textAlign:"center", padding:"60px 20px",
                background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.06)",
                borderRadius:"16px",
              }}>
                <div style={{ fontSize:"48px", marginBottom:"16px" }}>🌌</div>
                <p style={{ color:"#475569", fontSize:"15px" }}>No searches found.</p>
                <p style={{ color:"#334155", fontSize:"13px", marginTop:"6px" }}>Try a different filter or start searching on Google, YouTube, or Amazon.</p>
              </div>
            )}

            {/* Search list */}
            {!loading && !error && filtered.length > 0 && (
              <div style={{ display:"flex", flexDirection:"column", gap:"10px" }}>
                {filtered.map((s, i) => {
                  const cfg = getSourceConfig(s.source);
                  return (
                    <div
                      key={s.id}
                      style={{
                        position:"relative",
                        background:"rgba(255,255,255,0.03)",
                        border:"1px solid rgba(255,255,255,0.07)",
                        borderRadius:"14px", padding:"16px 20px",
                        display:"flex", alignItems:"center", justifyContent:"space-between", gap:"16px",
                        transition:"all 0.25s ease",
                        animation:`slideUp 0.4s ease ${Math.min(i * 0.04, 0.5)}s both`,
                        cursor:"default",
                        overflow:"hidden",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "rgba(255,255,255,0.055)";
                        e.currentTarget.style.borderColor = cfg.border;
                        e.currentTarget.style.boxShadow = `0 0 20px ${cfg.glow}`;
                        e.currentTarget.style.transform = "translateX(4px)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "rgba(255,255,255,0.03)";
                        e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)";
                        e.currentTarget.style.boxShadow = "none";
                        e.currentTarget.style.transform = "translateX(0)";
                      }}
                    >
                      {/* Left accent bar */}
                      <div style={{
                        position:"absolute", left:0, top:0, bottom:0, width:"3px",
                        background:`linear-gradient(180deg, ${cfg.color}, transparent)`,
                        borderRadius:"999px 0 0 999px",
                        opacity:0.7,
                      }} />

                      {/* Source badge */}
                      <div style={{
                        flexShrink:0,
                        background: cfg.bg, border:`1px solid ${cfg.border}`,
                        borderRadius:"8px", padding:"5px 10px",
                        fontSize:"12px", fontWeight:"700", color: cfg.color,
                        letterSpacing:"0.04em", whiteSpace:"nowrap",
                        minWidth:"72px", textAlign:"center",
                      }}>
                        {s.source || "Unknown"}
                      </div>

                      {/* Query */}
                      <div style={{ flex:1, minWidth:0 }}>
                        <p style={{
                          color:"#e2e8f0", fontSize:"14px", fontWeight:"600",
                          whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis",
                          marginBottom:"3px",
                        }}>{s.query}</p>
                        <p style={{ color:"#334155", fontSize:"11px", fontFamily:"'JetBrains Mono', monospace" }}>
                          {s.device}
                        </p>
                      </div>

                      {/* Time */}
                      <div style={{ flexShrink:0, textAlign:"right" }}>
                        <p style={{ color:"#475569", fontSize:"12px", fontWeight:"500" }}>
                          {timeAgo(s.timestamp)}
                        </p>
                        <p style={{ color:"#1e293b", fontSize:"11px", marginTop:"2px" }}>
                          {new Date(s.timestamp).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* RIGHT — Sidebar */}
          <div style={{ display:"flex", flexDirection:"column", gap:"20px" }}>

            {/* Top Searches */}
            <div style={{
              background:"rgba(255,255,255,0.03)",
              border:"1px solid rgba(255,255,255,0.07)",
              borderRadius:"16px", padding:"24px",
              backdropFilter:"blur(12px)",
            }}>
              <h3 style={{
                fontSize:"14px", fontWeight:"700", color:"#94a3b8",
                textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:"20px",
                display:"flex", alignItems:"center", gap:"8px",
              }}>
                🔥 Top Searches
              </h3>

              {topSearches.length === 0 ? (
                <p style={{ color:"#334155", fontSize:"13px" }}>No data yet.</p>
              ) : (
                <div style={{ display:"flex", flexDirection:"column", gap:"12px" }}>
                  {topSearches.map(([q, count], i) => {
                    const maxCount = topSearches[0][1];
                    const pct = (count / maxCount) * 100;
                    const medals = ["🥇","🥈","🥉","4️⃣","5️⃣"];
                    return (
                      <div key={q}>
                        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"6px" }}>
                          <div style={{ display:"flex", alignItems:"center", gap:"8px", minWidth:0 }}>
                            <span style={{ fontSize:"14px", flexShrink:0 }}>{medals[i]}</span>
                            <span style={{ fontSize:"13px", color:"#cbd5e1", fontWeight:"500", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                              {q}
                            </span>
                          </div>
                          <span style={{
                            fontSize:"11px", fontWeight:"700", color:"#7c3aed",
                            background:"rgba(124,58,237,0.15)", borderRadius:"999px",
                            padding:"2px 8px", flexShrink:0, marginLeft:"8px",
                          }}>{count}×</span>
                        </div>
                        <div style={{ height:"3px", background:"rgba(255,255,255,0.05)", borderRadius:"999px" }}>
                          <div style={{
                            height:"100%", width:`${pct}%`,
                            background:"linear-gradient(90deg, #7c3aed, #06b6d4)",
                            borderRadius:"999px",
                            transition:"width 0.6s ease",
                          }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Source breakdown */}
            <div style={{
              background:"rgba(255,255,255,0.03)",
              border:"1px solid rgba(255,255,255,0.07)",
              borderRadius:"16px", padding:"24px",
              backdropFilter:"blur(12px)",
            }}>
              <h3 style={{
                fontSize:"14px", fontWeight:"700", color:"#94a3b8",
                textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:"20px",
              }}>
                📡 Source Breakdown
              </h3>
              <div style={{ display:"flex", flexDirection:"column", gap:"14px" }}>
                {["Google","YouTube","Amazon"].map((src) => {
                  const cnt  = stats[src] || 0;
                  const pct  = stats.total > 0 ? Math.round((cnt / stats.total) * 100) : 0;
                  const cfg  = getSourceConfig(src);
                  return (
                    <div key={src}>
                      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"6px" }}>
                        <span style={{ fontSize:"13px", color: cfg.color, fontWeight:"600" }}>{src}</span>
                        <span style={{ fontSize:"13px", color:"#475569" }}>{cnt} ({pct}%)</span>
                      </div>
                      <div style={{ height:"4px", background:"rgba(255,255,255,0.05)", borderRadius:"999px" }}>
                        <div style={{
                          height:"100%", width:`${pct}%`,
                          background: cfg.color,
                          borderRadius:"999px",
                          boxShadow:`0 0 8px ${cfg.glow}`,
                          transition:"width 0.8s ease",
                        }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick info */}
            <div style={{
              background:"rgba(124,58,237,0.06)",
              border:"1px solid rgba(124,58,237,0.15)",
              borderRadius:"16px", padding:"20px",
              fontSize:"13px", color:"#64748b", lineHeight:"1.7",
            }}>
              <p style={{ color:"#7c3aed", fontWeight:"600", marginBottom:"8px", fontSize:"12px", textTransform:"uppercase", letterSpacing:"0.08em" }}>
                ⚡ How it works
              </p>
              Your Chrome extension captures searches from <span style={{color:"#93c5fd"}}>Google</span>, <span style={{color:"#fca5a5"}}>YouTube</span>, and <span style={{color:"#fde68a"}}>Amazon</span> and sends them here in real-time.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}