# PMDO Asset Loading

Status: local optional asset support.

## Local Asset Source

The desktop app can load PMDO-format sprites from a local `RawAsset` checkout.

Recommended local path:

```text
pmdo/_downloads/RawAsset
```

This folder is ignored by git through `pmdo/_downloads/`, so downloaded sprites are not committed into this repository.

## Download Command

```text
git clone --depth 1 --filter=blob:none --sparse https://github.com/PMDCollab/RawAsset.git pmdo/_downloads/RawAsset
git -C pmdo/_downloads/RawAsset sparse-checkout set Sprite Portrait
```

## Current Sprite Format

RawAsset stores sprites in numeric species folders:

```text
RawAsset/Sprite/0001/AnimData.xml
RawAsset/Sprite/0001/Idle-Anim.png
RawAsset/Sprite/0001/Idle-Offsets.png
RawAsset/Sprite/0001/Idle-Shadow.png
```

`transfer.json` maps species names to these numeric folders. The current playable roster uses:

| Species | Folder |
| --- | --- |
| Bulbasaur | `0001` |
| Charmander | `0004` |
| Pikachu | `0025` |
| Vulpix | `0037` |
| Eevee | `0133` |
| Chikorita | `0152` |
| Treecko | `0252` |
| Ralts | `0280` |
| Shinx | `0403` |
| Riolu | `0447` |
| Sprigatito | `0906` |

## Runtime Behavior

`ExternalSpriteProvider` searches for assets in this order:

1. `EOL_RAW_ASSET_DIR`
2. `pmdo/_downloads/RawAsset` by walking upward from the current directory
3. `pmdo/_downloads/RawAsset` by walking upward from the executable directory

If assets are found, the desktop renderer loads `Idle-Anim.png` first and falls back to `Walk-Anim.png`. Frame width and height come from `AnimData.xml`; the first frame is cropped to visible pixels and rendered with nearest-neighbor scaling.

If assets are not found, the app uses the internal original placeholder atlas so the build still runs.

## Local Missing-Sprite Generation

Use this helper to generate local PMDO-format action sheets for a missing species from generated reference sheets:

```text
powershell -NoProfile -ExecutionPolicy Bypass -File tools/sprites/make_missing_sprite_assets.ps1 -SpeciesId 0832 -SpeciesName Dubwool
```

For Bulbasaur idle/sleep export plus Dubwool generation:

```text
powershell -NoProfile -ExecutionPolicy Bypass -File tools/sprites/make_missing_sprite_assets.ps1 -ExportBulbasaur
```

Generated files remain under ignored local folders:

```text
pmdo/_downloads/RawAsset/Sprite/0832
pmdo/_downloads/exports
```

The helper creates a Bulbasaur-template animation surface for the target species: animation, offset, shadow, `AnimData.xml`, and `credits.txt` files for each non-copy animation.

For the previously missing National Dex folders, run the broad generator:

```text
powershell -NoProfile -ExecutionPolicy Bypass -File tools/sprites/generate_missing_pokemon_sprites.ps1 -RegenerateGenerated
```

That command upgrades the locally scaffolded missing folders to full Bulbasaur-template action sets using cached reference art under `pmdo/_downloads/reference_art/official-artwork`. These generated sprite folders remain local because `pmdo/_downloads/` is ignored.
