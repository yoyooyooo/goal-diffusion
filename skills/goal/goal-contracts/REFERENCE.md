# Goal Contract Reference

This reference supports the `$goal-proof` goal contract authoring phase.

## Template

Use `../goal-proof-system/templates/goal.yaml` as the current template.

Minimum shape:

```yaml
schema_version: 2
id:
status:
intent:
  source:
  interpreted_as:
  assumptions: []
  open_questions: []
objective:
guiding_principle:
relations:
  thread_id:
  links: []
authority_refs: []
engineering_guidance:
  standards: []
  architecture_notes: []
  quality_bar:
  preferred_proof_path:
constraints: []
non_goals: []
completion:
  signal:
  required_evidence:
claim_limit:
stop_rules: []
agent_authority:
  continue_by_default: true
  requires_human_decision:
    - objective
    - completion
    - claim_limit
    - stop_rules
    - authority_refs
  agent_may_revise:
    - proof_step
    - work_order
    - proof_path
    - implementation_shape
```

## Goal Contract Review

Before handing a goal contract to proof-step discovery, check:

- objective is observable;
- authority refs point to current project truth or standards;
- engineering guidance is explicit enough to guide execution, or assumptions are
  recorded when no formal architecture standard exists;
- completion names final proof, not just local activity;
- claim_limit says what the goal does not prove;
- stop rules catch authority, security, API/schema/protocol, private data, and
  destructive boundaries;
- a proof-step phase can name at least one honest falsifiable path.

## Goal Pack Ready Gate

A Goal Pack is ready only when both sides are true:

- `goal.yaml` has stable protected fields;
- `progress.yaml.proof_step` records a falsifiable next movement with source
  state, target delta, proof path, checks, and failure inspection.

If the goal contract is stable but the proof step is still missing, keep the
next phase as proof-step discovery. Do not use `work_items` alone as readiness
evidence.

## Human Review Boundary

Humans review goal contract fields. Agents may propose repairs, but may not
silently change fields listed in `agent_authority.requires_human_decision`
after execution starts.

## Status

```text
forming  - still compiling target or authority
ready    - goal contract stable and current proof step falsifiable
running  - progress has active execution
blocked  - no safe path inside current goal contract
done     - completion review satisfied completion
retired  - replaced or no longer pursued
```
