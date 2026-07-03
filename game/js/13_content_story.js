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
    const chap = SY.state.chapter;
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
    // Guild crier - lines track the state of the world.
    npcs.push({
      slug: 'loudred', x: 8, y: 5, dir: 4, onTalk: () => {
        const c = EOL.systems.state.chapter;
        let line;
        if (EOL.systems.state.postgame) line = 'THE GUILD IS CELEBRATING! ...We\'ve BEEN celebrating for a WEEK! My voice is almost GONE! ALMOST!';
        else if (c <= 1) line = 'ROOKIES! Check the Guild Hall for assignments! And STOP sleeping through my morning briefing!';
        else if (c <= 4) line = 'BULLETIN! Domains report strange disasters! Void-shaped figures spotted! The guild says DON\'T PANIC! So DON\'T!';
        else if (c <= 8) line = 'BULLETIN! That Team Apex is in ALL the papers again! ...What do you MEAN my headlines are old news?!';
        else if (c <= 12) line = 'BULLETIN! Domains are BLAMING each other! Void this, Void that! The guild says keep your heads ON!';
        else if (c <= 13) line = 'EMERGENCY BULLETIN! The domain council convenes over the Void evidence! This is NOT a drill!';
        else line = 'EMERGENCY! EVERYONE to their posts! The Tower of Legends is STIRRING! ...Be careful out there, you two.';
        EOL.playScene([{ t: 'bg', v: 'town' }, { t: 'say', who: 'loudred', emo: 'Shouting', text: line }]);
      },
    });
    // Lore elder - Mantles and First Legends.
    if (chap >= 2) npcs.push({
      slug: 'slowking', x: 25, y: 13, dir: 6, onTalk: () => EOL.playScene([
        { t: 'bg', v: 'town' },
        { t: 'say', who: 'slowking', emo: 'Normal', text: 'Ah, young explorers. Do you know what a Mantle truly is? Not a crown. A promise, worn on the shoulders, passed hand to hand since the First Legends.' },
        { t: 'say', who: 'slowking', emo: 'Normal', text: 'Dialga, Palkia, Kyogre, Yveltal... the old gods laid down their power ages ago. Successors carry it now. Luxray. Milotic. Even poor, shunned Dusknoir.' },
        {
          t: 'choice', text: 'Ask about...', opts: [
            { text: 'Can a Mantle be stolen?', effects: [{ t: 'say', who: 'slowking', emo: 'Worried', text: 'Taken by force? It has been tried. A Mantle seized, not given, burns its bearer like swallowed lightning. Remember that, if you ever meet the ambitious kind.' }, { t: 'skill', name: 'Lore', xp: 10 }] },
            { text: 'Could the First Legends return?', effects: [{ t: 'say', who: 'slowking', emo: 'Sad', text: 'They could be CALLED. At the Tower of Legends, with enough stolen rite-fire. But summoned gods do not come gladly. Pray no one is fool enough to try.' }, { t: 'skill', name: 'Lore', xp: 10 }] },
          ]
        },
      ]),
    });
    // Team Apex lurks in town through the middle of the campaign.
    if (chap >= 3 && chap <= 13) {
      npcs.push({
        slug: 'bisharp', x: 19, y: 10, dir: 4, onTalk: () => EOL.playScene([
          { t: 'bg', v: 'town' },
          { t: 'say', who: 'bisharp', emo: 'Normal', text: 'Ah. The little team that tries. I admire that, truly. The world needs Pokemon who polish the steps while others climb them.' },
          { t: 'say', who: 'bisharp', emo: 'Happy', text: 'A free lesson: history doesn\'t record who deserved. Only who arrived. Team Apex intends to arrive.' },
        ]),
      });
      npcs.push({
        slug: 'weavile', x: 20, y: 10, dir: 4, onTalk: () => EOL.playScene([
          { t: 'bg', v: 'town' },
          { t: 'say', who: 'weavile', emo: 'Happy', text: 'Ooh, it\'s the runner-ups! Did you see our new poster? Of course you did. It\'s EVERYWHERE.' },
          { t: 'say', who: 'weavile', emo: 'Normal', text: 'Word of advice - heroics don\'t count unless somebody important is watching. Kisses!' },
        ]),
      });
      npcs.push({
        slug: 'drapion', x: 21, y: 10, dir: 4, onTalk: () => EOL.playScene([
          { t: 'bg', v: 'town' },
          { t: 'say', who: 'drapion', emo: 'Normal', text: '...' },
          { t: 'say', who: 'drapion', emo: 'Normal', text: 'Boss says I shouldn\'t threaten the small teams anymore. So. Nice weather.' },
        ]),
      });
    }
    if (chap >= 1) npcs.push({
      slug: 'dusknoir', x: 22, y: 13, dir: 6, important: chap >= 5,
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
    // Postgame celebrants.
    if (EOL.systems.state.postgame) {
      npcs.push({
        slug: 'wigglytuff', x: 14, y: 6, dir: 4, onTalk: () => EOL.playScene([
          { t: 'bg', v: 'dawn' },
          { t: 'say', who: 'wigglytuff', emo: 'Joyous', text: 'FRIENDS! It\'s the heroes of the Tower! YOOM-TAH! The whole federation of guilds sends love! And snacks! Mostly snacks!' },
          { t: 'say', who: 'wigglytuff', emo: 'Happy', text: 'You came back, {player}. That\'s the best part of any legend. The coming back.' },
          { t: 'renown', type: 'social', amt: 2 },
        ]),
      });
      npcs.push({
        slug: 'noctowl', x: 17, y: 17, dir: 0, onTalk: () => EOL.playScene([
          { t: 'bg', v: 'night' },
          { t: 'say', who: 'noctowl', emo: 'Normal', text: 'Hoo. The world is quiet, but not empty. My night flights have seen things, if you care to hear.' },
          { t: 'say', who: 'noctowl', emo: 'Normal', text: 'The Tower\'s deep floors still hum - stronger Pokemon than ever prowl there now. And the old domain dungeons? Their hearts have woken. Legends walk them again.' },
          { t: 'say', who: 'noctowl', emo: 'Surprised', text: 'One more thing. On the highest wind I heard a voice like a struck bell ask: "WHY did the Maker answer the last summon?" ...Hoo. Worth chasing, I\'d say.' },
        ]),
      });
    }
    return npcs;
  };

  // ---------- chapters ----------
  C.chapters = [
    // ============ CH 1: PROLOGUE ============
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
    // ============ CH 2: SEED ============
    {
      id: 'seed-arc', title: 'The Seed Domain', domain: 'seed', banner: 'Chapter 2: Roots',
      intro: [
        { t: 'bg', v: 'town' },
        { t: 'say', who: 'loudred', emo: 'Shouting', text: 'LISTEN UP! Guild assignment! The Seed Domain\'s heartwood is WILTING and nobody knows WHY! Lilligant herself asked for help!' },
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
    // ============ CH 3: STORM ============
    {
      id: 'storm-arc', title: 'The Storm Domain', domain: 'storm', banner: 'Chapter 3: The Loudest Sky',
      intro: [
        { t: 'bg', v: 'town' },
        { t: 'say', who: 'loudred', emo: 'Shouting', text: 'BULLETIN! Stormcall Crags relay-spires are DOWN! Storm Domain villages have no lightning-warning! Luxray requests a guild team, PRONTO!' },
        { t: 'say', who: 'partner', emo: 'Determined', text: 'Two domains in a row asking for us? See? We\'re getting a reputation. A GOOD one, before you make that face.' },
        { t: 'bg', v: 'night' },
        { t: 'narr', text: 'On the storm-lashed road you meet another team going the same way. They move like they own the weather.' },
        { t: 'say', who: 'bisharp', emo: 'Normal', text: 'Well. Fellow professionals. Team Apex - you\'ll have heard of us soon enough. Bisharp. My colleagues, Weavile and Drapion.' },
        { t: 'say', who: 'weavile', emo: 'Happy', text: 'Racing us to the spires? Adorable. We\'ll leave the small rescues for you. There\'s usually a cat in a tree somewhere.' },
        { t: 'say', who: 'drapion', emo: 'Normal', text: '...Move.' },
        { t: 'say', who: 'partner', emo: 'Angry', text: 'The NERVE of those - okay. Okay. We beat them there. Quickly. {player}, walk faster.' },
      ],
      dungeon: 'stormcall-crags',
      outro: [
        { t: 'bg', v: 'dungeon' },
        { t: 'narr', text: 'At the summit spire, the storm breaks all at once - and stalking out of the lightning comes a mane full of static and two burning eyes.' },
        { t: 'say', who: 'luxray', emo: 'Happy', text: 'HA! You didn\'t run! The pass rerouted, rockfalls, my own thunder snapping at your heels - and you WALKED INTO IT. I like you already.' },
        { t: 'say', who: 'partner', emo: 'Stunned', text: 'Wait. The extra chaos was YOU?' },
        { t: 'say', who: 'luxray', emo: 'Normal', text: 'Courage isn\'t real until the sky is trying to eat you. That other team - Apex? Turned back the moment my test stopped being a headline. You stayed for the villages below. Noted.' },
        { t: 'narr', text: 'Together you re-light the relay-spires. In the valley, a soggy Pelipper journalist is already scribbling.' },
        { t: 'say', who: 'pelipper', emo: 'Happy', text: 'Gazette! Gazette! Who do I credit for saving the warning-line? Give me something PRINTABLE!' },
        {
          t: 'choice', text: 'What do you tell the press?', opts: [
            { text: 'Just the facts. The villagers helped too.', effects: [{ t: 'moral', d: 3 }, { t: 'renown', type: 'social', amt: 3 }, { t: 'say', who: 'partner', emo: 'Sigh', text: '"Villagers helped." We do ONE legendary thing and you share it. ...No, you\'re right. It\'s true. Print the true one.' }] },
            { text: 'Make us sound AMAZING.', effects: [{ t: 'moral', d: -3 }, { t: 'renown', type: 'social', amt: 6 }, { t: 'say', who: 'partner', emo: 'Happy', text: 'Front page, here we come! ...Why is Luxray looking at us like that.' }] },
          ]
        },
        { t: 'say', who: 'luxray', emo: 'Happy', text: 'Storm remembers its friends. Roar loud, little team.' },
        { t: 'give', item: 'domain-relic' },
        { t: 'renown', type: 'legend', amt: 8, domain: 'storm' },
        { t: 'renown', type: 'heroic', amt: 5 },
        { t: 'ap', n: 3 },
        { t: 'skill', name: 'Survival', xp: 40 },
        { t: 'flag', k: 'stormCleared', v: true },
      ],
    },
    // ============ CH 4: DREAM ============
    {
      id: 'dream-arc', title: 'The Dream Domain', domain: 'dream', banner: 'Chapter 4: Almost-Dreams',
      intro: [
        { t: 'bg', v: 'town' },
        { t: 'say', who: 'loudred', emo: 'Worried', text: 'Bulletin... quieter this time. Dream Domain says nightmares are LEAKING into waking Pokemon. Whole villages afraid to sleep. Musharna asks for gentle visitors.' },
        { t: 'say', who: 'partner', emo: 'Worried', text: 'Nightmares that follow you out of sleep? That\'s... okay, that\'s genuinely creepy. Stay close in there, alright?' },
        { t: 'bg', v: 'night' },
        { t: 'narr', text: 'Drowsemist Meadow drifts in permanent dusk. Pink mist curls between the trees. Sleepers murmur of a one-eyed shadow standing over the dream-well.' },
      ],
      dungeon: 'drowsemist-meadow',
      outro: [
        { t: 'bg', v: 'night' },
        { t: 'narr', text: 'At the dream-well, the mist parts. Musharna floats half-asleep, speaking as if reading a story written on the inside of her eyelids.' },
        { t: 'say', who: 'musharna', emo: 'Normal', text: 'Mm... you came through the bad dreams without adding to them... that is rarer than you know...' },
        { t: 'say', who: 'musharna', emo: 'Worried', text: 'Something poured nightmare into my well. The sleepers saw a one-eyed shadow... but listen... the shadow I saw wore its face like a borrowed coat. Seams at the edges. Mm.' },
        { t: 'say', who: 'partner', emo: 'Surprised', text: 'One-eyed... everyone will say that\'s Dusknoir. The Void Legend. That\'s who they\'ll blame.' },
        { t: 'say', who: 'musharna', emo: 'Sad', text: 'Dreams blame easily... waking should not... remember the seams, little walkers... remember the seams...' },
        {
          t: 'choice', text: 'Before she drifts off...', opts: [
            { text: 'Ask what she dreams about.', effects: [{ t: 'say', who: 'musharna', emo: 'Happy', text: 'Mm... I dream the first dream... the one Cresselia dreamed... a world where every sleeper wakes gently... it is a good dream... I keep it warm...' }, { t: 'skill', name: 'Lore', xp: 15 }] },
            { text: 'Tuck a blanket of mist over her.', effects: [{ t: 'moral', d: 2 }, { t: 'say', who: 'musharna', emo: 'Joyous', text: 'Mmm... kind hands... the well will remember them...' }] },
          ]
        },
        { t: 'give', item: 'domain-relic' },
        { t: 'renown', type: 'legend', amt: 8, domain: 'dream' },
        { t: 'renown', type: 'scholar', amt: 5 },
        { t: 'ap', n: 3 },
        { t: 'skill', name: 'Insight', xp: 30 },
        { t: 'flag', k: 'dreamCleared', v: true },
        { t: 'narr', text: 'On the road home, every notice board carries the same sketch: a one-eyed shadow. Underneath, someone has scrawled: VOID OUT.' },
      ],
    },
    // ============ CH 5: LAND ============
    {
      id: 'land-arc', title: 'The Land Domain', domain: 'land', banner: 'Chapter 5: The Patient Mountain',
      intro: [
        { t: 'bg', v: 'town' },
        { t: 'say', who: 'loudred', emo: 'Shouting', text: 'BULLETIN! Quakes in the Deeploam Warrens! The terrace farms are cracking apart! Torterra stands in the fault HOLDING IT SHUT and requests, quote, "unhurried assistance"!' },
        { t: 'say', who: 'partner', emo: 'Determined', text: 'Unhurried?! There are FARMS falling off a CLIFF! Let\'s go, let\'s go!' },
        { t: 'narr', text: 'Word is Team Apex was offered this job first - and passed. "No audience on a farm," Weavile reportedly yawned.' },
      ],
      dungeon: 'deeploam-warrens',
      outro: [
        { t: 'bg', v: 'dungeon' },
        { t: 'narr', text: 'Deep in the fault you brace the keystone boulder for hours until the tremors finally still. Torterra never once raises his voice.' },
        { t: 'say', who: 'torterra', emo: 'Normal', text: 'Good. Set it down slowly. The mountain does not argue with the weather, young ones. It outlasts it. You worked like mountains today.' },
        { t: 'say', who: 'torterra', emo: 'Normal', text: 'Duty is a slow crop. Most cannot wait for it to ripen. Those who can... feed everyone.' },
        { t: 'bg', v: 'town' },
        { t: 'narr', text: 'But when you descend to the terrace villages... a crowd has gathered. Around Team Apex. Bisharp stands atop YOUR keystone boulder, striking a pose for the Gazette.' },
        { t: 'say', who: 'bisharp', emo: 'Happy', text: '...and when the fault gaped, Team Apex did not flinch! The farms stand because Apex stood first!' },
        { t: 'say', who: 'partner', emo: 'Angry', text: 'They weren\'t even HERE! {player}, they\'re taking OUR - what do we do?!' },
        {
          t: 'choice', text: 'The crowd is cheering. What do you do?', opts: [
            { text: 'Correct the record. Calmly. Publicly.', effects: [{ t: 'moral', d: 3 }, { t: 'renown', type: 'diplomat', amt: 4 }, { t: 'flag', k: 'calledOutApex', v: true }, { t: 'say', who: 'torterra', emo: 'Normal', text: 'The mountain speaks. The crowd murmurs. Bisharp\'s smile does not reach his eyes as the farmers begin, slowly, to remember who actually held the stone.' }, { t: 'say', who: 'weavile', emo: 'Angry', text: 'Tch. Enjoy your little footnote.' }] },
            { text: 'Say nothing. The farms are safe. That\'s the job.', effects: [{ t: 'moral', d: -3 }, { t: 'say', who: 'partner', emo: 'Sad', text: '...Right. The job. The job nobody will ever know we did. I\'m fine. Let\'s just go.' }] },
            { text: 'Start a counter-rumor that Apex fled the quake.', effects: [{ t: 'moral', d: -2 }, { t: 'renown', type: 'outlaw', amt: 3 }, { t: 'say', who: 'partner', emo: 'Worried', text: 'It\'s not even a lie, they DID skip the job... so why does it feel like one?' }] },
          ]
        },
        { t: 'give', item: 'domain-relic' },
        { t: 'renown', type: 'legend', amt: 8, domain: 'land' },
        { t: 'renown', type: 'heroic', amt: 4 },
        { t: 'ap', n: 3 },
        { t: 'skill', name: 'Mining', xp: 35 },
        { t: 'flag', k: 'landCleared', v: true },
      ],
    },
    // ============ CH 6: SKY ============
    {
      id: 'sky-arc', title: 'The Sky Domain', domain: 'sky', banner: 'Chapter 6: Wings and Weight',
      intro: [
        { t: 'bg', v: 'town' },
        { t: 'say', who: 'loudred', emo: 'Shouting', text: 'BULLETIN! The winds around the Skyreach Pillars have DIED! Couriers grounded! Mail\'s piling up to my EYEBROWS! Corviknight demands - uh, REQUESTS - climbers!' },
        { t: 'say', who: 'partner', emo: 'Happy', text: 'Pillars so tall the couriers nest on clouds. And we get to climb it with our FEET. Lucky us. ...I\'m actually excited, don\'t tell anyone.' },
        { t: 'narr', text: 'The Pillars\' wind-heart has gone silent. Without it, an entire domain of fliers is trapped on the ground - and grounded wings grow desperate fast.' },
      ],
      dungeon: 'skyreach-pillars',
      outro: [
        { t: 'bg', v: 'dawn' },
        { t: 'narr', text: 'At the summit you cut loose the tangle of storm-chains choking the wind-heart. The gale returns all at once, nearly taking you with it. A vast black shape lands without a sound.' },
        { t: 'say', who: 'corviknight', emo: 'Normal', text: 'Hmph. Ground-walkers fixed the sky. There\'s a ballad no one will believe. You have my thanks. Once. Don\'t collect.' },
        { t: 'say', who: 'corviknight', emo: 'Normal', text: 'Everyone sings about freedom. Feathers, wind, wheeling about. Freedom is the EASY half. The other half is being the one who catches those who fall. Remember which half matters.' },
        {
          t: 'choice', text: 'The wind howls past the summit.', opts: [
            { text: 'Ask him what falling feels like.', effects: [{ t: 'say', who: 'corviknight', emo: 'Normal', text: 'Like freedom. That\'s the trap. ...Hmph. You ask better questions than the balladeers.' }, { t: 'skill', name: 'Insight', xp: 12 }] },
            { text: 'Shout into the wind like an idiot.', effects: [{ t: 'say', who: 'partner', emo: 'Joyous', text: 'WOOOOO! WE FIXED THE SKYYYY!' }, { t: 'say', who: 'corviknight', emo: 'Sigh', text: '...Couriers. Take these two DOWN.' }, { t: 'renown', type: 'social', amt: 2 }] },
          ]
        },
        { t: 'narr', text: 'Far below, a courier drops the week\'s Gazette. Front page: TEAM APEX SAVES FERRY. Second page: VOID SHADOW SEEN AT THREE MORE DISASTERS. Your pillars? Page six.' },
        { t: 'give', item: 'domain-relic' },
        { t: 'renown', type: 'legend', amt: 8, domain: 'sky' },
        { t: 'renown', type: 'explorer', amt: 6 },
        { t: 'ap', n: 3 },
        { t: 'skill', name: 'Climbing', xp: 45 },
        { t: 'flag', k: 'skyCleared', v: true },
      ],
    },
    // ============ CH 7: SEA ============
    {
      id: 'sea-arc', title: 'The Sea Domain', domain: 'sea', banner: 'Chapter 7: The Gracious Tide',
      intro: [
        { t: 'bg', v: 'town' },
        { t: 'say', who: 'loudred', emo: 'Shouting', text: 'BULLETIN! The Pearlwake tide-shrine is FOULED! Fish routes scattered! Milotic invites, and I QUOTE, "any soul with clean hands and a patient heart"! That\'s YOU! Probably!' },
        { t: 'say', who: 'partner', emo: 'Normal', text: 'Clean hands, patient heart. We can do that. We\'ve BEEN doing that. Even if page six is all it gets us.' },
        { t: 'narr', text: 'The grotto glows with pearl-light. Somewhere below, the shrine that steadies the tides is choking on something dark.' },
      ],
      dungeon: 'pearlwake-grotto',
      outro: [
        { t: 'bg', v: 'dungeon' },
        { t: 'narr', text: 'You scrub the last of the black residue from the tide-shrine. The water clears like a held breath released. Milotic circles you once, a ribbon of light.' },
        { t: 'say', who: 'milotic', emo: 'Happy', text: 'Beautifully done. Not the scrubbing - though the scrubbing was thorough - the MANNER of it. You worked as guests of the sea, not conquerors. The tide notices such things.' },
        { t: 'say', who: 'milotic', emo: 'Worried', text: 'This residue... it is not of the sea. It reeks of illusion and old fear. Someone WANTS the domains frightened. Be gracious, dears, but be careful.' },
        { t: 'bg', v: 'town' },
        { t: 'narr', text: 'You surface at the harbor town... into a festival. Confetti. A brass band. Team Apex on a podium, medals flashing, as the mayor proclaims APEX DAY. The crowd chants their name.' },
        { t: 'say', who: 'weavile', emo: 'Happy', text: 'Oh look who crawled out of a trench! Love the seaweed. Very page six.' },
        { t: 'say', who: 'partner', emo: 'Sad', text: '...They\'re not better than us. They\'re not. So why does everyone... {player}, what are we doing wrong?' },
        { t: 'moral', d: -3 },
        {
          t: 'choice', text: '{partner} is really hurting. Say something.', who: 'player', opts: [
            { text: 'We didn\'t start this to be chanted at.', effects: [{ t: 'moral', d: 4 }, { t: 'say', who: 'partner', emo: 'Sigh', text: '...Yeah. Yeah. The tide notices, right? That\'s what she said. Okay. I\'m okay. Thanks, {player}.' }] },
            { text: 'We\'ll be louder than them someday. Promise.', effects: [{ t: 'moral', d: -3 }, { t: 'say', who: 'partner', emo: 'Determined', text: 'Louder. Yeah. Whatever it takes... I\'m holding you to that promise.' }] },
          ]
        },
        { t: 'narr', text: 'As the festival dims, a familiar warm shape falls in step beside you on the dock. Arcanine, alone, without his crowds.' },
        { t: 'say', who: 'arcanine', emo: 'Normal', text: 'I saw the shrine ledger. I know who did the real work this week. The sea knows. I know. Does that suffice, I wonder?' },
        { t: 'say', who: 'arcanine', emo: 'Normal', text: 'When they chant someone else\'s name... what is it you feel? Hold onto that feeling. Study it. It is the most honest teacher you will ever have.' },
        { t: 'say', who: 'arcanine', emo: 'Happy', text: 'Come to the Sun Domain soon. The Daybreak Flame could use young hands. And I confess... I enjoy being remembered by promising Pokemon.' },
        { t: 'give', item: 'domain-relic' },
        { t: 'renown', type: 'legend', amt: 8, domain: 'sea' },
        { t: 'renown', type: 'diplomat', amt: 4 },
        { t: 'ap', n: 3 },
        { t: 'skill', name: 'Fishing', xp: 35 },
        { t: 'flag', k: 'seaCleared', v: true },
      ],
    },
    // ============ CH 8: SUN ============
    {
      id: 'sun-arc', title: 'The Sun Domain', domain: 'sun', banner: 'Chapter 8: The Daybreak Flame',
      intro: [
        { t: 'bg', v: 'dawn' },
        { t: 'narr', text: 'The invitation arrives on gold-edged paper that smells faintly of woodsmoke. The Daybreak Flame at the Kindled Court - the fire said to have lit the first morning - is guttering.' },
        { t: 'say', who: 'partner', emo: 'Inspired', text: 'HE invited US. Arcanine! Personally! {player}, this is the actual best day of my life and I once found two Reviver Seeds in one chest.' },
        { t: 'bg', v: 'town' },
        { t: 'say', who: 'arcanine', emo: 'Happy', text: 'You came. Good. The Flame dims and my domain pretends not to notice, because heroes are not permitted bad days. Ha! Let me walk you in - the Court has teeth.' },
        { t: 'narr', text: 'He trains with you on the Court\'s sunward terraces as you go. He corrects your stance with a nudge, praises exactly the right things, laughs at the right moments. It is a perfect afternoon. Perfectly perfect.' },
        { t: 'say', who: 'arcanine', emo: 'Normal', text: 'A question, while we walk. Why do you do this? Truly. Not the answer you give journalists.' },
        {
          t: 'choice', text: 'Why do you do this?', opts: [
            { text: 'To help. That\'s the whole thing.', effects: [{ t: 'moral', d: 3 }, { t: 'say', who: 'arcanine', emo: 'Normal', text: 'Mm. The humble answer. It\'s what the Sunkern-savers always say... right up until the world forgets them. I hope you fare better than most, little flame.' }] },
            { text: 'To be remembered. Honestly.', effects: [{ t: 'moral', d: -3 }, { t: 'say', who: 'arcanine', emo: 'Happy', text: 'HONESTY! At last! Remembered - yes. The dead gods are remembered. The living substitutes are merely... tolerated. You and I should talk again, someday, about what remembrance is worth.' }] },
            { text: 'I don\'t know yet.', effects: [{ t: 'skill', name: 'Insight', xp: 15 }, { t: 'say', who: 'arcanine', emo: 'Normal', text: 'An honest "I don\'t know" outshines a rehearsed "to help". Keep not-knowing carefully. Answers arrive at the worst moments.' }] },
          ]
        },
        { t: 'say', who: 'arcanine', emo: 'Determined', text: 'The Flame\'s heart is below. Relight it, and the Sun Domain owes you a dawn. I will be watching. I am always watching.' },
      ],
      dungeon: 'kindled-court',
      outro: [
        { t: 'bg', v: 'dawn' },
        { t: 'narr', text: 'The Daybreak Flame roars back to life, and for one heartbeat the whole Court is made of morning. Arcanine stands in the light like he was carved for it.' },
        { t: 'say', who: 'arcanine', emo: 'Joyous', text: 'MAGNIFICENT! Look at it! That is what the world has been missing - real fire! Not embers politely tended. FIRE!' },
        { t: 'say', who: 'arcanine', emo: 'Normal', text: 'You two have the makings of true legends. Not the inherited kind. The kind that gets WORSHIPPED. Forgive me - the kind that gets remembered. A slip of the tongue.' },
        { t: 'say', who: 'partner', emo: 'Inspired', text: 'Did you hear that?! {player}! THE Arcanine said we - okay breathe, breathe. Act normal. ACT NORMAL.' },
        { t: 'say', who: 'arcanine', emo: 'Happy', text: 'One more thing. Dark times gather - Void shadows, frightened domains. When the decisive hour comes... trust the ones who saved you first. Can you do that for me?' },
        { t: 'give', item: 'domain-relic' },
        { t: 'renown', type: 'legend', amt: 8, domain: 'sun' },
        { t: 'renown', type: 'heroic', amt: 6 },
        { t: 'ap', n: 4 },
        { t: 'skill', name: 'Tactics', xp: 35 },
        { t: 'flag', k: 'sunCleared', v: true },
      ],
    },
    // ============ CH 9: MOON ============
    {
      id: 'moon-arc', title: 'The Moon Domain', domain: 'moon', banner: 'Chapter 9: Footprints in Moonlight',
      intro: [
        { t: 'bg', v: 'night' },
        { t: 'say', who: 'loudred', emo: 'Shouting', text: 'BULLETIN! The Palemoon shrine was SMASHED in the night! A dozen witnesses swear they saw DUSKNOIR HIMSELF! The Moon Domain is in an UPROAR!' },
        { t: 'say', who: 'partner', emo: 'Worried', text: 'A dozen witnesses, {player}. A DOZEN. I know Musharna said "seams", but... how long do we keep giving the Void Legend the benefit of the doubt?' },
        { t: 'narr', text: 'In the market, Weavile is doing brisk business selling "certified Void-warding charms". They smell suspiciously of pond water.' },
        { t: 'say', who: 'weavile', emo: 'Happy', text: 'Step right up! Apex-approved protection! The Void took the moon-shrine - don\'t let it take YOUR shrine! Only 300 Poke!' },
      ],
      dungeon: 'palemoon-hollow',
      outro: [
        { t: 'bg', v: 'night' },
        { t: 'narr', text: 'The shattered moon-shrine glows faintly, like a broken bowl of milk. On a branch above it sits a pair of yellow rings in the dark. Umbreon has been waiting. Possibly for hours. Possibly for the drama.' },
        { t: 'say', who: 'umbreon', emo: 'Normal', text: 'Twelve witnesses. All certain. All describing a floating, one-eyed ghost. Fascinating creature, this Dusknoir. Floats in every story...' },
        { t: 'say', who: 'umbreon', emo: 'Normal', text: '...and yet. My shrine-wrecker left footprints. Four paws, running gait. Ghosts are many things. Heavy joggers, they are not.' },
        {
          t: 'choice', text: 'The evidence sits before you.', opts: [
            { text: 'Study the tracks yourself. (Insight)', effects: [{ t: 'skill', name: 'Insight', xp: 30 }, { t: 'flag', k: 'sawThroughIllusion', v: true }, { t: 'narr', text: 'Four paws. Long stride. And caught on a thorn: a tuft of dark fur that shimmers wrong in the moonlight, like it can\'t decide what color to be.' }, { t: 'say', who: 'player', emo: 'Determined', text: 'Whatever the witnesses saw... the thing that RAN from here had fur. And fur that lies, at that.' }, { t: 'say', who: 'umbreon', emo: 'Happy', text: 'Well, well. Eyes that work. Do keep those. They\'re about to be in short supply.' }] },
            { text: 'Twelve witnesses can\'t all be wrong.', effects: [{ t: 'moral', d: -2 }, { t: 'say', who: 'umbreon', emo: 'Sigh', text: 'Twelve Pokemon saw one illusion, or one Pokemon told twelve friends. Counting is not seeing. ...But you\'ll learn that the interesting way, I suspect.' }] },
          ]
        },
        { t: 'say', who: 'umbreon', emo: 'Normal', text: 'The night watch is long, and lately something\'s been walking through it wearing other Pokemon\'s faces. Watch the seams, little ones. And the feet. Always the feet.' },
        { t: 'give', item: 'domain-relic' },
        { t: 'renown', type: 'legend', amt: 8, domain: 'moon' },
        { t: 'renown', type: 'scholar', amt: 5 },
        { t: 'ap', n: 3 },
        { t: 'skill', name: 'Pathfinding', xp: 35 },
        { t: 'flag', k: 'moonCleared', v: true },
      ],
    },
    // ============ CH 10: FROZEN ============
    {
      id: 'frozen-arc', title: 'The Frozen Domain', domain: 'frozen', banner: 'Chapter 10: The Quiet Cold',
      intro: [
        { t: 'bg', v: 'town' },
        { t: 'say', who: 'loudred', emo: 'Shouting', text: 'BULLETIN! The eternal aurora over Whitehush Glacier has GONE OUT! Travelers lost in the white! Froslass asks for help finding them! Bring! Warm! SOCKS!' },
        { t: 'say', who: 'partner', emo: 'Worried', text: 'The aurora\'s their lighthouse. Without it the whole glacier is one big white nothing... and there are still Pokemon out in it. Come on.' },
        { t: 'narr', text: 'The cold on the glacier is not cruel. It is worse: it is gentle, and patient, and it sings a little, at the edge of hearing.' },
      ],
      dungeon: 'whitehush-glacier',
      outro: [
        { t: 'bg', v: 'night' },
        { t: 'narr', text: 'You guide the last frostbitten traveler into the ice-cave shelter. And she is simply THERE, between one blink and the next - a white figure with sad, kind eyes.' },
        { t: 'say', who: 'froslass', emo: 'Normal', text: 'Shh. They\'re sleeping. Eleven travelers lost, eleven found. You counted them warm, one by one. I watched you do it. I watch everything on my glacier.' },
        { t: 'say', who: 'froslass', emo: 'Sad', text: 'The aurora did not die. It was drunk - swallowed by something that eats light and leaves fear. It visits every domain now, I think. Mine was simply... quieter about it.' },
        { t: 'narr', text: 'A shivering Snorunt peeks from behind an ice pillar, too scared of strangers to come near the fire.' },
        {
          t: 'choice', text: 'The little one is freezing out there.', opts: [
            { text: 'Sit nearby. Let it come at its own pace.', effects: [{ t: 'moral', d: 3 }, { t: 'say', who: 'froslass', emo: 'Happy', text: 'You wait beautifully. It took the little one an hour to reach your fire, and you never once looked impatient. The cold respects that. So do I.' }] },
            { text: 'Toss it an apple and wave it over.', effects: [{ t: 'narr', text: 'You lob your last apple in a gentle arc across the cave.' }, { t: 'say', who: 'partner', emo: 'Happy', text: 'It caught it! Oh - it\'s eating the apple AND glaring at us. Fair enough, tiny friend. Fair enough.' }, { t: 'renown', type: 'social', amt: 2 }] },
          ]
        },
        { t: 'say', who: 'froslass', emo: 'Normal', text: 'When the light-eater is found... tell it the glacier remembers. Nothing frightens a thief like a witness. Farewell, warm ones.' },
        { t: 'give', item: 'domain-relic' },
        { t: 'renown', type: 'legend', amt: 8, domain: 'frozen' },
        { t: 'renown', type: 'explorer', amt: 5 },
        { t: 'ap', n: 3 },
        { t: 'skill', name: 'Survival', xp: 40 },
        { t: 'flag', k: 'frozenCleared', v: true },
      ],
    },
    // ============ CH 11: LIFE ============
    {
      id: 'life-arc', title: 'The Life Domain', domain: 'life', banner: 'Chapter 11: Mercy',
      intro: [
        { t: 'bg', v: 'town' },
        { t: 'say', who: 'loudred', emo: 'Worried', text: 'Bulletin. Everbloom Vale\'s healing springs are failing... and with all the disasters, the wards are FULL of hurt Pokemon. Blissey needs hands. Any hands. All hands.' },
        { t: 'say', who: 'partner', emo: 'Determined', text: 'No press, no podiums, just carrying bandages up a mountain. ...You know what? Good. I could use a week of just being useful. Weird thing to miss.' },
        { t: 'moral', d: 2 },
        { t: 'narr', text: 'The Vale smells of warm herbs and clean linen. Somewhere at its heart, a spring that has healed the world for a thousand years is running dry.' },
      ],
      dungeon: 'everbloom-vale',
      outro: [
        { t: 'bg', v: 'dawn' },
        { t: 'narr', text: 'The spring flows again. In the Vale\'s ward afterward, Blissey moves from cot to cot, and you realize she knows every single patient\'s name. All two hundred of them.' },
        { t: 'say', who: 'blissey', emo: 'Happy', text: 'There you are, dears! The spring\'s singing again, the ferals you fought are tucked in the east ward - yes, the ones who tried to bite you, mercy doesn\'t check teeth first - and YOU need soup.' },
        {
          t: 'choice', text: 'One last evening in the Vale.', opts: [
            { text: 'Help in the ward until lights-out.', effects: [{ t: 'moral', d: 3 }, { t: 'skill', name: 'First Aid', xp: 40 }, { t: 'say', who: 'blissey', emo: 'Joyous', text: 'Natural bedside manner, both of you! If the hero business ever slows down, I WILL poach you. That\'s a promise and a threat, dear.' }] },
            { text: 'Ask her how she forgives so easily.', effects: [{ t: 'skill', name: 'Insight', xp: 20 }, { t: 'say', who: 'blissey', emo: 'Normal', text: 'Forgive? Oh dear, no. Forgiving is hard and slow, and some days I don\'t manage it. Mercy is different. Mercy is just refusing to add one more wound to the pile. Anyone can do THAT much.' }, { t: 'say', who: 'partner', emo: 'Normal', text: '...Refusing to add one more wound. Huh. That\'s... I\'m going to remember that one.' }] },
          ]
        },
        { t: 'say', who: 'blissey', emo: 'Normal', text: 'The spring didn\'t fail on its own, loves. Something is siphoning LIFE itself toward the old Tower. Whatever you\'re chasing... hurry. But hurry kindly.' },
        { t: 'give', item: 'domain-relic' },
        { t: 'renown', type: 'legend', amt: 8, domain: 'life' },
        { t: 'renown', type: 'social', amt: 5 },
        { t: 'ap', n: 3 },
        { t: 'skill', name: 'First Aid', xp: 30 },
        { t: 'flag', k: 'lifeCleared', v: true },
      ],
    },
    // ============ CH 12: SPACE ============
    {
      id: 'space-arc', title: 'The Space Domain', domain: 'space', banner: 'Chapter 12: The Long View',
      intro: [
        { t: 'bg', v: 'night' },
        { t: 'say', who: 'loudred', emo: 'Shouting', text: 'BULLETIN! Distances near the Farshine Observatory have gone WRONG! A ten-minute walk took the mail-carrier THREE DAYS! Orbeetle requests visitors who, quote, "do not panic easily"!' },
        { t: 'say', who: 'partner', emo: 'Worried', text: 'Space folding up like bad origami. Sure. Fine. Normal week. {player}, if I end up three days away from you, walk SLOWLY toward my voice.' },
        { t: 'narr', text: 'The Farshine Observatory is an ancient dome that has quietly ignored geometry for several thousand years. Lately, geometry has begun ignoring it back.' },
      ],
      dungeon: 'farshine-observatory',
      outro: [
        { t: 'bg', v: 'tower' },
        { t: 'narr', text: 'At the Observatory\'s heart, the folds of space smooth out like a sheet pulled tight. Orbeetle descends slowly, turning to consider you with several eyes at once.' },
        { t: 'say', who: 'orbeetle', emo: 'Normal', text: 'Interesting. From the entry hall, you were two small dots. From here, you are two Pokemon who crossed a broken sky to fix a stranger\'s cave. Distance changes what things are. This is my whole domain, in one lesson.' },
        { t: 'say', who: 'orbeetle', emo: 'Normal', text: 'Come. Look into the star-pool. From high enough, every rivalry looks like two ants arguing on the same leaf. Your Team Apex. The domains and the Void. Ants, leaf. And yet - the leaf is falling. Someone shook the tree.' },
        { t: 'say', who: 'partner', emo: 'Surprised', text: 'You can SEE that from up here? Then who shook it? Who\'s actually behind all of this?' },
        { t: 'say', who: 'orbeetle', emo: 'Worried', text: 'The pool shows shapes, not names. Three shapes, moving as one, walking toward the tallest thing in the world. And one of them... burns.' },
        {
          t: 'choice', text: 'The star-pool shimmers.', opts: [
            { text: 'Look for yourselves in the pool.', effects: [{ t: 'say', who: 'orbeetle', emo: 'Happy', text: 'There. Two dots, very small, very stubborn, exactly where they are needed. I have watched this world a long time. The small stubborn dots are always the load-bearing ones.' }, { t: 'skill', name: 'Lore', xp: 15 }] },
            { text: 'Ask what Palkia was like.', effects: [{ t: 'say', who: 'orbeetle', emo: 'Normal', text: 'Vast. Lonely. Palkia held all of space and could not stand close to anything. I hold a cavern and some star-charts, and I hold them WITH my neighbors. I believe mine is the better job.' }, { t: 'skill', name: 'Lore', xp: 15 }] },
          ]
        },
        { t: 'give', item: 'domain-relic' },
        { t: 'renown', type: 'legend', amt: 8, domain: 'space' },
        { t: 'renown', type: 'scholar', amt: 6 },
        { t: 'ap', n: 3 },
        { t: 'skill', name: 'Pathfinding', xp: 40 },
        { t: 'flag', k: 'spaceCleared', v: true },
      ],
    },
    // ============ CH 13: TIME ============
    {
      id: 'time-arc', title: 'The Time Domain', domain: 'time', banner: 'Chapter 13: What Echoes',
      intro: [
        { t: 'bg', v: 'town' },
        { t: 'say', who: 'loudred', emo: 'Shouting', text: 'BULLETIN! Time HICCUPS at the Rustchime Ruins! Yesterday lasted FORTY HOURS there! Or four! Reports disagree, WHICH IS SORT OF THE PROBLEM!' },
        { t: 'say', who: 'partner', emo: 'Sigh', text: 'And the Time Legend is Bronzong, who has reportedly spoken nine sentences this century. This\'ll be a chatty one. Let\'s go before yesterday catches up with us.' },
        { t: 'narr', text: 'The Rustchime Ruins tick. All of them. Every stone, softly, and not quite in unison anymore - like a thousand clocks slowly losing an argument.' },
      ],
      dungeon: 'rustchime-ruins',
      outro: [
        { t: 'bg', v: 'tower' },
        { t: 'narr', text: 'You re-hang the great pendulum. The thousand ticks fall back into one. In the silence between beats, something enormous and green-bronze simply IS, where nothing was before.' },
        { t: 'say', who: 'bronzong', emo: 'Normal', text: '...' },
        { t: 'narr', text: 'It regards you for a long, long moment. When it finally speaks, you feel it in your teeth.' },
        { t: 'say', who: 'bronzong', emo: 'Normal', text: 'WHAT IS DONE... ECHOES.' },
        { t: 'say', who: 'partner', emo: 'Stunned', text: '...That\'s it? We fixed the pendulum and we get four words? ...Why do I feel like crying? {player}, why do the four words WORK?' },
        { t: 'say', who: 'bronzong', emo: 'Normal', text: 'SOON... YOU CHOOSE... WHAT ECHOES.' },
        { t: 'narr', text: 'The bell-god fades. On the long walk home, every town crier is shouting the same news: a mountain of "evidence" against Dusknoir. A council of the domains. A trial. The word: WAR.' },
        { t: 'give', item: 'domain-relic' },
        { t: 'renown', type: 'legend', amt: 8, domain: 'time' },
        { t: 'renown', type: 'scholar', amt: 6 },
        { t: 'ap', n: 3 },
        { t: 'skill', name: 'Inscription', xp: 30 },
        { t: 'flag', k: 'timeCleared', v: true },
      ],
    },
    // ============ CH 14: VOID ACCUSATION ============
    {
      id: 'void-accusation', title: 'The Trial of the Void', domain: 'void', banner: 'Chapter 14: The Trial of the Void',
      intro: [
        { t: 'bg', v: 'night' },
        { t: 'narr', text: 'The domain council convenes in Mythfall\'s great square. Living Legends, guildmasters, a thousand torches. In the center, alone in a circle of empty cobblestones: Dusknoir.' },
        { t: 'narr', text: 'The evidence is presented. Witness scrolls from nine disasters. Scorched relics found in Void territory. A shred of shadow-cloth from the moon-shrine. It is thorough. It is damning. It is very, very neat.' },
        { t: 'say', who: 'dusknoir', emo: 'Normal', text: 'I have served the Void Mantle for sixty years. I have buried its dead and kept its gate. I did not do these things. ...That is all. I will not beg.' },
        { t: 'say', who: 'bisharp', emo: 'Normal', text: 'Sixty years of practice at hiding, the honored council means. Team Apex stands ready to lead the strike on the Void, the moment the council finds its courage.' },
        { t: 'say', who: 'partner', emo: 'Worried', text: 'They\'re going to condemn him, {player}. Look at them. The whole world wants this over. ...What do WE say? They\'re asking teams who\'ve served the domains. They\'ll ask US.' },
        { t: 'if', cond: 'sawThroughIllusion', then: [
          { t: 'say', who: 'partner', emo: 'Determined', text: 'Wait - the footprints. The fur that shimmered wrong. Ghosts don\'t leave footprints. We SAW that with our own eyes.' },
        ] },
        {
          t: 'choice', text: 'The council calls on your team.', opts: [
            { text: 'The evidence is too neat. We stand with Dusknoir.', effects: [{ t: 'flag', k: 'trustedDusknoir', v: true }, { t: 'moral', d: 4 }, { t: 'renown', type: 'diplomat', amt: 6 }, { t: 'say', who: 'dusknoir', emo: 'Stunned', text: '...You. The small ones from the town square. You would spend your good name... on MINE?' }, { t: 'narr', text: 'The square erupts. Some jeer. But Umbreon\'s rings glow thoughtfully in the dark, and Musharna murmurs the word "seams". The council stays its hand - barely. No strike. Not yet.' }] },
            { text: 'The evidence stands. Condemn him.', effects: [{ t: 'flag', k: 'trustedDusknoir', v: false }, { t: 'moral', d: -4 }, { t: 'renown', type: 'social', amt: 4 }, { t: 'say', who: 'dusknoir', emo: 'Sad', text: '...I see. Even you. ...No. No, I will not beg.' }, { t: 'narr', text: 'The square roars approval of your team\'s name. Somewhere in the crowd, Bisharp applauds slowly. Why does it feel like losing?' }] },
          ]
        },
        { t: 'narr', text: 'Either way, one task is agreed: someone must scout the Rift of Whispers, the Void border-deep where the evidence trail ends. The council looks at the team that always says yes.' },
      ],
      dungeon: 'rift-of-whispers',
      outro: [
        { t: 'bg', v: 'tower' },
        { t: 'narr', text: 'At the bottom of the Rift you find the "evidence trail". Staged. All of it. Relics arranged like stage props, scorch-marks painted in nightmare-residue... and a workbench of half-finished Dusknoir disguises, seams still open.' },
        { t: 'say', who: 'partner', emo: 'Stunned', text: 'It\'s a COSTUME SHOP. The disasters, the witnesses, the trial - somebody BUILT all of it. Who does that? Who frames an entire domain?!' },
        { t: 'if', cond: 'trustedDusknoir', then: [
          { t: 'say', who: 'partner', emo: 'Determined', text: 'You believed him, {player}. In front of the whole world. ...I\'m glad we did. I\'m so, so glad we did.' },
          { t: 'moral', d: 2 },
        ], else: [
          { t: 'say', who: 'partner', emo: 'Crying', text: 'We stood in that square and we CONDEMNED him. An innocent Pokemon, {player}. We helped them do this. ...We fix it. Whatever it costs, we fix it.' },
        ] },
        { t: 'narr', text: 'Then - movement above. A one-eyed silhouette flees the Rift, too fast, too fluid... running on four legs. It turns toward the horizon. Toward the impossible spire on its edge.' },
        { t: 'say', who: 'player', emo: 'Determined', text: 'The Tower of Legends. It\'s going to the Tower of Legends.' },
        { t: 'narr', text: 'You send word to every domain you\'ve ever helped. Then the Gazette lands like a thunderclap: TEAM APEX MARCHES ON THE SHATTERED SHRINE - "WE WILL TAKE A MANTLE AND END THE VOID OURSELVES."' },
        { t: 'renown', type: 'scholar', amt: 6 },
        { t: 'renown', type: 'legend', amt: 6, domain: 'void' },
        { t: 'ap', n: 3 },
        { t: 'skill', name: 'Insight', xp: 40 },
        { t: 'flag', k: 'voidInvestigated', v: true },
      ],
    },
    // ============ CH 15: APEX FALL ============
    {
      id: 'apex-fall', title: 'The Fall of Apex', banner: 'Chapter 15: The Fall of Apex',
      intro: [
        { t: 'bg', v: 'night' },
        { t: 'narr', text: 'The Shattered Shrine: grave of a Mantle whose line of successors died out centuries ago. The old power still sleeps in the broken stones. Slowking\'s warning rings in your ears: a Mantle seized, not given, burns.' },
        { t: 'say', who: 'partner', emo: 'Worried', text: 'They\'re really going to do it. Force a dead Mantle onto themselves and play Living Legend. {player}... a year ago I\'d have called them ambitious. Now I just feel sick. Was I ever that close to being them?' },
        {
          t: 'choice', text: 'Was the partner ever like them?', opts: [
            { text: 'Never. You wanted to matter. They want to own.', effects: [{ t: 'moral', d: 3 }, { t: 'say', who: 'partner', emo: 'Normal', text: '...Yeah. Yeah, okay. Let\'s go save the idiots from themselves.' }] },
            { text: 'Maybe. That\'s why you can talk them down.', effects: [{ t: 'moral', d: 1 }, { t: 'say', who: 'partner', emo: 'Determined', text: 'Ouch. Honest, though. Fine - who better to unhook them from the ledge than someone who\'s seen the view? Let\'s hurry.' }] },
          ]
        },
        { t: 'narr', text: 'Halfway up the approach, the sky above the shrine turns the color of a bruise. The ritual has already begun.' },
      ],
      dungeon: 'shattered-shrine',
      outro: [
        { t: 'bg', v: 'tower' },
        { t: 'narr', text: 'The battle ends. The stolen Mantle-light gutters out of them all at once, and Team Apex collapses among the broken stones - steaming, cracked, small. Weavile\'s ritual-warped claws shrink back into their own shape. The power was already eating what it touched.' },
        { t: 'say', who: 'weavile', emo: 'Pain', text: 'It burns - Bisharp, you said it would CHOOSE us - you said we\'d finally BE somebody - make it stop, MAKE IT STOP -' },
        { t: 'say', who: 'drapion', emo: 'Pain', text: '...can\'t move. Boss. Boss?' },
        { t: 'say', who: 'bisharp', emo: 'Pain', text: '...So this is the view from the top of a shortcut. ...Go on, then. You two have earned the gloat. Everyone... everyone always collects, in the end.' },
        { t: 'say', who: 'partner', emo: 'Angry', text: 'They stole our credit. They sold FEAR. They\'d have burned the whole Void Domain for a headline. And now they want... {player}. Tell me what we do. Because I honestly don\'t know.' },
        {
          t: 'choice', text: 'Team Apex lies broken before you.', opts: [
            { text: 'Pull them out. All three. Now.', effects: [{ t: 'flag', k: 'apexMercy', v: true }, { t: 'moral', d: 6 }, { t: 'renown', type: 'heroic', amt: 8 }, { t: 'narr', text: 'You drag them from the ritual circle one by one and beat the Mantle-fire off their backs. Blissey\'s words in your hands: mercy is refusing to add one more wound.' }, { t: 'say', who: 'bisharp', emo: 'Stunned', text: '...Why. We would not have... I would not have. ...What ARE you two?' }, { t: 'say', who: 'partner', emo: 'Normal', text: 'Somebody, apparently. Turns out you don\'t need a Mantle for it. Can you walk? Good. You\'re going to help us. The REAL enemy is at the Tower.' }] },
            { text: 'They chose this. Take their rescue badge and go.', effects: [{ t: 'flag', k: 'apexMercy', v: false }, { t: 'moral', d: -6 }, { t: 'renown', type: 'outlaw', amt: 5 }, { t: 'narr', text: 'You leave them for the domain wardens to collect from the wreckage. It is justice, probably. The word tastes like ash the whole climb down.' }, { t: 'say', who: 'partner', emo: 'Sad', text: '...We\'re better than them. We are. So why can I hear Blissey sighing from three domains away? ...Forget it. Tower. Now.' }] },
          ]
        },
        { t: 'narr', text: 'In the ritual\'s ashes you find the truth: the rite-fire was SOLD to Apex. Supplied, kindled, aimed. The receipt bears no name - only a paw-print seal, still warm, and a whiff of woodsmoke you would know anywhere.' },
        { t: 'say', who: 'partner', emo: 'Worried', text: 'Warm. Woodsmoke. ...No. No, I\'m not thinking it. We have a Tower to climb and a Void Legend to clear. Whoever this is - they get stopped tomorrow. Sleep first. Big day.' },
        { t: 'renown', type: 'heroic', amt: 5 },
        { t: 'ap', n: 4 },
        { t: 'skill', name: 'Tactics', xp: 40 },
        { t: 'heal' },
      ],
    },
    // ============ CH 16: TOWER OF LEGENDS ============
    {
      id: 'tower-of-legends', title: 'The Tower of Legends', banner: 'Final Chapter: The Tower of Legends',
      intro: [
        { t: 'bg', v: 'tower' },
        { t: 'narr', text: 'The Tower of Legends. The tallest dungeon in the world - the needle where the sky was first sewn to the earth. At its summit, a First Legend can be called. Tonight, the summit is glowing.' },
        { t: 'narr', text: 'The whole world believes Dusknoir is up there, summoning Giratina. The whole world is wrong about half of that. You climb.' },
        { t: 'say', who: 'partner', emo: 'Determined', text: 'Whatever\'s at the top - the frame-job ends tonight. The fear ends tonight. And whoever bought that rite-fire for Apex... they answer for all of it.' },
        { t: 'narr', text: 'Hours up the endless stair, you find it: a side-gallery where the Tower\'s old rite-lines converge. A shortcut. Pour in your relics, burn the domains\' gifts as fuel, and it would fling you straight to the summit.' },
        { t: 'if', cond: () => EOL.systems.moralBand() === 'steady', then: [
          { t: 'say', who: 'partner', emo: 'Normal', text: 'A shortcut. Burn everything the domains trusted us with, arrive fast and hollow. ...You know, a year ago I\'d have been halfway in the circle by now.' },
          { t: 'say', who: 'partner', emo: 'Happy', text: 'Every relic in this bag is a Pokemon who believed in us. That\'s not fuel, {player}. That\'s the whole point. We take the stairs. TRY to keep up.' },
          { t: 'moral', d: 2 },
        ] },
        { t: 'if', cond: () => EOL.systems.moralBand() === 'wavering', then: [
          { t: 'say', who: 'partner', emo: 'Worried', text: 'We could be up there in MINUTES. Every step we waste, the summoning gets closer. It\'s just... stuff, right? Relics. Souvenirs. The domains would understand. {player}?' },
          { t: 'say', who: 'player', emo: 'Normal', text: 'Look at the relics. Really look. Lilligant\'s trust. Luxray\'s roar. Blissey\'s soup. You want to arrive at the most important moment of our lives having burned all of it?' },
          { t: 'say', who: 'partner', emo: 'Sigh', text: '...No. No, I don\'t. Stars, I hate how good you are at that. Stairs. Come on. If we die of stair-climbing I\'m blaming you.' },
          { t: 'moral', d: 3 },
        ] },
        { t: 'if', cond: () => EOL.systems.moralBand() === 'desperate', then: [
          { t: 'say', who: 'partner', emo: 'Angry', text: 'I\'m doing it. Give me the bag. GIVE me the bag, {player}! Apex cheated, Arcanine glowed, the whole world cheered for liars while we took the STAIRS! Just once - JUST ONCE - the shortcut is OURS!' },
          { t: 'narr', text: 'You grab their paw inside the bag and hold it. Firmly. Gently. The way you have this entire journey.' },
          { t: 'say', who: 'partner', emo: 'Crying', text: '...Let go. Please let go. If we\'re slow we lose EVERYTHING. ...Why won\'t you ever let me become the thing that wins?!' },
          { t: 'say', who: 'player', emo: 'Sad', text: 'Because I came on this journey to keep YOU. Not the winning. You. That was the whole deal, remember? Berries, clipboard, you.' },
          { t: 'say', who: 'partner', emo: 'Crying', text: '...You absolute... fine. FINE. Stairs. ...Don\'t let go yet, though. Just for a minute. Don\'t let go.' },
          { t: 'moral', d: 8 },
        ] },
        { t: 'narr', text: 'You leave the shortcut cold and dark behind you, and climb.' },
      ],
      dungeon: 'tower-of-legends',
      outro: [
        // --- after the summit battle: the truth, in full ---
        { t: 'bg', v: 'tower' },
        { t: 'narr', text: 'The summit. A ring of standing stones under a sky with too many stars. The battle - the hardest of your lives - is over. The Dusknoir disguise lies in rags. Three villains kneel among the stones, beaten... and, horribly, still smiling.' },
        { t: 'say', who: 'zoroark', emo: 'Happy', text: 'Costumes! You noticed the COSTUMES back at the Rift! Oh, I like you two. A year of theater, a whole world of critics, and my one good review arrives with the closing act.' },
        { t: 'say', who: 'partner', emo: 'Stunned', text: 'Zoroark. The Nightmare Legend. The disasters, the witnesses, the trial - every Void sighting - it was YOU. It was you the entire time.' },
        { t: 'say', who: 'zoroark', emo: 'Normal', text: 'Not the ENTIRE time. Every performance needs a producer, little heroes. And a patron. Surely you\'ve guessed. You\'ve smelled the woodsmoke since the Shrine.' },
        { t: 'narr', text: 'Arcanine rises from where the battle threw him. Even beaten, the warmth rolling off him is the same golden warmth that carried you out of a burning hollow, a lifetime ago.' },
        { t: 'say', who: 'arcanine', emo: 'Normal', text: 'You fought the honest way, too. Of course you did. Every stair, every blow. ...I genuinely hoped you two would be elsewhere tonight.' },
        { t: 'say', who: 'partner', emo: 'Stunned', text: 'No. No no no. You SAVED us. You carried Sunkern out of the fire, you - you\'re the reason we EXIST! Tell me the illusionist is wearing your face! TELL ME!' },
        { t: 'say', who: 'houndoom', emo: 'Normal', text: 'He isn\'t. Houndoom, Death Legend. For the record, pups, he wanted you kept clear of this. Sentiment. It\'s his one flaw.' },
        { t: 'say', who: 'arcanine', emo: 'Sad', text: 'Look at what the Mantles have become. Nurses. Mail-sorters. BELLS. Caretakers of a world that yawns at miracles. When the gods were REAL, the world knelt. It FELT something. We are going to make it feel again.' },
        { t: 'say', who: 'arcanine', emo: 'Determined', text: 'Darkrai. Yveltal. Giratina. Nightmare, Death, and the Void - the three the world still fears in its bones. When they return, awe returns. And I asked you, once: do you want to be remembered? I MEANT it.' },
        { t: 'say', who: 'partner', emo: 'Crying', text: 'We papered our WALLS with you. Every rescue, every speech - {player}, I dragged us across the world chasing HIM... A curated hero. A recruitment poster. Was ANY of it real?!' },
        { t: 'say', who: 'arcanine', emo: 'Normal', text: 'The rescues were real. Real enough. That is what none of you ever understood - a lie needs no fire, if the fire itself will lie.' },
        { t: 'narr', text: 'Behind the kneeling trio, the summoning circle flares. There is nothing left to say - and nothing left to fight. Only the thing they started.' },
        // --- the summoning ---
        { t: 'say', who: 'zoroark', emo: 'Happy', text: 'Oh, don\'t look so proud. You beat the cast, darlings. The show was already over. Curtain\'s been rising this whole time.' },
        { t: 'narr', text: 'The summit answers. The circle you never stopped BURNS. The sky folds open like a wound, and three shapes are dragged through it - screaming.' },
        { t: 'say', who: 'darkrai', emo: 'Pain', text: 'RELEASE... US... we do not... CONSENT...' },
        { t: 'say', who: 'yveltal', emo: 'Pain', text: 'WHO DARES... drag death... from its REST...' },
        { t: 'say', who: 'giratina-origin', emo: 'Pain', text: 'THE CHAIN... PULLS... WE DID NOT CHOOSE THIS...' },
        { t: 'say', who: 'houndoom', emo: 'Surprised', text: '...They\'re resisting? Zoroark. ZOROARK. Why are the gods RESISTING?' },
        { t: 'say', who: 'arcanine', emo: 'Stunned', text: 'They... they were meant to come in glory. Not in chains. Not SCREAMING. This isn\'t - this was not the design...' },
        { t: 'narr', text: 'The First Legends thrash against the summoning like storm-tide against a harbor wall. Reality peels at the summit\'s edges. This is beyond you. This is beyond anyone alone.' },
        // --- allies arrive ---
        { t: 'say', who: 'dusknoir', emo: 'Determined', text: 'THEN IT IS FORTUNATE... that no one came alone. HOLD, Great Ones! The Void Gate stands with you!' },
        { t: 'narr', text: 'Dusknoir rises over the summit stair - and behind him, wingbeat by wingbeat, pawstep by pawstep, the domains you served arrive.' },
        { t: 'if', cond: 'seedCleared', then: [{ t: 'say', who: 'lilligant', emo: 'Determined', text: 'Roots, HOLD! You do not fall while the green remembers you, little sprouts!' }] },
        { t: 'if', cond: 'stormCleared', then: [{ t: 'say', who: 'luxray', emo: 'Shouting', text: 'HA! NOW this is a sky worth roaring at! Storm stands with the stair-climbers!' }] },
        { t: 'if', cond: 'dreamCleared', then: [{ t: 'say', who: 'musharna', emo: 'Normal', text: 'Mm... I have brought the first dream... there is room in it... even for frightened gods...' }] },
        { t: 'if', cond: 'landCleared', then: [{ t: 'say', who: 'torterra', emo: 'Normal', text: 'The mountain has arrived. It is in no hurry. Neither shall the sky be permitted to fall.' }] },
        { t: 'if', cond: 'skyCleared', then: [{ t: 'say', who: 'corviknight', emo: 'Normal', text: 'Hmph. Ground-walkers holding up the heavens. Fine. The Sky Domain catches those who fall - ALL of them.' }] },
        { t: 'if', cond: 'seaCleared', then: [{ t: 'say', who: 'milotic', emo: 'Determined', text: 'The tide has come in, dears. Gracefully. Now - gently, everyone. They are frightened guests, not enemies.' }] },
        { t: 'if', cond: 'moonCleared', then: [{ t: 'say', who: 'umbreon', emo: 'Normal', text: 'Told you to watch the feet. Nobody watches the feet. ...The night watch is here. Let\'s put the gods to bed.' }] },
        { t: 'if', cond: 'frozenCleared', then: [{ t: 'say', who: 'froslass', emo: 'Normal', text: 'The glacier remembers. And it is watching, thief. It is watching everything you made them do.' }] },
        { t: 'if', cond: 'lifeCleared', then: [{ t: 'say', who: 'blissey', emo: 'Determined', text: 'Coming through, dears! Nobody dies at MY altitude! That includes gods, thank you very much!' }] },
        { t: 'if', cond: 'spaceCleared', then: [{ t: 'say', who: 'orbeetle', emo: 'Normal', text: 'From high enough, even gods are small and frightened. Give them ROOM. I shall bend some.' }] },
        { t: 'if', cond: 'timeCleared', then: [{ t: 'say', who: 'bronzong', emo: 'Normal', text: 'NOW... IS THE ECHO... CHOSEN.' }] },
        { t: 'if', cond: 'apexMercy', then: [{ t: 'say', who: 'bisharp', emo: 'Determined', text: 'Team Apex, forming up on the SLOW team. Weavile, Drapion - tonight we finally arrive somewhere worth arriving. MOVE!' }] },
        { t: 'narr', text: 'Living Legends and ordinary Pokemon lock their strength into one great containment - a net of light, life, dream, tide, stone, frost, and time thrown across three thrashing gods. Slowly - impossibly - the wound in the sky begins to close.' },
        { t: 'say', who: 'zoroark', emo: 'Stunned', text: 'No. No, the script doesn\'t END this way - where did they all COME from?!' },
        { t: 'say', who: 'umbreon', emo: 'Normal', text: 'They earned them, mostly on page six. You wouldn\'t understand.' },
        // --- the sacrifice ---
        { t: 'narr', text: 'The First Legends sink back toward the closing sky. But dying storms strike hardest. Three powers - nightmare, death, and void - snarl together into one final, falling blow. And it falls toward the one small Pokemon shouting encouragement at the front.' },
        { t: 'say', who: 'player', emo: 'Determined', text: '{partner} - MOVE -' },
        { t: 'narr', text: 'You are the one who notices what others overlook. You have always been. You are moving before the thought finishes. It is the easiest choice you have ever made.' },
        { t: 'say', who: 'partner', emo: 'Stunned', text: '{player}?! {PLAYER}!!' },
        { t: 'narr', text: 'Light. Then quiet. Then nothing at all.' },
        // --- mourning ---
        { t: 'bg', v: 'night' },
        { t: 'narr', text: 'The sky is closed. The gods are freed. The Tower is silent. And in the center of the summit, the partner is holding something very still and very small, and screaming at it to wake up.' },
        { t: 'say', who: 'partner', emo: 'Crying', text: 'You don\'t get to do this. YOU DON\'T GET TO DO THIS! You take the stairs! You count the berries! You come home, that was the DEAL - {player}, PLEASE -' },
        { t: 'say', who: 'dusknoir', emo: 'Sad', text: '...I keep the gate the dead pass through. I know its sound too well. Little one... I am so sorry. They have gone where even the Void Legend cannot reach.' },
        { t: 'say', who: 'partner', emo: 'Crying', text: 'Then what was it FOR?! All the stairs, all the pages-six, all the doing it RIGHT - if the world takes them anyway, what was ANY of it for?!' },
        { t: 'narr', text: 'And the summit answers. Softly. One voice at a time.' },
        { t: 'narr', text: 'A Pelipper remembers a team that told the true story, and the villagers it kept warm. A Snorunt remembers someone who waited an hour in the cold, and never looked impatient.' },
        { t: 'narr', text: 'Lilligant remembers paws that protected instead of claimed. Blissey remembers two hundred names carried up a mountain. Torterra remembers who held the stone, no matter who stood on it after.' },
        { t: 'if', cond: 'trustedDusknoir', then: [{ t: 'narr', text: 'Dusknoir remembers a voice in a square full of torches - the only voice - saying: the evidence is too neat. He remembers what it costs to spend a good name on a condemned one.' }] },
        { t: 'if', cond: 'apexMercy', then: [{ t: 'say', who: 'bisharp', emo: 'Crying', text: 'They pulled us out. We gave them NOTHING for years and they pulled us out. ...Stand up, all of you. Apex doesn\'t kneel. But for this one... Apex bows.' }] },
        { t: 'narr', text: 'Small acts. A thousand of them, laid end to end across a whole world. Not one performed for an audience. The summit fills with them like water filling a bowl - and the old summoning circle, built for fear... begins to glow with something else entirely.' },
        { t: 'say', who: 'zoroark', emo: 'Stunned', text: 'The circle - it\'s LIT! Who is summoning?! NOBODY IS CASTING THE RITE - WHO IS SUMMONING?!' },
        { t: 'say', who: 'bronzong', emo: 'Normal', text: 'EVERYONE.' },
        // --- resurrection ---
        { t: 'bg', v: 'dawn' },
        { t: 'narr', text: 'The light does not tear the sky. It opens it, the way morning does. Three figures step through as if they had merely been waiting to be wanted: a stag crowned in living light. A swan wrapped in gentle moonlight. And above them both, something older than domains.' },
        { t: 'say', who: 'xerneas', emo: 'Normal', text: 'A life spent noticing others. We noticed back, small one. LIFE - returns to you.' },
        { t: 'say', who: 'cresselia', emo: 'Normal', text: 'A spirit that steadied every heart it touched, and asked nothing. SPIRIT - burn bright again, and gently, as you always did.' },
        { t: 'say', who: 'arceus', emo: 'Normal', text: 'The world was not saved by a god today. It was saved by a thousand small kindnesses wearing one small face. POWER - not as reward. As trust. Carry it as you carried the berries: carefully, and for everyone.' },
        { t: 'narr', text: 'The three are gone between one heartbeat and the next. And on the cold stone of the summit... fingers twitch. Eyes open. Somewhere very close, somebody makes a sound like a kettle and a sob at the same time.' },
        { t: 'say', who: 'partner', emo: 'Joyous', text: '{player}!! You absolute - you COUNTED BERRIES at me for YEARS and then you go and - don\'t you EVER - oh, shut up, come here. Come HERE.' },
        { t: 'say', who: 'arcanine', emo: 'Crying', text: '...Awe. There it is. All my life chasing it in the old dead fires... and it was standing in my smoke that first day, counting Sunkern. ...Do what you will with me. I have seen the real thing now.' },
        { t: 'say', who: 'partner', emo: 'Happy', text: 'Let\'s go home, {player}. The long way. The stairs. I hear the view is legendary.' },
        { t: 'renown', type: 'legend', amt: 40 },
        { t: 'flag', k: 'mainGameClear', v: true },
        { t: 'heal' },
      ],
    },
  ];

  // ---------- endings ----------
  C.endings = {
    'new-accord': [
      { t: 'bg', v: 'dawn' },
      { t: 'narr', text: 'ENDING: THE NEW ACCORD' },
      { t: 'narr', text: 'Towns, guilds, and Living Legends gather at Mythfall\'s monument. For the first time since the First Legends, the domains choose their protectors together - and Void banners fly among the rest.' },
      { t: 'say', who: 'partner', emo: 'Happy', text: 'They\'re carving names today. Ours too. But you know what? I stopped needing it somewhere along the way. Weird, right?' },
    ],
    'peoples-legend': [
      { t: 'bg', v: 'dawn' },
      { t: 'narr', text: 'ENDING: THE PEOPLE\'S LEGEND' },
      { t: 'narr', text: 'No Mantle. No title. Just a team every town knows by deed, not decree. Ordinary Pokemon, extraordinary proof that the world doesn\'t need gods to be safe.' },
      { t: 'say', who: 'partner', emo: 'Happy', text: 'Kids keep asking for the story where you take the hit. I always tell the one where you waited out a shy Snorunt instead. It\'s the same story, really.' },
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
      { t: 'say', who: 'bisharp', emo: 'Normal', text: 'History doesn\'t record who deserved. Only who arrived. ...We\'re working on arriving at better places. Your team taught us the route.' },
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
