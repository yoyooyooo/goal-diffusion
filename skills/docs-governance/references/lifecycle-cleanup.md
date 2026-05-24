# Lifecycle And Cleanup

Use this reference when a project has missing, old, duplicated, converted, or
stale governance material. This covers new repositories, lightweight existing
docs, migrated planning folders, mature repos due for periodic cleanup, and
project-local governance skills that should be replaced.

Do not treat new-project initialization as a separate doctrine. A new
repository is just convergence with little prior material: create the thinnest
routing structure that the host needs, then let project docs own project facts.

Human escalation is a last resort. Missing index or routing structure is not
automatically `blocked` when the agent can create the minimum artifact within
existing authority and claim boundary. For Goal Diffusion bridge, inbox,
promotion, retention, or completion questions, hand off to `$goal-diffusion`;
this reference handles only docs-layer placement, cleanup, evidence retention,
and authority conflicts.

## Lifecycle States

| State | Meaning | Default action |
|---|---|---|
| `missing-baseline` | A needed routing or authority index does not exist yet | Create the thinnest host-appropriate README / template |
| `active-authority` | Current truth or executable rule | Keep in SSoT / standards / protocol / ADR |
| `active-route` | Current sequence, gate, coverage, or status route | Keep in roadmap or goal index |
| `candidate-material` | Still under evaluation | Keep in the project's candidate layer, such as Goal Diffusion inbox or `docs/proposals/**` |
| `decision-needed` | Conflict, authority question, or missing bridge that truly requires human / higher-authority choice | Record in decision queue or closest proposal |
| `bridge-needed` | Two docs-layer states need a routing or authority bridge | Create the thinnest routing bridge or hand off to `$goal-diffusion` when it is a first-harnessed-path question |
| `converted-source` | Already consumed by authority, Goal Pack, roadmap, report, or spec but useful for traceability | Move to the method/source layer or backlink from target artifact |
| `evidence-record` | Past verified result or audit summary | Keep in reports, spec evidence, or linked handoff |
| `obsolete` | Superseded and no longer useful | Delete after reference check |

## Retention Gate

Use this gate when auditing old docs, inherited planning trees, stale roadmap
entries, report piles, source digests, or migrated folders. The point is not to
save every artifact. The point is to keep the smallest durable record that lets
a future agent preserve current authority, evidence, and traceability.

A document may stay in `docs/**` only when it satisfies at least one condition:

- it is current authority, executable standard, ADR, protocol contract, product
  positioning, or architecture map;
- it is an active route, gate, coverage matrix, status index, or method
  artifact still used to decide future work;
- it is durable evidence for a current claim, report, release, security review,
  or implementation handoff;
- it is retained source material linked from a promoted goal, brief, ADR,
  standard, roadmap, or report;
- it is an index needed to help agents choose the right document layer.

If none apply, remove it from `docs/**` by deletion, demotion, or migration.

If a needed routing document is missing, add it only when it will help future
agents place material. A missing layer is not automatically a defect; unused
layers should stay absent.

## Retention Verdicts

Assign one explicit verdict before moving or deleting old material.

| Verdict | Use when | Action |
|---|---|---|
| `create-thin` | A missing docs router, layer README, ADR template, or host-equivalent index is needed for future routing | Create only the minimal file, with owns / must-not-own / conflict behavior |
| `keep` | The document is current authority, active routing, or required evidence | Keep and ensure the nearest index explains why |
| `promote` | The document contains a rule or truth that should become authority | Move or rewrite into SSoT, standards, ADR, protocol, product, or roadmap |
| `demote` | The document is useful context but not authority | Move to the appropriate candidate/source/report layer, method artifact, or root implementation artifact |
| `migrate` | The document is valid but lives in the wrong layer | Move by semantic role and update inbound links |
| `split` | One document contains multiple candidates, decisions, or goal tracks | Split by docs-layer role; use `$goal-diffusion` for Goal Pack / inbox / source internals |
| `merge` | Multiple artifacts duplicate the same candidate or decision | Merge into one live artifact and retire the rest |
| `bridge` | A docs route or authority relation lacks an explicit bridge | Create a thin routing bridge; use `$goal-diffusion` for first-harnessed-path bridge work |
| `block` | Human or higher-authority decision is required; no honest falsifiable path exists within current authority | Add a decision item; do not promote or implement yet |
| `archive-as-source` | The document is no longer active but explains where accepted work came from | Move to a source/evidence layer and backlink from the promoted artifact |
| `delete` | The document is obsolete, misleading, duplicate, or no longer referenced | Delete after reference and evidence checks |

Default bias: delete or demote stale planning prose unless it carries current
authority, active routing value, or evidence that is linked from a live artifact.

## Staleness Triggers

Treat a document as stale until proven otherwise when it:

- describes a previous folder scheme, workflow, or local skill that has been
  replaced;
- repeats a rule now owned by SSoT, standards, ADR, or protocol docs;
- claims completion without evidence links;
- keeps candidate material open after it has already become current authority,
  a Goal Pack, a report, source, or implementation artifact;
- keeps roadmap, plan, or candidate prose open after the work has been converted
  into a Goal Pack, implementation artifact, accepted evidence, source, report,
  or successor route;
- keeps an implementation plan as active guidance after execution evidence has
  moved into the owning receipt, spec, roadmap, or report;
- keeps an index, source map, or coverage matrix that only repeats another
  current route;
- repeats Goal Diffusion method-internal rules already owned by
  `$goal-diffusion`;
- keeps decision conflicts in prose instead of a decision queue;
- uses a method-specific work queue as a generic backlog;
- records a meeting-style narrative, temporary idea, or agent diary with no
  durable decision;
- uses phase or MVP wording as if it were current implementation authority;
- cannot answer why a future agent must read it;
- makes future agents choose between old and new homes for the same artifact
  type.

## Migration Rules

1. Check inbound references before moving or deleting.
2. Preserve evidence links before deleting old planning text.
3. Move by docs-layer role, not by filename. Inside Goal Diffusion flows, use
   `$goal-diffusion` artifact routing for the method-internal role.
4. Update the closest README / index in the same change.
5. Do not leave two current homes for the same artifact type.
6. Preserve or repair the host narrative language policy while migrating. When
   touching a planning artifact in a path where `AGENTS.md` requires a specific
   prose language, convert newly written or substantially rewritten narrative
   text to that language while keeping machine fields, commands, schemas, code
   symbols and templates stable.

## Deletion Rules

Delete when all are true:

- the content is superseded;
- no current artifact depends on it as evidence;
- any useful source context has been linked elsewhere;
- keeping it would make an agent choose the wrong path.

Do not delete when:

- it is evidence for a claim still referenced by roadmap, ADR, SSoT, or report;
- legal, release, audit, or security retention applies;
- the replacement path is not yet indexed.

## Replacing Project-local Governance Skills

When a generic governance skill is introduced, a project-local architecture skill
can be deleted only after:

- generic governance owns docs layer and human-agent SOP;
- project-specific authority has moved into `docs/ssot/**`,
  `docs/standards/**`, or ADR;
- code/module conventions live in standards or language-specific skills;
- no AGENTS.md or runtime config still points to the old skill as required;
- at least one audit run confirms equivalent coverage.

Until then, treat the project-local skill as a temporary adapter, not a source of
new generic doctrine.

## Cleanup Output

Use this structure:

```text
kept:
moved:
converted_to_source:
deleted:
indexes_updated:
temporary_bridges:
verification:
```
