# PR Roadmap

Goal: keep every change small enough for focused review by humans and any installed review tools such as Greptile or Greploop.

## Current Remote Status

Local planning can proceed now.

Remote PR creation is blocked until a GitHub repository exists. Current available GitHub connector tools can work inside existing repositories, but do not expose new repository creation. The local machine also does not currently have GitHub CLI installed or a `GITHUB_TOKEN` / `GH_TOKEN` environment variable.

The in-app browser is not logged into GitHub, so repository creation through the GitHub website is also blocked for now.

Local repository status:

```text
Initialized on main.
Initial planning commit: Add PMDO planning docs.
```

Connected GitHub account found:

```text
grphxdsign-ops
```

Needed remote target:

```text
grphxdsign-ops/PokeRom
```

## Planned PR Sequence

### PR 1: Canon and PMDO planning docs

Status: prepared locally as the initial baseline commit because no remote repository exists yet.

Branch:

```text
codex/canon-pmdo-plan
```

Scope:

- README
- canon lock
- PMDO implementation plan
- story outline
- progression systems
- domain interview notes
- PR roadmap

Review focus:

- Is the new story canon accurate?
- Are the locked domain Mantles correct?
- Is the PMDO strategy reasonable?

### PR 2: PMDO Quest skeleton

Branch:

```text
codex/pmdo-quest-skeleton
```

Scope:

- generated PMDO Quest folder
- baseline `Mod.xml`
- empty bootable quest
- placeholder hub
- placeholder first dungeon

Review focus:

- PMDO launches.
- Quest package is source controlled cleanly.
- No generated junk files are committed.

### PR 2A: Domain interview round 1

Branch:

```text
codex/domain-interview-round-1
```

Status: prepared locally.

Scope:

- Arcanine motivation lock.
- Houndoom motivation lock.
- Zoroark motivation lock.
- Dusknoir suspicion arc lock.
- Storm as the first full domain arc.

Review focus:

- Villain motivations.
- Dusknoir innocence arc.
- First domain arc choice.
- Whether the partner's moral drift has enough pressure from Team Apex and Arcanine.

### PR 3: Progression data prototype

Branch:

```text
codex/progression-prototype
```

Scope:

- Renown variables
- attribute point variables
- hidden skill rank variables
- debug test scripts
- save/load persistence check

Review focus:

- variables persist correctly,
- Speed is treated as accuracy/evasion,
- AP costs are equal for all species.

### PR 4: Prologue vertical slice

Branch:

```text
codex/prologue-vertical-slice
```

Scope:

- protagonist mundane opening,
- partner pitch,
- first small dungeon,
- Arcanine rescue scene,
- first Renown award.

Review focus:

- emotional tone,
- partner characterization,
- Arcanine inspiration/foreshadowing balance.

### PR 5: First domain arc

Branch:

```text
codex/first-domain-arc
```

Scope:

- first chosen domain,
- Living Legend personality,
- domain crisis,
- optional questline,
- Team Apex pressure scene.

Review focus:

- quest branching,
- Renown consequences,
- domain identity.

## Review Tool Notes

Greptile and Greploop are not directly callable from this workspace right now. If they are installed as GitHub apps or checks on the future repository, this PR structure should give them useful focused diffs.

Each PR should include:

- what changed,
- why it changed,
- PMDO test steps,
- story/design review questions,
- known risks.
