# Goal Relations

Goal Packs may declare cross-pack continuity in `charter.yaml`:

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

- Goal Pack remains the completion unit: one objective, one completion, one
  state, one append-only receipt chain.
- Goal Thread is only a shared `thread_id` label. It owns no state, task list,
  receipt stream, lifecycle, registry, or graph file.
- Goal Relation is metadata on a Goal Pack. Allowed relation types are
  `successor_of`, `depends_on`, `supersedes`, and `related_to`.
- Graph views are derived from Goal Relations at inspection time; never store a
  graph as planning state.
- Done Goal Packs are append-only closed by default. Normal follow-up creates a
  successor Goal Pack and references predecessor receipt evidence.

`relations` commands inspect and verify Goal Relations across a project or
goals directory. `relations goals` and `relations tasks` are broad discovery
commands for thread-member candidates; `--thread` filters by
`goal_relations.thread_id`.

Relations do not create a queue, worklist, scheduler, thread lifecycle, or
execution order.
