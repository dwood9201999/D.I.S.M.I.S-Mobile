import { alphabet, encode, decode, audioTimeline } from './morse-core.js';
import { installOffline } from './offline-assets.js';

installOffline();
const byId = id => document.getElementById(id);
const report = (id, text) => { byId(id).textContent = text; };
const characters = Object.keys(alphabet).filter(key => /^[A-Z0-9]$/.test(key));
let playback = null;
let challenge = null;

function refresh() {
  report('encoded', encode(byId('plain').value) || '—');
  report('decoded', decode(byId('coded').value) || '—');
}
byId('plain').oninput = byId('coded').oninput = refresh;
byId('alphabet').innerHTML = characters.map(key =>
  `<div class="cell"><strong>${key}</strong><code>${alphabet[key]}</code></div>`).join('');
refresh();

function stop() {
  if (!playback) return;
  clearTimeout(playback.timer);
  playback.context.close().catch(() => {});
  playback = null;
}

async function play(encoded) {
  stop();
  const pulses = audioTimeline(encoded);
  if (!pulses.length) return report('status', 'Enter some letters or numbers first.');
  const Audio = window.AudioContext || window.webkitAudioContext;
  if (!Audio) return report('status', 'Audio is unavailable in this browser.');
  let session;
  try {
    const context = new Audio();
    session = { context };
    playback = session;
    await context.resume();
    if (playback !== session) return;
    const wpm = Math.max(5, Math.min(30, byId('speed').valueAsNumber || 11));
    const unit = 1.2 / wpm;
    const start = context.currentTime + 0.05;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.frequency.value = 650;
    gain.gain.value = 0;
    oscillator.connect(gain).connect(context.destination);
    for (const pulse of pulses) {
      const on = start + pulse.start * unit;
      const off = on + pulse.length * unit;
      gain.gain.setValueAtTime(0, on);
      gain.gain.linearRampToValueAtTime(0.12, on + 0.004);
      gain.gain.setValueAtTime(0.12, off - 0.004);
      gain.gain.linearRampToValueAtTime(0, off);
    }
    const last = pulses.at(-1);
    const end = start + (last.start + last.length) * unit;
    oscillator.start(start);
    oscillator.stop(end);
    report('status', 'Playing Morse audio.');
    session.timer = setTimeout(() => {
      if (session !== playback) return;
      stop();
      report('status', 'Playback finished.');
    }, (end - context.currentTime) * 1000 + 60);
  } catch {
    if (session && playback !== session) return;
    stop();
    report('status', 'Audio could not start.');
  }
}

byId('sound').onclick = () => play(encode(byId('plain').value));
byId('stop').onclick = () => {
  stop();
  report('status', 'Stopped.');
};
window.addEventListener('pagehide', stop);
byId('copy').onclick = async () => {
  try {
    await navigator.clipboard.writeText(encode(byId('plain').value));
    report('status', 'Copied.');
  } catch {
    report('status', 'Copy unavailable. Select the output to copy it manually.');
  }
};

byId('new-drill').onclick = () => {
  const choices = characters.filter(char => char !== challenge);
  challenge = choices[Math.floor(Math.random() * choices.length)];
  for (const id of ['replay', 'check', 'reveal']) byId(id).disabled = false;
  byId('guess').value = '';
  byId('guess').focus();
  report('drill-status', 'Listen and enter your answer.');
  play(alphabet[challenge]);
};
byId('replay').onclick = () => play(alphabet[challenge]);
byId('drill-form').onsubmit = event => {
  event.preventDefault();
  if (!challenge) return;
  const correct = byId('guess').value.trim().toUpperCase() === challenge;
  report('drill-status', correct ? 'Correct.' : 'Try again or replay the character.');
};
byId('reveal').onclick = () => report('drill-status', `Answer: ${challenge} (${alphabet[challenge]}).`);
