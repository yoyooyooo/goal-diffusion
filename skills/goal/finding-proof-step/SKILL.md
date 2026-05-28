---
name: finding-proof-step
description: >-
  Finds the smallest falsifiable runnable proof step for a Goal Proof System Goal Pack
  and writes progress.yaml.proof_step. Use through $goal-proof when a Goal
  Plan/Goal Pack needs a first executable path, sharper next state, or an honest
  blocked decision because no path exists.
---

# Proof Step Phase

This is an internal phase module for `$goal-proof`.

It discovers a proof step. A proof step connects one goal state to a sharper
state through evidence:

```text
source goal state
  -> proof_path
  -> verification
  -> evidence record
  -> sharper goal state
```

## Core Doctrine

- Find the first falsifiable proof step, not the whole graph.
- Find the smallest runnable path that can prove or falsify the next movement.
- Do not write a speculative work item tree.
- Write the chosen proof step into `progress.yaml.proof_step`.
- If work continues a related Goal Pack, keep the proof step inside the current Goal
  Pack. Use `relations.thread_id` only as a label and use relation links
  only as predecessor evidence.
- A derived graph view may help inspect continuity, but it is not a proof-step
  artifact and must not be written as stored planning state.

## Proof Step Owns

```text
proof_step.from
proof_step.target_delta
proof_step.proof_path
proof_step.checks
proof_step.failure_inspection
```

`proof_path` includes the run/smoke/logs/repro/fixtures needed for this
proof step, but it must stay focused on the current claim. Broad harness
infrastructure is implementation work only when it proves the current proof step.

When a roadmap next-anchor exists, refresh the selected Goal Pack's state and
evidence records before trusting it. A roadmap can suggest route priority, but the
current proof step must be grounded in the selected Goal Pack's own state and
evidence.

## Edge Self-Check

Before calling a proof step ready, check that it answers these questions in
`progress.yaml.proof_step`:

- What concrete current state is this proof step starting from?
- What sharper state will be true if the proof step succeeds?
- What input, fixture, trace, command, UI action, dataset, or manual gate drives
  the check?
- What positive evidence tokens, assertions, or observations must appear?
- What `not_claimed` entries must be recorded?
- What is the claim limit of this proof level?
- Where should the next agent inspect first if the proof step fails?

If the only verification is a future command name, sharpen the proof step by defining
the command contract and evidence envelope. If the command itself is the
missing product work, make command creation the proof-step target and still specify
the tokens or observations it must emit.

## Quick Workflow

1. Read `goal.yaml`.
2. Read authority context relevant to the proof step.
3. Classify the distance: greenfield, existing module, stabilization before
   feature, transition, or blocked authority.
4. Compare 2-3 candidate proof steps when route choice matters.
5. Select the smallest falsifiable runnable proof step.
6. Record `proof_step` in `progress.yaml`.
7. Seed the first active work item only when the next run step is clear.

## Route Choice

Prefer the lowest proof level that can honestly move the goal:

```text
static/boundary check
  -> offline fixture
  -> replay
  -> adapter/projection smoke
  -> db_backed smoke
  -> real runtime or manual acceptance
```

Do not jump to a real runtime or broad end-to-end path when an offline fixture
can prove the current claim. Do not stay at a static check when the claim
requires behavior.

## No Honest Path

If no honest falsifiable path can be named, do not fabricate a work item list. Record:

```text
missing_authority:
missing_harness:
blocked_by:
smallest_bridge_needed:
human_decision_needed:
```

Then set `progress.yaml.next_action: blocked` or return to the goal-contract phase.

## Output

```text
goal_pack:
proof_step:
  from:
  target_delta:
  proof_path:
  checks:
  failure_inspection:
next_phase: run | needs_plan | blocked
```
