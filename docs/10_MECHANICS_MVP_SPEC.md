# Mechanics MVP Spec

Status: development spec for the prologue and Chapter 1 playable slice.

## Design Principle

For the first playable build, mechanics should be real but small.

Do not build the whole RPG system yet. Build the lowest useful layer that can support the later game:

- durable state,
- simple rewards,
- simple choices,
- visible feedback,
- save/load persistence.

## State Model

Use simple named variables first. If PMDO scripting requires a different exact storage API during implementation, keep the same conceptual names.

### Story Flags

```text
story_new_game_started
story_quiz_complete
story_partner_chosen
story_prologue_complete
story_chapter_1_started
story_chapter_1_complete
story_slice_complete
```

### Team Identity

```text
player_species
player_personality_result
partner_species
team_name
```

### Renown Counters

Start with only three counters:

```text
renown_heroic
renown_explorer
renown_social
```

Why only three:

- Heroic covers rescues and protection.
- Explorer covers dungeon completion and route discovery.
- Social covers trust, dialogue, and partner/community tone.

Other Renown types can wait.

### Attribute Point State

```text
team_attribute_points_unspent
player_ap_hp
player_ap_attack
player_ap_defense
player_ap_special_attack
player_ap_special_defense
player_ap_speed
partner_ap_hp
partner_ap_attack
partner_ap_defense
partner_ap_special_attack
partner_ap_special_defense
partner_ap_speed
```

Design locks:

- Attribute Point costs are equal across Pokemon.
- No species-based cost scaling.
- Speed is accuracy/evasion-oriented, not mainline turn order.

## Attribute Point MVP

The first slice does not need a polished final UI.

Minimum acceptable implementation:

1. Team earns Attribute Points at Chapter 1 completion.
2. A debug/dev menu or simple choice menu can spend them.
3. Spend choices update stored AP investment values.
4. A confirmation line tells the player what increased.
5. Save/load preserves the values.

Recommended first reward:

```text
Chapter 1 completion: +2 team Attribute Points
```

Recommended spending menu:

```text
Spend Attribute Point
- HP
- Attack
- Defense
- Special Attack
- Special Defense
- Speed
- Back
```

For MVP, spending can apply to both protagonist and partner as team training, or use a two-step menu to choose the Pokemon first. If implementation time is tight, start with team-wide storage and split per Pokemon in the next mechanics PR.

## Stat Application Priority

### MVP

Store AP investments and confirm persistence.

### Next Pass

Apply AP investments to actual battle stats or derived modifiers.

### Later

Balance formulas, caps, refunds, training NPCs, and UI polish.

## Speed Handling

Speed must represent hit reliability and evasion-style outcomes.

MVP rule:

- Store Speed AP separately as `*_ap_speed`.
- Do not use Speed as turn order.
- Do not use different AP costs by species.

Later implementation can map Speed AP into accuracy/evasion modifiers once PMDO stat hooks are confirmed.

## Renown MVP

Renown should work as a simple reward and dialogue condition in the first slice.

Recommended Chapter 1 reward:

```text
renown_heroic += 1
renown_explorer += 1
```

Optional social reward:

```text
renown_social += 1
```

Award Social Renown only if the player chooses a kind or patient dialogue option during the opening.

Minimum player feedback:

```text
Your team's Heroic Renown rose.
Your team's Explorer Renown rose.
```

## Partner Selection MVP

Flow:

1. Player completes quiz.
2. Game displays suggested protagonist species.
3. Player confirms or accepts the protagonist.
4. Player chooses partner from a curated list.
5. Game prevents selecting the same species if desired.
6. Partner personality remains fixed regardless of species.

MVP partner list can be smaller than the final list:

- Eevee
- Riolu
- Shinx
- Vulpix
- Ralts
- Zorua
- Rockruff
- Sprigatito

This is enough to test the flow without balancing every generation.

## Hidden Skills MVP

Do not implement full hidden skills in the first playable slice.

Use one hidden training flag only:

```text
skill_first_aid_seen
```

Purpose:

- First Aid can be introduced through a simple rescue tutorial.
- It proves the future hidden-skill messaging style without building the entire system.

Example feedback:

```text
You feel a little more confident helping injured Pokemon.
```

## Chapter 1 Dungeon Mechanics

The first dungeon should be short and safe.

Recommended properties:

- 3 to 4 floors.
- Basic enemies only.
- Low trap count or no traps.
- Clear item pickups.
- One rescue target or delivery target.
- One scripted instability event at the end.

Mechanics it should test:

- dungeon entry,
- floor progression,
- combat,
- item pickup,
- stairs,
- objective completion,
- exit/return cutscene,
- completion reward variables.

## Save/Load Acceptance

After completing Chapter 1, save/load must preserve:

- protagonist species,
- partner species,
- story flags,
- Renown counters,
- Attribute Point counters,
- first dungeon complete flag,
- Chapter 1 complete flag.

If save/load fails, the playable slice is not done.

