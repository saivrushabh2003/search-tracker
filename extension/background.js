console.log("🔥 Background script loaded");

const API_URL = "https://search-tracker-nxb4.onrender.com/api/search";
const API_TOKEN = "517fc9134f21cbd2a0561ff9f727b0e0a581ea540fac51c0473b67bc6680b1c1";

let lastUrl = "";

// ── Device ID ─────────────────────────────
function getDeviceId() {
  return new Promise((resolve) => {
    chrome.storage.local.get(["deviceId"], (result) => {
      if (result.deviceId) {
        resolve(result.deviceId);
      } else {
        const id = "device-" + Math.random().toString(36).substring(2, 10);
        chrome.storage.local.set({ deviceId: id });
        resolve(id);
      }
    });
  });
}

// ── Tracking enabled check ───────────────
function isTrackingEnabled() {
  return new Promise((resolve) => {
    chrome.storage.local.get(["trackingEnabled"], (result) => {
      resolve(result.trackingEnabled !== false);
    });
  });
}

// ── Send search to backend ───────────────
async function sendSearch(query, deviceId, source, tab) {
  const payload = {
    query,
    timestamp: new Date().toISOString(),
    device: deviceId,
    source: source || "Unknown",   // ✅ safety fallback
    url: tab.url,
    title: tab.title,
  };

  console.log("📤 Sending:", payload);

  const tryPost = async () => {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_TOKEN}`,
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
  };

  for (let i = 0; i < 2; i++) {
    try {
      await tryPost();
      console.log("✅ Sent successfully");
      break;
    } catch (err) {
      console.warn("Retrying...", err);
      await new Promise((r) => setTimeout(r, 3000));
    }
  }
}

// ── Main listener ────────────────────────
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  console.log("🔄 Tab event:", changeInfo.status, tab.url);

  if (!tab.url) return;

  // prevent duplicate firing
  if (tab.url === lastUrl) return;
  lastUrl = tab.url;

  let url;
  try {
    url = new URL(tab.url);
  } catch {
    return;
  }

  if (changeInfo.status !== "complete" && !changeInfo.url) return;

  let query = null;
  let source = null;

  // ── Google ──
  if (
    url.hostname.includes("google.com") &&
    url.pathname === "/search" &&
    url.searchParams.has("q")
  ) {
    query = url.searchParams.get("q");
    source = "Google";
  }

  // ── YouTube ──
  else if (
    url.hostname.includes("youtube.com") &&
    url.pathname === "/results" &&
    url.searchParams.has("search_query")
  ) {
    query = url.searchParams.get("search_query");
    source = "YouTube";
  }

  // ── Amazon (improved detection) ──
  else if (
    url.hostname.includes("amazon") &&
    (url.searchParams.has("k") || url.searchParams.has("field-keywords"))
  ) {
    query =
      url.searchParams.get("k") ||
      url.searchParams.get("field-keywords");
    source = "Amazon";
  }

  // ❌ nothing matched
  if (!query || !source) {
    console.log("⛔ Not a tracked search");
    return;
  }

  console.log(`🎯 ${source} search detected:`, query);

  const enabled = await isTrackingEnabled();
  if (!enabled) return;

  const deviceId = await getDeviceId();

  await sendSearch(query.trim(), deviceId, source, tab);
});