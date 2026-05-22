# Migration Map

This map converts older Goal Diffusion material into the Goal Pack model.

## Target Model

```text
docs/goal-diffusion/
  inbox/
  sources/
  goals/<goal-id>/
    contract.yaml
    state.yaml
    receipts.jsonl
    notes/
specs/<goal-id>/implementation-spec.md
```

## Old To New

| Old artifact | New role |
|---|---|
| seed | `inbox/` with `lifecycle: weak_signal` |
| proposal | `inbox/` with `lifecycle: open_candidate`, then `sources/` after consumed |
| implementation brief | `state.yaml.current_edge`; long route explanation in `notes/` |
| goal plan | `contract.yaml` |
| execution run | `state.yaml` |
| execution report | `receipts.jsonl`; long final summary in `notes/final-report.md` |
| detailed implementation plan | `specs/<goal-id>/implementation-spec.md` |
| converted source | `sources/` |

## Field Migration

| Old field | New field |
|---|---|
| `harness_pack` | `state.current_edge.harnessed_path`, `verify`, and `failure_inspection` |
| `done_evidence` | receipt object in `receipts.jsonl` |
| `recalibration_gate` | `contract.autonomy_policy` |
| `next_goal_candidates` | `state.next_decision` or a new inbox item when it is outside current contract |
| `chosen_slice` | active task objective inside `state.tasks[]` |
| `evidence_contract` | `completion_oracle` plus `claim_boundary` |

## Migration Rules

- Old material is input, not current workflow authority.
- Promote only current truth to project authority layers.
- Keep consumed context as `sources/` or `notes/`, not as open candidates.
- Do not keep a second current home for the same goal.
- Completion claims must become final audit receipts with `oracle_satisfied:
  true`.
