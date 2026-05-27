# Pokemon Mystery Dungeon: Explorers of Legends

Planning workspace for a PMDO-based Pokemon Mystery Dungeon fangame concept.

## Current Direction

The project is now planned around PMDO / Pokemon Mystery Dungeon: Origins, using a full story-style PMDO Quest package rather than a DS ROM hack.

Core premise:

The original legendary and mythical Pokemon were ancient First Legends tied to sacred domains. Far in the future, their domain Mantles have passed through many successors. The current Living Legends act as domain leaders, guildmaster-equivalents, and public symbols of order. The protagonist and partner begin as ordinary Pokemon and earn their own legend through Renown, domain trials, and moral choices.

## Key Docs

- [Canon Lock](docs/00_CANON_LOCK.md)
- [PMDO Implementation Plan](docs/01_PMDO_IMPLEMENTATION_PLAN.md)
- [Story and Chapter Plan](docs/02_STORY_AND_CHAPTER_PLAN.md)
- [Progression Systems](docs/03_PROGRESSION_SYSTEMS.md)
- [Domain Interview Notes](docs/04_DOMAIN_INTERVIEW_NOTES.md)
- [PR Roadmap](docs/05_PR_ROADMAP.md)
- [Story Crafting Protocol](docs/06_STORY_CRAFTING_PROTOCOL.md)
- [Storm Domain Story Pass](docs/07_STORM_DOMAIN_STORY_PASS.md)
- [Dream Domain Story Pass](docs/08_DREAM_DOMAIN_STORY_PASS.md)

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
