---
name: goal-plans
description: >-
  Authors or repairs Goal Diffusion charter.yaml for a Goal Pack: objective,
  authority, engineering guidance, completion, claim boundary, stop rules, and
  autonomy policy. Use through $goal-diffusion when the user asks to turn a
  discussed plan/solution into a Goal Plan, or when only the charter needs
  compilation or repair.
---

# Goal Charter Phase

This is an internal phase module for `$goal-diffusion`.

It compiles or repairs the human-owned goal node:

```text
docs/goal-diffusion/goals/<goal-id>/charter.yaml
```

## Goal Charter Owns

```text
id
status
intent
objective
north_star
goal_relations
authority_refs
engineering_guidance
constraints
non_goals
completion
claim_boundary
stop_rules
autonomy
evidence_mode
conditional
strict
```

The charter is the protected surface. Agents may not silently change objective,
authority, completion, claim boundary, stop rules, or explicitly protected
fields while running.

## Quick Workflow

1. Read project authority context: host instructions, docs router, SSoT,
   standards, ADR, architecture, roadmap, code/tests/evidence.
2. Decide whether the work stays inline or needs a Goal Pack. If completion
   needs more than one verified receipt, create or repair the Goal Pack.
   When selecting from existing work, use Goal Pack state, receipts, and CLI
   output for ready / running / done facts. Roadmap anchors constrain strategy
   and gates but are not sufficient progress facts.
3. Write or update `charter.yaml`.
4. Define `completion.signal` and `completion.final_proof`.
5. Define `claim_boundary`: what the receipt chain may and may not claim.
6. Define `autonomy`: what agents may revise and which fields cannot change
   silently.
7. Route to the edge phase to discover the first harnessed edge.

## Charter-To-Edge Contract

A Goal Plan is not ready because the charter is written or tasks are listed.
The charter authorizes the goal; the edge makes the next movement falsifiable.

When the user asks to create a Goal Plan, do both unless they explicitly ask for
only a charter draft:

```text
charter.yaml protects intent and boundaries
state.yaml.current_edge proves the next movement can be tested
receipts.jsonl stays empty until work runs
```

Use `status: forming` or `next_phase: edge` while the charter exists but the
first honest edge is missing. Use `status: ready` only when the protected
charter fields are stable and the current edge can identify the evidence path
that would prove or falsify the next movement.

## Charter Rules

- Charter is not a task tree.
- Charter does not precompute file-by-file implementation.
- Charter completion tokens are not enough by themselves; the edge must say how
  the first check will produce, inspect, or falsify those tokens.
- Charter links authority by path or URL; it does not copy authority content.
- Charter may reference source material, but consumed source belongs in
  `docs/goal-diffusion/sources/` or `notes/`.
- Charter may declare `goal_relations.thread_id` and `goal_relations.links`;
  these are metadata only, not a supervising plan, thread lifecycle, task tree,
  or nested Goal Pack state.
- If a new Goal Pack continues a done Goal Pack, prefer `successor_of` with
  `receipt_ref` and required evidence tokens from the predecessor receipt.
- If objective or authority is unclear and no honest edge can be named, stop
  before execution.
- If the goal changes schema fields, method terminology, or command language,
  include public surfaces in `claim_boundary`: CLI flags/help, JSON fields,
  README examples, package docs, templates, agents, evals, tests, fixtures, and
  active Goal Pack artifacts. The charter should make clear whether public names
  are renamed, kept as documented aliases, or excluded from the claim.

## Output

Return:

```text
goal_pack:
charter:
status: forming | ready | running | blocked | done | retired
completion:
claim_boundary:
next_phase: edge | blocked | inline
```
