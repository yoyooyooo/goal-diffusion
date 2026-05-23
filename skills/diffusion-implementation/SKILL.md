---
name: diffusion-implementation
description: >-
  Run phase for Goal Diffusion. Prefer entering through $goal-diffusion. Use
  this phase to execute the largest safe useful slice inside a Goal Pack edge,
  verify it, record a receipt, update state, and continue by default while the
  contract remains valid.
---

# Run Phase

Internal phase module for `$goal-diffusion`.

It runs the current harnessed edge. It does not redefine the contract and it
does not stop merely because one useful slice finished.

## Core Loop

```text
read contract + state
  -> choose largest safe useful slice
  -> implement inside allowed scope
  -> run verify
  -> record receipt
  -> update state
  -> continue | plan_required | blocked | audit
```

## Slice Policy

Find path small. Execute slice useful.

The edge phase finds the smallest falsifiable runnable path. The run phase
executes the largest safe useful slice inside that path.

Useful slices move the owner outcome: working screen, API path, data path, real
bug fix, transition slice, milestone review, or harness that proves the current
edge.

Avoid micro-slicing into helper churn, wrapper-only work, contract-only files,
or notes that do not move the oracle.

## Continue Or Stop

Continue while objective, architecture standard, authority refs, and claim
boundary stay unchanged; an honest falsifiable path exists; verification exists
or can be built inside scope; and risk stays inside allowed blast radius.

Stop for protected-field changes, missing honest path, repeated unrecoverable
verification failure, or higher-authority boundaries.

For related Goal Packs, keep work in the active Goal Pack. Do not reopen a done
predecessor for normal follow-up. Record successor evidence in the current
receipt chain and reference predecessor receipts through `goal_relations`.

## Receipt

Append one JSON object per completed, blocked, or audited task to
`receipts.jsonl`.

Worker receipt:

```json
{
  "task_id": "T001",
  "type": "worker",
  "result": "done",
  "changed_files": ["<file-in-allowed-scope>"],
  "commands": [{ "cmd": "<command>", "status": "pass" }],
  "evidence": ["<evidence>"],
  "claims": ["<claim>"],
  "summary": "",
  "next_decision": "continue"
}
```

Blocked receipt uses `result: "blocked"`, `blocked_by`, `evidence`, and
`next_decision: "blocked"`.

Final audit requires `type: "audit"`, `decision: "complete"`,
`oracle_satisfied: true`, and oracle evidence.
If the Goal Pack declares hard relations, final audit evidence should include
relation verification results or the evidence tokens required by the relation.

## State Update

After appending a receipt, update `state.yaml`: `active_task`,
`tasks[].status`, `blockers`, `last_verification`, `next_decision`, and
`current_edge` when the next edge is known.

Do not rewrite historical receipts. Add another receipt if interpretation
changes.

## Output

```text
goal_pack:
task:
receipt:
verification:
state_update:
next_decision: continue | plan_required | blocked | audit | done
```
