# Pokemon Mystery Dungeon: Explorers of Legends

A playable, self-contained browser fangame - plus the full design workspace behind it.

## Play it

Open **`game/index.html`** in any browser (desktop or phone - no install, no server,
no ROM). Or enable GitHub Pages on this repo and play at the Pages URL.
See [docs/07_LOCAL_BUILD.md](docs/07_LOCAL_BUILD.md) for controls and details.

Highlights:

- Classic PMD loop: procedurally generated mystery dungeons, 8-way grid, turn-based
  battles with the real Explorers of Sky damage formula, belly, traps, recruitment,
  boss trials, monster houses, rescue jobs.
- Every Pokemon through Gen 9 (1,025 species incl. all paradox) plus 94 Mega/Primal
  forms and regional forms - authentic PMD-style sprites streamed from PMDCollab.
- The full Explorers of Legends campaign: personality quiz, Mythfall Town hub,
  domain pilgrimage, Team Apex, the Tower of Legends, branching endings, postgame
  legendary trials.
- Canon systems: Renown types, hidden skill ranks, attribute points, partner moral
  drift, Speed as accuracy/evasion.

## Original Direction (design history)

The project was first planned around PMDO / Pokemon Mystery Dungeon: Origins, using a full story-style PMDO Quest package rather than a DS ROM hack. The browser build above now implements those systems directly; the PMDO docs remain as design source.

Core premise:

The original legendary and mythical Pokemon were ancient First Legends tied to sacred domains. Far in the future, their domain Mantles have passed through many successors. The current Living Legends act as domain leaders, guildmaster-equivalents, and public symbols of order. The protagonist and partner begin as ordinary Pokemon and earn their own legend through Renown, domain trials, and moral choices.

## Key Docs

- [Canon Lock](docs/00_CANON_LOCK.md)
- [PMDO Implementation Plan](docs/01_PMDO_IMPLEMENTATION_PLAN.md)
- [Story and Chapter Plan](docs/02_STORY_AND_CHAPTER_PLAN.md)
- [Progression Systems](docs/03_PROGRESSION_SYSTEMS.md)
- [Domain Interview Notes](docs/04_DOMAIN_INTERVIEW_NOTES.md)
- [PR Roadmap](docs/05_PR_ROADMAP.md)

## Current Build Assumption

Use PMDO as the engine base and store the eventual PMDO Quest package under:

```text
pmdo/ExplorersOfLegends/
```

That folder should be generated through PMDO dev mode once PMDO is installed locally, then brought into this repo for source control.

## GitHub Status

The local repo can be initialized immediately. Remote GitHub repo creation is blocked until either:

- GitHub CLI is installed and authenticated locally, or
- the GitHub connector exposes repository creation, or
- an empty GitHub repository is created manually and provided as `owner/name`.

