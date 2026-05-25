# Human-Agent SOP

This SOP keeps long-running AI coding from becoming a pile of plans, stale
prompts, and unverified claims.

## Operating Loop

```text
human input
  -> inspect current repo state
  -> classify distance
  -> place artifact in the right layer
  -> freeze authority / evidence boundary
  -> plan only the reachable slice
  -> implement near
  -> verify
  -> report only proven claims
  -> promote gaps into the next loop
```

## Human Escalation Rule

Escalate to a human only as a last resort. Missing implementation detail is not
itself a blocker when the higher layers are clear.

If north star, SSoT / standards, goal objective, claim boundary, allowed write
scope, and falsifiable evidence intent are clear, the agent should fill missing
harness, bridge, command wrapper, local test, report, index, or queue plumbing as
part of the current goal. This applies during planning as well as
implementation: a planning gap usually means create the thinnest bridge or
readiness artifact, not stop for a human.

Mark work blocked and ask for a human / higher-authority decision only when one
of these is true:

- no honest falsifiable evidence path can be named;
- continuing would change product truth, SSoT / standards / ADR authority,
  public protocol/API/schema posture, security policy, or claim standard;
- continuation requires unsafe raw/private data handling or retention;
- two authority layers plausibly conflict and the agent cannot resolve by the
  project's conflict order;
- legal, security, release-history, compliance, or irreversible data risk is
  present.

In short:

```text
missing harness -> agent fills within scope
missing bridge -> agent creates bridge within scope
missing authority / changed claim -> stop and escalate
```

## 1. Classify The Input

Treat user input as one of:

- `governance-convergence`: initialize, migrate, or periodically clean planning
  and docs governance so material lands in the right layer.
- `signal-placement`: decide which layer or method should hold a weak signal,
  open candidate, source note, Goal Pack, report, or implementation artifact.
- `proposal`: shaped candidate with tradeoffs or open questions when the repo
  is not routing that candidate through `$goal-diffusion`.
- `authority change`: SSoT, standard, ADR, protocol, or governance update.
- `goal`: durable objective with evidence contract.
- `goal-wave`: one launch intent that should execute several related ready
  goals without human relaunch after each short goal.
- `implementation`: chosen slice with files, tests, and claim boundary.
- `audit`: compare current repo against declared rules.
- `cleanup`: delete, migrate, or retire old artifacts.

Do not turn every idea into a goal. Do not turn every goal into a task list.
Do not split initialization and cleanup into separate doctrines: they are the
same convergence loop with different amounts of existing material.

## 1.5 Governance Convergence

Use governance convergence when a repo is new, lightly documented, previously
documented under another scheme, or already mature but due for cleanup.

The convergence loop is:

```text
inspect current material
  -> classify docs-layer state
  -> keep / create only thin routing structure
  -> promote authority
  -> demote candidates
  -> bridge gaps
  -> archive converted source
  -> delete obsolete material
  -> update nearest indexes
  -> run audit
```

New repositories are not a special workflow. They usually have fewer artifacts
to classify, so convergence mostly creates thin layer README files and a small
project-local `AGENTS.md` / docs router. Existing repositories follow the same
loop but first assign docs-layer retention verdicts to current docs. For Goal
Diffusion artifacts, use `$goal-diffusion` for method lifecycle and this skill
for layer placement, indexing, retained evidence risk, and conflict behavior.

When baseline docs are missing, create only the minimum host-appropriate
structure needed for future agents to route work:

```text
AGENTS.md or host equivalent
docs/README.md
docs/product/README.md, when the repo has a product or operator surface
docs/ssot/README.md
docs/standards/README.md
docs/adr/README.md and docs/adr/_template.md
```

Add optional layers such as `docs/goal-diffusion/**`, `docs/roadmap/**`,
`docs/protocols/**`, `docs/design/**`, or root `specs/**` only when the project
actually needs that artifact type or is explicitly adopting that workflow.

## 2. Read Before Writing

Default read path:

```text
AGENTS.md
docs/README.md
docs/ssot/README.md
docs/standards/README.md
```

Then read the relevant layer README and the artifact being changed. If the repo
does not have these files, run governance convergence: use the host's documented
equivalent if it exists, otherwise create the thinnest docs model needed to
route future work.

Before writing or rewriting durable docs, also extract the host narrative
language rule from `AGENTS.md` / docs policy. Apply it to body prose in
planning, roadmap, governance, report, proposal, goal and spec artifacts. Keep
frontmatter keys, schema fields, commands, paths, code symbols, prompt blocks
and reusable template labels stable when English improves copyability or
machine matching.

Wrong pattern:

```text
Host requires Chinese planning prose -> agent copies an English goal-plan
template verbatim into docs/goal-diffusion/**.
```

Correct pattern:

```text
Host requires Chinese planning prose -> frontmatter and command blocks stay
stable; narrative sections explain objective, scope, constraints, stop rules
and evidence in Chinese.
```

## 3. Place The Artifact

Ask:

- Is this current truth?
- Is it an executable rule?
- Is it an adopted decision record?
- Is it sequence/status?
- Is it an open candidate?
- Is it a wire contract?
- Is it an implementation task system artifact?
- Is it evidence?

Place by answer, not by convenience.

## 3.5 Planning Convergence Protocol

Use this protocol when planning arrives across time, people, agents, branches,
or worktrees and begins to conflict, duplicate, drift, or leave placement gaps.

The goal is to route planning material to the right docs layer or method without
pretending every idea is implementation-ready.

### Method Handoff

Do not reimplement Goal Diffusion artifact lifecycle here. When a project uses
`$goal-diffusion`, that skill owns:

```text
inbox/source/Goal Pack routing
promotion gate
retention and demotion marker
Goal Relations
receipt-backed completion
final audit
ready / running / blocked / done progress state
```

This governance skill owns:

```text
docs-layer placement
authority-layer conflict
host language policy
index coverage
retained evidence risk
project-local governance simplification
```

When a weak signal or candidate arrives:

```text
uses Goal Diffusion -> route to $goal-diffusion inbox/source/Goal Pack rules
does not use Goal Diffusion -> route to docs/proposals, docs/research, or nearest implementation artifact
already authority -> promote to SSoT / standard / ADR / protocol / roadmap
already implemented/evidenced -> retain as report/source/backlink or delete duplicate text
```

### Decision Queue

When planning inputs conflict or need a human / higher-authority decision, do
not bury the decision inside prose. Record a decision item in the closest open
proposal, planning index, host project decision queue, or Goal Diffusion artifact
selected by `$goal-diffusion`.

Use this shape:

```text
id:
source_artifacts:
conflict:
options:
decision_level: product | ssot | standard | adr | roadmap | goal | implementation
owner:
needed_by:
status: open | decided | obsolete
resolution_target:
```

After decision:

```text
decided
  -> promote to SSoT / standard / ADR / roadmap / Goal Pack when it is authority
  -> backlink from the source material
  -> convert stale candidate material to source or delete it
```

### Convergence Sweep

Periodically run a convergence sweep over candidate docs, Goal Diffusion
indexes, roadmaps, reports, sources, specs, and authority docs. This is a
docs-layer cleanup pass, not a replacement for `$goal-diffusion` lifecycle:

```text
promote    rule / truth / decision becomes authority
demote     useful context is not authority
split      one artifact contains multiple docs-layer concerns
merge      duplicates describe the same candidate or source
bridge     docs route or authority relation needs a thin bridge
archive    converted material becomes source
delete     obsolete material has no evidence or routing value
block      human / higher-authority decision is required
```

Sweep output:

```text
promoted:
demoted:
split:
merged:
bridges_needed:
archived_as_source:
deleted:
decision_queue:
open_questions:
```

### Queue Boundaries

Keep queues distinct:

- Goal Diffusion inbox, relations, launch prompts, and completion state: governed
  by `$goal-diffusion` and related Goal Diffusion phase / prompt skills.
- Proposal pool: shaped candidates only when the repo is not using
  `$goal-diffusion` for that candidate stream.
- Decision queue: conflicts, missing authority, and human decisions.
- Roadmap: sequence, gates, coverage, status, and evidence links.
- Reports: evidence only.

In a Goal Diffusion project, roadmap status is a route/index/evidence signal.
Do not use it as a second source of Goal Pack progress truth.

Do not use a roadmap, proposal directory, Goal Diffusion inbox, or
method-specific queue as a generic planning backlog.

## 4. Gate Implementation

Implementation may start only when the agent can name:

```text
objective
non_goals
authority_refs
chosen_slice
harness_pack
claim_boundary
verification_commands
stop_rules
```

If these are missing, route to planning or gap discovery. If the target is far
from current reality, produce a gap map, bridge ladder, prerequisite goal, or
first harnessed path instead of fabricating a task list.

## 5. Implement With Rolling Freedom

Implementation plans are not perfect. The executor may adapt exact steps when
new evidence appears, but may not:

- lower the evidence standard;
- change the objective;
- expand the write scope silently;
- claim completion without the named checks;
- bury new authority changes inside code only.

Small discovered gaps can be patched into the implementation artifact. Larger
gaps should be promoted back into a brief, proposal, standard, ADR, SSoT change,
or method inbox item when they are not yet evaluable but worth preserving for a
future planning loop.

## 6. Report Evidence

A useful report includes:

```text
claim:
evidence:
commands_or_checks:
changed_artifacts:
remaining_gaps:
next_decision:
```

Reports are optional unless needed for cross-session navigation, auditability,
handoff, or user request. When written, they must be evidence-bearing and
bounded; they are not diaries.

## Skill Handoffs

Use this governance skill for:

- docs layer design;
- artifact placement;
- repo-level SOP;
- cleanup and migration of old docs structures;
- deciding how project-local skills should be replaced or simplified.

Use `goal-diffusion` for:

- distant ideas;
- goal contracts;
- first harnessed paths;
- detailed plans for chosen slices;
- rolling verified implementation.

Use implementation-plan or spec-kit skills for:

- exact file-level tasks;
- test commands;
- local checklists;
- handoff-ready implementation sequencing.

The handoff boundary is artifact-based. Do not rely on conversation memory as
the only carrier of scope.
