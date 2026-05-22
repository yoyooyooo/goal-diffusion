---
name: write-implementation-plans
description: >-
  Plan-required phase for Goal Diffusion. Prefer entering through
  $goal-diffusion. Use only when a selected Goal Pack task needs pre-reviewed
  execution structure because of migration, security, public API/schema/protocol,
  irreversible data, strict multi-agent coordination, or expensive rollback.
---

# Plan Required Phase

This is an internal phase module for `$goal-diffusion`.

It writes an implementation spec for a selected high-risk task. It is not the
normal path for rolling execution.

Default output:

```text
specs/<goal-id>/implementation-spec.md
```

## Use Only When

- migration or deletion has broad blast radius;
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

## Spec Shape

```markdown
# <Goal ID> Implementation Spec

## Goal Pack
- contract:
- state:
- task:

## Protected Boundary
- objective:
- authority:
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
implementation_spec:
goal_pack:
task:
ready_for_run: true | false
blocked_by:
```
