// SHADOW VAULT — guard brains: patrols, vision cones, line of sight, chase.
// One job: decide what each guard does and whether it can see the player.

import {
  GUARD_PATROL_SPEED,
  GUARD_CHASE_SPEED,
  GUARD_VIEW_RANGE,
  GUARD_VIEW_HALF_ANGLE,
  COIN_INVESTIGATE_SECONDS,
} from './config.js';
import { solidRects, pointInRect } from './levels.js';

export function makeGuard(def) {
  const start = def.path[0];
  return {
    path: def.path,
    pause: def.pause || 1,
    x: start[0],
    y: start[1],
    angle: 0,
    targetIndex: 1 % def.path.length,
    waitLeft: 0,
    mode: 'patrol', // patrol | investigate | chase | return
    investigate: null, // { x, y, left }
    chaseLeft: 0,
    homeX: start[0],
    homeY: start[1],
    stepPhase: Math.random() * Math.PI * 2,
  };
}

export function makeCamera(def) {
  return {
    x: def.x,
    y: def.y,
    sweepFrom: def.sweepFrom,
    sweepTo: def.sweepTo,
    speed: def.speed,
    range: def.range,
    angle: def.sweepFrom,
    dir: 1,
  };
}

function angleTo(fromX, fromY, toX, toY) {
  return Math.atan2(toY - fromY, toX - fromX);
}

function angleDifference(a, b) {
  let d = a - b;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d < -Math.PI) d += Math.PI * 2;
  return d;
}

function moveToward(guard, tx, ty, speed, dt) {
  const dx = tx - guard.x;
  const dy = ty - guard.y;
  const dist = Math.hypot(dx, dy);
  if (dist < 1) return true;
  const step = Math.min(dist, speed * dt);
  guard.x += (dx / dist) * step;
  guard.y += (dy / dist) * step;
  guard.angle = angleTo(guard.x, guard.y, tx, ty);
  return dist - step < 1;
}

export function updateGuard(guard, dt, player, level) {
  guard.stepPhase += dt * 6;
  if (guard.mode === 'chase') {
    guard.chaseLeft -= dt;
    moveToward(guard, player.x, player.y, GUARD_CHASE_SPEED, dt);
    if (guard.chaseLeft <= 0) {
      guard.mode = 'return';
    }
    return;
  }
  if (guard.mode === 'investigate' && guard.investigate) {
    const arrived = moveToward(guard, guard.investigate.x, guard.investigate.y, GUARD_PATROL_SPEED * 1.35, dt);
    if (arrived) {
      guard.investigate.left -= dt;
      guard.angle += dt * 1.6; // look around the spot
      if (guard.investigate.left <= 0) {
        guard.mode = 'return';
        guard.investigate = null;
      }
    }
    return;
  }
  if (guard.mode === 'return') {
    const home = guard.path[0];
    const arrived = moveToward(guard, home[0], home[1], GUARD_PATROL_SPEED, dt);
    if (arrived) {
      guard.mode = 'patrol';
      guard.targetIndex = 1 % guard.path.length;
    }
    return;
  }
  // patrol
  if (guard.waitLeft > 0) {
    guard.waitLeft -= dt;
    return;
  }
  const target = guard.path[guard.targetIndex];
  const arrived = moveToward(guard, target[0], target[1], GUARD_PATROL_SPEED, dt);
  if (arrived) {
    guard.targetIndex = (guard.targetIndex + 1) % guard.path.length;
    guard.waitLeft = guard.pause;
  }
}

export function updateCamera(camera, dt) {
  camera.angle += camera.dir * camera.speed * dt;
  if (camera.angle > camera.sweepTo) {
    camera.angle = camera.sweepTo;
    camera.dir = -1;
  } else if (camera.angle < camera.sweepFrom) {
    camera.angle = camera.sweepFrom;
    camera.dir = 1;
  }
}

export function distractGuards(guards, x, y, radius) {
  for (const guard of guards) {
    if (guard.mode === 'chase') continue;
    const dist = Math.hypot(guard.x - x, guard.y - y);
    if (dist <= radius) {
      guard.mode = 'investigate';
      guard.investigate = { x, y, left: COIN_INVESTIGATE_SECONDS };
    }
  }
}

export function raiseAlarm(guards, seconds) {
  for (const guard of guards) {
    guard.mode = 'chase';
    guard.chaseLeft = seconds;
    guard.investigate = null;
  }
}

// Does segment (x1,y1)-(x2,y2) cross rect? Used for line-of-sight checks.
function segmentHitsRect(x1, y1, x2, y2, rect) {
  if (pointInRect(x1, y1, rect) || pointInRect(x2, y2, rect)) return true;
  const edges = [
    [rect.x, rect.y, rect.x + rect.w, rect.y],
    [rect.x + rect.w, rect.y, rect.x + rect.w, rect.y + rect.h],
    [rect.x + rect.w, rect.y + rect.h, rect.x, rect.y + rect.h],
    [rect.x, rect.y + rect.h, rect.x, rect.y],
  ];
  for (const [ax, ay, bx, by] of edges) {
    if (segmentsCross(x1, y1, x2, y2, ax, ay, bx, by)) return true;
  }
  return false;
}

function segmentsCross(x1, y1, x2, y2, x3, y3, x4, y4) {
  const d1 = cross(x3, y3, x4, y4, x1, y1);
  const d2 = cross(x3, y3, x4, y4, x2, y2);
  const d3 = cross(x1, y1, x2, y2, x3, y3);
  const d4 = cross(x1, y1, x2, y2, x4, y4);
  return ((d1 > 0 && d2 < 0) || (d1 < 0 && d2 > 0)) && ((d3 > 0 && d4 < 0) || (d3 < 0 && d4 > 0));
}

function cross(ax, ay, bx, by, cx, cy) {
  return (bx - ax) * (cy - ay) - (by - ay) * (cx - ax);
}

export function hasLineOfSight(x1, y1, x2, y2, level) {
  for (const rect of solidRects(level)) {
    if (segmentHitsRect(x1, y1, x2, y2, rect)) return false;
  }
  return true;
}

// How strongly a watcher at (wx,wy) facing `angle` sees the player: 0 = not seen.
export function seeStrength(wx, wy, angle, range, player, level) {
  const dx = player.x - wx;
  const dy = player.y - wy;
  const dist = Math.hypot(dx, dy);
  if (dist > range) return 0;
  const diff = Math.abs(angleDifference(Math.atan2(dy, dx), angle));
  if (diff > GUARD_VIEW_HALF_ANGLE) return 0;
  if (!hasLineOfSight(wx, wy, player.x, player.y, level)) return 0;
  const closeness = 1 - dist / range;
  return 0.35 + closeness * 0.65;
}
