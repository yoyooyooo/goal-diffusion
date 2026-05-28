# Docs Layer Model

This reference defines project-agnostic top-level `docs/*` layers for long-term
AI coding. A project may omit layers it does not need. If a layer exists, keep
its boundary strict.

## Root Rule

```text
docs/<layer> = document type
docs/<layer>/<domain> = project-specific organization
docs/<layer>/<domain>/<details> = free-form as needed
```

Do not create top-level folders for personal workflow habits, temporary phases,
or one product's current roadmap slice. Use durable document types instead.

## Layer Naming Standard

Use one canonical name for each top-level layer. Do not keep singular / plural
pairs or synonym folders for the same document type.

- Use singular or uncountable names for abstract authority domains:
  `product`, `architecture`, `roadmap`, `research`, `design`, `runbook`,
  `security`, and `data`.
- Use plural names for collections of discrete artifacts:
  `standards`, `proposals`, `reports`, `features`, `protocols`, `evals`, and
  `releases`.
- Keep established abbreviations singular by convention: `ssot`, `adr`, and
  `api`.
- Keep method names as named: `goal-proof`.

Standard vocabulary:

```text
Core: docs/product, docs/ssot, docs/standards, docs/adr,
      docs/architecture, docs/roadmap
Idea flow: docs/goal-proof, docs/proposals, docs/research, docs/reports
Product/interface: docs/features, docs/design, docs/interface-capabilities,
                   docs/product-harness
Contracts/ops: docs/protocols, docs/api, docs/runbook, docs/security,
               docs/data, docs/evals, docs/releases
```

## Top-level Layer Admission Test

Create a new direct child under `docs/` only when all are true:

- the name describes a durable document layer, not a project phase, feature,
  owner, team, tool, temporary inbox, or personal habit;
- the layer has a different highest authority than existing layers;
- a future agent can decide placement from the name without knowing this
  project's current roadmap;
- the layer can write a README with `owns`, `must not own`, conflict behavior,
  and promotion / demotion path;
- keeping the content inside an existing layer would create ambiguity or bury
  important authority.

Do not create a top-level layer only because one project currently has many
files of that kind. If the difference is domain-specific rather than
document-type-specific, put it below an existing layer.

Admission into a layer is not permanent retention. Existing documents still need
the lifecycle cleanup gate when they become stale, duplicated, converted, or
misleading.

## Discouraged Top-level Names

Avoid durable top-level folders such as:

```text
docs/next
docs/tmp
docs/wip
docs/handoff
docs/phase-1
docs/mvp
docs/my-plan
docs/agent-notes
docs/old
docs/archive
```

If the project truly needs history or retained evidence, use a clear document
type such as `docs/reports/**`, root `specs/**/handoff.md`, ADR backlinks, or a
method-specific source/evidence layer.

## Required Or Near-required Layers

| Layer | Owns | Must not own |
|---|---|---|
| `docs/README.md` | Global docs router, layer map, shortest reading paths, conflict order | Domain truth or implementation work_items |
| `docs/product/**` | Product positioning, product philosophy, target users, user value, non-goals, capability meaning | Engineering rules, implementation work_items, current object authority |
| `docs/ssot/**` | Current truths, invariants, domain authority, ownership boundaries | Roadmap sequencing, historical discussion, work item lists |
| `docs/standards/**` | Executable rules, commands, quality gates, naming, review gates, SOPs | Product vision or unaccepted proposals |
| `docs/adr/**` | Adopted decisions, rejected alternatives, reasons and consequences | Current work item status or full standards |
| `docs/architecture/**` | System maps, module relationships, runtime views, dependency direction | Overriding SSoT or hidden implementation work_items |
| `docs/roadmap/**` | Sequencing, milestones, gates, coverage matrices, status and evidence links | Step-by-step implementation checklists |

When a project uses Goal Proof System, roadmap status should remain a route,
coverage, or evidence index. Goal Pack ready / running / done state, active
work item, evidence records, relations, and completion review stay owned by Goal Proof System
artifacts and CLI output even when roadmap documents link to them.

`docs/product/**` may be thin, but it should exist for long-term AI coding.
Libraries, CLIs, infrastructure repositories, and internal tools still have a
product surface: who it serves, what kind of experience or operating philosophy
it optimizes for, and which non-goals should keep agents from drifting.

## Planning And Idea Flow Layers

| Layer | Owns | Must not own |
|---|---|---|
| `docs/goal-proof/**` | Goal Proof System method artifacts when the project uses that method: inbox, sources, Goal Packs, evidence records, notes, and `plans/<work_id>.md` work plans when required | Project-wide docs governance, product authority, roadmap truth, or method rules that belong in `$goal-proof` |
| `docs/proposals/**` | Unaccepted proposals, pressure tests, comparisons, candidate concepts | Current authority, completion claims, implementation permission |
| `docs/research/**` | External research, experiments, investigation notes, evidence gathering | Project decisions unless promoted |
| `docs/reports/**` | Durable audit/review/execution evidence summaries when not owned by another method | Diary logs or future plans without evidence |

`docs/proposals/**` is optional. If a project uses `$goal-proof` as its
default planning flow, route weak signals and open candidates through the
method's inbox / source / Goal Pack rules instead of mirroring the same
candidate in `docs/proposals/**`. Keep `docs/proposals/**` only when the repo
explicitly needs a non-Goal-Proof candidate layer.

Projects do not need both `docs/reports/**` and a method-specific reports path.
Choose one documented home or map the relationship in `docs/README.md`.

## Optional Product And Interface Layers

| Layer | Owns | Must not own |
|---|---|---|
| `docs/features/**` | Requirements, user stories, capability tracking, acceptance scope | Current architecture authority or work item execution status |
| `docs/design/**` | UX, UI, visual system, interaction model, asset index | Product facts, engineering gates, or roadmap status |
| `docs/interface-capabilities/**` | Project-level InterfaceCapability and InterfaceSurface contracts: user work item, entrypoint, interaction contract, state/data ownership, coverage intent | Harness scenarios, fixtures, routes, test steps, evidence results, product facts, or Goal Pack runtime state |
| `docs/product-harness/**` | Project-level HarnessScenario, HarnessFixture refs, HarnessRoute/Component refs, HarnessEvidence refs, claim limits, non-claims, coverage matrix, lifecycle | InterfaceCapability semantics, product truth, final design, executable tests, raw evidence records, or Goal Pack runtime state |

`docs/features/**` and `docs/design/**` are useful for product-heavy projects.
Library, infrastructure, or research projects may omit them.

`docs/interface-capabilities/**` and `docs/product-harness/**` are optional
trace layers for projects that need durable agent-readable UI capability and
proof contracts. Goal Pack companion artifacts may start as candidate working
drafts, but completion review should give a retention verdict: `promote`,
`keep-in-goal`, `split`, `retire`, or `block`.

In this model, `docs/design/**` means interface design: UX, UI, interaction
model, information architecture, visual system, and design assets. It does not
mean product strategy, capability meaning, system design, runtime structure, or
module architecture. Put product strategy and user value in `docs/product/**`;
put system structure in `docs/architecture/**`; put current object authority and
fact boundaries in `docs/ssot/**`.

## Optional Technical Contract Layers

| Layer | Owns | Must not own |
|---|---|---|
| `docs/protocols/**` | Wire profiles, schemas, media types, canonical examples, conformance inputs | Domain Core authority, implementation specs, roadmap sequence |
| `docs/api/**` | Human-facing API docs, endpoint usage, public developer docs | Internal source of truth if generated elsewhere |
| `docs/runbook/**` | Operational procedures, incident response, deployment / rollback playbooks | Architecture decisions or product roadmap |
| `docs/security/**` | Threat model, security policy, permission model, security review evidence | General standards unless security-specific |
| `docs/data/**` | Dataset contracts, lineage, semantic metrics, retention, warehouse / analytics definitions | General database implementation work_items or migrations |
| `docs/evals/**` | Product/model/agent evaluation suites, rubric definitions, benchmark reports | Unit test implementation details or unverifiable opinions |
| `docs/releases/**` | Release notes, changelog policy, rollout evidence, compatibility notices | Roadmap planning or active implementation work items |

Use `docs/protocols/**` only when there is a cross-boundary contract with a
stable exchange format and validation surface. A design proposal with no wire
contract belongs in `docs/proposals/**`.

Specialized layers such as `data`, `evals`, or `releases` are optional. Add
them only when they carry recurring authority that would otherwise overload
`standards`, `reports`, or root implementation specs.

## Root Implementation Artifacts

Root `specs/**` is not `docs/specs/**`.

Use root implementation artifacts for:

- executable implementation specs;
- work item breakdowns;
- trace items;
- checklists;
- local evidence;
- implementation handoffs.

Avoid `docs/specs/**` as a top-level layer because it usually blurs product
specs, protocol specs, and implementation specs. Prefer sharper names:

- `docs/protocols/**` for wire contracts;
- `docs/product/**` / `docs/features/**` for requirements;
- root `specs/**` for executable implementation specs.

## Conflict Order

A good default conflict order is:

```text
docs/ssot/**
  -> docs/standards/**
  -> code + tests + generated evidence
  -> docs/adr/**
  -> docs/protocols/** when the question is wire compatibility
  -> docs/interface-capabilities/** / docs/product-harness/**
  -> docs/roadmap/**
  -> docs/goal-proof/** / docs/proposals/**
  -> research / external notes
```

Projects may adjust the order, but `docs/README.md` must say so.

Method-internal lifecycle facts keep their owning method authority. For example,
Goal Proof System progress facts are not promoted into roadmap authority merely
because a roadmap summarizes or links them.

## Layer README Contract

Every durable docs layer should have a `README.md`. At minimum it must name:

- `Owns`;
- `Must Not Own`;
- current entry points or `Read Next`.

Authority-heavy layers should also name:

- `Boundary` or conflict behavior;
- promotion / demotion path;
- source / evidence retention policy when relevant.

If a top-level folder lacks a README and contains durable planning content, add
one before adding more files.

This contract keeps `docs/README.md` as the router and each layer README as the
local authority. Do not rely on the global layer table alone when placing a
durable artifact.

## Host Language Policy

Document-layer governance includes narrative language policy. Before creating or
rewriting durable docs, read `AGENTS.md`, `docs/README.md`, the layer README,
and the nearest artifact policy for language requirements.

If the host repo says planning prose in a path should use a specific language,
write new or substantially rewritten narrative body text in that language.
Preserve English or canonical spellings for machine-facing material when needed:

```text
YAML frontmatter
artifact_type / status / lifecycle values
field names
commands and paths
schema examples
protocol names
code symbols
prompt blocks
portable templates
external quoted source
```

Do not treat an English reusable template as permission to write host artifacts
in English when the host explicitly requires another narrative language. The
template may keep its field labels; the artifact prose should follow the host.
