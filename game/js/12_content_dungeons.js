// CONTENT: dungeon definitions + spawn pools for every domain, plus postgame.
//
// Dungeon def schema:
// {
//   id, name, floors,
//   domain: 'seed'|'storm'|... (for domain renown),
//   lvlBase, lvlStep,          // enemy level = lvlBase + (floor-1)*lvlStep
//   tier: 'early'|'mid'|'late' (loot table),
//   biome: { ground:'#hex', ground2:'#hex', wall:'#hex', wallTop:'#hex', corridor:'#hex', water:bool },
//   pool: ['slug', ...] or [{slug, w}, ...],   // wild spawn pool
//   weather: null|'rain'|'sun'|'hail'|'sandstorm',
//   bossFloor: N, boss: { slug, level, hpMult, allies:[{slug,level}], intro:'...' },
//   monsterHouseChance, noTraps, noRecruit, ascending: bool (labels F instead of BF),
//   windTurns, seed, postgame: bool
// }
window.EOL = window.EOL || {};
EOL.CONTENT = EOL.CONTENT || {};
(function () {
  const C = EOL.CONTENT;

  C.dungeons = {
    // ---- Prologue ----
    'sunrise-hollow': {
      id: 'sunrise-hollow', name: 'Sunrise Hollow', floors: 4,
      domain: null, lvlBase: 2, lvlStep: 0.7, tier: 'early',
      biome: { ground: '#9a8a5a', ground2: '#8e7e50', wall: '#5a4a35', wallTop: '#7a6748', water: false },
      pool: ['sunkern', 'caterpie', 'wurmple', 'pidgey', 'rattata', 'oddish', 'spearow'],
      seed: 101,
    },
    'ember-scar': {
      id: 'ember-scar', name: 'Ember Scar', floors: 5,
      domain: 'sun', lvlBase: 4, lvlStep: 0.8, tier: 'early',
      biome: { ground: '#8a4a3a', ground2: '#7e4234', wall: '#4a2018', wallTop: '#6a3428', water: false },
      pool: ['slugma', 'numel', 'growlithe', 'torkoal', 'fletchling', 'litleo'],
      weather: 'sun', seed: 102,
    },
    // ---- Domain arcs (placeholder trio until full content pass) ----
    'verdant-heart': {
      id: 'verdant-heart', name: 'Verdant Heartwood', floors: 7,
      domain: 'seed', lvlBase: 7, lvlStep: 1, tier: 'early',
      biome: { ground: '#4a7a3a', ground2: '#427236', wall: '#2a4a22', wallTop: '#3a6030', water: true },
      pool: ['oddish', 'bellsprout', 'shroomish', 'seedot', 'lotad', 'budew', 'cherubi', 'petilil', 'foongus'],
      bossFloor: 7, boss: { slug: 'lilligant', level: 14, hpMult: 2.0, intro: 'Lilligant, the Seed Living Legend, awaits...' },
      seed: 103,
    },
  };

  // Wild pool helper for future domains
  C.domainPools = {};
})();
