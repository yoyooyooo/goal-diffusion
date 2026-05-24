# Goal Diffusion Examples

## Turn A Discussion Into A Goal Plan

User says:

```text
We have talked through the migration. Turn this plan into a Goal Plan.
```

Agent action:

```text
Create or update a Goal Pack, not a separate prose plan file:
- charter.yaml: objective, authority_refs, engineering_guidance, completion, claim_boundary
- state.yaml: first harnessed edge and active task
- receipts.jsonl: append only after verified work
```

## Stay Inline

User asks for a one-file typo fix with an obvious test.

Agent action:

```text
Stay inline. No Goal Pack needed when one evidence path can prove completion in
the current turn.
```

## Plan Required

A Goal Pack task touches public API/schema, security, destructive data, or broad
transition scope.

Agent action:

```text
Create docs/goal-diffusion/goals/<goal-id>/implementation-plan.md and mark the
task type as plan_required before execution.
```
