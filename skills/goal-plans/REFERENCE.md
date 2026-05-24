# Goal Charter Phase Reference

This reference supports the `$goal-diffusion` Goal Charter authoring phase.

## Charter Template

Use `../templates/charter.yaml` as the current template.

Minimum shape:

```yaml
id:
status:
intent:
  source:
  interpreted_as:
  assumptions: []
  open_questions: []
objective:
north_star:
authority_refs: []
engineering_guidance:
  standards: []
  architecture_notes: []
  quality_bar:
  preferred_harness:
constraints: []
non_goals: []
completion:
  signal:
  final_proof:
claim_boundary:
stop_rules: []
autonomy:
  continue_by_default: true
  cannot_silently_change:
    - objective
    - completion
    - claim_boundary
    - stop_rules
    - authority_refs
  agent_may_revise:
    - next_slice
    - task_order
    - harness_strength
    - implementation_shape
```

## Charter Review

Before marking a charter `ready`, verify:

- objective is observable;
- authority refs point to current project truth or standards;
- engineering guidance is explicit enough to guide execution, or assumptions are
  recorded when no formal architecture standard exists;
- completion names the final proof, not just local activity;
- claim boundary says what the goal does not prove;
- stop rules catch authority, security, API/schema/protocol, private data, and
  destructive boundaries;
- an edge phase can name at least one honest falsifiable path.

## Human Review Boundary

Humans review charter fields. Agents may propose repairs, but may not silently
change fields listed in `autonomy.cannot_silently_change` after execution
starts.

## Charter Status

```text
forming  - still compiling target or authority
ready    - edge can be discovered
running  - state has active execution
blocked  - no safe path inside current charter
done     - final audit satisfied completion
retired  - replaced or no longer pursued
```
