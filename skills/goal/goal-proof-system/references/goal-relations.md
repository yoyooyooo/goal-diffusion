# Goal Relations

Goal Packs may declare cross-pack continuity in `goal.yaml`:

```yaml
relations:
  thread_id: goal-relations
  links:
    - goal_id: 2026-05-23-goal-relations-protocol
      relation: successor_of
      evidence_ref: E999
      evidence:
        - relations_protocol_documented=true
```

Rules:

- Goal Pack remains the completion unit: one objective, one completion, one
  progress file, one append-only evidence chain.
- Goal Thread is only a shared `thread_id` label. It owns no state, work item list,
  evidence record stream, lifecycle, registry, or graph file.
- Goal Relation is metadata on a Goal Pack. Allowed relation types are
  `successor_of`, `depends_on`, `supersedes`, and `related_to`.
- Graph views are derived from Goal Relations at inspection time; never store a
  graph as planning state.
- Done Goal Packs are append-only closed by default. Normal follow-up creates a
  successor Goal Pack and references predecessor evidence.

`relations` commands inspect and verify Goal Relations across a project or
goals directory. `relations goals` and `relations work` are broad discovery
commands for thread-member candidates; `--thread` filters by
`relations.thread_id`.

Relations do not create a queue, worklist, scheduler, thread lifecycle, or
execution order.
