# PMDO Vertical Slice Tasks

Status: implementation task list for prologue and Chapter 1.

## Guiding Rule

Build only enough to play through the prologue and Chapter 1.

Do not implement the domain arc backlog until this slice is playable.

## Phase 0: PMDO Setup

Tasks:

- Download or install PMDO `v0.8.12` or newer. Complete locally.
- Run PMDO in dev mode.
- Create a Quest package named `ExplorersOfLegends`. Initial skeleton complete locally.
- Confirm the generated mod folder appears under PMDO's `MODS` folder. Initial junction complete locally.
- Copy or symlink the generated quest folder into this repo under `pmdo/ExplorersOfLegends/`. Complete locally via junction.
- Confirm the Quest can be selected and started.

Reference commands from PMDO docs:

```text
PMDO.exe -dev
PMDO.exe -dev -quest ExplorersOfLegends
```

Local PMDO path:

```text
C:\Users\rickii\Documents\PMDO\v0.8.12-manual\PMDO.exe
```

Local setup note:

The interactive PMDOSetup console could not run cleanly through the hidden command channel, so PMDO was installed using the documented manual-install approach: PMDC executable package plus matching DumpAsset content from the PMDODump `v0.8.12` submodule revision.

Current Quest package status:

- `pmdo/ExplorersOfLegends/` exists in the repo.
- PMDO's `MODS\ExplorersOfLegends` path is a junction to the repo package folder.
- Initial Quest `Mod.xml` exists with `ModType` set to `Quest`.
- Initial script placeholder folder exists under `Data/Script/explorers_of_legends/`.
- PMDO dev reserialize/load check exited successfully with code `0`.
- Generated base data files from the reserialize check were removed to keep the skeleton clean.

## Phase 1: Quest Skeleton

Deliverables:

- Quest package exists. Complete locally.
- `Mod.xml` exists. Complete locally.
- Repo ignores PMDO runtime output and does not commit PMDO binaries.
- Quest starts without crashing. Metadata load check complete via PMDO dev command.
- Placeholder start map loads.

Acceptance:

- PMDO opens in dev mode with the quest selected.
- Starting a new game reaches the placeholder intro.

## Phase 2: Starter Quiz and Partner Selection

Deliverables:

- Personality quiz script.
- Starter result storage.
- Partner selection menu.
- Partner species storage.
- Partner spawn.
- Basic team creation.

Acceptance:

- Player can complete quiz.
- Player can choose partner.
- Protagonist and partner appear together in the opening map.
- Save/load preserves both species.

## Phase 3: Prologue Map and Opening Loop

Deliverables:

- Opening ground map: working name `supply_depot`.
- Protagonist start marker.
- Partner NPC.
- Basic NPCs for mundane settlement flavor.
- Partner pitch cutscene.
- Exit route to first dungeon.

Acceptance:

- Player starts in the supply depot.
- Partner dialogue triggers.
- Player can move to the first dungeon.

## Phase 4: First Dungeon

Working dungeon name:

```text
errand_path
```

Deliverables:

- 3 to 4 floors.
- Beginner enemy table.
- Beginner item table.
- Stairs progression.
- Completion event.
- Rescue or delivery objective.

Acceptance:

- Player can enter, play, complete, and exit.
- Dungeon cannot softlock under normal play.
- Completion sets `story_prologue_dungeon_complete`.

## Phase 5: Arcanine Rescue Cutscene

Deliverables:

- Dungeon end or post-dungeon cutscene.
- Arcanine appears.
- Arcanine saves protagonist and partner from danger.
- Partner is inspired.
- Prologue completion flag.

Acceptance:

- Cutscene plays once.
- `story_prologue_complete = true`.
- Player returns to hub or transitions into Chapter 1.

## Phase 6: Chapter 1 Mission

Working chapter title:

```text
First Renown
```

Deliverables:

- Simple rescue board or mission NPC.
- One short mission objective.
- One return scene.
- Renown reward.
- Attribute Point reward.
- End-of-slice screen.

Acceptance:

- Player completes the mission.
- Renown counters update.
- Attribute Point counter updates.
- Chapter 1 completion flag sets.
- End-of-slice message appears.

## Phase 7: Mechanics Debugging

Deliverables:

- Dev/debug script to print state.
- Debug way to grant Renown.
- Debug way to grant Attribute Points.
- Debug way to jump to Chapter 1 start.

Acceptance:

- Testing does not require replaying the whole intro each time.
- State can be inspected quickly in dev mode.

## Phase 8: Verification Checklist

Before calling the vertical slice playable:

- New game starts.
- Quiz completes.
- Partner selection works.
- Protagonist and partner spawn.
- Opening map loads.
- First dungeon completes.
- Arcanine rescue plays once.
- Chapter 1 starts.
- Chapter 1 mission completes.
- Renown reward persists.
- Attribute Point reward persists.
- Save/load works after prologue.
- Save/load works after Chapter 1.
- End-of-slice message appears.
