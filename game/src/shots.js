// SHADOW VAULT — deterministic screenshot scenes.
// One job: when the URL carries ?shot=start|play|end, draw one fixed scene
// synchronously on load, with no animation dependence, so screenshots are
// identical on every load.

import { VIEW_W, VIEW_H, PALETTE } from './config.js';
import { buildLevels } from './levels.js';
import { makeSeededRandom } from './random.js';
import {
  drawFloor,
  drawShadows,
  drawCover,
  drawExit,
  drawGems,
  drawGuard,
  drawCamera,
  drawPlayer,
  drawHud,
  drawTitleScreen,
  drawCenterPanel,
} from './render.js';

// A fixed mid-level scene: level 2, player crouched behind a crate, guards
// sweeping with cones, gems glowing, exit lit. Positions are hard-coded so
// the shot never depends on the live game state.
export function renderShotPlay(ctx, seed) {
  const random = makeSeededRandom(seed);
  const level = buildLevels()[1];
  const gems = level.gems.map((g) => ({ ...g, taken: false, bobPhase: random() * 6 }));
  const guards = level.guards.map((def, i) => {
    const spot = def.path[Math.min(i + 1, def.path.length - 1)];
    return {
      x: spot[0],
      y: spot[1],
      angle: 0.6 + i * 0.9,
      mode: i === 1 ? 'investigate' : 'patrol',
      investigate: null,
      stepPhase: 0,
    };
  });
  const camera = { x: 480, y: 24, angle: 0.4, range: 210 };
  const player = { x: 415, y: 160 };
  const hud = {
    levelName: level.name,
    gemsGot: 2,
    gemsTotal: 4,
    timeText: '01:24',
    coins: 2,
    muted: false,
    detection: 38,
    alarm: false,
  };

  drawFloor(ctx, level);
  drawShadows(ctx, level);
  drawCover(ctx, level);
  drawExit(ctx, level, false);
  drawGems(ctx, gems);
  drawCamera(ctx, camera);
  for (const guard of guards) drawGuard(ctx, guard);
  drawPlayer(ctx, player, true);
  // a thrown coin mid-distraction
  ctx.fillStyle = PALETTE.gem;
  ctx.beginPath();
  ctx.arc(560, 260, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255, 217, 77, 0.7)';
  ctx.beginPath();
  ctx.arc(560, 260, 13, 0, Math.PI * 2);
  ctx.stroke();
  drawHud(ctx, hud);
  ctx.font = 'bold 15px monospace';
  ctx.textAlign = 'center';
  ctx.fillStyle = PALETTE.gold;
  ctx.fillText('Sneak past the patrol — the cone is watching', VIEW_W / 2, VIEW_H - 18);
}

export function renderShotEnd(ctx) {
  ctx.fillStyle = '#0b0e1a';
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  // confetti of gems
  const random = makeSeededRandom(7);
  for (let i = 0; i < 26; i++) {
    ctx.fillStyle = ['#ffd94d', '#39d98a', '#7c5cff', '#e8ecf5'][i % 4];
    ctx.beginPath();
    ctx.arc(random() * VIEW_W, random() * 180 + 20, 4 + random() * 4, 0, Math.PI * 2);
    ctx.fill();
  }
  drawCenterPanel(
    ctx,
    'HEIST COMPLETE!',
    [
      'All 3 vaults emptied. 12 gems stolen. Time 04:37.',
      'GHOST BONUS: never fully spotted — +500 points',
      'Final score: 2,840   •   Rank: Master Shadow',
      '',
      'Press ENTER to steal again',
    ],
    PALETTE.exit
  );
}

export function renderShot(ctx, shot, seed) {
  if (shot === 'start') {
    drawTitleScreen(ctx);
    return true;
  }
  if (shot === 'play') {
    renderShotPlay(ctx, seed);
    return true;
  }
  if (shot === 'end') {
    renderShotEnd(ctx);
    return true;
  }
  return false;
}
