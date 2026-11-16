// Keep this list in sync with offline entry points, data, and media.
const offlineAssets = [
  "./",
  "./index.html",
  "./styles.css",
  "./app.js",
  "./field-chat.js",
  "./workshop.js",
  "./electrical.js",
  "./component-photos.js",
  "./offline-assets.js",
  "./guides.json",
  "./references.json",
  "./morse.html",
  "./photos/loop.webp",
  "./photos/capacitor.webp",
  "./photos/diode.webp",
  "./photos/ear.webp",
  "./photos/resistor.webp",
  "./photos/meter.webp",
  "./photos/motor.webp",
  "./photos/regulator.webp",
  "./photos/crank.webp",
  "./photos/usb.webp",
  "./photos/load.webp",
  "./photos/receiver.webp",
  "./photos/panel.webp",
  "./photos/controller.webp",
  "./photos/battery.webp",
  "./photos/fuse.webp",
  "./photos/turbine.webp",
  "./photos/handheld.webp",
  "./morse.js",
  "./morse-core.js",
  "./morse-course.js",
  "./icon.svg",
  "./manifest.webmanifest"
];

const scope = self.registration.scope;
const cacheName = `D.I.S.M.I.S./v3-preview-14-${scope}`;
const assets = new Set(offlineAssets.map(path => new URL(path, scope).href));

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(cacheName);
    await cache.addAll([...assets].map(url => new Request(url, { cache: 'reload' })));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    for (const key of await caches.keys()) {
      if (key !== cacheName && key.startsWith('D.I.S.M.I.S./v3-preview-') && key.endsWith(`-${scope}`)) {
        await caches.delete(key);
      }
    }
    await self.clients.claim();
  })());
});

self.addEventListener('message', event => {
  if (event.data !== 'offline-status' || !event.ports[0]) return;
  event.waitUntil((async () => {
    const cache = await caches.open(cacheName);
    const matches = await Promise.all([...assets].map(url => cache.match(url)));
    event.ports[0].postMessage(matches.every(Boolean));
  })());
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  url.search = '';
  if (!assets.has(url.href)) return;
  event.respondWith((async () => {
    const cache = await caches.open(cacheName);
    return await cache.match(url.href) || fetch(event.request);
  })());
});
