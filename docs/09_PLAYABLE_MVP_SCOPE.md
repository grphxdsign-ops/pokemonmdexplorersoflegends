# Playable MVP Scope

Status: development direction lock.

## Build Target

The first playable build should run only through:

1. Prologue.
2. Chapter 1.
3. End-of-slice stop screen.

No Storm Domain gameplay in this slice.
No Dream Domain gameplay in this slice.
No additional domain arcs in this slice.

The purpose is to prove the game loop, not the whole story.

## Player Experience Goal

The player should be able to open the standalone game and play a compact, polished opening that proves:

- starter quiz works,
- partner selection works,
- protagonist and partner spawn correctly,
- the opening town/hub works,
- basic dialogue and cutscenes work,
- one short dungeon works,
- basic mission completion works,
- Renown flags work,
- attribute point reward state works,
- save/load does not break progression,
- the build ends cleanly at the first chapter boundary.

## Scope Boundary

### In Scope

- Standalone game shell setup.
- Personality quiz flow.
- Partner selection after quiz.
- Prologue opening in a mundane settlement.
- One small hub map.
- One beginner dungeon.
- One scripted rescue or delivery objective.
- One Arcanine rescue cutscene.
- Chapter 1 opening.
- One simple rescue-board-style mission.
- First Renown award.
- First Attribute Point award.
- Basic state variables.
- Debug/testing hooks for the mechanics.
- End-of-slice message.

### Out of Scope

- Storm Domain.
- Dream Domain.
- Team Apex corruption.
- Tower of Legends.
- Any legendary summoning.
- Full hidden skill rank implementation.
- Full Renown economy.
- Full attribute point UI polish.
- All domain Mantle systems.
- Postgame.
- Custom art pass.
- Custom music pass.
- Full starter roster balance.
- Full branching endings.

## Prologue Definition

The prologue is the "ordinary life breaks open" section.

Playable beats:

1. New game starts.
2. Personality quiz determines or suggests protagonist.
3. Player chooses partner.
4. Protagonist starts in a mundane settlement supply office.
5. Partner convinces protagonist to take a small dungeon errand.
6. Player enters a short beginner dungeon.
7. Dungeon destabilizes near completion.
8. Arcanine rescues the team.
9. Partner decides they should pursue legendhood seriously.

End state:

- `story_prologue_complete = true`
- partner chosen and stored
- protagonist/partner team created
- first dungeon complete
- Arcanine met

## Chapter 1 Definition

Chapter 1 is the first playable "team begins" chapter, not the first domain arc.

Working chapter title:

Chapter 1: First Renown

Playable beats:

1. Team wakes after Arcanine rescue.
2. Partner pushes to register as a rescue/exploration team.
3. Player receives a simple mission.
4. Player completes one short dungeon objective.
5. Player returns to town.
6. Team receives its first Renown award.
7. Team receives first Attribute Points.
8. The build shows an end-of-slice message.

End state:

- `story_chapter_1_complete = true`
- `renown_heroic` or `renown_explorer` increased
- `team_attribute_points` increased
- end-of-slice flag set

## MVP Mechanics

The mechanics MVP includes only the foundation:

- partner selection,
- story flags,
- simple Renown counters,
- attribute point counters,
- starter stat reward storage,
- one dungeon completion event,
- one reward scene,
- save/load persistence.

Actual stat application can be simple in the first slice. The important part is that the data model exists and persists.

## Standalone Reference Notes

The first playable build now lives under:

```text
game/
```

The browser prototype is intentionally small and direct:

- static HTML/CSS/JavaScript,
- no external engine requirement,
- no generated PMDO data,
- no Quest packaging.

The prototype may still borrow Mystery Dungeon design language: grid movement, short floors, dialogue boxes, rescue-board pacing, and chapter-end reward flow.
