---
name: finding-harnessed-path
description: >-
  Edge phase for Goal Diffusion. Prefer entering through $goal-diffusion. Use
  this phase when a Goal Pack needs the smallest falsifiable runnable path from
  current clarity to a sharper state, or when no honest path may exist.
---

# Edge Phase

This is an internal phase module for `$goal-diffusion`.

It discovers a harnessed edge. A harnessed edge connects one goal state to a
sharper state through evidence:

```text
source goal state
  -> harnessed_path
  -> verification
  -> receipt
  -> sharper goal state
```

## Core Doctrine

- Find the first falsifiable edge, not the whole graph.
- Find the smallest runnable path that can prove or falsify the next movement.
- Do not write a speculative task tree.
- Write the chosen edge into `state.yaml.current_edge`.
- If work continues a related Goal Pack, keep the edge inside the current Goal
  Pack. Use `goal_relations.thread_id` only as a label and use relation links
  only as predecessor evidence.
- A derived graph view may help inspect continuity, but it is not an edge
  artifact and must not be written as stored planning state.

## Edge Owns

```text
current_edge.from
current_edge.target_delta
current_edge.harnessed_path
current_edge.verify
current_edge.failure_inspection
```

`harnessed_path` includes the run/smoke/logs/repro/fixtures needed for this
edge, but it must stay focused on the current claim. Broad harness
infrastructure is run-phase work only when it proves the current edge.

## Quick Workflow

1. Read `contract.yaml`.
2. Read authority context relevant to the edge.
3. Classify the distance: greenfield, existing module, stabilization before
   feature, transition, or blocked authority.
4. Compare 2-3 candidate edges when route choice matters.
5. Select the smallest falsifiable runnable edge.
6. Record `current_edge` in `state.yaml`.
7. Seed the first active task only when the next run step is clear.

## No Honest Path

If no honest falsifiable path can be named, do not fabricate a task list. Record:

```text
missing_authority:
missing_harness:
blocked_by:
smallest_bridge_needed:
human_decision_needed:
```

Then set `state.next_decision: blocked` or return to the contract phase.

## Output

```text
goal_pack:
edge:
  from:
  target_delta:
  harnessed_path:
  verify:
  failure_inspection:
next_phase: run | plan_required | blocked
```
