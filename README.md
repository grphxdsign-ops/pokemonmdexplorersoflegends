# Pokemon Mystery Dungeon: Explorers of Legends

Standalone Pokemon Mystery Dungeon-style fangame prototype.

## Current Direction

This is no longer a PMDO Quest package. PMDO can still be used as a structural reference for pacing, dungeons, dialogue flow, and familiar Mystery Dungeon feel, but the active game is standalone and lives in this repository. The current primary build is a C# Windows desktop app, with the earlier browser prototype kept as a reference slice.

Core premise:

The original legendary and mythical Pokemon were ancient First Legends tied to sacred domains. Far in the future, their domain Mantles have passed through many successors. The current Living Legends act as domain leaders, guildmaster-equivalents, and public symbols of order. The protagonist and partner begin as ordinary Pokemon and earn their own legend through Renown, domain conflicts, and moral choices.

## Play Now

Desktop build:

```text
desktop\ExplorersOfLegends\build_desktop.cmd
desktop\ExplorersOfLegends\build\ExplorersOfLegends.exe
```

The desktop app uses the Windows C# compiler that ships with .NET Framework, so it does not require the .NET SDK on this machine.

Browser prototype:

Open:

```text
game/index.html
```

No external engine, PMDO install, or Quest package is required for either prototype.

## Current Prototype

- C# desktop app with PMD-inspired loading/title screen.
- Personality quiz.
- Partner selection after the quiz.
- Lowstep hub.
- First Step Cave with four short floors.
- Arcanine rescue scene.
- First Renown reward.
- Equal-cost Attribute Point spending.
- Desktop save/continue support.

## Key Docs

- [Canon Lock](docs/00_CANON_LOCK.md)
- [Standalone Implementation Plan](docs/01_STANDALONE_IMPLEMENTATION_PLAN.md)
- [Story and Chapter Plan](docs/02_STORY_AND_CHAPTER_PLAN.md)
- [Progression Systems](docs/03_PROGRESSION_SYSTEMS.md)
- [Domain Interview Notes](docs/04_DOMAIN_INTERVIEW_NOTES.md)
- [PR Roadmap](docs/05_PR_ROADMAP.md)
- [Story Crafting Protocol](docs/06_STORY_CRAFTING_PROTOCOL.md)
- [Storm Domain Story Pass](docs/07_STORM_DOMAIN_STORY_PASS.md)
- [Dream Domain Story Pass](docs/08_DREAM_DOMAIN_STORY_PASS.md)
- [Playable MVP Scope](docs/09_PLAYABLE_MVP_SCOPE.md)
- [Mechanics MVP Spec](docs/10_MECHANICS_MVP_SPEC.md)
- [PMDO Asset Loading](docs/11_PMDO_ASSET_LOADING.md)
- [Desktop Build README](desktop/ExplorersOfLegends/README.md)
