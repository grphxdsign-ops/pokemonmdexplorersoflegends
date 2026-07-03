// Main controller: boot, title, personality quiz, hub facilities, chapter flow,
// dungeon embark/return, endings, postgame. Ties every subsystem together.
window.EOL = window.EOL || {};
(function () {
  const U = EOL.util, SY = EOL.systems, IT = EOL.items, DG = EOL.Dungeon, GR = EOL.Ground, ST = EOL.Story;
  const D = () => EOL.DATA;
  const W = 480, H = 320;

  const game = EOL.game = {
    mode: 'title', // title | quiz | ground | story | dungeon
    team: [],
    titleSel: 0,
    ui: [], // menu stack
  };

  // ---------- generic PMD-style menu stack ----------
  const ui = EOL.ui = {
    push(menu) { menu.sel = menu.sel || 0; game.ui.push(menu); },
    pop() { const m = game.ui.pop(); if (m && m.onClose) m.onClose(); },
    top() { return game.ui[game.ui.length - 1]; },
    clear() { game.ui.length = 0; },
  };

  function uiInput(btn) {
    const m = ui.top();
    if (!m) return false;
    const items = m.items.filter(Boolean);
    if (btn === 'dir-up') m.sel = (m.sel - 1 + items.length) % items.length;
    else if (btn === 'dir-down') m.sel = (m.sel + 1) % items.length;
    else if (btn === 'a') {
      const it = items[m.sel];
      if (it && !it.disabled && m.onPick) m.onPick(m.sel, it);
    } else if (btn === 'b') {
      if (!m.sticky) ui.pop();
      else if (m.onCancel) m.onCancel();
    }
    return true;
  }

  function drawUI(g) {
    for (const m of game.ui) {
      const items = m.items.filter(Boolean);
      const w = m.w || 260;
      const rowH = 17;
      const h = Math.min(items.length, 12) * rowH + (m.title ? 26 : 12) + (m.info ? 40 : 0);
      const x = m.x !== undefined ? m.x : (W - w) / 2;
      const y = m.y !== undefined ? m.y : Math.max(10, (H - h) / 2 - 20);
      DG.pmdFrame(g, x, y, w, h);
      let yy = y + 14;
      if (m.title) { g.font = 'bold 12px monospace'; g.fillStyle = '#ffe060'; g.fillText(m.title, x + 12, yy + 2); yy += 18; }
      g.font = '12px monospace';
      const first = Math.max(0, Math.min(m.sel - 9, items.length - 12));
      items.slice(first, first + 12).forEach((it, i) => {
        const idx = first + i;
        g.fillStyle = it.disabled ? '#707890' : (idx === m.sel ? '#ffe060' : '#fff');
        g.fillText((idx === m.sel ? '>' : ' ') + it.label, x + 10, yy + 4 + i * rowH);
        if (it.right) { g.fillStyle = '#a0c0ff'; g.textAlign = 'right'; g.fillText(it.right, x + w - 12, yy + 4 + i * rowH); g.textAlign = 'left'; }
      });
      if (m.info) {
        g.fillStyle = '#c8d8ff'; g.font = '10px monospace';
        wrap(g, m.info, x + 10, y + h - 26, w - 20, 12);
      }
    }
  }
  function wrap(g, text, x, y, maxW, lh) {
    const words = text.split(' ');
    let line = '', yy = y;
    for (const wd of words) {
      const t = line ? line + ' ' + wd : wd;
      if (g.measureText(t).width > maxW && line) { g.fillText(line, x, yy); line = wd; yy += lh; }
      else line = t;
    }
    g.fillText(line, x, yy);
  }

  // ---------- boot ----------
  let canvas, ctx;
  window.addEventListener('DOMContentLoaded', () => {
    canvas = document.getElementById('screen');
    ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    EOL.input.dispatch = dispatch;
    EOL.input.bindTouch();
    requestAnimationFrame(loop);
  });

  function loop() {
    frame();
    requestAnimationFrame(loop);
  }

  function frame() {
    EOL.input.pump();
    ctx.imageSmoothingEnabled = false;
    if (game.mode === 'title') drawTitle(ctx);
    else if (ST.active()) ST.draw(ctx, W, H);
    else if (DG.active()) DG.draw(ctx, W, H);
    else if (GR.active()) GR.draw(ctx, W, H);
    else { ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); }
    drawUI(ctx);
    drawToast(ctx);
  }

  // ---------- input routing ----------
  let inputLock = 0;
  function lockInput(ms) { inputLock = Date.now() + ms; }
  function dispatch(btn, data) {
    if ((btn === 'a' || btn === 'b') && Date.now() < inputLock) return;
    if (EOL.audio && (btn === 'a')) EOL.audio.sfx('confirm');
    else if (EOL.audio && btn === 'b') EOL.audio.sfx('cancel');
    else if (EOL.audio && (btn === 'dir-up' || btn === 'dir-down')) EOL.audio.sfx('select');
    if (game.mode === 'title') return titleInput(btn, data);
    if (ST.active()) {
      if (btn === 'dir') return;
      if (btn === 'dir-up' || (btn === 'dir' && data === 4)) return ST.input('nav', -1);
      if (btn === 'dir-down') return ST.input('nav', 1);
      if (btn === 'a') return ST.input('confirm');
      return;
    }
    if (game.ui.length) {
      if (btn === 'dir') return; // held movement doesn't drive menus
      return uiInput(btn);
    }
    if (DG.active()) {
      if (btn === 'dir') return DG.input('move', data);
      if (btn === 'a') return DG.input(DG.menuOpen() ? 'confirm' : 'attack');
      if (btn === 'b') return DG.input(DG.menuOpen() ? 'cancel' : 'menu');
      if (btn === 'menu') return DG.input(DG.menuOpen() ? 'cancel' : 'menu');
      if (btn === 'wait') return DG.input('wait');
      if (btn === 'moves') return DG.input('moves');
      if (btn === 'dir-up') return DG.input('nav', -1);
      if (btn === 'dir-down') return DG.input('nav', 1);
      return;
    }
    if (GR.active()) {
      if (btn === 'dir') return GR.input('move', data);
      if (btn === 'a') return GR.input('confirm');
      if (btn === 'menu' || btn === 'b') return openGroundMenu();
      return;
    }
  }
  // arrow keys: translate to nav for menus/story
  window.addEventListener('keydown', e => {
    if (e.code === 'ArrowUp' || e.code === 'KeyW') { if (game.ui.length || ST.active() || (DG.active() && game.mode === 'dungeon')) dispatch('dir-up'); }
    if (e.code === 'ArrowDown' || e.code === 'KeyS') { if (game.ui.length || ST.active() || (DG.active() && game.mode === 'dungeon')) dispatch('dir-down'); }
  });

  // ---------- title ----------
  let titleClock = 0;
  function drawTitle(g) {
    titleClock++;
    const grd = g.createLinearGradient(0, 0, 0, H);
    grd.addColorStop(0, '#0a1030'); grd.addColorStop(0.6, '#242a68'); grd.addColorStop(1, '#4a3a78');
    g.fillStyle = grd; g.fillRect(0, 0, W, H);
    for (let i = 0; i < 60; i++) {
      const x = (i * 137.5) % W, y = (i * 71.3) % (H * 0.75);
      g.globalAlpha = 0.25 + (Math.sin(titleClock / 40 + i) + 1) * 0.3;
      g.fillStyle = '#e8e8ff'; g.fillRect(x, y, 2, 2);
    }
    g.globalAlpha = 1;
    g.textAlign = 'center';
    g.font = 'bold 13px monospace'; g.fillStyle = '#ffd9a0';
    g.fillText('POKEMON MYSTERY DUNGEON', W / 2, 92);
    g.font = 'bold 30px monospace';
    g.fillStyle = '#182050'; g.fillText('Explorers of Legends', W / 2 + 2, 136 + 2);
    g.fillStyle = '#ffe9a0'; g.fillText('Explorers of Legends', W / 2, 136);
    g.font = '10px monospace'; g.fillStyle = '#b0b8e8';
    g.fillText('An unofficial fan project - sprites by the PMDCollab community', W / 2, 158);
    const opts = ['New Game', SY.hasSave() ? 'Continue' : null, SY.hasSave() ? 'Erase Save' : null].filter(Boolean);
    game.titleOpts = opts;
    g.font = 'bold 14px monospace';
    opts.forEach((o, i) => {
      g.fillStyle = i === game.titleSel ? '#ffe060' : '#fff';
      g.fillText((i === game.titleSel ? '> ' : '') + o, W / 2, 210 + i * 24);
    });
    g.font = '10px monospace'; g.fillStyle = '#8890c0';
    g.fillText('Arrows/WASD move - Z/Enter: A - X/Esc: B - M: menu', W / 2, H - 14);
    g.textAlign = 'left';
  }
  function titleInput(btn) {
    const opts = game.titleOpts || ['New Game'];
    if (btn === 'dir-up') game.titleSel = (game.titleSel - 1 + opts.length) % opts.length;
    else if (btn === 'dir-down') game.titleSel = (game.titleSel + 1) % opts.length;
    else if (btn === 'a') {
      const pick = opts[game.titleSel];
      if (pick === 'New Game') startNewGame();
      else if (pick === 'Continue') continueGame();
      else if (pick === 'Erase Save') { SY.wipe(); game.titleSel = 0; }
    }
  }

  // ---------- new game: personality quiz ----------
  function startNewGame() {
    SY.wipe();
    game.mode = 'quiz';
    const quiz = EOL.CONTENT.quiz;
    const scores = {};
    const qOps = [];
    qOps.push({ t: 'bg', v: 'night' });
    qOps.push({ t: 'narr', text: 'Welcome to the world of Pokemon...' });
    qOps.push({ t: 'narr', text: 'Before your story begins, answer honestly. Your heart will choose your form.' });
    for (const q of quiz.questions) {
      qOps.push({
        t: 'choice', text: q.text, opts: q.opts.map(o => ({
          text: o.text,
          effects: [{ t: 'call', fn: () => { for (const [k, v] of Object.entries(o.scores)) scores[k] = (scores[k] || 0) + v; } }],
        }))
      });
    }
    qOps.push({ t: 'call', fn: () => finishQuiz(scores) });
    ST.play(qOps, () => { });
  }

  function finishQuiz(scores) {
    const quiz = EOL.CONTENT.quiz;
    let best = quiz.natures[0], bestScore = -1;
    for (const n of quiz.natures) {
      const s = scores[n.trait] || 0;
      if (s > bestScore) { bestScore = s; best = n; }
    }
    const starterSlug = best.starter;
    const ops = [];
    ops.push({ t: 'bg', v: 'night' });
    ops.push({ t: 'narr', text: `Your nature is... ${best.name}!` });
    ops.push({ t: 'narr', text: best.desc });
    ops.push({ t: 'narr', text: `You will live this story as... ${D().pokedex[starterSlug].name}!` });
    ops.push({
      t: 'call', fn: () => {
        game.team = [new EOL.Mon(starterSlug, 5, { isAlly: true })];
        pickPartner(starterSlug);
      }
    });
    ST.play(ops, () => { });
  }

  function pickPartner(starterSlug) {
    const pool = EOL.CONTENT.partnerPool.filter(s => s !== starterSlug);
    ui.push({
      title: 'Choose your partner!',
      sticky: true,
      items: pool.map(s => ({ label: D().pokedex[s].name, right: D().pokedex[s].types.join('/') })),
      onPick: (i) => {
        const slug = pool[i];
        ui.clear();
        game.team.push(new EOL.Mon(slug, 5, { isAlly: true }));
        SY.state.team = game.team.map(m => m.serialize());
        SY.save(game.team);
        game.mode = 'story';
        playChapter(0);
      },
    });
  }

  function continueGame() {
    if (!SY.load()) return;
    game.team = SY.state.team.map(d => EOL.Mon.from(d));
    game.mode = 'ground';
    enterTown();
  }

  // ---------- chapters ----------
  function chapters() { return EOL.CONTENT.chapters; }

  function playChapter(idx) {
    const ch = chapters()[idx];
    if (!ch) { enterTown(); return; }
    SY.state.chapter = idx;
    game.mode = 'story';
    GR.stop();
    ST.play(ch.intro, () => {
      if (ch.dungeon) {
        SY.flag('storyDungeon', ch.dungeon);
        embark(ch.dungeon, { story: true, chapterIdx: idx });
      } else {
        finishChapter(idx);
      }
    });
  }

  function finishChapter(idx) {
    const ch = chapters()[idx];
    const done = () => {
      SY.state.chapter = idx + 1;
      SY.flag('storyDungeon', null);
      SY.save(game.team);
      const next = chapters()[idx + 1];
      if (next && next.auto) playChapter(idx + 1);
      else if (idx + 1 >= chapters().length) runEnding();
      else enterTown(ch.banner || null);
    };
    if (ch.outro && ch.outro.length) { game.mode = 'story'; ST.play(ch.outro, done); }
    else done();
  }

  // ---------- town ----------
  function enterTown(banner) {
    game.mode = 'ground';
    lockInput(400);
    if (EOL.audio) EOL.audio.music('town');
    for (const m of game.team) { m.hp = m.maxhp; m.belly = 100; m.status = null; m.stages = EOL.battle.newStages(); }
    SY.save(game.team);
    GR.start({
      banner: banner || 'Mythfall Town',
      onFacility: openFacility,
    });
    GR.onMenu = openGroundMenu;
  }
  EOL.enterTown = enterTown;

  // ---------- facilities ----------
  function openFacility(id) {
    if (game.ui.length) return;
    switch (id) {
      case 'guild': return guildHall();
      case 'shop': return shop();
      case 'training': return trainingYard();
      case 'archive': return archive();
      case 'spring': return spring();
      case 'caravan': return caravan();
      case 'board': return rescueBoard();
      case 'memorial': return memorial();
      case 'kitchen': return kitchen();
      case 'bank': return bank();
    }
  }

  function guildHall() {
    const idx = SY.state.chapter;
    const ch = chapters()[idx];
    if (!ch) {
      ui.push({ title: 'Guild Hall', items: [{ label: 'The guild rests. Peace, for now.' }], onPick: () => ui.pop() });
      return;
    }
    ui.push({
      title: 'Guild Hall',
      items: [
        { label: `Next: ${ch.title}`, right: ch.domain || '' },
        { label: 'Not yet.' },
      ],
      onPick: (i) => {
        ui.clear();
        if (i === 0) playChapter(idx);
      },
    });
  }

  function shop() {
    const stock = ['oran-berry', 'apple', 'big-apple', 'pecha-berry', 'cheri-berry', 'chesto-berry', 'heal-seed', 'blast-seed', 'sleep-seed', 'stun-seed', 'max-elixir', 'escape-orb', 'luminous-orb', 'petrify-orb', 'reviver-seed', 'gravelerock', 'joy-seed'];
    if (SY.state.postgame) stock.push('empowerment-seed', 'evolution-crystal', 'sun-ribbon', 'lunar-ribbon');
    else if (SY.state.chapter >= 4) stock.push('evolution-crystal');
    ui.push({
      title: `Kecleon Shop  (${SY.state.money} Poke)`,
      items: stock.map(id => ({ label: IT.name(id), right: IT.DEFS[id].price + 'P' })),
      info: 'A: buy. B: leave. Money carried into dungeons is lost if you faint - use the bank!',
      onPick: (i) => {
        const id = stock[i];
        const def = IT.DEFS[id];
        if (SY.state.money < def.price) { toast('Not enough Poke!'); return; }
        if (!SY.addItem(id)) { toast('Your bag is full!'); return; }
        SY.state.money -= def.price;
        ui.top().title = `Kecleon Shop  (${SY.state.money} Poke)`;
        toast(`Bought a ${def.name}!`);
        SY.save(game.team);
      },
    });
  }

  function kitchen() {
    ui.push({
      title: 'Kitchen',
      items: [
        { label: 'Cook a hearty meal (50P)', right: 'Belly+ AP' },
        { label: 'Bake berry tarts (120P)', right: 'Wonder Gummi' },
      ],
      info: 'Cooking hones your Cooking skill.',
      onPick: (i) => {
        if (i === 0) {
          if (SY.state.money < 50) return toast('Not enough Poke!');
          SY.state.money -= 50;
          const msg = SY.gainSkill('Cooking', 14);
          if (Math.random() < 0.35) { SY.state.apPool++; toast('Delicious! +1 AP.'); } else toast('A fine meal.');
          if (msg) toast(msg);
        } else {
          if (SY.state.money < 120) return toast('Not enough Poke!');
          if (!SY.addItem('wonder-gummi')) return toast('Bag is full!');
          SY.state.money -= 120;
          SY.gainSkill('Cooking', 10);
          toast('Baked a Wonder Gummi!');
        }
        SY.save(game.team);
      },
    });
  }

  function bank() {
    ui.push({
      title: `Duskull Bank  (carried ${SY.state.money}P / stored ${SY.state.bank}P)`,
      items: [
        { label: 'Deposit all' },
        { label: 'Withdraw all' },
      ],
      onPick: (i) => {
        if (i === 0) { SY.state.bank += SY.state.money; SY.state.money = 0; }
        else { SY.state.money += SY.state.bank; SY.state.bank = 0; }
        ui.top().title = `Duskull Bank  (carried ${SY.state.money}P / stored ${SY.state.bank}P)`;
        SY.save(game.team);
      },
    });
  }

  function trainingYard() {
    ui.push({
      title: `Training Yard  (AP: ${SY.state.apPool})`,
      items: game.team.map(m => ({ label: `${m.name}  Lv${m.level}` })),
      info: 'Spend Attribute Points to permanently raise stats. Every stat costs the same for every Pokemon.',
      onPick: (i) => {
        const mon = game.team[i];
        const stats = [['hp', 'HP +2'], ['at', 'Attack +1'], ['df', 'Defense +1'], ['sa', 'Sp. Atk +1'], ['sd', 'Sp. Def +1'], ['sp', 'Speed +1']];
        ui.push({
          title: `${mon.name} - AP: ${SY.state.apPool}`,
          items: stats.map(([k, lbl]) => ({ label: lbl, right: `now ${k === 'hp' ? mon.maxhp : { at: mon.atk, df: mon.def, sa: mon.spa, sd: mon.spd, sp: mon.spe }[k]}` })),
          onPick: (j) => {
            if (!SY.spendAP(mon, stats[j][0])) return toast('No AP left!');
            ui.pop();
            ui.pop();
            SY.save(game.team);
            trainingYard();
            toast(`${mon.name} trained hard!`);
          },
        });
      },
    });
  }

  function spring() {
    const candidates = game.team.map((m, i) => ({ m, i, evos: m.canEvolve() })).filter(x => x.evos);
    if (!candidates.length) {
      ui.push({ title: 'Luminous Spring', items: [{ label: 'The spring is calm. No one is ready to evolve.' }], onPick: () => ui.pop() });
      return;
    }
    ui.push({
      title: 'Luminous Spring',
      items: candidates.map(c => ({ label: `${c.m.name}  Lv${c.m.level}` })),
      info: 'Evolution changes a Pokemon forever. Some evolutions need an Evolution Crystal.',
      onPick: (i) => {
        const c = candidates[i];
        ui.push({
          title: `Evolve ${c.m.name} into...`,
          items: c.evos.map(ev => {
            const needsItem = ev.m === 'item' || ev.m === 'link';
            const hasItem = SY.state.bag.some(s => s.id === 'evolution-crystal') || SY.state.postgame;
            return { label: D().pokedex[ev.to].name, right: needsItem ? (hasItem ? 'uses Crystal' : 'needs Crystal') : '', disabled: needsItem && !hasItem };
          }),
          onPick: (j, it) => {
            if (it.disabled) return toast('You need an Evolution Crystal.');
            const ev = c.evos[j];
            if ((ev.m === 'item' || ev.m === 'link') && !SY.state.postgame) {
              const idx = SY.state.bag.findIndex(s => s.id === 'evolution-crystal');
              if (idx >= 0) SY.removeItem(idx);
            }
            const oldName = c.m.name;
            c.m.evolveTo(ev.to);
            ui.clear();
            SY.save(game.team);
            game.mode = 'story';
            ST.play([
              { t: 'bg', v: 'night' },
              { t: 'call', fn: () => EOL.audio && EOL.audio.sfx('evolve') },
              { t: 'narr', text: 'Light wells up from the spring...' },
              { t: 'narr', text: `Congratulations! ${oldName} evolved into ${c.m.entry.name}!` },
            ], () => { game.mode = 'ground'; enterTown(); });
          },
        });
      },
    });
  }

  function archive() {
    const seen = Object.keys(SY.state.dexSeen).length;
    const total = Object.keys(D().pokedex).length;
    ui.push({
      title: 'Archive',
      items: [
        { label: `Pokedex progress`, right: `${seen}/${total}` },
        { label: `Ancient pages collected`, right: String((SY.state.bag.find(s => s.id === 'ancient-page') || { n: 0 }).n) },
        { label: 'About this game' },
      ],
      onPick: (i) => {
        if (i === 2) {
          ui.push({
            title: 'About',
            items: [
              { label: 'PMD: Explorers of Legends' },
              { label: 'A fan-made tribute to the' },
              { label: 'Mystery Dungeon series.' },
              { label: 'Sprites: PMDCollab SpriteCollab' },
              { label: 'Data: PokeAPI' },
            ],
            onPick: () => ui.pop(),
          });
        }
      },
    });
  }

  function memorial() {
    const r = SY.state.renown;
    ui.push({
      title: `Memorial Stone - "${SY.teamTitle()}"`,
      items: SY.RENOWN_TYPES.map(t => ({ label: U.cap(t) + ' Renown', right: String(r[t] || 0) })),
      info: `Partner's spirit: ${SY.moralBand()}. The stone hums with names old and new.`,
      onPick: () => { },
    });
  }

  function caravan() {
    const list = unlockedDungeons();
    if (!list.length) { toast('No routes are open yet. Ask at the Guild Hall!'); return; }
    ui.push({
      title: 'Caravan Post - choose a destination',
      items: list.map(d => ({ label: d.name, right: `${d.floors}F ${d.story ? '(STORY)' : ''}` })),
      info: 'Revisit cleared dungeons to train, recruit, and find items.',
      onPick: (i) => {
        ui.clear();
        embark(list[i].id, { story: !!list[i].story, chapterIdx: SY.state.chapter });
      },
    });
  }

  function unlockedDungeons() {
    const defs = EOL.CONTENT.dungeons;
    const out = [];
    const storyId = SY.state.flags.storyDungeon;
    if (storyId && defs[storyId]) out.push(Object.assign({ story: true }, defs[storyId]));
    for (const [id, d] of Object.entries(defs)) {
      if (SY.state.dungeonClears[id] && id !== storyId) out.push(d);
      else if (d.postgame && SY.state.postgame && id !== storyId && !out.some(x => x.id === id)) out.push(d);
    }
    return out;
  }

  function rescueBoard() {
    if (!SY.state.jobs) SY.state.jobs = [];
    if (!SY.state.jobs.length) generateJobs();
    ui.push({
      title: 'Rescue Board',
      items: SY.state.jobs.map(j => ({ label: j.text.slice(0, 34), right: j.reward + 'P' })),
      info: 'Take a job, then clear or escape the dungeon after helping the client.',
      onPick: (i) => {
        const job = SY.state.jobs[i];
        ui.clear();
        embark(job.dungeon, { job });
      },
    });
  }

  function generateJobs() {
    const cleared = Object.keys(SY.state.dungeonClears).filter(id => EOL.CONTENT.dungeons[id] && !EOL.CONTENT.dungeons[id].boss);
    if (!cleared.length) { SY.state.jobs = []; return; }
    const jobs = [];
    for (let i = 0; i < Math.min(3, cleared.length + 1); i++) {
      const dId = cleared[Math.floor(Math.random() * cleared.length)];
      const d = EOL.CONTENT.dungeons[dId];
      const pool = d.pool.map(p => typeof p === 'string' ? p : p.slug);
      const slug = pool[Math.floor(Math.random() * pool.length)];
      const floor = 2 + Math.floor(Math.random() * Math.max(1, d.floors - 2));
      jobs.push({
        kind: 'rescue', dungeon: dId, floor, slug,
        text: `Rescue ${D().pokedex[slug].name} on ${floor}F of ${d.name}!`,
        reward: 150 + floor * 60,
      });
    }
    SY.state.jobs = jobs;
  }

  // ---------- embark / return ----------
  function embark(dungeonId, opts) {
    const def = EOL.CONTENT.dungeons[dungeonId];
    if (!def) { toast('That route is closed.'); return; }
    opts = opts || {};
    GR.stop();
    ui.clear();
    game.mode = 'dungeon';
    lockInput(500);
    for (const m of game.team) { m.hp = m.maxhp; m.belly = 100; m.status = null; m.stages = EOL.battle.newStages(); }
    DG.start(def, game.team, {
      job: opts.job,
      onExit: (result) => onDungeonExit(def, result, opts),
    });
  }
  EOL.embark = embark;

  function onDungeonExit(def, result, opts) {
    game.mode = 'ground';
    // trim recruits beyond team cap into reserves
    while (game.team.length > 4) SY.state.reserves.push(game.team.pop().serialize());
    if (result.cleared) {
      SY.state.dungeonClears[def.id] = (SY.state.dungeonClears[def.id] || 0) + 1;
      SY.addRenown('explorer', 4 + def.floors, def.domain);
      SY.gainSkill('Pathfinding', 10 + def.floors);
      SY.gainSkill('Survival', 6 + def.floors);
    }
    if (opts.job && result.jobDone) {
      SY.state.money += opts.job.reward;
      SY.addRenown('heroic', 8);
      SY.gainSkill('First Aid', 10);
      SY.state.jobs = SY.state.jobs.filter(j => j !== opts.job);
      toast(`Job complete! +${opts.job.reward}P`);
    } else if (opts.job) {
      SY.state.jobs = SY.state.jobs.filter(j => j !== opts.job);
    }
    if (result.wiped) SY.moralShift(-2);
    SY.save(game.team);
    if (opts.story && result.cleared) {
      finishChapter(opts.chapterIdx);
      return;
    }
    if (opts.story && !result.cleared) {
      game.mode = 'story';
      ST.play([
        { t: 'bg', v: 'town' },
        { t: 'say', who: 'partner', emo: 'Sad', text: "We couldn't make it through... Let's rest up and try again. I'm not giving up. Not ever." },
      ], () => enterTown());
      return;
    }
    enterTown();
  }

  // ---------- ground menu ----------
  function openGroundMenu() {
    if (game.ui.length) { ui.pop(); return; }
    ui.push({
      title: SY.teamTitle(),
      x: 8, y: 24, w: 200,
      items: [
        { label: 'Team' },
        { label: 'Bag', right: `${SY.state.bag.length}/${SY.BAG_MAX}` },
        { label: 'Reserves', right: String(SY.state.reserves.length) },
        { label: 'Save' },
        { label: `Sound: ${EOL.audio && EOL.audio.enabled ? 'ON' : 'OFF'}` },
        { label: 'Export save' },
        { label: 'Import save' },
      ],
      onPick: (i) => {
        if (i === 0) teamMenu();
        else if (i === 1) bagMenu();
        else if (i === 2) reservesMenu();
        else if (i === 3) { SY.save(game.team); toast('Game saved!'); ui.clear(); }
        else if (i === 4) { const on = EOL.audio.toggle(); if (on) EOL.audio.music('town'); ui.clear(); toast(`Sound ${on ? 'on' : 'off'}.`); }
        else if (i === 5) { const s = SY.exportSave(); navigator.clipboard && navigator.clipboard.writeText(s); prompt('Copy your save code:', s); }
        else if (i === 6) { const s = prompt('Paste save code:'); if (s && SY.importSave(s)) { game.team = SY.state.team.map(d => EOL.Mon.from(d)); ui.clear(); enterTown(); toast('Save imported!'); } else if (s) toast('Invalid save code.'); }
      },
    });
  }

  function teamMenu() {
    ui.push({
      title: 'Team',
      items: game.team.map(m => ({ label: `${m.name} Lv${m.level}`, right: `${m.hp}/${m.maxhp}` })),
      onPick: (i) => {
        const m = game.team[i];
        const canLearn = (D().learnsets[m.slug] || []).filter(([lv, mv]) => lv <= m.level && !m.moves.some(x => x.id === mv));
        ui.push({
          title: `${m.name}  ${m.types.join('/')}`,
          items: [
            { label: `HP ${m.hp}/${m.maxhp}  Atk ${m.atk}  Def ${m.def}` },
            { label: `SpA ${m.spa}  SpD ${m.spd}  Spe ${m.spe}` },
            ...m.moves.map((ms, j) => ({ label: `Move: ${D().moves[ms.id].n}`, right: `${ms.pp}/${ms.maxpp}` })),
            canLearn.length ? { label: `Relearn/swap moves (${canLearn.length})` } : null,
            i > 0 && game.team.length > 2 ? { label: 'Send to reserves' } : null,
          ].filter(Boolean),
          onPick: (j, it) => {
            if (it.label.startsWith('Relearn')) moveTutor(m);
            else if (it.label === 'Send to reserves') {
              SY.state.reserves.push(game.team.splice(i, 1)[0].serialize());
              ui.clear(); SY.save(game.team); toast('Sent to reserves.');
            }
          },
        });
      },
    });
  }

  function moveTutor(m) {
    const options = (D().learnsets[m.slug] || []).filter(([lv, mv]) => lv <= m.level && !m.moves.some(x => x.id === mv));
    ui.push({
      title: `Teach ${m.name} which move?`,
      items: options.map(([lv, mv]) => ({ label: D().moves[mv].n, right: `${D().moves[mv].t} ${D().moves[mv].p || '-'}` })),
      onPick: (i) => {
        const mv = options[i][1];
        if (m.moves.length < 4) {
          m.moves.push({ id: mv, pp: D().moves[mv].pp, maxpp: D().moves[mv].pp });
          ui.pop(); SY.save(game.team); toast(`Learned ${D().moves[mv].n}!`);
        } else {
          ui.push({
            title: 'Forget which move?',
            items: m.moves.map(ms => ({ label: D().moves[ms.id].n })),
            onPick: (j) => {
              m.moves[j] = { id: mv, pp: D().moves[mv].pp, maxpp: D().moves[mv].pp };
              ui.pop(); ui.pop(); SY.save(game.team); toast(`Learned ${D().moves[mv].n}!`);
            },
          });
        }
      },
    });
  }

  function reservesMenu() {
    if (!SY.state.reserves.length) { toast('No Pokemon in reserves.'); return; }
    ui.push({
      title: 'Reserves (A: add to team)',
      items: SY.state.reserves.map(r => ({ label: `${D().pokedex[r.slug].name} Lv${r.level}` })),
      onPick: (i) => {
        if (game.team.length >= 4) return toast('Team is full (4 max). Send someone to reserves first.');
        const data = SY.state.reserves.splice(i, 1)[0];
        game.team.push(EOL.Mon.from(data));
        ui.clear(); SY.save(game.team); toast('Joined the team!');
      },
    });
  }

  function bagMenu() {
    ui.push({
      title: 'Bag (town: items usable in dungeons)',
      items: SY.state.bag.length ? SY.state.bag.map(s => ({ label: IT.name(s.id), right: s.n > 1 ? 'x' + s.n : '' })) : [{ label: '(empty)' }],
      onPick: () => { },
    });
  }

  // ---------- toast ----------
  let toastMsg = null, toastT = 0;
  function toast(msg) { toastMsg = msg; toastT = 150; }
  EOL.toast = toast;
  function drawToast(g) {
    if (toastT > 0 && toastMsg) {
      toastT--;
      g.font = 'bold 11px monospace';
      const w = g.measureText(toastMsg).width + 24;
      DG.pmdFrame(g, (W - w) / 2, 26, w, 26);
      g.fillStyle = '#fff'; g.fillText(toastMsg, (W - w) / 2 + 12, 43);
    }
  }

  // ---------- ending ----------
  function runEnding() {
    const key = SY.computeEnding();
    const end = EOL.CONTENT.endings[key] || EOL.CONTENT.endings['forgotten-hero'];
    SY.state.endingSeen = key;
    SY.state.postgame = true;
    SY.state.megaUnlocked = true;
    SY.save(game.team);
    game.mode = 'story';
    ST.play([...end, ...creditsOps()], () => {
      enterTown('Postgame: new legends await...');
    });
  }

  function creditsOps() {
    return [
      { t: 'bg', v: 'night' },
      { t: 'narr', text: '- POKEMON MYSTERY DUNGEON: EXPLORERS OF LEGENDS -' },
      { t: 'narr', text: 'A fan tribute to the Mystery Dungeon series. Pokemon is (c) Nintendo / Game Freak / The Pokemon Company. PMD is (c) Spike Chunsoft.' },
      { t: 'narr', text: 'Sprites and portraits: the amazing PMDCollab SpriteCollab community. Data: PokeAPI.' },
      { t: 'narr', text: 'And you - the ordinary hero who kept choosing kindness. THE END... and the beginning of the postgame!' },
    ];
  }

  // expose for content scripts
  EOL.playScene = (ops, cb) => { game.mode = 'story'; GR.stop(); ST.play(ops, cb || (() => { game.mode = 'ground'; enterTown(); })); };
  EOL.uiPush = ui.push;
})();
