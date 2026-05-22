# Contract Phase Reference

This reference supports the `$goal-diffusion` contract phase.

## Contract Template

Use `../templates/contract.yaml` as the current template.

Minimum shape:

```yaml
id:
status:
objective:
north_star:
authority_refs: []
architecture_standard: []
constraints: []
non_goals: []
completion_oracle:
  signal:
  final_proof:
claim_boundary:
stop_rules: []
autonomy_policy:
  continue_by_default: true
  protected_fields:
    - objective
    - authority_refs
    - architecture_standard
    - claim_boundary
  agent_may_revise:
    - next_slice
    - task_order
    - harness_strength
    - implementation_shape
```

## Contract Review

Before marking a contract `ready`, verify:

- objective is observable;
- authority refs point to current project truth or standards;
- architecture standard is explicit enough to constrain execution;
- completion oracle names the final proof, not just local activity;
- claim boundary says what the goal does not prove;
- stop rules catch authority, security, API/schema/protocol, private data, and
  destructive boundaries;
- an edge phase can name at least one honest falsifiable path.

## Human Review Boundary

Humans review contract fields. Agents may propose repairs, but may not silently
change protected fields after execution starts.

## Contract Status

```text
forming  - still compiling target or authority
ready    - edge can be discovered
running  - state has active execution
blocked  - no safe path inside current contract
done     - final audit satisfied the oracle
retired  - replaced or no longer pursued
```
