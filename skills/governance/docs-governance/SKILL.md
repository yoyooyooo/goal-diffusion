---
name: docs-governance
description: >-
  Defines and audits project-agnostic documentation architecture, human-agent
  collaboration SOP, docs-layer lifecycle, and skill handoff rules for long-term
  AI coding projects. Use when designing docs/* top-level folders, replacing
  project-local docs governance / architecture skills, cleaning obsolete
  planning directories, setting up or converging human-to-agent workflows, or
  deciding which docs layer should hold Goal Proof System artifacts, specs,
  protocols, reports, SSoT, standards, ADRs, roadmaps, and implementation
  evidence.
---

Converge a repository's documentation foundation toward sustainable long-running
AI coding. Own `docs/*` layer boundaries, human-agent SOP, docs-layer cleanup,
and skill handoffs; do not own product truth, a single Goal Pack goal contract, or
Goal Proof System method-internal lifecycle. Initialization, migration, and
periodic cleanup are one convergence flow.

## Collaboration Contract

```text
Owns: docs layer model, authority placement, lifecycle cleanup, retained
evidence risk, indexes, and docs audit.
Does not own: product truth, Goal Pack state/evidence records, concrete harness
execution, interface capability semantics, or implementation status.
Inputs: host docs policy, artifact role, authority order, retention risk,
language policy, and evidence links.
Outputs: placement decision, retention verdict, README/index update, cleanup
plan, audit finding, and method handoff note.
Handoff: Goal Pack lifecycle -> goal flow; interface trace -> interface
capability workflow; shared harness placement / claim_ceiling -> harness system
workflow; command proof -> headless harness workflow; browser-visible proof ->
UI harness workflow.
Stop: highest authority is ambiguous, deletion risks unlinked evidence,
or continuing needs product truth, legal/security/compliance retention,
public API/schema/protocol, private-data, or claim_limit choice.
```

## Quick Start
1. Read `AGENTS.md`, `docs/README.md`, and existing docs governance /
   architecture skills when present; missing files are convergence input.
2. Classify: `governance-convergence`, `signal-placement`, `placement`,
   `migration-cleanup`, `skill-handoff`, `artifact-graph`,
   `harness-placement`, or `audit`.
3. Load required references. Do not answer mature cleanup or convergence from
   `SKILL.md` alone.
4. Apply the host repo's document-language rules before writing or rewriting
   artifacts. Keep machine fields / templates stable, but write narrative prose
   in the language required by `AGENTS.md` or the nearest docs policy.
5. Assign docs-layer lifecycle states and retention verdicts before moves or
   deletions. If the artifact is inside a Goal Proof System flow, use
   `$goal-proof` for method lifecycle and this skill only for placement,
   evidence-retention risk, language policy, indexes, and docs-layer conflict.

## Required References
- `governance-convergence`: read [Docs Layer Model](references/docs-layer-model.md),
  [Human-Agent SOP](references/human-agent-sop.md), and
  [Lifecycle and Cleanup](references/lifecycle-cleanup.md).
- `signal-placement`: read [Human-Agent SOP](references/human-agent-sop.md),
  [Lifecycle and Cleanup](references/lifecycle-cleanup.md), and
  [Artifact Graph](references/artifact-graph.md) when deciding where weak
  signals, candidates, Goal Packs, sources, reports, or implementation specs
  should live. Use `$goal-proof` for inbox lifecycle and Goal Pack
  promotion.
- `migration-cleanup`: read [Docs Layer Model](references/docs-layer-model.md) and
  [Lifecycle and Cleanup](references/lifecycle-cleanup.md).
- `placement`: read [Docs Layer Model](references/docs-layer-model.md); if moving /
  deleting, also read [Lifecycle and Cleanup](references/lifecycle-cleanup.md).
- `skill-handoff`: read [Lifecycle and Cleanup](references/lifecycle-cleanup.md#replacing-project-local-governance-skills).
- `audit`: read [Docs Layer Model](references/docs-layer-model.md) and run
  `python3 scripts/run_docs_audit.py --repo <repo>` when repo access exists.
  Repo-local wrappers may add host policy, command binding, language policy, or
  project-specific exceptions, but must stay thin and must not fork generic
  lifecycle doctrine or encode product truth as governance.
- `artifact-graph`: read [Artifact Graph](references/artifact-graph.md) and use
  `python3 scripts/artifact_graph.py current|audit|review-list --repo <repo>`.
- `harness-placement`: read [Docs Layer Model](references/docs-layer-model.md)
  and [Lifecycle and Cleanup](references/lifecycle-cleanup.md). This parent
  skill decides docs placement, lifecycle, and authority layer. For concrete
  headless-product-first command surfaces, smoke evidence contracts,
  fixture/replay ladders, and boundary checks, hand off to
  `headless-product-harness` when available.

## Core Doctrine
```text
docs/* top-level folders are document layers, not project hobbies.
Goal flow controls work; docs governance controls where truths live.
Implementation plans execute near; evidence decides what can be claimed.
Convergence handles initialization, migration, and periodic cleanup as one flow.
```

Goal Proof System owns Goal Pack goal contracts, progress state, evidence
records, inbox lifecycle, promotion gates, relations, and completion review.
This skill only decides where those artifacts live in `docs/*`, how they relate
to SSoT / standards / ADR / roadmap / specs, and whether cleanup would lose
current authority, evidence, or navigation.

Human escalation is the last resort, not the default response to missing
execution detail. When objective, SSoT / standards, claim_limit, and falsifiable
evidence intent are clear, missing harness, missing
bridge detail, missing command wrapper, or missing local evidence plumbing is
agent implementation / convergence scope. The agent should create the minimum
bridge, harness, standard command, report, or index update needed to prove or
falsify the current goal, then continue. Treat a case as blocked only when the
agent cannot name an honest falsifiable path, or when continuing would require a
new human / higher-authority decision, changed claim standard, changed product
truth, unsafe retention decision, security / compliance decision, public
protocol/API/schema authority change, or unsafe raw/private data handling.

## Placement Cheatsheet
- Current invariant or object ownership -> `docs/ssot/**`.
- Executable rule, command, gate, naming, SOP -> `docs/standards/**`.
- Adopted tradeoff -> `docs/adr/**`.
- Sequence, gate, coverage, status, evidence link -> `docs/roadmap/**`.
- Wire profile, schema, media type, canonical example -> `docs/protocols/**`.
- Product shape -> `docs/product/**` or `docs/features/**`.
- UI / UX / visual system -> `docs/design/**`.
- Goal contract, principles, boundaries, claim standard, stop rules, evidence
  gates -> `docs/goal-proof/goals/**`.
- Implementation spec, work item list, checklist, local evidence -> root `specs/**`.
- Weak signal or open candidate -> Goal Proof System inbox when the project uses
  `$goal-proof`; otherwise `docs/proposals/**`.

## Convergence Rules
- `$goal-proof` owns method-internal lifecycle: inbox/source/Goal Pack,
  evidence-backed completion, retention/demotion within that method, Goal
  Relations, and completion review. This skill owns docs-layer placement, layer
  conflicts, indexes, host language policy, retained evidence risk, and
  migration cleanup around those artifacts.
- Prefer one current path. Keep bridges only with owner, reason, expiry, and
  deletion conditions.
- Keep top-level docs directories stable, generic, and layer-named.
- Create only the thinnest missing README / template needed for routing.
- Docs-layer lifecycle states: active authority, active route, candidate
  material, converted source, evidence record, missing baseline, obsolete.
- Retention verdicts: keep, promote, demote, migrate, split, merge, bridge,
  block, archive-as-source, delete, create-thin.
- Do not reimplement `$goal-proof` inbox, promotion, retention, demotion, or
  Goal Pack completion rules in project-local docs. Thin local adapters may map
  host authority layers, commands, language policy, audit gates, and product
  promotion targets.
- When a project uses Goal Proof System, Goal Pack ready / running / blocked /
  done, active work item, evidence chain, and completion review are method facts owned by
  Goal Proof System artifacts and CLI output. Roadmaps may link to those facts or
  record launch policy, but must not become a hand-written progress ledger.
- Deferred follow-ups that may affect future architecture, harness, product
  scope, or agent handoff should be routed by the active method. For
  `$goal-proof` projects, that means an inbox item unless the gap belongs in
  the nearest implementation artifact.
- Reports are evidence summaries, not diaries.
- Roadmaps carry sequence, gates, coverage, status, and evidence links; they do
  not become work item trackers or evidence reports.
- A roadmap status entry should be a route/index/evidence link, not a duplicate
  source of Goal Pack progress truth.
- Artifact graph YAML is judged metadata, not mechanical decoration. Scripts
  generate small views; agents still do semantic review before changing facts.
- Audit scripts print to stdout. Durable summaries belong in reports only when
  a user or handoff explicitly needs them. Repo-local audit adapters may
  compose upstream checks with host policy overlays, but should keep findings
  machine-readable and route doctrine changes back to the owning skill or docs
  layer instead of becoming a parallel governance system.
- Host repo language policy is part of governance. If `AGENTS.md` says planning
  prose under a path should use a specific language, new or substantially
  rewritten governance / goal / roadmap / report prose must follow it. YAML
  frontmatter, artifact type names, status values, field names, code symbols,
  commands, protocol names, prompt blocks, schema examples, and reusable
  templates may stay English when that preserves copyability and stable
  matching.

## Output
```text
classification:
references_read:
docs_layer_states:
retention_verdicts:
convergence_actions:
placement_decisions:
method_handoffs:
blocked_decisions:
indexes_updated:
paths_deleted_or_retired:
verification:
open_questions:
```

## Stop Rules
Stop and ask for a project decision when:
- two layers could both plausibly be the highest authority;
- deletion would remove source evidence that is not linked elsewhere;
- legal, security, release-history, or compliance retention may apply;
- the user asks for product truth rather than governance.
- no honest falsifiable path can be named within existing authority;
- continuing would require changing the goal claim_limit, product truth,
  SSoT / standards / ADR authority, public protocol/API/schema posture,
  security policy, or private/raw-data handling rules.
