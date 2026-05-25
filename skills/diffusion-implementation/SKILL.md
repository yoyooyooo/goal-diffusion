---
name: diffusion-implementation
description: >-
  Executes Goal Diffusion run slices inside an active Goal Pack edge, verifies
  them, appends receipts, advances state, and continues while the charter is
  valid. Use through $goal-diffusion when a Goal Plan/Goal Pack is ready to run
  implementation work rather than only compile or review planning artifacts.
---

# Run Phase

Internal phase module for `$goal-diffusion`.

It runs the current harnessed edge. It does not redefine the charter and it
does not stop merely because one useful slice finished.

## Run Readiness Gate

Do not run from a vague edge. Before implementation, confirm
`state.yaml.current_edge` contains:

```text
from
target_delta
harnessed_path
verify
failure_inspection
```

The edge is not ready if it only names a future smoke command, repeats the
charter objective, or lists tasks without saying how the next claim will be
proved or falsified. In that case, return to edge discovery and sharpen the
current edge before editing production code.

Before activating or running a task, refresh the selected Goal Pack's state,
receipts, and relevant relation checks. Do not start from a roadmap
`default_next` or hand-written progress row alone; roadmap material can
constrain launch policy, but Goal Pack artifacts prove current task state.

## Core Loop

```text
read charter + state
  -> choose largest safe useful slice
  -> implement inside allowed scope
  -> run checks
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

Avoid micro-slicing into helper churn, wrapper-only work, charter-only files,
or notes that do not move completion.

## Continue Or Stop

Continue while objective, engineering guidance, authority refs, completion, and
claim boundary stay unchanged; an honest falsifiable path exists; checks exist
or can be built inside scope; and risk stays inside allowed blast radius.

Stop for changes to fields listed in `autonomy.cannot_silently_change`, missing
honest path, repeated unrecoverable check failure, or higher-authority
boundaries.

For related Goal Packs, keep work in the active Goal Pack. Do not reopen a done
predecessor for normal follow-up. Record successor evidence in the current
receipt chain and reference predecessor receipts through `goal_relations`.

## Receipt

Append one JSON object per completed, blocked, or audited task to
`receipts.jsonl`. See [REFERENCE.md](REFERENCE.md#receipt-rules) for receipt
shapes.

Blocked receipt uses `result: "blocked"`, `blocked_by`, `evidence`, and
`next_decision: "blocked"`.

Final audit requires `type: "audit"`, `decision: "complete"`,
`oracle_satisfied: true`, and an `evidence_map` that maps receipt evidence to
`completion.final_proof`.
If the Goal Pack declares hard relations, final audit evidence should include
relation verification results or the evidence tokens required by the relation.

`checks[].status: "pass"` means the check's assertion passed, not merely that a
tool command returned exit 0. For absence claims, use an inverted no-match
command such as `! rg ...` or record an explicit allowlist of intentional
matches. For schema or terminology migrations, include active surfaces in the
receipt evidence: templates, references, agents, evals, CLI help/flags, README
examples, tests/fixtures, and active Goal Pack artifacts.

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
checks:
state_update:
next_decision: continue | plan_required | blocked | audit | done
```
