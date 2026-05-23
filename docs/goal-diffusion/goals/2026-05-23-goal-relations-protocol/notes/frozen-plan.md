# Frozen Plan: Goal Relations Protocol

## Decision

Keep the model small:

- Goal Pack is the completion unit.
- Goal Thread is only a shared `thread_id` across related Goal Packs.
- Goal Relation is a typed link to another Goal Pack and, when required, a receipt.
- Graph is a CLI-derived view over relations, not a stored artifact.

## Schema

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

Allowed relation types:

- `successor_of`
- `depends_on`
- `supersedes`
- `related_to`

## Done-Pack Rule

Done Goal Packs are append-only closed by default. Normal follow-up starts a
successor Goal Pack and references predecessor receipt evidence.

Reopen only for audit correction, invalid completion evidence, or protected-field
misinterpretation. Reopen requires an explicit note before changing status.

## Validation Plan

This first Goal Pack proves protocol and skill guidance only. The successor Goal
Pack proves CLI verification.
