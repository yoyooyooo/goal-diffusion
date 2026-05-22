# Bootstrap

Use this only when a durable Goal Pack or reusable routing home is needed.
Do not initialize project docs for read-only discussion or a one-turn inline
task.

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
docs/goal-diffusion/
specs/
```

If the project already has a documented home for goal operating state, map that
home to the Goal Pack roles. Do not create duplicate planning trees.

## When To Bootstrap

Bootstrap only when at least one is true:

- the work needs more than one verified receipt;
- cross-session continuity is needed;
- several agents or disjoint write scopes need a shared state;
- a downstream workflow will consume the Goal Pack;
- the user explicitly asks to save or migrate the goal.

Stay inline when one evidence path in the current turn can prove completion.

## Thin Fallback

When no host convention exists, create only what is needed:

```text
docs/goal-diffusion/
  README.md
  inbox/
  sources/
  goals/
```

Create a concrete Goal Pack only when the goal exists:

```text
docs/goal-diffusion/goals/<goal-id>/
  contract.yaml
  state.yaml
  receipts.jsonl
  notes/
```

Create `specs/<goal-id>/implementation-spec.md` only when a selected slice is
`plan_required`.

## Minimal Index

```markdown
# Goal Diffusion

This directory stores Goal Packs and related input/source material for the Goal
Diffusion operating loop.

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

## Minimal Goal Pack

```text
contract.yaml   human-owned objective, authority, oracle, claim boundary
state.yaml      current edge, active task, blockers, next decision
receipts.jsonl  append-only task and audit receipts
notes/          long material only
```

## Guardrails

- Goal Pack state is not project authority. It consumes SSoT, standards, ADR,
  architecture, roadmap, code, tests, and generated evidence.
- Inbox is not a backlog.
- Sources are traceability, not open candidates.
- Receipts are evidence, not diaries.
- Implementation specs are exceptional, not the default execution path.
- If authority is missing but an honest path exists inside the current claim
  boundary, create the thinnest bridge or harness and continue.
- If product truth, SSoT, standard, ADR, public protocol/API/schema, security,
  data handling, or claim boundary must change, stop for a higher-authority
  decision.
