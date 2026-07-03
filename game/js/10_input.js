// Input: keyboard (arrows/WASD + Z/X style) and touch controls (mobile d-pad + A/B).
window.EOL = window.EOL || {};
(function () {
  const IN = EOL.input = {};
  const pressed = new Set();
  let lastMove = 0;
  const MOVE_MS = 105;

  const KEYMAP = {
    ArrowUp: 'up', KeyW: 'up', ArrowDown: 'down', KeyS: 'down',
    ArrowLeft: 'left', KeyA: 'left', ArrowRight: 'right', KeyD: 'right',
    KeyZ: 'a', Enter: 'a', Space: 'a', KeyX: 'b', Escape: 'b',
    KeyM: 'menu', Tab: 'menu', Period: 'wait', KeyQ: 'moves',
  };

  IN.dispatch = null; // set by main: (action, data) => {}

  function dirFromKeys() {
    let dx = 0, dy = 0;
    if (pressed.has('up')) dy -= 1;
    if (pressed.has('down')) dy += 1;
    if (pressed.has('left')) dx -= 1;
    if (pressed.has('right')) dx += 1;
    if (!dx && !dy) return null;
    return EOL.util.dirFromDelta(dx, dy);
  }

  window.addEventListener('keydown', e => {
    const k = KEYMAP[e.code];
    if (!k) return;
    e.preventDefault();
    if (k === 'a') { if (!pressed.has('a')) IN.fire('a'); }
    else if (k === 'b') { if (!pressed.has('b')) IN.fire('b'); }
    else if (k === 'menu') { if (!pressed.has('menu')) IN.fire('menu'); }
    else if (k === 'wait') IN.fire('wait');
    else if (k === 'moves') IN.fire('moves');
    pressed.add(k);
  });
  window.addEventListener('keyup', e => {
    const k = KEYMAP[e.code];
    if (k) pressed.delete(k);
  });

  IN.fire = function (btn) {
    if (!IN.dispatch) return;
    IN.dispatch(btn);
  };

  // held-movement pump, called each frame by main loop
  IN.pump = function () {
    const dir = dirFromKeys() !== null ? dirFromKeys() : (touchDir !== null ? touchDir : null);
    if (dir === null) return;
    const now = Date.now();
    if (now - lastMove < MOVE_MS) return;
    lastMove = now;
    if (IN.dispatch) IN.dispatch('dir', dir);
  };

  // ---- touch controls ----
  let touchDir = null;
  IN.bindTouch = function () {
    const pad = document.getElementById('dpad');
    const btnA = document.getElementById('btnA');
    const btnB = document.getElementById('btnB');
    const btnM = document.getElementById('btnM');
    if (!pad) return;
    function padDir(ev) {
      const r = pad.getBoundingClientRect();
      const t = ev.touches[0];
      if (!t) return null;
      const dx = t.clientX - (r.left + r.width / 2), dy = t.clientY - (r.top + r.height / 2);
      if (Math.hypot(dx, dy) < 8) return null;
      const sx = Math.abs(dx) > Math.hypot(dx, dy) * 0.38 ? Math.sign(dx) : 0;
      const sy = Math.abs(dy) > Math.hypot(dx, dy) * 0.38 ? Math.sign(dy) : 0;
      return EOL.util.dirFromDelta(sx, sy);
    }
    pad.addEventListener('touchstart', ev => { ev.preventDefault(); touchDir = padDir(ev); }, { passive: false });
    pad.addEventListener('touchmove', ev => { ev.preventDefault(); touchDir = padDir(ev); }, { passive: false });
    pad.addEventListener('touchend', ev => { ev.preventDefault(); touchDir = null; }, { passive: false });
    const bind = (el, btn) => {
      if (!el) return;
      el.addEventListener('touchstart', ev => { ev.preventDefault(); IN.fire(btn); }, { passive: false });
      el.addEventListener('mousedown', ev => { ev.preventDefault(); IN.fire(btn); });
    };
    bind(btnA, 'a'); bind(btnB, 'b'); bind(btnM, 'menu');
    // show touch UI only on touch devices
    if ('ontouchstart' in window) document.getElementById('touchui').style.display = 'block';
  };
})();
