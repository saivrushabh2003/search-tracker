const API_URL = "https://your-backend.onrender.com/api/search";
const API_TOKEN = "your-api-token-here"; // Replace with your actual token

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

function isTrackingEnabled() {
  return new Promise((resolve) => {
    chrome.storage.local.get(["trackingEnabled"], (result) => {
      resolve(result.trackingEnabled !== false); // default: enabled
    });
  });
}

async function sendSearch(query, deviceId) {
  const payload = {
    query,
    timestamp: new Date().toISOString(),
    device: deviceId,
  };

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

  try {
    await tryPost();
  } catch (e) {
    // Retry once after 3 seconds
    await new Promise((r) => setTimeout(r, 3000));
    try {
      await tryPost();
    } catch (e2) {
      console.error("Search Tracker: failed after retry", e2);
    }
  }
}

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status !== "complete") return;
  if (!tab.url) return;

  let url;
  try {
    url = new URL(tab.url);
  } catch {
    return;
  }

  const isGoogleSearch =
    (url.hostname === "www.google.com" || url.hostname === "google.com") &&
    url.pathname === "/search" &&
    url.searchParams.has("q");

  if (!isGoogleSearch) return;

  const enabled = await isTrackingEnabled();
  if (!enabled) return;

  const query = url.searchParams.get("q");
  if (!query || query.trim() === "") return;

  const deviceId = await getDeviceId();
  await sendSearch(query.trim(), deviceId);
});
