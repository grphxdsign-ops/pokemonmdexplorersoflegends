// Ground mode: Mythfall Town hub - walkable overworld, facilities, NPCs.
window.EOL = window.EOL || {};
(function () {
  const U = EOL.util, SY = EOL.systems, IT = EOL.items;
  const GR = EOL.Ground = {};
  const TILE = 24;

  // Town layout (ASCII): # wall/cliff, . grass, , path, ~ water, T tree,
  // letters = facility doors: G guild, S shop, W workshop(training), A archive,
  // L luminous spring, C caravan post, R rescue board, M memorial stone, K kitchen
  const LAYOUT = [
    '##############################',
    '#TT..T....~~~....T....T..TT..#',
    '#T....&&&.~~~..&&&..........T#',
    '#..T..&G&,,,,,,&A&....&&&..T.#',
    '#.....&&&,....,&&&....&K&....#',
    '#T.....,,,....,,,,,...&&&...T#',
    '#...&&&,......,...,....,.....#',
    '#...&S&,..&&&.,...&&&..,..T..#',
    '#...&&&,..&R&.,...&W&..,.....#',
    '#T...,,,..&&&.,...&&&..,,,,..#',
    '#.....,....,,.,....,......,..#',
    '#..T..,....,..,....,..##..,.T#',
    '#.....,,,,,,..,,,,,,..#M...,.#',
    '#T......,.........,...##....,#',
    '#...&&&.,.....~~..,.........,#',
    '#...&C&.,....~~~~.,....&&&..,#',
    '#...&&&.,,,,.~~L~.,,,,,&B&.,,#',
    '#T.......,...~~~~........,...#',
    '#TT...T...T...........T...TT.#',
    '##############################',
  ];
  const FACILITIES = {
    G: { id: 'guild', name: 'Guild Hall' },
    S: { id: 'shop', name: 'Kecleon Shop' },
    W: { id: 'training', name: 'Training Yard' },
    A: { id: 'archive', name: 'Archive' },
    L: { id: 'spring', name: 'Luminous Spring' },
    C: { id: 'caravan', name: 'Caravan Post' },
    R: { id: 'board', name: 'Rescue Board' },
    M: { id: 'memorial', name: 'Memorial Stone' },
    K: { id: 'kitchen', name: 'Kitchen' },
    B: { id: 'bank', name: 'Duskull Bank' },
  };

  let S = null;
  GR.active = () => !!S;

  GR.start = function (opts) {
    opts = opts || {};
    S = {
      x: opts.x || 8, y: opts.y || 12, dir: 0,
      animClock: 0, moving: 0,
      npcs: (EOL.CONTENT && EOL.CONTENT.townNPCs) ? EOL.CONTENT.townNPCs() : [],
      onFacility: opts.onFacility,
      banner: opts.banner || null, bannerT: 180,
    };
  };
  GR.stop = () => { S = null; };

  const tileAt = (x, y) => (LAYOUT[y] ? LAYOUT[y][x] : '#') || '#';
  function walkableT(x, y) {
    const t = tileAt(x, y);
    return t === '.' || t === ',' || (FACILITIES[t] !== undefined);
  }

  GR.input = function (action, data) {
    if (!S) return;
    if (action === 'move') {
      const [dx, dy] = U.DIRS[data];
      S.dir = data;
      const nx = S.x + dx, ny = S.y + dy;
      if (!walkableT(nx, ny)) return;
      if (S.npcs.some(n => n.x === nx && n.y === ny)) return;
      S.x = nx; S.y = ny; S.moving = 8;
      const t = tileAt(nx, ny);
      if (FACILITIES[t] && S.onFacility) S.onFacility(FACILITIES[t].id);
    } else if (action === 'attack' || action === 'confirm') {
      // talk to facing NPC
      const [dx, dy] = U.DIRS[S.dir];
      const npc = S.npcs.find(n => n.x === S.x + dx && n.y === S.y + dy);
      if (npc && npc.onTalk) npc.onTalk();
      else {
        const t = tileAt(S.x + dx, S.y + dy);
        if (FACILITIES[t] && S.onFacility) S.onFacility(FACILITIES[t].id);
      }
    } else if (action === 'menu') {
      if (GR.onMenu) GR.onMenu();
    }
  };

  GR.draw = function (g, W, H) {
    if (!S) return;
    S.animClock++;
    if (S.moving > 0) S.moving--;
    const camX = U.clamp(S.x * TILE - W / 2, 0, LAYOUT[0].length * TILE - W);
    const camY = U.clamp(S.y * TILE - H / 2, 0, LAYOUT.length * TILE - H);
    g.fillStyle = '#1a2a1a'; g.fillRect(0, 0, W, H);
    for (let y = 0; y < LAYOUT.length; y++) for (let x = 0; x < LAYOUT[0].length; x++) {
      const px = x * TILE - camX, py = y * TILE - camY;
      if (px < -TILE || py < -TILE || px > W || py > H) continue;
      const t = tileAt(x, y);
      if (t === '#') { g.fillStyle = '#3a4a3a'; g.fillRect(px, py, TILE, TILE); g.fillStyle = '#2a3a2a'; g.fillRect(px, py + TILE - 4, TILE, 4); }
      else if (t === 'T') {
        g.fillStyle = (x + y) % 2 ? '#4a8a3a' : '#458535'; g.fillRect(px, py, TILE, TILE);
        g.fillStyle = '#2a5a20'; g.beginPath(); g.arc(px + 12, py + 8, 9, 0, 7); g.fill();
        g.fillStyle = '#3a7a2a'; g.beginPath(); g.arc(px + 12, py + 6, 7, 0, 7); g.fill();
        g.fillStyle = '#6a4a2a'; g.fillRect(px + 10, py + 14, 4, 8);
      }
      else if (t === '~') {
        const ph = Math.sin(S.animClock / 18 + x * 0.7 + y) * 10;
        g.fillStyle = `rgb(40,${100 + ph | 0},${180 + ph | 0})`; g.fillRect(px, py, TILE, TILE);
      }
      else if (t === '&') { g.fillStyle = '#8a6a4a'; g.fillRect(px, py, TILE, TILE); g.fillStyle = '#a8845c'; g.fillRect(px + 1, py + 1, TILE - 2, 4); g.fillStyle = '#6a4a30'; g.fillRect(px, py + TILE - 3, TILE, 3); }
      else if (FACILITIES[t]) {
        g.fillStyle = '#c8a878'; g.fillRect(px, py, TILE, TILE);
        g.fillStyle = '#4a3020'; g.fillRect(px + 4, py + 6, TILE - 8, TILE - 6);
        g.fillStyle = '#ffe9a0'; g.fillRect(px + 9, py + 10, 6, 5);
      }
      else if (t === ',') { g.fillStyle = (x + y) % 2 ? '#b09a6a' : '#a8926a'; g.fillRect(px, py, TILE, TILE); }
      else { g.fillStyle = (x + y) % 2 ? '#4a8a3a' : '#458535'; g.fillRect(px, py, TILE, TILE); if ((x * 7 + y * 3) % 11 === 0) { g.fillStyle = '#5a9a4a'; g.fillRect(px + 6, py + 8, 2, 4); g.fillRect(px + 14, py + 12, 2, 4); } }
    }
    // facility labels
    for (let y = 0; y < LAYOUT.length; y++) for (let x = 0; x < LAYOUT[0].length; x++) {
      const t = tileAt(x, y);
      if (FACILITIES[t]) {
        const px = x * TILE - camX + TILE / 2, py = y * TILE - camY - 4;
        g.font = 'bold 9px monospace'; g.textAlign = 'center';
        g.fillStyle = 'rgba(0,0,0,0.6)'; g.fillRect(px - 34, py - 9, 68, 11);
        g.fillStyle = '#ffe9a0'; g.fillText(FACILITIES[t].name, px, py);
        g.textAlign = 'left';
      }
    }
    // NPCs
    for (const n of S.npcs) {
      const px = n.x * TILE - camX + TILE / 2, py = n.y * TILE - camY + TILE / 2;
      const entry = EOL.DATA.pokedex[n.slug];
      if (entry) EOL.sprites.drawMon(g, entry, px, py, n.dir || 0, S.animClock, false);
      if (n.important) { g.fillStyle = '#ffe060'; g.font = 'bold 12px monospace'; g.fillText('!', px - 2, py - 26 + Math.sin(S.animClock / 10) * 2); }
    }
    // player + partner trailing
    const team = EOL.game ? EOL.game.team : [];
    if (team[1]) {
      const [dx, dy] = U.DIRS[S.dir];
      EOL.sprites.drawMon(g, team[1].entry, S.x * TILE - camX + TILE / 2 - dx * TILE, S.y * TILE - camY + TILE / 2 - dy * TILE, S.dir, S.animClock, S.moving > 0);
    }
    if (team[0]) EOL.sprites.drawMon(g, team[0].entry, S.x * TILE - camX + TILE / 2, S.y * TILE - camY + TILE / 2, S.dir, S.animClock, S.moving > 0);

    // town banner
    if (S.bannerT > 0 && S.banner) {
      S.bannerT--;
      g.font = 'bold 14px monospace'; g.textAlign = 'center';
      g.fillStyle = 'rgba(8,10,30,0.7)'; g.fillRect(W / 2 - 120, 24, 240, 22);
      g.fillStyle = '#fff'; g.fillText(S.banner, W / 2, 40);
      g.textAlign = 'left';
    }
  };
})();
