const symbols = ['ET','IANM','SOUR','WDKG','HVFB','LPCJ','XZQY','12345','67890','ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'];
const words = ['TEA','SUN','MAP','RAIN','CAMP','WATER','RADIO','LIGHT','NORTH','SOUTH','SHELTER','BATTERY','SIGNAL','FOREST','SUPPLIES','COMPASS','LANTERN','TRAIL','BRIDGE','RIVER','CHECK','PACK','ROAD','CREEK','HILL','DRY','WARM','ROPE','FOOD','BOOTS','BEACON','CAUTION'];
const phrases = [
  'GO EAST','STAY HERE','PACK WATER','CHECK MAP','RADIO CHECK','KEEP WARM','USE THE MAP','FILL THE BOTTLE',
  'STAY ON TRAIL','TAKE THE NEXT LEFT','KEEP THE RADIO DRY','CHECK THE SPARE BATTERY',
  'MEET AT THE BRIDGE','MARK THE NORTH TRAIL','PACK FOOD FOR TWO DAYS','WAIT AT THE TRAIL SIGN',
  'THE WATER JUG IS FULL','CHECK THE RADIO AFTER SUNSET','KEEP A SPARE LIGHT IN THE BAG',
  'WE WILL CHECK IN BEFORE DARK','MEET AT THE CABIN AT NOON','TAKE THE ROAD PAST THE BRIDGE',
  'PUT THE WATER AND FOOD IN THE BAG','STOP AT THE SIGN AND CHECK THE MAP',
  'WE HAVE WATER AND FOOD FOR TWO DAYS','TAKE THE NORTH ROAD AND CALL AT NOON',
  'CHECK THE SPARE RADIO AND WRITE DOWN THE CHANNEL',
  'IF THE TRAIL IS BLOCKED RETURN TO THE CABIN',
  'PACK THE LIGHT AND RADIO BEFORE LEAVING THE HOUSE',
  'MEET AT THE BRIDGE AND WAIT FOR THE NEXT CHECK IN',
];
export const levels = Array.from({ length: 50 }, (_, i) => {
  if (i < 10) {
    const pool = symbols[i];
    return { title: i < 7 ? 'Letters' : i < 9 ? 'Numbers' : 'Letters and numbers',
      prompts: i === 9 ? ['E', 'K', 'Q', '2', '8', '0'] : [...pool] };
  }
  const bank = i < 25 ? words : phrases;
  const start = i < 25 ? (i - 10) * 2 : i - 25;
  return { title: i < 25 ? 'Words' : 'Phrases', prompts: bank.slice(start, start + 3) };
});

export function normalizeAnswer(text) {
  return text.trim().toUpperCase().replace(/\s+/g, ' ');
}

export function mountCourse(root, play, encode, stop) {
  const key = 'dismis-morse-course-unlocked';
  let unlocked = 1;
  try {
    const stored = Number(localStorage.getItem(key));
    if (Number.isInteger(stored) && stored >= 1 && stored <= 50) unlocked = stored;
  } catch { /* Training remains usable without persistent storage. */ }
  let level = unlocked;
  let round = 0;
  let complete = false;
  const select = root.querySelector('#course-level');
  const form = root.querySelector('#course-form');
  const answer = root.querySelector('#course-answer');
  const status = root.querySelector('#course-status');
  const signal = root.querySelector('#course-code');
  const reveal = root.querySelector('#course-show-code');
  const prompt = () => levels[level - 1].prompts[round];

  function render() {
    select.innerHTML = levels.map(({ title }, i) => `<option value="${i + 1}" ${i >= unlocked ? 'disabled' : ''}>Level ${i + 1} · ${title}</option>`).join('');
    select.value = level;
    root.querySelector('#course-round').textContent = `Round ${round + 1} of ${levels[level - 1].prompts.length}`;
    signal.hidden = true;
    signal.textContent = encode(prompt());
    reveal.textContent = 'Show written Morse';
    answer.value = '';
    answer.disabled = complete;
    root.querySelector('#course-check').disabled = complete;
    root.querySelector('#course-next').hidden = !complete || level === 50;
  }

  function selectLevel(value) {
    stop();
    level = value;
    round = 0;
    complete = false;
    status.textContent = '';
    render();
  }

  select.onchange = () => selectLevel(Number(select.value));
  root.querySelector('#course-next').onclick = () => selectLevel(level + 1);
  root.querySelector('#course-replay').onclick = () => play(encode(prompt()));
  reveal.onclick = () => {
    signal.hidden = !signal.hidden;
    reveal.textContent = signal.hidden ? 'Show written Morse' : 'Hide written Morse';
  };
  form.onsubmit = event => {
    event.preventDefault();
    if (complete) return;
    if (normalizeAnswer(answer.value) !== prompt()) {
      status.textContent = 'Try again. Replay the signal or show the written Morse.';
      return;
    }
    stop();
    if (round + 1 < levels[level - 1].prompts.length) {
      round++;
      status.textContent = 'Correct. Play the next signal when ready.';
    } else {
      complete = true;
      if (level < 50 && level === unlocked) {
        unlocked++;
        try { localStorage.setItem(key, String(unlocked)); } catch { /* Progress is available for this session. */ }
      }
      status.textContent = level === 50 ? 'Level 50 complete. You finished the course.' : `Level ${level} complete.`;
    }
    render();
  };
  render();
}
