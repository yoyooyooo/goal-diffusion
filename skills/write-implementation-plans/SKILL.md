---
name: write-implementation-plans
description: >-
  Writes implementation-plan.md for selected plan_required Goal Diffusion tasks.
  Use through $goal-diffusion when a Goal Plan/Goal Pack task needs pre-reviewed
  execution structure because of broad transition, security, public
  API/schema/protocol, irreversible data, strict multi-agent coordination, or
  expensive rollback.
---

# Plan Required Phase

This is an internal phase module for `$goal-diffusion`.

It writes an implementation plan for a selected high-risk task. It is not the
normal path for rolling execution.

Default output:

```text
docs/goal-diffusion/goals/<goal-id>/implementation-plan.md
```

The plan lives inside the Goal Pack by design. It is not a product spec, schema
authority, charter replacement, or parallel workflow. The corresponding
`state.yaml` task should use `type: plan_required` and
`plan: implementation-plan.md`, with the plan file in `allowed_scope`.
For related Goal Packs, the plan may cite `goal_relations` as predecessor
evidence, but it must not create a thread-owned lifecycle, stored graph, nested
task tree, or cross-pack state ownership.

## Use Only When

- transition or deletion has broad blast radius;
- public API, schema, protocol, or persisted charter changes;
- irreversible data, destructive action, credentials, permissions, or security;
- multiple agents need strict sequencing or disjoint write-scope control;
- a wrong first implementation would be expensive to unwind.

## Required Inputs

```text
goal_pack
charter.claim_boundary
state.current_edge
task.objective
task.allowed_scope
task.verify
task.stop_if
authority_refs
```

Stop if any field listed in `autonomy.cannot_silently_change` would need to
change.

For schema, terminology, or command-language migrations, the plan should include
an active-surface pass: skill bodies, references, templates, agents, evals,
README/package docs, CLI help/flags, tests/fixtures, and active Goal Pack
artifacts. It should also state the public-surface decision for renamed fields:
rename now, keep a documented compatibility alias, or leave it as a
`remaining_gaps` item instead of claiming it complete.

## Plan Shape

Use [REFERENCE.md](REFERENCE.md#plan-template) for the full template and
[EXAMPLES.md](EXAMPLES.md) for an example. The plan must include verification,
receipt requirements, and handoff back to the run phase.

`ready_for_run: true` requires a falsifiable current edge. If the plan clarifies
the missing evidence path, update or request an update to `state.yaml.current_edge`
before handing back to implementation.

## Output

```text
implementation_plan:
path:
goal_pack:
task:
ready_for_run: true | false
blocked_by:
next_phase: run | blocked
```
