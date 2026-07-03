// Dungeon mode: the classic PMD loop. Leader-clocked turns, allies then enemies act,
// belly, traps, items, recruitment on defeat, stairs progression, boss floors,
// monster houses, wind limit, rescue-job objectives, mega evolution via Empowerment Seed.
window.EOL = window.EOL || {};
(function () {
  const U = EOL.util, B = EOL.battle, G = EOL.dungeonGen, IT = EOL.items, SY = EOL.systems;
  const D = () => EOL.DATA;
  const DG = EOL.Dungeon = {};

  const TILE = 24;
  let S = null; // current dungeon session

  DG.active = () => !!S;
  DG.menuOpen = () => !!(S && S.menu);

  DG.start = function (def, team, opts) {
    opts = opts || {};
    if (!team || !team.length) { console.error('DG.start: empty team'); return; }
    S = {
      def, team, opts,
      floor: 0,
      entities: [], // {mon, x, y, dir, kind:'ally'|'enemy'|'npc', ai, tween}
      turn: 0, windWarned: 0,
      log: [], logTimer: 0,
      menu: null, // active overlay menu
      msgQueue: [],
      camera: { x: 0, y: 0 },
      animClock: 0,
      over: false,
      weather: def.weather || null,
      job: opts.job || null,
      bellyTimer: 0, regenTimer: 0,
      shake: 0,
      floorFlash: 0,
      mega: false,
    };
    for (const m of team) { m.stages = B.newStages(); m.hp = Math.max(1, m.hp); m.status = null; }
    nextFloor();
    pushLog(`${def.name}!`);
    if (S.job) pushLog(`Job: ${S.job.text}`);
    if (EOL.audio) EOL.audio.music('dungeon');
  };

  function tierOf() {
    return S.def.tier || (S.def.floors <= 6 ? 'early' : S.def.floors <= 12 ? 'mid' : 'late');
  }

  function nextFloor() {
    S.floor++;
    S.turn = 0; S.windWarned = 0;
    const def = S.def;
    const isBoss = def.bossFloor && S.floor === def.bossFloor;
    const seed = (def.seed || 12345) + S.floor * 7919 + Math.floor(Math.random() * 1e6);
    if (isBoss) {
      genBossFloor(seed);
      return;
    }
    const fl = G.generate({
      seed, water: def.biome && def.biome.water,
      monsterHouseChance: S.floor > 3 ? (def.monsterHouseChance || 0.06) : 0,
      noTraps: def.noTraps,
    });
    S.fl = fl;
    S.seen = Array.from({ length: fl.H }, () => new Array(fl.W).fill(false));
    S.entities = [];
    S.groundItems = []; // {x,y,id}
    S.traps = [];       // {x,y,id,revealed}
    // team placement
    const leader = S.team[0];
    placeTeam(fl.start.x, fl.start.y);
    revealAround();
    // items
    const loot = IT.FLOOR_LOOT[tierOf()];
    for (const p of fl.items) S.groundItems.push({ x: p.x, y: p.y, id: loot[Math.floor(Math.random() * loot.length)] });
    // traps
    const trapIds = Object.keys(IT.TRAPS);
    for (const p of fl.traps) S.traps.push({ x: p.x, y: p.y, id: trapIds[Math.floor(Math.random() * trapIds.length)], revealed: false });
    // enemies
    const n = 4 + Math.floor(Math.random() * 4) + (fl.monsterHouse !== null ? 5 : 0);
    for (let i = 0; i < n; i++) spawnEnemy(fl.monsterHouse !== null && i >= 4 ? fl.monsterHouse : null);
    // job target on its floor
    if (S.job && S.job.floor === S.floor && S.job.kind === 'rescue') {
      const p = fl.freeTileInRoom(U.pick(Math.random, fl.rooms));
      const mon = new EOL.Mon(S.job.slug, Math.max(1, enemyLevel() - 2));
      S.entities.push({ mon, x: p.x, y: p.y, dir: 0, kind: 'npc', npcJob: true });
    }
    pushLog(`${floorLabel()}`);
    S.floorFlash = 40;
  }

  function genBossFloor(seed) {
    // single arena room
    const W = 21, H = 15;
    const map = Array.from({ length: H }, (_, y) => new Array(W).fill(0).map((_, x) =>
      (x > 1 && x < W - 2 && y > 1 && y < H - 2) ? G.FLOOR : G.WALL));
    const roomId = Array.from({ length: H }, (_, y) => new Array(W).fill(0).map((_, x) => map[y][x] === G.FLOOR ? 0 : -1));
    S.fl = { map, roomId, rooms: [{ x: 2, y: 2, w: W - 4, h: H - 4, id: 0 }], W, H, start: { x: 4, y: Math.floor(H / 2) }, stairs: { x: -1, y: -1 }, monsterHouse: null };
    S.seen = Array.from({ length: H }, () => new Array(W).fill(true));
    S.entities = []; S.groundItems = []; S.traps = [];
    placeTeam(4, Math.floor(H / 2));
    const boss = S.def.boss;
    const bm = new EOL.Mon(boss.slug, boss.level);
    bm.stages = B.newStages();
    bm.isBoss = true;
    if (boss.hpMult) { bm.maxhp = Math.round(bm.maxhp * boss.hpMult); bm.hp = bm.maxhp; }
    S.entities.push({ mon: bm, x: W - 6, y: Math.floor(H / 2), dir: 6, kind: 'enemy', boss: true });
    for (let i = 0; i < (boss.allies || []).length; i++) {
      const a = boss.allies[i];
      const am = new EOL.Mon(a.slug, a.level); am.stages = B.newStages();
      S.entities.push({ mon: am, x: W - 5, y: Math.floor(H / 2) - 2 + i * 4, dir: 6, kind: 'enemy', boss: true });
    }
    if (boss.intro) pushLog(boss.intro);
    S.bossActive = true;
    S.floorFlash = 40;
    if (EOL.audio) EOL.audio.music('tense');
  }

  function floorLabel() {
    return (S.def.ascending ? '' : 'B') + S.floor + 'F';
  }

  function placeTeam(x, y) {
    const spots = [[0, 0], [-1, 0], [0, -1], [-1, -1], [1, 0], [0, 1]];
    let i = 0;
    for (const m of S.team) {
      if (m.hp <= 0) continue;
      let px = x, py = y;
      for (; i < spots.length; i++) {
        const tx = x + spots[i][0], ty = y + spots[i][1];
        if (walkable(tx, ty)) { px = tx; py = ty; i++; break; }
      }
      S.entities.push({ mon: m, x: px, y: py, dir: 2, kind: 'ally' });
    }
  }

  function enemyLevel() {
    const d = S.def;
    return Math.max(1, (d.lvlBase || 2) + Math.floor((S.floor - 1) * (d.lvlStep || 0.8)));
  }

  function spawnEnemy(forceRoom, nearEdge) {
    const fl = S.fl;
    const pool = S.def.pool;
    if (!pool || !pool.length) return;
    const slug = typeof pool[0] === 'string' ? U.pick(Math.random, pool) : weightedPick(pool);
    if (!D().pokedex[slug]) return;
    let room = forceRoom !== null && forceRoom !== undefined ? fl.rooms[forceRoom] : U.pick(Math.random, fl.rooms);
    for (let tries = 0; tries < 40; tries++) {
      const x = room.x + Math.floor(Math.random() * room.w);
      const y = room.y + Math.floor(Math.random() * room.h);
      if (walkable(x, y) && !entityAt(x, y) && U.chebyshev(x, y, leaderEnt().x, leaderEnt().y) > 4) {
        const mon = new EOL.Mon(slug, enemyLevel());
        mon.stages = B.newStages();
        S.entities.push({ mon, x, y, dir: Math.floor(Math.random() * 8), kind: 'enemy' });
        SY.state.dexSeen[slug] = true;
        return;
      }
      room = U.pick(Math.random, fl.rooms);
    }
  }
  function weightedPick(pool) {
    const total = pool.reduce((a, p) => a + (p.w || 1), 0);
    let r = Math.random() * total;
    for (const p of pool) { r -= (p.w || 1); if (r <= 0) return p.slug; }
    return pool[0].slug;
  }

  // ---- helpers ----
  const leaderEnt = () => S.entities.find(e => e.kind === 'ally' && e.mon === S.team.find(m => m.hp > 0));
  function walkable(x, y) {
    const fl = S.fl;
    if (x < 0 || y < 0 || x >= fl.W || y >= fl.H) return false;
    const t = fl.map[y][x];
    return t === G.FLOOR || t === G.CORRIDOR;
  }
  function entityAt(x, y) { return S.entities.find(e => e.x === x && e.y === y && e.mon.hp > 0); }
  function inSameRoom(a, b) {
    const fl = S.fl;
    const ra = fl.roomId[a.y][a.x], rb = fl.roomId[b.y][b.x];
    if (ra >= 0 && ra === rb) return true;
    return U.chebyshev(a.x, a.y, b.x, b.y) <= 2; // corridor "room" = 2 tiles
  }
  function canMoveDiag(x, y, dx, dy) {
    if (dx && dy) return walkable(x + dx, y) && walkable(x, y + dy); // PMD: no corner cutting through walls
    return true;
  }

  function revealAround() {
    const le = leaderEnt(); if (!le) return;
    const fl = S.fl;
    const rid = fl.roomId[le.y][le.x];
    if (rid >= 0) {
      const r = fl.rooms[rid];
      for (let y = r.y - 1; y <= r.y + r.h; y++) for (let x = r.x - 1; x <= r.x + r.w; x++)
        if (y >= 0 && x >= 0 && y < fl.H && x < fl.W) S.seen[y][x] = true;
    } else {
      for (let y = le.y - 1; y <= le.y + 1; y++) for (let x = le.x - 1; x <= le.x + 1; x++)
        if (y >= 0 && x >= 0 && y < fl.H && x < fl.W) S.seen[y][x] = true;
    }
  }

  function pushLog(msg) {
    S.log.push(msg);
    if (S.log.length > 60) S.log.shift();
    S.logTimer = 240;
  }
  DG.pushLog = pushLog;

  // ---- turn processing ----
  function endOfTurn() {
    S.turn++;
    SY.state.playTurns++;
    const leader = S.team[0];
    // belly drain (leader only - series standard)
    S.bellyTimer++;
    if (S.bellyTimer >= 8) {
      S.bellyTimer = 0;
      if (leader.belly > 0) leader.belly = Math.max(0, leader.belly - 1);
      else { leader.hp = Math.max(0, leader.hp - 2); if (leader.hp === 0) return wipe('You collapsed from hunger...'); pushLog('You are starving! Eat something!'); }
    }
    // natural regen
    S.regenTimer++;
    if (S.regenTimer >= 4) {
      S.regenTimer = 0;
      for (const m of S.team) if (m.hp > 0 && m.hp < m.maxhp) m.hp++;
    }
    // statuses for all entities
    for (const e of S.entities) {
      if (e.mon.hp > 0 && e.mon.status) B.tickStatus(e.mon, e.kind === 'ally' ? pushLog : null);
      if (e.mon.hp <= 0 && e.kind === 'ally') handleAllyFaint(e);
    }
    // wind
    const windAt = S.def.windTurns || 700;
    if (S.turn === windAt - 150 && !S.windWarned) { S.windWarned = 1; pushLog('Something is stirring... a strange wind begins to blow.'); }
    if (S.turn === windAt - 50) pushLog('The wind is howling! Hurry to the stairs!');
    if (S.turn >= windAt) return wipe('The wind blew your team out of the dungeon!');
    // trickle spawns
    if (Math.random() < 0.02 && S.entities.filter(e => e.kind === 'enemy' && e.mon.hp > 0).length < 10 && !S.bossActive) spawnEnemy();
  }

  function handleAllyFaint(e) {
    // reviver seed?
    const idx = SY.state.bag.findIndex(s => s.id === 'reviver-seed');
    if (idx >= 0) {
      SY.removeItem(idx);
      e.mon.hp = e.mon.maxhp;
      pushLog(`${e.mon.name} was revived by the Reviver Seed!`);
      return;
    }
    if (e.mon === S.team[0]) return wipe(`${e.mon.name} fainted...`);
    pushLog(`${e.mon.name} fainted... they'll rejoin you outside.`);
  }

  function wipe(msg) {
    pushLog(msg);
    S.over = true;
    const carried = SY.state.money;
    SY.state.money = 0;
    // lose half the bag
    SY.state.bag = SY.state.bag.filter(() => Math.random() < 0.5);
    setTimeout(() => finish({ wiped: true, lostMoney: carried }), 900);
  }

  function finish(result) {
    result.floorReached = S.floor;
    result.dungeon = S.def.id;
    for (const m of S.team) { m.belly = 100; m.stages = B.newStages(); m.status = null; if (m.hp <= 0) m.hp = 1; }
    if (S.mega) demega();
    const cb = S.opts.onExit;
    S = null;
    if (cb) cb(result);
  }

  function demega() {
    for (const m of S.team) {
      if (m.megaBase) { const frac = m.hp / m.maxhp; m.slug = m.megaBase; m.megaBase = null; m.recalc(); m.hp = Math.max(1, Math.round(m.maxhp * frac)); }
    }
  }

  // ---- actions ----
  function tryMove(ent, dir) {
    const [dx, dy] = U.DIRS[dir];
    ent.dir = dir;
    const nx = ent.x + dx, ny = ent.y + dy;
    if (!walkable(nx, ny) || !canMoveDiag(ent.x, ent.y, dx, dy)) return false;
    const other = entityAt(nx, ny);
    if (other) {
      if (ent.kind === 'ally' && other.kind === 'ally') { // swap
        const ox = ent.x, oy = ent.y;
        ent.x = nx; ent.y = ny; other.x = ox; other.y = oy;
        other.tween = 8; ent.tween = 8;
        return true;
      }
      return false;
    }
    ent.x = nx; ent.y = ny; ent.tween = 8;
    return true;
  }

  function leaderMove(dir) {
    const le = leaderEnt();
    if (!tryMove(le, dir)) return false;
    revealAround();
    afterLeaderStep();
    return true;
  }

  function afterLeaderStep() {
    const le = leaderEnt();
    // item pickup
    const gi = S.groundItems.findIndex(i => i.x === le.x && i.y === le.y);
    if (gi >= 0) {
      const it = S.groundItems[gi];
      if (it.id === 'poke') { S.groundItems.splice(gi, 1); const amt = 40 + Math.floor(Math.random() * 140); SY.state.money += amt; pushLog(`Picked up ${amt} Poke.`); }
      else if (SY.addItem(it.id)) { S.groundItems.splice(gi, 1); pushLog(`Picked up a ${IT.name(it.id)}.`); if (EOL.audio) EOL.audio.sfx('item'); }
      else pushLog(`Your bag is full! You step over the ${IT.name(it.id)}.`);
    }
    // trap
    const tr = S.traps.find(t => t.x === le.x && t.y === le.y);
    if (tr && !tr.sprung) {
      tr.revealed = true; tr.sprung = Math.random() < 0.85;
      if (tr.sprung) springTrap(tr, S.team[0]);
      else pushLog(`You stepped on a ${IT.TRAPS[tr.id].name}... but it failed!`);
      tr.sprung = false; tr.revealed = true;
    }
    // job npc adjacency
    const npc = S.entities.find(e => e.kind === 'npc' && e.npcJob && e.mon.hp > 0 && U.chebyshev(e.x, e.y, le.x, le.y) <= 1);
    if (npc) completeJob(npc);
    // stairs
    if (le.x === S.fl.stairs.x && le.y === S.fl.stairs.y) {
      S.menu = { type: 'stairs' };
      return;
    }
    runOtherTurns();
  }

  function completeJob(npc) {
    pushLog(`${npc.mon.name}: "You came for me! Thank you!!"`);
    npc.mon.hp = 0; npc.rescued = true;
    S.job.done = true;
    pushLog('Job objective complete! (You can Escape from the menu.)');
  }

  function springTrap(tr, mon) {
    const def = IT.TRAPS[tr.id];
    pushLog(`It's a ${def.name}!`);
    switch (def.fx) {
      case 'damage': mon.hp = Math.max(1, mon.hp - Math.floor(mon.maxhp * 0.15)); pushLog(`${mon.name} is hurt by spikes!`); break;
      case 'damage2': mon.hp = Math.max(1, mon.hp - Math.floor(mon.maxhp * 0.25)); pushLog(`A boulder crashes down on ${mon.name}!`); S.shake = 12; break;
      case 'psn': if (B.applyStatus(mon, 'psn', 6)) pushLog(`${mon.name} was poisoned!`); break;
      case 'slp': if (B.applyStatus(mon, 'slp', 3)) pushLog(`${mon.name} fell asleep!`); break;
      case 'cnf': if (B.applyStatus(mon, 'cnf', 4)) pushLog(`${mon.name} got dizzy!`); break;
      case 'warp': warpEntity(leaderEnt()); pushLog(`${mon.name} was warped away!`); break;
      case 'hunger': mon.belly = Math.max(0, mon.belly - 25); pushLog(`${mon.name}'s belly suddenly feels empty!`); break;
      case 'sticky': pushLog('Ugh, sticky goo! Your footing worsens.'); mon.stages.eva = Math.max(-6, mon.stages.eva - 1); break;
    }
  }
  function warpEntity(e) {
    const fl = S.fl;
    for (let tries = 0; tries < 100; tries++) {
      const r = U.pick(Math.random, fl.rooms);
      const x = r.x + Math.floor(Math.random() * r.w), y = r.y + Math.floor(Math.random() * r.h);
      if (walkable(x, y) && !entityAt(x, y)) { e.x = x; e.y = y; revealAround(); return; }
    }
  }

  // execute a move by entity toward its facing/targets. Returns true if acted.
  function useMove(ent, moveSlot) {
    const mon = ent.mon;
    const ms = mon.moves[moveSlot];
    if (!ms || ms.pp <= 0) { if (ent.kind === 'ally') pushLog('No PP left for that move!'); return false; }
    const mv = D().moves[ms.id];
    ms.pp--;
    const targets = findTargets(ent, mv);
    pushLog(`${mon.name} used ${mv.n}!`);
    if (!targets.length && mv.r !== 'self' && mv.c !== 0) { pushLog("...but there was no target!"); runAfterAction(ent); return true; }
    if (mv.c === 0) applyStatusMove(ent, mv, targets);
    else {
      for (const t of targets) dealMoveDamage(ent, t, mv);
    }
    runAfterAction(ent);
    return true;
  }

  function findTargets(ent, mv) {
    const foesOf = k => (k === 'ally') ? 'enemy' : 'ally';
    const foeKind = foesOf(ent.kind === 'enemy' ? 'enemy' : 'ally');
    const foes = S.entities.filter(e => (ent.kind === 'enemy' ? e.kind === 'ally' : e.kind === 'enemy') && e.mon.hp > 0);
    const allies = S.entities.filter(e => (ent.kind === 'enemy' ? e.kind === 'enemy' : e.kind === 'ally') && e.mon.hp > 0 && e !== ent);
    const [dx, dy] = U.DIRS[ent.dir];
    switch (mv.r) {
      case 'self': return [ent];
      case 'allies': return [ent, ...allies.filter(a => inSameRoom(ent, a))];
      case 'front': {
        const t = entityAt(ent.x + dx, ent.y + dy);
        return t && foes.includes(t) ? [t] : (t && mv.c === 0 ? [t] : []);
      }
      case 'line': {
        let x = ent.x, y = ent.y;
        for (let i = 0; i < 10; i++) {
          x += dx; y += dy;
          if (!walkable(x, y)) break;
          const t = entityAt(x, y);
          if (t) { if (foes.includes(t)) return [t]; break; }
        }
        return [];
      }
      case 'around': {
        return foes.filter(f => U.chebyshev(f.x, f.y, ent.x, ent.y) <= 1);
      }
      case 'room': {
        return foes.filter(f => inSameRoom(ent, f));
      }
    }
    return [];
  }

  function weatherMult(mv) {
    const w = S.weather;
    if (!w) return 1;
    if (w === 'rain') return mv.t === 'water' ? 1.25 : mv.t === 'fire' ? 0.75 : 1;
    if (w === 'sun') return mv.t === 'fire' ? 1.25 : mv.t === 'water' ? 0.75 : 1;
    if (w === 'sandstorm') return mv.t === 'rock' || mv.t === 'ground' ? 1.15 : 1;
    if (w === 'hail') return mv.t === 'ice' ? 1.2 : 1;
    return 1;
  }

  function dealMoveDamage(ent, target, mv) {
    const a = ent.mon, d = target.mon;
    if (!B.hitCheck(a, d, mv)) { pushLog(`${d.name} evaded the attack!`); return; }
    const r = B.computeDamage(a, d, mv);
    let dmg = Math.round(r.dmg * weatherMult(mv));
    d.hp = Math.max(0, d.hp - dmg);
    let fx = '';
    if (r.eff > 1) fx = " It's super effective!";
    else if (r.eff < 0.6) fx = ' It barely has any effect...';
    else if (r.eff < 1) fx = " It's not very effective...";
    pushLog(`${d.name} took ${dmg} damage!${r.crit ? ' Critical hit!' : ''}${fx}`);
    if (EOL.audio) EOL.audio.sfx(r.crit ? 'crit' : 'hit');
    // secondary status
    if (mv.ec && !d.status && Math.random() < mv.ec / 100) {
      const sid = B.SECONDARY[mv.t];
      if (sid && B.applyStatus(d, sid)) pushLog(`${d.name} is ${B.STATUS_NAMES[sid]}!`);
    }
    target.hitFlash = 10;
    if (d.hp <= 0) onDefeat(ent, target);
  }

  function applyStatusMove(ent, mv, targets) {
    const fx = B.STATUS_FX[mv.n.toLowerCase()];
    const a = ent.mon;
    if (!fx) {
      if (mv.r === 'self' || !targets.length) { a.stages.df = Math.min(6, a.stages.df + 1); pushLog(`${a.name} braced itself.`); }
      else for (const t of targets) { t.mon.stages.acc = Math.max(-6, t.mon.stages.acc - 1); pushLog(`${t.mon.name}'s accuracy fell.`); }
      return;
    }
    const statNames = { at: 'Attack', df: 'Defense', sa: 'Sp. Atk', sd: 'Sp. Def', sp: 'Speed', acc: 'accuracy', eva: 'evasion' };
    switch (fx.kind) {
      case 'stage': {
        const tl = fx.self ? [ent] : (targets.length ? targets : [ent]);
        for (const t of tl) {
          t.mon.stages[fx.stat] = U.clamp(t.mon.stages[fx.stat] + fx.delta, -6, 6);
          pushLog(`${t.mon.name}'s ${statNames[fx.stat]} ${fx.delta > 0 ? 'rose' : 'fell'}${Math.abs(fx.delta) > 1 ? ' sharply' : ''}!`);
        }
        break;
      }
      case 'status':
        for (const t of targets) {
          if (B.hitCheck(a, t.mon, mv) && B.applyStatus(t.mon, fx.id, fx.turns)) pushLog(`${t.mon.name} is ${B.STATUS_NAMES[fx.id]}!`);
          else pushLog(`It failed on ${t.mon.name}!`);
        }
        break;
      case 'heal': a.hp = Math.min(a.maxhp, a.hp + Math.floor(a.maxhp * fx.frac)); pushLog(`${a.name} regained health!`); break;
      case 'healother': for (const t of targets) { t.mon.hp = Math.min(t.mon.maxhp, t.mon.hp + Math.floor(t.mon.maxhp * fx.frac)); pushLog(`${t.mon.name} regained health!`); } break;
      case 'rest': a.hp = a.maxhp; B.applyStatus(a, 'slp', 2); pushLog(`${a.name} went to sleep and became healthy!`); break;
      case 'protect': a.stages.eva = Math.min(6, a.stages.eva + 2); pushLog(`${a.name} protected itself!`); break;
      case 'flee': for (const t of targets) { warpEntity(t); pushLog(`${t.mon.name} was blown away!`); } break;
    }
  }

  function regularAttack(ent) {
    const [dx, dy] = U.DIRS[ent.dir];
    const t = entityAt(ent.x + dx, ent.y + dy);
    const isFoe = t && ((ent.kind === 'enemy') ? t.kind === 'ally' : t.kind === 'enemy');
    pushLog(`${ent.mon.name} attacks!`);
    if (t && isFoe) {
      const dmg = B.regularAttack(ent.mon, t.mon);
      t.mon.hp = Math.max(0, t.mon.hp - dmg);
      t.hitFlash = 10;
      pushLog(`${t.mon.name} took ${dmg} damage!`);
      if (t.mon.hp <= 0) onDefeat(ent, t);
    }
    runAfterAction(ent);
  }

  function onDefeat(ent, target) {
    const d = target.mon;
    pushLog(`${d.name} was defeated!`);
    if (target.kind === 'enemy') {
      const xp = EOL.expYield(d.slug, d.level);
      for (const m of S.team) if (m.hp > 0) {
        for (const ev of m.gainExp(xp)) announce(ev);
      }
      // recruitment - leader's final blow, capped team of 4 (series style)
      if (ent.kind === 'ally' && ent.mon === S.team[0] && !target.boss && !S.def.noRecruit) tryRecruit(target);
      if (target.boss && !S.entities.some(e => e.kind === 'enemy' && e.boss && e.mon.hp > 0)) {
        S.bossActive = false;
        pushLog('The way forward is open!');
        setTimeout(() => finish({ cleared: true, boss: true }), 800);
      }
    } else if (target.kind === 'ally') {
      handleAllyFaint(target);
    }
  }

  function announce(ev) {
    if (ev.type === 'levelup') { pushLog(`${ev.mon.name} grew to level ${ev.level}! (+1 AP)`); SY.state.apPool++; if (EOL.audio) EOL.audio.sfx('levelup'); }
    if (ev.type === 'learned') pushLog(`${ev.mon.name} learned ${D().moves[ev.move].n}!`);
    if (ev.type === 'canlearn') pushLog(`${ev.mon.name} wants to learn ${D().moves[ev.move].n}... (manage moves in Team menu)`);
  }

  function tryRecruit(target) {
    const d = target.mon;
    const e = d.entry;
    if (e.leg && !SY.state.postgame) return; // legendaries only postgame (canon)
    const leader = S.team[0];
    let chance = (e.cr / 255) * 0.22;
    chance += Math.max(0, (leader.level - d.level)) * 0.008;
    chance += SY.rankOf('Charisma') * 0.02 + SY.rankOf('Beast Handling') * 0.02;
    if (S.team.length >= 4) chance = 0;
    if (Math.random() < chance) {
      const nm = new EOL.Mon(d.slug, d.level, { isAlly: true });
      nm.stages = B.newStages();
      S.team.push(nm);
      S.entities.push({ mon: nm, x: target.x, y: target.y, dir: target.dir, kind: 'ally' });
      SY.state.recruits++;
      pushLog(`${d.name} wants to join your team! ${d.name} joined!`);
      SY.gainSkill('Beast Handling', 8);
      if (EOL.audio) EOL.audio.sfx('recruit');
    }
  }

  function runAfterAction(ent) {
    if (ent.kind === 'ally' && ent.mon === S.team[0]) runOtherTurns();
  }

  // allies + enemies act
  function runOtherTurns() {
    for (const e of S.entities) {
      if (e.mon.hp <= 0 || e.kind === 'npc') continue;
      if (e.kind === 'ally' && e.mon === S.team[0]) continue;
      const st = e.mon.status ? B.tickStatus(e.mon, null) : { canAct: true };
      if (!st.canAct) continue;
      if (e.mon.status && e.mon.status.id === 'cnf' && Math.random() < 0.5) {
        tryMove(e, Math.floor(Math.random() * 8));
        continue;
      }
      if (e.kind === 'ally') allyAI(e);
      else enemyAI(e);
    }
    endOfTurn();
  }

  function allyAI(e) {
    const le = leaderEnt(); if (!le) return;
    // attack adjacent enemy
    const foes = S.entities.filter(x => x.kind === 'enemy' && x.mon.hp > 0);
    const adj = foes.find(f => U.chebyshev(f.x, f.y, e.x, e.y) <= 1);
    if (adj) {
      e.dir = U.dirFromDelta(adj.x - e.x, adj.y - e.y);
      const usable = e.mon.moves.map((m, i) => i).filter(i => e.mon.moves[i].pp > 0 && D().moves[e.mon.moves[i].id].c !== 0);
      if (usable.length && Math.random() < 0.6) useMoveQuiet(e, U.pick(Math.random, usable));
      else { attackQuiet(e, adj); }
      return;
    }
    // use a line move if enemy in room
    const roomFoe = foes.find(f => inSameRoom(e, f));
    if (roomFoe && Math.random() < 0.3) {
      e.dir = U.dirFromDelta(Math.sign(roomFoe.x - e.x), Math.sign(roomFoe.y - e.y));
      const lineMoves = e.mon.moves.map((m, i) => i).filter(i => e.mon.moves[i].pp > 0 && ['line', 'room'].includes(D().moves[e.mon.moves[i].id].r));
      if (lineMoves.length) { useMoveQuiet(e, U.pick(Math.random, lineMoves)); return; }
    }
    // follow leader
    const dist = U.chebyshev(e.x, e.y, le.x, le.y);
    if (dist > 1) {
      const dir = U.dirFromDelta(Math.sign(le.x - e.x), Math.sign(le.y - e.y));
      if (!tryMove(e, dir)) {
        for (const alt of [dir + 1, dir + 7, dir + 2, dir + 6]) if (tryMove(e, alt % 8)) break;
      }
    }
  }

  function useMoveQuiet(e, slot) { useMoveNoChain(e, slot); }
  function useMoveNoChain(ent, moveSlot) {
    const mon = ent.mon;
    const ms = mon.moves[moveSlot];
    if (!ms || ms.pp <= 0) return false;
    const mv = D().moves[ms.id];
    ms.pp--;
    const targets = findTargets(ent, mv);
    if (!targets.length && mv.r !== 'self') return true;
    pushLog(`${mon.name} used ${mv.n}!`);
    if (mv.c === 0) applyStatusMove(ent, mv, targets);
    else for (const t of targets) dealMoveDamage(ent, t, mv);
    return true;
  }
  function attackQuiet(ent, t) {
    ent.dir = U.dirFromDelta(t.x - ent.x, t.y - ent.y);
    const dmg = B.regularAttack(ent.mon, t.mon);
    t.mon.hp = Math.max(0, t.mon.hp - dmg);
    t.hitFlash = 10;
    pushLog(`${ent.mon.name} attacks! ${t.mon.name} took ${dmg} damage!`);
    if (t.mon.hp <= 0) onDefeat(ent, t);
  }

  function enemyAI(e) {
    const allies = S.entities.filter(x => x.kind === 'ally' && x.mon.hp > 0);
    if (!allies.length) return;
    let nearest = allies[0], nd = 1e9;
    for (const a of allies) { const d0 = U.chebyshev(a.x, a.y, e.x, e.y); if (d0 < nd) { nd = d0; nearest = a; } }
    if (nd <= 1) {
      e.dir = U.dirFromDelta(nearest.x - e.x, nearest.y - e.y);
      const usable = e.mon.moves.map((m, i) => i).filter(i => e.mon.moves[i].pp > 0 && D().moves[e.mon.moves[i].id].c !== 0);
      if (usable.length && Math.random() < 0.5) useMoveNoChain(e, U.pick(Math.random, usable));
      else attackQuiet(e, nearest);
      return;
    }
    if (inSameRoom(e, nearest) || nd <= 6) {
      // ranged?
      if (Math.random() < 0.25) {
        e.dir = U.dirFromDelta(Math.sign(nearest.x - e.x), Math.sign(nearest.y - e.y));
        const lm = e.mon.moves.map((m, i) => i).filter(i => e.mon.moves[i].pp > 0 && ['line', 'room', 'around'].includes(D().moves[e.mon.moves[i].id].r));
        if (lm.length && useMoveNoChain(e, U.pick(Math.random, lm))) return;
      }
      const dir = U.dirFromDelta(Math.sign(nearest.x - e.x), Math.sign(nearest.y - e.y));
      if (!tryMove(e, dir)) { for (const alt of [dir + 1, dir + 7]) if (tryMove(e, alt % 8)) break; }
    } else if (Math.random() < 0.5) {
      tryMove(e, Math.floor(Math.random() * 8));
    }
  }

  // ---- item use from bag ----
  DG.useItem = function (idx) {
    const st = SY.state;
    const slot = st.bag[idx];
    if (!slot) return;
    const id = slot.id, def = IT.DEFS[id];
    const leader = S.team[0];
    const le = leaderEnt();
    let used = true;
    switch (id) {
      case 'oran-berry': leader.hp = Math.min(leader.maxhp, leader.hp + 100); pushLog(`${leader.name} ate the Oran Berry! HP restored.`); break;
      case 'sitrus-berry': leader.hp = leader.maxhp; leader.maxhp += 2; pushLog(`${leader.name} ate the Sitrus Berry! HP fully restored.`); break;
      case 'pecha-berry': if (leader.status && leader.status.id === 'psn') leader.status = null; pushLog('The poison faded.'); break;
      case 'cheri-berry': if (leader.status && leader.status.id === 'par') leader.status = null; pushLog('The paralysis wore off.'); break;
      case 'chesto-berry': if (leader.status && leader.status.id === 'slp') leader.status = null; pushLog(`${leader.name} woke right up.`); break;
      case 'rawst-berry': if (leader.status && leader.status.id === 'brn') leader.status = null; pushLog('The burn healed.'); break;
      case 'heal-seed': leader.status = null; pushLog(`${leader.name} feels refreshed!`); break;
      case 'apple': leader.belly = Math.min(100, leader.belly + 50); pushLog(`${leader.name} ate the Apple. Belly restored.`); break;
      case 'big-apple': leader.belly = 100; pushLog(`${leader.name} ate the Big Apple. Belly is full!`); break;
      case 'grimy-food': leader.belly = Math.min(100, leader.belly + 30); if (Math.random() < 0.4) { B.applyStatus(leader, 'psn', 4); pushLog('Urk... that food was foul!'); } else pushLog('It tasted... questionable.'); break;
      case 'max-elixir': for (const m of leader.moves) m.pp = m.maxpp; pushLog('All move PP was restored!'); break;
      case 'joy-seed': leader.gainExp(leader.expToNext()); pushLog(`${leader.name} ate the Joy Seed!`); break;
      case 'blast-seed': { const [dx, dy] = U.DIRS[le.dir]; const t = entityAt(le.x + dx, le.y + dy); if (t && t.kind === 'enemy') { t.mon.hp = Math.max(0, t.mon.hp - 60); t.hitFlash = 10; pushLog(`The Blast Seed exploded! ${t.mon.name} took 60 damage!`); if (t.mon.hp <= 0) onDefeat(le, t); } else pushLog('The Blast Seed fizzled with no target.'); break; }
      case 'sleep-seed': { const [dx, dy] = U.DIRS[le.dir]; const t = entityAt(le.x + dx, le.y + dy); if (t && B.applyStatus(t.mon, 'slp', 4)) pushLog(`${t.mon.name} fell asleep!`); else pushLog('No effect.'); break; }
      case 'stun-seed': { const [dx, dy] = U.DIRS[le.dir]; const t = entityAt(le.x + dx, le.y + dy); if (t && B.applyStatus(t.mon, 'par', 4)) pushLog(`${t.mon.name} was paralyzed!`); else pushLog('No effect.'); break; }
      case 'warp-seed': warpEntity(le); pushLog(`${leader.name} was warped away!`); break;
      case 'gravelerock': case 'geo-pebble': { // throw down the line
        const [dx, dy] = U.DIRS[le.dir];
        let x = le.x, y = le.y, hit = null;
        for (let i = 0; i < 10; i++) { x += dx; y += dy; if (!walkable(x, y)) break; const t = entityAt(x, y); if (t && t.kind === 'enemy') { hit = t; break; } }
        if (hit) { const dmg = id === 'gravelerock' ? 20 : 10; hit.mon.hp = Math.max(0, hit.mon.hp - dmg); hit.hitFlash = 10; pushLog(`The rock hit ${hit.mon.name} for ${dmg} damage!`); if (hit.mon.hp <= 0) onDefeat(le, hit); }
        else pushLog('The rock clattered away.');
        break;
      }
      case 'escape-orb': pushLog('The team escaped the dungeon!'); SY.removeItem(idx); S.menu = null; setTimeout(() => finish({ escaped: true, jobDone: S.job && S.job.done }), 500); return;
      case 'luminous-orb': for (let y = 0; y < S.fl.H; y++) for (let x = 0; x < S.fl.W; x++) S.seen[y][x] = true; pushLog('The floor layout flooded into your mind!'); break;
      case 'petrify-orb': for (const f of S.entities.filter(x => x.kind === 'enemy' && x.mon.hp > 0 && inSameRoom(x, le))) B.applyStatus(f.mon, 'ter', 5); pushLog('Enemies in the room were petrified!'); break;
      case 'foe-hold-orb': for (const f of S.entities.filter(x => x.kind === 'enemy' && x.mon.hp > 0 && inSameRoom(x, le))) B.applyStatus(f.mon, 'ter', 8); pushLog('Enemies in the room are held fast!'); break;
      case 'all-mach-orb': pushLog('Your team feels lighter on its feet!'); break;
      case 'empowerment-seed': {
        if (!SY.state.megaUnlocked) { pushLog('The seed is dormant... something must awaken it first.'); used = false; break; }
        const mf = leader.megaForm();
        if (!mf) { pushLog(`${leader.name} has no Mega form...`); used = false; break; }
        const frac = leader.hp / leader.maxhp;
        leader.megaBase = leader.slug;
        leader.slug = mf; leader.recalc();
        leader.hp = Math.max(1, Math.round(leader.maxhp * frac));
        S.mega = true;
        pushLog(`${leader.name} Mega Evolved into ${leader.entry.name}!`);
        S.shake = 14;
        break;
      }
      case 'wonder-gummi': { const cats = Object.values(SY.SKILLS).flat(); const sk = cats[Math.floor(Math.random() * cats.length)]; const msg = SY.gainSkill(sk, 30); pushLog(`${leader.name} ate the Wonder Gummi!`); if (msg) pushLog(msg); break; }
      default: pushLog(`You can't use the ${def.name} here.`); used = false;
    }
    if (used && id !== 'escape-orb') { SY.removeItem(idx); S.menu = null; runOtherTurns(); }
  };

  // ---- public input handling ----
  DG.input = function (action, data) {
    if (!S || S.over) return;
    if (S.menu) return menuInput(action, data);
    const le = leaderEnt(); if (!le) return;
    switch (action) {
      case 'move': leaderMove(data); break;
      case 'turn': le.dir = data; break;
      case 'attack': regularAttack(le); break;
      case 'menu': S.menu = { type: 'main', sel: 0 }; break;
      case 'moves': S.menu = { type: 'moves', sel: 0 }; break;
      case 'wait': runOtherTurns(); break;
    }
  };

  function menuInput(action, data) {
    const m = S.menu;
    const close = () => S.menu = null;
    if (action === 'cancel') { if (m.type === 'stairs') { close(); runOtherTurns(); return; } close(); return; }
    if (m.type === 'stairs') {
      if (action === 'confirm') {
        close();
        if (EOL.audio) EOL.audio.sfx('stairs');
        if (S.floor >= S.def.floors) {
          pushLog('You reached the end of the dungeon!');
          setTimeout(() => finish({ cleared: true, jobDone: S.job && S.job.done }), 600);
        } else nextFloor();
      }
      return;
    }
    if (action === 'nav') m.sel = (m.sel + data + menuLen(m)) % menuLen(m);
    if (action === 'confirm') menuConfirm(m);
  }
  function menuLen(m) {
    if (m.type === 'main') return 6;
    if (m.type === 'moves') return S.team[0].moves.length;
    if (m.type === 'bag') return Math.max(1, SY.state.bag.length);
    if (m.type === 'team') return S.team.length;
    return 1;
  }
  function menuConfirm(m) {
    if (m.type === 'main') {
      const items = ['Moves', 'Bag', 'Team', 'Ground', 'Wait', 'Escape'];
      const pick = items[m.sel];
      if (pick === 'Moves') S.menu = { type: 'moves', sel: 0 };
      else if (pick === 'Bag') S.menu = { type: 'bag', sel: 0 };
      else if (pick === 'Team') S.menu = { type: 'team', sel: 0 };
      else if (pick === 'Ground') { S.menu = null; checkGround(); }
      else if (pick === 'Wait') { S.menu = null; runOtherTurns(); }
      else if (pick === 'Escape') { S.menu = null; pushLog('You gave up and left the dungeon...'); setTimeout(() => finish({ escaped: true, gaveUp: true, jobDone: S.job && S.job.done }), 500); }
    } else if (m.type === 'moves') {
      const le = leaderEnt();
      S.menu = null;
      useMove(le, m.sel);
    } else if (m.type === 'bag') {
      if (!SY.state.bag.length) { S.menu = null; return; }
      DG.useItem(m.sel);
    } else if (m.type === 'team') {
      S.menu = { type: 'teaminfo', sel: m.sel };
    } else if (m.type === 'teaminfo') {
      S.menu = { type: 'team', sel: m.sel };
    }
  }
  function checkGround() {
    const le = leaderEnt();
    if (le.x === S.fl.stairs.x && le.y === S.fl.stairs.y) { S.menu = { type: 'stairs' }; return; }
    pushLog('There is nothing underfoot.');
  }

  // Debug/test hook: instantly resolve the current floor (used by automated tests)
  DG.__testWin = function () {
    if (!S || S.over) return;
    if (S.bossActive) {
      const le = leaderEnt(); if (!le) return;
      for (const e of S.entities.filter(x => x.kind === 'enemy' && x.mon.hp > 0)) {
        e.mon.hp = 1;
        attackQuiet(le, e);
        if (!S) return; // finished mid-loop
      }
      return;
    }
    const le = leaderEnt(); if (!le) return;
    le.x = S.fl.stairs.x; le.y = S.fl.stairs.y;
    S.menu = null;
    if (S.floor >= S.def.floors) {
      setTimeout(() => { if (S) finish({ cleared: true, jobDone: S.job && S.job.done }); }, 50);
    } else nextFloor();
  };

  // ---- rendering ----
  DG.draw = function (g, W, H) {
    if (!S) return;
    S.animClock++;
    const fl = S.fl;
    const le = leaderEnt();
    // camera follows leader (tweened)
    const targetX = le.x * TILE - W / 2 + TILE / 2, targetY = le.y * TILE - H / 2 + TILE / 2;
    S.camera.x += (targetX - S.camera.x) * 0.2;
    S.camera.y += (targetY - S.camera.y) * 0.2;
    let camX = Math.round(S.camera.x), camY = Math.round(S.camera.y);
    if (S.shake > 0) { S.shake--; camX += Math.round((Math.random() - 0.5) * 6); camY += Math.round((Math.random() - 0.5) * 6); }

    const biome = S.def.biome || {};
    const wallC = biome.wall || '#4a3b60', wallTop = biome.wallTop || '#6a5788';
    const floorC = biome.ground || '#8a7a5a', floorC2 = biome.ground2 || shade(floorC, -12);
    const corrC = biome.corridor || shade(floorC, -25);

    g.fillStyle = '#0a0812'; g.fillRect(0, 0, W, H);
    const x0 = Math.max(0, Math.floor(camX / TILE)), y0 = Math.max(0, Math.floor(camY / TILE));
    const x1 = Math.min(fl.W - 1, Math.ceil((camX + W) / TILE)), y1 = Math.min(fl.H - 1, Math.ceil((camY + H) / TILE));
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
      const px = x * TILE - camX, py = y * TILE - camY;
      const t = fl.map[y][x];
      if (t === G.WALL) {
        g.fillStyle = wallC; g.fillRect(px, py, TILE, TILE);
        if (y + 1 < fl.H && fl.map[y + 1][x] !== G.WALL) { g.fillStyle = wallTop; g.fillRect(px, py + TILE - 5, TILE, 5); }
        else { g.fillStyle = shade(wallC, 8); g.fillRect(px + 1, py + 1, TILE - 2, 2); }
      } else if (t === G.WATER) {
        const ph = Math.sin(S.animClock / 20 + x + y) * 8;
        g.fillStyle = `rgb(40,${90 + ph | 0},${170 + ph | 0})`; g.fillRect(px, py, TILE, TILE);
        g.fillStyle = 'rgba(255,255,255,0.15)'; g.fillRect(px + 3, py + 5 + Math.sin(S.animClock / 12 + x) * 2, 6, 1);
      } else {
        g.fillStyle = t === G.CORRIDOR ? corrC : ((x + y) % 2 ? floorC : floorC2);
        g.fillRect(px, py, TILE, TILE);
        if (t === G.FLOOR) { g.fillStyle = 'rgba(0,0,0,0.06)'; if ((x * 7 + y * 13) % 5 === 0) g.fillRect(px + 8, py + 9, 3, 2); }
      }
    }
    // stairs
    if (fl.stairs.x >= 0) {
      const px = fl.stairs.x * TILE - camX, py = fl.stairs.y * TILE - camY;
      g.fillStyle = '#d8d0f8'; g.fillRect(px + 3, py + 3, TILE - 6, TILE - 6);
      g.fillStyle = '#8878c8';
      for (let i = 0; i < 4; i++) g.fillRect(px + 4, py + 4 + i * 4, TILE - 8 - i * 3, 3);
    }
    // items
    for (const it of S.groundItems) {
      const px = it.x * TILE - camX + TILE / 2, py = it.y * TILE - camY + TILE / 2;
      const def = IT.DEFS[it.id];
      g.save(); g.translate(px, py); g.rotate(Math.PI / 4);
      g.fillStyle = def ? def.color : '#fff'; g.fillRect(-5, -5, 10, 10);
      g.strokeStyle = 'rgba(0,0,0,0.4)'; g.strokeRect(-5, -5, 10, 10);
      g.restore();
    }
    // traps (revealed)
    for (const tr of S.traps.filter(t => t.revealed)) {
      const px = tr.x * TILE - camX + TILE / 2, py = tr.y * TILE - camY + TILE / 2;
      g.strokeStyle = IT.TRAPS[tr.id].color; g.lineWidth = 2;
      g.beginPath(); g.moveTo(px - 6, py - 6); g.lineTo(px + 6, py + 6); g.moveTo(px + 6, py - 6); g.lineTo(px - 6, py + 6); g.stroke();
      g.lineWidth = 1;
    }
    // entities sorted by y
    const ents = S.entities.filter(e => e.mon.hp > 0).sort((a, b) => a.y - b.y);
    for (const e of ents) {
      if (e.tween > 0) e.tween--;
      const px = e.x * TILE - camX + TILE / 2, py = e.y * TILE - camY + TILE / 2;
      if (e.hitFlash > 0) { e.hitFlash--; if (e.hitFlash % 4 < 2) continue; }
      EOL.sprites.drawMon(g, e.mon.entry, px, py, e.dir, S.animClock, e.tween > 0);
      // hp bar for damaged
      if (e.mon.hp < e.mon.maxhp) {
        const w = 20, frac = e.mon.hp / e.mon.maxhp;
        g.fillStyle = 'rgba(0,0,0,0.5)'; g.fillRect(px - w / 2, py + 9, w, 3);
        g.fillStyle = frac > 0.5 ? '#40d080' : frac > 0.25 ? '#e0c040' : '#e05040';
        g.fillRect(px - w / 2, py + 9, w * frac, 3);
      }
      if (e.npcJob) { g.fillStyle = '#ffe060'; g.font = 'bold 12px monospace'; g.fillText('!', px - 2, py - 26 + Math.sin(S.animClock / 10) * 2); }
      if (e.boss) { g.fillStyle = '#ff6060'; g.font = 'bold 10px monospace'; g.fillText('BOSS', px - 12, py - 26); }
    }
    drawHUD(g, W, H);
    drawMinimap(g, W, H);
    drawLog(g, W, H);
    if (S.menu) drawMenu(g, W, H);
    if (S.floorFlash > 0) {
      S.floorFlash--;
      g.fillStyle = `rgba(0,0,0,${Math.min(1, S.floorFlash / 20)})`;
      g.fillRect(0, 0, W, H);
      g.fillStyle = '#fff'; g.font = 'bold 16px monospace'; g.textAlign = 'center';
      g.fillText(`${S.def.name}  ${floorLabel()}`, W / 2, H / 2);
      g.textAlign = 'left';
    }
  };

  function shade(hex, amt) {
    const n = parseInt(hex.slice(1), 16);
    const r = U.clamp((n >> 16) + amt, 0, 255), g2 = U.clamp((n >> 8 & 255) + amt, 0, 255), b = U.clamp((n & 255) + amt, 0, 255);
    return `rgb(${r},${g2},${b})`;
  }

  function pmdFrame(g, x, y, w, h) {
    g.fillStyle = 'rgba(16,24,64,0.92)';
    g.fillRect(x, y, w, h);
    g.strokeStyle = '#e8e8f8'; g.lineWidth = 2; g.strokeRect(x + 1.5, y + 1.5, w - 3, h - 3);
    g.strokeStyle = '#8090d0'; g.lineWidth = 1; g.strokeRect(x + 4.5, y + 4.5, w - 9, h - 9);
  }
  DG.pmdFrame = pmdFrame;

  function drawHUD(g, W) {
    const leader = S.team[0];
    g.font = 'bold 11px monospace';
    g.fillStyle = 'rgba(8,10,30,0.75)'; g.fillRect(0, 0, W, 18);
    g.fillStyle = '#ffe9a0';
    g.fillText(`${floorLabel()}`, 6, 13);
    g.fillStyle = '#fff';
    g.fillText(`Lv${leader.level}`, 44, 13);
    // hp bar
    const frac = leader.hp / leader.maxhp;
    g.fillText(`HP`, 84, 13);
    g.fillStyle = '#303860'; g.fillRect(104, 5, 90, 8);
    g.fillStyle = frac > 0.5 ? '#40d080' : frac > 0.25 ? '#e0c040' : '#e05040';
    g.fillRect(104, 5, 90 * frac, 8);
    g.strokeStyle = '#fff'; g.strokeRect(104.5, 5.5, 89, 7);
    g.fillStyle = '#fff';
    g.fillText(`${leader.hp}/${leader.maxhp}`, 198, 13);
    g.fillText(`Belly ${Math.ceil(leader.belly)}`, 268, 13);
    g.fillStyle = '#ffe060';
    g.fillText(`${SY.state.money}P`, 340, 13);
    if (S.weather) { g.fillStyle = '#a0d0ff'; g.fillText(S.weather.toUpperCase(), 400, 13); }
  }

  function drawMinimap(g, W) {
    const fl = S.fl;
    const sc = 2.4;
    const mw = fl.W * sc, mh = fl.H * sc;
    const ox = W - mw - 6, oy = 24;
    g.fillStyle = 'rgba(8,10,30,0.55)'; g.fillRect(ox - 2, oy - 2, mw + 4, mh + 4);
    for (let y = 0; y < fl.H; y++) for (let x = 0; x < fl.W; x++) {
      if (!S.seen[y][x]) continue;
      const t = fl.map[y][x];
      if (t === G.WALL) continue;
      g.fillStyle = t === G.WATER ? 'rgba(60,120,220,0.8)' : 'rgba(150,160,220,0.55)';
      g.fillRect(ox + x * sc, oy + y * sc, sc, sc);
    }
    if (fl.stairs.x >= 0 && S.seen[fl.stairs.y][fl.stairs.x]) {
      g.fillStyle = '#fff'; g.fillRect(ox + fl.stairs.x * sc - 1, oy + fl.stairs.y * sc - 1, sc + 2, sc + 2);
    }
    for (const it of S.groundItems) if (S.seen[it.y][it.x]) { g.fillStyle = '#60c0ff'; g.fillRect(ox + it.x * sc, oy + it.y * sc, sc, sc); }
    for (const e of S.entities.filter(e => e.mon.hp > 0)) {
      const vis = S.seen[e.y][e.x];
      if (e.kind === 'ally') g.fillStyle = '#ffe060';
      else if (e.kind === 'npc') g.fillStyle = '#60ff90';
      else if (vis) g.fillStyle = '#ff5050'; else continue;
      g.fillRect(ox + e.x * sc - 0.5, oy + e.y * sc - 0.5, sc + 1, sc + 1);
    }
  }

  function drawLog(g, W, H) {
    if (S.logTimer > 0) S.logTimer--;
    if (!S.log.length || (S.logTimer <= 0 && !S.menu)) return;
    const lines = S.log.slice(-3);
    const h = 16 * lines.length + 14;
    pmdFrame(g, 4, H - h - 4, W - 8 - 120, h);
    g.font = '11px monospace'; g.fillStyle = '#fff';
    lines.forEach((l, i) => g.fillText(l.slice(0, 58), 14, H - h + 8 + i * 16));
  }

  function drawMenu(g, W, H) {
    const m = S.menu;
    g.font = '12px monospace';
    if (m.type === 'stairs') {
      pmdFrame(g, W / 2 - 90, H / 2 - 30, 180, 60);
      g.fillStyle = '#fff';
      g.fillText(S.floor >= S.def.floors ? 'Leave the dungeon?' : 'Go to the next floor?', W / 2 - 75, H / 2 - 8);
      g.fillStyle = '#ffe060';
      g.fillText('(A) Yes    (B) Not yet', W / 2 - 75, H / 2 + 14);
      return;
    }
    if (m.type === 'main') {
      const items = ['Moves', 'Bag', 'Team', 'Ground', 'Wait', 'Escape'];
      pmdFrame(g, 8, 24, 110, items.length * 18 + 14);
      items.forEach((it, i) => {
        g.fillStyle = i === m.sel ? '#ffe060' : '#fff';
        g.fillText((i === m.sel ? '>' : ' ') + it, 16, 44 + i * 18);
      });
    } else if (m.type === 'moves') {
      const leader = S.team[0];
      pmdFrame(g, 8, 24, 240, leader.moves.length * 18 + 14);
      leader.moves.forEach((ms, i) => {
        const mv = D().moves[ms.id];
        g.fillStyle = i === m.sel ? '#ffe060' : '#fff';
        g.fillText(`${i === m.sel ? '>' : ' '}${mv.n}`, 16, 44 + i * 18);
        g.fillStyle = '#a0c0ff';
        g.fillText(`${ms.pp}/${ms.maxpp}`, 190, 44 + i * 18);
      });
    } else if (m.type === 'bag') {
      const bag = SY.state.bag;
      pmdFrame(g, 8, 24, 250, Math.max(1, bag.length) * 16 + 16);
      if (!bag.length) { g.fillStyle = '#fff'; g.fillText('Your bag is empty.', 16, 44); }
      bag.forEach((s, i) => {
        g.fillStyle = i === m.sel ? '#ffe060' : '#fff';
        g.fillText(`${i === m.sel ? '>' : ' '}${IT.name(s.id)}${s.n > 1 ? ' x' + s.n : ''}`, 16, 42 + i * 16);
      });
    } else if (m.type === 'team') {
      pmdFrame(g, 8, 24, 250, S.team.length * 18 + 14);
      S.team.forEach((mn, i) => {
        g.fillStyle = i === m.sel ? '#ffe060' : '#fff';
        g.fillText(`${i === m.sel ? '>' : ' '}${mn.name} Lv${mn.level}`, 16, 44 + i * 18);
        g.fillStyle = '#a0c0ff'; g.fillText(`${mn.hp}/${mn.maxhp}`, 190, 44 + i * 18);
      });
    } else if (m.type === 'teaminfo') {
      const mn = S.team[m.sel];
      pmdFrame(g, 8, 24, 280, 150);
      const p = EOL.sprites.portraitDrawable(mn.slug);
      if (p) g.drawImage(p, 16, 34, 40, 40);
      g.fillStyle = '#ffe060'; g.fillText(`${mn.name}  Lv${mn.level}`, 64, 46);
      g.fillStyle = '#fff';
      g.fillText(`${mn.types.join('/')}  HP ${mn.hp}/${mn.maxhp}`, 64, 62);
      g.fillText(`Atk ${mn.atk} Def ${mn.def}`, 64, 78);
      g.fillText(`SpA ${mn.spa} SpD ${mn.spd} Spe ${mn.spe}`, 64, 94);
      g.fillStyle = '#a0c0ff';
      mn.moves.forEach((ms, i) => g.fillText(D().moves[ms.id].n, 16, 112 + i * 14));
    }
  }
})();
