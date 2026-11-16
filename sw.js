import { offlineAssets } from './offline-assets.js';

const scope = self.registration.scope;
const cacheName = `D.I.S.M.I.S./v3-preview-7-${scope}`;
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
