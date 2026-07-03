// Pokemon instance model: stats, leveling, moves, evolution, recruitment data.
window.EOL = window.EOL || {};
(function () {
  const D = () => EOL.DATA;

  class Mon {
    constructor(slug, level, opts) {
      opts = opts || {};
      this.slug = slug;
      this.level = level;
      this.exp = Mon.expForLevel(slug, level);
      this.ap = opts.ap || { hp: 0, at: 0, df: 0, sa: 0, sd: 0, sp: 0 }; // attribute points invested
      this.nick = opts.nick || null;
      this.moves = opts.moves || Mon.movesAtLevel(slug, level);
      this.recalc();
      this.hp = this.maxhp;
      this.belly = 100;
      this.status = null;      // {id, turns}
      this.isAlly = !!opts.isAlly;
      this.heldMega = false;   // mega evolved this dungeon
    }

    get entry() { return D().pokedex[this.slug]; }
    get name() { return this.nick || this.entry.name; }
    get types() { return this.entry.types; }

    recalc() {
      const e = this.entry, L = this.level, b = e.bs, ap = this.ap;
      this.maxhp = Math.min(999, Math.floor(b.hp * L / 42) + L + 12 + ap.hp * 2);
      this.atk = Math.min(500, Math.floor(b.at * (L + 25) / 90) + 4 + ap.at);
      this.def = Math.min(500, Math.floor(b.df * (L + 25) / 90) + 4 + ap.df);
      this.spa = Math.min(500, Math.floor(b.sa * (L + 25) / 90) + 4 + ap.sa);
      this.spd = Math.min(500, Math.floor(b.sd * (L + 25) / 90) + 4 + ap.sd);
      this.spe = Math.min(500, Math.floor(b.sp * (L + 25) / 90) + 4 + ap.sp);
    }

    static expForLevel(slug, level) {
      const e = D().pokedex[slug];
      const table = D().exp[e.gr] || D().exp[1];
      return table[Math.min(level, 100) - 1] || 0;
    }
    static movesAtLevel(slug, level) {
      const ls = D().learnsets[slug] || [];
      const learned = ls.filter(([lv]) => lv <= level).map(([, mv]) => mv);
      const picked = learned.slice(-4);
      return picked.map(id => ({ id, pp: D().moves[id].pp, maxpp: D().moves[id].pp }));
    }

    expToNext() {
      if (this.level >= 100) return Infinity;
      return Mon.expForLevel(this.slug, this.level + 1) - this.exp;
    }

    // returns array of event strings
    gainExp(amount) {
      const events = [];
      this.exp += amount;
      while (this.level < 100 && this.exp >= Mon.expForLevel(this.slug, this.level + 1)) {
        this.level++;
        const oldMax = this.maxhp;
        this.recalc();
        this.hp = Math.min(this.maxhp, this.hp + (this.maxhp - oldMax));
        events.push({ type: 'levelup', mon: this, level: this.level });
        // new moves at this level
        const ls = D().learnsets[this.slug] || [];
        for (const [lv, mv] of ls) {
          if (lv === this.level && !this.moves.some(m => m.id === mv)) {
            if (this.moves.length < 4) {
              this.moves.push({ id: mv, pp: D().moves[mv].pp, maxpp: D().moves[mv].pp });
              events.push({ type: 'learned', mon: this, move: mv });
            } else {
              events.push({ type: 'canlearn', mon: this, move: mv });
            }
          }
        }
      }
      return events;
    }

    canEvolve() {
      const e = this.entry;
      if (!e.evo || !e.evo.length) return null;
      const options = e.evo.filter(ev => this.level >= ev.lv);
      return options.length ? options : null;
    }
    evolveTo(slug) {
      const hpFrac = this.hp / this.maxhp;
      this.slug = slug;
      this.recalc();
      this.hp = Math.max(1, Math.round(this.maxhp * hpFrac));
      // learn signature moves of new form at current level if slots free
      const ls = D().learnsets[slug] || [];
      for (const [lv, mv] of ls) {
        if (lv <= this.level && this.moves.length < 4 && !this.moves.some(m => m.id === mv)) {
          this.moves.push({ id: mv, pp: D().moves[mv].pp, maxpp: D().moves[mv].pp });
        }
      }
    }

    megaForm() {
      const dexAll = D().pokedex;
      for (const [slug, e] of Object.entries(dexAll)) {
        if (e.base === this.slug && e.form && (e.form.startsWith('mega') || e.form === 'primal')) return slug;
      }
      return null;
    }

    serialize() {
      return {
        slug: this.slug, level: this.level, exp: this.exp, ap: this.ap, nick: this.nick,
        moves: this.moves, hp: this.hp
      };
    }
    static from(data) {
      const m = new Mon(data.slug, data.level, { ap: data.ap, nick: data.nick, moves: data.moves, isAlly: true });
      m.exp = data.exp;
      m.hp = Math.min(data.hp || m.maxhp, m.maxhp);
      return m;
    }
  }

  EOL.Mon = Mon;

  // Exp yield when defeating a mon of given slug/level (PMD-ish curve)
  EOL.expYield = function (slug, level) {
    const e = D().pokedex[slug];
    const bst = Object.values(e.bs).reduce((a, b) => a + b, 0);
    return Math.max(3, Math.floor(bst * level / 130));
  };
})();
