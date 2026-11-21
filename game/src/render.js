// Render — all canvas drawing: sky, hills, props, panels, found rings, magnifier, HUD

class Renderer {
  constructor(canvas, hudCanvas) {
    this.canvas = canvas;
    this.hudCanvas = hudCanvas;
    this.ctx = canvas.getContext('2d');
    this.hudCtx = hudCanvas.getContext('2d');
    this.magnifierEnabled = false;
    this.mouseX = 0;
    this.mouseY = 0;
    this.hoverPanel = -1; // 0=left, 1=right, -1=none
  }

  setMagnifier(enabled) {
    this.magnifierEnabled = enabled;
  }

  setMousePos(x, y) {
    this.mouseX = x;
    this.mouseY = y;
    // Determine which panel mouse is over (accounting for HUD)
    const panelW = CANVAS_W;
    const panelH = CANVAS_H;
    const leftX = 0;
    const rightX = panelW + PANEL_GAP;
    const topY = HUD_HEIGHT;

    if (x >= leftX && x < leftX + panelW && y >= topY && y < topY + panelH) {
      this.hoverPanel = 0;
    } else if (x >= rightX && x < rightX + panelW && y >= topY && y < topY + panelH) {
      this.hoverPanel = 1;
    } else {
      this.hoverPanel = -1;
    }
  }

  // Main render entry
  render(state) {
    const { sceneIndex, world, found, hints, hearts, timer, score, streak, paused, gameState, hintActive, hintTarget } = state;

    this.clear();
    this.drawSceneBackground(world.scene);
    this.drawPanels(world, found, hintActive, hintTarget);
    this.drawFoundRings(world, found);
    this.drawLabels();
    if (this.magnifierEnabled && this.hoverPanel >= 0) {
      this.drawMagnifier(world, this.hoverPanel);
    }
    this.drawHUD({ sceneIndex, found, hints, hearts, timer, score, streak, paused, gameState });
  }

  clear() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.hudCtx.clearRect(0, 0, this.hudCanvas.width, this.hudCanvas.height);
  }

  drawSceneBackground(scene) {
    const p = scene.palette;
    const w = this.canvas.width;
    const h = this.canvas.height;
    const panelW = CANVAS_W;
    const panelH = CANVAS_H;
    const topY = HUD_HEIGHT;
    const sceneIndex = scene.id;

    // Draw background for both panels (same sky/hills)
    for (let panel = 0; panel < 2; panel++) {
      const baseX = panel * (panelW + PANEL_GAP);
      this.ctx.save();
      this.ctx.translate(baseX, topY);

      // Sky gradient
      const grad = this.ctx.createLinearGradient(0, 0, 0, panelH);
      grad.addColorStop(0, p.skyTop);
      grad.addColorStop(1, p.skyBottom);
      this.ctx.fillStyle = grad;
      this.ctx.fillRect(0, 0, panelW, panelH);

      // Sun/Moon
      this.drawCelestial(p, panelW, panelH, sceneIndex);

      // Far hills
      this.drawHills(p.hillFar, panelW, panelH, 0.7, 0.4);
      // Near hills
      this.drawHills(p.hillNear, panelW, panelH, 0.85, 0.55);

      // Ground
      this.ctx.fillStyle = p.ground;
      this.ctx.fillRect(0, panelH * 0.55, panelW, panelH * 0.45);

      this.ctx.restore();
    }
  }

  drawCelestial(p, w, h, sceneIndex) {
    if (sceneIndex === 2) { // Dusk - moon
      this.ctx.fillStyle = p.moon;
      this.ctx.beginPath();
      this.ctx.arc(w * 0.85, h * 0.15, 30, 0, Math.PI * 2);
      this.ctx.fill();
      // Stars
      this.ctx.fillStyle = p.star;
      for (let i = 0; i < 50; i++) {
        const sx = (i * 37 + 13) % w;
        const sy = (i * 29 + 7) % (h * 0.5);
        const size = (i % 3) + 1;
        this.ctx.beginPath();
        this.ctx.arc(sx, sy, size, 0, Math.PI * 2);
        this.ctx.fill();
      }
    } else { // Dawn/Noon - sun
      this.ctx.fillStyle = p.sun;
      this.ctx.beginPath();
      this.ctx.arc(w * 0.85, h * 0.15, 40, 0, Math.PI * 2);
      this.ctx.fill();
      // Sun rays
      this.ctx.strokeStyle = p.sun;
      this.ctx.lineWidth = 2;
      for (let i = 0; i < 12; i++) {
        const angle = (i / 12) * Math.PI * 2;
        const x1 = w * 0.85 + Math.cos(angle) * 45;
        const y1 = h * 0.15 + Math.sin(angle) * 45;
        const x2 = w * 0.85 + Math.cos(angle) * 60;
        const y2 = h * 0.15 + Math.sin(angle) * 60;
        this.ctx.beginPath();
        this.ctx.moveTo(x1, y1);
        this.ctx.lineTo(x2, y2);
        this.ctx.stroke();
      }
    }
  }

  drawHills(color, w, h, yBase, height) {
    this.ctx.fillStyle = color;
    this.ctx.beginPath();
    this.ctx.moveTo(0, h * yBase);
    for (let x = 0; x <= w; x += 20) {
      const y = h * yBase + Math.sin(x * 0.02) * h * 0.05 + Math.sin(x * 0.05) * h * 0.03;
      this.ctx.lineTo(x, y);
    }
    this.ctx.lineTo(w, h);
    this.ctx.lineTo(0, h);
    this.ctx.closePath();
    this.ctx.fill();
  }

  drawPanels(world, found, hintActive, hintTarget) {
    const panelW = CANVAS_W;
    const panelH = CANVAS_H;
    const topY = HUD_HEIGHT;

    for (let panel = 0; panel < 2; panel++) {
      const baseX = panel * (panelW + PANEL_GAP);
      this.ctx.save();
      this.ctx.translate(baseX, topY);

      // Draw props for this panel
      const props = panel === 0 ? world.originalProps : world.changedProps;
      props.forEach(prop => this.drawProp(prop, world.scene.palette));

      // Highlight hint target
      if (hintActive && hintTarget !== null && hintTarget.panel === panel) {
        const zone = world.diffZones[hintTarget.diffIndex];
        if (zone && zone.bounds) {
          const b = zone.bounds;
          const cx = b.x * panelW + b.w / 2;
          const cy = b.y * panelH + b.h / 2;
          const pulse = (Date.now() % 1000) / 1000;
          const radius = RING_RADIUS * (1 + pulse * 0.3);
          this.ctx.strokeStyle = '#ffeb3b';
          this.ctx.lineWidth = 4;
          this.ctx.globalAlpha = 0.8 - pulse * 0.4;
          this.ctx.beginPath();
          this.ctx.arc(cx, cy, radius, 0, Math.PI * 2);
          this.ctx.stroke();
          this.ctx.globalAlpha = 1;
        }
      }

      this.ctx.restore();
    }
  }

  drawProp(prop, palette) {
    if (prop._removed) return;

    this.ctx.save();
    const x = prop.x * CANVAS_W;
    const y = prop.y * CANVAS_H;
    const scale = prop.scale || 1;
    const angle = prop.angle || 0;
    const flippedH = prop.flippedH ? -1 : 1;

    this.ctx.translate(x, y);
    this.ctx.rotate(angle);
    this.ctx.scale(flippedH * scale, scale);

    switch (prop.type) {
      case 'oak': this.drawOak(prop, palette); break;
      case 'tent': this.drawTent(prop, palette); break;
      case 'pond': this.drawPond(prop, palette); break;
      case 'fence': this.drawFence(prop, palette); break;
      case 'mushroom': this.drawMushroom(prop, palette); break;
      case 'butterfly': this.drawButterfly(prop, palette); break;
      case 'flower': this.drawFlower(prop, palette); break;
      case 'dew': this.drawDew(prop, palette); break;
      case 'lake': this.drawLake(prop, palette); break;
      case 'blanket': this.drawBlanket(prop, palette); break;
      case 'basket': this.drawBasket(prop, palette); break;
      case 'kite': this.drawKite(prop, palette); break;
      case 'bee': this.drawBee(prop, palette); break;
      case 'cloud': this.drawCloud(prop, palette); break;
      case 'campfire': this.drawCampfire(prop, palette); break;
      case 'lantern': this.drawLantern(prop, palette); break;
      case 'firefly': this.drawFirefly(prop, palette); break;
      case 'star': this.drawStar(prop, palette); break;
      case 'owl': this.drawOwl(prop, palette); break;
    }

    this.ctx.restore();
  }

  // Prop drawing methods
  drawOak(prop, p) {
    const trunkW = 20;
    const trunkH = 120;
    // Trunk
    this.ctx.fillStyle = p.oakTrunk;
    this.ctx.fillRect(-trunkW/2, -trunkH, trunkW, trunkH);
    // Leaves - multiple layers
    this.ctx.fillStyle = p.oakLeaves;
    for (let i = 0; i < 4; i++) {
      const layerY = -trunkH - 20 - i * 25;
      const layerR = 50 - i * 5;
      this.ctx.beginPath();
      this.ctx.arc(0, layerY, layerR, 0, Math.PI * 2);
      this.ctx.fill();
    }
  }

  drawTent(prop, p) {
    const w = 60, h = 50;
    this.ctx.fillStyle = p.tent;
    this.ctx.beginPath();
    this.ctx.moveTo(-w/2, h/2);
    this.ctx.lineTo(0, -h/2);
    this.ctx.lineTo(w/2, h/2);
    this.ctx.closePath();
    this.ctx.fill();
    // Tent pole
    this.ctx.strokeStyle = '#654321';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.moveTo(0, -h/2);
    this.ctx.lineTo(0, h/2);
    this.ctx.stroke();
    // Door
    this.ctx.fillStyle = '#8b4513';
    this.ctx.fillRect(-10, 0, 20, 25);
  }

  drawPond(prop, p) {
    this.ctx.fillStyle = p.pond;
    this.ctx.beginPath();
    this.ctx.ellipse(0, 0, 90, 40, 0, 0, Math.PI * 2);
    this.ctx.fill();
    // Reflection highlight
    this.ctx.fillStyle = 'rgba(255,255,255,0.3)';
    this.ctx.beginPath();
    this.ctx.ellipse(-10, -10, 30, 15, 0, 0, Math.PI * 2);
    this.ctx.fill();
  }

  drawFence(prop, p) {
    this.ctx.strokeStyle = p.fence;
    this.ctx.lineWidth = 4;
    this.ctx.fillStyle = p.fence;
    const count = prop.count || 6;
    const spacing = 180 / count;
    for (let i = 0; i <= count; i++) {
      const x = -90 + i * spacing;
      // Post
      this.ctx.beginPath();
      this.ctx.moveTo(x, -30);
      this.ctx.lineTo(x, 30);
      this.ctx.stroke();
    }
    // Rails
    this.ctx.beginPath();
    this.ctx.moveTo(-90, -10);
    this.ctx.lineTo(90, -10);
    this.ctx.moveTo(-90, 10);
    this.ctx.lineTo(90, 10);
    this.ctx.stroke();
  }

  drawMushroom(prop, p) {
    const capR = 18;
    const stemH = 25;
    // Cap
    this.ctx.fillStyle = p.mushroom;
    this.ctx.beginPath();
    this.ctx.ellipse(0, -stemH/2, capR, capR * 0.6, 0, 0, Math.PI * 2);
    this.ctx.fill();
    // Cap spots
    this.ctx.fillStyle = 'rgba(255,255,255,0.6)';
    for (let i = 0; i < 4; i++) {
      const angle = (i / 4) * Math.PI * 2;
      const sx = Math.cos(angle) * capR * 0.5;
      const sy = Math.sin(angle) * capR * 0.3 - stemH/2;
      this.ctx.beginPath();
      this.ctx.arc(sx, sy, 3, 0, Math.PI * 2);
      this.ctx.fill();
    }
    // Stem
    this.ctx.fillStyle = '#f5deb3';
    this.ctx.fillRect(-6, -stemH/2, 12, stemH);
  }

  drawButterfly(prop, p) {
    this.ctx.fillStyle = p.butterfly;
    // Wings
    this.ctx.beginPath();
    this.ctx.ellipse(-10, 0, 12, 8, -0.5, 0, Math.PI * 2);
    this.ctx.ellipse(10, 0, 12, 8, 0.5, 0, Math.PI * 2);
    this.ctx.fill();
    // Body
    this.ctx.fillStyle = '#333';
    this.ctx.fillRect(-2, -2, 4, 12);
  }

  drawFlower(prop, p) {
    const colors = [p.flower1, p.flower2];
    const color = colors[prop.variant || 0];
    // Petals
    this.ctx.fillStyle = color;
    for (let i = 0; i < 5; i++) {
      const angle = (i / 5) * Math.PI * 2;
      const px = Math.cos(angle) * 8;
      const py = Math.sin(angle) * 8;
      this.ctx.beginPath();
      this.ctx.arc(px, py, 6, 0, Math.PI * 2);
      this.ctx.fill();
    }
    // Center
    this.ctx.fillStyle = '#ffd700';
    this.ctx.beginPath();
    this.ctx.arc(0, 0, 4, 0, Math.PI * 2);
    this.ctx.fill();
    // Stem
    this.ctx.strokeStyle = '#2e8b57';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.moveTo(0, 8);
    this.ctx.lineTo(0, 25);
    this.ctx.stroke();
  }

  drawDew(prop, p) {
    this.ctx.fillStyle = p.dew;
    this.ctx.globalAlpha = 0.8;
    this.ctx.beginPath();
    this.ctx.arc(0, 0, 4, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.globalAlpha = 1;
  }

  drawLake(prop, p) {
    this.ctx.fillStyle = p.lake;
    this.ctx.beginPath();
    this.ctx.moveTo(-120, 0);
    this.ctx.bezierCurveTo(-60, -20, 60, -20, 120, 0);
    this.ctx.lineTo(120, 60);
    this.ctx.lineTo(-120, 60);
    this.ctx.closePath();
    this.ctx.fill();
    // Waves
    this.ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    this.ctx.lineWidth = 1;
    for (let i = 0; i < 3; i++) {
      this.ctx.beginPath();
      this.ctx.moveTo(-100, i * 15);
      this.ctx.bezierCurveTo(-50, i * 15 - 5, 50, i * 15 - 5, 100, i * 15);
      this.ctx.stroke();
    }
  }

  drawBlanket(prop, p) {
    this.ctx.fillStyle = p.blanket;
    this.ctx.fillRect(-55, -35, 110, 70);
    // Pattern
    this.ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    this.ctx.lineWidth = 1;
    for (let i = -50; i <= 50; i += 15) {
      this.ctx.beginPath();
      this.ctx.moveTo(i, -35);
      this.ctx.lineTo(i, 35);
      this.ctx.stroke();
    }
    for (let i = -30; i <= 30; i += 15) {
      this.ctx.beginPath();
      this.ctx.moveTo(-55, i);
      this.ctx.lineTo(55, i);
      this.ctx.stroke();
    }
  }

  drawBasket(prop, p) {
    this.ctx.fillStyle = p.basket;
    this.ctx.beginPath();
    this.ctx.moveTo(-20, 10);
    this.ctx.lineTo(-15, -15);
    this.ctx.lineTo(15, -15);
    this.ctx.lineTo(20, 10);
    this.ctx.closePath();
    this.ctx.fill();
    // Handle
    this.ctx.strokeStyle = p.basket;
    this.ctx.lineWidth = 3;
    this.ctx.beginPath();
    this.ctx.arc(0, -15, 15, 0, Math.PI);
    this.ctx.stroke();
  }

  drawKite(prop, p) {
    this.ctx.fillStyle = p.kite;
    this.ctx.beginPath();
    this.ctx.moveTo(0, -20);
    this.ctx.lineTo(15, 0);
    this.ctx.lineTo(0, 25);
    this.ctx.lineTo(-15, 0);
    this.ctx.closePath();
    this.ctx.fill();
    // Cross spars
    this.ctx.strokeStyle = '#654321';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.moveTo(0, -20);
    this.ctx.lineTo(0, 25);
    this.ctx.moveTo(-15, 0);
    this.ctx.lineTo(15, 0);
    this.ctx.stroke();
    // Tail
    this.ctx.strokeStyle = p.kite;
    this.ctx.lineWidth = 1;
    for (let i = 0; i < 4; i++) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, 25 + i * 8);
      this.ctx.lineTo(Math.sin(i) * 10, 30 + i * 8);
      this.ctx.stroke();
    }
  }

  drawBee(prop, p) {
    this.ctx.fillStyle = p.bee;
    this.ctx.beginPath();
    this.ctx.arc(0, 0, 6, 0, Math.PI * 2);
    this.ctx.fill();
    // Stripes
    this.ctx.fillStyle = '#333';
    this.ctx.fillRect(-6, -2, 12, 2);
    // Wings
    this.ctx.fillStyle = 'rgba(255,255,255,0.5)';
    this.ctx.beginPath();
    this.ctx.ellipse(-6, -4, 5, 3, -0.5, 0, Math.PI * 2);
    this.ctx.ellipse(6, -4, 5, 3, 0.5, 0, Math.PI * 2);
    this.ctx.fill();
  }

  drawCloud(prop, p) {
    this.ctx.fillStyle = p.cloud;
    const puffs = [
      { x: -25, y: 0, r: 20 },
      { x: 10, y: -5, r: 25 },
      { x: 35, y: 0, r: 18 },
      { x: 5, y: 15, r: 15 },
    ];
    puffs.forEach(puff => {
      this.ctx.beginPath();
      this.ctx.arc(puff.x, puff.y, puff.r, 0, Math.PI * 2);
      this.ctx.fill();
    });
  }

  drawCampfire(prop, p) {
    // Logs
    this.ctx.fillStyle = '#3d2b1f';
    this.ctx.fillRect(-20, 5, 40, 8);
    this.ctx.fillRect(-15, 13, 30, 8);
    // Fire
    const time = Date.now() * 0.01;
    for (let i = 0; i < 8; i++) {
      const fx = (i - 3.5) * 8 + Math.sin(time + i) * 4;
      const fh = 25 + Math.sin(time * 1.5 + i) * 10;
      const grad = this.ctx.createLinearGradient(0, 0, 0, -fh);
      grad.addColorStop(0, p.campfire);
      grad.addColorStop(0.5, '#ff8c00');
      grad.addColorStop(1, '#fff');
      this.ctx.fillStyle = grad;
      this.ctx.beginPath();
      this.ctx.moveTo(fx - 6, 5);
      this.ctx.lineTo(fx, -fh);
      this.ctx.lineTo(fx + 6, 5);
      this.ctx.closePath();
      this.ctx.fill();
    }
    // Sparks
    this.ctx.fillStyle = p.spark;
    for (let i = 0; i < 12; i++) {
      const sx = (i * 17) % 40 - 20 + Math.sin(time * 2 + i) * 10;
      const sy = -10 - (i * 23) % 40 - Math.cos(time + i) * 5;
      this.ctx.beginPath();
      this.ctx.arc(sx, sy, 2, 0, Math.PI * 2);
      this.ctx.fill();
    }
  }

  drawLantern(prop, p) {
    this.ctx.fillStyle = '#333';
    this.ctx.fillRect(-8, -20, 16, 40);
    // Glass
    this.ctx.fillStyle = p.lantern;
    this.ctx.globalAlpha = 0.7;
    this.ctx.fillRect(-6, -18, 12, 32);
    this.ctx.globalAlpha = 1;
    // Glow
    const grad = this.ctx.createRadialGradient(0, -2, 0, 0, -2, 25);
    grad.addColorStop(0, p.lantern);
    grad.addColorStop(1, 'rgba(255,165,0,0)');
    this.ctx.fillStyle = grad;
    this.ctx.fillRect(-25, -27, 50, 50);
  }

  drawFirefly(prop, p) {
    const time = Date.now() * 0.005;
    const glow = 8 + Math.sin(time + prop.x * 100) * 4;
    const grad = this.ctx.createRadialGradient(0, 0, 0, 0, 0, glow);
    grad.addColorStop(0, p.firefly);
    grad.addColorStop(1, 'rgba(173,255,47,0)');
    this.ctx.fillStyle = grad;
    this.ctx.beginPath();
    this.ctx.arc(0, 0, glow, 0, Math.PI * 2);
    this.ctx.fill();
    // Core
    this.ctx.fillStyle = p.firefly;
    this.ctx.beginPath();
    this.ctx.arc(0, 0, 3, 0, Math.PI * 2);
    this.ctx.fill();
  }

  drawStar(prop, p) {
    this.ctx.fillStyle = p.star;
    this.ctx.beginPath();
    this.ctx.arc(0, 0, 2, 0, Math.PI * 2);
    this.ctx.fill();
    // Twinkle
    const time = Date.now() * 0.003;
    const size = 2 + Math.sin(time + prop.x * 200) * 1.5;
    this.ctx.beginPath();
    this.ctx.arc(0, 0, size, 0, Math.PI * 2);
    this.ctx.fill();
  }

  drawOwl(prop, p) {
    this.ctx.fillStyle = p.owl;
    // Body
    this.ctx.beginPath();
    this.ctx.arc(0, 0, 18, 0, Math.PI * 2);
    this.ctx.fill();
    // Head
    this.ctx.beginPath();
    this.ctx.arc(0, -22, 14, 0, Math.PI * 2);
    this.ctx.fill();
    // Eyes
    this.ctx.fillStyle = '#ffd700';
    this.ctx.beginPath();
    this.ctx.arc(-6, -24, 4, 0, Math.PI * 2);
    this.ctx.arc(6, -24, 4, 0, Math.PI * 2);
    this.ctx.fill();
    // Pupils
    this.ctx.fillStyle = '#000';
    this.ctx.beginPath();
    this.ctx.arc(-6, -24, 2, 0, Math.PI * 2);
    this.ctx.arc(6, -24, 2, 0, Math.PI * 2);
    this.ctx.fill();
    // Beak
    this.ctx.fillStyle = '#ffa500';
    this.ctx.beginPath();
    this.ctx.moveTo(0, -18);
    this.ctx.lineTo(-3, -12);
    this.ctx.lineTo(3, -12);
    this.ctx.closePath();
    this.ctx.fill();
    // Wings
    this.ctx.fillStyle = p.owl;
    this.ctx.beginPath();
    this.ctx.ellipse(-18, 5, 10, 20, -0.5, 0, Math.PI * 2);
    this.ctx.ellipse(18, 5, 10, 20, 0.5, 0, Math.PI * 2);
    this.ctx.fill();
  }

  drawFoundRings(world, found) {
    const panelW = CANVAS_W;
    const panelH = CANVAS_H;
    const topY = HUD_HEIGHT;

    found.forEach((diffIndex, idx) => {
      const zone = world.diffZones[diffIndex];
      if (!zone || !zone.bounds) return;

      for (let panel = 0; panel < 2; panel++) {
        const baseX = panel * (panelW + PANEL_GAP);
        const b = zone.bounds;
        const cx = baseX + b.x * panelW + b.w / 2;
        const cy = topY + b.y * panelH + b.h / 2;

        this.ctx.save();
        this.ctx.translate(cx, cy);

        // Ring animation
        const pulse = (Date.now() % 2000) / 2000;
        const ringR = RING_RADIUS + pulse * 8;
        const alpha = 1 - pulse * 0.5;

        this.ctx.strokeStyle = RING_COLOR_FOUND;
        this.ctx.lineWidth = 4;
        this.ctx.globalAlpha = alpha;
        this.ctx.beginPath();
        this.ctx.arc(0, 0, ringR, 0, Math.PI * 2);
        this.ctx.stroke();

        // Inner ring
        this.ctx.strokeStyle = RING_COLOR;
        this.ctx.lineWidth = 2;
        this.ctx.globalAlpha = alpha * 0.7;
        this.ctx.beginPath();
        this.ctx.arc(0, 0, ringR - 6, 0, Math.PI * 2);
        this.ctx.stroke();

        this.ctx.restore();
      }
    });
  }

  drawLabels() {
    const panelW = CANVAS_W;
    const panelH = CANVAS_H;
    const topY = HUD_HEIGHT;

    this.ctx.font = 'bold 16px system-ui, sans-serif';
    this.ctx.fillStyle = '#1a1a2e';
    this.ctx.textAlign = 'center';

    // Original label
    this.ctx.fillText('Original', panelW / 2, topY + panelH + 24);

    // Changed label
    this.ctx.fillText('Changed', panelW + PANEL_GAP + panelW / 2, topY + panelH + 24);
  }

  drawMagnifier(world, panel) {
    const panelW = CANVAS_W;
    const panelH = CANVAS_H;
    const topY = HUD_HEIGHT;
    const baseX = panel * (panelW + PANEL_GAP);

    // Mouse position relative to panel
    const relX = this.mouseX - baseX;
    const relY = this.mouseY - topY;

    if (relX < 0 || relX > panelW || relY < 0 || relY > panelH) return;

    const props = panel === 0 ? world.originalProps : world.changedProps;

    // Draw magnifier lens on main canvas
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.arc(this.mouseX, this.mouseY, MAGNIFIER_RADIUS, 0, Math.PI * 2);
    this.ctx.clip();

    // Draw zoomed view
    this.ctx.translate(this.mouseX, this.mouseY);
    this.ctx.scale(MAGNIFIER_ZOOM, MAGNIFIER_ZOOM);
    this.ctx.translate(-relX, -relY);

    // Redraw background and props at zoom
    const scene = world.scene;
    const p = scene.palette;

    // Sky
    const grad = this.ctx.createLinearGradient(0, 0, 0, panelH);
    grad.addColorStop(0, p.skyTop);
    grad.addColorStop(1, p.skyBottom);
    this.ctx.fillStyle = grad;
    this.ctx.fillRect(0, 0, panelW, panelH);

    // Hills, ground (simplified for performance)
    this.ctx.fillStyle = p.ground;
    this.ctx.fillRect(0, panelH * 0.55, panelW, panelH * 0.45);

    // Props
    props.forEach(prop => this.drawProp(prop, p));

    this.ctx.restore();

    // Lens border
    this.ctx.strokeStyle = '#fff';
    this.ctx.lineWidth = 3;
    this.ctx.beginPath();
    this.ctx.arc(this.mouseX, this.mouseY, MAGNIFIER_RADIUS, 0, Math.PI * 2);
    this.ctx.stroke();

    // Crosshair
    this.ctx.strokeStyle = '#fff';
    this.ctx.lineWidth = 1;
    this.ctx.beginPath();
    this.ctx.moveTo(this.mouseX - 15, this.mouseY);
    this.ctx.lineTo(this.mouseX - 5, this.mouseY);
    this.ctx.moveTo(this.mouseX + 5, this.mouseY);
    this.ctx.lineTo(this.mouseX + 15, this.mouseY);
    this.ctx.moveTo(this.mouseX, this.mouseY - 15);
    this.ctx.lineTo(this.mouseX, this.mouseY - 5);
    this.ctx.moveTo(this.mouseX, this.mouseY + 5);
    this.ctx.lineTo(this.mouseX, this.mouseY + 15);
    this.ctx.stroke();
  }

  drawHUD(state) {
    const { sceneIndex, found, hints, hearts, timer, score, streak, paused, gameState } = state;
    const w = this.hudCanvas.width;
    const h = HUD_HEIGHT;

    this.hudCtx.clearRect(0, 0, w, h);

    // Background
    this.hudCtx.fillStyle = '#1a1a2e';
    this.hudCtx.fillRect(0, 0, w, h);

    // Dividers
    this.hudCtx.strokeStyle = '#3a3a5e';
    this.hudCtx.lineWidth = 1;
    for (let x = 200; x < w; x += 200) {
      this.hudCtx.beginPath();
      this.hudCtx.moveTo(x, 0);
      this.hudCtx.lineTo(x, h);
      this.hudCtx.stroke();
    }

    // Title
    this.hudCtx.font = 'bold 20px system-ui, sans-serif';
    this.hudCtx.fillStyle = '#ffeb3b';
    this.hudCtx.textAlign = 'left';
    this.hudCtx.fillText('Firefly Hollow', 20, 30);

    // Scene name
    this.hudCtx.font = '14px system-ui, sans-serif';
    this.hudCtx.fillStyle = '#ccc';
    this.hudCtx.fillText(SCENES[sceneIndex].name, 20, 52);

    // Counter: N remaining
    const remaining = 7 - found.length;
    this.hudCtx.font = 'bold 28px system-ui, sans-serif';
    this.hudCtx.fillStyle = '#ffeb3b';
    this.hudCtx.textAlign = 'center';
    this.hudCtx.fillText(`${remaining} to find`, 200, 40);

    // Timer
    const mins = Math.floor(timer / 60000);
    const secs = Math.floor((timer % 60000) / 1000);
    const ms = Math.floor((timer % 1000) / 10);
    this.hudCtx.font = 'bold 24px system-ui, sans-serif';
    this.hudCtx.fillStyle = timer < 30000 ? '#ff5252' : '#fff';
    this.hudCtx.fillText(`${mins}:${secs.toString().padStart(2,'0')}.${ms.toString().padStart(2,'0')}`, 400, 40);

    // Score
    this.hudCtx.font = '16px system-ui, sans-serif';
    this.hudCtx.fillStyle = '#4caf50';
    this.hudCtx.fillText(`Score: ${score}`, 600, 30);

    // Streak
    if (streak > 0) {
      this.hudCtx.fillStyle = '#ff9800';
      this.hudCtx.fillText(`Streak: ${streak}x`, 600, 52);
    }

    // Hearts
    this.hudCtx.font = '20px system-ui, sans-serif';
    this.hudCtx.textAlign = 'right';
    for (let i = 0; i < 3; i++) {
      const x = 750 - i * 28;
      this.hudCtx.fillStyle = i < hearts ? '#ff5252' : '#444';
      this.hudCtx.fillText('♥', x, 40);
    }

    // Hints
    for (let i = 0; i < 3; i++) {
      const x = 750 - i * 28;
      this.hudCtx.fillStyle = i < hints ? '#ffeb3b' : '#444';
      this.hudCtx.fillText('💡', x, 64);
    }

    // Controls hint
    this.hudCtx.font = '11px system-ui, sans-serif';
    this.hudCtx.fillStyle = '#888';
    this.hudCtx.textAlign = 'left';
    this.hudCtx.fillText('H:Hint R:Restart 1/2/3:Scene Arrows:Move Enter:Mark M:Magnifier P:Pause', 20, 72);

    // Pause overlay
    if (paused || gameState === 'paused') {
      this.hudCtx.fillStyle = 'rgba(0,0,0,0.7)';
      this.hudCtx.fillRect(0, 0, w, h);
      this.hudCtx.font = 'bold 32px system-ui, sans-serif';
      this.hudCtx.fillStyle = '#fff';
      this.hudCtx.textAlign = 'center';
      this.hudCtx.fillText('PAUSED', w / 2, h / 2);
      this.hudCtx.font = '16px system-ui, sans-serif';
      this.hudCtx.fillText('Press P to resume', w / 2, h / 2 + 35);
    }

    // Scene complete overlay
    if (gameState === 'scene-complete') {
      this.hudCtx.fillStyle = 'rgba(0,0,0,0.8)';
      this.hudCtx.fillRect(0, 0, w, h);
      this.hudCtx.font = 'bold 32px system-ui, sans-serif';
      this.hudCtx.fillStyle = '#4caf50';
      this.hudCtx.textAlign = 'center';
      this.hudCtx.fillText('SCENE COMPLETE!', w / 2, h / 2 - 20);
      this.hudCtx.font = '16px system-ui, sans-serif';
      this.hudCtx.fillStyle = '#fff';
      this.hudCtx.fillText(`Score: ${score}  |  Press 1/2/3 for next scene or R to replay`, w / 2, h / 2 + 25);
    }

    // All complete overlay
    if (gameState === 'all-complete') {
      this.hudCtx.fillStyle = 'rgba(0,0,0,0.85)';
      this.hudCtx.fillRect(0, 0, w, h);
      this.hudCtx.font = 'bold 36px system-ui, sans-serif';
      this.hudCtx.fillStyle = '#ffeb3b';
      this.hudCtx.textAlign = 'center';
      this.hudCtx.fillText('ALL SCENES COMPLETE!', w / 2, h / 2 - 30);
      this.hudCtx.font = '20px system-ui, sans-serif';
      this.hudCtx.fillStyle = '#fff';
      this.hudCtx.fillText(`Final Score: ${score}`, w / 2, h / 2 + 10);
      this.hudCtx.font = '14px system-ui, sans-serif';
      this.hudCtx.fillText('Press R to play again', w / 2, h / 2 + 45);
    }
  }
}