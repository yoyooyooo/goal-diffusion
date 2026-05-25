# Goal Pack Artifact Routing

Goal Diffusion uses Goal Packs.

## Current Shape

Default project-local shape:

```text
docs/goal-diffusion/
  README.md
  inbox/
  sources/
  goals/
    <goal-id>/
      charter.yaml
      state.yaml
      receipts.jsonl
      implementation-plan.md  # only when plan_required
      notes/
```

Host project convention still wins when it has an explicit equivalent. Map the
equivalent to these roles instead of recreating this exact tree.

## Current Artifacts

| Artifact | Role | Default home |
|---|---|---|
| Method index | Explains local Goal Diffusion routing and current goal packs | `docs/goal-diffusion/README.md` |
| Inbox item | Weak signal, open candidate, or raw human input not yet a Goal Pack | `docs/goal-diffusion/inbox/` |
| Source | Consumed context retained for traceability | `docs/goal-diffusion/sources/` |
| Goal Pack | Charter, state, receipt chain, and notes for one goal | `docs/goal-diffusion/goals/<goal-id>/` |
| Goal Charter | Human-owned goal authorization and executable intent compression | `docs/goal-diffusion/goals/<goal-id>/charter.yaml` |
| State | Agent operating memory for current edge and tasks | `docs/goal-diffusion/goals/<goal-id>/state.yaml` |
| Receipts | Append-only evidence chain | `docs/goal-diffusion/goals/<goal-id>/receipts.jsonl` |
| Notes | Long narrative, final summaries, or source digests | `docs/goal-diffusion/goals/<goal-id>/notes/` |
| Implementation plan | Detailed plan only for high-risk selected slice | `docs/goal-diffusion/goals/<goal-id>/implementation-plan.md` |

The method index may list current Goal Packs and status entry points, but it
should not maintain a hand-written progress list that competes with Goal Pack
state, receipts, and CLI output.

## Flow

```text
raw idea
  -> inbox item

inbox item
  -> delete | source | goal pack | nearest implementation artifact

proposal
  -> inbox item with lifecycle: open_candidate
  -> goal pack when ready
  -> source after consumed

harnessed path
  -> goal pack state.current_edge
  -> notes/ only when long explanation is needed

goal charter
  -> goal pack charter.yaml

run state
  -> goal pack state.yaml

execution evidence
  -> receipts.jsonl
  -> notes/final-report.md only when a human-readable summary is needed

implementation plan
  -> goal pack implementation-plan.md
  -> referenced by a state task with type: plan_required and plan: implementation-plan.md

external docs or decisions
  -> sources/ when consumed
  -> host authority layer when current truth
```

## Governance Signal Routing

Project-local docs often discover method-level rules while cleaning planning
material. Route those rules by scope:

| Signal | Route |
|---|---|
| Seed, inbox, Goal Pack, receipt, successor, final audit, lifecycle, retention or cleanup rule that should apply to any project | update this skill or its references |
| Host authority layer, language policy, command name, product promotion target, release gate, local audit command | keep in the host project |
| Raw idea, weak signal, gap map, or deferred follow-up | `inbox/` |
| Consumed proposal, imported planning branch, historical prompt, or source digest | `sources/` or Goal Pack `notes/source-history/` |
| Detailed task checklist, trace item list, or local implementation evidence | host implementation artifact such as `specs/**`, unless the Goal Pack has a `plan_required` slice |

When a project has duplicated this method-level doctrine locally, converge by
moving the generic rule here and reducing the project document to a thin local
adapter.

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
completion
claim_boundary
first harnessed edge
```

Use `weak_signal` for raw material that is worth preserving but not yet
evaluable. Use `open_candidate` when tradeoffs, authority refs, or candidate
completion evidence are visible but the first harnessed edge is not selected. Use
`decision_needed` only when continuing would require a higher-authority choice.
Use `bridge_needed` when two goals or states need a first harnessed path.
Use `source_ready` when the material has been consumed and should be retained
only for traceability.

Do not write implementation plans, active task checklists, completion claims, or
receipt substitutes in inbox items.

## Retention Rules

Keep goal artifacts only while they help a future agent preserve current
authority, evidence, or continuity.

Use these retention verdicts:

| Verdict | Use when | Action |
|---|---|---|
| `keep` | Still active authority, route, evidence, or Goal Pack continuity | keep and index lightly |
| `promote` | A candidate has enough authority and evidence to become current truth or a Goal Pack | move to the host authority layer or create/update a Goal Pack |
| `demote` | A document looks authoritative but is only candidate material | move to inbox, source, notes, or nearest implementation artifact |
| `migrate` | Valid material lives in the wrong role | move by semantic role and update links |
| `split` | One artifact mixes unrelated candidates, decisions, or goals | split by lifecycle role |
| `merge` | Multiple artifacts duplicate the same candidate or decision | merge into one live artifact and retire the rest |
| `bridge` | A goal chain lacks a first harnessed path | create the thinnest bridge note or state edge |
| `archive-as-source` | Accepted work consumed the material but traceability remains useful | retain as source or short backlink |
| `delete` | Obsolete, duplicate, misleading, or no longer referenced | delete after reference and evidence checks |
| `block` | No honest falsifiable path exists without changing protected authority | record the decision need and stop |

Default bias is to delete, demote, or archive stale planning prose once the
current authority, Goal Pack, receipt, or implementation artifact carries the
needed fact.

When demoted material remains visible, add a clear status line so future agents
do not treat it as current scope:

```text
Status: planning material only.
Not current implementation scope.
Implementation may start only after the named evidence gates pass.
```

If demoted material later becomes accepted authority, a Goal Pack charter, an
implementation artifact, or a receipt, reduce the original material to a short
backlink or delete it after references are updated.

## Active Homes Rule

Default operation uses the active homes in the Goal Pack shape. Host projects
may keep explicit equivalents only when they already have a documented role and
do not create competing state. Map each equivalent to inbox, source, Goal Pack,
receipt, notes, implementation plan, or host implementation artifact.

## Goal Pack Rules

One Goal Pack owns one objective charter and one receipt chain.

Follow-up work is represented by another Goal Pack only when it has its own
charter, claim boundary, and receipt chain. A Goal Pack may reference another
Goal Pack in state or notes, but that referenced pack is not a second task list
inside the current pack.

## Implementation Plan Rules

Create `docs/goal-diffusion/goals/<goal-id>/implementation-plan.md` only when a
selected slice needs pre-review before execution. Ordinary rolling execution
stays in `state.yaml` and `receipts.jsonl`.

When the plan exists, the corresponding `state.yaml` task should use
`type: plan_required`, `plan: implementation-plan.md`, and an `allowed_scope`
entry for the plan file. The plan is not a charter, product spec, schema
authority, or parallel workflow; it is an execution plan for one selected
high-risk slice inside the Goal Pack boundary.

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
| implementation plans | `docs/goal-diffusion/goals/<goal-id>/implementation-plan.md` |

## Active Goal Packs

## Inbox

## Sources
```
