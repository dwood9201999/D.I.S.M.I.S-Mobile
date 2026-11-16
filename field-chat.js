const stopWords = new Set('a an and are as at be been but by can could did do does for from get got had have how i if in is it me my of on or out should so some that the their them there these this to use using was what when where which who will with would you your'.split(' '));

function tokens(text) {
  return new Set((text.toLowerCase().match(/[\p{L}\p{N}]+/gu) ?? [])
    .filter(word => !stopWords.has(word))
    .map(word => word.length > 4 ? word.replace(/s$/, '') : word));
}

const aliases = {
  g10: 'solar battery station photovoltaic charging charge controller',
  g11: 'bike bicycle pedal pedal-powered motor dynamo generator',
  g12: 'wind water turbine hydro hydropower renewable generation',
  g19: 'motor DC brushed toy fan salvage shaft multimeter voltage',
  'radio-crank-kit': 'hand crank dynamo emergency receiver power',
  'radio-crystal-loop': 'AM crystal radio earpiece diode tuning capacitor',
  'radio-weather-alerts': 'NOAA weather alert storms SAME WX',
  'radio-walkie-talkies': 'walkie talkie FRS GMRS handheld radio check in',
};

export function findFieldAnswers(catalog, question, electrical, parts) {
  const terms = tokens(question);
  if (!terms.size) return [];
  return [...catalog.guides, ...catalog.references].map(entry => {
    const componentIds = electrical[entry.id]?.parts ?? [];
    const names = componentIds.map(id => parts[id][0]);
    const headings = tokens([entry.title, ...(entry.keywords ?? []), aliases[entry.id] ?? ''].join(' '));
    const partTerms = tokens(names.join(' '));
    const passages = tokens([entry.overview, ...(entry.steps ?? []), ...(entry.points ?? [])].join(' '));
    let score = 0;
    for (const term of terms) {
      if (headings.has(term)) score += 5;
      else if (partTerms.has(term)) score += 2;
      else if (passages.has(term)) score += 1;
    }
    const part = componentIds.find(id => [...tokens(parts[id][0])].some(term => terms.has(term)));
    return { entry, score, part };
  }).filter(result => result.score >= 4)
    .sort((first, second) => second.score - first.score)
    .slice(0, 3);
}
