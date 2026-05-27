# Game Foundation Implementation

This pass turns the PMDO quest package from a metadata skeleton into the first playable-slice code foundation.

## What Exists Now

- Persistent quest service: `explorers_of_legends.services.eol_service`
- Save-state defaults and upgrade helper: `scriptvars.lua` and `state.lua`
- Shared PMDO-style include/common layer: `include.lua` and `common.lua`
- Starter quiz data and scoring: `starter_quiz.lua`
- Partner selection after the quiz: `partner_select.lua`
- Equal-cost Attribute Point mechanics: `mechanics/attribute_points.lua`
- Renown rewards: `mechanics/renown.lua`
- Prologue flow: `prologue.lua`
- Chapter 1 flow: `chapter_01.lua`
- Domain Mantle reference data: `data/domain_mantles.lua`
- Opening story data: `data/opening_story.lua`
- First ground/zone callback skeletons:
  - `ground/legendrise_camp/init.lua`
  - `zone/first_step_cave/init.lua`
- Original loading/title assets:
  - `Content/UI/explorers_loading_bg.png`
  - `Content/UI/explorers_loading_screen.png`

## Implementation Notes

- Speed uses the PMD-style interpretation requested for this project: accuracy and evasion investment. It does not alter turn order.
- Attribute Point costs are equal across HP, Attack, Defense, Special Attack, Special Defense, and Speed, regardless of species.
- Partner desperation and Team Apex moral pressure remain later-story material. The playable foundation only establishes the partner's ambition and no-shortcuts stance.
- Arcanine is implemented as the inspiring first hero figure for the prologue, with the later villain twist preserved in story data and docs rather than exposed in Chapter 1 gameplay.
- Dusknoir/Void suspicion starts as planted evidence in Chapter 1 but is not resolved in this vertical slice.

## Remaining PMDO Data Work

These scripts are ready to attach to real PMDO map and dungeon data, but the serialized map/zone assets still need to be authored in the PMDO editor:

- `legendrise_camp` ground map
- `first_step_cave` zone and floor generation
- NPC/event placements for partner, request board, and rescue sequence
- Starter quiz and partner menus as PMDO UI scenes
- Reward UI for Renown and Attribute Points

