# Plan Required Reference

Use this only for a selected Goal Pack task that needs pre-reviewed execution
structure.

## Default Path

```text
docs/goal-diffusion/goals/<goal-id>/implementation-plan.md
```

The plan lives inside the Goal Pack and is referenced by a `plan_required` task
as `plan: implementation-plan.md`; that task's `allowed_scope` should include
the plan file.

## Plan Template

```markdown
# <Goal ID> Implementation Plan

## Goal Pack

- contract: `docs/goal-diffusion/goals/<goal-id>/contract.yaml`
- state: `docs/goal-diffusion/goals/<goal-id>/state.yaml`
- task: `<T###>`
- plan: `docs/goal-diffusion/goals/<goal-id>/implementation-plan.md`

## Protected Boundary

- objective:
- authority:
- architecture_standard:
- claim_boundary:
- stop_if:

## Allowed Scope

- Create:
- Modify:
- Test:

## Verification

- command/manual:
- expected:
- failure inspection:

## Execution Chunks

### Chunk 1: <name>

- [ ] Write or update focused evidence.
- [ ] Implement inside allowed scope.
- [ ] Run verification.
- [ ] Append receipt.
- [ ] Update state.

## Receipt Requirements

```json
{
  "task_id": "<T###>",
  "type": "plan_required",
  "result": "done",
  "changed_files": ["docs/goal-diffusion/goals/<goal-id>/implementation-plan.md"],
  "commands": [{ "cmd": "<review command or manual gate>", "status": "pass" }],
  "evidence": ["<plan review evidence>"],
  "claims": ["<claim limited to plan readiness>"],
  "summary": "",
  "next_decision": "continue"
}
```

## Handoff

- ready_for_run:
- blocked_by:
- next_decision:
```

## Review Gate

The plan is valid only if it preserves the Goal Pack contract and can return to
the run phase without changing protected fields.
