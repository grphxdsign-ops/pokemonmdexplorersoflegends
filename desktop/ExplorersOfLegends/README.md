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

## Controls

- Arrow keys or WASD: move.
- Space or Enter: interact / advance dialogue.
- Mouse: choose menu options.

## Save Location

Slot 1 is stored in:

```text
%APPDATA%\ExplorersOfLegends\save.slot1
```
