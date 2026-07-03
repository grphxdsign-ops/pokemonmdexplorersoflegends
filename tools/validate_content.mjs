#!/usr/bin/env node
// Validates game content files: parses all game JS in a browser-like sandbox and
// checks that every dungeon/story reference points at real data.
// Usage: node tools/validate_content.mjs
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const root = path.join(path.dirname(new URL(import.meta.url).pathname), '..', 'game');
const sandbox = {
  window: {}, console,
  document: { createElement: () => ({ getContext: () => new Proxy({}, { get: () => () => { } }), width: 0, height: 0 }), getElementById: () => null },
  navigator: {}, localStorage: { getItem: () => null, setItem: () => { }, removeItem: () => { } },
  Image: function () { return { addEventListener() { } }; },
  DOMParser: function () { return { parseFromString: () => ({ querySelectorAll: () => [] }) }; },
  fetch: () => Promise.reject(new Error('offline')),
  requestAnimationFrame: () => { }, addEventListener: () => { }, setInterval: () => { }, setTimeout: () => { }, prompt: () => null, btoa: s => s, atob: s => s,
};
sandbox.window = sandbox;
sandbox.globalThis = sandbox;
vm.createContext(sandbox);

const files = [
  'data/data_typechart.js', 'data/data_exp.js', 'data/data_moves.js', 'data/data_pokedex.js', 'data/data_learnsets.js',
  'js/00_util.js', 'js/01_sprites.js', 'js/02_pokemon.js', 'js/03_dungeon_gen.js', 'js/04_battle.js',
  'js/05_items.js', 'js/06_systems.js', 'js/07_dungeon.js', 'js/08_ground.js', 'js/09_story.js',
  'js/10_input.js', 'js/12_content_dungeons.js', 'js/13_content_story.js',
];
for (const f of files) {
  try {
    vm.runInContext(fs.readFileSync(path.join(root, f), 'utf8'), sandbox, { filename: f });
  } catch (e) {
    console.error(`PARSE/RUN ERROR in ${f}: ${e.message}`);
    process.exit(1);
  }
}

const EOL = sandbox.EOL || sandbox.window.EOL;
const dex = EOL.DATA.pokedex, items = EOL.items.DEFS, C = EOL.CONTENT;
let errs = 0;
const err = m => { console.error('ERROR: ' + m); errs++; };

// dungeons
for (const [id, d] of Object.entries(C.dungeons)) {
  if (d.id !== id) err(`dungeon ${id}: id mismatch`);
  if (!d.name || !d.floors) err(`dungeon ${id}: missing name/floors`);
  for (const p of d.pool || []) {
    const slug = typeof p === 'string' ? p : p.slug;
    if (!dex[slug]) err(`dungeon ${id}: unknown pool slug '${slug}'`);
  }
  if (d.boss && !dex[d.boss.slug]) err(`dungeon ${id}: unknown boss slug '${d.boss.slug}'`);
  for (const a of (d.boss && d.boss.allies) || []) if (!dex[a.slug]) err(`dungeon ${id}: unknown boss ally '${a.slug}'`);
  if (d.bossFloor && d.bossFloor > d.floors) err(`dungeon ${id}: bossFloor > floors`);
}

// story ops walker
const RTYPES = new Set(EOL.systems.RENOWN_TYPES);
const SKILLS = new Set(Object.values(EOL.systems.SKILLS).flat());
function checkOps(ops, where) {
  if (!Array.isArray(ops)) return err(`${where}: ops not an array`);
  for (const op of ops) {
    if (!op || !op.t) { err(`${where}: bad op ${JSON.stringify(op)}`); continue; }
    if (op.t === 'say' && op.who && !['player', 'partner'].includes(op.who) && !dex[op.who] && /^[a-z0-9-]+$/.test(op.who))
      err(`${where}: say.who '${op.who}' looks like a slug but is not in pokedex`);
    if (op.t === 'renown' && !RTYPES.has(op.type)) err(`${where}: bad renown type '${op.type}'`);
    if (op.t === 'skill' && !SKILLS.has(op.name)) err(`${where}: bad skill '${op.name}'`);
    if (op.t === 'give' && op.item !== 'poke' && !items[op.item]) err(`${where}: unknown item '${op.item}'`);
    if (op.t === 'choice') for (const o of op.opts || []) { if (o.effects) checkOps(o.effects, where + '/choice'); if (o.then) checkOps(o.then, where + '/choice'); }
    if (op.t === 'if') { if (op.then) checkOps(op.then, where + '/if'); if (op.else) checkOps(op.else, where + '/else'); }
  }
}
for (const ch of C.chapters) {
  if (!ch.id || !ch.title) err(`chapter missing id/title`);
  checkOps(ch.intro || [], `chapter ${ch.id}.intro`);
  checkOps(ch.outro || [], `chapter ${ch.id}.outro`);
  if (ch.dungeon && !C.dungeons[ch.dungeon]) err(`chapter ${ch.id}: unknown dungeon '${ch.dungeon}'`);
}
for (const [k, ops] of Object.entries(C.endings)) checkOps(ops, `ending ${k}`);
if (C.quiz) {
  for (const n of C.quiz.natures) if (!dex[n.starter]) err(`quiz nature starter '${n.starter}' unknown`);
  for (const s of C.partnerPool) if (!dex[s]) err(`partnerPool '${s}' unknown`);
}
// town npcs (function - call once)
try { const npcs = C.townNPCs(); for (const n of npcs) if (!dex[n.slug]) err(`townNPC slug '${n.slug}' unknown`); } catch (e) { err('townNPCs() threw: ' + e.message); }

console.log(errs ? `${errs} error(s).` : `OK: ${Object.keys(C.dungeons).length} dungeons, ${C.chapters.length} chapters, ${Object.keys(C.endings).length} endings validated.`);
process.exit(errs ? 1 : 0);
