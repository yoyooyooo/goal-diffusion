# Work Plan Reference

Use this only for a selected Goal Pack work item that needs pre-reviewed
execution structure.

## Default Path

```text
docs/goal-proof/goals/<goal-id>/plans/<work_id>.md
```

The plan lives inside the Goal Pack. It is referenced from the selected work
item when useful, and `allowed_scope` should include the plan file when the work
item writes or updates it.

## Plan Template

```markdown
# <Goal ID> Work Plan

## Goal Pack

- goal: `docs/goal-proof/goals/<goal-id>/goal.yaml`
- progress: `docs/goal-proof/goals/<goal-id>/progress.yaml`
- work item: `<W###>`
- plan: `docs/goal-proof/goals/<goal-id>/plans/<work_id>.md`

## Protected Boundary

- objective:
- authority:
- engineering_guidance:
- claim_limit:
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
- [ ] Run checks.
- [ ] Append evidence record.
- [ ] Apply progress.

## Evidence Record Requirements

```json
{
  "schema_version": 2,
  "evidence_id": "E001",
  "work_id": "<W###>",
  "type": "planning",
  "result": "done",
  "recorded_at": "<ISO-8601-UTC>",
  "changed_files": ["docs/goal-proof/goals/<goal-id>/plans/<work_id>.md"],
  "checks": [{ "kind": "command", "cmd": "<review command or manual gate>", "status": "pass" }],
  "evidence": ["<plan review evidence>"],
  "claims": ["<claim limited to plan readiness>"],
  "not_claimed": [],
  "summary": "",
  "next_action": "continue"
}
```

## Handoff

- ready_for_run:
- blocked_by:
- next_action:
```

## Review Gate

The plan is valid only if it preserves the Goal Pack goal contract and can
return to implementation without changing fields listed in
`agent_authority.requires_human_decision`.

`ready_for_run: true` also requires `progress.yaml.proof_step` to remain
falsifiable after the plan. If the plan changes the evidence path, update the
proof step before returning to implementation.

For schema, terminology, or command-language migrations, the plan should include
an active-surface pass: skill bodies, references, templates, agents, evals,
README/package docs, CLI help/flags, tests/fixtures, and active Goal Pack
artifacts. It should also state whether public names are renamed, kept as
documented aliases, or recorded as `remaining_gaps`.
