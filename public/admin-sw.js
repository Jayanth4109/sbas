// Minimal service worker, just enough to satisfy PWA installability.
// No offline caching — the admin app always needs a live connection anyway.
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));
self.addEventListener("fetch", () => {});
