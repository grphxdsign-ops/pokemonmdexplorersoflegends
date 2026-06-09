# Explorers of Legends Desktop

Windows desktop prototype for Pokemon Mystery Dungeon: Explorers of Legends.

This is a standalone C# app, not a PMDO Quest package. It keeps the current playable slice:

- PMD-style loading/title presentation.
- Personality quiz.
- Partner selection.
- Lowstep hub.
- First Step Cave with four small floors.
- Arcanine rescue scene.
- Renown and equal-cost Attribute Point rewards.
- Slot 1 save/load.
- Original pixel-art-style tile and sprite atlas.

## Build

Run:

```text
desktop\ExplorersOfLegends\build_desktop.cmd
```

The compiled app is written to:

```text
desktop\ExplorersOfLegends\build\ExplorersOfLegends.exe
```

The build uses the Windows C# compiler that ships with .NET Framework, so it does not require the .NET SDK.

## Visual Pipeline

The desktop renderer now follows a small engine-style layout:

- `ExternalSpriteProvider.cs` loads PMDO `RawAsset/Sprite` sheets from disk when available.
- `SpriteAtlas.cs` builds reusable original tiles, items, and creature sprites.
- `GameRenderer.cs` draws tile layers, props, sprites, windows, and scene snapshots.
- Sprites and tiles use nearest-neighbor scaling for a Mystery Dungeon-style pixel look.

No PMDO or official game sprite files are committed in this repo. If a local `RawAsset` checkout exists, the app loads PMDO-format `Idle-Anim.png` or `Walk-Anim.png` sheets from disk and falls back to original placeholder sprites when missing.

Default local asset path:

```text
pmdo\_downloads\RawAsset
```

Optional override:

```text
set EOL_RAW_ASSET_DIR=C:\path\to\RawAsset
```

Current loaded format:

```text
RawAsset\Sprite\0001\AnimData.xml
RawAsset\Sprite\0001\Idle-Anim.png
```

The loader reads `AnimData.xml`, crops the first frame using the animation frame size, then scales it with nearest-neighbor rendering.

## Snapshot Checks

```text
desktop\ExplorersOfLegends\build\ExplorersOfLegends.exe --render-scene title desktop\ExplorersOfLegends\title-check.png
desktop\ExplorersOfLegends\build\ExplorersOfLegends.exe --render-scene hub desktop\ExplorersOfLegends\hub-check.png
desktop\ExplorersOfLegends\build\ExplorersOfLegends.exe --render-scene dungeon desktop\ExplorersOfLegends\dungeon-check.png
```

## Controls

- Arrow keys or WASD: move.
- Space or Enter: interact / advance dialogue.
- Mouse: choose menu options.

## Save Location

Slot 1 is stored in:

```text
%APPDATA%\ExplorersOfLegends\save.slot1
```
