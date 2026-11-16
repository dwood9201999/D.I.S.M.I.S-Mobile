import { searchCatalog, receiverRuntime, createIntegrations } from './workshop.js';
import { installOffline } from './offline-assets.js';

const main = document.querySelector('#main');
const nav = document.querySelector('nav');
const byId = id => document.getElementById(id);
const escape = value => String(value).replace(/[&<>"']/g, char =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
const tabs = { guides: {}, references: {} };
const integrations = createIntegrations();
const offlineRegistration = installOffline();
let activeView = 'guides';
let guideId = null;
let catalog = { guides: [], references: [] };
let catalogLoad;
let notesDraft;

function load(key, fallback) {
  try {
    const value = JSON.parse(localStorage.getItem(key));
    if (typeof value === typeof fallback && value !== null && !Array.isArray(value)) return value;
  } catch { /* A corrupt or inaccessible entry can be recreated. */ }
  return fallback;
}

function save(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

function status(id, message) {
  byId(id).textContent = message;
}

function sourceList(sources = []) {
  return sources.length ? '<h3>Sources (internet required)</h3><ul>' +
    sources.map(({ title, url }) => `<li><a href="${escape(url)}">${escape(title)}</a></li>`).join('') +
    '</ul>' : '';
}

function show(view, id = null, focus = false) {
  activeView = view;
  guideId = id;
  for (const button of nav.querySelectorAll('button')) {
    const selected = button.dataset.view === view;
    button.classList.toggle('on', selected);
    button.setAttribute('aria-pressed', String(selected));
  }
  render();
  if (focus) main.querySelector('h2')?.focus();
}

function render() {
  if (activeView === 'notes') return renderNotes();
  if (activeView === 'about') return renderAbout();
  if (catalogLoad === 'error') {
    main.innerHTML = '<p class="warn" role="alert">The guide library could not load.</p><button id="retry">Retry</button>';
    byId('retry').onclick = loadCatalog;
    return;
  }
  if (catalogLoad !== 'ready') {
    main.innerHTML = '<p role="status">Loading guide library…</p>';
    return;
  }
  const selected = catalog.guides.find(guide => guide.id === guideId);
  if (activeView === 'guides' && selected) return renderGuide(selected);
  renderCatalog(activeView);
}

function runtimeCalculator() {
  return `<form id="runtime" class="card">
    <h2>Receiver runtime estimate</h2>
    <p>Use usable energy measured at the output, and voltage and current measured while listening.</p>
    <div class="row">
      <label>Usable watt-hours<input name="energy" type="number" min="0" step="any" required></label>
      <label>Voltage (V)<input name="voltage" type="number" min="0" step="any" required></label>
      <label>Current (A)<input name="current" type="number" min="0" step="any" required></label>
    </div>
    <button>Estimate runtime</button>
    <p><output id="runtime-result" form="runtime" aria-live="polite"></output></p>
  </form>`;
}

function renderCatalog(view) {
  const entries = catalog[view];
  const state = tabs[view];
  const isGuide = view === 'guides';
  const categories = new Map(entries.map(entry => [entry.cat, entry.category]));
  main.innerHTML = `<div class="card">
    <h2 tabindex="-1">${isGuide ? 'Field Guide' : 'Technical References'}</h2>
    <label for="search">Search ${isGuide ? 'guides' : 'references'}</label>
    <input type="search" id="search" placeholder="${isGuide ? 'Try crystal radio or hand crank' : 'Try NOAA, voltage, or LoRa'}">
    <label for="category">Category</label>
    <select id="category"><option value="all">All categories</option>
      ${[...categories].map(([key, label]) => `<option value="${escape(key)}">${escape(label)}</option>`).join('')}
    </select>
    <p id="result-count" role="status" class="muted"></p>
  </div><div id="results"></div>${isGuide ? '' : runtimeCalculator()}`;
  if (!isGuide) byId('runtime').onsubmit = event => {
    event.preventDefault();
    const form = event.currentTarget;
    const read = key => form.elements.namedItem(key).valueAsNumber;
    const result = receiverRuntime(read('energy'), read('voltage'), read('current'));
    const format = new Intl.NumberFormat(undefined, { maximumSignificantDigits: 3 });
    status('runtime-result', result ?
      `${format.format(result.watts)} W load · About ${format.format(result.hours)} hours. Verify by timing a real run.` :
      'Enter a positive finite value in each field.');
  };
  const search = byId('search');
  const category = byId('category');
  search.value = state.query ?? '';
  category.value = state.category ?? 'all';
  function update() {
    state.query = search.value;
    state.category = category.value;
    const matches = searchCatalog(entries, state.query, state.category);
    status('result-count', `${matches.length} of ${entries.length} ${view}`);
    byId('results').innerHTML = matches.map(entry => `<article class="card">
      <span class="pill">${escape(entry.category)}${entry.level ? ` · ${escape(entry.level)}` : ''}</span>
      <h2>${escape(entry.title)}</h2><p>${escape(entry.overview)}</p>
      ${isGuide ? `<button class="primary" data-guide="${escape(entry.id)}">Open guide</button>` :
        `<ul>${entry.points.map(point => `<li>${escape(point)}</li>`).join('')}</ul>
        ${sourceList(entry.sources)}
        ${entry.guide ? `<button data-guide="${escape(entry.guide)}">Open related guide</button>` : ''}`}
    </article>`).join('') || '<p>No matches. Try a different search or category.</p>';
  }
  search.oninput = category.onchange = update;
  update();
}

function renderGuide(guide) {
  const progressKey = 'progress-' + guide.id + (guide.revision ? '-r' + guide.revision : '');
  const progress = load(progressKey, {});
  main.innerHTML = `<button id="back" class="back">← Field Guide</button>
    <article class="card"><span class="pill">${escape(guide.category)} · ${escape(guide.level)}</span>
    <h2 tabindex="-1">${escape(guide.title)}</h2><p>${escape(guide.overview)}</p>
    <p class="warn">${escape(guide.warning)}</p>
    <h3>Materials and tools</h3>
    ${guide.materials.map(item => `<label class="check"><input type="checkbox"><span>${escape(item)}</span></label>`).join('')}
    <h3>Steps</h3>
    <p id="count" role="status" class="muted"></p><progress id="bar" max="${guide.steps.length}"></progress>
    ${guide.steps.map((step, i) => `<label class="step check"><input type="checkbox" data-step="${i}" ${progress[i] ? 'checked' : ''}>
      <span><strong>Step ${i + 1}.</strong> ${escape(step)}</span></label>`).join('')}
    ${sourceList(guide.sources)}
    <p id="progress-status" role="status" class="muted"></p>
    <button id="reset">Reset progress</button></article>`;
  function update() {
    const count = guide.steps.filter((_, index) => progress[index]).length;
    status('count', `${count} of ${guide.steps.length} steps completed`);
    byId('bar').value = count;
  }
  byId('bar').setAttribute('aria-label', 'Guide progress');
  byId('back').onclick = () => show('guides', null, true);
  byId('reset').onclick = () => {
    if (save(progressKey, {})) {
      renderGuide(guide);
      byId('reset').focus();
    } else status('progress-status', 'Progress could not be reset.');
  };
  for (const box of main.querySelectorAll('[data-step]')) {
    box.onchange = () => {
      progress[box.dataset.step] = box.checked;
      status('progress-status', save(progressKey, progress) ? '' : 'Progress could not be saved on this device.');
      update();
    };
  }
  update();
}

function renderNotes() {
  notesDraft ??= load('field-notes', '');
  main.innerHTML = `<div class="card"><h2 tabindex="-1">Field Notes</h2>
    <p>Notes are saved in this browser. Export a text backup to keep a separate copy.</p>
    <label for="note">Notebook</label><textarea id="note" rows="12"></textarea>
    <div class="row"><button class="primary" id="save">Save notes</button>
    <button id="export">Export text</button>
    <button id="import">Import text</button></div>
    <input type="file" id="note-file" accept=".txt,text/plain" hidden>
    <p id="note-status" role="status" class="muted"></p></div>`;
  const field = byId('note');
  field.value = notesDraft;
  function persist() {
    notesDraft = field.value;
    const saved = save('field-notes', notesDraft);
    status('note-status', saved ? 'Saved on this device.' : 'Could not save. Export the draft to keep a copy.');
  }
  field.oninput = persist;
  byId('save').onclick = persist;
  byId('export').onclick = () => {
    const url = URL.createObjectURL(new Blob([field.value], { type: 'text/plain' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'dismis-field-notes.txt';
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  const picker = byId('note-file');
  byId('import').onclick = () => picker.click();
  picker.onchange = async () => {
    const file = picker.files[0];
    picker.value = '';
    if (!file) return;
    if (file.size > 1024 * 1024) return status('note-status', 'Choose a text file under 1 MB.');
    try {
      const imported = await file.text();
      field.value += (field.value && imported ? '\n\n' : '') + imported;
      if (activeView === 'notes' && byId('note') === field) persist();
      else {
        notesDraft += (notesDraft && imported ? '\n\n' : '') + imported;
        save('field-notes', notesDraft);
        if (activeView === 'notes') renderNotes();
      }
    } catch {
      if (activeView === 'notes') status('note-status', 'Could not read the text file.');
    }
  };
}

function renderAbout() {
  main.innerHTML = `<div class="card">
    <h2 tabindex="-1">Offline &amp; Integrations</h2>
    <p>Open the app online once, wait for offline setup, then check below before going out of coverage. Reference summaries are included in the offline copy.</p>
    <button id="offline">Check offline readiness</button><p id="offline-status" role="status"></p>
    <h3>Integration availability</h3><ul>
      ${[['localAI', 'Local AI'], ['meshtastic', 'Meshtastic'], ['hardware', 'D.I.S.M.I.S. hardware']]
        .map(([key, label]) => `<li>${label} · ${integrations.get(key) ? 'Provider registered' : 'Planned'}</li>`).join('')}
    </ul></div>`;
  byId('offline').onclick = async () => {
    const output = byId('offline-status');
    output.textContent = 'Checking offline files…';
    try {
      const registration = await offlineRegistration;
      const worker = registration && navigator.serviceWorker.controller;
      if (!worker) {
        output.textContent = registration ? 'Offline setup is pending. Check again after reloading online.' :
          'Offline caching is unavailable here. Open the site over HTTPS or localhost.';
        return;
      }
      const channel = new MessageChannel();
      const timer = setTimeout(() => {
        channel.port1.close();
        output.textContent = 'The offline check timed out. Reload online and try again.';
      }, 3000);
      channel.port1.onmessage = event => {
        clearTimeout(timer);
        channel.port1.close();
        output.textContent = event.data === true ? 'Ready for offline use.' : 'Some offline files are missing.';
      };
      worker.postMessage('offline-status', [channel.port2]);
    } catch {
      output.textContent = 'Could not check offline readiness.';
    }
  };
}

async function loadCatalog() {
  catalogLoad = 'loading';
  render();
  try {
    const data = await Promise.all(['guides', 'references'].map(async name => {
      const response = await fetch(`./${name}.json`);
      if (!response.ok) throw new Error(name);
      return response.json();
    }));
    [catalog.guides, catalog.references] = data;
    catalogLoad = 'ready';
  } catch {
    catalogLoad = 'error';
  }
  if (activeView === 'guides' || activeView === 'references') render();
}

nav.addEventListener('click', event => {
  const view = event.target.closest('[data-view]')?.dataset.view;
  if (view) show(view, null, true);
});
main.addEventListener('click', event => {
  const id = event.target.closest('[data-guide]')?.dataset.guide;
  if (id) {
    show('guides', id, true);
    window.scrollTo(0, 0);
  }
});
loadCatalog();
