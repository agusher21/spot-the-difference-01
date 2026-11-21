// main.ts — Entry point for make.fun submission
// Copies game/ and screenshots/ to MAKEFUN_OUTPUT_DIR and writes dossier.json
// Uses only Node stdlib: node:fs, node:path, node:url

import { copyFileSync, mkdirSync, readdirSync, statSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = process.env.MAKEFUN_OUTPUT_DIR || '/output';

function copyDir(src: string, dest: string): void {
  mkdirSync(dest, { recursive: true });
  for (const entry of readdirSync(src, { withFileTypes: true })) {
    const srcPath = join(src, entry.name);
    const destPath = join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else if (entry.isFile()) {
      copyFileSync(srcPath, destPath);
    }
  }
}

function main(): void {
  const repoRoot = __dirname;
  const gameSrc = join(repoRoot, 'game');
  const shotsSrc = join(repoRoot, 'screenshots');
  const gameDest = join(OUTPUT_DIR, 'game');
  const shotsDest = join(OUTPUT_DIR, 'screenshots');

  // Copy game/ and screenshots/ to output
  copyDir(gameSrc, gameDest);
  copyDir(shotsSrc, shotsDest);

  // Build and write dossier.json
  const dossierBytes = buildDossier(OUTPUT_DIR, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    game_max_files: 993,
    game_max_bytes: 50331648,
    game_path_max_bytes: 1000,
  });

  writeFileSync(join(OUTPUT_DIR, 'dossier.json'), Buffer.from(dossierBytes));
}

main();