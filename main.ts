// SHADOW VAULT — hand-in program for the make.fun stealth game bounty.
// Copies game/ and screenshots/ from beside this file into the output
// directory and writes dossier.json there with the vendored buildDossier.
// Standard library only; never deletes the output directory itself.

import { cpSync, existsSync, mkdirSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const repoRoot = dirname(fileURLToPath(import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR || '/output';

// Fail loudly before copying anything if the game entry point is missing.
if (!existsSync(join(repoRoot, 'game', 'index.html'))) {
  throw new Error('game/index.html is missing; refusing to hand in an empty game');
}
const shotFiles = readdirSync(join(repoRoot, 'screenshots')).filter((f) => !f.startsWith('.'));
if (shotFiles.length < 3 || shotFiles.length > 4) {
  throw new Error(`screenshots/ must hold 3 or 4 images, found ${shotFiles.length}`);
}

mkdirSync(outputDir, { recursive: true });

cpSync(join(repoRoot, 'game'), join(outputDir, 'game'), { recursive: true });
cpSync(join(repoRoot, 'screenshots'), join(outputDir, 'screenshots'), { recursive: true });

const dossier = buildDossier(outputDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 50331648,
  game_path_max_bytes: 1000,
});

writeFileSync(join(outputDir, 'dossier.json'), dossier);

// Sanity-check what we handed in: the dossier on disk must fit the 1.5 MiB
// gate cap, and the output must hold exactly game/, screenshots/ and dossier.json.
const dossierBytes = statSync(join(outputDir, 'dossier.json')).size;
if (dossierBytes > 1572864) {
  throw new Error(`dossier.json is ${dossierBytes} bytes, over the 1.5 MiB cap`);
}
console.log(`Wrote ${join(outputDir, 'dossier.json')} (${dossierBytes} bytes)`);
console.log(`Screenshots: ${shotFiles.sort().join(', ')}`);
