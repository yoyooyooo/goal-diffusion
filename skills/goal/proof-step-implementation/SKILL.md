---
name: proof-step-implementation
description: >-
  Executes Goal Proof System run slices inside an active Goal Pack proof step, verifies
  them, appends evidence records, applies state, and continues while the goal contract is
  valid. Use through $goal-proof when a Goal Plan/Goal Pack is ready to run
  implementation work rather than only compile or review planning artifacts.
---

# Run Phase

Internal phase module for `$goal-proof`.

It runs the current proof step. It does not redefine the goal contract and it
does not stop merely because one useful slice finished.

## Run Readiness Gate

Do not run from a vague proof step. Before implementation, confirm
`progress.yaml.proof_step` contains:

```text
from
target_delta
proof_path
checks
failure_inspection
```

The proof step is not ready if it only names a future smoke command, repeats the
goal objective, or lists work items without saying how the next claim will be
proved or falsified. In that case, return to proof-step discovery and sharpen the
next proof step before editing production code.

Before activating or running a work item, refresh the selected Goal Pack's state,
evidence records, and relevant relation checks. Do not start from a roadmap
`default_next` or hand-written progress row alone; roadmap material can
constrain launch policy, but Goal Pack artifacts prove current work item state.

## Core Loop

```text
read goal contract + progress
  -> choose largest safe useful slice
  -> implement inside allowed scope
  -> run checks
  -> add evidence record
  -> update state
  -> continue | review | needs_plan | blocked | done | needs_human
```

Use `goal-proof evidence add --apply --check` when no intermediate inspection is
needed between evidence record append, deterministic state update, and validation.

## Slice Policy

Find path small. Execute slice useful.

The proof-step phase finds the smallest falsifiable runnable path. The run phase
executes the largest safe useful slice inside that path.

Useful slices move the owner outcome: working screen, API path, data path, real
bug fix, transition slice, milestone review, or harness that proves the current
proof step.

Avoid micro-slicing into helper churn, wrapper-only work, goal-contract-only files,
or notes that do not move completion.

## Continue Or Stop

Continue while objective, engineering guidance, authority refs, completion, and
claim_limit stay unchanged; an honest falsifiable path exists; checks exist
or can be built inside scope; and risk stays inside allowed blast radius.

Stop for changes to fields listed in `agent_authority.requires_human_decision`, missing
honest path, repeated unrecoverable check failure, or higher-authority
boundaries.

For related Goal Packs, keep work in the active Goal Pack. Do not reopen a done
predecessor for normal follow-up. Record successor evidence in the current
evidence chain and reference predecessor evidence records through `relations`.

## Gate Transition

In rolling execution, do not stop only because the current gate passed. After
evidence is recorded and checks pass, decide the next state:

```text
same proof_step still has useful safe work -> continue
current gate proved -> sharpen next proof_step and continue
required evidence satisfied -> completion review
no honest next gate -> blocked
protected field or claim boundary must change -> needs_human
```

Before crossing to a stronger proof level, confirm the previous evidence names
`positive_tokens`, preserves `not_claimed`, and satisfies the relevant
`promotion_gate`. A lower-level proof can support the next level, but it must
not be reported as the next level's claim.

## Evidence Record

Append one JSON object per completed, blocked, or reviewed work item to
`evidence.jsonl`. See [REFERENCE.md](REFERENCE.md#evidence record-rules) for evidence record
shapes.

Blocked evidence record uses `result: "blocked"`, `blocked_by`, `evidence`, and
`next_action: "blocked"`.

Completion review requires `type: "review"`, `decision: "complete"`,
`completion_satisfied: true`, and `claim_evidence` that maps evidence to
`completion.required_evidence`.
If the Goal Pack declares hard relations, completion review evidence should include
relation verification results or the evidence tokens required by the relation.

`checks[].status: "pass"` means the check's assertion passed, not merely that a
tool command returned exit 0. For absence claims, use an inverted no-match
command such as `! rg ...` or evidence add an explicit allowlist of intentional
matches. For schema or terminology migrations, include active surfaces in the
evidence: templates, references, agents, evals, CLI help/flags, README
examples, tests/fixtures, and active Goal Pack artifacts.

## State Update

After appending an evidence record, update `progress.yaml`: `active_work_item`,
`work_items[].status`, `blockers`, `last_check`, `next_action`, and
`proof_step` when the next proof step is known.

Do not rewrite historical evidence records. Add another evidence record if interpretation
changes.

## Output

```text
goal_pack:
work item:
evidence record:
checks:
state_update:
next_action: proof_step | continue | needs_plan | blocked | review | done | needs_human
```
