# Run Phase Reference

## Horizons

```text
north_star       far target that must not be lost
charter          current human-owned objective and boundaries
current_edge     harnessed path to sharper clarity
active_task      largest safe useful slice inside the edge
```

Agents may see far, but execute the current edge.

## Largest Safe Useful Slice

Safe means bounded, explicit, verified, and reversible enough for the current
charter. Safe does not mean tiny.

Prefer slices that produce one of:

- working screen;
- working API path;
- working data path;
- real bug fix;
- transition slice;
- milestone review;
- harness that proves the current edge.

After two helper-sized slices in a row, reorient the edge or task. If the next
slice cannot move completion, stop and update state instead of pretending
progress.

## Run Loop

```text
choose useful slice
  -> capture baseline if needed
  -> implement inside allowed scope
  -> check
  -> record receipt
  -> update state
  -> continue / plan_required / blocked / audit
```

`goal-diffusion record --advance --check` is the compact path when receipt append,
state update, and validation should happen together.

## Allowed Revisions

Inside the current charter, the agent may revise:

- next slice;
- task order;
- local implementation shape;
- harness strength;
- failure inspection path;
- state.next_decision.

The agent may not silently revise:

- objective;
- authority refs;
- engineering guidance;
- completion;
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
checks
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
evidence_map
not_claimed
remaining_gaps
```

Worker receipt shape:

```json
{
  "task_id": "T001",
  "type": "worker",
  "result": "done",
  "changed_files": ["<file-in-allowed-scope>"],
  "checks": [{ "kind": "command", "cmd": "<command>", "status": "pass" }],
  "evidence": ["<evidence>"],
  "claims": ["<claim>"],
  "summary": "",
  "next_decision": "continue"
}
```

`checks[].status: "pass"` means the check's assertion passed. For absence
claims, use an inverted no-match command such as `! rg ...` or record an
explicit allowlist of intentional matches.

For schema or terminology migrations, include active surfaces in receipt
evidence: templates, references, agents, evals, CLI help/flags, README examples,
tests/fixtures, and active Goal Pack artifacts.

## Recovery

If verification fails:

1. inspect the failure path named in `state.current_edge`;
2. make a bounded fix inside allowed scope if obvious;
3. append a blocked receipt if recovery would cross a protected boundary;
4. update `state.next_decision`.
