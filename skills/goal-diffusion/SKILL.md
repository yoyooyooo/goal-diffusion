---
name: goal-diffusion
description: >-
  Runs Goal Diffusion as a Goal Pack operating system for long-running AI
  coding: charter.yaml, state.yaml, receipts.jsonl, harnessed edges, and
  completion audit. Use when work is broad, ambiguous, evidence-sensitive,
  likely to span multiple receipts/sessions, involves Goal Pack migration, or
  when the user says to turn a discussed plan or solution into a Goal Plan.
---

# Goal Diffusion

Goal Diffusion is goal denoising through harnessed edges.

```text
human intent -> charter -> edge -> state -> receipt -> next edge | audit
```

Invariant:

```text
Goals are connected by harnessed paths and evidence chains, not by speculative task trees.
```

Ready gate:

```text
Goal Pack ready = charter boundary stable + current_edge falsifiable
```

A task list, roadmap paragraph, or future smoke name does not make a Goal Pack
ready. If `charter.yaml` exists but `state.yaml.current_edge` cannot yet prove
or falsify the next movement, keep the next phase as edge discovery rather than
reporting run readiness.

## User Phrase Mapping

When a user says "turn this into a Goal Plan", treat "Goal Plan" as a natural
language alias for creating or updating a Goal Pack.

Do not create a separate prose plan file or build a speculative task tree.
Compile the discussed solution into the current Goal Pack shape: `charter.yaml`,
`state.yaml`, and `receipts.jsonl`. Add `implementation-plan.md` only when a
selected task is `plan_required`.

## Use Or Stay Inline

Stay inline when one evidence path in the current turn can prove completion.

Create or update a Goal Pack when completion needs multiple receipts, durable
state, transition continuity, disjoint write scopes, or cross-session resume.

## Core Loop

```text
check -> inspect -> brief -> work -> record -> advance -> check
```

Read or create the Goal Pack, keep the charter boundary stable, run the next
harnessed edge, append one receipt, advance state, and continue by default while
the charter remains valid.

Before running implementation, check that `state.yaml.current_edge` names:
source state, target delta, harnessed path, verification, and failure
inspection. If any of these are only summaries, first sharpen the edge.

## Goal Pack Shape

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

Read [references/artifact-routing.md](references/artifact-routing.md) before
placing artifacts. Read [references/bootstrap.md](references/bootstrap.md)
before initializing a project.

## Boundary

Humans own `objective`, `engineering_guidance`, `authority_refs`,
`constraints`, `completion`, `claim_boundary`, and `stop_rules`.

Agents own authority reading, Goal Pack creation/repair, harnessed edge
discovery, implementation, verification, receipt append, state update, and
continuation while the next step remains inside the charter boundary.

Stop only when fields listed in `autonomy.cannot_silently_change` must change,
no honest falsifiable path exists, or the work crosses security, permission,
credential, private-data, public API/schema/protocol, destructive, or compliance
authority.

## Governance Routing

Goal Diffusion owns inbox/source/Goal Pack/receipt lifecycle. Read
[references/artifact-routing.md](references/artifact-routing.md) before placing
weak signals, consumed sources, successor Goal Packs, leftover gaps, or retained
evidence. Do not duplicate this lifecycle in project-level docs.

## Phases

Use phase skills through this controller unless the user targets a phase:

- `skills/goal-plans/`: compile or repair `charter.yaml`.
- `skills/finding-harnessed-path/`: write `state.yaml.current_edge`.
- `skills/diffusion-implementation/`: run, verify, receipt, advance, continue.
- `skills/write-implementation-plans/`: write `implementation-plan.md` only for
  high-risk selected slices.

## Completion

Completion requires a final audit receipt that maps the receipt chain to
`completion.final_proof` and records `oracle_satisfied: true`.

If the Goal Pack is a successor, final audit should include relation evidence
tokens proving predecessor receipts and required evidence were checked.

## References

CLI commands: [references/cli.md](references/cli.md). Goal Relations:
[references/goal-relations.md](references/goal-relations.md). Checker rules:
[references/checker-rules.md](references/checker-rules.md). Schema migration:
[references/schema-terminology-migration.md](references/schema-terminology-migration.md).
Examples: [EXAMPLES.md](EXAMPLES.md).
