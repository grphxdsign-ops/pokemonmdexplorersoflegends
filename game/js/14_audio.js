// Tiny WebAudio chiptune: menu blips, battle SFX, and soft ambient loops.
// All synthesized - no audio assets. Starts on first user gesture (autoplay rules).
window.EOL = window.EOL || {};
(function () {
  const A = EOL.audio = { enabled: true };
  let ctx = null, musicTimer = null, musicMode = null, step = 0;

  function ac() {
    if (!ctx) {
      try { ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { A.enabled = false; }
    }
    if (ctx && ctx.state === 'suspended') ctx.resume();
    return ctx;
  }
  ['keydown', 'pointerdown', 'touchstart'].forEach(ev => window.addEventListener(ev, () => { if (A.enabled) ac(); }, { once: false }));

  function beep(freq, dur, type, vol, when, slide) {
    const c = ac(); if (!c || !A.enabled) return;
    const t = c.currentTime + (when || 0);
    const o = c.createOscillator(), g = c.createGain();
    o.type = type || 'square';
    o.frequency.setValueAtTime(freq, t);
    if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(30, freq + slide), t + dur);
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(vol || 0.05, t + 0.005);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(c.destination);
    o.start(t); o.stop(t + dur + 0.02);
  }

  A.sfx = function (name) {
    if (!A.enabled) return;
    switch (name) {
      case 'select': beep(880, 0.06, 'square', 0.03); break;
      case 'confirm': beep(660, 0.05, 'square', 0.035); beep(990, 0.07, 'square', 0.035, 0.05); break;
      case 'cancel': beep(440, 0.08, 'square', 0.03, 0, -160); break;
      case 'hit': beep(180, 0.09, 'sawtooth', 0.05, 0, -80); break;
      case 'crit': beep(140, 0.12, 'sawtooth', 0.07, 0, -90); beep(90, 0.1, 'square', 0.05, 0.05, -40); break;
      case 'heal': beep(523, 0.08, 'sine', 0.05); beep(659, 0.08, 'sine', 0.05, 0.08); beep(784, 0.12, 'sine', 0.05, 0.16); break;
      case 'stairs': [523, 659, 784, 1046].forEach((f, i) => beep(f, 0.1, 'triangle', 0.05, i * 0.09)); break;
      case 'levelup': [392, 523, 659, 784, 1046].forEach((f, i) => beep(f, 0.09, 'square', 0.04, i * 0.07)); break;
      case 'faint': beep(300, 0.4, 'sawtooth', 0.05, 0, -220); break;
      case 'item': beep(1046, 0.05, 'triangle', 0.04); beep(1318, 0.08, 'triangle', 0.04, 0.05); break;
      case 'evolve': [262, 330, 392, 523, 659, 784, 1046, 1318].forEach((f, i) => beep(f, 0.14, 'triangle', 0.05, i * 0.11)); break;
      case 'recruit': [659, 784, 988, 1318].forEach((f, i) => beep(f, 0.1, 'square', 0.04, i * 0.08)); break;
    }
  };

  // very light generative ambience: mode 'town' | 'dungeon' | 'tense' | null
  const SCALES = {
    town: [262, 294, 330, 392, 440, 523, 587, 659],
    dungeon: [220, 247, 262, 330, 349, 440, 523],
    tense: [196, 208, 247, 294, 311, 370],
  };
  A.music = function (mode) {
    if (mode === musicMode) return;
    musicMode = mode;
    if (musicTimer) { clearInterval(musicTimer); musicTimer = null; }
    if (!mode || !A.enabled) return;
    step = 0;
    musicTimer = setInterval(() => {
      if (!A.enabled || document.hidden) return;
      const sc = SCALES[mode] || SCALES.dungeon;
      const beat = step % 8;
      // gentle bass
      if (beat === 0 || beat === 4) beep(sc[0] / 2, 0.3, 'triangle', 0.025);
      // sparse melody
      if (Math.random() < (mode === 'town' ? 0.5 : 0.35)) {
        const n = sc[(step * 3 + Math.floor(Math.random() * 3)) % sc.length];
        beep(n, 0.22, mode === 'tense' ? 'sawtooth' : 'triangle', mode === 'tense' ? 0.018 : 0.022);
      }
      step++;
    }, 280);
  };

  A.toggle = function () { A.enabled = !A.enabled; if (!A.enabled) A.music(null); return A.enabled; };
})();
