import { readFileSync } from 'node:fs';

export const workerSource = readFileSync(new URL('../sw.js', import.meta.url), 'utf8');
export const offlineAssets = JSON.parse(workerSource.match(/const offlineAssets = (\[[\s\S]*?\]);/)[1]);
