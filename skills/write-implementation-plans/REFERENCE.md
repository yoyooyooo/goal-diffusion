# Plan Required Reference

Use this only for a selected Goal Pack task that needs pre-reviewed execution
structure.

## Default Path

```text
specs/<goal-id>/implementation-spec.md
```

## Spec Template

```markdown
# <Goal ID> Implementation Spec

## Goal Pack

- contract: `docs/goal-diffusion/goals/<goal-id>/contract.yaml`
- state: `docs/goal-diffusion/goals/<goal-id>/state.yaml`
- task: `<T###>`

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
  "type": "worker",
  "result": "done",
  "changed_files": ["<file-in-allowed-scope>"],
  "commands": [{ "cmd": "<command>", "status": "pass" }],
  "evidence": ["<evidence>"],
  "claims": ["<claim>"],
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
