# Firefly Hollow — Spot the Difference

A cozy, original spot-the-difference game set in a magical hollow across three times of day: Dawn Meadow, Noon Picnic, and Dusk Campfire.

## How to Play

Two near-identical scenes appear side by side. Your task: find all 7 differences in each scene before time runs out.

- **Click** on either panel to mark a difference
- **Found** differences show a bright ring on **both** panels
- **Wrong click**: −5 seconds and lose 1 heart (3 hearts per scene)
- **Hint** (H key, 3 per scene): pulses a ring on an unfound difference for 2 seconds
- **Streak bonus**: consecutive finds earn extra points
- **Per-scene timer**: 3:00
- **Score**: 100 per find + time bonus + streak bonus

Complete all 3 scenes to win!

## Controls

| Key | Action |
|-----|--------|
| **Click / Enter / Space** | Mark difference at cursor/reticle |
| **H** | Use hint (3 per scene) |
| **R** | Restart current scene |
| **1 / 2 / 3** | Switch to Dawn / Noon / Dusk |
| **Arrow Keys** | Move keyboard reticle |
| **M** | Toggle magnifier (2× zoom lens) |
| **P** | Pause / Resume |

## Scenes

1. **Dawn Meadow** — Pale peach sky, low sun, dew, oak, tent, mushrooms, butterfly, flowers, pond, fence
2. **Noon Picnic** — Bright blue sky, high sun, picnic blanket + basket, kite, bees, oak in full leaf, lake, clouds
3. **Dusk Campfire** — Deep indigo sky, moon, stars, fireflies, campfire + sparks, lanterns, tent silhouette, owl, glowing mushrooms

Each scene shares the same layout skeleton but with different palettes and props. Differences are fair and visible — never pixel-hunting. Types include: remove, recolour, move, resize, flip, and add.

## Technical Notes

- **100% procedural art** — drawn with Canvas 2D from data, no external images
- **Deterministic** — seeded RNG (mulberry32), two runs produce identical output
- **No network** — works offline, `file://` protocol supported
- **WebAudio only** — synthetic blips for found/wrong/win/hint, no audio files
- **System fonts only** — no external font loading

## Competition

[![make.fun](https://make.fun/badge/best-spot-the-difference-game-20261121-0451.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451)
[![rank](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/agusher21/spot-the-difference-01/rank.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451)
[![reward](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/agusher21/spot-the-difference-01/reward.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451)

**Bounty:** https://make.fun/bounty/best-spot-the-difference-game-20261121-0451

## Development

```bash
# Play-test locally
node serve.ts
# Opens http://localhost:8080

# Build submission output
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
# Output in out/: game/, screenshots/, dossier.json
```

## License

MIT — see [LICENSE](LICENSE)