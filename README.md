# D.I.S.M.I.S. Field Workshop V3 preview

An offline-first progressive web app for field survival, engineering, and communications. The preview runs on a static HTTP server with no account, backend, or app dependencies.

## Run the preview locally

From the repository root:

```sh
python3 -m http.server 8000
```

Open http://localhost:8000/ in a browser. For offline use, open **Offline & Integrations** and select **Check offline readiness**. When it reports ready, disconnect and reload. A first visit requires connectivity to the server. For use from another device, serve over HTTPS.

Run the catalog, Morse and integration contract checks with Node.js 22 or newer:

```sh
node --test
```

## Included

- Ask the Field Guide searches saved material from a chat interface, links to sources, shows relevant parts photos, and walks through one saved step at a time. It uses local text matching. Generative AI, voice and photo understanding require a future provider.
- 23 searchable field guides with category filters and step progress. New communications material covers a battery-free AM loop receiver, a regulated hand-crank listening kit, a walkie-talkie check-in drill, and NOAA Weather Radio setup.
- Ten searchable, bundled technical references with related guides and source links. Summaries and the receiver-runtime estimator work offline. External source pages require internet.
- Morse encoding and decoding, adjustable-speed audio, a character chart, and randomized listening drills. Audio stays on the device.
- Field Notes with autosave, text export and append-only text import. Existing notes and progress for unchanged guides on the same origin retain their storage keys. The replacement cold-weather warmth guide starts with fresh progress. Keep an exported backup if browser data is cleared.
- An all-or-nothing offline cache for the app, references and Morse trainer, scoped to the app's URL. When shipping updated assets, update the cache version in `sw.js` and update the asset list in `offline-assets.js` if necessary.

## Integration foundation

`workshop.js` provides a provider registry that validates required methods. No providers are bundled. Provider implementations and their browser permissions, error handling, data formats and end-to-end tests are future work.

| Provider | Required methods | Planned use |
| --- | --- | --- |
| `localAI` | `status`, `answer` | Answer from bundled guide and reference context using a user-configured on-device runtime |
| `meshtastic` | `status`, `listNodes`, `onMessage`, `sendText` | Pair supported LoRa hardware, stage messages, and report delivery status where available |
| `hardware` | `status`, `listDevices`, `readTelemetry` | Read telemetry from available D.I.S.M.I.S. devices through a separately implemented transport |

Additional planned work includes expanded manuals, maps, device-specific hardware testing, and verified emergency workflows. The radio projects are educational. Test real reception, power and any alert function before relying on hardware in the field.
