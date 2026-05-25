# Edge Phase Details

## Route Archetypes

Prefer one route:

1. `vertical-slice` - first user or operator-visible path.
2. `seam-first` - smallest clean boundary into an existing module.
3. `harness-first` - observability, repro, logs, scripts, or tests are too weak
   to trust feature work.
4. `transition-edge` - moves source material into current Goal Pack roles
   without changing the protected charter.

## Detailed Workflow

1. Read `charter.yaml`.
2. Extract the current value line: what visible result would prove it is worth
   continuing?
3. Compare 2-3 candidate edges when the route is not obvious.
4. Choose the smallest falsifiable runnable edge.
5. Write `state.current_edge`:

```yaml
current_edge:
  from:
  target_delta:
  harnessed_path:
    - ...
  verify:
    - ...
  failure_inspection:
    - ...
```

6. Check the edge against the evidence contract:
   - input, fixture, trace, command, UI action, dataset, or manual gate;
   - expected positive evidence;
   - negative claims or non-claims;
   - claim ceiling;
   - first failure inspection path.
7. Seed or update the first task only when execution can start inside the
   charter boundary.
8. Set `next_decision` to `continue`, `plan_required`, or `blocked`.

## Edge Quality

A good edge:

- can be run, observed, or manually checked;
- proves or falsifies a near movement toward the objective;
- names the input or fixture and the expected evidence;
- states negative claims and claim ceiling when the proof could be overread;
- keeps the charter claim boundary intact;
- avoids future-only infrastructure;
- records where to inspect failure.

A bad edge:

- is a broad plan without proof;
- only names a future command without saying what it must prove;
- creates directories or placeholders as closure;
- hides missing authority under task language;
- expands into a full task tree.

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
