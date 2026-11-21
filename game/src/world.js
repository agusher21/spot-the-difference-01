// World — builds drawable element lists per scene from config
// Handles difference application to create Original and Changed panels.

import { SCENES, DIFFS_PER_SCENE } from './config.js';
import { rng } from './random.js';

export class World {
  constructor(sceneIndex) {
    this.scene = SCENES[sceneIndex];
    this.sceneIndex = sceneIndex;
    this.originalProps = [];
    this.changedProps = [];
    this.diffZones = []; // hit-test zones for each difference
    this.build();
  }

  build() {
    // Deep clone base props for both panels
    this.originalProps = this.scene.props.map(p => ({ ...p }));
    this.changedProps = this.scene.props.map(p => ({ ...p }));

    // Apply differences to create the Changed panel
    this.diffZones = [];
    this.scene.diffs.forEach((diff, idx) => {
      const zone = this.applyDifference(diff, idx);
      this.diffZones.push(zone);
    });
  }

  applyDifference(diff, diffIndex) {
    const panel = diff.panel === 0 ? this.originalProps : this.changedProps;
    const otherPanel = diff.panel === 0 ? this.changedProps : this.originalProps;

    let zone = { diffIndex, type: diff.type, panel: diff.panel, bounds: null, propRef: null };

    switch (diff.type) {
      case 'remove': {
        const prop = panel[diff.propIndex];
        if (prop) {
          zone.bounds = this.computePropBounds(prop);
          zone.propRef = { panel: diff.panel, index: diff.propIndex, original: { ...prop } };
          prop._removed = true;
        }
        break;
      }
      case 'recolour': {
        const prop = panel[diff.propIndex];
        if (prop && diff.detail) {
          zone.bounds = this.computePropBounds(prop);
          zone.propRef = { panel: diff.panel, index: diff.propIndex, original: { ...prop } };
          Object.assign(prop, diff.detail);
        }
        break;
      }
      case 'move': {
        const prop = panel[diff.propIndex];
        if (prop && diff.detail) {
          zone.bounds = this.computePropBounds(prop);
          zone.propRef = { panel: diff.panel, index: diff.propIndex, original: { ...prop } };
          prop.x = (prop.x + diff.detail.dx);
          prop.y = (prop.y + diff.detail.dy);
        }
        break;
      }
      case 'resize': {
        const prop = panel[diff.propIndex];
        if (prop && diff.detail) {
          zone.bounds = this.computePropBounds(prop);
          zone.propRef = { panel: diff.panel, index: diff.propIndex, original: { ...prop } };
          prop.scale = diff.detail.scale;
        }
        break;
      }
      case 'flip': {
        const prop = panel[diff.propIndex];
        if (prop && diff.detail) {
          zone.bounds = this.computePropBounds(prop);
          zone.propRef = { panel: diff.panel, index: diff.propIndex, original: { ...prop } };
          if (diff.detail.horizontal) prop.flippedH = true;
          if (diff.detail.vertical) prop.flippedV = true;
        }
        break;
      }
      case 'add': {
        const newProp = { ...diff.detail, _added: true };
        const insertIndex = panel.length;
        panel.push(newProp);
        zone.bounds = this.computePropBounds(newProp);
        zone.propRef = { panel: diff.panel, index: insertIndex, original: null };
        break;
      }
    }

    // Expand zone bounds slightly for easier clicking
    if (zone.bounds) {
      zone.bounds = {
        x: zone.bounds.x - 12,
        y: zone.bounds.y - 12,
        w: zone.bounds.w + 24,
        h: zone.bounds.h + 24,
      };
    }

    return zone;
  }

  computePropBounds(prop) {
    // Returns approximate bounds in normalized coordinates (0-1)
    const baseSize = this.getPropBaseSize(prop.type);
    const scale = prop.scale || 1;
    const w = baseSize.w * scale;
    const h = baseSize.h * scale;
    return {
      x: prop.x - w / 2,
      y: prop.y - h / 2,
      w,
      h,
    };
  }

  getPropBaseSize(type) {
    const sizes = {
      oak: { w: 0.35, h: 0.5 },
      tent: { w: 0.2, h: 0.25 },
      pond: { w: 0.3, h: 0.15 },
      fence: { w: 0.25, h: 0.12 },
      mushroom: { w: 0.08, h: 0.1 },
      butterfly: { w: 0.06, h: 0.05 },
      flower: { w: 0.06, h: 0.07 },
      dew: { w: 0.02, h: 0.02 },
      lake: { w: 0.35, h: 0.18 },
      blanket: { w: 0.18, h: 0.12 },
      basket: { w: 0.08, h: 0.06 },
      kite: { w: 0.12, h: 0.15 },
      bee: { w: 0.03, h: 0.02 },
      cloud: { w: 0.15, h: 0.08 },
      campfire: { w: 0.12, h: 0.15 },
      lantern: { w: 0.05, h: 0.08 },
      firefly: { w: 0.015, h: 0.015 },
      star: { w: 0.01, h: 0.01 },
      owl: { w: 0.06, h: 0.08 },
    };
    return sizes[type] || { w: 0.1, h: 0.1 };
  }

  // Get props for rendering (filter out removed)
  getPropsForPanel(panel) {
    return panel.filter(p => !p._removed);
  }

  // Get diff zones in canvas coordinates
  getDiffZones(canvasW, canvasH) {
    return this.diffZones.map(zone => {
      if (!zone.bounds) return null;
      return {
        ...zone,
        bounds: {
          x: zone.bounds.x * canvasW,
          y: zone.bounds.y * canvasH,
          w: zone.bounds.w * canvasW,
          h: zone.bounds.h * canvasH,
        },
      };
    }).filter(z => z !== null);
  }
}

// Build world for a specific scene with optional pre-found differences (for screenshots)
export function buildWorld(sceneIndex, foundIndices = []) {
  const world = new World(sceneIndex);
  return {
    scene: world.scene,
    originalProps: world.getPropsForPanel(world.originalProps),
    changedProps: world.getPropsForPanel(world.changedProps),
    diffZones: world.getDiffZones(1, 1), // normalized, will scale at render time
    foundIndices,
  };
}