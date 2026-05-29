---
name: goal-proof
description: >-
  Runs Goal Proof System as the Goal Pack operating method for long-running AI
  coding: goal.yaml, progress.yaml, evidence.jsonl, proof steps, work items,
  rolling execution, and completion review. Use when work is broad, ambiguous,
  evidence-sensitive, likely to span multiple evidence records or sessions,
  involves Goal Pack or method migration, or when the user asks for a Goal Plan
  / Goal Pack.
---

# Goal Proof System

Goal Proof System turns a human goal into a sequence of verified state changes.

```text
human intent -> goal contract -> proof_step -> work item -> evidence record -> next_action
```

Invariant:

```text
Goals are connected by proof paths and evidence records, not by speculative work item trees.
```

Ready gate:

```text
Goal Pack ready = goal contract stable + proof_step falsifiable
```

A work item list, roadmap paragraph, or future command name does not make a
Goal Pack ready. If `goal.yaml` exists but `progress.yaml.proof_step` cannot
prove or falsify the next movement, route to `finding-proof-step` before
implementation.

## Collaboration Contract

```text
Owns: Goal Pack lifecycle, goal contract, progress state, proof step, work item
selection, evidence records, relations metadata, and completion review.
Does not own: docs layer placement, product truth, interface trace semantics,
shared harness lifecycle, concrete UI/browser proof, or concrete command proof.
Inputs: objective, authority refs, constraints, claim_limit, proof_step,
proof_path refs, evidence refs, relation refs, and gaps from prior work.
Outputs: goal.yaml, progress.yaml, evidence.jsonl, completion review evidence,
and optional companion refs for interface or harness traces.
Handoff: docs placement -> docs-governance; missing interface trace ->
interface-capability-planning; shared coverage / claim_ceiling ->
product-harness-system; concrete command proof -> headless-product-harness;
browser-visible proof -> ui-product-harness.
Stop: protected goal field must change, no honest falsifiable proof path
exists, or work crosses security, private-data, public API/schema/protocol,
destructive, compliance, product-truth, or claim_limit authority.
```

## User Phrase Mapping

When a user says "Goal Plan", treat it as a natural-language request to create
or update a Goal Pack. Do not create a separate prose plan file by default.

Compile the discussed goal into:

```text
goal.yaml
progress.yaml
evidence.jsonl
```

Add `plans/<work_id>.md` only when a selected work item has `next_action:
needs_plan` or the work is high-risk enough to need a reviewed plan before
implementation.

## Use Or Stay Inline

Stay inline when one evidence path in the current turn can prove completion.

Create or update a Goal Pack when completion needs multiple evidence records,
durable state, transition continuity, disjoint write scopes, cross-session
resume, or explicit user request.

## Core Loop

```text
check -> inspect -> work brief -> work -> evidence add -> apply -> check
```

Read or create the Goal Pack, keep the goal contract stable, run the current
proof path, append one evidence record, apply progress, and continue by default
while the goal contract remains valid.

Use `goal-proof evidence add --apply --check` when an evidence record should
immediately drive deterministic progress and validation.

Before implementation, check that `progress.yaml.proof_step` names:

```text
from
target_delta
proof_path
checks
failure_inspection
```

If any item is only a slogan or future command name, sharpen the proof step
before editing production code.

## Rolling Execution

For broad goals, the current `proof_step` is a rolling gate, not the whole work
ceiling. Completing one proof step does not require stopping when the goal
contract remains valid and another honest falsifiable step is visible.

After each evidence record:

```text
apply progress
-> check the Goal Pack
-> preserve not_claimed and claim_limit
-> if next step is clear, update proof_step and continue
-> if completion evidence is satisfied, write completion review
-> otherwise block or ask only for protected human decisions
```

Do not merge multiple proof levels into one evidence record. Use separate
records when moving through levels such as `interface_headless`,
`render_wiring`, `browser_visible`, `headless_product`, `production_near`, or a
project-specific equivalent.

## Goal Pack Shape

```text
docs/goal-proof/
  README.md
  inbox/
  sources/
  goals/<goal-id>/
    goal.yaml
    progress.yaml
    evidence.jsonl
    plans/<work_id>.md  # only when needs_plan
    interface-capabilities.yaml  # optional UI/interface trace companion
    product-harness.yaml  # optional harness proof companion
    notes/
```

Read [references/artifact-routing.md](references/artifact-routing.md) before
placing artifacts. Read [references/bootstrap.md](references/bootstrap.md)
before initializing a project.

For UI, IA, interaction, frontend state, harness, or browser-visible work, a
Goal Pack may reference optional companions such as `interface-capabilities.yaml`
and `product-harness.yaml`. Keep those trace contracts outside `goal.yaml` and
reference them by IDs. Evidence records may cite verified evidence from those
companions, but Goal Proof System owns only Goal Pack lifecycle and evidence
chain.

## Boundary

Humans own `objective`, `engineering_guidance`, `authority_refs`,
`constraints`, `completion`, `claim_limit`, and `stop_rules`.

Agents own authority reading, Goal Pack creation/repair, proof step discovery,
implementation, verification, evidence record append, progress update, and
continuation while the next step remains inside the goal contract.

Stop only when fields listed in `agent_authority.requires_human_decision` must
change, no honest falsifiable proof path exists, or work crosses security,
permission, credential, private-data, public API/schema/protocol, destructive,
or compliance authority.

## Governance Routing

Goal Proof System owns inbox/source/Goal Pack/evidence record lifecycle. Read
[references/artifact-routing.md](references/artifact-routing.md) before placing
weak signals, consumed sources, successor Goal Packs, leftover gaps, or retained
evidence. Do not duplicate this lifecycle in project-level docs.

## Progress Queries

When asked for current progress, next ready work, active work item, thread
status, or completion, treat `goal.yaml`, `progress.yaml`, `evidence.jsonl`,
relation metadata, and CLI output as progress facts. Roadmaps may constrain
product strategy, sequencing, launch gates, and evidence links, but they do not
prove ready / running / done state.

## Phases

Use phase skills through this controller unless the user targets a phase:

- `skills/goal/goal-contracts/`: create or repair `goal.yaml`.
- `skills/goal/finding-proof-step/`: write `progress.yaml.proof_step`.
- `skills/goal/proof-step-implementation/`: run, verify, add evidence, apply, continue.
- `skills/goal/write-work-plans/`: write `plans/<work_id>.md` only for high-risk selected work.

## Completion

Completion requires a review evidence record that maps the evidence chain to
`completion.required_evidence` and sets `completion_satisfied: true`.

If the Goal Pack is a successor, completion review should include relation
evidence tokens proving predecessor evidence records and required evidence were
checked.

## References

CLI commands: [references/cli.md](references/cli.md). Goal Relations:
[references/goal-relations.md](references/goal-relations.md). Checker rules:
[references/checker-rules.md](references/checker-rules.md). Schema migration:
[references/schema-terminology-migration.md](references/schema-terminology-migration.md).
Examples: [EXAMPLES.md](EXAMPLES.md).
