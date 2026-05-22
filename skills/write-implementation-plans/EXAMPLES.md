# Plan Required Examples

## Migration Slice

```markdown
# migrate-goal-diffusion-to-goal-pack Implementation Spec

## Goal Pack

- contract: `skills/goal-diffusion/examples/migrate-goal-diffusion-to-goal-pack/contract.yaml`
- state: `skills/goal-diffusion/examples/migrate-goal-diffusion-to-goal-pack/state.yaml`
- task: `T002`

## Protected Boundary

- objective: migrate the skill to Goal Pack model
- claim_boundary: claim only skill migration, not migration of all historical projects
- stop_if: needs docs-governance authority change

## Allowed Scope

- Modify: `skills/goal-diffusion/**`, `skills/goal-plans/**`, `skills/finding-harnessed-path/**`, `skills/diffusion-implementation/**`, `skills/write-implementation-plans/**`, `packages/cli/**`

## Verification

- `bun run check`
- `goal-diffusion check skills/goal-diffusion/examples/migrate-goal-diffusion-to-goal-pack`

## Execution Chunks

1. Rewrite public controller.
2. Rewrite phase modules.
3. Add templates and checker.
4. Append receipt and audit state.
```
