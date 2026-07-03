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
    // ================= PROLOGUE =================
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

    // ================= DOMAIN ARCS (main campaign) =================
    // ---- Seed Domain: Lilligant's trial ----
    'verdant-heart': {
      id: 'verdant-heart', name: 'Verdant Heartwood', floors: 7,
      domain: 'seed', lvlBase: 7, lvlStep: 1, tier: 'early',
      biome: { ground: '#4a7a3a', ground2: '#427236', wall: '#2a4a22', wallTop: '#3a6030', water: true },
      pool: ['oddish', 'bellsprout', 'shroomish', 'seedot', 'lotad', 'budew', 'cherubi', 'petilil', 'foongus'],
      bossFloor: 7,
      boss: { slug: 'lilligant', level: 14, hpMult: 2.0, intro: 'Lilligant, the Seed Living Legend, awaits... "Show me how a small sprout means to reach the sun."' },
      seed: 103,
    },
    // ---- Storm Domain: Luxray's trial ----
    'stormcall-crags': {
      id: 'stormcall-crags', name: 'Stormcall Crags', floors: 7,
      domain: 'storm', lvlBase: 9, lvlStep: 1.1, tier: 'early',
      biome: { ground: '#4a5568', ground2: '#424e60', wall: '#232b3a', wallTop: '#364256', corridor: '#3a4454', water: false },
      pool: ['shinx', 'electrike', 'mareep', 'magnemite', 'blitzle', 'joltik', 'helioptile', 'dedenne', 'yamper', 'pachirisu'],
      weather: 'rain', bossFloor: 7,
      boss: { slug: 'luxray', level: 17, hpMult: 2.0, intro: 'Golden eyes flash through the thunder. Luxray, the Storm Living Legend, sees straight through you. "Lightning never hesitates. Do you?"' },
      seed: 104,
    },
    // ---- Dream Domain: Musharna's trial ----
    'drowsemist-meadow': {
      id: 'drowsemist-meadow', name: 'Drowsemist Meadow', floors: 7,
      domain: 'dream', lvlBase: 11, lvlStep: 1.1, tier: 'early',
      biome: { ground: '#6a5a7a', ground2: '#615270', wall: '#372a48', wallTop: '#4c3c60', water: false },
      pool: ['drowzee', 'jigglypuff', 'natu', 'spoink', 'munna', 'woobat', 'gothita', 'swirlix', 'hatenna'],
      bossFloor: 7,
      boss: { slug: 'musharna', level: 19, hpMult: 2.0, intro: 'Pink mist curls into a slow spiral. Musharna, the Dream Living Legend, drifts awake. "I have seen you both in a thousand sleepers\' dreams... let us see if you are worth dreaming about."' },
      seed: 105,
    },
    // ---- Land Domain: Torterra's trial ----
    'deeploam-warrens': {
      id: 'deeploam-warrens', name: 'Deeploam Warrens', floors: 8,
      domain: 'land', lvlBase: 13, lvlStep: 1.1, tier: 'mid',
      biome: { ground: '#7a5c3a', ground2: '#6f5334', wall: '#3d2c1a', wallTop: '#544020', corridor: '#665033', water: false },
      pool: ['sandshrew', 'diglett', 'cubone', 'phanpy', 'trapinch', 'hippopotas', 'drilbur', 'mudbray', 'silicobra', 'rhyhorn'],
      weather: 'sandstorm', bossFloor: 8,
      boss: { slug: 'torterra', level: 22, hpMult: 2.0, intro: 'The chamber floor is a living garden on a mountain\'s back. Torterra, the Land Living Legend, opens one ancient eye. "The land remembers every footstep. Make yours worth remembering."' },
      seed: 106,
    },
    // ---- Sky Domain: Corviknight's trial ----
    'skyreach-pillars': {
      id: 'skyreach-pillars', name: 'Skyreach Pillars', floors: 8,
      domain: 'sky', lvlBase: 15, lvlStep: 1.1, tier: 'mid', ascending: true,
      biome: { ground: '#5a7a9a', ground2: '#527090', wall: '#2a3a52', wallTop: '#3c5270', water: false },
      pool: ['pidgeotto', 'staravia', 'tranquill', 'fletchinder', 'swablu', 'skarmory', 'rufflet', 'vullaby', 'rookidee', 'noibat'],
      bossFloor: 8,
      boss: { slug: 'corviknight', level: 24, hpMult: 2.0, intro: 'Black steel wings blot out the clouds. Corviknight, the Sky Living Legend, lands without a sound. "You climbed well. Now show me you deserve the wind."' },
      seed: 107,
    },
    // ---- Sea Domain: Milotic's trial ----
    'pearlwake-grotto': {
      id: 'pearlwake-grotto', name: 'Pearlwake Grotto', floors: 8,
      domain: 'sea', lvlBase: 17, lvlStep: 1.1, tier: 'mid',
      biome: { ground: '#3a6a72', ground2: '#346068', wall: '#183038', wallTop: '#26444c', water: true },
      pool: ['tentacool', 'horsea', 'chinchou', 'corsola', 'wingull', 'wailmer', 'feebas', 'finneon', 'frillish-male', 'clauncher', 'mantyke'],
      bossFloor: 8,
      boss: { slug: 'milotic', level: 26, hpMult: 2.0, intro: 'The tide pool glows pearl-bright. Milotic, the Sea Living Legend, rises in a slow coil of light. "The sea is gentle and merciless in the same breath. Which are you?"' },
      seed: 108,
    },
    // ---- Sun Domain: the Sun Court's trial (Arcanine watches; Pyroar presides) ----
    'kindled-court': {
      id: 'kindled-court', name: 'Kindled Court', floors: 9,
      domain: 'sun', lvlBase: 19, lvlStep: 1.1, tier: 'mid',
      biome: { ground: '#9a6a3a', ground2: '#8e6034', wall: '#502a14', wallTop: '#6e4020', water: false },
      pool: ['growlithe', 'vulpix', 'charmeleon', 'sunflora', 'torkoal', 'darumaka', 'litleo', 'heliolisk', 'larvesta'],
      weather: 'sun', bossFloor: 9,
      boss: { slug: 'pyroar-male', level: 28, hpMult: 2.0, intro: 'Pyroar, herald of the Sun Court, bars the sunlit dais. "Lord Arcanine speaks highly of you. Prove his praise was not wasted breath!"' },
      seed: 109,
    },
    // ---- Moon Domain: Umbreon's trial ----
    'palemoon-hollow': {
      id: 'palemoon-hollow', name: 'Palemoon Hollow', floors: 9,
      domain: 'moon', lvlBase: 21, lvlStep: 1.1, tier: 'mid',
      biome: { ground: '#5a5a72', ground2: '#525268', wall: '#26263a', wallTop: '#3a3a52', water: false },
      pool: ['clefairy', 'noctowl', 'murkrow', 'lunatone', 'sableye', 'gothorita', 'minior-red-meteor', 'morgrem'],
      bossFloor: 9,
      boss: { slug: 'umbreon', level: 30, hpMult: 2.0, intro: 'Golden rings glow in the dark like patient moons. Umbreon, the Moon Living Legend, speaks softly. "The moon shines only by reflecting another\'s light. Whose light do you carry?"' },
      seed: 110,
    },
    // ---- Frozen Domain: Froslass's trial ----
    'whitehush-glacier': {
      id: 'whitehush-glacier', name: 'Whitehush Glacier', floors: 9,
      domain: 'frozen', lvlBase: 23, lvlStep: 1.1, tier: 'mid',
      biome: { ground: '#7a9ab2', ground2: '#7090a8', wall: '#324a62', wallTop: '#48628a', water: false },
      pool: ['snorunt', 'sneasel', 'delibird', 'snover', 'vanillish', 'cubchoo', 'cryogonal', 'bergmite', 'snom', 'glalie'],
      weather: 'hail', bossFloor: 9,
      boss: { slug: 'froslass', level: 31, hpMult: 2.0, intro: 'The blizzard parts around a still white figure. Froslass, the Frozen Living Legend, bows. "Warm hearts freeze fastest here. Keep yours burning, if you can."' },
      seed: 111,
    },
    // ---- Life Domain: Blissey's trial ----
    'everbloom-vale': {
      id: 'everbloom-vale', name: 'Everbloom Vale', floors: 8,
      domain: 'life', lvlBase: 24, lvlStep: 1.1, tier: 'mid',
      biome: { ground: '#4a8a5a', ground2: '#428050', wall: '#1f4a2c', wallTop: '#2f6a3e', water: true },
      pool: ['chansey', 'miltank', 'audino', 'cherrim', 'flabebe', 'spritzee', 'bounsweet', 'fomantis', 'comfey', 'munchlax'],
      bossFloor: 8,
      boss: { slug: 'blissey', level: 32, hpMult: 2.0, intro: 'Blissey, the Life Living Legend, smiles - and the whole vale seems to breathe easier. "Now, dears, this trial will hurt me more than it hurts you. Probably."' },
      seed: 112,
    },
    // ---- Space Domain: Orbeetle's trial ----
    'farshine-observatory': {
      id: 'farshine-observatory', name: 'Farshine Observatory', floors: 10,
      domain: 'space', lvlBase: 26, lvlStep: 1.0, tier: 'mid',
      biome: { ground: '#4a3a6a', ground2: '#423460', wall: '#1c1432', wallTop: '#2e2248', corridor: '#382c54', water: false },
      pool: ['staryu', 'porygon', 'baltoy', 'solrock', 'elgyem', 'beheeyem', 'metang', 'claydol'],
      bossFloor: 10,
      boss: { slug: 'orbeetle', level: 33, hpMult: 2.0, intro: 'A vast mind unfolds around you like a starfield. Orbeetle, the Space Living Legend, hovers in silence. "Distance is an illusion. Fear is not. Begin."' },
      seed: 113,
    },
    // ---- Time Domain: Bronzong's trial ----
    'rustchime-ruins': {
      id: 'rustchime-ruins', name: 'Rustchime Ruins', floors: 10,
      domain: 'time', lvlBase: 27, lvlStep: 1.0, tier: 'mid',
      biome: { ground: '#6a6a4a', ground2: '#606042', wall: '#32321f', wallTop: '#4a4a2e', water: false },
      pool: ['bronzor', 'unown', 'xatu', 'sigilyph', 'yamask', 'golett', 'klink', 'klang'],
      bossFloor: 10,
      boss: { slug: 'bronzong', level: 34, hpMult: 2.0, intro: 'A single bell-tone rolls through the ruins and does not fade. Bronzong, the Time Living Legend, tolls. "EVERY. MOMENT. COUNTS. THIS ONE. IS YOURS."' },
      seed: 114,
    },

    // ================= ACT 5: VOID INVESTIGATION & APEX =================
    'rift-of-whispers': {
      id: 'rift-of-whispers', name: 'Rift of Whispers', floors: 9,
      domain: 'void', lvlBase: 27, lvlStep: 1.0, tier: 'mid',
      biome: { ground: '#4a4252', ground2: '#423a4a', wall: '#1e1a24', wallTop: '#302a38', corridor: '#3a3444', water: false },
      pool: ['gastly', 'haunter', 'duskull', 'shuppet', 'litwick', 'drifloon', 'phantump', 'pumpkaboo-average', 'dusclops', 'lampent'],
      bossFloor: 9, monsterHouseChance: 0.08,
      boss: { slug: 'spiritomb', level: 33, hpMult: 1.8, intro: 'A hundred and eight voices whisper at once from a cracked keystone. Spiritomb seethes. "Void this... Void that... you want the TRUTH about the disasters? Then survive it."' },
      seed: 115,
    },
    'shattered-shrine': {
      id: 'shattered-shrine', name: 'Shattered Shrine', floors: 8,
      domain: null, lvlBase: 28, lvlStep: 1.0, tier: 'mid', noRecruit: true,
      biome: { ground: '#6a5a5a', ground2: '#605050', wall: '#302424', wallTop: '#453434', water: false },
      pool: ['pawniard', 'scraggy', 'scrafty', 'golbat', 'skorupi', 'seviper', 'stunky', 'skuntank', 'liepard', 'krokorok'],
      bossFloor: 8, monsterHouseChance: 0.12,
      boss: {
        slug: 'bisharp', level: 30, hpMult: 1.8,
        allies: [{ slug: 'sneasler', level: 29 }, { slug: 'drapion', level: 29 }],
        intro: 'Team Apex stands atop the broken altar. Bisharp\'s blades catch the light. "Still playing by the rules? The world only remembers who reached the top - not how. Get out of our way."',
      },
      seed: 116,
    },

    // ================= CLIMAX: TOWER OF LEGENDS =================
    'tower-of-legends': {
      id: 'tower-of-legends', name: 'Tower of Legends', floors: 18,
      domain: null, lvlBase: 30, lvlStep: 0.35, tier: 'late', ascending: true, noRecruit: true,
      biome: { ground: '#8a8272', ground2: '#7e7668', wall: '#3e3626', wallTop: '#5a5038', corridor: '#6e6656', water: false },
      pool: ['manectric', 'hypno', 'krookodile', 'braviary', 'lanturn', 'magmortar', 'absol', 'clefable', 'mismagius', 'honchkrow', 'golurk', 'banette'],
      bossFloor: 18, monsterHouseChance: 0.08,
      boss: {
        slug: 'zoroark', level: 36, hpMult: 2.2,
        allies: [{ slug: 'arcanine', level: 36 }, { slug: 'houndoom', level: 36 }],
        intro: '"Dusknoir" turns - and ripples like heat-haze. The illusion falls away, and Zoroark grins in the summit wind. "Surprised? You chased a shadow all the way up here." Arcanine steps from the light, Houndoom from the dark. "The age of borrowed mantles ends tonight."',
      },
      seed: 117,
    },

    // ================= POSTGAME =================
    // ---- The grand pilgrimage: First Legends of every age ----
    'hall-of-first-legends': {
      id: 'hall-of-first-legends', name: 'Hall of First Legends', floors: 30,
      domain: null, lvlBase: 52, lvlStep: 0.6, tier: 'late', postgame: true, ascending: true,
      biome: { ground: '#9a9482', ground2: '#8e8878', wall: '#4a4230', wallTop: '#665c42', corridor: '#7e7662', water: false },
      pool: ['mew', 'celebi', 'jirachi', 'shaymin-land', 'latias', 'latios', 'victini', 'manaphy', 'uxie', 'mesprit', 'azelf', 'raikou', 'entei', 'suicune'],
      bossFloor: 30,
      boss: { slug: 'arceus', level: 70, hpMult: 3.0, intro: 'At the heart of the Hall, the First of all Firsts waits. Arceus regards you with a thousand ages of patience. "You who rose from nothing... show me the shape of your legend."' },
      seed: 201,
    },
    // ---- Paradox: the deep past ----
    'ancient-rift': {
      id: 'ancient-rift', name: 'Ancient Rift', floors: 16,
      domain: 'time', lvlBase: 50, lvlStep: 0.9, tier: 'late', postgame: true,
      biome: { ground: '#8a4a2a', ground2: '#7e4226', wall: '#421c0e', wallTop: '#5e2c16', corridor: '#6e3a1e', water: false },
      pool: ['great-tusk', 'scream-tail', 'brute-bonnet', 'flutter-mane', 'slither-wing', 'sandy-shocks', 'roaring-moon', 'walking-wake', 'gouging-fire', 'raging-bolt'],
      bossFloor: 16,
      boss: { slug: 'koraidon', level: 65, hpMult: 2.0, intro: 'A roar older than any written history splits the rift. Koraidon crouches, primal and burning with joy at the challenge.' },
      seed: 202,
    },
    // ---- Paradox: the far future ----
    'neon-horizon': {
      id: 'neon-horizon', name: 'Neon Horizon', floors: 16,
      domain: 'time', lvlBase: 50, lvlStep: 0.9, tier: 'late', postgame: true,
      biome: { ground: '#3a4a5a', ground2: '#344252', wall: '#141c28', wallTop: '#22303e', corridor: '#2a3a4a', water: false },
      pool: ['iron-treads', 'iron-bundle', 'iron-hands', 'iron-jugulis', 'iron-moth', 'iron-thorns', 'iron-valiant', 'iron-leaves', 'iron-boulder', 'iron-crown'],
      bossFloor: 16, monsterHouseChance: 0.1,
      boss: { slug: 'miraidon', level: 65, hpMult: 2.0, intro: 'The horizon hums with impossible light. Miraidon uncoils, engine-heart crackling. QUERY: ARE YOU THE STRONGEST OF THIS ERA? TESTING NOW.' },
      seed: 203,
    },
    // ---- Mega resonance cavern ----
    'cavern-of-awakening': {
      id: 'cavern-of-awakening', name: 'Cavern of Awakening', floors: 14,
      domain: null, lvlBase: 48, lvlStep: 0.8, tier: 'late', postgame: true,
      biome: { ground: '#5a4a7a', ground2: '#524270', wall: '#241a3a', wallTop: '#382a52', corridor: '#463662', water: false },
      pool: ['lucario', 'gardevoir', 'mawile', 'aggron', 'medicham', 'gyarados', 'aerodactyl', 'altaria', 'heracross', 'pinsir', 'salamence', 'metagross'],
      monsterHouseChance: 0.1,
      seed: 204,
    },
    // ---- Postgame domain trials: face the First Legends themselves ----
    'temporal-spire': {
      id: 'temporal-spire', name: 'Temporal Spire', floors: 12,
      domain: 'time', lvlBase: 55, lvlStep: 1.0, tier: 'late', postgame: true, ascending: true,
      biome: { ground: '#4a5a6a', ground2: '#425260', wall: '#1c2630', wallTop: '#2e3c4a', water: false },
      pool: ['bronzong', 'claydol', 'golurk', 'porygon-z', 'xatu', 'unown'],
      bossFloor: 12,
      boss: { slug: 'dialga', level: 67, hpMult: 2.0, intro: 'The spire\'s summit exists in every moment at once. Dialga\'s cry bends the seconds around you. The First Legend of Time accepts your challenge.' },
      seed: 205,
    },
    'spatial-verge': {
      id: 'spatial-verge', name: 'Spatial Verge', floors: 12,
      domain: 'space', lvlBase: 55, lvlStep: 1.0, tier: 'late', postgame: true,
      biome: { ground: '#6a4a6a', ground2: '#604260', wall: '#2c1a2c', wallTop: '#422a42', water: false },
      pool: ['beheeyem', 'starmie', 'lunatone', 'solrock', 'metagross', 'clefable', 'deoxys-normal'],
      bossFloor: 12,
      boss: { slug: 'palkia', level: 67, hpMult: 2.0, intro: 'Distance folds like paper. Palkia steps out of a place that was never there. The First Legend of Space measures you across every dimension.' },
      seed: 206,
    },
    'distortion-depths': {
      id: 'distortion-depths', name: 'Distortion Depths', floors: 12,
      domain: 'void', lvlBase: 56, lvlStep: 1.0, tier: 'late', postgame: true,
      biome: { ground: '#4a4a42', ground2: '#424239', wall: '#1a1a14', wallTop: '#2c2c22', corridor: '#38382e', water: false },
      pool: ['mismagius', 'dusclops', 'chandelure', 'trevenant', 'gourgeist-average', 'jellicent-male', 'spiritomb', 'drifblim'],
      bossFloor: 12,
      boss: { slug: 'giratina-origin', level: 68, hpMult: 2.2, intro: 'The world turns inside out. In its Origin Forme, Giratina coils through the reversed sky - not in anger, but in solemn judgment of those who once freed it.' },
      seed: 207,
    },
    'dread-hollow': {
      id: 'dread-hollow', name: 'Dread Hollow', floors: 11,
      domain: 'death', lvlBase: 54, lvlStep: 1.0, tier: 'late', postgame: true,
      biome: { ground: '#5a3a3a', ground2: '#523434', wall: '#241212', wallTop: '#381e1e', water: false },
      pool: ['absol', 'honchkrow', 'mandibuzz', 'hydreigon', 'weavile', 'drapion', 'houndoom'],
      bossFloor: 11,
      boss: { slug: 'yveltal', level: 66, hpMult: 2.0, intro: 'Great wings the color of last light unfurl over the hollow. Yveltal, First Legend of Death, remembers your mercy at the Tower - and tests whether it was strength.' },
      seed: 208,
    },
    'nightmare-verge': {
      id: 'nightmare-verge', name: 'Nightmare Verge', floors: 11,
      domain: 'nightmare', lvlBase: 54, lvlStep: 1.0, tier: 'late', postgame: true,
      biome: { ground: '#3a2a4a', ground2: '#342542', wall: '#140e1e', wallTop: '#221730', water: false },
      pool: ['gengar', 'hypno', 'gothitelle', 'malamar', 'grimmsnarl', 'hatterene', 'banette'],
      bossFloor: 11,
      boss: { slug: 'darkrai', level: 65, hpMult: 2.0, intro: 'The dark between dreams gathers into a single silhouette. Darkrai\'s voice arrives without sound. "You freed me from a summons I never chose. Now face what I am when I choose."' },
      seed: 209,
    },
    'trial-of-storms': {
      id: 'trial-of-storms', name: 'Trial of Storms', floors: 10,
      domain: 'storm', lvlBase: 45, lvlStep: 1.0, tier: 'late', postgame: true,
      biome: { ground: '#6a6a52', ground2: '#60604a', wall: '#2a2a1c', wallTop: '#42422c', water: false },
      pool: ['raichu', 'ampharos', 'manectric', 'magnezone', 'electivire', 'galvantula', 'eelektross', 'zebstrika', 'thundurus-incarnate'],
      weather: 'rain', bossFloor: 10,
      boss: { slug: 'zapdos', level: 55, hpMult: 1.8, intro: 'Thunder answers thunder. Zapdos, a First Legend of the Storm, dives from the anvil-cloud with a shriek of pure voltage.' },
      seed: 210,
    },
    'garden-of-life': {
      id: 'garden-of-life', name: 'Garden of Life', floors: 10,
      domain: 'life', lvlBase: 48, lvlStep: 1.0, tier: 'late', postgame: true,
      biome: { ground: '#3a7a4a', ground2: '#347042', wall: '#143a1e', wallTop: '#22552e', water: true },
      pool: ['florges', 'comfey', 'audino', 'whimsicott', 'tsareena', 'meganium', 'miltank'],
      bossFloor: 10,
      boss: { slug: 'xerneas', level: 60, hpMult: 2.0, intro: 'Every flower in the garden turns toward the antlered light. Xerneas, who once gave you back your life, lowers its head gently. "What was given must also be tested."' },
      seed: 211,
    },
    'sunlit-throne': {
      id: 'sunlit-throne', name: 'Sunlit Throne', floors: 11,
      domain: 'sun', lvlBase: 50, lvlStep: 1.0, tier: 'late', postgame: true, ascending: true,
      biome: { ground: '#a2803a', ground2: '#967634', wall: '#523c14', wallTop: '#705420', water: false },
      pool: ['pyroar-male', 'rapidash', 'ninetales', 'volcarona', 'talonflame', 'cherrim', 'espeon'],
      weather: 'sun', bossFloor: 11,
      boss: { slug: 'solgaleo', level: 62, hpMult: 2.0, intro: 'The empty throne of the Sun blazes - and is empty no longer. Solgaleo, the beast that devours the sun, stands where Arcanine once pretended to. "Let the Sun Domain be led honestly again. Prove you know what honest strength is."' },
      seed: 212,
    },
    'moonlit-abyss': {
      id: 'moonlit-abyss', name: 'Moonlit Abyss', floors: 11,
      domain: 'moon', lvlBase: 50, lvlStep: 1.0, tier: 'late', postgame: true,
      biome: { ground: '#3a4262', ground2: '#343c58', wall: '#12162a', wallTop: '#20263e', water: false },
      pool: ['clefable', 'lunatone', 'noctowl', 'mismagius', 'sableye', 'minior-red-meteor', 'ribombee'],
      bossFloor: 11,
      boss: { slug: 'lunala', level: 62, hpMult: 2.0, intro: 'The abyss is not dark - it is full of moons. Lunala spreads wings of woven night. "Little dreamers who walked so far... the Moone shall embrace you, and weigh you."' },
      seed: 213,
    },
    'frozen-crown': {
      id: 'frozen-crown', name: 'Frozen Crown', floors: 12,
      domain: 'frozen', lvlBase: 52, lvlStep: 1.0, tier: 'late', postgame: true,
      biome: { ground: '#6a8aa2', ground2: '#608096', wall: '#28425a', wallTop: '#3a5a7a', water: false },
      pool: ['beartic', 'weavile', 'vanilluxe', 'avalugg', 'frosmoth', 'aurorus', 'mamoswine', 'articuno'],
      weather: 'hail', bossFloor: 12,
      boss: { slug: 'kyurem', level: 63, hpMult: 2.0, intro: 'The cold here is older than winter. Kyurem, the hollow First Legend of the Frozen, regards you with empty patience. It is hungry for something fire cannot give.' },
      seed: 214,
    },
    'deep-blue-shrine': {
      id: 'deep-blue-shrine', name: 'Deep Blue Shrine', floors: 12,
      domain: 'sea', lvlBase: 52, lvlStep: 1.0, tier: 'late', postgame: true,
      biome: { ground: '#2a4a6a', ground2: '#264260', wall: '#0e1e30', wallTop: '#1a3048', water: true },
      pool: ['gyarados', 'wailord', 'tentacruel', 'kingdra', 'lapras', 'wishiwashi-solo', 'dhelmise', 'mantine'],
      weather: 'rain', bossFloor: 12,
      boss: { slug: 'kyogre', level: 64, hpMult: 2.0, intro: 'The shrine floods in a single heartbeat. Kyogre, First Legend of the Sea, surfaces beneath a rain that has waited ten thousand years to fall.' },
      seed: 215,
    },
    'worldroot': {
      id: 'worldroot', name: 'Worldroot', floors: 12,
      domain: 'land', lvlBase: 53, lvlStep: 1.0, tier: 'late', postgame: true,
      biome: { ground: '#6a4a2a', ground2: '#604226', wall: '#2c1c0e', wallTop: '#422c16', corridor: '#553b20', water: false },
      pool: ['hippowdon', 'excadrill', 'flygon', 'rhyperior', 'garchomp', 'steelix', 'donphan', 'mudsdale', 'sandaconda', 'landorus-incarnate'],
      bossFloor: 12,
      boss: { slug: 'groudon', level: 64, hpMult: 2.2, intro: 'At the root of every mountain, the ground itself stands up. Groudon, First Legend of the Land, splits the dark with magma light. The continent is watching.' },
      seed: 216,
    },
  };

  // Wild pool helper for future domains
  C.domainPools = {};
})();
