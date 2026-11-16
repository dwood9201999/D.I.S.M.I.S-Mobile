import { alphabet, encode, decode, audioTimeline } from './morse-core.js';
import { installOffline } from './offline-assets.js';

const trainerHTML = `<h2 tabindex="-1">Morse Code · Offline Trainer</h2><p>International Morse code uses a short signal (dot) and a long signal (dash). A dash lasts three dot units. Gaps are one unit within a character, three units between characters, and seven units between words.</p>
<section class="card"><h2>Encode a message</h2><label for="plain">Text</label><textarea id="plain" maxlength="120">SOS HELP</textarea><p id="encoded" class="output" aria-live="polite"></p><label for="speed">Audio speed (words per minute)</label><input id="speed" type="number" min="5" max="30" value="11"><div class="row"><button id="copy" class="primary">Copy Morse</button><button id="sound">Play audio</button><button id="stop">Stop</button></div><p id="status" class="muted" role="status"></p></section>
<section class="card"><h2>Decode Morse</h2><p class="muted">Separate letters with spaces and words with /</p><label for="coded">Morse</label><textarea id="coded" maxlength="1000">... --- ... / .... . .-.. .--.</textarea><p id="decoded" class="output" aria-live="polite"></p></section>
<section class="card"><h2>Listening practice</h2>
<p>Listen for one character at the selected audio speed, then type what you heard.</p>
<div class="row"><button id="new-drill">New character</button><button id="replay" disabled>Replay</button></div>
<form id="drill-form"><label for="guess">Your answer</label><input id="guess" maxlength="1" autocomplete="off" autocapitalize="characters" required>
<button id="check" disabled>Check answer</button><button id="reveal" type="button" disabled>Reveal</button></form>
<p id="drill-status" role="status"></p></section>
<section class="card"><h2>Alphabet and numbers</h2><div id="alphabet" class="grid"></div></section>
<section class="card"><h2>Distress signaling and safety</h2><p>SOS is <strong>...---...</strong>, a continuous distress signal with no ordinary letter gaps. The text “SOS” in the encoder plays three separate letters for practice. Use recognized emergency channels and established emergency services when available. A phone screen or flashlight may help signal visually, but visibility and detection are not guaranteed.</p><p>This tool teaches Morse encoding and audio timing; it does not transmit radio signals. Transmitting on radio frequencies may require compliant equipment and licensing.</p></section>`;

export function mountMorseTrainer(root) {
  root.innerHTML = '<div class="morse">' + trainerHTML + '</div>';
  const byId = id => root.querySelector('#' + id);
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

  return () => {
    stop();
    window.removeEventListener('pagehide', stop);
  };
}

const standalone = document.querySelector('#morse-standalone');
if (standalone) {
  installOffline();
  mountMorseTrainer(standalone);
}
