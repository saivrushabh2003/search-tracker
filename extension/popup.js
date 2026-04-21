const toggle = document.getElementById("toggle");
const status = document.getElementById("status");

chrome.storage.local.get(["trackingEnabled"], (result) => {
  const enabled = result.trackingEnabled !== false;
  toggle.checked = enabled;
  updateStatus(enabled);
});

toggle.addEventListener("change", () => {
  const enabled = toggle.checked;
  chrome.storage.local.set({ trackingEnabled: enabled });
  updateStatus(enabled);
});

function updateStatus(enabled) {
  if (enabled) {
    status.textContent = "Tracking is ON";
    status.className = "status on";
  } else {
    status.textContent = "Tracking is OFF";
    status.className = "status off";
  }
}
