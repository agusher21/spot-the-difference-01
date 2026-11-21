// Main — state machine (menu / play / scene-complete / all-complete), timer, score, streak, hints, hearts, scene switching

class Game {
  constructor(canvas, hudCanvas) {
    this.canvas = canvas;
    this.hudCanvas = hudCanvas;
    this.renderer = new Renderer(canvas, hudCanvas);
    this.input = new InputHandler(canvas, this);
    this.audio = new Audio();

    this.state = {
      gameState: 'menu', // 'menu', 'play', 'scene-complete', 'all-complete', 'paused'
      sceneIndex: 0,
      found: [],
      hints: HINTS_PER_SCENE,
      hearts: HEARTS_PER_SCENE,
      timer: SCENE_TIME_MS,
      score: 0,
      streak: 0,
      totalScore: 0,
      paused: false,
      hintActive: false,
      hintTarget: null,
      hintTimer: 0,
      lastTime: 0,
    };

    this.world = null;
    this.animationId = null;
    this.initScene(0);
  }

  initScene(sceneIndex) {
    this.state.sceneIndex = sceneIndex;
    this.state.found = [];
    this.state.hints = HINTS_PER_SCENE;
    this.state.hearts = HEARTS_PER_SCENE;
    this.state.timer = SCENE_TIME_MS;
    this.state.streak = 0;
    this.state.hintActive = false;
    this.state.hintTarget = null;
    this.state.hintTimer = 0;
    this.state.paused = false;

    // Check for screenshot preset via URL params
    const params = new URLSearchParams(window.location.search);
    let foundIndices = [];

    if (params.has('shot')) {
      const shot = params.get('shot');
      const presets = {
        'cover': { scene: 2, found: 3 },
        'dawn': { scene: 0, found: 2 },
        'noon': { scene: 1, found: 4 },
        'dusk': { scene: 2, found: 5 },
      };
      if (presets[shot]) {
        this.state.sceneIndex = presets[shot].scene;
        foundIndices = Array.from({ length: presets[shot].found }, (_, i) => i);
      }
    } else if (params.has('scene') && params.has('found')) {
      this.state.sceneIndex = parseInt(params.get('scene'), 10);
      const n = parseInt(params.get('found'), 10);
      foundIndices = Array.from({ length: n }, (_, i) => i);
    }

    this.world = buildWorld(this.state.sceneIndex, foundIndices);

    // Pre-mark found differences
    foundIndices.forEach(idx => {
      if (idx < DIFFS_PER_SCENE) {
        this.state.found.push(idx);
      }
    });

    if (foundIndices.length > 0) {
      this.state.gameState = 'play';
    } else {
      this.state.gameState = 'play';
    }
  }

  start() {
    this.state.lastTime = performance.now();
    this.loop();
  }

  loop() {
    const now = performance.now();
    const dt = now - this.state.lastTime;
    this.state.lastTime = now;

    this.update(dt);
    this.render();

    this.animationId = requestAnimationFrame(() => this.loop());
  }

  update(dt) {
    if (this.state.gameState !== 'play' || this.state.paused) return;

    // Timer
    this.state.timer -= dt;
    if (this.state.timer <= 0) {
      this.state.timer = 0;
      this.handleTimeUp();
      return;
    }

    // Hint pulse timer
    if (this.state.hintActive) {
      this.state.hintTimer -= dt;
      if (this.state.hintTimer <= 0) {
        this.state.hintActive = false;
        this.state.hintTarget = null;
      }
    }
  }

  render() {
    this.renderer.render({ ...this.state, world: this.world });
    this.input.drawReticle(this.renderer.ctx);
  }

  markFound(diffIndex) {
    if (this.state.found.includes(diffIndex)) return;
    if (this.state.gameState !== 'play') return;

    this.state.found.push(diffIndex);
    this.state.score += SCORE_PER_FIND;
    this.state.streak++;
    this.state.score += this.state.streak * STREAK_BONUS;
    this.state.totalScore += SCORE_PER_FIND + this.state.streak * STREAK_BONUS;

    this.audio.play('found');

    // Check scene complete
    if (this.state.found.length >= DIFFS_PER_SCENE) {
      this.handleSceneComplete();
    }
  }

  handleMiss() {
    if (this.state.gameState !== 'play') return;

    this.state.timer -= WRONG_CLICK_PENALTY_MS;
    this.state.hearts--;
    this.state.streak = 0;
    this.audio.play('wrong');

    if (this.state.hearts <= 0 || this.state.timer <= 0) {
      this.handleSceneFailed();
    }
  }

  useHint() {
    if (this.state.hints <= 0) return;
    if (this.state.gameState !== 'play') return;

    // Find unfound differences
    const unfound = [];
    for (let i = 0; i < DIFFS_PER_SCENE; i++) {
      if (!this.state.found.includes(i)) {
        unfound.push(i);
      }
    }

    if (unfound.length === 0) return;

    // Pick random unfound difference
    const idx = unfound[Math.floor(Math.random() * unfound.length)];
    this.state.hintTarget = { diffIndex: idx, panel: this.world.diffZones[idx].panel };
    this.state.hintActive = true;
    this.state.hintTimer = 2000; // 2 seconds
    this.state.hints--;

    this.audio.play('hint');
  }

  handleSceneComplete() {
    this.state.gameState = 'scene-complete';
    this.audio.play('win');

    // Time bonus
    const timeBonus = Math.floor(this.state.timer / 1000) * 10;
    this.state.score += timeBonus;
    this.state.totalScore += timeBonus;

    // Check if all scenes done
    if (this.state.sceneIndex >= SCENES.length - 1) {
      this.state.gameState = 'all-complete';
    }
  }

  handleSceneFailed() {
    // Could implement retry logic, for now just restart scene
    this.restartScene();
  }

  handleTimeUp() {
    this.state.gameState = 'scene-complete';
    // No time bonus
    if (this.state.sceneIndex >= SCENES.length - 1) {
      this.state.gameState = 'all-complete';
    }
  }

  restartScene() {
    this.initScene(this.state.sceneIndex);
    this.state.score = this.state.totalScore - (this.state.sceneIndex > 0 ? this.getPreviousScenesScore() : 0);
  }

  getPreviousScenesScore() {
    // Simplified: just return accumulated score before current scene
    return this.state.totalScore - this.state.score;
  }

  switchScene(index) {
    if (index < 0 || index >= SCENES.length) return;
    if (index === this.state.sceneIndex) return;

    this.state.sceneIndex = index;
    this.initScene(index);
    this.state.score = this.getPreviousScenesScore();
  }

  toggleMagnifier() {
    this.renderer.setMagnifier(!this.renderer.magnifierEnabled);
  }

  togglePause() {
    if (this.state.gameState === 'play') {
      this.state.paused = !this.state.paused;
    }
  }

  destroy() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
  }
}

// Auto-start when DOM ready
let gameInstance = null;

document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('game');
  const hudCanvas = document.getElementById('hud');

  // Compute canvas sizes from window
  CANVAS_W = Math.floor((window.innerWidth - PANEL_GAP) / 2);
  CANVAS_H = window.innerHeight - HUD_HEIGHT - 40;
  const totalW = CANVAS_W * 2 + PANEL_GAP;
  const totalH = CANVAS_H + HUD_HEIGHT + 40;
  canvas.width = totalW;
  canvas.height = totalH;
  hudCanvas.width = totalW;
  hudCanvas.height = HUD_HEIGHT;

  gameInstance = new Game(canvas, hudCanvas);
  gameInstance.start();
});

// Export for potential external access
window.FireflyHollowGame = gameInstance;