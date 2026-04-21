"use client";

import { useState, useEffect } from "react";

export default function LoginPage() {
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogin = () => {
    if (!token.trim()) {
      setError("Please enter your API token.");
      return;
    }
    setError("");
    setLoading(true);
    localStorage.setItem("api_token", token.trim());
    window.location.href = "/dashboard";
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleLogin();
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#050510",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'Inter', 'Space Grotesk', sans-serif",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Animated background orbs */}
      <div
        style={{
          position: "absolute",
          width: "600px",
          height: "600px",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(124,58,237,0.18) 0%, transparent 70%)",
          top: "-150px",
          left: "-150px",
          animation: "orb-float 10s ease-in-out infinite",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          width: "500px",
          height: "500px",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(6,182,212,0.12) 0%, transparent 70%)",
          bottom: "-100px",
          right: "-100px",
          animation: "orb-float 14s ease-in-out infinite reverse",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          width: "300px",
          height: "300px",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(236,72,153,0.1) 0%, transparent 70%)",
          top: "40%",
          left: "60%",
          animation: "orb-float 18s ease-in-out infinite",
          pointerEvents: "none",
        }}
      />

      {/* Grid overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `
            linear-gradient(rgba(124,58,237,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(124,58,237,0.04) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
          pointerEvents: "none",
        }}
      />

      {/* Login card */}
      <div
        style={{
          position: "relative",
          width: "100%",
          maxWidth: "440px",
          margin: "0 20px",
          opacity: mounted ? 1 : 0,
          transform: mounted ? "translateY(0)" : "translateY(24px)",
          transition: "opacity 0.6s ease, transform 0.6s ease",
        }}
      >
        {/* Card glow border */}
        <div
          style={{
            position: "absolute",
            inset: "-1px",
            borderRadius: "24px",
            background:
              "linear-gradient(135deg, rgba(124,58,237,0.6), rgba(6,182,212,0.4), rgba(236,72,153,0.3))",
            zIndex: 0,
          }}
        />

        <div
          style={{
            position: "relative",
            background: "rgba(10,10,26,0.92)",
            borderRadius: "24px",
            padding: "48px 40px",
            backdropFilter: "blur(30px)",
            zIndex: 1,
          }}
        >
          {/* Logo area */}
          <div style={{ textAlign: "center", marginBottom: "40px" }}>
            {/* Icon */}
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: "72px",
                height: "72px",
                borderRadius: "20px",
                background:
                  "linear-gradient(135deg, rgba(124,58,237,0.3), rgba(6,182,212,0.2))",
                border: "1px solid rgba(124,58,237,0.4)",
                marginBottom: "20px",
                fontSize: "32px",
                animation: "float 4s ease-in-out infinite",
              }}
            >
              🔍
            </div>

            <h1
              style={{
                fontSize: "28px",
                fontWeight: "800",
                background:
                  "linear-gradient(135deg, #a78bfa, #06b6d4, #ec4899)",
                backgroundSize: "200% auto",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                animation: "shimmer 3s linear infinite",
                marginBottom: "8px",
                letterSpacing: "-0.5px",
              }}
            >
              Search Tracker
            </h1>
            <p style={{ color: "#64748b", fontSize: "14px", fontWeight: "400" }}>
              Your personal intelligence dashboard
            </p>
          </div>

          {/* Form */}
          <div>
            <label
              style={{
                display: "block",
                fontSize: "12px",
                fontWeight: "600",
                color: "#94a3b8",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                marginBottom: "10px",
              }}
            >
              API Token
            </label>

            <div style={{ position: "relative", marginBottom: "16px" }}>
              <div
                style={{
                  position: "absolute",
                  left: "16px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  fontSize: "16px",
                  pointerEvents: "none",
                }}
              >
                🔑
              </div>
              <input
                id="token-input"
                type="password"
                placeholder="Enter your secret token"
                value={token}
                onChange={(e) => {
                  setToken(e.target.value);
                  setError("");
                }}
                onKeyDown={handleKeyDown}
                style={{
                  width: "100%",
                  background: "rgba(255,255,255,0.04)",
                  border: error
                    ? "1px solid rgba(239,68,68,0.5)"
                    : "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "12px",
                  padding: "14px 16px 14px 44px",
                  color: "#f1f5f9",
                  fontSize: "14px",
                  fontFamily: "'JetBrains Mono', monospace",
                  outline: "none",
                  transition: "border-color 0.2s, box-shadow 0.2s",
                  boxSizing: "border-box",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "rgba(124,58,237,0.6)";
                  e.currentTarget.style.boxShadow =
                    "0 0 0 3px rgba(124,58,237,0.15)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = error
                    ? "rgba(239,68,68,0.5)"
                    : "rgba(255,255,255,0.08)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              />
            </div>

            {error && (
              <p
                style={{
                  color: "#f87171",
                  fontSize: "13px",
                  marginBottom: "16px",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                ⚠️ {error}
              </p>
            )}

            <button
              id="login-btn"
              onClick={handleLogin}
              disabled={loading}
              style={{
                width: "100%",
                padding: "14px",
                borderRadius: "12px",
                border: "none",
                background: loading
                  ? "rgba(124,58,237,0.4)"
                  : "linear-gradient(135deg, #7c3aed, #2563eb)",
                color: "#fff",
                fontSize: "15px",
                fontWeight: "700",
                cursor: loading ? "not-allowed" : "pointer",
                letterSpacing: "0.02em",
                transition: "all 0.3s ease",
                boxShadow: loading
                  ? "none"
                  : "0 4px 20px rgba(124,58,237,0.4), 0 0 40px rgba(124,58,237,0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                fontFamily: "'Inter', sans-serif",
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow =
                    "0 8px 30px rgba(124,58,237,0.5), 0 0 60px rgba(124,58,237,0.2)";
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow =
                  "0 4px 20px rgba(124,58,237,0.4), 0 0 40px rgba(124,58,237,0.15)";
              }}
            >
              {loading ? (
                <>
                  <span
                    style={{
                      display: "inline-block",
                      width: "16px",
                      height: "16px",
                      border: "2px solid rgba(255,255,255,0.3)",
                      borderTop: "2px solid #fff",
                      borderRadius: "50%",
                      animation: "spin-slow 0.8s linear infinite",
                    }}
                  />
                  Authenticating…
                </>
              ) : (
                <>
                  <span>⚡</span> Access Dashboard
                </>
              )}
            </button>
          </div>

          {/* Footer */}
          <p
            style={{
              textAlign: "center",
              color: "#334155",
              fontSize: "12px",
              marginTop: "28px",
              lineHeight: "1.6",
            }}
          >
            Powered by Search Tracker v1.1.0
            <br />
            <span style={{ color: "#475569" }}>
              Google · YouTube · Amazon
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}