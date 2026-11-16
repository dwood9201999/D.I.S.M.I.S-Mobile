export const alphabet = Object.freeze({
  A: '.-', B: '-...', C: '-.-.', D: '-..', E: '.', F: '..-.', G: '--.',
  H: '....', I: '..', J: '.---', K: '-.-', L: '.-..', M: '--', N: '-.',
  O: '---', P: '.--.', Q: '--.-', R: '.-.', S: '...', T: '-', U: '..-',
  V: '...-', W: '.--', X: '-..-', Y: '-.--', Z: '--..',
  0: '-----', 1: '.----', 2: '..---', 3: '...--', 4: '....-', 5: '.....',
  6: '-....', 7: '--...', 8: '---..', 9: '----.',
  '.': '.-.-.-', ',': '--..--', '?': '..--..', '/': '-..-.', '=': '-...-',
});
const reverse = new Map(Object.entries(alphabet).map(([key, value]) => [value, key]));

export function encode(text) {
  return text.toUpperCase().trim().split(/\s+/)
    .map(word => [...word].map(char => alphabet[char] ?? '').filter(Boolean).join(' '))
    .filter(Boolean).join(' / ');
}

export function decode(text) {
  return text.trim().split('/').map(word => word.trim()).filter(Boolean)
    .map(word => word.split(/\s+/).map(code => reverse.get(code) ?? '�').join('')).join(' ');
}

export function audioTimeline(encoded) {
  const pulses = [];
  let start = 0;
  let gap = 0;
  for (const token of encoded.trim().split(/\s+/)) {
    if (token === '/') {
      gap = 7;
      continue;
    }
    if (!/^[.-]+$/.test(token)) continue;
    start += gap;
    for (const symbol of token) {
      const length = symbol === '-' ? 3 : 1;
      pulses.push({ start, length });
      start += length + 1;
    }
    start--;
    gap = 3;
  }
  return pulses;
}
