# PMDO Implementation Plan

## Engine Direction

Use PMDO / Pokemon Mystery Dungeon: Origins as the build base.

PMDO is a C# fanmade PMD game with full mod support and tooling for fangame creation. Its modding docs describe mods as the intended way to make reversible changes, and PMDO dev mode exposes data editing, map editing, script reloading, sprite tools, and mod selection.

Source references:

- PMDO main page: https://wiki.pmdo.pmdcollab.org/
- PMDO Modding Hub: https://wiki.pmdo.pmdcollab.org/Modding_Hub
- Creating a Mod: https://wiki.pmdo.pmdcollab.org/Tutorial%3ACreating_a_Mod
- Dev Mode: https://wiki.pmdo.pmdcollab.org/Dev_Mode

## Recommended PMDO Package Type

Use a PMDO Quest package rather than a small Mod package.

Reason:

- This is a full story campaign.
- It needs its own save data.
- It needs custom events, dungeons, town progression, Renown, partner arc state, and branching endings.
- PMDO docs describe Quests as mod packages with their own save files and one-active-at-a-time behavior.

Working package path once generated:

```text
pmdo/ExplorersOfLegends/
```

The folder should be generated in PMDO dev mode first, then committed into this repository.

## Repo Structure

Planned structure:

```text
README.md
PROJECT_CONTEXT.md
docs/
  00_CANON_LOCK.md
  01_PMDO_IMPLEMENTATION_PLAN.md
  02_STORY_AND_CHAPTER_PLAN.md
  03_PROGRESSION_SYSTEMS.md
  04_DOMAIN_INTERVIEW_NOTES.md
  05_PR_ROADMAP.md
pmdo/
  ExplorersOfLegends/
    Mod.xml
    Data/
    Script/
    Ground/
    Map/
    Content/
tools/
  validation/
```

Only the `pmdo/ExplorersOfLegends/` folder should be added after PMDO creates the actual mod files.

## PMDO Systems Mapping

| Game Feature | PMDO Implementation Direction |
| --- | --- |
| Domain arcs | Quest scripts, ground maps, dungeon zones, story flags |
| Domain Mantles | Story variables plus NPC metadata |
| Renown | Persistent script variables or custom save data |
| Hidden skill ranks | Persistent rank flags, displayed through qualitative messages |
| Attribute points | Custom progression data attached to player/partner/team |
| Partner moral drift | Story flags, dialogue variants, climax branch checks |
| Team Apex | Recurring scripted encounters and reputation comparisons |
| Villain reveal | Story cutscene scripts at Tower of Legends summit |
| Allies joining climax | Cutscene scripting and battle-adjacent staged event |
| Branching endings | Renown thresholds and key choice flags |
| Postgame | New quest state after resurrection scene |

## First Technical Milestones

### Milestone 1: Planning Repo

Deliverables:

- Canon docs.
- Story outline.
- Domain list.
- Progression system plan.
- PR roadmap.

### Milestone 2: PMDO Quest Skeleton

Deliverables:

- Generated PMDO Quest folder.
- `Mod.xml` with project identity.
- Bootable empty quest.
- Placeholder hub map.
- Placeholder first dungeon.
- Placeholder player and partner spawn.

### Milestone 3: Data Model Prototype

Deliverables:

- Renown variables.
- Attribute point variables.
- Hidden rank variables.
- Debug script to grant/test values.
- Sample menu/dialogue to display qualitative progress.

### Milestone 4: Prologue Vertical Slice

Deliverables:

- Mundane opening scene.
- Partner recruitment scene.
- First small rescue dungeon.
- Arcanine rescue cutscene.
- First Renown award.
- Save/load verification.

### Milestone 5: Seed or Sun Domain Slice

Deliverables:

- First domain town.
- Living Legend interaction.
- Optional questline with multiple resolutions.
- Skill check prototype.
- Renown consequence.
- Team Apex scene.

## PMDO Dev Workflow

1. Install PMDO.
2. Launch in dev mode.
3. Create `ExplorersOfLegends` as a Quest package.
4. Confirm the generated folder exists in PMDO's `MODS` folder.
5. Copy or symlink the generated folder into this repo under `pmdo/`.
6. Commit generated baseline separately from design docs.
7. Build features through small branches and PRs.
8. Use PMDO dev mode for testing maps, scripts, data, and dialogue.

## Validation Strategy

For every gameplay PR:

- Confirm PMDO launches with the quest selected.
- Confirm save file creation still works.
- Confirm no script errors on quest start.
- Confirm the target scene/dungeon can be reached.
- Confirm any new story variable persists after save/load.
- Confirm the change does not require distributing official ROM files.

