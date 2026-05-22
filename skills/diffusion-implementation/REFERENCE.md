# Run Phase Reference

## Horizons

```text
north_star       far target that must not be lost
contract         current human-owned objective and boundaries
current_edge     harnessed path to sharper clarity
active_task      largest safe useful slice inside the edge
```

Agents may see far, but execute the current edge.

## Largest Safe Useful Slice

Safe means bounded, explicit, verified, and reversible enough for the current
contract. Safe does not mean tiny.

Prefer slices that produce one of:

- working screen;
- working API path;
- working data path;
- real bug fix;
- transition slice;
- milestone review;
- harness that proves the current edge.

After two helper-sized slices in a row, reorient the edge or task. If the next
slice cannot move the oracle, stop and update state instead of pretending
progress.

## Run Loop

```text
choose useful slice
  -> capture baseline if needed
  -> implement inside allowed scope
  -> verify
  -> record receipt
  -> update state
  -> continue / plan_required / blocked / audit
```

## Allowed Revisions

Inside the current contract, the agent may revise:

- next slice;
- task order;
- local implementation shape;
- harness strength;
- failure inspection path;
- state.next_decision.

The agent may not silently revise:

- objective;
- authority refs;
- architecture standard;
- claim boundary;
- public API/schema/protocol posture;
- security or private-data handling;
- destructive or irreversible data behavior.

## Receipt Rules

Append one JSON object per task to `receipts.jsonl`. Do not rewrite history.

All done worker receipts need:

```text
task_id
type
result
changed_files
commands
evidence
claims
summary
next_decision
```

Blocked receipts need:

```text
task_id
type
result: blocked
blocked_by
evidence
next_decision
```

Final audit receipts need:

```text
type: audit
result: done
decision: complete
oracle_satisfied: true
evidence
```

## Recovery

If verification fails:

1. inspect the failure path named in `state.current_edge`;
2. make a bounded fix inside allowed scope if obvious;
3. append a blocked receipt if recovery would cross a protected boundary;
4. update `state.next_decision`.
