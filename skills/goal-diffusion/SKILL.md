---
name: goal-diffusion
description: >-
  Goal operating system for long-running AI coding. Use when work is broad,
  distant, ambiguous, evidence-sensitive, likely to span more than one verified
  receipt, or needs an agent to keep moving inside human-owned objective,
  architecture, authority, and claim boundaries. Creates or updates Goal Packs,
  discovers harnessed edges, runs verified useful slices, appends receipts, and
  completes only through oracle-backed audit.
---

# Goal Diffusion

Goal Diffusion is goal denoising through harnessed edges.

```text
human target + authority -> contract -> edge -> state -> receipt -> next edge | audit
```

Invariant:

```text
Goals are connected by harnessed paths and evidence chains, not by speculative task trees.
```

## Goal Relations

Goal Packs may declare cross-pack continuity in `contract.yaml`:

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

Rules:

- Goal Pack remains the completion unit: one objective, one oracle, one state,
  one append-only receipt chain.
- Goal Thread is only a shared `thread_id` label. It owns no state, task list,
  receipt stream, lifecycle, registry, or graph file.
- Goal Relation is metadata on a Goal Pack. Allowed relation types are
  `successor_of`, `depends_on`, `supersedes`, and `related_to`.
- Graph views are derived from Goal Relations at inspection time; never store a
  graph as planning state.
- Done Goal Packs are append-only closed by default. Normal follow-up creates a
  successor Goal Pack and references predecessor receipt evidence.

## Use Or Stay Inline

Stay inline when one evidence path in the current turn can prove completion.

Create or update a Goal Pack when completion needs multiple receipts, durable
state, transition continuity, disjoint write scopes, or cross-session resume.

## Governance Routing

Goal Diffusion owns the goal artifact lifecycle:

```text
human signal -> inbox | source | goal pack | inline work
goal pack -> state edge -> receipt -> next edge | final audit
leftover gap -> inbox | successor goal pack | nearest implementation artifact
```

Use inbox for weak signals, open candidates, gap maps, and raw human input that
is not ready to run. Inbox is not a backlog, task list, roadmap, or completion
state.

Promote an inbox item to a Goal Pack only when the agent can honestly state:

```text
objective
authority_refs
completion_oracle
claim_boundary
first harnessed edge
```

Use sources for consumed context kept for traceability. Sources are not open
candidates. Use receipts for evidence. Use notes for long narrative only when a
human-readable digest or rubric is needed.

Use only the active homes in the Goal Pack shape for default operation. If a
host project already has an explicit equivalent, map it to the Goal Pack roles
instead of duplicating state.

Project-local governance may define authority layers, language policy,
commands, product promotion targets, or verification gates. Method-general
rules about seed/inbox routing, Goal Pack promotion, receipt-backed completion,
retention, and cleanup should live in this skill or its references, not be
reimplemented in each project.

## Boundary

Humans own `objective`, `architecture_standard`, `authority_refs`,
`constraints`, `completion_oracle`, `claim_boundary`, and `stop_rules`.

Agents own authority reading, Goal Pack creation/repair, harnessed edge
discovery, implementation, verification, receipt append, state update, and
continuation while the next step remains inside the contract.

Stop only when protected fields must change, no honest falsifiable path exists,
or the work crosses security, permission, credential, private-data, public
API/schema/protocol, destructive, or compliance authority.

## Goal Pack Shape

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

Read [references/artifact-routing.md](references/artifact-routing.md) before
placing artifacts. Read [references/bootstrap.md](references/bootstrap.md)
before initializing a project.

## CLI

```bash
npm install -g goal-diffusion
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

`<goal-pack>` may be a directory or a bare goal id under
`docs/goal-diffusion/goals/`. `summary` and `list` accept a project root or
`docs/goal-diffusion/goals` directory. For `summary` and `list`,
`--completion todo` means goal status is neither `done` nor `retired`, and
`--status` filters raw Goal Pack status. For `tasks`, `--completion todo`
means task status is not `done`, and `--status` filters raw task status. For
`receipts list`, filters compose with AND semantics and output compact receipt
summaries by default; use `receipts show --index N` to expand one full receipt.
Read JSON commands share output controls: `--limit` bounds collections,
`--include path,objective,links` restores omitted detail, and `--show-empty`
restores empty/default fields. `summary` defaults to `--depth groups` and
`--limit 20`; `--depth repo` returns only repo totals plus thread/unthreaded
counts, while `--depth items` nests threaded goal items under `threads` and
leaves only unthreaded goals in top-level `items`.
For `record`, choose exactly one input source; use `--stdin` for heredoc receipt
JSON. `activate` and `advance` are state-transition commands, not payload input
commands.
`relations` commands inspect and verify Goal Relations across a project or
goals directory. `relations goals` and `relations tasks` are broad discovery
commands for thread-member candidates; `--thread` filters by
`goal_relations.thread_id`. They do not create a queue, worklist, scheduler,
thread lifecycle, or execution order.
Work loop:

```text
check -> inspect -> brief -> work -> record -> advance -> check
```

Use `dispatch` only for delegation; without `--task` it uses `active_task`.

Local development uses:

```bash
bun install
bun run check
```

## Phases

Use phase skills through this controller unless the user targets a phase:

- `skills/goal-plans/`: compile or repair `contract.yaml`.
- `skills/finding-harnessed-path/`: write `state.yaml.current_edge`.
- `skills/diffusion-implementation/`: run, verify, receipt, advance, continue.
- `skills/write-implementation-plans/`: write an implementation plan only for
  high-risk selected slices.

Completion requires a final audit receipt that maps the receipt chain to
`completion_oracle.final_proof` and records `oracle_satisfied: true`.
When a Goal Pack is a successor, final audit should include relation evidence
tokens proving predecessor receipts and required evidence were checked.
