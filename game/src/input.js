// Input — mouse + keyboard handling, hit-testing against difference zones

import { CANVAS_W, CANVAS_H, PANEL_GAP, HUD_HEIGHT, RING_RADIUS } from './config.js';

export class InputHandler {
  constructor(canvas, game) {
    this.canvas = canvas;
    this.game = game;
    this.reticleX = CANVAS_W / 2;
    this.reticleY = CANVAS_H / 2 + HUD_HEIGHT;
    this.reticlePanel = 0;
    this.keys = new Set();
    this.setupListeners();
  }

  setupListeners() {
    // Mouse move
    this.canvas.addEventListener('mousemove', (e) => this.onMouseMove(e));
    // Mouse click
    this.canvas.addEventListener('click', (e) => this.onClick(e));
    // Keyboard
    window.addEventListener('keydown', (e) => this.onKeyDown(e));
    window.addEventListener('keyup', (e) => this.onKeyUp(e));
    // Prevent context menu
    this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  onMouseMove(e) {
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    this.game.renderer.setMousePos(x, y);

    // Update reticle if keyboard navigation active
    if (this.keys.has('ArrowLeft') || this.keys.has('ArrowRight') ||
        this.keys.has('ArrowUp') || this.keys.has('ArrowDown')) {
      this.reticleX = x;
      this.reticleY = y;
      this.updateReticlePanel(x, y);
    }
  }

  onClick(e) {
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    this.handleMark(x, y);
  }

  onKeyDown(e) {
    this.keys.add(e.key);
    this.handleKeyAction(e.key, true);
  }

  onKeyUp(e) {
    this.keys.delete(e.key);
  }

  handleKeyAction(key, pressed) {
    if (!pressed) return;

    switch (key) {
      case 'h':
      case 'H':
        this.game.useHint();
        break;
      case 'r':
      case 'R':
        this.game.restartScene();
        break;
      case '1':
        this.game.switchScene(0);
        break;
      case '2':
        this.game.switchScene(1);
        break;
      case '3':
        this.game.switchScene(2);
        break;
      case 'ArrowLeft':
        this.moveReticle(-1, 0);
        break;
      case 'ArrowRight':
        this.moveReticle(1, 0);
        break;
      case 'ArrowUp':
        this.moveReticle(0, -1);
        break;
      case 'ArrowDown':
        this.moveReticle(0, 1);
        break;
      case 'Enter':
      case ' ':
        this.handleMark(this.reticleX, this.reticleY);
        break;
      case 'm':
      case 'M':
        this.game.toggleMagnifier();
        break;
      case 'p':
      case 'P':
        this.game.togglePause();
        break;
    }
  }

  moveReticle(dx, dy) {
    const step = 15;
    this.reticleX = Math.max(0, Math.min(this.canvas.width, this.reticleX + dx * step));
    this.reticleY = Math.max(0, Math.min(this.canvas.height, this.reticleY + dy * step));
    this.updateReticlePanel(this.reticleX, this.reticleY);
    this.game.renderer.setMousePos(this.reticleX, this.reticleY);
  }

  updateReticlePanel(x, y) {
    const panelW = CANVAS_W;
    const panelH = CANVAS_H;
    const leftX = 0;
    const rightX = panelW + PANEL_GAP;
    const topY = HUD_HEIGHT;

    if (x >= leftX && x < leftX + panelW && y >= topY && y < topY + panelH) {
      this.reticlePanel = 0;
    } else if (x >= rightX && x < rightX + panelW && y >= topY && y < topY + panelH) {
      this.reticlePanel = 1;
    }
  }

  handleMark(x, y) {
    if (this.game.state.gameState !== 'play') return;

    const panelW = CANVAS_W;
    const panelH = CANVAS_H;
    const topY = HUD_HEIGHT;

    // Determine which panel was clicked
    let panel = -1;
    let relX = x, relY = y;

    if (x >= 0 && x < panelW && y >= topY && y < topY + panelH) {
      panel = 0;
      relX = x;
      relY = y - topY;
    } else if (x >= panelW + PANEL_GAP && x < panelW * 2 + PANEL_GAP && y >= topY && y < topY + panelH) {
      panel = 1;
      relX = x - (panelW + PANEL_GAP);
      relY = y - topY;
    } else {
      return; // Clicked outside panels
    }

    // Check hit against difference zones
    const world = this.game.world;
    const found = this.game.state.found;

    for (let i = 0; i < world.diffZones.length; i++) {
      if (found.includes(i)) continue;

      const zone = world.diffZones[i];
      if (!zone.bounds) continue;

      const b = zone.bounds;
      const bx = b.x * panelW;
      const by = b.y * panelH;
      const bw = b.w * panelW;
      const bh = b.h * panelH;

      if (relX >= bx && relX <= bx + bw && relY >= by && relY <= by + bh) {
        // Hit!
        this.game.markFound(i);
        return;
      }
    }

    // Miss
    this.game.handleMiss();
  }

  // Draw reticle for keyboard navigation
  drawReticle(ctx) {
    if (this.game.state.gameState !== 'play') return;

    const panelW = CANVAS_W;
    const panelH = CANVAS_H;
    const topY = HUD_HEIGHT;

    // Only draw if reticle is over a panel
    if (this.reticleX < 0 || this.reticleX > this.canvas.width ||
        this.reticleY < topY || this.reticleY > topY + panelH) {
      return;
    }

    ctx.save();
    ctx.translate(this.reticleX, this.reticleY);

    // Pulsing reticle
    const pulse = (Date.now() % 1000) / 1000;
    const size = 16 + pulse * 8;

    ctx.strokeStyle = '#ffeb3b';
    ctx.lineWidth = 2;
    ctx.globalAlpha = 0.8 + pulse * 0.2;

    // Crosshair
    ctx.beginPath();
    ctx.moveTo(-size, 0);
    ctx.lineTo(-8, 0);
    ctx.moveTo(8, 0);
    ctx.lineTo(size, 0);
    ctx.moveTo(0, -size);
    ctx.lineTo(0, -8);
    ctx.moveTo(0, 8);
    ctx.lineTo(0, size);
    ctx.stroke();

    // Center dot
    ctx.fillStyle = '#ffeb3b';
    ctx.globalAlpha = 1;
    ctx.beginPath();
    ctx.arc(0, 0, 3, 0, Math.PI * 2);
    ctx.fill();

    // Panel indicator
    ctx.font = 'bold 12px system-ui, sans-serif';
    ctx.fillStyle = '#ffeb3b';
    ctx.textAlign = 'center';
    ctx.fillText(this.reticlePanel === 0 ? '◄ Original' : 'Changed ►', 0, -size - 8);

    ctx.restore();
  }
}