# Harnessed Edge Template

The current model records first-path material in `state.yaml.current_edge`.
Use this template when a long explanation is needed in `notes/`.

```markdown
# Harnessed Edge: <topic>

## Source Goal State

<What is currently true or unclear.>

## Target Delta

<What becomes sharper if this edge succeeds.>

## Candidate Edges

1. <route> - cost, proof, risk
2. <route> - cost, proof, risk
3. <route> - cost, proof, risk

## Chosen Edge

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

## Evidence Contract

- Input / fixture / trace / manual gate:
- Positive evidence:
- Negative claims / non-claims:
- Claim ceiling:
- First failure inspection path:

## Claim Boundary

- This edge can prove:
- This edge cannot prove:

## First Task Seed

```yaml
- id: T001
  type: worker
  status: queued
  objective:
  allowed_scope:
  verify:
  stop_if:
```

## Blockers

- ...
```
