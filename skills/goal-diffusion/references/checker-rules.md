# Checker Rules

Use:

```bash
goal-diffusion check docs/goal-diffusion/goals/<goal-id>
```

The checker is conservative. It validates machine-readable Goal Pack state; it
does not replace engineering judgment.

## Required Files

```text
contract.yaml
state.yaml
receipts.jsonl
```

`notes/` is optional for machine validity.

## Contract Checks

- `id` exists.
- `status` is `forming`, `ready`, `running`, `blocked`, `done`, or `retired`.
- `completion_oracle.signal` exists.
- `completion_oracle.final_proof` exists.
- `claim_boundary` exists.

Weak oracle fields warn during active work and fail completion.

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
commands with status: pass
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

## Completion Checks

A done Goal Pack must include a final audit receipt:

```json
{
  "task_id": "T999",
  "type": "audit",
  "result": "done",
  "decision": "complete",
  "oracle_satisfied": true,
  "evidence": ["<oracle evidence>"]
}
```

The checker rejects done state when the final audit does not satisfy the oracle.

## Goal Relations Checks

Base `goal-diffusion check` validates one Goal Pack. Cross-pack relation checks
belong to `goal-diffusion relations check`.

Relation metadata lives in `contract.yaml`:

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
