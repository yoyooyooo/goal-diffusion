# Checker Rules

Use:

```bash
goal-proof check docs/goal-proof/goals/<goal-id>
```

The checker is conservative. It validates machine-readable Goal Pack state; it
does not replace engineering judgment.

## Required Files

```text
goal.yaml
progress.yaml
evidence.jsonl
```

`notes/` and `plans/` are optional for machine validity.

## Goal Contract Checks

- `schema_version: 2` exists.
- `id` exists.
- `status` is `forming`, `ready`, `running`, `blocked`, `done`, or `retired`.
- `completion.signal` exists.
- `completion.required_evidence` exists.
- `claim_limit` exists.

Weak completion fields warn during active work and fail completion.

## Progress Checks

- `schema_version: 2` exists.
- `status` is valid.
- `proof_step` includes `from`, `target_delta`, `proof_path`, `checks`, and
  `failure_inspection`.
- `running` state has exactly one active work item.
- `active_work_item` points to that active work item.
- `done` state has `active_work_item: null`.
- `next_action` is one of `proof_step`, `continue`, `needs_plan`, `blocked`,
  `review`, `done`, or `needs_human`.
- Work item ids use `W###`.
- Work item type is one of `discovery`, `decision`, `implementation`,
  `coordination`, `review`, or `planning`.
- Active implementation work items must include `allowed_scope`, `checks`, and
  `stop_if`.

## Evidence Record Checks

- Every evidence record has `schema_version: 2`, `evidence_id`, `work_id`,
  `type`, `result`, `recorded_at`, `summary`, and `next_action`.
- `evidence_id` uses `E###`.
- `work_id` points to a work item in `progress.yaml`.
- `next_action` uses the current decision vocabulary.
- Blocked evidence records include `blocked_by`.
- Done implementation evidence records include `changed_files`, passing
  `checks`, `evidence`, `claims`, and `not_claimed`.
- Each changed file must match the work item `allowed_scope`.
- Invalid JSONL lines fail the check.

`checks[].status: "pass"` means the assertion in that check passed. For a
no-match claim such as "old vocabulary is absent", the command should be an
inverted search (`! rg ...`) or the evidence should name the allowed matches
explicitly. Do not record a plain positive search as proof of absence.

## Completion Checks

A done Goal Pack must include a review evidence record:

```json
{
  "schema_version": 2,
  "evidence_id": "E999",
  "work_id": "W999",
  "type": "review",
  "result": "done",
  "decision": "complete",
  "completion_satisfied": true,
  "recorded_at": "2026-05-28T00:00:00Z",
  "claim_evidence": [
    {
      "claim": "completion.required_evidence",
      "evidence": ["<evidence-record/check/evidence reference>"]
    }
  ],
  "not_claimed": [],
  "remaining_gaps": [],
  "summary": "Completion review passed.",
  "next_action": "done"
}
```

The checker rejects done state when completion review does not satisfy
completion.

When completion claims a schema or terminology migration, completion review
evidence should cover active surfaces, not only the main skill body:
`agents/**`, `evals/**`, templates, references, CLI help/flags, READMEs,
tests/fixtures, and active Goal Pack artifacts. Public-surface names that
remain old must be marked as documented aliases or excluded from the claim with
`remaining_gaps`.

## Goal Relations Checks

Base `goal-proof check` validates one Goal Pack. Cross-pack relation checks
belong to `goal-proof relations check`.

Relation metadata lives in `goal.yaml`:

```yaml
relations:
  thread_id: "<thread-label>"
  links:
    - goal_id: "<target-goal-id>"
      relation: successor_of # successor_of | depends_on | supersedes | related_to
      evidence_ref: E999
      evidence:
        - "<evidence-token>=true"
```

Hard failures for relation verification are limited to invalid relation type,
missing target Goal Pack, missing required `evidence_ref`, and missing required
evidence token. `related_to` is nonblocking: missing evidence record or evidence
should warn unless future protocol authority says otherwise.
