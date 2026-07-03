// CONTENT: personality quiz, starters, chapters (scenes per docs/00-02 canon), endings, town NPCs.
//
// Scene op schema (see 09_story.js):
//  {t:'bg', v:'town'|'night'|'dungeon'|'tower'|'dawn'|'#hex'}
//  {t:'say', who:'player'|'partner'|<pokedex slug>|<plain name>, emo:'Normal'|'Happy'|'Sad'|'Angry'|'Worried'|'Surprised'|'Inspired', text:'...'}
//  {t:'narr', text:'...'}   (narration)
//  {t:'choice', text?, who?, opts:[{text, effects:[ops]}]}
//  {t:'renown', type:'heroic'|'scholar'|'diplomat'|'explorer'|'social'|'outlaw'|'legend', amt:N, domain?}
//  {t:'skill', name:'Foraging'|..., xp:N}   {t:'moral', d:+-N}   {t:'flag', k, v}
//  {t:'give', item:id|'poke', n}   {t:'ap', n}   {t:'heal'}
//  {t:'if', cond:'flagName'|fn(state), then:[ops], else:[ops]}
//  {t:'call', fn:(state)=>{}}
// Text supports {player} {partner} {title}.
//
// Chapter schema: { id, title, domain?, banner?, intro:[ops], dungeon:id|null, outro:[ops], auto?:bool }
window.EOL = window.EOL || {};
EOL.CONTENT = EOL.CONTENT || {};
(function () {
  const C = EOL.CONTENT;

  // ---------- personality quiz (classic PMD style) ----------
  C.quiz = {
    questions: [
      {
        text: 'A friend trips and drops their berries all over the road. What do you do?',
        opts: [
          { text: 'Help pick them up, quietly.', scores: { steady: 2, kind: 1 } },
          { text: 'Crack a joke to make them laugh first.', scores: { bold: 1, spark: 2 } },
          { text: 'Check if anyone saw, then help.', scores: { wary: 2 } },
          { text: 'Scoop them ALL up before they can blink!', scores: { bold: 2 } },
        ],
      },
      {
        text: 'You find a mysterious door deep in a cave. It hums softly. Do you open it?',
        opts: [
          { text: 'Of course! Adventure!', scores: { bold: 2, spark: 1 } },
          { text: 'Listen carefully first.', scores: { calm: 2, wary: 1 } },
          { text: 'Mark it on a map and come back prepared.', scores: { steady: 2 } },
          { text: 'Ask someone wiser about it.', scores: { kind: 1, calm: 1 } },
        ],
      },
      {
        text: 'Your team gets credit for something you did not do. What now?',
        opts: [
          { text: 'Correct it immediately. Truth matters.', scores: { steady: 2, calm: 1 } },
          { text: 'Feel bad... but enjoy it a little.', scores: { spark: 1, wary: 1 } },
          { text: 'Use the fame to help more Pokemon.', scores: { kind: 2 } },
          { text: 'Fame is fame!', scores: { bold: 2 } },
        ],
      },
      {
        text: 'A storm is coming and a stranger needs shelter. Your den is small.',
        opts: [
          { text: 'Squeeze together. Everyone fits.', scores: { kind: 2 } },
          { text: 'Give them the den and brave the rain.', scores: { bold: 1, kind: 1 } },
          { text: 'Build a quick lean-to together.', scores: { steady: 2 } },
          { text: 'Interrogate them first. Storms bring tricksters.', scores: { wary: 2 } },
        ],
      },
      {
        text: 'What do you dream about most?',
        opts: [
          { text: 'A name the whole world knows.', scores: { spark: 2, bold: 1 } },
          { text: 'A quiet life with good friends.', scores: { calm: 2, kind: 1 } },
          { text: 'Uncharted places no one has seen.', scores: { bold: 2 } },
          { text: 'Being truly useful to someone.', scores: { steady: 2, kind: 1 } },
        ],
      },
      {
        text: 'Deep night. A faint cry for help echoes from the woods. You are alone.',
        opts: [
          { text: 'Run toward it. Think later.', scores: { bold: 2 } },
          { text: 'Move quietly, scouting as you go.', scores: { wary: 2, calm: 1 } },
          { text: 'Wake the others - a team is stronger.', scores: { steady: 2 } },
          { text: 'Call back so they know help is coming.', scores: { kind: 2 } },
        ],
      },
    ],
    natures: [
      { trait: 'kind', name: 'the Gentle Heart', starter: 'eevee', desc: 'You notice what others need before they say it. Small kindnesses follow you like footprints.' },
      { trait: 'bold', name: 'the Wild Flame', starter: 'charmander', desc: 'You leap first. Somehow, the world usually catches you.' },
      { trait: 'steady', name: 'the Quiet Anchor', starter: 'riolu', desc: 'Dependable, watchful, unshakeable. Storms pass; you remain.' },
      { trait: 'calm', name: 'the Still Water', starter: 'mudkip', desc: 'You think in ripples, not splashes. Peace follows your patience.' },
      { trait: 'spark', name: 'the Bright Spark', starter: 'shinx', desc: 'You light up rooms and bad moods. Attention finds you - and you like it.' },
      { trait: 'wary', name: 'the Clever Shadow', starter: 'zorua', desc: 'You see the trick inside the promise. Nothing sneaks past you.' },
    ],
  };

  // Partner pool (canon starter candidates; the player picks after the quiz)
  C.partnerPool = ['riolu', 'eevee', 'shinx', 'vulpix', 'zorua', 'ralts', 'rockruff', 'sprigatito', 'fuecoco', 'quaxly', 'piplup', 'torchic', 'treecko', 'chimchar', 'pikachu', 'rowlet'];

  // ---------- town NPCs ----------
  C.townNPCs = function () {
    const SY = EOL.systems;
    const npcs = [
      {
        slug: 'kecleon', x: 6, y: 9, dir: 0, onTalk: () => EOL.playScene([
          { t: 'bg', v: 'town' },
          { t: 'say', who: 'kecleon', emo: 'Happy', text: 'Welcome, welcome! Step inside the shop for the finest goods in Mythfall Town!' },
        ]),
      },
      {
        slug: 'bidoof', x: 14, y: 11, dir: 6, onTalk: () => EOL.playScene([
          { t: 'bg', v: 'town' },
          { t: 'say', who: 'bidoof', emo: 'Happy', text: 'By golly, {player}! Folks are talkin\' about your team, yup yup! "{title}", they call you!' },
          { t: 'renown', type: 'social', amt: 1 },
        ]),
      },
      {
        slug: 'chansey', x: 24, y: 5, dir: 0, onTalk: () => EOL.playScene([
          { t: 'bg', v: 'town' },
          { t: 'say', who: 'chansey', emo: 'Normal', text: 'The Kitchen is always warm, dear. A good meal before a dungeon saves lives, you know.' },
        ]),
      },
    ];
    if (SY.state.chapter >= 1) npcs.push({
      slug: 'dusknoir', x: 22, y: 13, dir: 6, important: SY.state.chapter >= 5,
      onTalk: () => EOL.playScene([
        { t: 'bg', v: 'town' },
        { t: 'say', who: 'dusknoir', emo: 'Normal', text: '...You are not afraid to speak with me? Curious. Most give the Void Legend a wide berth these days.' },
        {
          t: 'choice', text: 'How do you respond?', opts: [
            { text: 'Everyone deserves fairness.', effects: [{ t: 'moral', d: 2 }, { t: 'flag', k: 'trustedDusknoir', v: true }, { t: 'say', who: 'dusknoir', emo: 'Normal', text: 'Fairness. A small word. It weighs more than most Mantles... Thank you, small one.' }] },
            { text: 'Say nothing and observe.', effects: [{ t: 'skill', name: 'Insight', xp: 8 }, { t: 'say', who: 'dusknoir', emo: 'Normal', text: 'Watchful. Good. Keep those eyes open. Not everything is what it appears to be. Especially now.' }] },
          ]
        },
      ]),
    });
    return npcs;
  };

  // ---------- chapters ----------
  C.chapters = [
    {
      id: 'prologue', title: 'The Small Life', banner: 'Chapter 1: The Small Life',
      intro: [
        { t: 'bg', v: 'dawn' },
        { t: 'narr', text: 'Long after the age of the First Legends... their Mantles pass from successor to successor. The Living Legends keep the domains. The world turns, mostly, in peace.' },
        { t: 'narr', text: 'And far from all of that, in a sleepy settlement, someone is counting berries.' },
        { t: 'bg', v: 'town' },
        { t: 'say', who: 'player', emo: 'Normal', text: '...forty-six, forty-seven... The Oran crate is short again. Better re-count before the caravan leaves.' },
        { t: 'narr', text: 'This is your life. Inventory. Rescue forms. Mended satchels. Useful, quiet, forgettable. You are good at it.' },
        { t: 'say', who: 'partner', emo: 'Inspired', text: '{player}!! There you are! Drop the clipboard. PLEASE drop the clipboard. I need you for something enormous.' },
        { t: 'say', who: 'partner', emo: 'Happy', text: 'A delivery job. A REAL one - into Sunrise Hollow! An actual dungeon! You and me!' },
        { t: 'say', who: 'player', emo: 'Worried', text: 'We sort supplies. We don\'t... dungeon.' },
        { t: 'say', who: 'partner', emo: 'Normal', text: 'Come with me. Not because we\'re special yet. Because if we stay here, we never will be.' },
        {
          t: 'choice', text: 'Go with them?', opts: [
            { text: 'Someone has to keep you safe.', effects: [{ t: 'moral', d: 3 }, { t: 'say', who: 'partner', emo: 'Happy', text: 'THAT\'S the spirit! Sort of! Let\'s go!' }] },
            { text: '...Fine. But we come back alive.', effects: [{ t: 'say', who: 'partner', emo: 'Happy', text: 'Alive AND famous. Watch me.' }] },
          ]
        },
        { t: 'narr', text: 'You pack Oran Berries. Of course you do.' },
        { t: 'give', item: 'oran-berry', n: 2 },
      ],
      dungeon: 'sunrise-hollow',
      outro: [
        { t: 'bg', v: 'dungeon' },
        { t: 'narr', text: 'The delivery is made. But on the way out... the ground shudders. Heat floods the hollow. A wildfire - underground?!' },
        { t: 'say', who: 'partner', emo: 'Worried', text: 'The exit\'s blocked! {player}, I can\'t - I can\'t see through the smoke -!' },
        { t: 'narr', text: 'And then: light. Not fire. Sunlight, somehow, in the deep dark. A shape strides through the smoke like morning through a window.' },
        { t: 'say', who: 'arcanine', emo: 'Normal', text: 'Stay low. Breathe slow. You two did well to last this long.' },
        { t: 'narr', text: 'Arcanine. THE Arcanine. Sun Living Legend. He carries three trapped Sunkern out on his back and walks you into daylight like it costs him nothing.' },
        { t: 'say', who: 'arcanine', emo: 'Happy', text: 'Legends are made by answering when the world calls. The world called. You answered. Remember how that felt.' },
        { t: 'say', who: 'arcanine', emo: 'Normal', text: 'Tell me... do you want to be remembered? Hm. Think on it.' },
        { t: 'say', who: 'partner', emo: 'Inspired', text: '...{player}. I\'m going to be like him. WE are. I\'m registering us as an exploration team TODAY.' },
        { t: 'renown', type: 'heroic', amt: 5 },
        { t: 'ap', n: 2 },
        { t: 'flag', k: 'metArcanine', v: true },
        { t: 'narr', text: 'You move to Mythfall Town, where the guild takes rookies. A new life begins - explore town, take rescue jobs, and see the Guild Hall for your next chapter.' },
      ],
    },
    {
      id: 'seed-arc', title: 'The Seed Domain', domain: 'seed', banner: 'Chapter 2: Roots',
      intro: [
        { t: 'bg', v: 'town' },
        { t: 'say', who: 'loudred', emo: 'Angry', text: 'LISTEN UP! Guild assignment! The Seed Domain\'s heartwood is WILTING and nobody knows WHY! Lilligant herself asked for help!' },
        { t: 'say', who: 'partner', emo: 'Inspired', text: 'A LIVING LEGEND asked for help and we\'re the ones going?! {player}, this is it. This is the start of everything.' },
        { t: 'narr', text: 'The Verdant Heartwood: the oldest grove in the Seed Domain. Something at its heart is drinking the green out of the world.' },
      ],
      dungeon: 'verdant-heart',
      outro: [
        { t: 'bg', v: 'dungeon' },
        { t: 'say', who: 'lilligant', emo: 'Normal', text: 'Enough. You fight like you\'re protecting something, not claiming it. That was the test, little sprouts. All of it.' },
        { t: 'say', who: 'partner', emo: 'Surprised', text: 'A TEST?! The wilting, the - we thought the domain was dying!' },
        { t: 'say', who: 'lilligant', emo: 'Sad', text: 'Parts of it are. Something IS wrong out there - shrines defiled, domains blaming domains. Void-shapes seen at every disaster. I needed to know who I could trust before it reaches my roots.' },
        { t: 'say', who: 'lilligant', emo: 'Happy', text: 'Grow slowly, grow deep. That is the Seed way. Take this, and my trust with it.' },
        { t: 'give', item: 'domain-relic' },
        { t: 'renown', type: 'legend', amt: 10, domain: 'seed' },
        { t: 'renown', type: 'diplomat', amt: 5 },
        { t: 'ap', n: 3 },
        { t: 'skill', name: 'Foraging', xp: 45 },
        { t: 'flag', k: 'seedCleared', v: true },
      ],
    },
  ];

  // ---------- endings ----------
  C.endings = {
    'new-accord': [
      { t: 'bg', v: 'dawn' },
      { t: 'narr', text: 'ENDING: THE NEW ACCORD' },
      { t: 'narr', text: 'Towns, guilds, and Living Legends gather at Mythfall\'s monument. For the first time since the First Legends, the domains choose their protectors together.' },
      { t: 'say', who: 'partner', emo: 'Happy', text: 'They\'re carving names today. Ours too. But you know what? I stopped needing it somewhere along the way. Weird, right?' },
    ],
    'peoples-legend': [
      { t: 'bg', v: 'dawn' },
      { t: 'narr', text: 'ENDING: THE PEOPLE\'S LEGEND' },
      { t: 'narr', text: 'No Mantle. No title. Just a team every town knows by deed, not decree. Ordinary Pokemon, extraordinary proof that the world doesn\'t need gods to be safe.' },
    ],
    'crowned-legend': [
      { t: 'bg', v: 'tower' },
      { t: 'narr', text: 'ENDING: THE CROWNED LEGEND' },
      { t: 'narr', text: 'A Mantle settles on your team like dawn on a mountain. Living Legends. May you carry it more gently than those before you.' },
    ],
    'apex-redemption': [
      { t: 'bg', v: 'dawn' },
      { t: 'narr', text: 'ENDING: THE APEX REDEMPTION' },
      { t: 'narr', text: 'Team Apex stands beside you at the end - stolen power surrendered, debts being repaid one rescue at a time. Mercy, it turns out, is also a legend.' },
    ],
    'hollow-legend': [
      { t: 'bg', v: 'night' },
      { t: 'narr', text: 'ENDING: THE HOLLOW LEGEND' },
      { t: 'narr', text: 'The world knows your name. The names you stepped on to get here remember it differently. The monument shines. Your reflection in it doesn\'t.' },
    ],
    'forgotten-hero': [
      { t: 'bg', v: 'night' },
      { t: 'narr', text: 'ENDING: THE FORGOTTEN HERO' },
      { t: 'narr', text: 'You saved the world and asked for nothing. Years from now, an old Bidoof will tell rookies about a team nobody remembers the name of. He remembers what matters: they came when it counted. Yup yup.' },
    ],
  };
})();
