#!/usr/bin/env node
// Generates compact game data files for PMD: Explorers of Legends from PokeAPI CSV dumps
// and the PMDCollab SpriteCollab tracker.
//
// Usage: node tools/generate_data.mjs <csv_dir> [tracker.json path]
// Emits: game/data/data_*.js  (classic scripts populating the EOL.DATA namespace so the
// game runs from file:// without a server, fetch, or module loader)
//
// Data sources (fetched separately, NOT committed):
//   https://github.com/PokeAPI/pokeapi  data/v2/csv/*  (BSD-3)
//   https://github.com/PMDCollab/SpriteCollab tracker.json
//
// Scope: every default species through National Dex #1025 (includes all paradox Pokemon)
// plus Mega / Primal / regional (Alola, Galar, Hisui, Paldea) / Origin forms.
// The "3 new starters" of the upcoming generation are not present in the Gen 1-9 dataset,
// so their exclusion is automatically satisfied.

import fs from 'node:fs';
import path from 'node:path';

const csvDir = process.argv[2];
const trackerPath = process.argv[3];
if (!csvDir) { console.error('usage: generate_data.mjs <csv_dir> [tracker.json]'); process.exit(1); }
const outDir = path.join(path.dirname(new URL(import.meta.url).pathname), '..', 'game', 'data');
fs.mkdirSync(outDir, { recursive: true });

function readCsv(name) {
  const text = fs.readFileSync(path.join(csvDir, name), 'utf8');
  const lines = text.split('\n').filter(l => l.length);
  const header = lines[0].split(',');
  return lines.slice(1).map(l => {
    const cells = l.split(',');
    const row = {};
    header.forEach((h, i) => row[h] = cells[i]);
    return row;
  });
}

const MAX_DEX = 1025;
const STAT_KEYS = { 1: 'hp', 2: 'at', 3: 'df', 4: 'sa', 5: 'sd', 6: 'sp' };
const TYPE_NAMES = {};
for (const t of readCsv('types.csv')) if (+t.id <= 18) TYPE_NAMES[t.id] = t.identifier;

// ---------- species / forms selection ----------
const speciesRows = Object.fromEntries(readCsv('pokemon_species.csv').map(r => [r.id, r]));
const pokemonRows = readCsv('pokemon.csv');
const FORM_PATTERNS = [
  [/-mega-x$/, 'mega-x'], [/-mega-y$/, 'mega-y'], [/-mega$/, 'mega'], [/-primal$/, 'primal'],
  [/-alola$/, 'alola'], [/-galar$/, 'galar'], [/-hisui$/, 'hisui'],
  [/-paldea-combat-breed$/, 'paldea'], [/-paldea-blaze-breed$/, 'paldea2'], [/-paldea-aqua-breed$/, 'paldea3'],
  [/-origin$/, 'origin'],
];

const picked = []; // {row, form}
for (const p of pokemonRows) {
  const sid = +p.species_id;
  if (sid > MAX_DEX) continue;
  if (p.is_default === '1') { picked.push({ row: p, form: null }); continue; }
  for (const [re, form] of FORM_PATTERNS) {
    if (re.test(p.identifier)) { picked.push({ row: p, form }); break; }
  }
}

// stats and types indexed by pokemon id
const statsBy = {}, typesBy = {};
for (const s of readCsv('pokemon_stats.csv')) {
  (statsBy[s.pokemon_id] = statsBy[s.pokemon_id] || {})[STAT_KEYS[s.stat_id]] = +s.base_stat;
}
for (const t of readCsv('pokemon_types.csv')) {
  (typesBy[t.pokemon_id] = typesBy[t.pokemon_id] || [])[+t.slot - 1] = TYPE_NAMES[t.type_id];
}

// ---------- naming ----------
const NAME_FIX = {
  'nidoran-f': 'Nidoran♀', 'nidoran-m': 'Nidoran♂', 'farfetchd': "Farfetch'd", 'sirfetchd': "Sirfetch'd",
  'mr-mime': 'Mr. Mime', 'mime-jr': 'Mime Jr.', 'mr-rime': 'Mr. Rime', 'ho-oh': 'Ho-Oh',
  'porygon-z': 'Porygon-Z', 'type-null': 'Type: Null', 'jangmo-o': 'Jangmo-o', 'hakamo-o': 'Hakamo-o',
  'kommo-o': 'Kommo-o', 'tapu-koko': 'Tapu Koko', 'tapu-lele': 'Tapu Lele', 'tapu-bulu': 'Tapu Bulu',
  'tapu-fini': 'Tapu Fini', 'flabebe': 'Flabébé', 'great-tusk': 'Great Tusk', 'scream-tail': 'Scream Tail',
  'brute-bonnet': 'Brute Bonnet', 'flutter-mane': 'Flutter Mane', 'slither-wing': 'Slither Wing',
  'sandy-shocks': 'Sandy Shocks', 'iron-treads': 'Iron Treads', 'iron-bundle': 'Iron Bundle',
  'iron-hands': 'Iron Hands', 'iron-jugulis': 'Iron Jugulis', 'iron-moth': 'Iron Moth',
  'iron-thorns': 'Iron Thorns', 'roaring-moon': 'Roaring Moon', 'iron-valiant': 'Iron Valiant',
  'walking-wake': 'Walking Wake', 'iron-leaves': 'Iron Leaves', 'gouging-fire': 'Gouging Fire',
  'raging-bolt': 'Raging Bolt', 'iron-boulder': 'Iron Boulder', 'iron-crown': 'Iron Crown',
  'wo-chien': 'Wo-Chien', 'chien-pao': 'Chien-Pao', 'ting-lu': 'Ting-Lu', 'chi-yu': 'Chi-Yu',
};
function titleCase(slug) {
  if (NAME_FIX[slug]) return NAME_FIX[slug];
  return slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('-')
    .replace(/-(Oh|Z)$/, m => m); // keep hyphens by default for unknown compounds
}
function baseName(identifier) {
  // species identifier -> display name (single-word species keep simple title case)
  if (NAME_FIX[identifier]) return NAME_FIX[identifier];
  if (!identifier.includes('-')) return identifier.charAt(0).toUpperCase() + identifier.slice(1);
  return titleCase(identifier);
}
function formName(base, form) {
  switch (form) {
    case 'mega': return `Mega ${base}`;
    case 'mega-x': return `Mega ${base} X`;
    case 'mega-y': return `Mega ${base} Y`;
    case 'primal': return `Primal ${base}`;
    case 'alola': return `Alolan ${base}`;
    case 'galar': return `Galarian ${base}`;
    case 'hisui': return `Hisuian ${base}`;
    case 'paldea': return `Paldean ${base}`;
    case 'paldea2': return `Paldean ${base} (Blaze)`;
    case 'paldea3': return `Paldean ${base} (Aqua)`;
    case 'origin': return `${base} (Origin)`;
    default: return base;
  }
}

// ---------- SpriteCollab form paths ----------
let tracker = null;
if (trackerPath && fs.existsSync(trackerPath)) tracker = JSON.parse(fs.readFileSync(trackerPath, 'utf8'));
const FORM_TRACKER_NAMES = {
  'mega': ['Mega'], 'mega-x': ['Mega_X'], 'mega-y': ['Mega_Y'], 'primal': ['Primal'],
  'alola': ['Alola', 'Alolan'], 'galar': ['Galar', 'Galarian'], 'hisui': ['Hisui', 'Hisuian'],
  'paldea': ['Paldea', 'Combat_Breed', 'Paldean'], 'paldea2': ['Blaze_Breed'], 'paldea3': ['Aqua_Breed'],
  'origin': ['Origin'],
};
function spritePath(dex, form) {
  const key = String(dex).padStart(4, '0');
  if (!form || !tracker || !tracker[key]) return null; // base path is derived from dex in-game
  const subs = tracker[key].subgroups || {};
  const want = FORM_TRACKER_NAMES[form] || [];
  for (const [sub, info] of Object.entries(subs)) {
    if (want.some(w => (info.name || '').toLowerCase() === w.toLowerCase())) {
      return `${key}/${sub}`;
    }
  }
  return null;
}

// ---------- evolutions ----------
const evoRows = readCsv('pokemon_evolution.csv');
const evoBySpecies = {}; // evolved_species_id -> row (prefer is_default)
for (const e of evoRows) {
  if (!evoBySpecies[e.evolved_species_id] || e.is_default === '1') evoBySpecies[e.evolved_species_id] = e;
}
function evoRequirement(sid) {
  const e = evoBySpecies[sid];
  if (!e) return { lv: 30 };
  if (e.minimum_level) return { lv: +e.minimum_level };
  if (e.minimum_happiness) return { lv: 20, m: 'bond' };
  if (e.trigger_item_id || e.held_item_id) return { lv: 30, m: 'item' };
  if (e.evolution_trigger_id === '2') return { lv: 36, m: 'link' }; // trade -> Luminous Spring link
  return { lv: 30 };
}

// ---------- build pokedex ----------
const dex = {};
const byPokemonId = {};
for (const { row, form } of picked) {
  const sp = speciesRows[row.species_id];
  const slug = row.identifier;
  const bn = baseName(sp.identifier);
  const st = statsBy[row.id] || {};
  const entry = {
    id: +row.id,
    num: +row.species_id,
    name: form ? formName(bn, form) : bn,
    types: typesBy[row.id] || ['normal'],
    bs: { hp: st.hp || 50, at: st.at || 50, df: st.df || 50, sa: st.sa || 50, sd: st.sd || 50, sp: st.sp || 50 },
    gen: +sp.generation_id,
    gr: +sp.growth_rate_id,
    cr: +sp.capture_rate,
    leg: sp.is_legendary === '1' ? 1 : (sp.is_mythical === '1' ? 2 : 0),
  };
  if (form) {
    entry.form = form;
    entry.base = sp.identifier;
    const spr = spritePath(entry.num, form);
    if (spr) entry.spr = spr;
  } else {
    if (sp.evolves_from_species_id) {
      const preSp = speciesRows[sp.evolves_from_species_id];
      if (preSp && +sp.evolves_from_species_id <= MAX_DEX) {
        entry.pre = preSp.identifier;
        Object.assign(entry, { evoReq: evoRequirement(row.species_id) });
      }
    }
  }
  dex[slug] = entry;
  byPokemonId[row.id] = slug;
}
// forward evolution links
for (const [slug, e] of Object.entries(dex)) {
  if (e.pre && dex[e.pre]) {
    (dex[e.pre].evo = dex[e.pre].evo || []).push({ to: slug, lv: e.evoReq.lv, m: e.evoReq.m });
  }
}
for (const e of Object.values(dex)) delete e.evoReq;

// ---------- learnsets ----------
// pick, per pokemon, the newest version_group that has level-up rows
const learnRaw = {}; // pokemon_id -> vg -> [[lv, move]]
{
  const text = fs.readFileSync(path.join(csvDir, 'pokemon_moves.csv'), 'utf8');
  const lines = text.split('\n');
  for (let i = 1; i < lines.length; i++) {
    const l = lines[i]; if (!l) continue;
    const c = l.split(',');
    if (c[3] !== '1') continue; // level-up only
    const pid = c[0];
    if (!byPokemonId[pid]) continue;
    ((learnRaw[pid] = learnRaw[pid] || {})[+c[1]] = learnRaw[pid][+c[1]] || []).push([+c[4], +c[2]]);
  }
}
const learnsets = {};
const usedMoves = new Set();
for (const [pid, slug] of Object.entries(byPokemonId)) {
  let vgs = learnRaw[pid];
  if (!vgs && dex[slug].base) { // form without own learnset -> base species default pokemon
    const basePid = dex[dex[slug].base] && dex[dex[slug].base].id;
    vgs = learnRaw[basePid];
  }
  if (!vgs) continue;
  const newest = Math.max(...Object.keys(vgs).map(Number));
  const rows = vgs[newest].sort((a, b) => a[0] - b[0]);
  const seen = new Set(); const out = [];
  for (const [lv, mv] of rows) {
    if (seen.has(mv)) continue; seen.add(mv);
    out.push([lv, mv]); usedMoves.add(mv);
  }
  learnsets[slug] = out;
}

// ---------- moves ----------
// PMD-style ranges: front(melee, 1 tile incl. corner-cut), line(projectile up to 10 tiles),
// room(all enemies in room), around(all adjacent), self, allies(team in room)
const LINE_MOVES = new Set(['ice-beam','hyper-beam','solar-beam','flamethrower','water-gun','hydro-pump','thunderbolt','psybeam','bubble-beam','aurora-beam','charge-beam','signal-beam','flash-cannon','dragon-pulse','dark-pulse','water-pulse','ember','razor-leaf','dragon-breath','sludge-bomb','shadow-ball','energy-ball','focus-blast','aura-sphere','thunder-shock','acid','mud-shot','rock-throw','spit-up','swift','tri-attack','hyper-voice','moonblast','dazzling-gleam','power-gem','stone-edge','seed-bomb','pin-missile','ice-shard','aqua-jet','mud-bomb','octazooka','zap-cannon','fire-blast','psyshock','scald','flame-burst','electro-ball','volt-switch','snipe-shot','pyro-ball','appletun? no','drum-beating','fishious-rend? no']);
LINE_MOVES.delete('appletun? no'); LINE_MOVES.delete('fishious-rend? no');
const ROOM_MOVES = new Set(['earthquake','discharge','surf','blizzard','heat-wave','lava-plume','petal-blizzard','boomburst','hurricane','thunder','powder-snow','icy-wind','silver-wind','ominous-wind','razor-wind','air-cutter','disarming-voice','round','echoed-voice','relic-song','sparkling-aria','origin-pulse','precipice-blades','dragon-energy','eruption','water-spout','self-destruct','explosion','magnitude','bulldoze','rock-slide','muddy-water','snarl','struggle-bug','electroweb','clanging-scales','core-enforcer','land-wrath? no']);
ROOM_MOVES.delete('land-wrath? no');
const moveRows = readCsv('moves.csv');
const targets = Object.fromEntries(readCsv('move_targets.csv').map(r => [r.id, r.identifier]));
const moves = {};
for (const m of moveRows) {
  const id = +m.id;
  if (!usedMoves.has(id) && m.identifier !== 'struggle') continue;
  if (id >= 10000) continue; // shadow moves
  const cat = m.damage_class_id === '1' ? 0 : (m.damage_class_id === '2' ? 1 : 2); // 0 status 1 phys 2 spec
  const tgt = targets[m.target_id] || 'selected-pokemon';
  let range;
  if (LINE_MOVES.has(m.identifier)) range = 'line';
  else if (ROOM_MOVES.has(m.identifier)) range = 'room';
  else if (tgt === 'user' || tgt === 'users-field') range = 'self';
  else if (tgt === 'ally' || tgt === 'user-or-ally' || tgt === 'user-and-allies' || tgt === 'all-allies') range = 'allies';
  else if (tgt === 'all-other-pokemon' || tgt === 'all-opponents' || tgt === 'entire-field' || tgt === 'all-pokemon' || tgt === 'opponents-field') range = cat === 0 ? 'room' : 'around';
  else range = 'front';
  moves[id] = {
    n: baseName(m.identifier).replace(/-/g, ' '),
    t: TYPE_NAMES[m.type_id] || 'normal',
    c: cat,
    p: m.power ? +m.power : 0,
    a: m.accuracy ? +m.accuracy : 0, // 0 = never misses
    pp: m.pp ? +m.pp : 10,
    r: range,
  };
  if (+m.priority) moves[id].pri = +m.priority;
  if (m.effect_chance) moves[id].ec = +m.effect_chance;
  moves[id].fx = +m.effect_id || 1;
}

// ---------- type chart ----------
const TYPE_ORDER = ['normal','fighting','flying','poison','ground','rock','bug','ghost','steel','fire','water','grass','electric','psychic','ice','dragon','dark','fairy'];
const tIdx = Object.fromEntries(TYPE_ORDER.map((t, i) => [t, i]));
const chart = TYPE_ORDER.map(() => TYPE_ORDER.map(() => 1));
for (const r of readCsv('type_efficacy.csv')) {
  const a = TYPE_NAMES[r.damage_type_id], d = TYPE_NAMES[r.target_type_id];
  if (a in tIdx && d in tIdx) chart[tIdx[a]][tIdx[d]] = +r.damage_factor / 100;
}

// ---------- experience tables ----------
const expT = {};
for (const r of readCsv('experience.csv')) {
  (expT[r.growth_rate_id] = expT[r.growth_rate_id] || [])[+r.level - 1] = +r.experience;
}

// ---------- emit ----------
function emit(file, prop, obj) {
  const js = `// Generated by tools/generate_data.mjs - do not edit by hand.\nwindow.EOL=window.EOL||{};EOL.DATA=EOL.DATA||{};\nEOL.DATA.${prop}=${JSON.stringify(obj)};\n`;
  fs.writeFileSync(path.join(outDir, file), js);
  console.log(`${file}: ${(js.length / 1024).toFixed(0)} KB, ${Object.keys(obj).length} entries`);
}
emit('data_pokedex.js', 'pokedex', dex);
emit('data_learnsets.js', 'learnsets', learnsets);
emit('data_moves.js', 'moves', moves);
emit('data_typechart.js', 'typechart', { order: TYPE_ORDER, chart });
emit('data_exp.js', 'exp', expT);
console.log(`total species+forms: ${Object.keys(dex).length}`);
