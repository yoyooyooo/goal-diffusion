![](https://github.com/yoyooyooo/goal-diffusion/raw/main/assets/banner.png)

**English** | [中文](README.zh-CN.md)

# AI Coding Project OS

AI Coding Project OS is a project-level long-term governance method suite for
highly capable coding agents.

It applies to any project type: 0-to-1 MVPs, new features, migrations,
refactors, debugging campaigns, audits, research, documentation governance, or
tooling. The difference is not whether it applies, but which boundaries,
validation methods, evidence strength, and stop conditions each project needs.

The default user entry is `$ai-coding-project-os`. It is a thin router: it owns
no durable artifacts and routes work to Goal Diffusion, Docs Governance,
Headless Product Harness, or inline execution.

It does not try to lock a strong agent inside a giant task table. It gives the
agent clear routing, a clear charter when needed, a verifiable current edge,
receipt-backed execution, and a stricter path only when risk calls for it.

## Suite

| Skill | Role |
| --- | --- |
| `ai-coding-project-os` | Default user entry; routes and coordinates, owns no durable artifact |
| `goal-diffusion` | Goal planning, Goal Packs, rolling execution, cross-session continuation |
| `docs-governance` | Docs layers, SSoT, standards, ADRs, roadmaps, cleanup, audit |
| `headless-product-harness` | Proof commands, smoke checks, fixture/replay, evidence envelope |
| `goal-plans` | Goal Diffusion phase skill: create or repair `charter.yaml` |
| `finding-harnessed-path` | Goal Diffusion phase skill: find current edge |
| `diffusion-implementation` | Goal Diffusion phase skill: execute, verify, receipt, advance |
| `write-implementation-plans` | Goal Diffusion phase skill: write `implementation-plan.md` for high-risk slices |

Most users should name only `$ai-coding-project-os`. When the user explicitly
asks for a goal plan, Goal Pack, long-running continuation, or names
`$goal-diffusion`, Goal Diffusion is the planning and continuation carrier.
Small concrete changes stay inline and do not create a Goal Pack.

## Diffusion Analogy

The name borrows from diffusion models: low precision becomes high precision.

At the start, you may only have a coarse target. As work progresses, the agent
inserts smaller, clearer, verifiable states between the target and reality.

```text
coarse target -> current edge -> evidenced state change -> sharper next step
```

The links between those states are Harness Paths: verifiable paths from current
state to sharper state. A check can be a test script, build command, CLI output,
screenshot, log collection, human acceptance checklist, data comparison, or any
other evidence that supports the claim.

## Goal-Driven, Not Implementation-Driven

Traditional spec-driven AI coding often aligns with the agent on "how to build"
too early. That can work, but it can also spend too much effort constraining
implementation details before the system has enough evidence.

AI Coding Project OS shifts the center of gravity to these questions:

- What goal should be reached?
- What are the boundaries?
- How will we verify the goal is reached?
- When should the agent stop, advance, or return to the human?

This does not remove planning. Planning is carried by Goal Packs when the user
asks for it or the work needs durable continuation. It avoids wasting strong
model capability on an over-detailed implementation plan when clear goals,
boundaries, validation, and stop conditions are enough for the agent to choose a
path and keep calibrating with evidence.

## Core Objects

| Term | Plain meaning |
| --- | --- |
| Goal Pack | Completion unit for one long-running goal |
| Goal Charter | Executable compression of human intent and authorization |
| Current Edge | Current smallest verifiable movement path |
| Harness Path | Verifiable path from current state to sharper state |
| Check | Test, command, manual gate, or evidence collection method behind a claim |
| Receipt | Append-only evidence checkpoint after executed work |
| Final Audit | Completion evidence summary mapped back to `completion` |
| Goal Thread | Shared `goal_relations.thread_id` label across related Goal Packs |
| Goal Relation | Typed, evidence-linked metadata from one Goal Pack to another |
| Derived Graph View | CLI-rendered view from Goal Relations, not stored planning state |
| `charter.yaml` | Goal authorization, boundaries, completion criteria, and autonomy policy |
| `state.yaml` | Runtime state, active task, current edge, and next decision |
| `receipts.jsonl` | Append-only receipts |
| `implementation-plan.md` | Plan for `plan_required` high-risk slices only |

## How It Works

Goal Diffusion asks one question per pass: what is the smallest verifiable next
edge that still moves the goal forward?

```text
human intent
  -> agent writes goal charter
  -> agent finds current edge
  -> agent executes largest safe useful slice
  -> agent records receipt
  -> continue | plan_required | blocked | audit
  -> final audit maps evidence to completion
  -> done
```

The loop is deliberately narrow. It does not require a full task tree up front.
It locks the goal and boundaries, finds one verifiable path, does useful work,
records evidence, and then continues from the next edge.

A Goal Pack is not ready because it has a task list. It is ready when the
charter boundary is stable and `state.yaml.current_edge` can prove or falsify
the next movement. A good edge names the starting state, target delta, input or
fixture, check command or manual gate, expected positive evidence, negative
claims, claim ceiling, and failure inspection path.

Default work does not require machine-level formal proof. Completion discipline
still applies: any `done` claim must say which completion criteria were met,
where the evidence is, what is not claimed, and where remaining gaps went.

## Install

Install the CLI first. The CLI inspects goal status, lists todo and done work,
generates briefs, records evidence, advances state, and checks consistency.

```bash
npm install -g goal-diffusion
goal-diffusion --help
```

Then install the Agent Skills. The entry skill routes project-level intent; the
method skills create or update goal folders, govern docs layers, design
verification paths, record receipts, and decide the next step.

Recommended full install:

```bash
npx skills add https://github.com/yoyooyooo/goal-diffusion -g --agent '*' --skill '*' --full-depth -y
```

The GitHub repository URL currently remains `goal-diffusion` for distribution
compatibility; the project name is AI Coding Project OS.

Codex-only install:

```bash
npx skills add https://github.com/yoyooyooo/goal-diffusion -g --agent codex --skill '*' --full-depth -y
```

## How To Use

For normal project work, enter through `$ai-coding-project-os`:

```text
Use $ai-coding-project-os:
I want to govern / plan / implement / audit ...
Context: ...
Boundaries: ...
Acceptance: ...
```

After installation, you do not need to manually create a Goal Pack or maintain
`charter.yaml` / `state.yaml`. If you want a goal plan, long-running
continuation, or a Goal Pack, give the target to the agent and explicitly ask it
to use `$goal-diffusion`.

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
compresses those inputs into a Goal Charter and writes them into the Goal Pack.

A Goal Charter is not a detailed implementation checklist. It is the executable
goal authorization: what should be achieved, where the scope ends, how it will
be verified, and when the agent should stop. Its main artifact is
`charter.yaml`.

After alignment, the agent finds the first Harness Path and writes it into
`state.yaml`. If the goal is still too vague, the agent should ask questions. If
boundaries and acceptance are clear enough, the agent should begin finding a
verifiable path.

Charter alignment and edge discovery form one closed loop. If only the charter
exists, the next step is edge discovery, not implementation.

## Rolling Execution

Long-running agent work cannot rely on "just keep going." If the goal is too
near, the agent may cautiously do a little and ask again. If the goal is too
far, execution becomes hard to control.

Goal Diffusion gives the agent a far enough goal for direction, while
continually adding smaller and clearer goal nodes to the graph. The agent moves
one verifiable Harness Path at a time.

```text
charter -> edge -> work -> check -> receipt -> continue | plan_required | blocked | audit
```

At the end of each pass, the agent must answer:

- Was this step verified?
- What is the evidence?
- Is the next step still inside the charter boundary?

If yes, it records a receipt and continues. If it hits a boundary violation,
missing permission, failed validation, unclear goal, or no honest verifiable
path, it stops and reports a block.

That is rolling execution: not one giant plan up front, and not asking the human
after every tiny step, but continuous movement through goals, validation,
evidence, and stop conditions.

## Goal Relations

Goal Relations connect independent Goal Packs without creating another planning
object. A Goal Pack stays the unit of completion: one objective, one completion,
one state file, and one append-only receipt chain.

A Goal Thread is only a shared `thread_id` label. It has no lifecycle, task
list, state file, receipt stream, registry, or stored graph.

Relations live in `charter.yaml` metadata:

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

## Current Vocabulary

This README uses the v1 vocabulary: `charter.yaml`, `completion`,
`engineering_guidance`, `checks`, and `evidence_map`.

The active CLI, templates, skills, checker behavior, tests, README files, and
dogfood Goal Packs use v1 vocabulary as the primary path. Older vocabulary may
remain only in archived source material or migration receipts that preserve the
evidence trail.

## Using Codex `/goal`

Goal Diffusion stores long-running goal state. Codex `/goal` hands one execution
run to the agent so it can keep working for a while.

Short prompt:

```text
/goal Use $goal-diffusion: read `goal-diffusion brief <goal-id>`, complete the current active task, verify it, record a receipt, and advance; continue if still inside the charter boundary, otherwise stop and report boundary issues, missing permission, failed validation, or unclear goals.
```

More explicit prompt:

```text
/goal Use $goal-diffusion:
Run `goal-diffusion brief <goal-id>` to get the current brief.
Complete the current active task from the brief.
Run the necessary verification.
Record a receipt and advance state.
If the next step remains inside the charter boundary, continue rolling execution.
If the work crosses a boundary, lacks permission, fails validation, has an unclear goal, or has no verifiable path, stop and report a block.
```

`brief` is an execution brief for the current goal, not a full project plan.
After Codex reads it, the agent should execute, verify, record, and advance by
the Goal Diffusion rules.

## Skill Routing

Most users only name `$ai-coding-project-os`. It routes to the owning method by
intent. Advanced users may name a concrete method or phase skill directly.

| Skill | When used | Role |
| --- | --- | --- |
| `ai-coding-project-os` | Default entry | Decide inline work vs. method routing |
| `docs-governance` | Docs layer, authority, cleanup, audit | Govern docs structure and lifecycle |
| `headless-product-harness` | Command surfaces, smoke proof, evidence envelope | Design verifiable headless product paths |
| `goal-diffusion` | Goal plan, Goal Pack, long-running work | Goal Pack method router |
| `goal-plans` | No Goal Pack, or unclear charter | Create or repair `charter.yaml` |
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
    charter.yaml
    state.yaml
    receipts.jsonl
    implementation-plan.md  # only when plan_required
    notes/
```

`charter.yaml` defines the goal authorization, boundaries, completion criteria,
and autonomy policy. `state.yaml` records runtime state and the next allowed
task. `receipts.jsonl` is append-only evidence.
`notes/` stores long-form context only when needed.
`implementation-plan.md` exists only when a selected `plan_required` task needs
a reviewed execution plan before work starts.

## Repository Layout

```text
packages/cli/                    TypeScript CLI, built with Bun
skills/ai-coding-project-os/     OS entry skill
skills/docs-governance/          Docs governance skill
skills/headless-product-harness/ Headless proof / evidence skill
skills/goal-diffusion/           Goal Pack method entry skill
skills/goal-plans/               Goal Charter authoring skill
skills/finding-harnessed-path/   Next-step selection skill
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
