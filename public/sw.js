// Minimal service worker: lets the app install to the home screen and open offline to the home screen.
// Scans still need internet (they go to the AI).
const C = "hisab-v12";
self.addEventListener("install", e => { e.waitUntil(caches.open(C).then(c => c.addAll(["/", "/index.html", "/manifest.json", "/icon-192.png", "/icon-512.png", "/apple-touch-icon.png", "/icon-maskable.png"]))); self.skipWaiting(); });
self.addEventListener("activate", e => { e.waitUntil(self.clients.claim()); });
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET" || e.request.url.includes("/api/")) return;
  e.respondWith(fetch(e.request).catch(() => caches.match(e.request)));
});
