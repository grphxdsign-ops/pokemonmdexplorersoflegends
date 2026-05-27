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

The `ExplorersOfLegends` Quest package has been created as an initial skeleton, but it has not been verified in PMDO dev mode yet.

Current package path:

```text
C:\Users\rickii\Documents\PokeRom\pmdo\ExplorersOfLegends\
```

PMDO MODS path:

```text
C:\Users\rickii\Documents\PMDO\v0.8.12-manual\MODS\ExplorersOfLegends
```

The PMDO MODS path is a junction to the repo package folder.

Load check:

```text
PMDO.exe -dev -quest ExplorersOfLegends -reserialize all
```

Result:

```text
Exit code: 0
```

The reserialize command wrote a few generated base data files into the package during validation. Those were removed afterward so the initial skeleton only tracks intentional package files.

Next required step:

Open PMDO in dev mode and verify the Quest package appears in the developer UI / Special Episodes flow. If PMDO requires additional generated files, create/save the package through the dev UI and commit the generated files intentionally.

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
