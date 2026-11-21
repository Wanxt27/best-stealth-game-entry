// SHADOW VAULT — shared tuning constants for the whole game.
// One job: every number the rest of the game agrees on lives here.

export const VIEW_W = 960;
export const VIEW_H = 600;

export const PLAYER_RADIUS = 11;
export const PLAYER_WALK_SPEED = 150;
export const PLAYER_SNEAK_SPEED = 78;
export const PLAYER_COIN_COUNT = 3;

export const GUARD_RADIUS = 13;
export const GUARD_PATROL_SPEED = 62;
export const GUARD_CHASE_SPEED = 132;
export const GUARD_VIEW_RANGE = 235;
export const GUARD_VIEW_HALF_ANGLE = 0.62; // radians, about 35 degrees each side
export const GUARD_CATCH_DISTANCE = 30;

export const DETECT_FILL_RATE = 95; // points per second while fully seen, standing
export const DETECT_FILL_CLOSE = 170; // points per second while seen very close
export const DETECT_DRAIN_RATE = 42; // points per second while unseen
export const DETECT_SNEAK_FACTOR = 0.45; // sneaking fills the meter slower
export const DETECT_SHADOW_FACTOR = 0.22; // standing in a shadow zone fills it slower
export const ALARM_SECONDS = 6; // how long guards chase after a full meter

export const COIN_THROW_RANGE = 420;
export const COIN_DISTRACT_RADIUS = 280;
export const COIN_INVESTIGATE_SECONDS = 3.2;

export const GEM_PICKUP_RADIUS = 30;

export const PALETTE = {
  floor: '#1b1f2e',
  floorAlt: '#202636',
  wall: '#3a4157',
  wallTop: '#4d5878',
  crate: '#6b5433',
  crateTop: '#8a6f45',
  pillar: '#39415e',
  shadow: 'rgba(8, 10, 20, 0.62)',
  shadowEdge: '#2c3550',
  gem: '#ffd94d',
  gemGlow: 'rgba(255, 217, 77, 0.35)',
  exit: '#39d98a',
  exitGlow: 'rgba(57, 217, 138, 0.30)',
  player: '#e8ecf5',
  playerCloak: '#7c5cff',
  guard: '#ff5d5d',
  guardBody: '#c93a3a',
  coneCalm: 'rgba(255, 214, 90, 0.20)',
  coneAlert: 'rgba(255, 70, 70, 0.30)',
  coneEdge: 'rgba(255, 214, 90, 0.55)',
  hud: '#e8ecf5',
  hudDim: '#9aa3b8',
  gold: '#ffd94d',
  danger: '#ff5d5d',
};
