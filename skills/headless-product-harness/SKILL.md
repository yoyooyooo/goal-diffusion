---
name: headless-product-harness
description: >-
  Designs and audits headless-product-first harnesses: xtask/just/pnpm command
  surfaces, smoke evidence gates, fixture/replay ladders, boundary checks, and
  claim boundaries. Use when a repo needs to prove product capability before
  server/web UI, or when the user mentions headless first, agent-first commands,
  xtask, smoke, harness, evidence envelope, fixture replay, or boundary checks.
---

# Headless Product Harness

Use this skill to turn product intent into a runnable, machine-readable proof
path before server or web UI becomes the completion gate.

## Quick Start

1. Identify the product authority: product core, contract/schema, harness,
   transport/API, UI, storage, and external runtime.
2. Classify the proof: `boundary`, `offline-fixture`, `replay`, `adapter`,
   `projection`, `db-backed`, or `real-runtime-opt-in`.
3. State the claim ceiling for that proof level before implementation.
4. Design the smallest stable command that proves one capability.
5. Define evidence output, positive tokens, negative claims, and non-claims.
6. Place tests near the authority; keep the harness as orchestration.
7. Report only what the command proves and what it explicitly does not prove.

## Authority Rule

`xtask`, `just`, `pnpm xtask`, or any equivalent harness may orchestrate a proof.
It must not become the business fact source.

Use this ownership split:

```text
product core -> business rules and facts
contract/schema -> DTOs, schemas, wire-safe records
harness -> repo commands, fixtures, smoke orchestration, evidence output
server/API -> transport adapter into product core
web/UI -> consumption, previews, operator workflow
external runtime -> opt-in integration, not default proof
```

## Workflow

1. Name the capability in durable terms. Avoid phase, MVP, sprint, or current
   roadmap labels in command names.
2. Pick one harness level:
   - `boundary`: import/dependency/authority drift.
   - `offline-fixture`: deterministic local input to product core.
   - `replay`: normalized or sanitized real trace replay.
   - `adapter`: external/source mapping into canonical records.
   - `projection`: product facts into view/query facts.
   - `db-backed`: persistence and restart/rebuild proof.
   - `real-runtime-opt-in`: real external process/API, excluded from default CI.
3. State the maximum claim that this level can prove. A lower level may support
   later work, but it must not be reported as proof of a higher-level surface.
4. Write the command contract. See
   [command-surface.md](references/command-surface.md).
5. Write the evidence contract. See
   [evidence-envelope.md](references/evidence-envelope.md).
6. Add or update the boundary check when structure can drift. See
   [boundary-check.md](references/boundary-check.md).
7. Add fixture/replay material only when deterministic reproduction needs it.
   See [fixture-replay-ladder.md](references/fixture-replay-ladder.md).

## Harness Gap Policy

Missing harness detail is implementation scope when product authority, allowed
write scope, claim boundary, forbidden claims, and falsifiable evidence intent
are clear. Create the minimum command, fixture, replay, boundary check, or
evidence envelope needed to prove or falsify the current capability.

Stop only when no honest falsifiable path exists, or when continuing would
require changing product truth, claim boundary, public API/schema/protocol
posture, security policy, private-data handling, or destructive behavior.

## Command Design Rules

- Command names prove capabilities, not progress labels.
- One command proves one capability slice.
- Default output is JSON or JSONL. Text output must be explicit.
- Failures return non-zero and still emit structured error output.
- Include negative claims such as `browser_ui_claim=false` or
  `real_runtime_claim=false` when those paths are not proven.
- Do not emit a negative claim token for a boundary the command did not check;
  report that boundary as `not_proven` instead.
- Do not hardcode progress tokens without executing the underlying check.
- Prefer stable names with compatibility aliases only when old names already
  exist.

## Report Shape

Use this closeout when designing or reviewing a harness:

```text
authority_map:
capability:
command:
evidence_contract:
claim_ceiling:
negative_claims:
tests_near_authority:
fixtures_or_replay:
boundary_rules:
not_proven:
docs_to_update:
```

## Placement With Governance

If the task is about where harness docs live, lifecycle, retained evidence,
or docs layer authority, hand off to `docs-governance`. This skill owns the
concrete command/evidence design.
