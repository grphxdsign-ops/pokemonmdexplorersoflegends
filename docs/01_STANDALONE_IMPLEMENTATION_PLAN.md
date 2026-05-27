# Standalone Implementation Plan

Status: active technical direction.

## Build Target

Pokemon Mystery Dungeon: Explorers of Legends is now a standalone game, not a PMDO Quest package.

The current primary implementation target is a C# Windows desktop app, because the game should feel familiar to PMDO while remaining standalone. The desktop build now carries the playable slice:

- loading/title presentation,
- starter quiz,
- partner selection,
- grid movement,
- dungeon floor flow,
- Renown rewards,
- Attribute Point rewards,
- save/continue state.

The browser-playable prototype remains useful as a fast visual and mechanical reference while the desktop engine becomes the main game.

PMDO can remain a reference for familiar structure and pacing, but the game code, assets, loading screen, and systems live in this repository.

## Active Package

```text
desktop/ExplorersOfLegends/
```

The active desktop prototype is a C# Windows Forms app. It builds with `desktop\ExplorersOfLegends\build_desktop.cmd` and produces `desktop\ExplorersOfLegends\build\ExplorersOfLegends.exe`.

The browser reference prototype still lives under:

```text
game/
```

## First Playable Slice

1. Loading/title screen.
2. Personality quiz.
3. Partner selection.
4. Lowstep hub.
5. First Step Cave.
6. Arcanine rescue.
7. Chapter 1 reward and AP spending.

## Styling Direction

The loading screen should read as Pokemon Mystery Dungeon-inspired:

- bright sky and green field,
- simple cave and town shapes,
- chunky outlined logo treatment,
- yellow-blue main title feel,
- blue-gold subtitle plaque,
- lower detail than generated concept art.

Avoid over-detailed AI-looking paintings. Prefer simple, readable, game-native shapes until a dedicated sprite/background art pipeline exists.

## Near-Term Engine Work

- Split more of the desktop app into explicit scene/state/action classes as the playable slice grows.
- Add richer dungeon rules: turn queue, move list, items, floor events.
- Add sprite sheets or custom original sprites.
- Add menus for AP spending during hub play, not only at Chapter 1 completion.
- Add a proper save-slot screen.
