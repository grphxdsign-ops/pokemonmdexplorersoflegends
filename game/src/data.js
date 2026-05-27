(function () {
  window.EOL_DATA = {
    title: "Pokemon Mystery Dungeon: Explorers of Legends",
    quiz: [
      {
        id: "morning",
        prompt: "Lowstep wakes before sunrise. What do you do first?",
        answers: [
          { text: "Finish the same chores as yesterday.", scores: { steady: 2, gentle: 1 } },
          { text: "Climb the ridge before anyone notices.", scores: { restless: 2, brave: 1 } },
          { text: "Listen for what the town needs.", scores: { gentle: 2, lonely: 1 } }
        ]
      },
      {
        id: "lostBadge",
        prompt: "Someone drops a rescue badge near the supply path.",
        answers: [
          { text: "Return it without making a scene.", scores: { steady: 2, gentle: 1 } },
          { text: "Study the tracks before touching it.", scores: { clever: 2, steady: 1 } },
          { text: "Make it an official first mission.", scores: { brave: 2, restless: 1 } }
        ]
      },
      {
        id: "shortcut",
        prompt: "A rival team finds a shortcut that feels wrong.",
        answers: [
          { text: "Refuse it even if you fall behind.", scores: { gentle: 2, steady: 1 } },
          { text: "Look for the catch.", scores: { clever: 2, lonely: 1 } },
          { text: "Race them the honest way.", scores: { brave: 2, restless: 1 } }
        ]
      }
    ],
    starters: {
      steady: { species: "Bulbasaur", color: "#5dbb6b", accent: "#245f39", note: "quiet, practical, and hard to rattle" },
      brave: { species: "Charmander", color: "#f28a38", accent: "#a33a18", note: "bold before fear gets a vote" },
      gentle: { species: "Chikorita", color: "#89c95d", accent: "#377044", note: "soft-spoken, patient, and stubbornly kind" },
      clever: { species: "Treecko", color: "#49ad6d", accent: "#1f6d50", note: "observant and calm under pressure" },
      restless: { species: "Pikachu", color: "#f7cf3d", accent: "#7d5a16", note: "quick to move and quicker to care" },
      lonely: { species: "Eevee", color: "#b9854c", accent: "#68401f", note: "used to small days, ready for a larger one" }
    },
    partners: [
      { id: "eevee", species: "Eevee", color: "#b9854c", accent: "#68401f", style: "earnest" },
      { id: "riolu", species: "Riolu", color: "#4b86d8", accent: "#1d3566", style: "fearless" },
      { id: "shinx", species: "Shinx", color: "#5aa6e8", accent: "#183b72", style: "electric" },
      { id: "vulpix", species: "Vulpix", color: "#d9793a", accent: "#6c2f14", style: "polished" },
      { id: "ralts", species: "Ralts", color: "#bdecc9", accent: "#2e8d7a", style: "dreamy" },
      { id: "sprigatito", species: "Sprigatito", color: "#7ad86f", accent: "#2a7352", style: "proud" }
    ],
    domains: {
      sun: { mantle: "Arcanine", publicRole: "the first hero the team meets" },
      void: { mantle: "Dusknoir", publicRole: "feared, blamed, and trying to clear his name" },
      storm: { mantle: "Luxray", publicRole: "reckless guardian of the Lightning Cliffs" },
      dream: { mantle: "Musharna", publicRole: "sleepy keeper of dream warnings" }
    },
    prologueLines: [
      { speaker: "", text: "Lowstep is the kind of town where every day starts with crates, dust, and the same three errands." },
      { speaker: "Partner", text: "You ever feel like this place is trying to keep us ordinary?" },
      { speaker: "Partner", text: "Legends do not start as legends. They start by leaving." },
      { speaker: "", text: "The request board creaks in the morning wind. One small mission waits there." }
    ],
    missionLines: [
      { speaker: "Partner", text: "A missing courier badge. Not exactly legendary, but it is a real request." },
      { speaker: "Partner", text: "We do this clean. No shortcuts. No stealing credit. That is how our story starts." }
    ],
    arcanineLines: [
      { speaker: "", text: "The cave trembles. Stones crack loose from above." },
      { speaker: "Arcanine", text: "Hold fast. A rescuer does not need permission to be brave." },
      { speaker: "Partner", text: "That was... that was what a legend looks like." },
      { speaker: "", text: "Your first rescue is recorded. It is not a legend yet. It is a first line." }
    ],
    apStats: [
      { id: "hp", label: "HP", note: "More room for mistakes." },
      { id: "attack", label: "Attack", note: "Physical moves hit harder." },
      { id: "defense", label: "Defense", note: "Physical hits hurt less." },
      { id: "specialAttack", label: "Sp. Atk", note: "Special moves hit harder." },
      { id: "specialDefense", label: "Sp. Def", note: "Special hits hurt less." },
      { id: "speed", label: "Speed", note: "Accuracy and evasion. Not turn order." }
    ]
  };
}());
