// Story engine: PMD-style dialogue scenes with portraits, choices, and effects.
// Scenes are arrays of ops (see EOL.CONTENT.scenes). Also hosts the personality quiz.
window.EOL = window.EOL || {};
(function () {
  const SY = EOL.systems;
  const ST = EOL.Story = {};

  let S = null; // {ops, i, textProgress, choice, done, bg, onDone, speaker}
  ST.active = () => !!S;

  ST.play = function (ops, onDone) {
    S = { ops: ops.slice(), i: -1, textProgress: 0, onDone, bg: '#000', vars: {} };
    advance();
  };

  function resolveWho(who) {
    const team = EOL.game ? EOL.game.team : [];
    if (who === 'player') return { name: team[0] ? team[0].name : 'You', slug: team[0] && team[0].slug };
    if (who === 'partner') return { name: team[1] ? team[1].name : 'Partner', slug: team[1] && team[1].slug };
    if (EOL.DATA.pokedex[who]) return { name: EOL.DATA.pokedex[who].name, slug: who };
    return { name: who, slug: null };
  }

  function fmt(text) {
    const team = EOL.game ? EOL.game.team : [];
    return text
      .replace(/\{player\}/g, team[0] ? team[0].name : 'you')
      .replace(/\{partner\}/g, team[1] ? team[1].name : 'your partner')
      .replace(/\{title\}/g, SY.teamTitle());
  }

  function advance() {
    if (!S) return;
    S.i++;
    if (S.i >= S.ops.length) return finish();
    const op = S.ops[S.i];
    switch (op.t) {
      case 'bg': S.bg = op.v; return advance();
      case 'flag': SY.flag(op.k, op.v === undefined ? true : op.v); return advance();
      case 'renown': { const msg = SY.addRenown(op.type, op.amt, op.domain); S.ops.splice(S.i + 1, 0, { t: 'narr', text: msg }); return advance(); }
      case 'skill': { const msg = SY.gainSkill(op.name, op.xp); if (msg) S.ops.splice(S.i + 1, 0, { t: 'narr', text: msg }); return advance(); }
      case 'moral': SY.moralShift(op.d); return advance();
      case 'give': {
        if (op.item === 'poke') { SY.state.money += op.n || 100; S.ops.splice(S.i + 1, 0, { t: 'narr', text: `The team received ${op.n || 100} Poke!` }); }
        else { SY.addItem(op.item, op.n || 1); S.ops.splice(S.i + 1, 0, { t: 'narr', text: `The team received ${op.n > 1 ? (op.n + 'x ') : 'a '}${EOL.items.name(op.item)}!` }); }
        return advance();
      }
      case 'ap': SY.state.apPool += op.n; S.ops.splice(S.i + 1, 0, { t: 'narr', text: `The team earned ${op.n} Attribute Points!` }); return advance();
      case 'heal': for (const m of (EOL.game ? EOL.game.team : [])) { m.hp = m.maxhp; m.belly = 100; m.status = null; } return advance();
      case 'if': {
        // conditional skip: {t:'if', cond:fn|flag, then:[ops]} - inline expansion
        let ok;
        if (typeof op.cond === 'function') ok = op.cond(SY.state);
        else if (typeof op.cond === 'string') ok = !!SY.state.flags[op.cond];
        if (ok && op.then) S.ops.splice(S.i + 1, 0, ...op.then);
        else if (!ok && op.else) S.ops.splice(S.i + 1, 0, ...op.else);
        return advance();
      }
      case 'say': case 'narr': {
        S.current = op;
        S.speaker = op.t === 'say' ? resolveWho(op.who) : null;
        S.text = fmt(op.text);
        S.textProgress = 0;
        S.emo = op.emo || 'Normal';
        return;
      }
      case 'choice': {
        S.current = op;
        S.speaker = op.who ? resolveWho(op.who) : null;
        S.text = op.text ? fmt(op.text) : '';
        S.textProgress = 999;
        S.choiceSel = 0;
        return;
      }
      case 'call': if (op.fn) op.fn(SY.state); return advance();
      default: return advance();
    }
  }

  function finish() {
    const cb = S.onDone;
    S = null;
    if (cb) cb();
  }

  ST.input = function (action, data) {
    if (!S || !S.current) return;
    const op = S.current;
    if (op.t === 'choice') {
      if (action === 'nav') S.choiceSel = (S.choiceSel + data + op.opts.length) % op.opts.length;
      if (action === 'confirm') {
        const pick = op.opts[S.choiceSel];
        const extra = [];
        if (pick.effects) extra.push(...pick.effects);
        if (pick.then) extra.push(...pick.then);
        S.ops.splice(S.i + 1, 0, ...extra);
        advance();
      }
      return;
    }
    if (action === 'confirm' || action === 'attack') {
      if (S.textProgress < S.text.length) S.textProgress = S.text.length;
      else advance();
    }
  };

  // ---- rendering ----
  ST.draw = function (g, W, H) {
    if (!S) return;
    // background
    if (S.bg === 'town') { g.fillStyle = '#243a24'; g.fillRect(0, 0, W, H); drawStars(g, W, H, '#3a5a3a'); }
    else if (S.bg === 'night') { g.fillStyle = '#0a0c24'; g.fillRect(0, 0, W, H); drawStars(g, W, H, '#e8e8ff'); }
    else if (S.bg === 'dungeon') { g.fillStyle = '#241a2e'; g.fillRect(0, 0, W, H); }
    else if (S.bg === 'tower') { g.fillStyle = '#1a1030'; g.fillRect(0, 0, W, H); drawStars(g, W, H, '#c0a0ff'); }
    else if (S.bg === 'dawn') { const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, '#ffb060'); gr.addColorStop(1, '#604060'); g.fillStyle = gr; g.fillRect(0, 0, W, H); }
    else { g.fillStyle = S.bg || '#000'; g.fillRect(0, 0, W, H); }

    const op = S.current;
    if (!op) return;
    if (S.textProgress < (S.text || '').length) S.textProgress += 1.6;

    // portrait + frame
    const boxH = 78;
    EOL.Dungeon.pmdFrame(g, 8, H - boxH - 8, W - 16, boxH);
    let tx = 22;
    if (S.speaker && S.speaker.slug) {
      const p = EOL.sprites.portraitDrawable(S.speaker.slug, S.emo);
      if (p) {
        // portrait window (PMD style: framed square left of text)
        g.fillStyle = '#000'; g.fillRect(16, H - boxH - 26, 44, 44);
        g.drawImage(p, 18, H - boxH - 24, 40, 40);
        g.strokeStyle = '#e8e8f8'; g.strokeRect(16.5, H - boxH - 26.5, 44, 44);
      }
    }
    if (S.speaker) {
      g.font = 'bold 11px monospace';
      g.fillStyle = '#ffe060';
      g.fillText(S.speaker.name, 22, H - boxH + 8);
    }
    // wrapped text
    g.font = '12px monospace';
    g.fillStyle = op.t === 'narr' ? '#c8d8ff' : '#fff';
    const shown = (S.text || '').slice(0, Math.floor(S.textProgress));
    wrapText(g, shown, tx, H - boxH + (S.speaker ? 24 : 16), W - 50, 15);
    // continue arrow
    if (S.textProgress >= (S.text || '').length && op.t !== 'choice') {
      g.fillStyle = '#ffe060';
      const bob = Math.sin(Date.now() / 200) * 2;
      g.beginPath(); g.moveTo(W - 28, H - 22 + bob); g.lineTo(W - 20, H - 22 + bob); g.lineTo(W - 24, H - 17 + bob); g.fill();
    }
    // choices
    if (op.t === 'choice') {
      const ch = op.opts;
      const cw = 220, chH = ch.length * 18 + 14;
      EOL.Dungeon.pmdFrame(g, W - cw - 12, H - boxH - chH - 14, cw, chH);
      g.font = '12px monospace';
      ch.forEach((o, i) => {
        g.fillStyle = i === S.choiceSel ? '#ffe060' : '#fff';
        g.fillText((i === S.choiceSel ? '> ' : '  ') + o.text, W - cw, H - boxH - chH + 6 + i * 18);
      });
    }
  };

  function drawStars(g, W, H, color) {
    g.fillStyle = color;
    for (let i = 0; i < 40; i++) {
      const x = (i * 137.5) % W, y = (i * 89.7) % (H * 0.7);
      g.globalAlpha = 0.3 + (Math.sin(Date.now() / 900 + i) + 1) * 0.3;
      g.fillRect(x, y, 2, 2);
    }
    g.globalAlpha = 1;
  }

  function wrapText(g, text, x, y, maxW, lh) {
    const words = text.split(' ');
    let line = '', yy = y;
    for (const w of words) {
      const test = line ? line + ' ' + w : w;
      if (g.measureText(test).width > maxW && line) { g.fillText(line, x, yy); line = w; yy += lh; }
      else line = test;
    }
    g.fillText(line, x, yy);
  }
})();
