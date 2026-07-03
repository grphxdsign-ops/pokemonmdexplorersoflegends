// Explorers of Legends progression systems, per docs/03_PROGRESSION_SYSTEMS.md:
// Renown types, hidden skill ranks (qualitative feedback only), attribute points
// (equal cost for every stat/species), partner moral drift, story flags, save/load.
window.EOL = window.EOL || {};
(function () {
  const SY = EOL.systems = {};

  SY.RENOWN_TYPES = ['heroic', 'scholar', 'diplomat', 'explorer', 'social', 'outlaw', 'legend'];
  SY.SKILLS = {
    exploration: ['Pathfinding', 'Foraging', 'Mining', 'Survival', 'Climbing', 'Fishing'],
    crafting: ['Cooking', 'Smithing', 'Alchemy', 'Inscription', 'Carpentry'],
    social: ['Charisma', 'Diplomacy', 'Insight', 'Intimidation', 'Performance', 'Lore'],
    combat: ['Tactics', 'First Aid', 'Trapcraft', 'Beast Handling'],
  };
  SY.RANKS = ['Novice', 'Apprentice', 'Adept', 'Expert', 'Master', 'Grandmaster'];
  SY.RANK_XP = [0, 40, 120, 300, 650, 1200]; // hidden xp thresholds

  SY.newState = function () {
    const skills = {};
    for (const cat of Object.values(SY.SKILLS)) for (const s of cat) skills[s] = 0;
    return {
      version: 1,
      chapter: 0,          // story progression index
      flags: {},           // arbitrary story flags
      renown: Object.fromEntries(SY.RENOWN_TYPES.map(r => [r, 0])),
      domainRenown: {},    // per-domain renown
      skills,              // hidden xp per skill
      skillRankSeen: {},   // last rank announced per skill
      moral: 50,           // partner moral stability 0-100 (never shown as a number)
      apPool: 0,           // unspent attribute points (shared pool, spent per mon)
      money: 300,
      bank: 0,
      bag: [{ id: 'oran-berry', n: 2 }, { id: 'apple', n: 2 }],
      storage: {},
      team: [],            // serialized mons (active team, first = player, second = partner)
      reserves: [],        // recruited mons at base
      recruits: 0,
      dungeonClears: {},
      titles: [],
      endingSeen: null,
      postgame: false,
      megaUnlocked: false,
      dexSeen: {},
      playTurns: 0,
    };
  };

  SY.state = SY.newState();

  // ---- renown ----
  SY.addRenown = function (type, amount, domain) {
    const st = SY.state;
    st.renown[type] = (st.renown[type] || 0) + amount;
    if (domain) st.domainRenown[domain] = (st.domainRenown[domain] || 0) + amount;
    return `Your team's ${EOL.util.cap(type)} Renown grows.`;
  };
  SY.renownTotal = function () {
    const r = SY.state.renown;
    return Object.entries(r).reduce((a, [k, v]) => a + (k === 'outlaw' ? 0 : v), 0);
  };
  SY.teamTitle = function () {
    const t = SY.renownTotal();
    if (t >= 400) return 'Keepers of the Unwritten';
    if (t >= 250) return 'Stormbreakers';
    if (t >= 140) return 'Wardens of the Wilds';
    if (t >= 60) return 'Lanterns of the Lost';
    return 'Rookie Team';
  };

  // ---- hidden skills: qualitative messages only ----
  SY.rankOf = function (skill) {
    const xp = SY.state.skills[skill] || 0;
    let r = 0;
    for (let i = 0; i < SY.RANK_XP.length; i++) if (xp >= SY.RANK_XP[i]) r = i;
    return r;
  };
  SY.gainSkill = function (skill, xp) {
    const st = SY.state;
    if (!(skill in st.skills)) return null;
    const before = SY.rankOf(skill);
    st.skills[skill] += xp;
    const after = SY.rankOf(skill);
    if (after > before) {
      st.skillRankSeen[skill] = after;
      const msgs = [
        `Your team feels more confident at ${skill}.`,
        `Your team's ${skill} has clearly improved.`,
        `Your team has become ${SY.RANKS[after]} at ${skill}.`,
        `Few can match your team's ${skill} now.`,
        `Your team's ${skill} approaches mastery.`,
        `Your team's ${skill} is the stuff of legends.`,
      ];
      return msgs[Math.min(after, msgs.length - 1)];
    }
    return null;
  };

  // ---- attribute points (equal cost for all stats and species - canon lock) ----
  SY.AP_COST = 1;
  SY.spendAP = function (mon, stat) {
    const st = SY.state;
    if (st.apPool < SY.AP_COST) return false;
    st.apPool -= SY.AP_COST;
    mon.ap[stat] = (mon.ap[stat] || 0) + 1;
    mon.recalc();
    return true;
  };

  // ---- partner moral drift ----
  SY.moralShift = function (delta) {
    SY.state.moral = EOL.util.clamp(SY.state.moral + delta, 0, 100);
  };
  SY.moralBand = function () {
    const m = SY.state.moral;
    return m >= 70 ? 'steady' : m >= 40 ? 'wavering' : 'desperate';
  };

  // ---- flags ----
  SY.flag = (k, v) => { if (v === undefined) return SY.state.flags[k]; SY.state.flags[k] = v; return v; };

  // ---- save / load ----
  const KEY = 'eol-save-v1';
  SY.save = function (team) {
    if (team) SY.state.team = team.map(m => m.serialize());
    try {
      localStorage.setItem(KEY, JSON.stringify(SY.state));
      return true;
    } catch (e) { return false; }
  };
  SY.load = function () {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return false;
      const data = JSON.parse(raw);
      SY.state = Object.assign(SY.newState(), data);
      return true;
    } catch (e) { return false; }
  };
  SY.hasSave = function () { try { return !!localStorage.getItem(KEY); } catch (e) { return false; } };
  SY.wipe = function () { try { localStorage.removeItem(KEY); } catch (e) { } SY.state = SY.newState(); };
  SY.exportSave = function () { return btoa(unescape(encodeURIComponent(JSON.stringify(SY.state)))); };
  SY.importSave = function (str) {
    try {
      SY.state = Object.assign(SY.newState(), JSON.parse(decodeURIComponent(escape(atob(str)))));
      SY.save();
      return true;
    } catch (e) { return false; }
  };

  // ---- bag helpers ----
  SY.BAG_MAX = 24;
  SY.addItem = function (id, n) {
    const st = SY.state;
    n = n || 1;
    if (id === 'poke') { st.money += 50 + Math.floor(Math.random() * 120); return true; }
    const def = EOL.items.DEFS[id];
    const existing = st.bag.find(s => s.id === id && def.stack);
    if (existing) { existing.n += n; return true; }
    if (st.bag.length >= SY.BAG_MAX) return false;
    st.bag.push({ id, n });
    return true;
  };
  SY.removeItem = function (idx) {
    const s = SY.state.bag[idx];
    if (!s) return null;
    s.n--;
    if (s.n <= 0) SY.state.bag.splice(idx, 1);
    return s.id;
  };

  // ---- ending computation (docs/03 branching inputs) ----
  SY.computeEnding = function () {
    const st = SY.state;
    const r = st.renown;
    const moral = st.moral;
    const apexMercy = !!st.flags.apexMercy;
    const trustedDusknoir = !!st.flags.trustedDusknoir;
    const alliances = Object.values(st.domainRenown).filter(v => v >= 20).length;
    if (moral >= 70 && r.legend >= 60 && alliances >= 5) return 'new-accord';
    if (moral >= 70 && r.social >= 40 && r.legend < 60) return 'peoples-legend';
    if (apexMercy && moral >= 50) return 'apex-redemption';
    if (r.outlaw > r.heroic) return 'hollow-legend';
    if (r.legend >= 80) return 'crowned-legend';
    return 'forgotten-hero';
  };
})();
