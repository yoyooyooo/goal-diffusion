---
name: goal-plans
description: >-
  Contract phase for Goal Diffusion. Prefer entering through $goal-diffusion.
  Use this phase only to compile or repair a Goal Pack contract.yaml: objective,
  authority, architecture standard, constraints, completion oracle, claim
  boundary, stop rules, and autonomy policy.
---

# Contract Phase

This is an internal phase module for `$goal-diffusion`.

It compiles or repairs the human-owned goal node:

```text
docs/goal-diffusion/goals/<goal-id>/contract.yaml
```

## Contract Owns

```text
id
status
objective
north_star
authority_refs
architecture_standard
constraints
non_goals
completion_oracle
claim_boundary
stop_rules
autonomy_policy
```

The contract is the protected surface. Agents may not silently change objective,
authority, architecture standard, claim boundary, or stop rules while running.

## Quick Workflow

1. Read project authority context: host instructions, docs router, SSoT,
   standards, ADR, architecture, roadmap, code/tests/evidence.
2. Decide whether the work stays inline or needs a Goal Pack. If completion
   needs more than one verified receipt, create or repair the Goal Pack.
3. Write or update `contract.yaml`.
4. Define `completion_oracle.signal` and `completion_oracle.final_proof`.
5. Define `claim_boundary`: what the receipt chain may and may not claim.
6. Define `autonomy_policy`: what agents may revise and which fields are
   protected.
7. Route to the edge phase to discover the first harnessed edge.

## Contract Rules

- Contract is not a task tree.
- Contract does not precompute file-by-file implementation.
- Contract links authority by path or URL; it does not copy authority content.
- Contract may reference source material, but consumed source belongs in
  `docs/goal-diffusion/sources/` or `notes/`.
- If objective or authority is unclear and no honest edge can be named, stop
  before execution.

## Output

Return:

```text
goal_pack:
contract:
status: forming | ready | running | blocked | done | retired
oracle:
claim_boundary:
next_phase: edge | blocked | inline
```
