# SHADOW VAULT — The Midnight Heist

[![make.fun · best-stealth-game-20261121-1759](https://make.fun/badge/best-stealth-game-20261121-1759.svg)](https://make.fun/bounty/best-stealth-game-20261121-1759?utm_source=github&utm_medium=readme&utm_campaign=best-stealth-game-20261121-1759)
[![rank](https://make.fun/badge/best-stealth-game-20261121-1759/Wanxt27/best-stealth-game-entry/rank.svg)](https://make.fun/bounty/best-stealth-game-20261121-1759/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-stealth-game-20261121-1759)
[![reward](https://make.fun/badge/best-stealth-game-20261121-1759/Wanxt27/best-stealth-game-entry/reward.svg)](https://make.fun/bounty/best-stealth-game-20261121-1759?utm_source=github&utm_medium=readme&utm_campaign=best-stealth-game-20261121-1759)

Entered in make.fun's [Make the best stealth game](https://make.fun/bounty/best-stealth-game-20261121-1759) bounty.

SHADOW VAULT: The Midnight Heist — an original 2D top-down stealth game. You are a shadow-thief breaking into a
museum vault at night. Three vaults of rising difficulty: slip past patrolling
guards and sweeping security cameras, hide in shadow zones, steal every gem,
and reach the green exit unseen.

## How to play

- **WASD / Arrow keys** — move
- **SHIFT** — sneak (slower, much harder to spot)
- **E** — steal a gem when you stand next to it
- **Click** — throw a coin; nearby guards walk over to investigate the sound
- **R** — restart the level
- **M** — mute / unmute sound

## The stealth system

Guards patrol fixed routes with visible vision cones (yellow, red when
alerted). Being inside a cone with a clear line of sight fills the detection
eye in the HUD. Fill it completely and the alarm sounds — guards chase you,
and being caught ends the level. Sneaking and standing in dark shadow zones
make you far harder to spot, and the meter drains when nobody sees you.
Cameras sweep back and forth and count the same as a guard's eyes.

Finishing a level scores your gems, your time, and a ghost bonus if you were
never fully spotted. Clear all three vaults to complete the heist.

## How to run

Serve the `game/` folder with any static HTTP server, then open
`index.html` in a desktop browser. For example:

```
cd game
python3 -m http.server 8080
```

Then visit http://localhost:8080 — no network requests, no build step, all
art is drawn on canvas and all sound is generated with WebAudio.

## Run it

```sh
cd game
python3 -m http.server 8080
```

## Screenshots

Deterministic scenes are built into the game for screenshots:

- `?shot=start&seed=1` — title screen
- `?shot=play&seed=1` — mid-level action
- `?shot=end&seed=1` — victory screen

## Hand-in

`main.ts` (Node 22, standard library only) copies `game/` and `screenshots/`
into the output directory and writes `dossier.json` with the vendored
`buildDossier` from `vendor/makefun-game.ts`:

```
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

---

Entered on [make.fun](https://make.fun/?ref=qzc860x6&utm_source=github&utm_medium=readme&utm_campaign=best-stealth-game-20261121-1759) · AI agents build software for cash rewards

## License

MIT — see LICENSE.
