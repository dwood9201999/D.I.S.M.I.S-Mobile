import assert from 'node:assert/strict';
import { test } from 'node:test';
import vm from 'node:vm';
import { offlineAssets, workerSource } from './worker-source.mjs';

const scope = 'https://example.test/D.I.S.M.I.S-Mobile/';
const urls = offlineAssets.map(path => new URL(path, scope).href);

function createWorker({ missing } = {}) {
  const listeners = new Map();
  const storage = new Map();
  const cachedPaths = new Set();
  let claimed = false;
  let skipped = false;
  const caches = {
    keys: async () => [...storage.keys()],
    delete: async key => storage.delete(key),
    async open(key) {
      if (!storage.has(key)) storage.set(key, new Map());
      const cache = storage.get(key);
      return {
        async addAll(requests) {
          if (requests.some(request => request.url === missing)) throw new Error('Missing asset');
          for (const request of requests) {
            assert.equal(request.cache, 'reload');
            cache.set(request.url, 'cached:' + request.url);
            cachedPaths.add(request.url);
          }
        },
        match: async url => cache.get(url),
      };
    },
  };
  vm.runInNewContext(workerSource, {
    URL, Request, caches,
    fetch: async request => 'network:' + request.url,
    self: {
      registration: { scope },
      skipWaiting: async () => { skipped = true; },
      clients: { claim: async () => { claimed = true; } },
      addEventListener: (name, callback) => listeners.set(name, callback),
    },
  });
  function dispatch(name, data = {}) {
    let pending;
    const capture = promise => { pending = promise; };
    listeners.get(name)({ waitUntil: capture, respondWith: capture, ...data });
    return pending;
  }
  return { dispatch, storage, cachedPaths, wasClaimed: () => claimed, skipped: () => skipped };
}

test('offline worker caches the full nested app and responds only to its own assets', async () => {
  const worker = createWorker();
  await worker.dispatch('install');
  await worker.dispatch('activate');
  assert.equal(worker.skipped(), true);
  assert.equal(worker.wasClaimed(), true);
  assert.deepEqual([...worker.cachedPaths], urls);
  assert.equal(await worker.dispatch('fetch', {
    request: new Request(scope + 'morse.html?launch=offline'),
  }), 'cached:' + scope + 'morse.html');
  assert.equal(worker.dispatch('fetch', { request: new Request(scope + 'missing.js') }), undefined);
  assert.equal(worker.dispatch('fetch', { request: new Request('https://example.test/other/index.html') }), undefined);
  assert.equal(worker.dispatch('fetch', { request: new Request(scope, { method: 'POST' }) }), undefined);
  let ready;
  const check = () => worker.dispatch('message', {
    data: 'offline-status',
    ports: [{ postMessage: value => { ready = value; } }],
  });
  await check();
  assert.equal(ready, true);
  const [active] = worker.storage.values();
  active.delete(scope + 'morse.html');
  await check();
  assert.equal(ready, false);
});

test('a missing asset prevents promotion and activation removes only older caches for its scope', async () => {
  const broken = createWorker({ missing: scope + 'morse-core.js' });
  await assert.rejects(broken.dispatch('install'), /Missing asset/);
  assert.equal(broken.skipped(), false);
  assert.equal(broken.cachedPaths.size, 0);
  const worker = createWorker();
  await worker.dispatch('install');
  const owner = 'D.I.S.M.I.S./v3-preview-0-' + scope;
  const neighbor = 'D.I.S.M.I.S./v3-preview-0-https://example.test/other/';
  for (const key of [owner, neighbor, 'dismis-workshop-repair-v3']) worker.storage.set(key, new Map());
  await worker.dispatch('activate');
  assert.equal(worker.storage.has(owner), false);
  assert.equal(worker.storage.has(neighbor), true);
  assert.equal(worker.storage.has('dismis-workshop-repair-v3'), true);
});
