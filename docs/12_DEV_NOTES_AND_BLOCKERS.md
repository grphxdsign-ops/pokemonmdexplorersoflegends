# Development Notes and Blockers

## Current Priority

Story expansion is on the backburner.

Current priority:

- development,
- mechanics,
- PMDO Quest setup,
- playable prologue,
- playable Chapter 1.

## Current Blocker

PMDO is not installed locally in the checked folders.

Checked:

- `C:\Users\rickii\Documents`
- `C:\Users\rickii\Downloads`
- `C:\Users\rickii\Desktop`

No `PMDO.exe` or PMDO folder was found.

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

Once PMDO is installed:

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

