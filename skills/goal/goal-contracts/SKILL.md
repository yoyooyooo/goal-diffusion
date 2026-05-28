---
name: goal-contracts
description: >-
  Authors or repairs Goal Proof System goal.yaml for a Goal Pack: objective,
  authority, engineering guidance, completion, claim_limit, stop rules, and
  agent_authority policy. Use through $goal-proof when the user asks to turn a
  discussed plan/solution into a Goal Plan, or when only the goal contract needs
  compilation or repair.
---

# Goal Contract Phase

This is an internal phase module for `$goal-proof`.

It compiles or repairs the human-owned goal node:

```text
docs/goal-proof/goals/<goal-id>/goal.yaml
```

## Goal Contract Owns

```text
id
status
intent
objective
guiding_principle
relations
authority_refs
engineering_guidance
constraints
non_goals
completion
claim_limit
stop_rules
agent_authority
evidence_mode
conditional
strict
```

The goal contract is the protected surface. Agents may not silently change objective,
authority, completion, claim_limit, stop rules, or explicitly protected
fields while running.

## Quick Workflow

1. Read project authority context: host instructions, docs router, SSoT,
   standards, ADR, architecture, roadmap, code/tests/evidence.
2. Decide whether the work stays inline or needs a Goal Pack. If completion
   needs more than one verified evidence record, create or repair the Goal Pack.
   When selecting from existing work, use Goal Pack state, evidence records, and CLI
   output for ready / running / done facts. Roadmap anchors constrain strategy
   and gates but are not sufficient progress facts.
3. Write or update `goal.yaml`.
4. Define `completion.signal` and `completion.required_evidence`.
5. Define `claim_limit`: what the evidence chain may and may not claim.
6. Define `agent_authority`: what agents may revise and which fields cannot change
   silently.
7. Route to the proof-step phase to discover the first falsifiable proof step.

## Contract-To-Proof-Step Contract

A Goal Plan is not ready because `goal.yaml` is written or work items are listed.
The goal contract authorizes the goal; `proof_step` makes the next movement falsifiable.

When the user asks to create a Goal Plan, do both unless they explicitly ask for
only a `goal.yaml` draft:

```text
goal.yaml protects intent and boundaries
progress.yaml.proof_step proves the next movement can be tested
evidence.jsonl stays empty until work runs
```

Use `status: forming` or `next_action: needs_plan` while `goal.yaml` exists but
the first honest proof step is missing. Use `status: ready` only when the protected
goal fields are stable and `proof_step` identifies the next proof path that
would prove or falsify the next movement.

## Goal Contract Rules

- `goal.yaml` is not a work item tree.
- `goal.yaml` does not precompute file-by-file implementation.
- Completion tokens are not enough by themselves; the proof step must say how
  the first check will produce, inspect, or falsify those tokens.
- `goal.yaml` links authority by path or URL; it does not copy authority content.
- `goal.yaml` may reference source material, but consumed source belongs in
  `docs/goal-proof/sources/` or `notes/`.
- `goal.yaml` may declare `relations.thread_id` and `relations.links`;
  these are metadata only, not a supervising plan, thread lifecycle, work item tree,
  or nested Goal Pack state.
- If a new Goal Pack continues a done Goal Pack, prefer `successor_of` with
  `evidence_ref` and required evidence tokens from the predecessor evidence record.
- If objective or authority is unclear and no honest proof step can be named, stop
  before execution.
- If the goal changes schema fields, method terminology, or command language,
  include public surfaces in `claim_limit`: CLI flags/help, JSON fields,
  README examples, package docs, templates, agents, evals, tests, fixtures, and
  active Goal Pack artifacts. `goal.yaml` should make clear whether public names
  are renamed, kept as documented aliases, or excluded from the claim.

## Output

Return:

```text
goal_pack:
goal_contract:
status: forming | ready | running | blocked | done | retired
completion:
claim_limit:
next_phase: proof_step | blocked | inline
```
