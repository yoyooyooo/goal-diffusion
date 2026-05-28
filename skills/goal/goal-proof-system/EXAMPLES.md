# Goal Proof System Examples

## Turn A Discussion Into A Goal Plan

User says:

```text
We have talked through the migration. Turn this plan into a Goal Plan.
```

Agent action:

```text
Create or update a Goal Pack, not a separate prose plan file:
- goal.yaml: objective, authority_refs, engineering_guidance, completion, claim_limit
- progress.yaml: first proof step and active work item
- evidence.jsonl: append only after verified work
```

## Stay Inline

User asks for a one-file typo fix with an obvious test.

Agent action:

```text
Stay inline. No Goal Pack needed when one evidence path can prove completion in
the current turn.
```

## Plan Required

A Goal Pack work item touches public API/schema, security, destructive data, or broad
transition scope.

Agent action:

```text
Create docs/goal-proof/goals/<goal-id>/plans/<work_id>.md, set
next_action: needs_plan, and return to implementation only after the plan is reviewed.
```
