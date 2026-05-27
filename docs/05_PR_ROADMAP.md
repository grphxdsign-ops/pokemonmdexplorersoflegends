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

### PR 2B: Storm domain interview round 2

Branch:

```text
codex/storm-domain-round-2
```

Status: prepared locally after Round 2 answers.

Base branch:

```text
codex/domain-interview-round-1
```

Scope:

- Luxray personality lock.
- Lightning Cliffs setting lock.
- Storm Domain crisis lock.
- Banette and Porygon false evidence.
- Team Apex's ruthless-but-not-cheating role.
- Arcanine's staged rescue of the protagonist and partner.

Review focus:

- Whether Storm works as the first suspicion arc.
- Whether Arcanine's rescue hides the betrayal cleanly.
- Whether Team Apex feels present without starting the partner's desperation too early.
- Whether Dusknoir suspicion is strong without proving guilt too early.

### PR 2C: Story autonomy and Storm draft

Branch:

```text
codex/story-autonomy-pass
```

Status: prepared locally after the user requested fewer micro-interviews.

Base branch:

```text
codex/storm-domain-round-2
```

Scope:

- Add story crafting protocol.
- Define when to ask the user versus when to craft autonomously.
- Add autonomous Storm Domain story pass.
- Decide Banette and Porygon are real Void agents attempting containment, not poisoning the water.
- Decide Luxray is affected by nightmare-laced distortion residue.
- Decide Team Apex functions as brutal problem-solvers in Storm.
- Define Thunderhead Crossing, Static Run, Raincoil Aqueduct, Stormcall Perch, and Lightning Crown Summit.

Review focus:

- Whether the autonomy policy avoids over-interviewing.
- Whether Storm has enough mystery momentum.
- Whether Arcanine's staged rescue remains subtle.
- Whether the false clue against Void is believable.

### PR 2D: Dream, partner, and Team Apex round 3

Branch:

```text
codex/dream-partner-apex-round-3
```

Status: prepared locally after Round 3 answers.

Base branch:

```text
codex/story-autonomy-pass
```

Scope:

- Lock partner selection after the quiz.
- Lock Dream as the domain after Storm.
- Lock Musharna's dialogue sleep habit.
- Lock Team Apex's later Void-corruption fall and redemption start.
- Add autonomous Dream Domain story pass.

Review focus:

- Whether partner species flexibility can coexist with fixed partner personality.
- Whether Dream Domain works as a mystery-deepening follow-up to Storm.
- Whether Musharna's sleep habit is funny without undercutting authority.
- Whether Team Apex's eventual redemption path has enough consequence.

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
