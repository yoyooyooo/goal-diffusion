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

- charter: `docs/goal-diffusion/goals/<goal-id>/charter.yaml`
- state: `docs/goal-diffusion/goals/<goal-id>/state.yaml`
- task: `<T###>`
- plan: `docs/goal-diffusion/goals/<goal-id>/implementation-plan.md`

## Protected Boundary

- objective:
- authority:
- engineering_guidance:
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
- no-match or allowlist checks for retired terms when absence is claimed
- public-surface rename/alias checks when schema fields are renamed

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
  "checks": [{ "kind": "command", "cmd": "<review command or manual gate>", "status": "pass" }],
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

The plan is valid only if it preserves the Goal Pack charter and can return to
the run phase without changing fields listed in
`autonomy.cannot_silently_change`.

`ready_for_run: true` also requires `state.yaml.current_edge` to remain
falsifiable after the plan. If the plan changes the evidence path, update the
edge before returning to run phase.

For schema, terminology, or command-language migrations, the plan should include
an active-surface pass: skill bodies, references, templates, agents, evals,
README/package docs, CLI help/flags, tests/fixtures, and active Goal Pack
artifacts. It should also state whether public names are renamed, kept as
documented aliases, or recorded as `remaining_gaps`.
