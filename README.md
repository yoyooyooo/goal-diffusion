# Goal Diffusion

**English** | [中文](README.zh-CN.md)

Goal Diffusion is a goal-driven method for long-running agent work.

It applies to any project type: 0-to-1 MVPs, new features, migrations,
refactors, debugging campaigns, audits, research, documentation governance, or
tooling. The difference is not whether it applies, but which boundaries,
validation methods, and stop conditions each project needs.

It solves a specific problem: when an agent needs to keep working for a long
time, how do you make the goal clearer, the path more verifiable, and the
execution less dependent on an over-specified implementation plan written too
early?

## Diffusion Analogy

The name borrows from diffusion models: low precision becomes high precision.

At the start, you may only have a few coarse goal nodes. As work progresses,
smaller and clearer goal nodes are inserted between distant ones. The goal graph
becomes denser and more precise.

```text
coarse goal -> intermediate goal -> smaller goal -> verifiable goal
```

The links between those nodes are Harness Paths: verifiable paths from the
current goal to the next goal. Every Harness Path needs a validation method:
test scripts, build commands, screenshots, human acceptance checklists, log
collection, data comparison, or any other evidence that proves the path holds.

## Goal-Driven, Not Implementation-Driven

Traditional spec-driven AI coding often aligns with the agent on "how to build"
too early. That can work, but it can also spend too much effort constraining
implementation details before the system has enough evidence.

Goal Diffusion shifts the center of gravity to these questions:

- What goal should be reached?
- What are the boundaries?
- How will we verify the goal is reached?
- When should the agent stop, advance, or return to the human?

This does not remove planning. It avoids wasting strong model capability on an
over-detailed implementation plan when clear goals, boundaries, validation, and
stop conditions are enough for the agent to choose a path and keep calibrating
with evidence.

## Core Objects

| Term | Plain meaning |
| --- | --- |
| Goal Node | A describable and acceptable target point |
| Goal Plan | The goal-contract generation or repair phase, mainly producing `contract.yaml` |
| Harness Path | A verifiable path between two goal nodes |
| Validation | A test, check, collection method, or acceptance method that proves a path |
| Receipt | Evidence recorded after one verified step |
| Goal Pack | Project folder for one long-running goal |
| `contract.yaml` | Target, scope, constraints, and acceptance |
| `state.yaml` | Current progress and the next allowed piece of work |
| `receipts.jsonl` | Append-only evidence from completed work |
| `implementation-plan.md` | Execution plan for high-risk work only |

## How It Works

Goal Diffusion asks one question per pass: what is the smallest verifiable next
step that still moves the goal forward?

```text
goal and boundaries -> contract -> Harness Path -> state -> validation -> receipt -> next goal | audit
```

The loop is deliberately narrow. It does not require a full task tree up front.
It locks the goal and boundaries, finds one verifiable path, does useful work,
records evidence, and then continues sharpening the goal graph.

## Install

Install the CLI first. The CLI inspects goal status, lists todo and done work,
generates briefs, records evidence, advances state, and checks consistency.

```bash
npm install -g goal-diffusion
goal-diffusion --help
```

Then install the Agent Skill. The skill gives the method to the agent: create or
update goal folders, find Harness Paths, validate, record receipts, and decide
the next step.

Recommended full install:

```bash
npx skills add https://github.com/yoyooyooo/goal-diffusion -g --agent '*' --skill '*' --full-depth -y
```

Codex-only install:

```bash
npx skills add https://github.com/yoyooyooo/goal-diffusion -g --agent codex --skill '*' --full-depth -y
```

## How To Use

After installation, you do not need to manually create a Goal Pack or maintain
`contract.yaml` / `state.yaml`. Give the target to the agent and explicitly ask
it to use `$goal-diffusion`.

For a new long-running goal, this is enough:

```text
Use $goal-diffusion:
Goal: the result I want is ...
Context: the current project state is ...
Boundaries: do not change ..., must preserve ...
Acceptance: done means ...
Stop conditions: come back to me if ...
```

The agent will create or update `docs/goal-diffusion/goals/<goal-id>` and use
the CLI for status checks, briefs, receipts, and advancement.

## Aligning With The Agent

The human owns the goal, boundaries, acceptance, and stop conditions. The agent
compiles those inputs into a Goal Plan and writes them into the Goal Pack.

A Goal Plan is not a detailed implementation checklist. It is a goal contract:
what should be achieved, where the scope ends, how it will be verified, and when
the agent should stop. Its main artifact is `contract.yaml`.

After alignment, the agent finds the first Harness Path and writes it into
`state.yaml`. If the goal is still too vague, the agent should ask questions. If
boundaries and acceptance are clear enough, the agent should begin finding a
verifiable path.

## Rolling Execution

Long-running agent work cannot rely on "just keep going." If the goal is too
near, the agent will cautiously do a little and ask again. If the goal is too
far, execution becomes hard to control.

Goal Diffusion gives the agent a far enough goal for direction, while
continually adding smaller and clearer goal nodes to the graph. The agent moves
one verifiable Harness Path at a time.

```text
brief -> work -> verify -> receipt -> advance -> continue or block
```

At the end of each pass, the agent must answer:

- Was this step verified?
- What is the evidence?
- Is the next step still inside the contract?

If yes, it records a receipt and continues. If it hits a boundary violation,
missing permission, failed validation, unclear goal, or no honest verifiable
path, it stops and reports a block.

That is rolling execution: not one giant plan up front, and not asking the human
after every tiny step, but continuous movement through goals, validation,
evidence, and stop conditions.

## Using Codex `/goal`

Goal Diffusion stores long-running goal state. Codex `/goal` hands one execution
run to the agent so it can keep working for a while.

Short prompt:

```text
/goal Use $goal-diffusion: read `goal-diffusion brief <goal-id>`, complete the current active task, verify it, record a receipt, and advance; continue if still inside the contract, otherwise stop and report boundary issues, missing permission, failed validation, or unclear goals.
```

More explicit prompt:

```text
/goal Use $goal-diffusion:
Run `goal-diffusion brief <goal-id>` to get the current brief.
Complete the current active task from the brief.
Run the necessary verification.
Record a receipt and advance state.
If the next step remains inside the contract, continue rolling execution.
If the work crosses a boundary, lacks permission, fails validation, has an unclear goal, or has no verifiable path, stop and report a block.
```

`brief` is an execution brief for the current goal, not a full project plan.
After Codex reads it, the agent should execute, verify, record, and advance by
the Goal Diffusion rules.

## Five Skills

Most users only name `$goal-diffusion`. The other four are phase skills the
agent uses when the state requires them. Advanced users may name a phase skill
directly, but that is not the normal path.

| Skill | When used | Role |
| --- | --- | --- |
| `goal-diffusion` | Normal user entry | Main router that decides the current phase |
| `goal-plans` | No Goal Pack, or unclear contract | Create or repair `contract.yaml` |
| `finding-harnessed-path` | No verifiable next step | Find a Harness Path and write `state.yaml.current_edge` |
| `diffusion-implementation` | Active task exists | Execute, verify, record receipt, advance, and continue inside boundaries |
| `write-implementation-plans` | High-risk work | Write `implementation-plan.md` before execution |

High-risk work usually includes migrations, security, public API/schema/protocol
changes, irreversible data, strict multi-agent coordination, or expensive
rollback.

## Quick Inspect

```bash
goal-diffusion summary .
goal-diffusion list . --completion todo
goal-diffusion inspect <goal-pack> --json
goal-diffusion brief <goal-pack>
```

Use a bare goal id when running inside a project that has
`docs/goal-diffusion/goals/<goal-id>`, or pass the goal folder.

## CLI

```bash
goal-diffusion --help
goal-diffusion <command> --help
goal-diffusion inspect <goal-pack> [--json]
goal-diffusion summary [project-root|goals-dir] [--completion all|todo|done] [--status <status>] [--json]
goal-diffusion list [project-root|goals-dir] [--completion all|todo|done] [--status <status>] [--json]
goal-diffusion brief <goal-pack> [--task T###] [--json]
goal-diffusion dispatch <goal-pack> [--task T###]
goal-diffusion activate <goal-pack> --task T### [--dry-run]
goal-diffusion record <goal-pack> (--file receipt.json | --json '<json>')
goal-diffusion advance <goal-pack> [--dry-run]
goal-diffusion check <goal-pack>
```

`<goal-pack>` may be either a goal folder or a bare goal id. Bare ids
are resolved upward from the current directory through
`docs/goal-diffusion/goals/<goal-id>`.
`summary` accepts a project root or `docs/goal-diffusion/goals` directory, and
defaults upward from the current directory.
`--completion todo` means status is neither `done` nor `retired`; `--status`
filters the raw goal status.

Typical loop:

```text
check -> inspect -> brief -> work -> record -> advance -> check
```

Use `dispatch` only when handing the active or selected task to another agent.

## Goal Folder Files

```text
docs/goal-diffusion/
  README.md
  inbox/
  sources/
  goals/<goal-id>/
    contract.yaml
    state.yaml
    receipts.jsonl
    implementation-plan.md  # only when plan_required
    notes/
```

`contract.yaml` defines the goal and boundaries. `state.yaml` records current
progress and the next allowed task. `receipts.jsonl` is append-only evidence.
`notes/` stores long-form context only when needed.
`implementation-plan.md` exists only when a selected `plan_required` task needs
a reviewed execution plan before work starts.

## Repository Layout

```text
packages/cli/                   TypeScript CLI, built with Bun
skills/goal-diffusion/          Entry skill
skills/goal-plans/              Contract writing skill
skills/finding-harnessed-path/  Next-step selection skill
skills/diffusion-implementation/ Work execution skill
skills/write-implementation-plans/ Plan-required work skill
```

The CLI package is published as `goal-diffusion`.

## Release

Publishing is tag-driven through GitHub Actions and npm Trusted Publishing.
Configure the npm package trusted publisher once:

- Repository: this GitHub repository.
- Workflow: `.github/workflows/publish.yml`.
- Environment: `npm-publish`.

```bash
bun run release:check patch
bun run release patch
# or
bun run release 0.2.0
```

`bun run release:check` runs the release decision without changing files:
clean working tree, checked-out branch, `main` unless `--allow-branch`, npm
version lookup, git tag lookup, and `origin` unless `--no-push`.

The release script creates a temporary local release branch, updates
`package.json`, `packages/cli/package.json`, and `bun.lock` there, commits
`chore: release vX.Y.Z`, creates the `vX.Y.Z` tag on that commit, pushes only the
tag, then returns to the original branch. `main` does not receive a release-only
version commit. If a previous `vX.Y.Z` tag exists but npm does not contain
`X.Y.Z`, the next release reuses and replaces that failed tag. The pushed tag
triggers GitHub Actions, which runs checks, packs the npm tarball, and publishes
with npm Trusted Publishing.

The package uses `files` allowlisting, so the npm tarball contains only
`dist/`, `README.md`, `README.zh-CN.md`, `LICENSE`, and package metadata.

## Development

```bash
bun install
bun run build
bun run typecheck
bun run test
bun run check
```

The CLI source is TypeScript. `bun build` emits the npm package artifacts under
`packages/cli/dist/`.

## License

MIT
