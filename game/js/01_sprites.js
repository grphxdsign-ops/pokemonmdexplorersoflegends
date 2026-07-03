// Sprite & portrait loader.
// Pulls authentic PMD-style community sprites from PMDCollab SpriteCollab at runtime
// (CC-licensed community art made for PMD hacks; credits: https://sprites.pmdcollab.org).
// Falls back to generated pixel placeholders when offline.
window.EOL = window.EOL || {};
(function () {
  const S = EOL.sprites = {};
  // Override with window.EOL_SPRITE_BASE (e.g. a local mirror for offline play).
  const BASE = window.EOL_SPRITE_BASE || 'https://raw.githubusercontent.com/PMDCollab/SpriteCollab/master';
  const portraits = {}; // key -> {img|canvas, ok}
  const walks = {};     // key -> {img, frames, fw, fh, durations, ok}
  let netOK = true;     // flips false after first failure batch to avoid request spam

  function dexKey(entry) {
    return String(entry.num).padStart(4, '0') + (entry.spr ? '/' + entry.spr.split('/')[1] : '');
  }
  function pathOf(entry) {
    return entry.spr ? entry.spr : String(entry.num).padStart(4, '0');
  }

  // ---- placeholder art (deterministic per species) ----
  function placeholderPortrait(entry) {
    const c = document.createElement('canvas'); c.width = 40; c.height = 40;
    const g = c.getContext('2d');
    const col = EOL.util.TYPE_COLORS[entry.types[0]] || '#888';
    const col2 = EOL.util.TYPE_COLORS[entry.types[1] || entry.types[0]] || col;
    g.fillStyle = '#222'; g.fillRect(0, 0, 40, 40);
    g.fillStyle = col; g.beginPath(); g.arc(20, 22, 13, 0, 7); g.fill();
    g.fillStyle = col2; g.beginPath(); g.arc(14, 12, 6, 0, 7); g.fill(); g.beginPath(); g.arc(26, 12, 6, 0, 7); g.fill();
    g.fillStyle = '#fff'; g.fillRect(14, 18, 4, 4); g.fillRect(23, 18, 4, 4);
    g.fillStyle = '#000'; g.fillRect(15, 19, 2, 2); g.fillRect(24, 19, 2, 2);
    return c;
  }
  function placeholderWalk(entry) {
    // 8 rows x 4 cols, 24x24 blob with direction marker
    const fw = 24, fh = 24;
    const c = document.createElement('canvas'); c.width = fw * 4; c.height = fh * 8;
    const g = c.getContext('2d');
    const col = EOL.util.TYPE_COLORS[entry.types[0]] || '#888';
    for (let d = 0; d < 8; d++) {
      for (let f = 0; f < 4; f++) {
        const x = f * fw, y = d * fh;
        const bob = f % 2;
        g.fillStyle = 'rgba(0,0,0,0.3)'; g.beginPath(); g.ellipse(x + 12, y + 20, 7, 3, 0, 0, 7); g.fill();
        g.fillStyle = col; g.beginPath(); g.arc(x + 12, y + 13 - bob, 7, 0, 7); g.fill();
        g.fillStyle = '#fff';
        const dir = EOL.util.DIRS[d];
        g.fillRect(x + 11 + dir[0] * 4, y + 12 - bob + dir[1] * 4, 3, 3);
        g.fillStyle = '#000'; g.fillRect(x + 12 + dir[0] * 4, y + 13 - bob + dir[1] * 4, 1, 1);
      }
    }
    return { sheet: c, fw, fh, cols: 4, durations: [8, 8, 8, 8], placeholder: true };
  }

  // ---- network loaders ----
  S.portrait = function (slugOrEntry, emotion) {
    const entry = typeof slugOrEntry === 'string' ? EOL.DATA.pokedex[slugOrEntry] : slugOrEntry;
    if (!entry) return null;
    const emo = emotion || 'Normal';
    const key = pathOf(entry) + '/' + emo;
    if (portraits[key]) return portraits[key].ready ? portraits[key].img : (portraits[key].fallback || null);
    const holder = { ready: false, img: null, fallback: placeholderPortrait(entry) };
    portraits[key] = holder;
    if (netOK) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => { holder.img = img; holder.ready = true; };
      img.onerror = () => {
        if (emo !== 'Normal') { // retry with Normal emotion
          const nk = pathOf(entry) + '/Normal';
          if (portraits[nk] && portraits[nk].ready) { holder.img = portraits[nk].img; holder.ready = true; return; }
          const i2 = new Image(); i2.crossOrigin = 'anonymous';
          i2.onload = () => { holder.img = i2; holder.ready = true; };
          i2.src = `${BASE}/portrait/${pathOf(entry)}/Normal.png`;
        }
      };
      img.src = `${BASE}/portrait/${pathOf(entry)}/${emo}.png`;
    }
    return holder.fallback;
  };
  S.portraitDrawable = function (slugOrEntry, emotion) {
    const entry = typeof slugOrEntry === 'string' ? EOL.DATA.pokedex[slugOrEntry] : slugOrEntry;
    if (!entry) return null;
    const key = pathOf(entry) + '/' + (emotion || 'Normal');
    S.portrait(entry, emotion);
    const h = portraits[key];
    return h.ready ? h.img : h.fallback;
  };

  S.walk = function (slugOrEntry) {
    const entry = typeof slugOrEntry === 'string' ? EOL.DATA.pokedex[slugOrEntry] : slugOrEntry;
    if (!entry) return null;
    const key = pathOf(entry);
    if (walks[key]) return walks[key].ready ? walks[key].data : walks[key].fallback;
    const holder = { ready: false, data: null, fallback: placeholderWalk(entry) };
    walks[key] = holder;
    if (netOK) {
      // fetch AnimData.xml + Walk-Anim.png
      const img = new Image(); img.crossOrigin = 'anonymous';
      let anim = null, imgOK = false;
      function finish() {
        if (!imgOK || !anim) return;
        holder.data = { sheet: img, fw: anim.fw, fh: anim.fh, cols: Math.round(img.width / anim.fw), durations: anim.durations };
        holder.ready = true;
      }
      fetch(`${BASE}/sprite/${key}/AnimData.xml`).then(r => r.ok ? r.text() : Promise.reject()).then(xml => {
        const doc = new DOMParser().parseFromString(xml, 'text/xml');
        for (const a of doc.querySelectorAll('Anim')) {
          const name = a.querySelector('Name');
          if (name && name.textContent === 'Walk') {
            const fw = +a.querySelector('FrameWidth').textContent;
            const fh = +a.querySelector('FrameHeight').textContent;
            const durations = [...a.querySelectorAll('Duration')].map(d => +d.textContent);
            anim = { fw, fh, durations };
            break;
          }
        }
        finish();
      }).catch(() => { });
      img.onload = () => { imgOK = true; finish(); };
      img.src = `${BASE}/sprite/${key}/Walk-Anim.png`;
    }
    return holder.fallback;
  };

  // draw a mon standing/walking at pixel pos (centered on tile), dir 0-7, animClock in frames
  S.drawMon = function (g, entry, px, py, dir, animClock, moving) {
    const w = S.walk(entry);
    if (!w) return;
    const row = dir;
    let frame = 0;
    if (moving) {
      const total = w.durations.reduce((a, b) => a + b, 0);
      let t = animClock % total;
      for (let i = 0; i < w.durations.length; i++) { if (t < w.durations[i]) { frame = i; break; } t -= w.durations[i]; }
    }
    frame = Math.min(frame, w.cols - 1);
    // shadow
    g.fillStyle = 'rgba(0,0,0,0.35)';
    g.beginPath(); g.ellipse(px, py + 8, 8, 3, 0, 0, 7); g.fill();
    g.drawImage(w.sheet, frame * w.fw, row * w.fh, w.fw, w.fh,
      Math.round(px - w.fw / 2), Math.round(py - w.fh + 12), w.fw, w.fh);
  };

  S.netFail = () => { netOK = false; };
})();
