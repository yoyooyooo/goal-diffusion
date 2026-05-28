# Goal Pack Artifact Routing

Goal Proof System uses Goal Packs.

## Current Shape

Default project-local shape:

```text
docs/goal-proof/
  README.md
  inbox/
  sources/
  goals/
    <goal-id>/
      goal.yaml
      progress.yaml
      evidence.jsonl
      plans/<work_id>.md  # only when needs_plan
      interface-capabilities.yaml  # optional UI/interface trace companion
      product-harness.yaml  # optional harness proof companion
      notes/
```

Host project convention still wins when it has an explicit equivalent. Map the
equivalent to these roles instead of recreating this exact tree.

## Current Artifacts

| Artifact | Role | Default home |
|---|---|---|
| Method index | Explains local Goal Proof System routing and current goal packs | `docs/goal-proof/README.md` |
| Inbox item | Weak signal, open candidate, or raw human input not yet a Goal Pack | `docs/goal-proof/inbox/` |
| Source | Consumed context retained for traceability | `docs/goal-proof/sources/` |
| Goal Pack | Goal contract, progress, evidence chain, and notes for one goal | `docs/goal-proof/goals/<goal-id>/` |
| Goal Contract | Human-owned goal authorization and executable intent compression | `docs/goal-proof/goals/<goal-id>/goal.yaml` |
| Progress | Agent operating memory for current proof step and work items | `docs/goal-proof/goals/<goal-id>/progress.yaml` |
| Evidence Records | Append-only evidence chain | `docs/goal-proof/goals/<goal-id>/evidence.jsonl` |
| Notes | Long narrative, final summaries, or source digests | `docs/goal-proof/goals/<goal-id>/notes/` |
| Implementation plan | Detailed plan only for high-risk selected slice | `docs/goal-proof/goals/<goal-id>/plans/<work_id>.md` |
| Interface capabilities | Optional UI/IA/interaction trace companion; contains InterfaceCapability and InterfaceSurface candidates | `docs/goal-proof/goals/<goal-id>/interface-capabilities.yaml` |
| Product harness | Optional harness proof companion; contains HarnessScenario, fixture refs, route/component refs, evidence refs, claim limits, lifecycle, and coverage matrix candidates | `docs/goal-proof/goals/<goal-id>/product-harness.yaml` |

The method index may list current Goal Packs and status entry points, but it
should not maintain a hand-written progress list that competes with Goal Pack
state, evidence records, and CLI output.

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

proof path
  -> goal pack progress.proof_step
  -> notes/ only when long explanation is needed

goal contract
  -> goal pack goal.yaml

run state
  -> goal pack progress.yaml

execution evidence
  -> evidence.jsonl
  -> notes/final-report.md only when a human-readable summary is needed

implementation plan
  -> goal pack plans/<work_id>.md
  -> referenced by a progress work item with plan: plans/<work_id>.md when useful

interface capability trace
  -> goal pack interface-capabilities.yaml only when the goal includes UI/IA,
     interaction state, frontend state/data orchestration, or browser-visible
     proof
  -> referenced from goal/progress/evidence records by ID, not embedded as the full DSL

product harness trace
  -> goal pack product-harness.yaml only when the goal needs durable harness
     scenario, fixture, route/component, evidence ref, claim limit, lifecycle,
     or coverage matrix planning
  -> referenced from goal/progress/evidence records by ID, not embedded as the full DSL

external docs or decisions
  -> sources/ when consumed
  -> host authority layer when current truth
```

## Governance Signal Routing

Project-local docs often discover method-level rules while cleaning planning
material. Route those rules by scope:

| Signal | Route |
|---|---|
| Seed, inbox, Goal Pack, evidence record, successor, completion review, lifecycle, retention or cleanup rule that should apply to any project | update this skill or its references |
| Host authority layer, language policy, command name, product promotion target, release gate, local audit command | keep in the host project |
| Raw idea, weak signal, gap map, or deferred follow-up | `inbox/` |
| Consumed proposal, imported planning branch, historical prompt, or source digest | `sources/` or Goal Pack `notes/source-history/` |
| Detailed work item checklist, trace item list, or local implementation evidence | host implementation artifact such as `specs/**`, unless the Goal Pack has a `needs_plan` slice |
| UI/IA interaction capability trace for a Goal Pack | `interface-capabilities.yaml` companion artifact |
| Harness scenario, fixture/route/evidence refs, claim limit, or coverage trace for a Goal Pack | `product-harness.yaml` companion artifact; route concrete UI/headless execution details to the owning harness method |

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
claim_limit
first proof step
```

Use `weak_signal` for raw material that is worth preserving but not yet
evaluable. Use `open_candidate` when tradeoffs, authority refs, or candidate
completion evidence are visible but the first proof step is not selected. Use
`decision_needed` only when continuing would require a higher-authority choice.
Use `bridge_needed` when two goals or states need a first proof path.
Use `source_ready` when the material has been consumed and should be retained
only for traceability.

Do not write implementation plans, active work item checklists, completion claims, or
evidence record substitutes in inbox items.

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
| `bridge` | A goal chain lacks a first proof path | create the thinnest bridge note or progress proof step |
| `archive-as-source` | Accepted work consumed the material but traceability remains useful | retain as source or short backlink |
| `delete` | Obsolete, duplicate, misleading, or no longer referenced | delete after reference and evidence checks |
| `block` | No honest falsifiable path exists without changing protected authority | record the decision need and stop |

Default bias is to delete, demote, or archive stale planning prose once the
current authority, Goal Pack, evidence record, or implementation artifact carries the
needed fact.

When demoted material remains visible, add a clear status line so future agents
do not treat it as current scope:

```text
Status: planning material only.
Not current implementation scope.
Implementation may start only after the named evidence gates pass.
```

If demoted material later becomes accepted authority, a Goal Pack goal contract, an
implementation artifact, or an evidence record, reduce the original material to a short
backlink or delete it after references are updated.

## Active Homes Rule

Default operation uses the active homes in the Goal Pack shape. Host projects
may keep explicit equivalents only when they already have a documented role and
do not create competing state. Map each equivalent to inbox, source, Goal Pack,
evidence record, notes, implementation plan, or host implementation artifact.

## Goal Pack Rules

One Goal Pack owns one objective goal contract and one evidence chain.

Follow-up work is represented by another Goal Pack only when it has its own
goal contract, claim_limit, and evidence chain. A Goal Pack may reference another
Goal Pack in progress or notes, but that referenced pack is not a second work item list
inside the current pack.

## Implementation Plan Rules

Create `docs/goal-proof/goals/<goal-id>/plans/<work_id>.md` only when a
selected slice needs pre-review before execution. Ordinary rolling execution
stays in `progress.yaml` and `evidence.jsonl`.

When the plan exists, the corresponding `progress.yaml` work item may use
`plan: plans/<work_id>.md`, and `allowed_scope` should include the plan file
when the plan is edited. The plan is not a goal contract, product spec, schema
authority, or parallel workflow; it is an execution plan for one selected
high-risk slice inside the Goal Pack boundary.

## Interface Capability Companion Rules

Create `docs/goal-proof/goals/<goal-id>/interface-capabilities.yaml` only
when a Goal Pack needs durable traceability for UI/IA, interface capability,
frontend state/data ownership, or browser-visible proof.

The companion artifact may contain thin `InterfaceCapability` and
`InterfaceSurface` candidates. It may reference harness IDs but must not define
full `HarnessScenario` or `HarnessEvidence` records. The Goal Pack should
reference trace objects by ID:

```yaml
interface_capability_refs:
  - ic.issue-intake.from-channel-message
```

Do not put the full Interface Capability DSL inside `goal.yaml`. Evidence records may
include:

```json
{
  "interface_capabilities": [
    {
      "id": "ic.issue-intake.from-channel-message",
      "status": "verified",
      "ui_harness": "uh.issue-intake.browser",
      "headless_proof": "hp.issue-create.from-message",
      "evidence": ["screenshot:...", "command:..."]
    }
  ]
}
```

This companion does not apply to headless-only, docs-only, infra-only, or
CLI-only goals unless a user-visible interface path is part of the claim.

## Product Harness Companion Rules

Create `docs/goal-proof/goals/<goal-id>/product-harness.yaml` only when a
Goal Pack needs durable traceability for harness scenarios, fixtures, route or
component refs, evidence refs, claim limits, lifecycle, or coverage matrix.

The companion artifact may contain thin `HarnessScenario`, `HarnessFixture` ref,
`HarnessRoute` ref, `HarnessComponent` ref, `HarnessEvidence` ref, and coverage
entries. It must not redefine InterfaceCapability semantics; use `covers` to
point at `ic.*` IDs:

```yaml
harness_scenario_refs:
  - hs.issue-intake.from-channel-message
```

Do not put the full Product Harness DSL inside `goal.yaml`. Evidence records may
include executed evidence by ID and artifact path.

This companion does not apply to docs-only or goal-planning-only work unless a
proof surface is part of the claim.

## Index Shape

Use this lightweight index when initializing `docs/goal-proof/README.md`:

```markdown
# Goal Proof System

This directory stores Goal Packs and related input/source material for the
Goal Proof System operating loop.

## Homes

| Role | Path |
|---|---|
| inbox | `docs/goal-proof/inbox/` |
| sources | `docs/goal-proof/sources/` |
| goal packs | `docs/goal-proof/goals/<goal-id>/` |
| implementation plans | `docs/goal-proof/goals/<goal-id>/plans/<work_id>.md` |

## Active Goal Packs

## Inbox

## Sources
```
