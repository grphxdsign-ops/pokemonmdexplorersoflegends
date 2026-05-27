# Development Notes and Blockers

## Current Priority

Story expansion is on the backburner.

Current priority:

- development,
- mechanics,
- PMDO Quest setup,
- playable prologue,
- playable Chapter 1.

## Local PMDO Install

PMDO has been downloaded and unpacked locally.

Install path:

```text
C:\Users\rickii\Documents\PMDO\v0.8.12-manual\
```

Launcher:

```text
C:\Users\rickii\Documents\PMDO\v0.8.12-manual\PMDO.exe
```

Downloaded files are stored outside the repo:

```text
C:\Users\rickii\Documents\PMDO\_downloads\
```

Downloaded/unpacked components:

- PMDOSetup package from `audinowho/PMDODump` `v0.8.12`.
- Manual PMDC Windows x64 package from `PMDCollab/PMDC` `v0.8.12`.
- Matching DumpAsset package at submodule revision `9d864d1425f002b051e7a54fffc639988d8ef9c9`.

Reason for manual install:

The PMDOSetup console expects an interactive console and could not be automated through the hidden command channel. The manual install produced a usable `PMDO.exe`.

## Current Blocker

The `ExplorersOfLegends` Quest package has not been generated yet.

Next required step:

Run PMDO in dev mode, create the Quest package, then copy or link the generated quest folder into:

```text
C:\Users\rickii\Documents\PokeRom\pmdo\ExplorersOfLegends\
```

## Latest Release Check

Latest PMDO release checked from GitHub:

```text
Repository: audinowho/PMDODump
Latest tag: v0.8.12
Published: 2026-04-27
Windows x64 asset: setup-windows-x64.zip
```

Release page:

https://github.com/audinowho/PMDODump/releases/tag/v0.8.12

## Installation Approach

Recommended local layout:

```text
C:\Users\rickii\Documents\PMDO\
C:\Users\rickii\Documents\PokeRom\
```

Do not commit PMDO binaries into this repo.

Now that PMDO is unpacked:

1. Start PMDO in dev mode.
2. Create a Quest package named `ExplorersOfLegends`.
3. Copy or link the generated quest folder into:

```text
C:\Users\rickii\Documents\PokeRom\pmdo\ExplorersOfLegends\
```

4. Commit only the Quest package files, scripts, maps, and data that belong to the mod.

## Source Control Rules

Commit:

- design docs,
- PMDO Quest package files,
- scripts,
- data files,
- map files,
- small helper tools.

Do not commit:

- PMDO release zips,
- PMDO binaries,
- local saves,
- screenshots,
- logs,
- generated caches,
- personal settings.

## Next Development PRs

1. PMDO Quest skeleton.
2. Starter quiz and partner selection.
3. Prologue map and first dungeon.
4. Arcanine rescue cutscene.
5. Chapter 1 mission and reward loop.
6. Attribute Point and Renown persistence.
