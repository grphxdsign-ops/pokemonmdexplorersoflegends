// PMD: Explorers of Legends - utilities
window.EOL = window.EOL || {};
(function () {
  const U = EOL.util = {};

  // Seedable RNG (mulberry32) so dungeon floors are reproducible per seed
  U.rng = function (seed) {
    let a = seed >>> 0;
    return function () {
      a |= 0; a = a + 0x6D2B79F5 | 0;
      let t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  };
  U.rand = Math.random;
  U.ri = (r, n) => Math.floor(r() * n);
  U.pick = (r, arr) => arr[Math.floor(r() * arr.length)];
  U.shuffle = (r, arr) => { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  U.clamp = (v, lo, hi) => v < lo ? lo : v > hi ? hi : v;
  U.cap = s => s.charAt(0).toUpperCase() + s.slice(1);

  // 8 directions, PMD order: 0=S 1=SE 2=E 3=NE 4=N 5=NW 6=W 7=SW (SpriteCollab sheet row order)
  U.DIRS = [[0, 1], [1, 1], [1, 0], [1, -1], [0, -1], [-1, -1], [-1, 0], [-1, 1]];
  U.dirFromDelta = (dx, dy) => {
    for (let i = 0; i < 8; i++) if (U.DIRS[i][0] === Math.sign(dx) && U.DIRS[i][1] === Math.sign(dy)) return i;
    return 0;
  };
  U.chebyshev = (x1, y1, x2, y2) => Math.max(Math.abs(x2 - x1), Math.abs(y2 - y1));

  U.TYPE_COLORS = {
    normal: '#A8A878', fighting: '#C03028', flying: '#A890F0', poison: '#A040A0',
    ground: '#E0C068', rock: '#B8A038', bug: '#A8B820', ghost: '#705898',
    steel: '#B8B8D0', fire: '#F08030', water: '#6890F0', grass: '#78C850',
    electric: '#F8D030', psychic: '#F85888', ice: '#98D8D8', dragon: '#7038F8',
    dark: '#705848', fairy: '#EE99AC'
  };

  // PMD Explorers-era type multipliers: standard chart -> PMD feel
  U.pmdTypeMult = f => f === 0 ? 0.5 : f === 0.5 ? 0.7 : f === 2 ? 1.4 : 1;

  U.fmt = (s, vars) => s.replace(/\{(\w+)\}/g, (m, k) => (vars && k in vars) ? vars[k] : m);
})();
