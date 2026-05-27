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

The player should be able to start a new PMDO Quest and play a compact, polished opening that proves:

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

- PMDO Quest package setup.
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

## PMDO Reference Notes

PMDO mods can be used to create original custom fangames, and its docs recommend using mods so changes can be undone and redone cleanly. PMDO also supports Quest-type mods with their own save files, which fits this project better than a small general mod.

Useful docs:

- PMDO Modding Hub: https://wiki.pmdo.pmdcollab.org/Modding_Hub
- Creating a Mod: https://wiki.pmdo.pmdcollab.org/Tutorial%3ACreating_a_Mod
- Dev Mode: https://wiki.pmdo.pmdcollab.org/Dev_Mode
- Creating Ground Maps: https://wiki.pmdo.pmdcollab.org/Creating_Ground_Maps
- Creating Dungeons: https://wiki.pmdo.pmdcollab.org/Creating_Dungeons

Current latest PMDO release checked during this pass:

- `v0.8.12`
- Published: 2026-04-27
- Windows x64 asset: `setup-windows-x64.zip`

## Local PMDO Install Status

PMDO is now downloaded and unpacked locally.

Install path:

```text
C:\Users\rickii\Documents\PMDO\v0.8.12-manual\
```

Launcher:

```text
C:\Users\rickii\Documents\PMDO\v0.8.12-manual\PMDO.exe
```

Next blocker:

The actual `ExplorersOfLegends` Quest package still needs to be created in PMDO dev mode and copied or linked into this repo under `pmdo/ExplorersOfLegends/`.
