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

## Use Or Stay Inline

Stay inline when one evidence path in the current turn can prove completion.

Create or update a Goal Pack when completion needs multiple receipts, durable
state, transition continuity, disjoint write scopes, or cross-session resume.

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
goal-diffusion summary [project-root|goals-dir] [--completion all|todo|done] [--status <status>] [--json]
goal-diffusion list [project-root|goals-dir] [--completion all|todo|done] [--status <status>] [--json]
goal-diffusion tasks <goal-pack> [--completion all|todo|done] [--status queued|active|blocked|done] [--json]
goal-diffusion brief <goal-pack> [--task T###] [--json]
goal-diffusion dispatch <goal-pack> [--task T###]
goal-diffusion activate <goal-pack> --task T### [--dry-run]
goal-diffusion record <goal-pack> (--file receipt.json | --json '<json>')
goal-diffusion advance <goal-pack> [--dry-run]
goal-diffusion check <goal-pack>
```

`<goal-pack>` may be a directory or a bare goal id under
`docs/goal-diffusion/goals/`. `summary` and `list` accept a project root or
`docs/goal-diffusion/goals` directory. For `summary` and `list`,
`--completion todo` means goal status is neither `done` nor `retired`, and
`--status` filters raw Goal Pack status. For `tasks`, `--completion todo`
means task status is not `done`, and `--status` filters raw task status. Work loop:

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

Use flat phase skills through this controller unless the user targets a phase:

- `skills/goal-plans/`: compile or repair `contract.yaml`.
- `skills/finding-harnessed-path/`: write `state.yaml.current_edge`.
- `skills/diffusion-implementation/`: run, verify, receipt, advance, continue.
- `skills/write-implementation-plans/`: write an implementation plan only for
  high-risk selected slices.

Completion requires a final audit receipt that maps the receipt chain to
`completion_oracle.final_proof` and records `oracle_satisfied: true`.
