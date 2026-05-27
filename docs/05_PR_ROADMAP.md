# PR Roadmap

Status: updated for standalone development.

## Current Stack

### PR: Standalone Game Foundation

Branch:

```text
codex/game-foundation-scripts-assets
```

Scope:

- Remove active PMDO Quest packaging.
- Add `game/` as the standalone playable prototype.
- Add PMD-inspired loading/title screen styling.
- Add personality quiz and partner selection.
- Add Lowstep hub and First Step Cave.
- Add Arcanine rescue, first Renown reward, and Attribute Point spending.
- Update docs to point at standalone development.

Review focus:

- Does the loading screen feel closer to Pokemon Mystery Dungeon without looking over-rendered?
- Is the standalone game direction clear?
- Does the first playable slice prove the core loop?

Validation:

- Open `game/index.html`.
- Play from title through Chapter 1 completion.
- Confirm local save/continue works.

## Next PRs

### PR: Dungeon Combat Pass

- Add turn queue.
- Add basic move data.
- Add accuracy/evasion checks, with Speed AP affecting those checks.
- Add enemy defeat rewards.
- Add clearer floor-end flow.

### PR: Sprite And Tile Art Pass

- Replace simple code tokens with custom original sprites.
- Add simple tile sheets for Lowstep and First Step Cave.
- Keep official Pokemon species names, but avoid copying official game sprites.

### PR: Menu And Save Polish

- Add save-slot UI.
- Add AP spending from the hub.
- Add options/settings.
- Add keyboard remapping notes.

### PR: Chapter 2 Setup

- Add first Team Apex appearance.
- Foreshadow Void suspicion.
- Prepare Storm Domain but do not start full Storm gameplay yet.
