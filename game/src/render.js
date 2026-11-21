// SHADOW VAULT — everything drawn on the canvas.
// One job: turn the game state into pixels (floor, cover, cones, actors, HUD).

import { VIEW_W, VIEW_H, PALETTE, GUARD_VIEW_RANGE, GUARD_VIEW_HALF_ANGLE } from './config.js';
import { pointInRect } from './levels.js';

export function drawFloor(ctx, level) {
  ctx.fillStyle = PALETTE.floor;
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  ctx.fillStyle = PALETTE.floorAlt;
  for (let y = 0; y < 15; y++) {
    for (let x = 0; x < 24; x++) {
      if ((x + y) % 2 === 0) ctx.fillRect(x * 40, y * 40, 40, 40);
    }
  }
  // faint carpet runner down the middle of the gallery
  ctx.fillStyle = 'rgba(124, 92, 255, 0.08)';
  ctx.fillRect(430, 18, 100, 564);
}

export function drawShadows(ctx, level) {
  for (const zone of level.shadows) {
    ctx.fillStyle = PALETTE.shadow;
    ctx.fillRect(zone.x, zone.y, zone.w, zone.h);
    ctx.strokeStyle = PALETTE.shadowEdge;
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 6]);
    ctx.strokeRect(zone.x, zone.y, zone.w, zone.h);
    ctx.setLineDash([]);
    ctx.fillStyle = 'rgba(154, 163, 184, 0.8)';
    ctx.font = '11px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(zone.w >= 140 ? 'SHADOW — hard to spot here' : 'SHADOW', zone.x + 8, zone.y + 16);
  }
}

export function drawCover(ctx, level) {
  for (const wall of level.walls) {
    ctx.fillStyle = PALETTE.wall;
    ctx.fillRect(wall.x, wall.y, wall.w, wall.h);
    ctx.fillStyle = PALETTE.wallTop;
    if (wall.h <= 18) ctx.fillRect(wall.x, wall.y, wall.w, 5);
    else ctx.fillRect(wall.x, wall.y, 5, wall.h);
  }
  for (const crate of level.crates) {
    ctx.fillStyle = PALETTE.crate;
    ctx.fillRect(crate.x, crate.y, crate.w, crate.h);
    ctx.strokeStyle = PALETTE.crateTop;
    ctx.lineWidth = 2;
    ctx.strokeRect(crate.x + 3, crate.y + 3, crate.w - 6, crate.h - 6);
    ctx.beginPath();
    ctx.moveTo(crate.x, crate.y);
    ctx.lineTo(crate.x + crate.w, crate.y + crate.h);
    ctx.moveTo(crate.x + crate.w, crate.y);
    ctx.lineTo(crate.x, crate.y + crate.h);
    ctx.stroke();
  }
  for (const pillar of level.pillars) {
    ctx.fillStyle = PALETTE.pillar;
    ctx.beginPath();
    ctx.arc(pillar.x + pillar.w / 2, pillar.y + pillar.h / 2, pillar.w / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#5a6a94';
    ctx.lineWidth = 2;
    ctx.stroke();
  }
}

export function drawExit(ctx, level, allGemsCollected) {
  const e = level.exit;
  ctx.save();
  if (allGemsCollected) {
    ctx.shadowColor = PALETTE.exit;
    ctx.shadowBlur = 22;
  }
  ctx.fillStyle = allGemsCollected ? PALETTE.exit : '#2c7a52';
  ctx.fillRect(e.x, e.y, e.w, e.h);
  ctx.restore();
  ctx.strokeStyle = '#e8ecf5';
  ctx.lineWidth = 2;
  ctx.strokeRect(e.x, e.y, e.w, e.h);
  ctx.fillStyle = '#0b1f14';
  ctx.font = 'bold 13px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('EXIT', e.x + e.w / 2, e.y + e.h / 2 + 5);
}

export function drawGems(ctx, gems) {
  for (const gem of gems) {
    if (gem.taken) continue;
    const bob = Math.sin(gem.bobPhase || 0) * 2;
    ctx.save();
    ctx.shadowColor = PALETTE.gem;
    ctx.shadowBlur = 14;
    ctx.fillStyle = PALETTE.gem;
    ctx.beginPath();
    ctx.moveTo(gem.x, gem.y - 10 + bob);
    ctx.lineTo(gem.x + 8, gem.y + bob);
    ctx.lineTo(gem.x, gem.y + 10 + bob);
    ctx.lineTo(gem.x - 8, gem.y + bob);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.beginPath();
    ctx.moveTo(gem.x, gem.y - 6 + bob);
    ctx.lineTo(gem.x + 3, gem.y + bob);
    ctx.lineTo(gem.x, gem.y + 4 + bob);
    ctx.lineTo(gem.x - 3, gem.y + bob);
    ctx.closePath();
    ctx.fill();
  }
}

export function drawVisionCone(ctx, x, y, angle, range, alerted) {
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.arc(x, y, range, angle - GUARD_VIEW_HALF_ANGLE, angle + GUARD_VIEW_HALF_ANGLE);
  ctx.closePath();
  ctx.fillStyle = alerted ? PALETTE.coneAlert : PALETTE.coneCalm;
  ctx.fill();
  ctx.strokeStyle = alerted ? 'rgba(255, 93, 93, 0.7)' : PALETTE.coneEdge;
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.restore();
}

export function drawGuard(ctx, guard) {
  const alerted = guard.mode === 'chase';
  drawVisionCone(ctx, guard.x, guard.y, guard.angle, GUARD_VIEW_RANGE, alerted);
  // body
  ctx.save();
  ctx.shadowColor = PALETTE.guard;
  ctx.shadowBlur = alerted ? 16 : 6;
  ctx.fillStyle = PALETTE.guardBody;
  ctx.beginPath();
  ctx.arc(guard.x, guard.y, 13, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  ctx.strokeStyle = '#ffd9d9';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(guard.x, guard.y, 13, 0, Math.PI * 2);
  ctx.stroke();
  // facing tick + eyes
  const ex = Math.cos(guard.angle);
  const ey = Math.sin(guard.angle);
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(guard.x, guard.y);
  ctx.lineTo(guard.x + ex * 18, guard.y + ey * 18);
  ctx.stroke();
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(guard.x + ex * 6 - ey * 4, guard.y + ey * 6 + ex * 4, 2, 0, Math.PI * 2);
  ctx.arc(guard.x + ex * 6 + ey * 4, guard.y + ey * 6 - ex * 4, 2, 0, Math.PI * 2);
  ctx.fill();
  // state mark
  ctx.font = 'bold 11px monospace';
  ctx.textAlign = 'center';
  if (guard.mode === 'chase') {
    ctx.fillStyle = '#ff5d5d';
    ctx.fillText('!', guard.x, guard.y - 20);
  } else if (guard.mode === 'investigate') {
    ctx.fillStyle = '#ffd94d';
    ctx.fillText('?', guard.x, guard.y - 20);
  }
}

export function drawCamera(ctx, camera) {
  drawVisionCone(ctx, camera.x, camera.y, camera.angle, camera.range, false);
  ctx.fillStyle = '#8a93ad';
  ctx.fillRect(camera.x - 8, camera.y - 6, 16, 12);
  ctx.fillStyle = '#ff5d5d';
  ctx.beginPath();
  ctx.arc(camera.x + Math.cos(camera.angle) * 10, camera.y + Math.sin(camera.angle) * 10, 3, 0, Math.PI * 2);
  ctx.fill();
}

export function drawPlayer(ctx, player, sneaking) {
  ctx.save();
  ctx.shadowColor = PALETTE.playerCloak;
  ctx.shadowBlur = sneaking ? 4 : 12;
  ctx.fillStyle = PALETTE.playerCloak;
  ctx.beginPath();
  ctx.arc(player.x, player.y, 13, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  ctx.fillStyle = PALETTE.player;
  ctx.beginPath();
  ctx.arc(player.x, player.y, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#1b1f2e';
  ctx.beginPath();
  ctx.arc(player.x - 3, player.y - 2, 1.8, 0, Math.PI * 2);
  ctx.arc(player.x + 3, player.y - 2, 1.8, 0, Math.PI * 2);
  ctx.fill();
  if (sneaking) {
    ctx.strokeStyle = 'rgba(232, 236, 245, 0.7)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([3, 4]);
    ctx.beginPath();
    ctx.arc(player.x, player.y, 18, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
  }
}

export function drawCoin(ctx, coin) {
  if (!coin || !coin.active) return;
  ctx.fillStyle = '#ffd94d';
  ctx.beginPath();
  ctx.arc(coin.x, coin.y, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.strokeStyle = 'rgba(255, 217, 77, 0.6)';
  ctx.beginPath();
  ctx.arc(coin.x, coin.y, 12 + Math.sin(coin.age * 6) * 3, 0, Math.PI * 2);
  ctx.stroke();
}

export function drawHud(ctx, hud) {
  ctx.fillStyle = 'rgba(8, 10, 20, 0.82)';
  ctx.fillRect(0, 0, VIEW_W, 34);
  ctx.fillStyle = PALETTE.hud;
  ctx.font = 'bold 14px monospace';
  ctx.textAlign = 'left';
  ctx.fillText(hud.levelName, 12, 22);
  ctx.textAlign = 'center';
  ctx.fillStyle = PALETTE.gem;
  ctx.fillText(`GEMS ${hud.gemsGot}/${hud.gemsTotal}`, 330, 22);
  ctx.fillStyle = PALETTE.hud;
  ctx.fillText(`TIME ${hud.timeText}`, 470, 22);
  ctx.fillText(`COINS ${hud.coins}`, 580, 22);
  if (hud.muted) ctx.fillText('MUTED (M)', 690, 22);
  // detection eye meter
  const mx = 800;
  const my = 12;
  const mw = 130;
  ctx.fillStyle = '#2c3550';
  ctx.fillRect(mx, my, mw, 12);
  const fill = Math.max(0, Math.min(1, hud.detection / 100));
  ctx.fillStyle = fill > 0.66 ? PALETTE.danger : fill > 0.33 ? PALETTE.gem : PALETTE.exit;
  ctx.fillRect(mx, my, mw * fill, 12);
  ctx.strokeStyle = '#e8ecf5';
  ctx.lineWidth = 1;
  ctx.strokeRect(mx, my, mw, 12);
  ctx.fillStyle = PALETTE.hud;
  ctx.font = '11px monospace';
  ctx.textAlign = 'left';
  ctx.fillText(hud.alarm ? 'SPOTTED!' : 'UNSEEN', mx - 62, 22);
}

export function drawPrompt(ctx, text) {
  if (!text) return;
  ctx.font = 'bold 15px monospace';
  const w = ctx.measureText(text).width + 24;
  ctx.fillStyle = 'rgba(8, 10, 20, 0.85)';
  ctx.fillRect((VIEW_W - w) / 2, VIEW_H - 52, w, 30);
  ctx.fillStyle = PALETTE.gem;
  ctx.textAlign = 'center';
  ctx.fillText(text, VIEW_W / 2, VIEW_H - 31);
}

export function drawCenterPanel(ctx, title, lines, accent) {
  ctx.fillStyle = 'rgba(5, 7, 14, 0.78)';
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  ctx.fillStyle = accent || PALETTE.gold;
  ctx.font = 'bold 42px monospace';
  ctx.textAlign = 'center';
  ctx.fillText(title, VIEW_W / 2, 190);
  ctx.fillStyle = PALETTE.hud;
  ctx.font = '16px monospace';
  lines.forEach((line, i) => {
    ctx.fillText(line, VIEW_W / 2, 240 + i * 30);
  });
}

export function drawTitleScreen(ctx) {
  ctx.fillStyle = '#0b0e1a';
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  // decorative vault door and gems
  ctx.strokeStyle = '#3a4157';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(VIEW_W / 2, 280, 110, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = '#7c5cff';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(VIEW_W / 2, 280, 82, 0, Math.PI * 2);
  ctx.stroke();
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    ctx.fillStyle = i % 2 ? '#ffd94d' : '#39d98a';
    ctx.beginPath();
    ctx.arc(VIEW_W / 2 + Math.cos(a) * 96, 280 + Math.sin(a) * 96, 7, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = PALETTE.gold;
  ctx.font = 'bold 52px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('SHADOW VAULT', VIEW_W / 2, 110);
  ctx.fillStyle = PALETTE.hud;
  ctx.font = '18px monospace';
  ctx.fillText('The Midnight Heist', VIEW_W / 2, 145);
  ctx.font = '15px monospace';
  ctx.fillStyle = PALETTE.hudDim;
  ctx.fillText('Steal every gem. Reach the exit. Never be seen.', VIEW_W / 2, 420);
  ctx.fillStyle = PALETTE.hud;
  ctx.fillText('WASD / Arrows — move    SHIFT — sneak    E — pick up gem', VIEW_W / 2, 455);
  ctx.fillText('CLICK — throw a coin to distract guards    R — restart    M — mute', VIEW_W / 2, 480);
  ctx.fillStyle = PALETTE.gold;
  ctx.font = 'bold 17px monospace';
  ctx.fillText('Press ENTER to begin the heist', VIEW_W / 2, 530);
}

export function isPointInside(px, py, rect) {
  return pointInRect(px, py, rect);
}
