# Checker Rules

Use:

```bash
goal-diffusion check docs/goal-diffusion/goals/<goal-id>
```

The checker is conservative. It validates machine-readable Goal Pack state; it
does not replace engineering judgment.

## Required Files

```text
charter.yaml
state.yaml
receipts.jsonl
```

`notes/` is optional for machine validity.

## Charter Checks

- `id` exists.
- `status` is `forming`, `ready`, `running`, `blocked`, `done`, or `retired`.
- `completion.signal` exists.
- `completion.final_proof` exists.
- `claim_boundary` exists.

Weak completion fields warn during active work and fail completion.

## State Checks

- `status` is valid.
- `running` state has exactly one active task.
- `active_task` points to that active task.
- `done` state has `active_task: null`.
- `next_decision` is one of `edge`, `continue`, `plan_required`, `blocked`,
  `audit`, `done`, or `needs-human`.
- tasks use `T###` ids.
- task type is one of `scout`, `judge`, `worker`, `pm`, `audit`,
  `plan_required`.
- `plan_required` tasks may include `plan: implementation-plan.md`; include the
  plan file in `allowed_scope` when the task writes or updates it.

## Worker Checks

Active worker tasks must include:

```text
allowed_scope
verify
stop_if
```

Done worker receipts must include:

```text
changed_files
checks with status: pass
evidence
claims
summary
```

Each changed file must match the task `allowed_scope`.

## Receipt Checks

- Every receipt `task_id` must point to a task in `state.yaml`.
- `next_decision` must use the current decision vocabulary.
- Blocked receipts must include `blocked_by`.
- Invalid JSONL lines fail the check.
- `checks[].status: "pass"` means the assertion in that check passed. For a
  no-match claim such as "old vocabulary is absent", the command should be an
  inverted search (`! rg ...`) or the evidence should name the allowed matches
  explicitly. Do not record a plain positive search as proof of absence.

## Completion Checks

A done Goal Pack must include a final audit receipt:

```json
{
  "task_id": "T999",
  "type": "audit",
  "result": "done",
  "decision": "complete",
  "oracle_satisfied": true,
  "evidence_map": [
    {
      "claim": "completion.final_proof",
      "evidence": ["<receipt/check/evidence reference>"]
    }
  ],
  "not_claimed": [],
  "remaining_gaps": []
}
```

The checker rejects done state when the final audit does not satisfy completion.

When completion claims a schema or terminology migration, final audit evidence
should cover active surfaces, not only the main skill body: `agents/**`,
`evals/**`, templates, references, CLI help/flags, READMEs, tests/fixtures, and
active Goal Pack artifacts. Public-surface names that remain old must be marked
as documented aliases or excluded from the claim with `remaining_gaps`.

## Goal Relations Checks

Base `goal-diffusion check` validates one Goal Pack. Cross-pack relation checks
belong to `goal-diffusion relations check`.

Relation metadata lives in `charter.yaml`:

```yaml
goal_relations:
  thread_id: "<thread-label>"
  links:
    - goal_id: "<target-goal-id>"
      relation: successor_of # successor_of | depends_on | supersedes | related_to
      receipt_ref: T999
      evidence:
        - "<receipt-evidence-token>=true"
```

Hard failures for relation verification are limited to invalid relation type,
missing target Goal Pack, missing required `receipt_ref`, and missing required
evidence token. `related_to` is nonblocking: missing receipt or evidence should
warn unless future protocol authority says otherwise.
