# Proof Step Template

The current model stores first-path material in `progress.yaml.proof_step`.
Use this template when a long explanation is needed in `notes/`.

```markdown
# Proof Step: <topic>

## Source Goal State

<What is currently true or unclear.>

## Target Delta

<What becomes sharper if this proof step succeeds.>

## Candidate Proof Steps

1. <route> - cost, proof, risk
2. <route> - cost, proof, risk
3. <route> - cost, proof, risk

## Chosen Proof Step

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

## Evidence Contract

- Input / fixture / trace / manual gate:
- Positive evidence:
- Not claimed:
- Claim limit:
- First failure inspection path:

## Claim Limit

- This proof step can prove:
- This proof step cannot prove:

## First Work Item Seed

```yaml
- id: W001
  type: implementation
  status: queued
  objective:
  allowed_scope:
  checks:
    - ...
  stop_if:
    - ...
```

## Blockers

- ...
```
