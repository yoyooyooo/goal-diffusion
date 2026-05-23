---
name: write-implementation-plans
description: >-
  Plan-required phase for Goal Diffusion. Prefer entering through
  $goal-diffusion. Use only when a selected Goal Pack task needs pre-reviewed
  execution structure because of broad transition, security, public API/schema/protocol,
  irreversible data, strict multi-agent coordination, or expensive rollback.
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
authority, contract replacement, or parallel workflow. The corresponding
`state.yaml` task should use `type: plan_required` and
`plan: implementation-plan.md`, with the plan file in `allowed_scope`.
For related Goal Packs, the plan may cite `goal_relations` as predecessor
evidence, but it must not create a thread-owned lifecycle, stored graph, nested
task tree, or cross-pack state ownership.

## Use Only When

- transition or deletion has broad blast radius;
- public API, schema, protocol, or persisted contract changes;
- irreversible data, destructive action, credentials, permissions, or security;
- multiple agents need strict sequencing or disjoint write-scope control;
- a wrong first implementation would be expensive to unwind.

## Required Inputs

```text
goal_pack
contract.claim_boundary
state.current_edge
task.objective
task.allowed_scope
task.verify
task.stop_if
authority_refs
```

Stop if any protected contract field would need to change.

## Plan Shape

```markdown
# <Goal ID> Implementation Plan

## Goal Pack
- contract: `docs/goal-diffusion/goals/<goal-id>/contract.yaml`
- state: `docs/goal-diffusion/goals/<goal-id>/state.yaml`
- task:
- plan: `docs/goal-diffusion/goals/<goal-id>/implementation-plan.md`

## Protected Boundary
- objective:
- authority:
- architecture_standard:
- claim_boundary:
- stop_if:

## Allowed Scope
- ...

## Verification
- ...

## Execution Chunks
1. ...

## Receipt Requirements
- changed_files:
- commands:
- evidence:
- claims:

## Handoff
- next_decision:
```

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
