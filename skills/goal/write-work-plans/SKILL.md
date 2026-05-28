---
name: write-work-plans
description: >-
  Writes plans/<work_id>.md for selected high-risk Goal Proof System work items.
  Use through $goal-proof when a Goal Plan/Goal Pack work item needs pre-reviewed
  execution structure because of broad transition, security, public
  API/schema/protocol, irreversible data, strict multi-agent coordination, or
  expensive rollback.
---

# Plan Required Phase

This is an internal phase module for `$goal-proof`.

It writes an implementation plan for a selected high-risk work item. It is not the
normal path for rolling execution.

Default output:

```text
docs/goal-proof/goals/<goal-id>/plans/<work_id>.md
```

The plan lives inside the Goal Pack by design. It is not a product spec, schema
authority, goal contract replacement, or parallel workflow. The corresponding
`progress.yaml` should set `next_action: needs_plan`, keep the selected work
item as `status: active` or `blocked`, and reference `plan: plans/<work_id>.md`
when the schema needs an explicit plan pointer.
For related Goal Packs, the plan may cite `relations` as predecessor
evidence, but it must not create a thread-owned lifecycle, stored graph, nested
work item tree, or cross-pack state ownership.

## Use Only When

- transition or deletion has broad blast radius;
- public API, schema, protocol, or persisted goal contract changes;
- irreversible data, destructive action, credentials, permissions, or security;
- multiple agents need strict sequencing or disjoint write-scope control;
- a wrong first implementation would be expensive to unwind.

## Required Inputs

```text
goal_pack
goal.claim_limit
progress.proof_step
work item.objective
work item.allowed_scope
work item.checks
work item.stop_if
authority_refs
```

Stop if any field listed in `agent_authority.requires_human_decision` would need to
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
evidence record requirements, and handoff back to the run phase.

`ready_for_run: true` requires a falsifiable next proof step in `proof_step`. If the plan clarifies
the missing evidence path, update or request an update to `progress.yaml.proof_step`
before handing back to implementation.

## Output

```text
implementation_plan:
path:
goal_pack:
work item:
ready_for_run: true | false
blocked_by:
next_phase: run | blocked
```
