// Item definitions - classic PMD toolkit plus Explorers of Legends domain items.
window.EOL = window.EOL || {};
(function () {
  const I = EOL.items = {};
  // kind: food, berry, seed, orb, elixir, throw, money, evo, key, mega
  I.DEFS = {
    'oran-berry': { name: 'Oran Berry', kind: 'berry', desc: 'Restores 100 HP.', color: '#4aa3ff', price: 50 },
    'sitrus-berry': { name: 'Sitrus Berry', kind: 'berry', desc: 'Fully restores HP and raises max HP a little.', color: '#ffd24a', price: 400 },
    'pecha-berry': { name: 'Pecha Berry', kind: 'berry', desc: 'Cures poison.', color: '#ff9ad5', price: 40 },
    'cheri-berry': { name: 'Cheri Berry', kind: 'berry', desc: 'Cures paralysis.', color: '#ff5a5a', price: 40 },
    'chesto-berry': { name: 'Chesto Berry', kind: 'berry', desc: 'Cures sleep.', color: '#b08cff', price: 40 },
    'rawst-berry': { name: 'Rawst Berry', kind: 'berry', desc: 'Cures burn.', color: '#7ee0a0', price: 40 },
    'apple': { name: 'Apple', kind: 'food', desc: 'Restores Belly by 50.', color: '#e04a4a', price: 60 },
    'big-apple': { name: 'Big Apple', kind: 'food', desc: 'Fully restores Belly.', color: '#c03030', price: 300 },
    'reviver-seed': { name: 'Reviver Seed', kind: 'seed', desc: 'Automatically revives the holder team member once.', color: '#ffe98a', price: 800 },
    'blast-seed': { name: 'Blast Seed', kind: 'seed', desc: 'Throw or eat to blast the Pokemon in front for heavy damage.', color: '#ff8a3a', price: 150 },
    'sleep-seed': { name: 'Sleep Seed', kind: 'seed', desc: 'Puts the Pokemon in front to sleep.', color: '#8ab4ff', price: 120 },
    'stun-seed': { name: 'Stun Seed', kind: 'seed', desc: 'Paralyzes the Pokemon in front.', color: '#ffe23a', price: 120 },
    'heal-seed': { name: 'Heal Seed', kind: 'seed', desc: 'Cures all status problems.', color: '#a0ffb0', price: 100 },
    'warp-seed': { name: 'Warp Seed', kind: 'seed', desc: 'Warps the user elsewhere on the floor.', color: '#c8a0ff', price: 100 },
    'joy-seed': { name: 'Joy Seed', kind: 'seed', desc: 'Raises level by 1.', color: '#fff0a0', price: 2000 },
    'max-elixir': { name: 'Max Elixir', kind: 'elixir', desc: 'Fully restores PP of all moves.', color: '#3ae0c8', price: 250 },
    'escape-orb': { name: 'Escape Orb', kind: 'orb', desc: 'Escape from the dungeon immediately.', color: '#8ad5ff', price: 300 },
    'luminous-orb': { name: 'Luminous Orb', kind: 'orb', desc: 'Reveals the whole floor map.', color: '#fff8c8', price: 200 },
    'petrify-orb': { name: 'Petrify Orb', kind: 'orb', desc: 'Petrifies all enemies in the room.', color: '#c8c8d8', price: 350 },
    'all-mach-orb': { name: 'All-Mach Orb', kind: 'orb', desc: 'Raises the team\'s movement speed.', color: '#a0e8ff', price: 350 },
    'foe-hold-orb': { name: 'Foe-Hold Orb', kind: 'orb', desc: 'Stops enemies in the room from moving for a while.', color: '#e8b0ff', price: 350 },
    'gravelerock': { name: 'Gravelerock', kind: 'throw', desc: 'A throwing rock. Deals fixed damage.', color: '#a89878', price: 30, stack: true },
    'geo-pebble': { name: 'Geo Pebble', kind: 'throw', desc: 'A light throwing stone.', color: '#c8b898', price: 15, stack: true },
    'poke': { name: 'Poke', kind: 'money', desc: 'The currency of the Pokemon world.', color: '#ffd700', price: 1 },
    'evolution-crystal': { name: 'Evolution Crystal', kind: 'evo', desc: 'A shard of Luminous Spring light. Lets a Pokemon evolve at the Spring.', color: '#b0fff0', price: 1500 },
    'sun-ribbon': { name: 'Sun Ribbon', kind: 'evo', desc: 'A ribbon holding warm light. Used for special evolution.', color: '#ffdf80', price: 1200 },
    'lunar-ribbon': { name: 'Lunar Ribbon', kind: 'evo', desc: 'A ribbon holding moonlight. Used for special evolution.', color: '#c0c0ff', price: 1200 },
    'empowerment-seed': { name: 'Empowerment Seed', kind: 'mega', desc: 'Awakens Mega Evolution for a capable Pokemon during this dungeon.', color: '#ff70d0', price: 5000 },
    'domain-relic': { name: 'Domain Relic', kind: 'key', desc: 'Proof of a completed domain trial. Hums with old power.', color: '#e8d8ff', price: 0 },
    'ancient-page': { name: 'Ancient Page', kind: 'key', desc: 'A page of First Legend records for the Archive.', color: '#e8dcb8', price: 200 },
    'wonder-gummi': { name: 'Wonder Gummi', kind: 'food', desc: 'A mysterious gummi that sharpens hidden skills.', color: '#7affd5', price: 600 },
    'grimy-food': { name: 'Grimy Food', kind: 'food', desc: 'Restores some Belly... but at what cost?', color: '#9a8a5a', price: 10 },
  };
  I.name = id => (I.DEFS[id] ? I.DEFS[id].name : id);

  // loot tables by dungeon tier
  I.FLOOR_LOOT = {
    early: ['oran-berry', 'oran-berry', 'apple', 'pecha-berry', 'cheri-berry', 'gravelerock', 'geo-pebble', 'blast-seed', 'heal-seed', 'poke', 'poke', 'max-elixir', 'chesto-berry'],
    mid: ['oran-berry', 'apple', 'apple', 'sitrus-berry', 'blast-seed', 'sleep-seed', 'stun-seed', 'warp-seed', 'max-elixir', 'reviver-seed', 'poke', 'poke', 'luminous-orb', 'petrify-orb', 'gravelerock', 'rawst-berry'],
    late: ['sitrus-berry', 'big-apple', 'reviver-seed', 'reviver-seed', 'max-elixir', 'joy-seed', 'blast-seed', 'petrify-orb', 'foe-hold-orb', 'all-mach-orb', 'poke', 'poke', 'wonder-gummi', 'escape-orb'],
  };

  I.TRAPS = {
    'spike-trap': { name: 'Spike Trap', color: '#c05050', fx: 'damage' },
    'poison-trap': { name: 'Poison Trap', color: '#a050c0', fx: 'psn' },
    'slumber-trap': { name: 'Slumber Trap', color: '#5080c0', fx: 'slp' },
    'warp-trap': { name: 'Warp Trap', color: '#c080ff', fx: 'warp' },
    'hunger-trap': { name: 'Hunger Trap', color: '#c0a050', fx: 'hunger' },
    'sticky-trap': { name: 'Sticky Trap', color: '#80a060', fx: 'sticky' },
    'spin-trap': { name: 'Spin Trap', color: '#e0a0e0', fx: 'cnf' },
    'boulder-trap': { name: 'Boulder Trap', color: '#a09080', fx: 'damage2' },
  };
})();
