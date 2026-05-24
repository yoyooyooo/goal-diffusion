# Plan Required Examples

## High-Risk Slice

```markdown
# public-relay-deployment-readiness Implementation Plan

## Goal Pack

- charter: `docs/goal-diffusion/goals/public-relay-deployment-readiness/charter.yaml`
- state: `docs/goal-diffusion/goals/public-relay-deployment-readiness/state.yaml`
- task: `T002`
- plan: `docs/goal-diffusion/goals/public-relay-deployment-readiness/implementation-plan.md`

## Protected Boundary

- objective: prove a deployment-readiness path for the public relay
- claim_boundary: claim only readiness evidence inside this Goal Pack
- stop_if: needs public API, security, or deployment authority change

## Allowed Scope

- Modify: `docs/goal-diffusion/goals/public-relay-deployment-readiness/**`

## Verification

- `bun run check`
- `goal-diffusion check docs/goal-diffusion/goals/public-relay-deployment-readiness`

## Execution Chunks

1. Confirm authority and claim boundary.
2. Define a runnable readiness harness.
3. Execute the smallest readiness proof.
4. Append receipt and advance state.
```
