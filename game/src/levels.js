// SHADOW VAULT — the three museum vault levels.
// One job: describe each room (walls, cover, shadows, gems, guards, exit).

// A rect is { x, y, w, h }. A guard patrol is { path: [[x,y], ...], pause }.
// A gem is { x, y, name }. The exit is a rect. The player start is { x, y }.

export const LEVEL_NAMES = [
  'Level 1 — The Quiet Gallery',
  'Level 2 — The Hall of Crowns',
  'Level 3 — The Midnight Vault',
];

export function buildLevels() {
  return [
    {
      name: LEVEL_NAMES[0],
      brief: 'Two guards, slow patrols. Learn the cones, grab 3 gems, slip out.',
      playerStart: { x: 70, y: 530 },
      exit: { x: 872, y: 40, w: 56, h: 56 },
      walls: [
        { x: 0, y: 0, w: 960, h: 18 },
        { x: 0, y: 582, w: 960, h: 18 },
        { x: 0, y: 0, w: 18, h: 600 },
        { x: 942, y: 0, w: 18, h: 600 },
        { x: 300, y: 130, w: 18, h: 200 },
        { x: 620, y: 280, w: 18, h: 200 },
      ],
      crates: [
        { x: 180, y: 380, w: 64, h: 64 },
        { x: 420, y: 120, w: 64, h: 64 },
        { x: 700, y: 420, w: 64, h: 64 },
        { x: 520, y: 300, w: 56, h: 56 },
      ],
      pillars: [
        { x: 250, y: 210, w: 34, h: 34 },
        { x: 690, y: 170, w: 34, h: 34 },
      ],
      shadows: [
        { x: 150, y: 90, w: 150, h: 110 },
        { x: 560, y: 430, w: 180, h: 110 },
        { x: 800, y: 180, w: 120, h: 130 },
      ],
      gems: [
        { x: 470, y: 90, name: 'Moon Opal' },
        { x: 850, y: 300, name: 'Star Sapphire' },
        { x: 250, y: 500, name: 'Ember Ruby' },
      ],
      guards: [
        { path: [[360, 260], [360, 480], [560, 480], [560, 260]], pause: 1.2 },
        { path: [[760, 120], [760, 330]], pause: 1.6 },
      ],
      cameras: [],
    },
    {
      name: LEVEL_NAMES[1],
      brief: 'Four guards and a sweeping camera. Shadows are your best friends.',
      playerStart: { x: 70, y: 530 },
      exit: { x: 872, y: 40, w: 56, h: 56 },
      walls: [
        { x: 0, y: 0, w: 960, h: 18 },
        { x: 0, y: 582, w: 960, h: 18 },
        { x: 0, y: 0, w: 18, h: 600 },
        { x: 942, y: 0, w: 18, h: 600 },
        { x: 220, y: 100, w: 18, h: 180 },
        { x: 480, y: 320, w: 18, h: 180 },
        { x: 700, y: 90, w: 18, h: 180 },
        { x: 340, y: 430, w: 260, h: 18 },
      ],
      crates: [
        { x: 130, y: 200, w: 64, h: 64 },
        { x: 380, y: 120, w: 64, h: 64 },
        { x: 620, y: 380, w: 64, h: 64 },
        { x: 800, y: 300, w: 56, h: 56 },
        { x: 260, y: 480, w: 56, h: 56 },
      ],
      pillars: [
        { x: 300, y: 300, w: 34, h: 34 },
        { x: 580, y: 180, w: 34, h: 34 },
        { x: 830, y: 480, w: 34, h: 34 },
      ],
      shadows: [
        { x: 90, y: 90, w: 140, h: 100 },
        { x: 430, y: 210, w: 150, h: 90 },
        { x: 660, y: 470, w: 170, h: 90 },
        { x: 820, y: 120, w: 110, h: 120 },
      ],
      gems: [
        { x: 480, y: 80, name: 'Moon Opal' },
        { x: 890, y: 420, name: 'Star Sapphire' },
        { x: 120, y: 480, name: 'Ember Ruby' },
        { x: 620, y: 260, name: 'Void Diamond' },
      ],
      guards: [
        { path: [[280, 160], [280, 380], [420, 380]], pause: 1.0 },
        { path: [[640, 140], [640, 300], [860, 300]], pause: 1.0 },
        { path: [[180, 420], [420, 420], [420, 520]], pause: 1.4 },
        { path: [[760, 460], [880, 460], [880, 200]], pause: 1.2 },
      ],
      cameras: [
        { x: 480, y: 24, sweepFrom: -0.9, sweepTo: 0.9, speed: 0.5, range: 210 },
      ],
    },
    {
      name: LEVEL_NAMES[2],
      brief: 'Five guards, two cameras, tight patrols. Ghost it — never be seen.',
      playerStart: { x: 70, y: 530 },
      exit: { x: 872, y: 40, w: 56, h: 56 },
      walls: [
        { x: 0, y: 0, w: 960, h: 18 },
        { x: 0, y: 582, w: 960, h: 18 },
        { x: 0, y: 0, w: 18, h: 600 },
        { x: 942, y: 0, w: 18, h: 600 },
        { x: 180, y: 90, w: 18, h: 220 },
        { x: 400, y: 290, w: 18, h: 220 },
        { x: 620, y: 90, w: 18, h: 220 },
        { x: 780, y: 330, w: 18, h: 190 },
        { x: 260, y: 470, w: 320, h: 18 },
      ],
      crates: [
        { x: 110, y: 300, w: 64, h: 64 },
        { x: 320, y: 130, w: 64, h: 64 },
        { x: 520, y: 430, w: 64, h: 64 },
        { x: 700, y: 430, w: 56, h: 56 },
        { x: 840, y: 180, w: 56, h: 56 },
        { x: 470, y: 200, w: 56, h: 56 },
      ],
      pillars: [
        { x: 250, y: 380, w: 34, h: 34 },
        { x: 560, y: 330, w: 34, h: 34 },
        { x: 700, y: 200, w: 34, h: 34 },
        { x: 880, y: 520, w: 34, h: 34 },
      ],
      shadows: [
        { x: 80, y: 110, w: 130, h: 100 },
        { x: 330, y: 330, w: 140, h: 90 },
        { x: 640, y: 300, w: 130, h: 90 },
        { x: 800, y: 480, w: 120, h: 80 },
        { x: 440, y: 80, w: 130, h: 90 },
      ],
      gems: [
        { x: 300, y: 70, name: 'Moon Opal' },
        { x: 520, y: 90, name: 'Star Sapphire' },
        { x: 110, y: 500, name: 'Ember Ruby' },
        { x: 730, y: 260, name: 'Void Diamond' },
        { x: 880, y: 380, name: 'Crown Pearl' },
      ],
      guards: [
        { path: [[240, 200], [240, 420], [360, 420]], pause: 0.8 },
        { path: [[480, 140], [480, 260], [600, 260]], pause: 0.8 },
        { path: [[700, 360], [700, 520], [860, 520]], pause: 1.0 },
        { path: [[860, 120], [860, 280]], pause: 1.2 },
        { path: [[140, 420], [320, 420], [320, 540]], pause: 1.0 },
      ],
      cameras: [
        { x: 330, y: 24, sweepFrom: -1.0, sweepTo: 1.0, speed: 0.6, range: 200 },
        { x: 660, y: 576, sweepFrom: 2.1, sweepTo: 4.2, speed: 0.55, range: 200 },
      ],
    },
  ];
}

// Every solid rectangle in a level (walls, crates and pillars all block sight and movement).
export function solidRects(level) {
  return [...level.walls, ...level.crates, ...level.pillars];
}

export function pointInRect(px, py, rect) {
  return px >= rect.x && px <= rect.x + rect.w && py >= rect.y && py <= rect.y + rect.h;
}

export function pointInShadow(px, py, level) {
  return level.shadows.some((zone) => pointInRect(px, py, zone));
}
