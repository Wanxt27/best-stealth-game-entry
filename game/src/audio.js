// SHADOW VAULT — all sound is generated with WebAudio, no audio files.
// One job: short bleeps for pickup, alarm, coin, win, footsteps — safely silent
// when audio is unavailable.

export function createAudio() {
  const audio = {
    ctx: null,
    muted: false,
    enabled: false,
  };

  audio.unlock = function unlock() {
    if (audio.enabled) return;
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return;
      audio.ctx = new Ctx();
      audio.enabled = true;
    } catch (err) {
      audio.enabled = false;
    }
  };

  audio.toggleMute = function toggleMute() {
    audio.muted = !audio.muted;
    return audio.muted;
  };

  function beep(freq, seconds, type, volume, when) {
    if (!audio.enabled || audio.muted || !audio.ctx) return;
    try {
      if (audio.ctx.state === 'suspended') audio.ctx.resume();
      const start = audio.ctx.currentTime + (when || 0);
      const osc = audio.ctx.createOscillator();
      const gain = audio.ctx.createGain();
      osc.type = type || 'sine';
      osc.frequency.setValueAtTime(freq, start);
      gain.gain.setValueAtTime(volume || 0.08, start);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + seconds);
      osc.connect(gain);
      gain.connect(audio.ctx.destination);
      osc.start(start);
      osc.stop(start + seconds + 0.02);
    } catch (err) {
      // Sound must never break the game.
    }
  }

  audio.pickup = function pickup() {
    beep(880, 0.12, 'sine', 0.09);
    beep(1318, 0.16, 'sine', 0.07, 0.08);
  };

  audio.coin = function coin() {
    beep(1568, 0.07, 'triangle', 0.08);
    beep(1175, 0.07, 'triangle', 0.06, 0.06);
  };

  audio.alarm = function alarm() {
    beep(220, 0.25, 'square', 0.06);
    beep(330, 0.25, 'square', 0.06, 0.28);
    beep(220, 0.25, 'square', 0.06, 0.56);
  };

  audio.caught = function caught() {
    beep(160, 0.5, 'sawtooth', 0.09);
    beep(90, 0.6, 'sawtooth', 0.09, 0.3);
  };

  audio.levelClear = function levelClear() {
    beep(523, 0.14, 'sine', 0.09);
    beep(659, 0.14, 'sine', 0.09, 0.12);
    beep(784, 0.22, 'sine', 0.09, 0.24);
  };

  audio.victory = function victory() {
    [523, 659, 784, 1046].forEach((freq, i) => beep(freq, 0.2, 'sine', 0.09, i * 0.15));
  };

  // A soft footstep tick; call it when a guard's step lands near the player.
  audio.footstep = function footstep(distance) {
    const volume = Math.max(0.01, 0.06 * (1 - distance / 320));
    if (volume <= 0.012) return;
    beep(140 + Math.random() * 40, 0.05, 'sine', volume);
  };

  return audio;
}
