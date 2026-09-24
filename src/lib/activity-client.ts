/**
 * Client-side notification dispatcher for instant activity synchronization
 * across the active window and all open browser tabs.
 */
export function notifyActivityChanged(): void {
  if (typeof window === "undefined") return;

  try {
    window.dispatchEvent(new CustomEvent("chronos:activity-changed"));
  } catch {
    // Ignore in non-standard environments
  }

  try {
    if (typeof BroadcastChannel !== "undefined") {
      const channel = new BroadcastChannel("chronos:notifications");
      channel.postMessage({ type: "activity-changed", timestamp: Date.now() });
      channel.close();
    }
  } catch {
    // Ignore environments without BroadcastChannel support
  }
}
