// Audio — WebAudio blips only (found = ding, wrong = buzz, win = arpeggio)
// No external audio files.

export class Audio {
  constructor() {
    this.ctx = null;
    this.init();
  }

  init() {
    try {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
      console.warn('WebAudio not supported:', e);
      this.ctx = null;
    }
  }

  // Resume context on user interaction (required by browsers)
  resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  play(type) {
    if (!this.ctx) return;
    this.resume();

    const now = this.ctx.currentTime;

    switch (type) {
      case 'found':
        this.playDing(now);
        break;
      case 'wrong':
        this.playBuzz(now);
        break;
      case 'win':
        this.playArpeggio(now);
        break;
      case 'hint':
        this.playHint(now);
        break;
    }
  }

  playDing(now) {
    // Pleasant ding: two tones
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = 'sine';
    osc2.type = 'sine';
    osc1.frequency.value = 880; // A5
    osc2.frequency.value = 1320; // E6

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.ctx.destination);

    osc1.start(now);
    osc2.start(now + 0.05);
    osc1.stop(now + 0.5);
    osc2.stop(now + 0.55);
  }

  playBuzz(now) {
    // Harsh buzz: square wave descending
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(200, now);
    osc.frequency.exponentialRampToValueAtTime(80, now + 0.3);

    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.3);
  }

  playArpeggio(now) {
    // Victory arpeggio: major chord up
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    notes.forEach((freq, i) => {
      const t = now + i * 0.15;
      osc.frequency.setValueAtTime(freq, t);
    });
    osc.stop(now + 1.2);
  }

  playHint(now) {
    // Soft chime for hint
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(660, now); // E5
    osc.frequency.setValueAtTime(880, now + 0.1); // A5

    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.6);
  }
}