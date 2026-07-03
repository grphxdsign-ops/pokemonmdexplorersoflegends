# PMD Series Research: Architecture and Game Design of Every Mainline Entry

Research reference for *Explorers of Legends*. Covers all six mainline Pokémon Mystery Dungeon
releases and distills the mechanical core a faithful browser recreation must implement.

**Sourcing note (2026-07-03):** Research was performed through a proxied environment where direct
page fetches to Bulbapedia, Wikipedia, StrategyWiki and the UPC archive were blocked (HTTP 403 at
the proxy), so facts were cross-checked via web search result extracts of those same pages plus
Serebii/GameFAQs/Neoseeker damage guides. Canonical URLs are cited inline regardless. Items that
could not be re-verified from a live source are flagged `[unverified]` — treat those as
high-confidence recollection to be confirmed against the cited page before implementation.

Key general sources:

- Series overview: https://bulbapedia.bulbagarden.net/wiki/Pok%C3%A9mon_Mystery_Dungeon_series
- Shared mechanics: https://bulbapedia.bulbagarden.net/wiki/Mystery_Dungeon_game_mechanics
- Stats: https://bulbapedia.bulbagarden.net/wiki/Stat_(Mystery_Dungeon)
- Battle system: https://bulbapedia.bulbagarden.net/wiki/Pok%C3%A9mon_battle_(Mystery_Dungeon)
- Rescue Team damage guide: https://gamefaqs.gamespot.com/gba/929408-pokemon-mystery-dungeon-red-rescue-team/faqs/75111/damage-mechanics
- Explorers damage guide: https://gamefaqs.gamespot.com/ds/955859-pokemon-mystery-dungeon-explorers-of-sky/faqs/75112/damage-mechanics-guide
- Explorers of Sky damage calculator (decomp-derived): https://usernamefodder.github.io/damage-eos/

---

## 0. Series-wide mechanical chassis

Every mainline PMD shares one chassis; the per-game sections below mostly describe deltas.

- **Grid + turns.** 8-directional movement on a tile grid. The whole floor advances one "game
  turn" each time the leader moves, attacks, or uses an item; allies and enemies then act in
  order. Speed is not a stat — it is a per-Pokémon *speed stage* (from Agility, Slow traps, etc.)
  granting extra or skipped turns.
- **Randomized floors.** Each floor is generated as rooms connected by corridors, seeded with
  items, traps, enemies, sometimes a Kecleon shop or Monster House, and one staircase. Reaching
  the stairs advances the floor; dungeons are N floors deep (up to 99).
- **Four moves + regular attack.** Each Pokémon knows up to 4 moves with individual PP; a weak
  typeless "regular attack" (A button) costs no PP. Elixirs restore PP.
- **Belly.** The leader has a Belly gauge (default max 100) that drains as turns pass; at 0 the
  leader loses HP each turn. Apples refill it; Big Apples raise max. Allies have no belly drain
  (enemy/ally belly exists internally but only the leader's matters in normal play).
- **Fail state.** If the leader (or in some entries, the whole team / an escort) faints, the team
  is ejected from the dungeon, losing all carried money and some-to-all inventory items (exact
  loss varies by game). Player-to-player rescue can cancel the loss in most entries.
- **Wind.** A hidden per-floor turn limit: after ~1000+ turns warnings escalate and the team is
  blown out of the dungeon (counts as a wipe). `[unverified: exact turn counts vary per floor]`
- **Move ranges.** Every damaging move resolves in one of a small set of range shapes: front tile
  (with/without corner-cutting), front up to 2 tiles, straight line (up to 10 tiles), all adjacent
  tiles ("around"), entire room, entire floor, self, all allies, all party members in room. This
  taxonomy is stable across the entire series.
- **Type chart era.** Each game uses the chart of its generation (see table in §8), but with
  compressed multipliers: super effective ≈ ×1.4, not very effective ≈ ×0.7, stacking
  multiplicatively for dual types; several "immune" matchups deal reduced (×0.25–0.5) rather than
  zero damage in the GBA/DS entries per the damage guides above. `[unverified: per-game immunity
  handling should be checked against the damage guides]`
- **Terrain mobility classes.** Tiles are ground / water / lava / chasm. Water types cross water,
  Fire types cross lava, Flying/levitators cross everything open, Ghost types pass through walls
  (at accelerated belly drain).
- **Weather.** Clear, Sunny, Rain, Hail, Snow, Sandstorm, Fog, Cloudy (± Random); chip damage and
  move boosts broadly mirror the main series, with PMD-specific effects (e.g. Cloudy weakens
  non-Normal moves). Abilities and Weather Orbs manipulate it.
- **UI conventions.** Message log at the bottom; dialogue in text boxes with emotive character
  portraits; toggleable minimap overlay showing rooms, stairs, item dots, and (with vision) enemy
  dots; menus for Moves (name, PP, range), Items (toolbox), Team, Tactics; "Others" for options.
- **Evolution never happens mid-dungeon.** It is always a deliberate act at a hub facility (or
  removed entirely, in PSMD) and in most entries is gated to the postgame.

---

## 1. Pokémon Mystery Dungeon: Red Rescue Team & Blue Rescue Team (2005/2006, GBA & DS)

Source: https://bulbapedia.bulbagarden.net/wiki/Pok%C3%A9mon_Mystery_Dungeon:_Red_Rescue_Team_and_Blue_Rescue_Team ·
https://www.neoseeker.com/pokemon-mystery-dungeon-blue/faqs/2818083-pokemon-md-mechanics.html

- **Story framing.** A human wakes as a Pokémon (species set by a personality quiz across 16
  possible starters; partner chosen from a second pool) amid a wave of natural disasters. Acts:
  rescue-team tutorial chapters → Gengar's "cursed human" legend turns the town against the hero
  (fugitive arc) → Groudon → Rayquaza atop Sky Tower destroying the falling star. Post-credits,
  the hero remains a Pokémon.
- **Dungeon generation.** Baseline chassis (§0). Fixed boss floors punctuate story dungeons.
  Kangaskhan Rocks (mid-dungeon storage rest stops) appear in some long dungeons. Monster Houses
  and in-dungeon Kecleon Shops (stealing triggers the infamous shopkeeper aggro) debut here.
- **Battle mechanics.** Stats: HP, Attack, Defense, Sp. Atk, Sp. Def (no Speed stat; speed stages
  instead), plus IQ and Belly (https://bulbapedia.bulbagarden.net/wiki/Stat_(Mystery_Dungeon)).
  Damage (per the GameFAQs/Neoseeker guides): a fixed-point polynomial in attack minus defense —
  `floor(2*(((A−D)/8) + (L*43690/65536)) − D + 10 + ((((A−D)/8)+(L*43690/65536))^2)*(3276/65536))`
  with L = attacker level, then move power, type, STAB (×1.5), and a small random spread applied.
  Gen III type chart (no Fairy; Steel resists Ghost/Dark).
- **Linked moves.** Gulpin Link Shop lets you chain 2+ moves to execute in a single turn (each
  consuming PP, later links losing accuracy `[unverified]`). Unique selling point of this entry
  and its remake-adjacent systems.
- **Turn system / party.** Leader acts, allies and enemies follow. Party limit: leader + 2
  teammates (3 total) with a body-size budget of 6. Ally AI is autonomous, tuned via IQ skills
  (no per-turn ally control; the Tactics command menu arrives in Explorers). `[unverified: RT AI
  control granularity]`
- **Recruitment.** A defeated wild Pokémon may ask to join **only if the leader lands the final
  blow**, the species' Friend Area is owned, and there is room. Chance = species base rate
  (roughly −33% to +99% depending on species) modified by leader level and the Friend Bow (+10%).
  Recruits above the party cap wait at Friend Areas — themed habitats purchased from the
  Wigglytuff Club (https://bulbapedia.bulbagarden.net/wiki/Friend_Area).
- **Progression.** Standard EXP levels to 100. IQ raised by feeding Gummis (flavor matched to the
  species' IQ group determines gain); IQ thresholds unlock passive IQ skills (item pickup
  behaviors, trap awareness, course correction, etc.). Evolution: Luminous Cave, postgame only,
  entered alone.
- **Hub.** Pokémon Square + the team base. Facilities: Kecleon Shop/Wares, Kangaskhan Storage,
  Felicity Bank (money kept in bank survives wipes), Gulpin Link Shop, Makuhita Dojo (training
  mazes), Wigglytuff Club (Friend Areas), Pelipper Post Office.
- **Jobs/rescues.** Bulletin board at the Post Office + mail delivered to the base. Mission types:
  rescue, escort, item find/delivery, later outlaw-style objectives. Rewards + Rescue Points drive
  team rank (Normal → Lucario). Wonder Mail passwords encode missions.
- **Multiplayer.** The signature "friend rescue": when you faint you can send an SOS Mail (54-char
  password on GBA, or link/wireless); another player clears the floor, sends A-OK Mail, and you
  resume with inventory intact. Also GBA↔DS cross-save link play.
- **Postgame.** The template legendary-hunt postgame: Buried Relic (Regis/Mew), Silver Trench
  (Lugia), Sky Pillar, Wish Cave (Jirachi, 99F), Purity Forest (99F, entry at level 1, no items —
  the archetypal "reset challenge dungeon"), Meteor Cave (Deoxys), Luminous Cave evolution
  unlock, Mewtwo. Dozens of optional dungeons dwarf the main story's length.

---

## 2. Explorers of Time / Darkness (2007-08) & Explorers of Sky (2009), DS

Source: https://bulbapedia.bulbagarden.net/wiki/Pok%C3%A9mon_Mystery_Dungeon:_Explorers_of_Time_and_Explorers_of_Darkness ·
https://bulbapedia.bulbagarden.net/wiki/Pok%C3%A9mon_Mystery_Dungeon:_Explorers_of_Sky ·
Damage: https://www.neoseeker.com/pokemon-mystery-dungeon-explorers-of-darkness/faqs/2818085-pokemon-mystery-dungeon-dt-damaget.html

- **Story framing.** Amnesiac human-turned-Pokémon joins Wigglytuff's Guild as an apprentice with
  a partner. Structure: guild-apprentice episodic chapters (with daily briefing/sentry-duty
  rhythm) → Time Gears theft arc (Grovyle) → dark-future arc (Dusknoir twist, planet's paralysis)
  → Temporal Tower/Primal Dialga → celebrated postgame epilogue (Darkrai arc). Sky adds five
  playable Special Episodes told from side characters' viewpoints — the series' storytelling
  high-water mark and the tonal reference for this project.
- **Dungeon generation.** Same chassis; adds hidden Secret Bazaars/Secret Rooms `[Sky]`, spinda
  drink ingredients, and Sky's hidden treasure content.
- **Battle mechanics.** Damage formula (per the guides above):
  `DAMAGE = ((A + P) * (39168/65536) − D/2 + 50 * ln(10 * ((A − D)/8 + L + 50)) − 311) / Y`
  where A/D are the relevant attack/defense stats after stage modifiers, P is move power, L is
  attacker level, the ln argument is clamped (to [1, 4095] `[unverified]`), Y is a scaling
  divisor differing for player vs. enemy attacks `[unverified]`, then STAB ×1.5, compressed type
  multipliers (×1.4 / ×0.7), critical hits, and a small random spread (~±10%) apply. The
  decomp-based calculator at https://usernamefodder.github.io/damage-eos/ is the best
  implementation reference. Gen IV type chart and physical/special-per-move split.
- **Turn system / party.** Up to 4 party members (body-size budget 6). Adds the **Tactics** menu
  ("Let's Go Together", "Go After Foes", "Avoid the First Hit", "Wait There", etc.) for ally AI.
- **Recruitment.** Leader's final blow; recruits join automatically via Chimecho Assembly —
  Friend Areas no longer purchased. Base rates modified by leader level, Friend Bow, Fast Friend
  IQ skill, and Sky's Golden Mask/Amber Tear exploration-team items `[unverified: exact %s]`.
- **Progression.** Levels + IQ matured: species sorted into IQ groups A–J; Gummi flavor vs. group
  determines IQ gain; skills can now be toggled on/off; Spinda's Café (Sky) juices Gummis for
  bigger gains and recycles items. Exclusive items (1–3★ species/family gear) added in Sky.
  Explorer Rank (Normal → Master → Guildmaster) gates job difficulty and Treasure Bag size.
- **Hub.** Treasure Town + Wigglytuff's Guild (lower floors: job boards, mess hall, rooms).
  Facilities: Duskull Bank, Kangaskhan Storage, Kecleon Market, Xatu Appraisal (locked boxes),
  Electivire Link Shop (linked moves retained), Chansey Day Care, Marowak Dojo, Spinda's Café
  (Sky), Croagunk's Swap Shop.
- **Jobs.** Two boards: Job Bulletin Board (rescues/deliveries/escorts) and Outlaw Notice Board
  (bounty hunts with Magnezone). Jobs ranked E→S+; Wonder Mail (Sky: Wonder Mail S) codes.
- **Multiplayer.** SOS rescue via password or Nintendo WFC; Sky adds Sky Gifts sendable between
  players. `[unverified: WFC specifics, service now defunct]`
- **Postgame.** Extensive: Manaphy egg questline, Seven Treasures dungeons, Zero Isle series
  (level-1/no-item challenge variants), Marine Resort, Shaymin's Sky Peak (Sky), Destiny Tower
  (Sky: 99F, solo, level 1 — Purity Forest's successor), plus the playable epilogue that resolves
  the main cast's arcs before the challenge content begins.

---

## 3. WiiWare "Adventure Squad" trilogy — Blazing! / Stormy! / Light! Adventure Squad (2009, Japan only)

Source: https://bulbapedia.bulbagarden.net/wiki/Pok%C3%A9mon_Mystery_Dungeon_(WiiWare) ·
https://strategywiki.org/wiki/Pok%C3%A9mon_Mystery_Dungeon_(WiiWare) ·
https://en.wikipedia.org/wiki/Pok%C3%A9mon_Mystery_Dungeon:_Adventure_Team

- **What they are.** Three cheap, largely identical downloadable games (released 2009-08-04,
  Japan only, never localized) differing in starter pools (fire/red, water/blue, electric/yellow
  themed), recruitable species, and dungeons. Story is minimal — build up an adventure squad and
  challenge landmark dungeons; version-mascot legendaries (e.g. Groudon, Lugia) serve as bosses
  and are 100%-recruit rewards. No human-turned-Pokémon framing; no quiz.
- **Dungeon generation & core loop.** Same chassis as Explorers (belly, PP, floors, traps).
  Bulbapedia frames the loop as managing "time, food, and PP"; empty belly = HP loss per turn.
- **Signature mechanic — Pokémon Tower.** Party members can stack on each other's shoulders,
  moving as one unit and attacking simultaneously; Pokémon in a tower can learn Egg Moves by
  repeatedly watching a tower-mate use them. (A design curiosity; no later game kept it.)
- **Recruitment.** Defeat-based like the DS games: chance depends on leader level, target
  species, and Friend Bow; Kecleon fixed at 0.1%; bosses 100%. Shiny Pokémon appear as rare
  recruits with a 200 max belly instead of 100.
- **Progression/hub.** Levels only — no IQ system `[unverified]`. Hub is a simple squad garden/HQ
  with storage and shop facilities rather than a town `[unverified: facility list]`. Gen I–IV
  species subset per version. Wii Remote pointer-friendly menus; simplified UI.
- **Multiplayer/postgame.** Rescue-password support and bonus dungeons exist but content volume
  is far below the retail games `[unverified]`.
- **Takeaway for this project.** Mostly a historical footnote proving the chassis survives heavy
  content reduction; Pokémon Tower is the only novel system.

---

## 4. Pokémon Mystery Dungeon: Gates to Infinity (2012, 3DS)

Source: https://bulbapedia.bulbagarden.net/wiki/Pok%C3%A9mon_Mystery_Dungeon:_Gates_to_Infinity ·
https://www.serebii.net/dungeoninfinity/mechanics.shtml · https://www.serebii.net/dungeoninfinity/teamskills.shtml

- **Story framing.** Human summoned (not amnesiac-transformed by accident — answering a plea) into
  a Pokémon body; five fixed starters, **no personality quiz** (first entry to drop it). Builds
  Pokémon Paradise with partner; Munna's deception, the Voice of Life (Hydreigon), and the
  Bittercold finale. Smallest roster in series history: only ~144 species, almost all Gen V.
- **Dungeon generation.** Chassis intact, in 3D. Adds destructible walls via moves `[unverified]`,
  treasure boxes, and **Magnagates**: AR camera scanning of real-world round objects generates
  bespoke dungeons.
- **Battle mechanics.** Gen V type chart. Damage model follows the Explorers lineage with retuned
  constants `[unverified — no public formula doc as thorough as the DS games']`. Team size up to
  4. No linked moves.
- **Belly.** **Removed from almost all dungeons**; hunger only returns in certain postgame
  dungeons (confirmed via Bulbapedia/serebii extracts). Widely criticized; PSMD reverted this.
- **Recruitment.** Defeated Pokémon may request to join (leader final blow requirement relaxed
  `[unverified]`); recruits populate Paradise. No Friend Areas — Paradise land is developed
  instead.
- **Progression.** IQ abolished. **Team Skills** — party-wide passive skills (trap awareness,
  type-effective AI bias, etc.) sourced from party composition/found unlocks — replace it
  (https://www.serebii.net/dungeoninfinity/teamskills.shtml). **V-Wave**: a daily random type
  receives a global boost; changeable via Victini's V-Roulette. Levels otherwise standard.
- **Hub.** Pokémon Paradise: the player *builds* facilities (shops, dojos, berry fields, gift
  studios) on cleared land — the series' first player-constructed hub and the direct ancestor of
  this project's base-building ideas.
- **Jobs.** Request board at Paradise (Quagsire) `[unverified: NPC]`; **Companion Mode** lets you
  play as non-hero Paradise members to run side jobs while the main story pauses.
- **Multiplayer.** First paid DLC dungeons in the series; local wireless co-op is absent and the
  classic faint-rescue system is dropped `[unverified — confirm no rescue feature]`.
- **Postgame.** Continued story chapters after the Bittercold, extra dungeons, Magnagate content,
  DLC. Generally considered the shallowest retail postgame of the series.
- **Takeaway.** A cautionary entry: cutting belly, roster breadth, and job variety hurt the
  identity; but Paradise-building, V-Wave, and Companion Mode are worthwhile ideas.

---

## 5. Pokémon Super Mystery Dungeon (2015, 3DS)

Source: https://bulbapedia.bulbagarden.net/wiki/Pok%C3%A9mon_Super_Mystery_Dungeon ·
https://www.serebii.net/supermysterydungeon/mechanics.shtml · https://www.serebii.net/supermysterydungeon/emera.shtml

- **Story framing.** Human-turned-Pokémon child in Serene Village (school-life opening chapters),
  20 possible hero/partner species (quiz suggests, player may override — a good compromise
  pattern). Mid-game move to Lively Town's **Expedition Society**; Beheeyem pursuit, mass
  petrification of allies, Nuzleaf/Yveltal betrayal, Dark Matter at the Tree of Life finale.
  All 720 then-existing species appear and can become allies.
- **Dungeon generation.** Chassis intact; adds continent travel (Water/Air/Grass/Mist/Sand
  continents via Lapras Travel Liner), distress-signal expedition targets, and harsher
  ambush/Monster House pacing.
- **Battle mechanics.** Gen VI chart (Fairy debuts in PMD). **Alliances**: adjacent team members
  can attack together in one turn for combined damage (enemies can ally too); costs extra belly.
  **Wands** debut (stackable throwable utility items: Pounce, Stayaway, etc.). **Moves level up
  with use**, gaining power/PP/accuracy — replaces Ginseng-style single boosts as the main move
  progression `[unverified: exact growth table]`.
- **Belly.** Restored in **all** dungeons and made stricter: faster drain, food restores less,
  larger HP cost at zero, and alliance/push actions drain extra belly (confirmed via Bulbapedia
  extract).
- **Recruitment.** **Defeat-recruitment removed.** Allies are gained via the **Connection Orb**:
  a social-graph UI where completing preset missions/expeditions connects you to specific
  Pokémon, who can then be summoned as party members. Recruited legendaries included. This is the
  series' biggest recruitment redesign — and was partially rolled back in DX.
- **Progression.** No IQ. **Looplets + Emeras**: looplets are held ring items with notches;
  emeras are gems found only inside dungeons that slot into notches granting effects (Type Bulldozer,
  Barrage, Awakening — temporary Mega Evolution — etc.); **all emeras vanish on dungeon exit**,
  making power-ups run-scoped roguelike resources (https://www.serebii.net/supermysterydungeon/emera.shtml).
  Evolution is removed entirely outside story events.
- **Hub.** Serene Village (early) then Lively Town: Expedition Society HQ (Ampharos), Kecleon
  Shop, Cofagrigus Storage `[unverified: NPC]`, Hawlucha's Slam School (move tutoring/training),
  café. Progression through Expedition Ranks.
- **Jobs.** Connection Orb replaces bulletin boards as the job interface; jobs and story
  expeditions share the map-based selection flow.
- **Multiplayer/rescue.** Pelipper Island: password/StreetPass-based player rescues return after
  GtI dropped them.
- **Postgame.** Substantial: continued story beats, hero/partner temporarily leave the roster
  (notorious twist), Tree of Life ascent, Destiny Tower returns, completing the Connection Orb to
  all 720 species as the long-tail goal.
- **Takeaway.** The most roguelike-leaning balance pass (harsh belly, run-scoped emeras) and the
  strongest "every Pokémon matters" fantasy, at the cost of classic recruit-on-defeat serendipity.

---

## 6. Pokémon Mystery Dungeon: Rescue Team DX (2020, Switch)

Source: https://bulbapedia.bulbagarden.net/wiki/Pok%C3%A9mon_Mystery_Dungeon:_Rescue_Team_DX ·
https://www.serebii.net/dungeonrescueteamdx/mechanics.shtml ·
https://game8.co/games/pokemon-mystery-dungeon-dx/archives/280924 · damage: https://game8.co/games/pokemon-mystery-dungeon-dx/archives/281399

- **What it is.** Ground-up Switch remake of Red/Blue Rescue Team (storybook watercolor art),
  keeping the 2005 story beat-for-beat while importing the best post-2005 systems. The definitive
  reference for "modernized classic PMD feel".
- **Battle/QoL changes (all confirmed via serebii/game8/Bulbapedia extracts):**
  - **Auto mode** (L): party auto-pathfinds until something interesting happens.
  - **Auto-best-move** (A): the basic attack button now fires the tactically best known move;
    the old typeless regular attack is demoted to near-uselessness.
  - Moves level up with use (inherited from PSMD). Linked moves return via Gulpin.
  - **Mega Evolution** via Empowerment Seed consumable (replaces PSMD's Awakening emera); lasts
    until status/exit rather than a turn timer.
  - Gen VI+ type chart; fairy-types present.
- **Party & recruitment.** Start with 3, but defeated Pokémon that join mid-dungeon stack the
  party **up to 8**; recruit-on-defeat is back (leader-final-blow requirement dropped — any ally
  can trigger it `[unverified]`). Rescue Team Camps (bought at Wigglytuff's Camp Corner) replace
  Friend Areas one-to-one. **Fainted wild Pokémon** found lying on floors can be revived to
  recruit them and always carry a Rare Quality.
- **Progression.** IQ abolished; **Rare Qualities** — passive, team-wide auras rolled per Pokémon
  (e.g. squad-wide stat bonuses, XP for benched members) — functionally replace IQ skills, Team
  Skills, and emeras (confirmed via Bulbapedia extract). DX Gummis grant/refresh Rare Qualities
  instead of feeding IQ.
- **Hub/jobs.** Pokémon Square rebuilt as in 2005 (bank, storage, Kecleon, dojo, Camp Corner).
  Makuhita Dojo reworked into solo single-floor type-themed training mazes, available from the
  first visit. Bulletin board + Pelipper Post Office return; multiple jobs in the same dungeon
  are batched into a single run.
- **Multiplayer.** Classic faint-rescue preserved (local, online, and offline password codes).
- **Postgame.** The 2005 legendary-hunt postgame largely intact (Buried Relic, Silver Trench,
  Wish Cave, Purity Forest, Meteor Cave, Luminous Cave evolution unlock, Mewtwo), plus
  Mega-capable species and strong-foe roaming bosses.

---

## 7. Cross-game reference tables

### 7.1 Identity & framing

| Game | Year/HW | Protagonist framing | Starter selection | Roster |
|---|---|---|---|---|
| Rescue Team | 2005 GBA/DS | Human→Pokémon, disasters | Personality quiz (16) | Gen I–III (386) |
| Explorers | 2007-09 DS | Human→Pokémon, guild apprentice, time plot | Quiz (16/19+Sky adds) | Gen I–IV (491) |
| Adventure Squad | 2009 Wii | Pokémon squad, minimal plot | Direct pick per version | Gen I–IV subset/version |
| Gates to Infinity | 2012 3DS | Human summoned, Paradise building | Direct pick (5) | ~144, Gen V-centric |
| Super MD | 2015 3DS | Human→Pokémon schoolchild → Expedition Society | Quiz w/ override (20) | All 720 |
| Rescue Team DX | 2020 Switch | Remake of 2005 | Quiz w/ override | Gen I–III + megas etc. |

### 7.2 Damage formula lineage

| Era | Formula shape | Reference |
|---|---|---|
| Rescue Team (GBA/DS) | Fixed-point polynomial: `floor(2*(((A−D)/8)+(L*43690/65536)) − D + 10 + (((A−D)/8+(L*43690/65536))^2)*(3276/65536))` then power/type/STAB/random | GameFAQs 75111 (above) |
| Explorers (and broadly WiiWare) | `((A+P)*(39168/65536) − D/2 + 50*ln(10*((A−D)/8 + L + 50)) − 311) / Y` then STAB ×1.5, type ×1.4/×0.7, crit, ~±10% random | Neoseeker 2818085; https://usernamefodder.github.io/damage-eos/ |
| GtI / PSMD / DX | Same lineage, retuned constants; DX community docs at game8 | game8 281399 `[unverified constants]` |

### 7.3 System presence matrix

| Mechanic | RT | Expl. | WiiWare | GtI | PSMD | DX |
|---|---|---|---|---|---|---|
| Grid + leader-first turns | ● | ● | ● | ● | ● | ● |
| Belly (leader) | ● | ● | ● | ✕ (postgame only) | ● (harsher) | ● |
| Recruit on defeat | ● (leader KO) | ● (leader KO) | ● | ● | ✕ (Connection Orb) | ● (to 8/party) |
| Friend Areas / Camps | ● (buy) | ✕ (auto Assembly) | ✕ | Paradise plots | ✕ | ● (buy camps) |
| IQ skills | ● | ● (groups, toggles) | ✕? `[unverified]` | ✕ (Team Skills) | ✕ (Emeras) | ✕ (Rare Qualities) |
| Linked moves | ● | ● | ✕ | ✕ | ✕ | ● |
| Move leveling | ✕ | ✕ | ✕ | ✕ | ● | ● |
| Wands | ✕ | ✕ | ✕ | ✕ | ● | ✕ |
| Alliances/tower attacks | ✕ | ✕ | ● (tower) | ✕ | ● | ✕ |
| Faint-rescue (player-to-player) | ● | ● | ● | ✕ | ● | ● |
| Job boards | ● | ●● (jobs+outlaws) | ● | ● | Connection Orb | ● (batched) |
| Kecleon dungeon shops / Monster Houses | ● | ● | ● | partial | ● | ● |
| Quiz-based starter | ● | ● | ✕ | ✕ | ● (override) | ● (override) |
| Evolution deferred to hub, postgame-gated | ● | ● | ? | late-story | removed | ● |
| Mega Evolution | ✕ | ✕ | ✕ | ✕ | ● (Awakening emera) | ● (Empowerment Seed) |
| 99F level-1 challenge dungeon | ● (Purity Forest) | ● (Destiny Tower) | ? | ✕ | ● (Destiny Tower) | ● |

---

## 8. Synthesis: Design pillars for a faithful PMD fangame

The intersection of all six games — what a browser recreation **must** implement to read as
authentic PMD, in rough implementation-priority order:

1. **Tile grid, 8-way movement, leader-clocked turns.** One leader input = one world tick; allies
   act after the leader with AI + a Tactics menu (Explorers-style: Let's Go Together / Go After
   Foes / Wait There / Avoid Trouble). Speed handled as stages granting extra/skipped turns, not
   a numeric stat.
2. **PMD damage formula, not the main-series one.** Implement the Explorers-lineage formula
   (`(A+P)*0.5977 − D/2 + 50·ln(10·((A−D)/8 + L + 50)) − 311`, clamped ≥1, STAB ×1.5, type
   ×1.4/×0.7 compressed chart, ~±10% random, crit chance) — validated against
   https://usernamefodder.github.io/damage-eos/. Numbers like "Tackle does 12" are core to the feel.
3. **Move ranges as a closed enum.** front / front-cutting-corners / front-2 / line-of-10 / around
   (all adjacent) / room / floor / self / party-in-room. 4 move slots + PP + Elixirs; a weak
   no-PP standard attack (or DX-style best-move button as an accessibility option).
4. **Stairs-based procedural floors.** Rooms + corridors, one staircase, seeded items/traps/
   enemies, Monster Houses, occasional in-dungeon Kecleon shop (with theft aggro), fixed boss
   floors, hidden wind timer per floor, optional mid-dungeon rest stops.
5. **Belly on the leader only.** Default 100, drains per turn (faster for wall-phasing Ghosts),
   Apples/Big Apples, HP drain at 0. GtI proved removing it breaks the tension loop.
6. **Wipe penalty + rescue escape valve.** Faint = ejected, lose all carried money and some/all
   items; bank + storage in the hub make the penalty plannable; Escape Orb allows voluntary exit
   with loot; (a)synchronous player rescue via shareable codes is the series' signature social
   feature and maps beautifully to a browser game.
7. **Recruit-on-defeat with leader-level gating.** Species base rate modified by leader level and
   charm items (Friend Bow), classic leader-final-blow rule (relaxable per DX), recruits housed in
   purchasable Friend Areas/Camps. Keep PSMD's Connection Orb as inspiration for *quest-driven*
   special recruits (fits this project's Renown questlines), not as the primary loop.
8. **Passive-skill progression layer, run-scoped or trained.** Pick one lineage: IQ/Gummis
   (trainable, per-Pokémon), Rare Qualities (rolled, team-aura), or Emeras (run-scoped,
   roguelike). For Explorers-of-Legends, IQ-style trained skills + a small emera-like run layer
   matches the locked PMDO direction in `docs/01_PMDO_IMPLEMENTATION_PLAN.md`.
9. **Hub town with canonical facility verbs.** Shop (buy/sell), storage (persists through wipes),
   bank, appraisal, link/tutor shop, dojo, job boards (separate rescue vs. outlaw boards), camp
   management, café/daily-luck facility. Evolution is a hub ritual, gated until late/postgame —
   never a mid-dungeon event.
10. **Job/mission economy.** Randomized rescue/escort/fetch/outlaw jobs ranked E→S+ posted on
    boards, batched per dungeon (DX QoL), paying money + rank points; team rank gates content.
    Wonder-Mail-style shareable mission codes are cheap to implement in a browser and highly
    on-brand.
11. **Weather, terrain classes, items, traps.** The full trap set (Wonder Tile, Warp, Sticky,
    Slumber, Chestnut, PP-Zero, Explosion…), thrown/placed items, Orbs (Escape, Petrify, Luminous),
    seeds/berries with dual eat/throw uses, and water/lava/chasm mobility rules.
12. **Presentation grammar.** Emotive portrait text boxes, bottom battle log, toggleable minimap,
    the 4-move submenu showing PP + range, floor-intro banner ("Tiny Woods — B1F"), and postgame
    structured as a long legendary-hunt tail with one 99-floor level-1 "purity" dungeon as the
    final skill test.

Anti-patterns the series itself flagged: removing belly and shrinking the roster/job variety
(Gates to Infinity's reception), and fully replacing serendipitous recruitment with menus (PSMD's
Connection Orb — beloved story, missed recruit loop). DX is the best single reference for QoL
(auto-mode, best-move button, batched jobs) layered onto the classic loop without changing it.
