import { componentPhotos } from './component-photos.js';

export const offlineAssets = Object.freeze([
  './', './index.html', './styles.css', './app.js', './field-chat.js', './workshop.js', './electrical.js', './component-photos.js',
  './offline-assets.js', './guides.json', './references.json', './morse.html',
  ...Object.values(componentPhotos).map(photo => photo.path),
  './morse.js', './morse-core.js', './icon.svg', './manifest.webmanifest',
]);

export function installOffline() {
  if (!('serviceWorker' in navigator)) return Promise.resolve(null);
  return navigator.serviceWorker.register('./sw.js', { type: 'module' }).catch(() => null);
}
