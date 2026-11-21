// Seeded RNG — mulberry32
// Deterministic: same seed always produces same sequence.

export class SeededRNG {
  constructor(seed = 0x46697265) {
    this.state = seed >>> 0;
  }

  // Mulberry32 algorithm
  next() {
    let t = (this.state += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  // Random integer in [0, max)
  int(max) {
    return Math.floor(this.next() * max);
  }

  // Random float in [min, max)
  float(min, max) {
    return min + this.next() * (max - min);
  }

  // Random choice from array
  choice(arr) {
    return arr[this.int(arr.length)];
  }

  // Shuffle array in place (Fisher-Yates)
  shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = this.int(i + 1);
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  // Reset to initial seed
  reset() {
    this.state = this.initialSeed >>> 0;
  }
}

// Global RNG instance
export const rng = new SeededRNG();