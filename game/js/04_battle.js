// Battle mechanics: PMD-flavored damage, Speed-as-accuracy/evasion (per canon lock),
// stat stages, statuses, and move effects.
window.EOL = window.EOL || {};
(function () {
  const U = EOL.util;
  const B = EOL.battle = {};
  const D = () => EOL.DATA;

  B.newStages = () => ({ at: 0, df: 0, sa: 0, sd: 0, sp: 0, acc: 0, eva: 0 });
  const stageMult = s => s >= 0 ? (2 + s) / 2 : 2 / (2 - s);
  const accStageMult = s => s >= 0 ? (3 + s) / 3 : 3 / (3 - s);

  B.typeMult = function (moveType, defTypes) {
    const tc = D().typechart;
    const ai = tc.order.indexOf(moveType);
    if (ai < 0) return 1;
    let m = 1;
    for (const dt of defTypes) {
      const di = tc.order.indexOf(dt);
      if (di >= 0) m *= U.pmdTypeMult(tc.chart[ai][di]);
    }
    return m;
  };

  // Authentic Explorers of Sky damage formula (see docs/06_PMD_SERIES_RESEARCH.md):
  //   (A+P)*(39168/65536) - D/2 + 50*ln(10*((A-D)/8 + L + 50)) - 311
  // Mainline move powers are rescaled to PMD's small power range (P = power/7).
  B.computeDamage = function (attacker, defender, move, rng) {
    rng = rng || Math.random;
    const phys = move.c === 1;
    let A = phys ? attacker.atk : attacker.spa;
    let Dv = phys ? defender.def : defender.spd;
    A *= stageMult(phys ? attacker.stages.at : attacker.stages.sa);
    Dv *= stageMult(phys ? defender.stages.df : defender.stages.sd);
    if (attacker.status && attacker.status.id === 'brn' && phys) A *= 0.75;
    const L = attacker.level;
    const P = move.p / 7;
    const AP = A + P;
    const lnArg = Math.max(1, 10 * ((AP - Dv) / 8 + L + 50));
    let dmg = AP * (39168 / 65536) - Dv / 2 + 50 * Math.log(lnArg) - 311;
    dmg = Math.max(1, dmg);
    // STAB 1.5x, PMD type multipliers (1.4 / 0.7 / 0.5)
    if (attacker.types.includes(move.t)) dmg *= 1.5;
    const eff = B.typeMult(move.t, defender.types);
    dmg *= eff;
    const crit = rng() < 0.12;
    if (crit) dmg *= 1.5;
    dmg *= 0.89 + rng() * 0.22; // EoS damage roll ~±11%
    return { dmg: Math.max(1, Math.round(dmg)), crit, eff };
  };

  // Speed influences hit chance and evasion (Super Mystery Dungeon style, per canon lock)
  B.hitCheck = function (attacker, defender, move, rng) {
    rng = rng || Math.random;
    if (!move.a) return true; // never-miss moves
    let chance = move.a / 100;
    chance *= accStageMult(attacker.stages.acc);
    chance /= accStageMult(defender.stages.eva);
    const sa = attacker.spe * stageMult(attacker.stages.sp);
    const sd = defender.spe * stageMult(defender.stages.sp);
    chance *= U.clamp(0.8 + 0.45 * (sa / (sa + sd)), 0.75, 1.15);
    return rng() < U.clamp(chance, 0.2, 1);
  };

  // The basic A-button attack: power 2 in PMD terms, never misses type checks
  B.regularAttack = function (attacker, defender, rng) {
    rng = rng || Math.random;
    const A = attacker.atk * stageMult(attacker.stages.at) + 2;
    const Dv = defender.def * stageMult(defender.stages.df);
    const lnArg = Math.max(1, 10 * ((A - Dv) / 8 + attacker.level + 50));
    let dmg = A * (39168 / 65536) - Dv / 2 + 50 * Math.log(lnArg) - 311;
    dmg = Math.max(1, dmg) * (0.89 + rng() * 0.22) * 0.7;
    return Math.max(1, Math.round(dmg));
  };

  // ---- status conditions ----
  B.STATUS_NAMES = {
    slp: 'asleep', par: 'paralyzed', brn: 'burned', psn: 'poisoned',
    frz: 'frozen', cnf: 'confused', ter: 'terrified'
  };
  B.applyStatus = function (target, id, turns) {
    if (target.status) return false;
    target.status = { id, turns: turns || (2 + Math.floor(Math.random() * 3)) };
    return true;
  };

  // Curated effects for well-known status moves; key = move name (lowercased)
  const S = (stat, delta, self) => ({ kind: 'stage', stat, delta, self: !!self });
  const ST = (id, turns) => ({ kind: 'status', id, turns });
  B.STATUS_FX = {
    'growl': S('at', -1), 'tail whip': S('df', -1), 'leer': S('df', -1), 'string shot': S('sp', -1),
    'sand attack': S('acc', -1), 'smokescreen': S('acc', -1), 'flash': S('acc', -1), 'kinesis': S('acc', -1),
    'screech': S('df', -2), 'metal sound': S('sd', -2), 'fake tears': S('sd', -2), 'charm': S('at', -2),
    'feather dance': S('at', -2), 'scary face': S('sp', -2), 'cotton spore': S('sp', -2), 'sweet scent': S('eva', -1),
    'growth': S('sa', 1, true), 'swords dance': S('at', 2, true), 'defense curl': S('df', 1, true),
    'harden': S('df', 1, true), 'withdraw': S('df', 1, true), 'iron defense': S('df', 2, true),
    'agility': S('sp', 2, true), 'rock polish': S('sp', 2, true), 'double team': S('eva', 1, true),
    'minimize': S('eva', 2, true), 'focus energy': S('at', 1, true), 'howl': S('at', 1, true),
    'work up': S('at', 1, true), 'nasty plot': S('sa', 2, true), 'calm mind': S('sa', 1, true),
    'amnesia': S('sd', 2, true), 'bulk up': S('at', 1, true), 'dragon dance': S('at', 1, true),
    'shell smash': S('at', 2, true), 'quiver dance': S('sa', 1, true), 'coil': S('at', 1, true),
    'hone claws': S('acc', 1, true), 'cosmic power': S('df', 1, true), 'acid armor': S('df', 2, true),
    'barrier': S('df', 2, true), 'swagger': ST('cnf'), 'confuse ray': ST('cnf'), 'supersonic': ST('cnf'),
    'sweet kiss': ST('cnf'), 'teeter dance': ST('cnf'), 'thunder wave': ST('par'), 'stun spore': ST('par'),
    'glare': ST('par'), 'sleep powder': ST('slp'), 'hypnosis': ST('slp'), 'sing': ST('slp'),
    'spore': ST('slp'), 'lovely kiss': ST('slp'), 'grass whistle': ST('slp'), 'yawn': ST('slp', 4),
    'poison powder': ST('psn'), 'poison gas': ST('psn'), 'toxic': ST('psn'), 'will o wisp': ST('brn'),
    'roar': { kind: 'flee' }, 'whirlwind': { kind: 'flee' },
    'recover': { kind: 'heal', frac: 0.5 }, 'roost': { kind: 'heal', frac: 0.5 },
    'moonlight': { kind: 'heal', frac: 0.5 }, 'morning sun': { kind: 'heal', frac: 0.5 },
    'synthesis': { kind: 'heal', frac: 0.5 }, 'slack off': { kind: 'heal', frac: 0.5 },
    'soft boiled': { kind: 'heal', frac: 0.5 }, 'milk drink': { kind: 'heal', frac: 0.5 },
    'rest': { kind: 'rest' }, 'heal pulse': { kind: 'healother', frac: 0.5 },
    'protect': { kind: 'protect' }, 'detect': { kind: 'protect' },
  };

  // Secondary effect chance on damaging moves, inferred from move type
  B.SECONDARY = {
    electric: 'par', fire: 'brn', ice: 'frz', poison: 'psn', psychic: 'cnf', ghost: 'cnf', dark: 'ter'
  };

  B.tickStatus = function (mon, log) {
    const st = mon.status;
    if (!st) return { canAct: true };
    st.turns--;
    let canAct = true, msg = null;
    switch (st.id) {
      case 'slp': canAct = false; msg = `${mon.name} is fast asleep...`; break;
      case 'frz': canAct = false; msg = `${mon.name} is frozen solid!`; break;
      case 'par': if (Math.random() < 0.35) { canAct = false; msg = `${mon.name} is paralyzed and can't move!`; } break;
      case 'brn': mon.hp = Math.max(1, mon.hp - Math.max(1, Math.floor(mon.maxhp / 16))); msg = `${mon.name} is hurt by its burn!`; break;
      case 'psn': mon.hp = Math.max(1, mon.hp - Math.max(1, Math.floor(mon.maxhp / 12))); msg = `${mon.name} is hurt by poison!`; break;
      case 'ter': canAct = false; msg = `${mon.name} is terrified!`; break;
    }
    if (st.turns <= 0) {
      if (log && st.id !== 'brn' && st.id !== 'psn') log(`${mon.name} is no longer ${B.STATUS_NAMES[st.id]}.`);
      else if (log) log(`${mon.name} recovered from being ${B.STATUS_NAMES[st.id]}.`);
      mon.status = null;
    } else if (msg && log) log(msg);
    return { canAct };
  };
})();
