import { alphabet, encode, decode, audioTimeline } from './morse-core.js';
import { installOffline } from './offline-assets.js';

const trainerHTML = `<h2 tabindex="-1">Morse Code · Offline Trainer</h2><p>International Morse code uses a short signal (dot) and a long signal (dash). A dash lasts three dot units. Gaps are one unit within a character, three units between characters, and seven units between words.</p>
<section class="card"><h2>Encode a message</h2><label for="plain">Text</label><textarea id="plain" maxlength="120">SOS HELP</textarea><p id="encoded" class="output" aria-live="polite"></p><label for="speed">Signal speed (words per minute)</label><input id="speed" type="number" min="5" max="30" value="11">
<label for="signal-mode">Playback mode</label><select id="signal-mode">
<option value="audio">Sound only</option><option value="light">Screen light only</option><option value="both">Sound and screen light</option>
</select>
<p class="morse-signal" id="signal-panel" hidden><span id="signal-light" class="signal-light" aria-hidden="true"></span><span>Screen signal</span></p>
<div class="row"><button id="copy" class="primary">Copy Morse</button><button id="sound">Play audio</button><button id="stop">Stop</button></div><p id="status" class="muted" role="status"></p></section>
<section class="card"><h2>Decode Morse</h2><p class="muted">Separate letters with spaces and words with /</p><label for="coded">Morse</label><textarea id="coded" maxlength="1000">... --- ... / .... . .-.. .--.</textarea><p id="decoded" class="output" aria-live="polite"></p></section>
<section class="card"><h2>Signal practice</h2>
<p>Listen or watch for one character, then type what you recognized.</p>
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
  const light = byId('signal-light');
  const mode = byId('signal-mode');
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
    cancelAnimationFrame(playback.frame);
    playback.context?.close().catch(() => {});
    light.classList.remove('is-lit');
    playback = null;
  }

  async function play(encoded) {
    stop();
    const pulses = audioTimeline(encoded);
    if (!pulses.length) return report('status', 'Enter some letters or numbers first.');
    const withLight = mode.value !== 'audio';
    const withAudio = mode.value !== 'light';
    const Audio = window.AudioContext || window.webkitAudioContext;
    if (withAudio && !Audio) return report('status', 'Audio is unavailable in this browser. Try screen light only.');
    const session = {};
    playback = session;
    try {
      if (withAudio) {
        session.context = new Audio();
        await session.context.resume();
        if (playback !== session) return;
      }
      const context = session.context;
      const wpm = Math.max(5, Math.min(30, byId('speed').valueAsNumber || 11));
      const unit = 1.2 / wpm;
      const now = () => context ? context.currentTime : performance.now() / 1000;
      const start = now() + 0.05;
      const last = pulses.at(-1);
      const end = start + (last.start + last.length) * unit;

      if (context) {
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
        oscillator.start(start);
        oscillator.stop(end);
      }

      if (withLight) {
        let index = 0;
        function paint() {
          if (session !== playback) return;
          const elapsed = (now() - start) / unit;
          while (index < pulses.length && elapsed >= pulses[index].start + pulses[index].length) index++;
          light.classList.toggle('is-lit', index < pulses.length && elapsed >= pulses[index].start);
          if (index < pulses.length) session.frame = requestAnimationFrame(paint);
        }
        session.frame = requestAnimationFrame(paint);
      }
      report('status', withLight ? (withAudio ? 'Playing Morse sound and light.' : 'Playing Morse light signal.') : 'Playing Morse audio.');
      session.timer = setTimeout(() => {
        if (session !== playback) return;
        stop();
        report('status', 'Playback finished.');
      }, (end - now()) * 1000 + 60);
    } catch {
      if (playback !== session) return;
      stop();
      report('status', 'Playback could not start. Try another playback mode.');
    }
  }

  mode.onchange = () => {
    stop();
    byId('signal-panel').hidden = mode.value === 'audio';
    byId('sound').textContent = { audio: 'Play audio', light: 'Play light', both: 'Play sound and light' }[mode.value];
    report('status', '');
  };
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
    report('drill-status', 'Watch or listen, then enter your answer.');
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
