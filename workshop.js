/** Rank local catalog entries, requiring every term to match somewhere. */
export function searchCatalog(entries, query, category = 'all') {
  const terms = query.toLowerCase().match(/[\p{L}\p{N}]+/gu) ?? [];
  return entries
    .filter(entry => category === 'all' || entry.cat === category)
    .map(entry => {
      const heading = [entry.title, entry.category, ...(entry.keywords ?? [])].join(' ').toLowerCase();
      const body = [entry.overview, entry.warning, ...(entry.materials ?? []),
        ...(entry.steps ?? []), ...(entry.points ?? [])].join(' ').toLowerCase();
      const scores = terms.map(term => heading.includes(term) ? 3 : body.includes(term) ? 1 : 0);
      return { entry, score: scores.includes(0) ? -1 : scores.reduce((sum, value) => sum + value, 0) };
    })
    .filter(result => result.score >= 0)
    .sort((a, b) => b.score - a.score)
    .map(result => result.entry);
}

/** Transport boundaries reserved for real, separately installed providers. */
export const integrationContracts = Object.freeze({
  localAI: Object.freeze(['status', 'answer']),
  meshtastic: Object.freeze(['status', 'listNodes', 'onMessage', 'sendText']),
  hardware: Object.freeze(['status', 'listDevices', 'readTelemetry']),
});

export function createIntegrations() {
  const providers = new Map();
  return Object.freeze({
    register(kind, provider) {
      const methods = Object.hasOwn(integrationContracts, kind) && integrationContracts[kind];
      if (!methods || !methods.every(method => typeof provider?.[method] === 'function')) {
        throw new TypeError(`Invalid provider for ${kind}`);
      }
      if (providers.has(kind)) throw new Error(`Provider already registered for ${kind}`);
      providers.set(kind, provider);
      return () => {
        if (providers.get(kind) === provider) providers.delete(kind);
      };
    },
    get(kind) {
      return providers.get(kind) ?? null;
    },
  });
}
