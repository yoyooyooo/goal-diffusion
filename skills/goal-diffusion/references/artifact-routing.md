# Goal Pack Artifact Routing

Goal Diffusion uses Goal Packs. Older folder-per-artifact routing is no longer
the current model.

## Current Shape

Default project-local shape:

```text
docs/goal-diffusion/
  README.md
  inbox/
  sources/
  goals/
    <goal-id>/
      contract.yaml
      state.yaml
      receipts.jsonl
      notes/
specs/
  <goal-id>/
    implementation-spec.md
```

Host project convention still wins when it has an explicit equivalent. Map the
equivalent to these roles instead of recreating this exact tree.

## Current Artifacts

| Artifact | Role | Default home |
|---|---|---|
| Method index | Explains local Goal Diffusion routing and current goal packs | `docs/goal-diffusion/README.md` |
| Inbox item | Weak signal, open candidate, or raw human input not yet a Goal Pack | `docs/goal-diffusion/inbox/` |
| Source | Consumed context retained for traceability | `docs/goal-diffusion/sources/` |
| Goal Pack | Contract, state, receipt chain, and notes for one goal | `docs/goal-diffusion/goals/<goal-id>/` |
| Contract | Human-owned goal node | `docs/goal-diffusion/goals/<goal-id>/contract.yaml` |
| State | Agent operating memory for current edge and tasks | `docs/goal-diffusion/goals/<goal-id>/state.yaml` |
| Receipts | Append-only evidence chain | `docs/goal-diffusion/goals/<goal-id>/receipts.jsonl` |
| Notes | Long narrative, migration maps, final summaries, or source digests | `docs/goal-diffusion/goals/<goal-id>/notes/` |
| Implementation spec | Detailed plan only for high-risk selected slice | `specs/<goal-id>/implementation-spec.md` |

## Flow

```text
raw idea
  -> inbox item

inbox item
  -> delete | source | goal pack

proposal
  -> inbox item with lifecycle: open_candidate
  -> goal pack when ready
  -> source after consumed

harnessed path
  -> goal pack state.current_edge
  -> notes/ only when long explanation is needed

goal contract
  -> goal pack contract.yaml

run state
  -> goal pack state.yaml

execution evidence
  -> receipts.jsonl
  -> notes/final-report.md only when a human-readable summary is needed

implementation plan
  -> specs/<goal-id>/implementation-spec.md
  -> referenced by a state task with type: plan_required

external docs or old decisions
  -> sources/ when consumed
  -> host authority layer when current truth
```

## Migration Map

Use this map for older Goal Diffusion material:

| Old home or concept | New home |
|---|---|
| seed | `inbox/` with `lifecycle: weak_signal` |
| proposal | `inbox/` with `lifecycle: open_candidate`; later `sources/` after consumed |
| brief | `state.yaml.current_edge`; long context in `notes/` |
| goal plan | `contract.yaml` |
| run | `state.yaml` |
| report | `receipts.jsonl`; long human summary in `notes/` |
| implementation plan | `specs/<goal-id>/implementation-spec.md` |
| source | `sources/` |

## Inbox Rules

Inbox is not a backlog. It is a staging area for material that has not yet
become a Goal Pack or source.

Use `lifecycle` values:

```text
weak_signal
open_candidate
decision_needed
bridge_needed
source_ready
delete
```

Promote an inbox item to a Goal Pack only when it has or can honestly create:

```text
objective
authority_refs
completion_oracle
claim_boundary
first harnessed edge
```

## Goal Pack Rules

One Goal Pack owns one objective contract and one receipt chain.

Child work is represented by a child Goal Pack only when it has its own
contract, claim boundary, and receipt chain. A parent may point to a child in
state or notes, but the child is not a second task list inside the parent.

## Implementation Spec Rules

Create `specs/<goal-id>/implementation-spec.md` only when a selected slice needs
pre-review before execution. Ordinary rolling execution stays in `state.yaml`
and `receipts.jsonl`.

## Index Shape

Use this lightweight index when initializing `docs/goal-diffusion/README.md`:

```markdown
# Goal Diffusion

This directory stores Goal Packs and related input/source material for the
Goal Diffusion operating loop.

## Homes

| Role | Path |
|---|---|
| inbox | `docs/goal-diffusion/inbox/` |
| sources | `docs/goal-diffusion/sources/` |
| goal packs | `docs/goal-diffusion/goals/<goal-id>/` |
| implementation specs | `specs/<goal-id>/implementation-spec.md` |

## Active Goal Packs

## Inbox

## Sources
```
