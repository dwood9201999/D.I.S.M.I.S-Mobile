export const offlineAssets = Object.freeze([
  './', './index.html', './styles.css', './app.js', './workshop.js', './electrical.js', './component-art.js',
  './offline-assets.js', './guides.json', './references.json', './morse.html',
  './morse.js', './morse-core.js', './icon.svg', './manifest.webmanifest',
]);

export function installOffline() {
  if (!('serviceWorker' in navigator)) return Promise.resolve(null);
  return navigator.serviceWorker.register('./sw.js', { type: 'module' }).catch(() => null);
}
