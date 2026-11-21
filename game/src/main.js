// SHADOW VAULT — the game loop and state machine.
// One job: own the screen state, run each frame, and wire input, guards,
// detection, audio and rendering together.

import {
  VIEW_W,
  VIEW_H,
  PLAYER_RADIUS,
  PLAYER_WALK_SPEED,
  PLAYER_SNEAK_SPEED,
  PLAYER_COIN_COUNT,
  GUARD_CATCH_DISTANCE,
  GUARD_VIEW_RANGE,
  DETECT_FILL_RATE,
  DETECT_FILL_CLOSE,
  DETECT_DRAIN_RATE,
  DETECT_SNEAK_FACTOR,
  DETECT_SHADOW_FACTOR,
  ALARM_SECONDS,
  COIN_THROW_RANGE,
  COIN_DISTRACT_RADIUS,
  GEM_PICKUP_RADIUS,
} from './config.js';
import { buildLevels, solidRects, pointInRect, pointInShadow } from './levels.js';
import { makeGuard, makeCamera, updateGuard, updateCamera, distractGuards, raiseAlarm, seeStrength } from './guards.js';
import { createInput } from './input.js';
import { createAudio } from './audio.js';
import {
  drawFloor,
  drawShadows,
  drawCover,
  drawExit,
  drawGems,
  drawGuard,
  drawCamera,
  drawPlayer,
  drawCoin,
  drawHud,
  drawPrompt,
  drawCenterPanel,
  drawTitleScreen,
} from './render.js';
import { renderShot } from './shots.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
canvas.width = VIEW_W;
canvas.height = VIEW_H;

const input = createInput(canvas);
const audio = createAudio();
const levels = buildLevels();

const game = {
  screen: 'title', // title | intro | play | levelDone | failed | victory
  levelIndex: 0,
  level: null,
  guards: [],
  cameras: [],
  gems: [],
  player: { x: 70, y: 530 },
  detection: 0,
  alarm: false,
  alarmLeft: 0,
  coins: PLAYER_COIN_COUNT,
  coin: null,
  score: 0,
  totalTime: 0,
  levelTime: 0,
  ghost: true, // stays true while the player is never fully spotted
  introLeft: 0,
  bannerLeft: 0,
  bannerText: '',
  stepTimer: 0,
};

function loadLevel(index) {
  const def = levels[index];
  game.levelIndex = index;
  game.level = def;
  game.guards = def.guards.map(makeGuard);
  game.cameras = def.cameras.map(makeCamera);
  game.gems = def.gems.map((g) => ({ ...g, taken: false, bobPhase: Math.random() * 6 }));
  game.player = { x: def.playerStart.x, y: def.playerStart.y };
  game.detection = 0;
  game.alarm = false;
  game.alarmLeft = 0;
  game.coins = PLAYER_COIN_COUNT;
  game.coin = null;
  game.levelTime = 0;
  game.screen = 'intro';
  game.introLeft = 2.6;
}

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function gemsCollected() {
  return game.gems.filter((g) => g.taken).length;
}

function allGemsCollected() {
  return gemsCollected() === game.gems.length;
}

function circleHitsSolids(x, y, radius) {
  for (const rect of solidRects(game.level)) {
    const nearX = Math.max(rect.x, Math.min(x, rect.x + rect.w));
    const nearY = Math.max(rect.y, Math.min(y, rect.y + rect.h));
    if (Math.hypot(x - nearX, y - nearY) < radius) return true;
  }
  return false;
}

function movePlayer(dt) {
  const speed = input.sneaking ? PLAYER_SNEAK_SPEED : PLAYER_WALK_SPEED;
  const nx = game.player.x + input.moveX * speed * dt;
  const ny = game.player.y + input.moveY * speed * dt;
  if (!circleHitsSolids(nx, game.player.y, PLAYER_RADIUS)) game.player.x = nx;
  if (!circleHitsSolids(game.player.x, ny, PLAYER_RADIUS)) game.player.y = ny;
  game.player.x = Math.max(18 + PLAYER_RADIUS, Math.min(VIEW_W - 18 - PLAYER_RADIUS, game.player.x));
  game.player.y = Math.max(18 + PLAYER_RADIUS, Math.min(VIEW_H - 18 - PLAYER_RADIUS, game.player.y));
}

function nearestGemInReach() {
  return game.gems.find(
    (g) => !g.taken && Math.hypot(g.x - game.player.x, g.y - game.player.y) <= GEM_PICKUP_RADIUS
  );
}

function throwCoin(click) {
  if (game.coins <= 0 || !click) return;
  const dist = Math.hypot(click.x - game.player.x, click.y - game.player.y);
  if (dist > COIN_THROW_RANGE) return;
  game.coins -= 1;
  game.coin = { x: click.x, y: click.y, active: true, age: 0 };
  distractGuards(game.guards, click.x, click.y, COIN_DISTRACT_RADIUS);
  audio.coin();
}

function updateDetection(dt) {
  const inShadow = pointInShadow(game.player.x, game.player.y, game.level);
  let strongest = 0;
  for (const guard of game.guards) {
    const seen = seeStrength(guard.x, guard.y, guard.angle, GUARD_VIEW_RANGE, game.player, game.level);
    strongest = Math.max(strongest, seen);
  }
  for (const camera of game.cameras) {
    const seen = seeStrength(camera.x, camera.y, camera.angle, camera.range, game.player, game.level);
    strongest = Math.max(strongest, seen);
  }
  if (strongest > 0) {
    let rate = DETECT_FILL_RATE * strongest;
    const dist = Math.min(
      ...game.guards.map((g) => Math.hypot(g.x - game.player.x, g.y - game.player.y)),
      ...game.cameras.map((c) => Math.hypot(c.x - game.player.x, c.y - game.player.y))
    );
    if (dist < 90) rate = Math.max(rate, DETECT_FILL_CLOSE * strongest);
    if (input.sneaking) rate *= DETECT_SNEAK_FACTOR;
    if (inShadow) rate *= DETECT_SHADOW_FACTOR;
    game.detection = Math.min(100, game.detection + rate * dt);
  } else {
    game.detection = Math.max(0, game.detection - DETECT_DRAIN_RATE * dt);
  }
  if (game.detection >= 100 && !game.alarm) {
    game.alarm = true;
    game.alarmLeft = ALARM_SECONDS;
    game.ghost = false;
    raiseAlarm(game.guards, ALARM_SECONDS);
    audio.alarm();
  }
  if (game.alarm) {
    game.alarmLeft -= dt;
    if (game.alarmLeft <= 0) {
      game.alarm = false;
      game.detection = 55; // a near miss: the heat cools but the meter stays high
      for (const guard of game.guards) {
        if (guard.mode === 'chase') guard.mode = 'return';
      }
    }
  }
}

function checkCaught() {
  for (const guard of game.guards) {
    const dist = Math.hypot(guard.x - game.player.x, guard.y - game.player.y);
    if (dist < GUARD_CATCH_DISTANCE && (game.alarm || dist < 22)) {
      game.screen = 'failed';
      audio.caught();
      return true;
    }
  }
  return false;
}

function checkExit() {
  if (!allGemsCollected()) return;
  if (pointInRect(game.player.x, game.player.y, game.level.exit)) {
    const timeBonus = Math.max(0, 600 - Math.floor(game.levelTime) * 4);
    const levelScore = game.gems.length * 150 + timeBonus + (game.ghost ? 250 : 0);
    game.score += levelScore;
    audio.levelClear();
    if (game.levelIndex + 1 >= levels.length) {
      game.screen = 'victory';
      audio.victory();
    } else {
      game.screen = 'levelDone';
      game.bannerLeft = 0;
    }
  }
}

function updatePlay(dt) {
  game.levelTime += dt;
  game.totalTime += dt;
  input.readMove();
  movePlayer(dt);

  // footsteps: a guard step ticks when a guard walks near the player
  game.stepTimer -= dt;
  if (game.stepTimer <= 0) {
    game.stepTimer = 0.55;
    for (const guard of game.guards) {
      const dist = Math.hypot(guard.x - game.player.x, guard.y - game.player.y);
      if (dist < 320) audio.footstep(dist);
    }
  }

  for (const guard of game.guards) updateGuard(guard, dt, game.player, game.level);
  for (const camera of game.cameras) updateCamera(camera, dt);
  for (const gem of game.gems) gem.bobPhase += dt * 3;
  if (game.coin) {
    game.coin.age += dt;
    if (game.coin.age > 3.5) game.coin = null;
  }

  const click = input.takeCoinClick();
  if (click) throwCoin(click);

  if (input.wasPressed('e')) {
    const gem = nearestGemInReach();
    if (gem) {
      gem.taken = true;
      game.score += 50;
      audio.pickup();
    }
  }
  if (input.wasPressed('r')) {
    loadLevel(game.levelIndex);
    return;
  }

  updateDetection(dt);
  if (checkCaught()) return;
  checkExit();
}

function renderPlay() {
  drawFloor(ctx, game.level);
  drawShadows(ctx, game.level);
  drawCover(ctx, game.level);
  drawExit(ctx, game.level, allGemsCollected());
  drawGems(ctx, game.gems);
  for (const camera of game.cameras) drawCamera(ctx, camera);
  for (const guard of game.guards) drawGuard(ctx, guard);
  drawPlayer(ctx, game.player, input.sneaking);
  drawCoin(ctx, game.coin);
  drawHud(ctx, {
    levelName: game.level.name,
    gemsGot: gemsCollected(),
    gemsTotal: game.gems.length,
    timeText: formatTime(game.levelTime),
    coins: game.coins,
    muted: audio.muted,
    detection: game.detection,
    alarm: game.alarm,
  });
  const gem = nearestGemInReach();
  if (gem) drawPrompt(ctx, `Press E — steal the ${gem.name}`);
  else if (!allGemsCollected()) drawPrompt(ctx, 'Collect every gem, then reach the green EXIT');
  else drawPrompt(ctx, 'All gems stolen — reach the green EXIT!');
  if (game.alarm) drawPrompt(ctx, 'ALARM! Break line of sight and hide!');
}

let lastTime = 0;

function frame(now) {
  const dt = Math.min(0.05, (now - lastTime) / 1000 || 0.016);
  lastTime = now;

  if (input.wasPressed('m')) audio.toggleMute();
  if (input.wasPressed('enter') || input.wasPressed(' ')) {
    audio.unlock();
    if (game.screen === 'title') loadLevel(0);
    else if (game.screen === 'levelDone') loadLevel(game.levelIndex + 1);
    else if (game.screen === 'failed') loadLevel(game.levelIndex);
    else if (game.screen === 'victory') {
      game.score = 0;
      game.totalTime = 0;
      game.ghost = true;
      loadLevel(0);
    }
  }
  if (input.wasPressed('r') && (game.screen === 'failed' || game.screen === 'levelDone')) {
    loadLevel(game.levelIndex);
  }

  if (game.screen === 'title') {
    drawTitleScreen(ctx);
  } else if (game.screen === 'intro') {
    game.introLeft -= dt;
    renderPlay();
    ctx.fillStyle = 'rgba(5, 7, 14, 0.72)';
    ctx.fillRect(0, 0, VIEW_W, VIEW_H);
    ctx.fillStyle = '#ffd94d';
    ctx.font = 'bold 34px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(game.level.name, VIEW_W / 2, 250);
    ctx.fillStyle = '#e8ecf5';
    ctx.font = '17px monospace';
    ctx.fillText(game.level.brief, VIEW_W / 2, 295);
    if (game.introLeft <= 0) game.screen = 'play';
  } else if (game.screen === 'play') {
    updatePlay(dt);
    renderPlay();
  } else if (game.screen === 'levelDone') {
    renderPlay();
    drawCenterPanel(ctx, 'VAULT EMPTIED!', [
      `${game.level.name} cleared in ${formatTime(game.levelTime)}.`,
      `Score so far: ${game.score}`,
      game.ghost ? 'GHOST: still never spotted — +250' : 'Spotted once — ghost bonus lost',
      '',
      'Press ENTER for the next vault',
    ]);
  } else if (game.screen === 'failed') {
    renderPlay();
    drawCenterPanel(
      ctx,
      'CAUGHT!',
      [
        'A guard grabbed you in the dark.',
        `${gemsCollected()} of ${game.gems.length} gems stolen this level.`,
        '',
        'Press ENTER or R to try the vault again',
      ],
      '#ff5d5d'
    );
  } else if (game.screen === 'victory') {
    ctx.fillStyle = '#0b0e1a';
    ctx.fillRect(0, 0, VIEW_W, VIEW_H);
    drawCenterPanel(
      ctx,
      'HEIST COMPLETE!',
      [
        'All 3 vaults emptied. 12 gems stolen.',
        `Total time ${formatTime(game.totalTime)}.`,
        game.ghost ? 'GHOST BONUS: never fully spotted — +500 points' : 'You were spotted — no ghost bonus',
        `Final score: ${game.score + (game.ghost ? 500 : 0)}`,
        '',
        'Press ENTER to steal again',
      ],
      '#39d98a'
    );
  }

  input.endFrame();
  requestAnimationFrame(frame);
}

// Screenshot modes render one fixed scene synchronously and stop.
const params = new URLSearchParams(window.location.search);
const shot = params.get('shot');
const seed = Number(params.get('seed') || '1');
if (shot && renderShot(ctx, shot, seed)) {
  document.title = `SHADOW VAULT — ${shot}`;
} else {
  requestAnimationFrame(frame);
}
