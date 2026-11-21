// Shots — deterministic screenshot presets
// Reads URL params ?scene=<0|1|2>&found=<n> and pre-marks first n differences as found.
// Also supports ?shot=cover|dawn|noon|dusk as shorthand.

import { SCENES, DIFFS_PER_SCENE } from './config.js';
import { buildWorld } from './world.js';

// Shot presets matching the required screenshots
export const SHOT_PRESETS = {
  cover: { scene: 2, found: 3, name: '1-cover.jpg' },    // Dusk, 3 of 7 found
  dawn: { scene: 0, found: 2, name: '2-dawn.jpg' },      // Dawn, 2 of 7 found
  noon: { scene: 1, found: 4, name: '3-noon.jpg' },      // Noon, 4 of 7 found
  dusk: { scene: 2, found: 5, name: '4-dusk.jpg' },      // Dusk, 5 of 7 found
};

// Apply shot preset from URL params
export function applyShotPreset() {
  const params = new URLSearchParams(window.location.search);

  // Check for shorthand ?shot= preset
  if (params.has('shot')) {
    const shot = params.get('shot');
    const preset = SHOT_PRESETS[shot];
    if (preset) {
      params.set('scene', preset.scene.toString());
      params.set('found', preset.found.toString());
      // Update URL without reload
      window.history.replaceState({}, '', `${window.location.pathname}?${params.toString()}`);
      return preset;
    }
  }

  // Check for explicit ?scene=&found=
  if (params.has('scene') && params.has('found')) {
    const scene = parseInt(params.get('scene'), 10);
    const found = parseInt(params.get('found'), 10);
    if (scene >= 0 && scene < SCENES.length && found >= 0 && found <= DIFFS_PER_SCENE) {
      return { scene, found, name: `scene-${scene}-found-${found}.jpg` };
    }
  }

  return null;
}

// Get world with pre-marked differences for screenshots
export function getShotWorld() {
  const preset = applyShotPreset();
  if (preset) {
    const foundIndices = Array.from({ length: preset.found }, (_, i) => i);
    return buildWorld(preset.scene, foundIndices);
  }
  return null;
}

// List all shot presets for shots.json generation
export function listShotPresets() {
  return Object.entries(SHOT_PRESETS).map(([key, value]) => ({
    name: value.name,
    query: `?shot=${key}`,
  }));
}