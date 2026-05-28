# Proof Step Details

## Route Archetypes

Prefer one route:

1. `vertical-slice` - first user or operator-visible path.
2. `seam-first` - smallest clean boundary into an existing module.
3. `harness-first` - observability, repro, logs, scripts, or tests are too weak
   to trust feature work.
4. `transition-proof-step` - moves source material into current Goal Pack roles
   without changing the protected goal contract.

## Detailed Workflow

1. Read `goal.yaml`.
2. Extract the current value line: what visible result would prove it is worth
   continuing?
3. Compare 2-3 candidate proof steps when the route is not obvious.
4. Choose the smallest falsifiable runnable proof step.
5. Write `progress.yaml.proof_step`:

```yaml
proof_step:
  from:
  target_delta:
  proof_path:
    - ...
  checks:
    - ...
  failure_inspection:
    - ...
```

6. Check the proof step against the evidence contract:
   - input, fixture, trace, command, UI action, dataset, or manual gate;
   - expected positive evidence;
   - `not_claimed`;
   - claim_limit;
   - first failure inspection path.
7. Seed or update the first work item only when execution can start inside the
   goal contract boundary.
8. Set `next_action` to `continue`, `needs_plan`, or `blocked`.

## Proof Step Quality

A good proof step:

- can be run, observed, or manually checked;
- proves or falsifies a near movement toward the objective;
- names the input or fixture and the expected evidence;
- states `not_claimed` and claim_limit when the proof could be overread;
- keeps the goal contract claim_limit intact;
- avoids future-only infrastructure;
- records where to inspect failure.

A bad proof step:

- is a broad plan without proof;
- only names a future command without saying what it must prove;
- creates directories or placeholders as closure;
- hides missing authority under work item language;
- expands into a full work item tree.

## No Honest Path

When no path exists, record the nearest blocker:

```text
missing_authority
missing_harness
missing_runtime_access
missing_product_truth
human_decision_needed
```

Do not continue execution from hope.
