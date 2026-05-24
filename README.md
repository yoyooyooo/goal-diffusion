![](https://github.com/yoyooyooo/goal-diffusion/raw/main/assets/banner.png)

**English** | [中文](README.zh-CN.md)

# Goal Diffusion

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
| Goal Thread | Shared `goal_relations.thread_id` label across related Goal Packs |
| Goal Relation | Typed, evidence-linked metadata from one Goal Pack to another |
| Derived Graph View | CLI-rendered view from Goal Relations, not stored planning state |
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

## Goal Relations

Goal Relations connect independent Goal Packs without creating another planning
object. A Goal Pack stays the unit of completion: one objective, one oracle, one
state file, and one append-only receipt chain.

A Goal Thread is only a shared `thread_id` label. It has no lifecycle, task
list, state file, receipt stream, registry, or stored graph.

Relations live in `contract.yaml` metadata:

```yaml
goal_relations:
  thread_id: goal-relations
  links:
    - goal_id: 2026-05-23-goal-relations-protocol
      relation: successor_of
      receipt_ref: T999
      evidence:
        - goal_relations_protocol_documented=true
```

Allowed relation types are `successor_of`, `depends_on`, `supersedes`, and
`related_to`. A successor should reference predecessor receipt evidence when
the predecessor is done. Done Goal Packs are append-only closed by default;
normal follow-up starts a successor Goal Pack instead of reopening the old one.

The graph is derived from Goal Relations at inspection time. It is not stored in
the repository as planning state.

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
goal-diffusion tasks <goal-pack>
goal-diffusion receipts list <goal-pack> --limit 5
goal-diffusion relations goals . --thread <thread-id> --completion todo --json
goal-diffusion relations tasks . --thread <thread-id> --completion todo --json
goal-diffusion brief <goal-pack>
```

Relations commands inspect cross-pack continuity and discover thread-member
candidates. They do not create a queue, worklist, scheduler, thread lifecycle,
or execution order.

```bash
goal-diffusion relations list [project-root|goals-dir] [--thread <id>] [--limit N] [--include fields] [--show-empty] [--json]
goal-diffusion relations goals [project-root|goals-dir] [--thread <id>] [--completion all|todo|done] [--status forming|ready|running|blocked|done|retired] [--next-decision edge|continue|plan_required|blocked|audit|done|needs-human] [--limit N] [--include fields] [--show-empty] [--json]
goal-diffusion relations tasks [project-root|goals-dir] [--thread <id>] [--completion all|todo|done] [--status queued|active|blocked|done] [--goal-completion all|todo|done] [--goal-status forming|ready|running|blocked|done|retired] [--goal <goal-id>] [--limit N] [--include fields] [--show-empty] [--json]
goal-diffusion relations check [project-root|goals-dir] [--thread <id>] [--json]
goal-diffusion relations graph [project-root|goals-dir] [--thread <id>] [--json]
```

Use a bare goal id when running inside a project that has
`docs/goal-diffusion/goals/<goal-id>`, or pass the goal folder.

## CLI

```bash
goal-diffusion --help
goal-diffusion <command> --help
goal-diffusion inspect <goal-pack> [--json]
goal-diffusion summary [project-root|goals-dir] [--completion all|todo|done] [--status <status>] [--depth repo|groups|items] [--limit N] [--include fields] [--show-empty] [--json]
goal-diffusion list [project-root|goals-dir] [--completion all|todo|done] [--status <status>] [--limit N] [--include fields] [--show-empty] [--json]
goal-diffusion tasks <goal-pack> [--completion all|todo|done] [--status queued|active|blocked|done] [--limit N] [--include fields] [--show-empty] [--json]
goal-diffusion receipts list <goal-pack> [--limit N] [--task T###] [--type <value>] [--result done|blocked] [--decision <value>] [--next-decision <value>] [--oracle-satisfied true|false] [--changed-file <glob>] [--command-status pass|fail] [--contains <text>] [--include fields] [--show-empty] [--json]
goal-diffusion receipts show <goal-pack> --index N [--json]
goal-diffusion relations list [project-root|goals-dir] [--thread <id>] [--limit N] [--include fields] [--show-empty] [--json]
goal-diffusion relations goals [project-root|goals-dir] [--thread <id>] [--completion all|todo|done] [--status forming|ready|running|blocked|done|retired] [--next-decision edge|continue|plan_required|blocked|audit|done|needs-human] [--limit N] [--include fields] [--show-empty] [--json]
goal-diffusion relations tasks [project-root|goals-dir] [--thread <id>] [--completion all|todo|done] [--status queued|active|blocked|done] [--goal-completion all|todo|done] [--goal-status forming|ready|running|blocked|done|retired] [--goal <goal-id>] [--limit N] [--include fields] [--show-empty] [--json]
goal-diffusion relations check [project-root|goals-dir] [--thread <id>] [--json]
goal-diffusion relations graph [project-root|goals-dir] [--thread <id>] [--json]
goal-diffusion brief <goal-pack> [--task T###] [--json]
goal-diffusion dispatch <goal-pack> [--task T###]
goal-diffusion activate <goal-pack> --task T### [--dry-run]
goal-diffusion record <goal-pack> (--file receipt.json | --json '<json>' | --stdin)
goal-diffusion advance <goal-pack> [--dry-run]
goal-diffusion check <goal-pack>
```

`<goal-pack>` may be either a goal folder or a bare goal id. Bare ids
are resolved upward from the current directory through
`docs/goal-diffusion/goals/<goal-id>`.
`summary` accepts a project root or `docs/goal-diffusion/goals` directory, and
defaults upward from the current directory.
For `summary` and `list`, `--completion todo` means goal status is neither
`done` nor `retired`, and `--status` filters raw Goal Pack status.
Read JSON commands use shared output controls: `--limit` bounds visible
collections, `--include path,objective,links` restores omitted detail, and
`--show-empty` restores empty/default fields. Defaults omit empty arrays, nulls,
paths, objectives, raw links, and zero-valued buckets unless the value carries
direct decision value.
`summary` defaults to `--depth groups` and `--limit 20`. `--depth repo` returns
repo totals plus thread/unthreaded counts, `--depth groups` returns thread and
unthreaded group summaries, and `--depth items` expands bounded goal items under
their thread groups while leaving only unthreaded goals in top-level `items`.
Filters apply before aggregation.
For `tasks`, `--completion todo` means task status is not `done`, and `--status`
filters raw task status.
For `receipts list`, filters compose with AND semantics and output compact
receipt summaries by default. Use `receipts show --index N` to expand one full
receipt.
For `record`, choose exactly one input source. Use `--stdin` for heredoc receipt
JSON; `activate` and `advance` remain state-transition commands and do not
accept payload input.
For `relations`, `list` shows relation metadata, `check` validates relation
evidence, and `graph` renders a derived relation graph. `goals` discovers
thread-member Goal Packs with goal-level filters. `tasks` discovers
thread-member tasks; `--status` filters task status, while `--goal-status` and
`--goal-completion` filter parent Goal Packs. These commands use
`goal_relations.thread_id` as a label only and do not choose execution order.

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
