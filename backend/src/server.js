require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { PrismaClient } = require("@prisma/client");

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3001;
const API_TOKEN = process.env.API_TOKEN;

if (!API_TOKEN) {
  console.error("ERROR: API_TOKEN missing in .env");
  process.exit(1);
}

// ─────────────────────────────────────────
// ✅ FIXED CORS (THIS IS THE KEY FIX)
// ─────────────────────────────────────────

app.use(cors({
  origin: "*", // allow all (safe for your use case)
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

// handle preflight
app.options("*", cors());

app.use(express.json());

// ─────────────────────────────────────────
// AUTH MIDDLEWARE
// ─────────────────────────────────────────

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

// ─────────────────────────────────────────
// ROUTES
// ─────────────────────────────────────────

// health
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// save search
app.post("/api/search", authMiddleware, async (req, res) => {
  const { query, timestamp, device, source } = req.body;

  try {
    const search = await prisma.search.create({
      data: {
        query: query.trim(),
        timestamp: new Date(timestamp),
        device,
        source: source || "Unknown",
      },
    });

    res.status(201).json(search);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to save search" });
  }
});

// get searches
app.get("/api/searches", authMiddleware, async (req, res) => {
  try {
    const searches = await prisma.search.findMany({
      orderBy: { timestamp: "desc" },
      take: 100,
    });

    res.json(searches);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch searches" });
  }
});

// ─────────────────────────────────────────
// ERROR HANDLER
// ─────────────────────────────────────────

app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal server error" });
});

// ─────────────────────────────────────────
// START SERVER
// ─────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});