require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { PrismaClient } = require("@prisma/client");

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3001;
const API_TOKEN = process.env.API_TOKEN;

if (!API_TOKEN) {
  console.error("ERROR: API_TOKEN is not set in environment variables.");
  process.exit(1);
}

// ── Middleware ──────────────────────────────────────────────────────────────

app.use(cors({ origin: process.env.DASHBOARD_URL || "*" }));
app.use(express.json());

// Token auth middleware
function authMiddleware(req, res, next) {
  const authHeader = req.headers["authorization"];
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing Authorization header" });
  }
  const token = authHeader.slice(7);
  if (token !== API_TOKEN) {
    return res.status(403).json({ error: "Invalid token" });
  }
  next();
}

// ── Routes ──────────────────────────────────────────────────────────────────

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// POST /api/search — record a new search
app.post("/api/search", authMiddleware, async (req, res) => {
  const { query, timestamp, device } = req.body;

  if (!query || typeof query !== "string" || query.trim() === "") {
    return res.status(400).json({ error: "query is required and must be a non-empty string" });
  }
  if (!timestamp || isNaN(Date.parse(timestamp))) {
    return res.status(400).json({ error: "timestamp must be a valid ISO date string" });
  }
  if (!device || typeof device !== "string") {
    return res.status(400).json({ error: "device is required" });
  }

  try {
    const search = await prisma.search.create({
   data: {
  query: query.trim(),
  timestamp: new Date(timestamp),
  device: device.trim(),
  source: req.body.source || "Unknown",
},
    });
    res.status(201).json(search);
  } catch (err) {
    console.error("POST /api/search error:", err);
    res.status(500).json({ error: "Failed to save search" });
  }
});

// GET /api/searches — retrieve searches with optional filters
app.get("/api/searches", authMiddleware, async (req, res) => {
  const { q, from, to } = req.query;

  const where = {};

  if (q && typeof q === "string") {
    where.query = { contains: q, mode: "insensitive" };
  }

  if (from || to) {
    where.timestamp = {};
    if (from && !isNaN(Date.parse(from))) {
      where.timestamp.gte = new Date(from);
    }
    if (to && !isNaN(Date.parse(to))) {
      where.timestamp.lte = new Date(to);
    }
  }

  try {
    const searches = await prisma.search.findMany({
      where,
      orderBy: { timestamp: "desc" },
      take: 100,
    });
    res.json(searches);
  } catch (err) {
    console.error("GET /api/searches error:", err);
    res.status(500).json({ error: "Failed to fetch searches" });
  }
});

// ── Error handler ────────────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal server error" });
});

// ── Start ────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`Search Tracker API running on port ${PORT}`);
});
