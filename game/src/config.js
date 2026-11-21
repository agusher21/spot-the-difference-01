// Firefly Hollow — Spot the Difference — Scene Configuration
// All data-driven: palettes, props, and 7 differences per scene.

const SCENE_COUNT = 3;
const DIFFS_PER_SCENE = 7;
const SCENE_TIME_MS = 3 * 60 * 1000; // 3:00 per scene
const HEARTS_PER_SCENE = 3;
const HINTS_PER_SCENE = 3;
const SCORE_PER_FIND = 100;
const STREAK_BONUS = 50; // per consecutive find
const WRONG_CLICK_PENALTY_MS = 5000;
const HINT_PULSE_MS = 2000;

// Scene definitions: 0=Dawn Meadow, 1=Noon Picnic, 2=Dusk Campfire
const SCENES = [
  {
    id: 0,
    name: 'Dawn Meadow',
    palette: {
      skyTop: '#ffdab9',      // pale peach
      skyBottom: '#fff8dc',   // cornsilk
      sun: '#ffeb3b',
      hillFar: '#8fbc8f',
      hillNear: '#556b2f',
      ground: '#deb887',
      oakTrunk: '#8b4513',
      oakLeaves: '#6b8e23',
      tent: '#d2691e',
      pond: '#87ceeb',
      fence: '#a0522d',
      flower1: '#ff69b4',
      flower2: '#ffb6c1',
      mushroom: '#d2691e',
      butterfly: '#ffa500',
      dew: '#ffffff',
      label: '#1a1a2e',
    },
    props: [
      { type: 'oak', x: 0.72, y: 0.58, scale: 1.0 },
      { type: 'tent', x: 0.18, y: 0.62, scale: 0.9 },
      { type: 'pond', x: 0.45, y: 0.75, scale: 1.0 },
      { type: 'fence', x: 0.05, y: 0.55, scale: 1.0, count: 8 },
      { type: 'mushroom', x: 0.25, y: 0.78, scale: 0.7 },
      { type: 'mushroom', x: 0.35, y: 0.82, scale: 0.5 },
      { type: 'butterfly', x: 0.60, y: 0.35, scale: 0.6, angle: -0.3 },
      { type: 'flower', x: 0.12, y: 0.80, scale: 0.8, variant: 0 },
      { type: 'flower', x: 0.20, y: 0.83, scale: 0.6, variant: 1 },
      { type: 'flower', x: 0.55, y: 0.85, scale: 0.7, variant: 0 },
      { type: 'flower', x: 0.65, y: 0.82, scale: 0.5, variant: 1 },
      { type: 'dew', x: 0.30, y: 0.70, scale: 0.3 },
      { type: 'dew', x: 0.40, y: 0.68, scale: 0.2 },
      { type: 'dew', x: 0.50, y: 0.72, scale: 0.25 },
    ],
    diffs: [
      // Each diff: { type, panel, propIndex, detail }
      // panel: 0=Original (left), 1=Changed (right)
      // type: 'remove' | 'recolour' | 'move' | 'resize' | 'flip' | 'add'
      { type: 'remove', panel: 1, propIndex: 2 },  // pond removed
      { type: 'recolour', panel: 1, propIndex: 0, detail: { oakLeaves: '#98fb98' } },  // oak leaves lighter
      { type: 'move', panel: 1, propIndex: 1, detail: { dx: -0.08, dy: 0.02 } },  // tent shifted left
      { type: 'resize', panel: 1, propIndex: 4, detail: { scale: 1.3 } },  // mushroom larger
      { type: 'flip', panel: 1, propIndex: 6, detail: { horizontal: true } },  // butterfly flipped
      { type: 'add', panel: 1, detail: { type: 'flower', x: 0.82, y: 0.78, scale: 0.7, variant: 0 } },  // extra flower
      { type: 'recolour', panel: 1, propIndex: 3, detail: { fence: '#8b4513' } },  // fence darker
    ],
  },
  {
    id: 1,
    name: 'Noon Picnic',
    palette: {
      skyTop: '#87ceeb',
      skyBottom: '#e0ffff',
      sun: '#ffd700',
      hillFar: '#98fb98',
      hillNear: '#3cb371',
      ground: '#f5deb3',
      oakTrunk: '#8b4513',
      oakLeaves: '#228b22',
      blanket: '#ff6347',
      basket: '#8b4513',
      kite: '#ff4500',
      lake: '#4682b4',
      cloud: '#ffffff',
      bee: '#ffd700',
      label: '#1a1a2e',
    },
    props: [
      { type: 'oak', x: 0.25, y: 0.52, scale: 1.1 },
      { type: 'lake', x: 0.60, y: 0.70, scale: 1.0 },
      { type: 'blanket', x: 0.42, y: 0.68, scale: 1.0 },
      { type: 'basket', x: 0.38, y: 0.72, scale: 0.6 },
      { type: 'kite', x: 0.80, y: 0.25, scale: 0.8, angle: 0.4 },
      { type: 'bee', x: 0.55, y: 0.40, scale: 0.4, angle: 0.2 },
      { type: 'bee', x: 0.65, y: 0.35, scale: 0.35, angle: -0.1 },
      { type: 'cloud', x: 0.15, y: 0.15, scale: 1.0 },
      { type: 'cloud', x: 0.70, y: 0.10, scale: 0.8 },
      { type: 'flower', x: 0.10, y: 0.82, scale: 0.7, variant: 0 },
      { type: 'flower', x: 0.18, y: 0.85, scale: 0.6, variant: 1 },
      { type: 'flower', x: 0.85, y: 0.80, scale: 0.7, variant: 0 },
    ],
    diffs: [
      { type: 'remove', panel: 1, propIndex: 4 },  // kite removed
      { type: 'recolour', panel: 1, propIndex: 2, detail: { blanket: '#32cd32' } },  // blanket green
      { type: 'move', panel: 1, propIndex: 3, detail: { dx: 0.06, dy: -0.03 } },  // basket moved
      { type: 'resize', panel: 1, propIndex: 0, detail: { scale: 0.85 } },  // oak smaller
      { type: 'flip', panel: 1, propIndex: 5, detail: { horizontal: true } },  // bee flipped
      { type: 'add', panel: 1, detail: { type: 'cloud', x: 0.40, y: 0.20, scale: 0.7 } },  // extra cloud
      { type: 'recolour', panel: 1, propIndex: 1, detail: { lake: '#5f9ea0' } },  // lake different blue
    ],
  },
  {
    id: 2,
    name: 'Dusk Campfire',
    palette: {
      skyTop: '#1a1a4e',
      skyBottom: '#2d2d6b',
      moon: '#f5f5dc',
      star: '#ffffff',
      hillFar: '#2f4f4f',
      hillNear: '#1c3b3b',
      ground: '#2f2f2f',
      oakTrunk: '#3d2b1f',
      oakLeaves: '#2e4d2e',
      tent: '#1a1a1a',
      campfire: '#ff4500',
      spark: '#ffd700',
      lantern: '#ffa500',
      firefly: '#adff2f',
      mushroom: '#9acd32',
      owl: '#696969',
      label: '#e8e8f0',
    },
    props: [
      { type: 'oak', x: 0.75, y: 0.55, scale: 1.0 },
      { type: 'tent', x: 0.15, y: 0.60, scale: 0.9 },
      { type: 'campfire', x: 0.42, y: 0.72, scale: 1.0 },
      { type: 'lantern', x: 0.30, y: 0.65, scale: 0.5 },
      { type: 'lantern', x: 0.55, y: 0.68, scale: 0.5 },
      { type: 'firefly', x: 0.20, y: 0.45, scale: 0.3 },
      { type: 'firefly', x: 0.35, y: 0.40, scale: 0.25 },
      { type: 'firefly', x: 0.60, y: 0.38, scale: 0.3 },
      { type: 'firefly', x: 0.70, y: 0.42, scale: 0.2 },
      { type: 'mushroom', x: 0.22, y: 0.78, scale: 0.7 },
      { type: 'mushroom', x: 0.48, y: 0.82, scale: 0.6 },
      { type: 'owl', x: 0.82, y: 0.30, scale: 0.6 },
      { type: 'star', x: 0.10, y: 0.12, scale: 1 },
      { type: 'star', x: 0.25, y: 0.08, scale: 1 },
      { type: 'star', x: 0.60, y: 0.15, scale: 1 },
      { type: 'star', x: 0.85, y: 0.10, scale: 1 },
      { type: 'star', x: 0.40, y: 0.05, scale: 1 },
    ],
    diffs: [
      { type: 'remove', panel: 1, propIndex: 11 },  // owl removed
      { type: 'recolour', panel: 1, propIndex: 2, detail: { campfire: '#ff8c00' } },  // campfire orange
      { type: 'move', panel: 1, propIndex: 0, detail: { dx: 0.05, dy: -0.02 } },  // oak moved
      { type: 'resize', panel: 1, propIndex: 9, detail: { scale: 1.4 } },  // mushroom larger
      { type: 'flip', panel: 1, propIndex: 3, detail: { horizontal: true } },  // lantern flipped
      { type: 'add', panel: 1, detail: { type: 'firefly', x: 0.90, y: 0.50, scale: 0.3 } },  // extra firefly
      { type: 'recolour', panel: 1, propIndex: 10, detail: { mushroom: '#7fff00' } },  // mushroom bright green
    ],
  },
];

// Shared constants
const CANVAS_W = 600;
const CANVAS_H = 400;
const PANEL_GAP = 20;
const HUD_HEIGHT = 80;
const RING_COLOR = '#ffeb3b'; // bright yellow
const RING_COLOR_FOUND = '#4caf50'; // green
const RING_RADIUS = 28;
const MAGNIFIER_RADIUS = 100;
const MAGNIFIER_ZOOM = 2;
const RETICLE_SIZE = 24;

// RNG seed (fixed for determinism)
const RNG_SEED = 0x46697265; // "Fire" in hex