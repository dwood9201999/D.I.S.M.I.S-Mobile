let registrationAttempt;

export function installOffline() {
  if (!globalThis.isSecureContext) {
    return Promise.resolve({ error: 'Open the HTTPS site to set up offline access.' });
  }
  if (!('serviceWorker' in navigator)) {
    return Promise.resolve({ error: 'This browser session does not support offline setup. Open the link directly in Safari.' });
  }
  registrationAttempt ??= navigator.serviceWorker.register('./sw.js', { updateViaCache: 'none' })
    .then(registration => ({ registration }))
    .catch(error => {
      registrationAttempt = undefined;
      return { error: `Offline setup could not start (${error.name}). ${error.message}` };
    });
  return registrationAttempt;
}
