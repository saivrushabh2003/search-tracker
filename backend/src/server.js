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

// ── CORS FIX (IMPORTANT) ─────────────────────────────────────────────

// allow your frontend domains
const allowedOrigins = [
  "http://localhost:3000",
  "https://search-tracker-beta.vercel.app",
  "https://search-tracker-1rm3-5ia4n291z-saivrushabh2003s-projects.vercel.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin (like curl / Postman)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        return callback(new Error("CORS not allowed"));
      }
    },
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// 🔥 handle preflight properly
app.options("*", cors());

app.use(express.json());

// ── Auth Middleware ─────────────────────────────────────────────

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

// ── Routes ─────────────────────────────────────────────────────

// Health
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// POST search
app.post("/api/search", authMiddleware, async (req, res) => {
  const { query, timestamp, device, source } = req.body;

  if (!query || typeof query !== "string" || query.trim() === "") {
    return res.status(400).json({ error: "Invalid query" });
  }

  try {
    const search = await prisma.search.create({
      data: {
        query: query.trim(),
        timestamp: new Date(timestamp),
        device: device.trim(),
        source: source || "Unknown",
      },
    });

    res.status(201).json(search);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to save search" });
  }
});

// GET searches
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

// ── Error handler ─────────────────────────────────────────────

app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal server error" });
});

// ── Start ─────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`API running on port ${PORT}`);
});