const CACHE_PREFIX = "vcard-editor-shell-";
const CACHE = `${CACHE_PREFIX}v5`;
const SHELL = ["/offline.html", "/manifest.webmanifest", "/icon.svg"];
const MAX_ENTRIES = 128;

async function remember(request, response) {
  if (!response.ok || response.type !== "basic" || response.redirected) return;
  const cache = await caches.open(CACHE);
  await cache.put(request, response);
  const keys = await cache.keys();
  let excess = keys.length - MAX_ENTRIES;
  for (const key of keys) {
    if (excess <= 0) break;
    if (SHELL.includes(new URL(key.url).pathname)) continue;
    await cache.delete(key);
    excess -= 1;
  }
}

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(SHELL)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(Promise.all([
    caches.keys().then((keys) => Promise.all(keys.filter((key) => key.startsWith(CACHE_PREFIX) && key !== CACHE).map((key) => caches.delete(key)))),
    self.clients.claim(),
  ]));
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== "GET" || url.origin !== self.location.origin || url.search || request.headers.has("RSC")) return;
  if (request.mode === "navigate") {
    event.respondWith((async () => {
      try {
        const response = await fetch(request);
        return response;
      } catch {
        const cache = await caches.open(CACHE);
        return await cache.match("/offline.html") || Response.error();
      }
    })());
    return;
  }
  // Next.js router responses and analytics requests must always use the network.
  const staticAsset = url.pathname.startsWith("/_next/static/") || url.pathname.startsWith("/fonts/") || SHELL.includes(url.pathname);
  if (!staticAsset) return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const cached = await cache.match(request);
    if (cached) return cached;
    const response = await fetch(request);
    await remember(request, response.clone()).catch(() => undefined);
    return response;
  })());
});
