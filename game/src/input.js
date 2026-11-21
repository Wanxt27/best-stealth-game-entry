// SHADOW VAULT — keyboard and mouse input state.
// One job: turn raw browser events into a clean per-frame input snapshot.

export function createInput(canvas) {
  const keys = new Set();
  const state = {
    keys,
    moveX: 0,
    moveY: 0,
    sneaking: false,
    coinClick: null, // { x, y } in canvas coordinates, consumed once read
    pressed: new Set(), // keys pressed since last frame, consumed once read
  };

  function canvasPoint(event) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: (event.clientX - rect.left) * (canvas.width / rect.width),
      y: (event.clientY - rect.top) * (canvas.height / rect.height),
    };
  }

  window.addEventListener('keydown', (event) => {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(event.key)) {
      event.preventDefault();
    }
    if (!event.repeat) state.pressed.add(event.key.toLowerCase());
    keys.add(event.key.toLowerCase());
  });
  window.addEventListener('keyup', (event) => {
    keys.delete(event.key.toLowerCase());
  });
  window.addEventListener('blur', () => keys.clear());
  canvas.addEventListener('mousedown', (event) => {
    state.coinClick = canvasPoint(event);
  });

  state.readMove = function readMove() {
    let x = 0;
    let y = 0;
    if (keys.has('a') || keys.has('arrowleft')) x -= 1;
    if (keys.has('d') || keys.has('arrowright')) x += 1;
    if (keys.has('w') || keys.has('arrowup')) y -= 1;
    if (keys.has('s') || keys.has('arrowdown')) y += 1;
    const len = Math.hypot(x, y);
    if (len > 0) {
      x /= len;
      y /= len;
    }
    state.moveX = x;
    state.moveY = y;
    state.sneaking = keys.has('shift');
    return state;
  };

  state.wasPressed = function wasPressed(key) {
    return state.pressed.has(key.toLowerCase());
  };

  state.takeCoinClick = function takeCoinClick() {
    const click = state.coinClick;
    state.coinClick = null;
    return click;
  };

  state.endFrame = function endFrame() {
    state.pressed.clear();
  };

  return state;
}
