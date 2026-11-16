import assert from 'node:assert/strict';
import { readFileSync, statSync } from 'node:fs';
import { test } from 'node:test';

import { searchCatalog, receiverRuntime, createIntegrations } from '../workshop.js';
import { audioTimeline, decode, encode } from '../morse-core.js';
import { offlineAssets } from '../offline-assets.js';

const read = name => JSON.parse(readFileSync(new URL('../' + name, import.meta.url)));
const guides = read('guides.json');
const references = read('references.json');

test('catalog content has unique IDs, valid source URLs and resolvable guide links', () => {
  const entries = [...guides, ...references];
  const guideIds = new Set(guides.map(entry => entry.id));
  assert.equal(new Set(entries.map(entry => entry.id)).size, entries.length);
  for (const guide of guides) {
    assert.ok(guide.steps.length && guide.materials.length && guide.warning);
  }
  for (const reference of references) {
    assert.ok(reference.points.length);
    if (reference.guide) assert.ok(guideIds.has(reference.guide));
  }
  for (const entry of entries) {
    for (const source of entry.sources ?? []) assert.equal(new URL(source.url).protocol, 'https:');
  }
});

test('finds terms across headings and steps, and respects category selection', () => {
  assert.equal(searchCatalog(guides, 'crystal shunt', 'radio')[0].id, 'radio-crystal-loop');
  assert.equal(searchCatalog(references, '162.550 WX')[0].id, 'nwr-frequencies');
  assert.deepEqual(searchCatalog(guides, 'crystal', 'water'), []);
  assert.deepEqual(searchCatalog(guides, '   '), guides);
});

test('offline manifest includes both complete entry points and only existing assets', () => {
  assert.equal(new Set(offlineAssets).size, offlineAssets.length);
  for (const entry of offlineAssets) statSync(new URL(entry, new URL('../', import.meta.url)));
  for (const name of ['app.js', 'styles.css', 'morse.html', 'morse.js', 'morse-core.js', 'references.json']) {
    assert.ok(offlineAssets.includes('./' + name));
  }
});

test('Morse round-trips supported punctuation and handles blanks and unknowns', () => {
  assert.equal(decode(encode('CQ 2026 / HELP?')), 'CQ 2026 / HELP?');
  assert.equal(decode('   '), '');
  assert.equal(encode('A 🙂 B'), '.- / -...');
  assert.equal(decode('.......'), '�');
});

test('Morse timeline differentiates character spacing, word spacing and the SOS prosign', () => {
  assert.deepEqual(audioTimeline('.- - / .'), [
    { start: 0, length: 1 }, { start: 2, length: 3 },
    { start: 8, length: 3 }, { start: 18, length: 1 },
  ]);
  assert.equal(audioTimeline('...---...').at(-1).start, 22);
  assert.deepEqual(audioTimeline(''), []);
});

test('integration registry validates capability contracts and isolates providers', () => {
  const registry = createIntegrations();
  const mock = { status: () => 'ready', answer: () => 'local answer' };
  assert.equal(registry.get('localAI'), null);
  assert.throws(() => registry.register('localAI', { status() {} }), TypeError);
  assert.throws(() => registry.register('toString', mock), TypeError);
  const unregister = registry.register('localAI', mock);
  assert.equal(registry.get('localAI').answer(), 'local answer');
  assert.throws(() => registry.register('localAI', mock));
  assert.equal(registry.get('meshtastic'), null);
  unregister();
  const latest = { ...mock };
  registry.register('localAI', latest);
  unregister();
  assert.equal(registry.get('localAI'), latest);
});

test('receiver runtime uses measured usable energy and rejects invalid loads', () => {
  assert.deepEqual(receiverRuntime(10, 5, 0.2), { watts: 1, hours: 10 });
  assert.deepEqual(receiverRuntime(10, 5, 0.5), { watts: 2.5, hours: 4 });
  assert.equal(receiverRuntime(10, 5, 0), null);
  assert.equal(receiverRuntime(Infinity, 5, 0.2), null);
});

test('all communications and electrical guides have offline part-identification material', async () => {
  const { electrical, parts } = await import('../electrical.js');
  for (const guide of guides.filter(guide => guide.cat === 'radio' || ['g10', 'g11', 'g12', 'g19'].includes(guide.id))) {
    const entry = electrical[guide.id];
    assert.ok(entry?.parts.length && entry.checks, guide.id);
    for (const id of entry.parts) {
      assert.equal(parts[id]?.length, 4, id);
      assert.ok(parts[id].every(Boolean));
    }
    for (const connection of entry.wiring) assert.equal(connection.length, 3);
  }
  assert.ok(offlineAssets.includes('./electrical.js'));
  const { componentPhotos } = await import('../component-photos.js');
  assert.equal(Object.keys(componentPhotos).length, Object.keys(parts).length);
  for (const [id, photo] of Object.entries(componentPhotos)) {
    assert.ok(parts[id], id);
    assert.ok(photo.author && photo.license && photo.caption, id);
    assert.ok(offlineAssets.includes(photo.path), id);
  }
});
