# Bootstrap

Use this only when a durable Goal Pack or reusable routing home is needed.
Do not initialize project docs for read-only discussion or a one-turn inline
work item.

## Discovery

Before creating files, inspect the host project for existing equivalents:

```text
AGENTS.md
CLAUDE.md
README*
docs/README.md
docs/ssot/
docs/standards/
docs/adr/
docs/architecture/
docs/roadmap/
docs/goal-proof/
```

If the project already has a documented home for goal operating state, map that
home to the Goal Pack roles. Do not create duplicate planning trees.

## When To Bootstrap

Bootstrap only when at least one is true:

- the work needs more than one verified evidence record;
- cross-session continuity is needed;
- several agents or disjoint write scopes need a shared state;
- a downstream workflow will consume the Goal Pack;
- the user explicitly asks to save or migrate the goal.

Stay inline when one evidence path in the current turn can prove completion.

## Thin Fallback

When no host convention exists, create only what is needed:

```text
docs/goal-proof/
  README.md
  inbox/
  sources/
  goals/
```

Create a concrete Goal Pack only when the goal exists:

```text
docs/goal-proof/goals/<goal-id>/
  goal.yaml
  progress.yaml
  evidence.jsonl
  plans/<work_id>.md  # only when needs_plan
  interface-capabilities.yaml  # optional UI/interface trace companion
  product-harness.yaml  # optional harness proof companion
  notes/
```

Create `plans/<work_id>.md` inside the Goal Pack only when a selected slice
is `needs_plan`.

## Minimal Index

```markdown
# Goal Proof System

This directory stores Goal Packs and related input/source material for the Goal
Diffusion operating loop.

## Homes

| Role | Path |
|---|---|
| inbox | `docs/goal-proof/inbox/` |
| sources | `docs/goal-proof/sources/` |
| goal packs | `docs/goal-proof/goals/<goal-id>/` |
| implementation plans | `docs/goal-proof/goals/<goal-id>/plans/<work_id>.md` |
| interface capability companions | `docs/goal-proof/goals/<goal-id>/interface-capabilities.yaml` |
| product harness companions | `docs/goal-proof/goals/<goal-id>/product-harness.yaml` |

## Active Goal Packs

## Inbox

## Sources
```

## Minimal Goal Pack

```text
goal.yaml                  objective, authority, completion, claim_limit, agent_authority
progress.yaml                    current proof step, active work item, blockers, next_action
evidence.jsonl                append-only work item and audit evidence records
plans/<work_id>.md        optional pre-reviewed plan for one needs_plan slice
interface-capabilities.yaml    optional UI/IA/interaction trace companion
product-harness.yaml           optional harness proof companion
notes/                        long material only
```

## Guardrails

- Goal Pack state is not project authority. It consumes SSoT, standards, ADR,
  architecture, roadmap, code, tests, and generated evidence.
- Inbox is not a backlog.
- Sources are traceability, not open candidates.
- Evidence Records are evidence, not diaries.
- Implementation plans are exceptional, not the default execution path.
- Method-general lifecycle, promotion, retention, and cleanup rules belong to
  this skill. Host projects should keep only local adapters such as authority
  layer names, language policy, command gates, and product-specific promotion
  targets.
- If authority is missing but an honest path exists inside the current
  claim_limit, create the thinnest bridge or harness and continue.
- If product truth, SSoT, standard, ADR, public protocol/API/schema, security,
  data handling, completion, or claim_limit must change, stop for a
  higher-authority decision.
