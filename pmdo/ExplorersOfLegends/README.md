# Explorers of Legends PMDO Quest

This is the PMDO Quest package for the first playable slice of Pokemon Mystery Dungeon: Explorers of Legends.

## Current Scope

- Prologue script flow.
- Chapter 1 script flow.
- PMD-style starter quiz scoring.
- Partner selection after the quiz.
- One beginner dungeon callback skeleton.
- Arcanine rescue cutscene script.
- First Renown reward.
- First Attribute Point reward.
- Original loading/title screen asset.

Later domain arcs are intentionally out of scope until this slice is playable.

## Script Entry Points

- Persistent service: `Data/Script/explorers_of_legends/services/eol_service/init.lua`
- Save defaults: `Data/Script/explorers_of_legends/scriptvars.lua`
- Starter quiz: `Data/Script/explorers_of_legends/starter_quiz.lua`
- Partner selection: `Data/Script/explorers_of_legends/partner_select.lua`
- Prologue flow: `Data/Script/explorers_of_legends/prologue.lua`
- Chapter 1 flow: `Data/Script/explorers_of_legends/chapter_01.lua`
- First dungeon script: `Data/Script/explorers_of_legends/zone/first_step_cave/init.lua`

## Local Dev Path

The repository folder is linked into PMDO's `MODS` folder:

```text
C:\Users\rickii\Documents\PMDO\v0.8.12-manual\MODS\ExplorersOfLegends
```

Source-controlled package path:

```text
C:\Users\rickii\Documents\PokeRom\pmdo\ExplorersOfLegends
```

## Asset Notes

The loading/title assets in `Content/UI` are original generated/composited assets for this quest package. PMDO base assets and downloaded engine files should stay outside this repository.
