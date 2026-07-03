// PMD-style procedural floor generation: a grid of cells, some become rooms,
// connected by corridors (spanning tree + extra links), like the classic games.
window.EOL = window.EOL || {};
(function () {
  const U = EOL.util;
  const G = EOL.dungeonGen = {};
  G.WALL = 0; G.FLOOR = 1; G.CORRIDOR = 2; G.WATER = 3;

  G.generate = function (opts) {
    const rng = U.rng(opts.seed);
    const W = opts.w || 54, H = opts.h || 34;
    const gx = opts.gx || 4, gy = opts.gy || 3;
    const map = Array.from({ length: H }, () => new Array(W).fill(G.WALL));
    const roomId = Array.from({ length: H }, () => new Array(W).fill(-1));
    const cw = Math.floor(W / gx), ch = Math.floor(H / gy);
    const cells = [];
    for (let cy = 0; cy < gy; cy++) for (let cx = 0; cx < gx; cx++) {
      const isRoom = rng() < (opts.roomChance || 0.75) || (cx === 0 && cy === 0);
      cells.push({ cx, cy, isRoom, cxpx: cx * cw, cypx: cy * ch });
    }
    // ensure at least 4 rooms
    while (cells.filter(c => c.isRoom).length < 4) U.pick(rng, cells.filter(c => !c.isRoom)).isRoom = true;

    const rooms = [];
    for (const c of cells) {
      if (c.isRoom) {
        const rw = 4 + U.ri(rng, Math.max(2, cw - 6));
        const rh = 3 + U.ri(rng, Math.max(2, ch - 5));
        const rx = c.cxpx + 1 + U.ri(rng, Math.max(1, cw - rw - 2));
        const ry = c.cypx + 1 + U.ri(rng, Math.max(1, ch - rh - 2));
        const id = rooms.length;
        rooms.push({ x: rx, y: ry, w: rw, h: rh, id });
        for (let y = ry; y < ry + rh; y++) for (let x = rx; x < rx + rw; x++) {
          if (y > 0 && y < H - 1 && x > 0 && x < W - 1) { map[y][x] = G.FLOOR; roomId[y][x] = id; }
        }
        c.room = rooms[id];
        c.px = rx + U.ri(rng, rw); c.py = ry + U.ri(rng, rh);
      } else {
        c.px = c.cxpx + 2 + U.ri(rng, Math.max(1, cw - 4));
        c.py = c.cypx + 2 + U.ri(rng, Math.max(1, ch - 4));
        c.px = U.clamp(c.px, 1, W - 2); c.py = U.clamp(c.py, 1, H - 2);
        map[c.py][c.px] = G.CORRIDOR;
      }
    }

    function corridor(x1, y1, x2, y2) {
      // L-shaped dig
      let x = x1, y = y1;
      const horizFirst = rng() < 0.5;
      function dig(px, py) { if (py > 0 && py < H - 1 && px > 0 && px < W - 1 && map[py][px] === G.WALL) map[py][px] = G.CORRIDOR; }
      if (horizFirst) {
        while (x !== x2) { x += Math.sign(x2 - x); dig(x, y); }
        while (y !== y2) { y += Math.sign(y2 - y); dig(x, y); }
      } else {
        while (y !== y2) { y += Math.sign(y2 - y); dig(x, y); }
        while (x !== x2) { x += Math.sign(x2 - x); dig(x, y); }
      }
    }
    const at = (cx, cy) => cells[cy * gx + cx];
    // spanning connections across grid
    const connected = new Set([0]);
    const edges = [];
    for (let cy = 0; cy < gy; cy++) for (let cx = 0; cx < gx; cx++) {
      if (cx + 1 < gx) edges.push([cy * gx + cx, cy * gx + cx + 1]);
      if (cy + 1 < gy) edges.push([cy * gx + cx, (cy + 1) * gx + cx]);
    }
    const shuffled = U.shuffle(rng, edges);
    let added = true;
    while (added) {
      added = false;
      for (const [a, b] of shuffled) {
        if (connected.has(a) !== connected.has(b)) {
          corridor(cells[a].px, cells[a].py, cells[b].px, cells[b].py);
          connected.add(a); connected.add(b); added = true;
        }
      }
    }
    // extra loops
    for (const [a, b] of shuffled) {
      if (rng() < (opts.extraCorridors || 0.18)) corridor(cells[a].px, cells[a].py, cells[b].px, cells[b].py);
    }
    // water pools in some biomes
    if (opts.water) {
      for (const r of rooms) {
        if (rng() < 0.3 && r.w >= 5 && r.h >= 4) {
          const px = r.x + 1 + U.ri(rng, r.w - 3), py = r.y + 1 + U.ri(rng, r.h - 3);
          for (let y = py; y < Math.min(py + 2, r.y + r.h - 1); y++)
            for (let x = px; x < Math.min(px + 3, r.x + r.w - 1); x++) map[y][x] = G.WATER;
        }
      }
    }

    // positions
    function freeTileInRoom(room) {
      for (let tries = 0; tries < 60; tries++) {
        const x = room.x + U.ri(rng, room.w), y = room.y + U.ri(rng, room.h);
        if (map[y][x] === G.FLOOR) return { x, y };
      }
      return { x: room.x, y: room.y };
    }
    const startRoom = U.pick(rng, rooms);
    let stairRoom = U.pick(rng, rooms);
    if (rooms.length > 1) while (stairRoom === startRoom) stairRoom = U.pick(rng, rooms);
    const start = freeTileInRoom(startRoom);
    const stairs = freeTileInRoom(stairRoom);

    // item + trap spots
    const items = [], traps = [];
    const nItems = 2 + U.ri(rng, 4), nTraps = opts.noTraps ? 0 : 1 + U.ri(rng, 3);
    for (let i = 0; i < nItems; i++) { const p = freeTileInRoom(U.pick(rng, rooms)); items.push(p); }
    for (let i = 0; i < nTraps; i++) { const p = freeTileInRoom(U.pick(rng, rooms)); traps.push(p); }

    // monster house?
    let monsterHouse = null;
    if (opts.monsterHouseChance && rng() < opts.monsterHouseChance) {
      const cand = rooms.filter(r => r !== startRoom);
      if (cand.length) monsterHouse = U.pick(rng, cand).id;
    }

    return { map, roomId, rooms, W, H, start, stairs, items, traps, monsterHouse, rng, freeTileInRoom };
  };
})();
