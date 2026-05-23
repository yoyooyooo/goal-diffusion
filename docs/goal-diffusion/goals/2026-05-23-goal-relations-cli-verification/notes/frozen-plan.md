# Frozen Plan: Relations CLI Verification

## Decision

Expose one CLI namespace:

```bash
goal-diffusion relations list <target> [--thread <id>] [--json]
goal-diffusion relations check <target> [--thread <id>] [--json]
goal-diffusion relations graph <target> [--thread <id>] [--json]
```

Do not add a separate thread namespace. Thread views are derived from
`goal_relations.thread_id`.

## Minimum Validation

Fail:

- invalid relation enum;
- missing target Goal Pack for `successor_of`, `depends_on`, or `supersedes`;
- missing `receipt_ref` when a hard relation declares required evidence;
- missing required evidence token in the referenced receipt;
- predecessor referenced by a hard relation is silently reopened while still
  used as done evidence.

Warn:

- `related_to` target missing;
- `related_to` evidence missing;
- successor candidate not yet created.

## Graph View

The graph command renders a derived view only. It must not write graph files or
create state.

Example shape:

```json
{
  "threads": [
    {
      "thread_id": "goal-relations",
      "goals": ["2026-05-23-goal-relations-protocol"],
      "edges": [
        {
          "from": "2026-05-23-goal-relations-protocol",
          "to": "2026-05-23-goal-relations-cli-verification",
          "relation": "successor_of",
          "receipt_ref": "T999",
          "evidence": "ok"
        }
      ]
    }
  ]
}
```
