---
name: product-harness-system
description: >-
  Defines the shared Product Harness System for high-capability coding agents:
  harness artifact types, claim limits, lifecycle, placement, coverage
  matrix, and trace links across headless product proof and UI harness proof.
  Use when designing a project-wide verification architecture, deciding where
  harness components/routes/fixtures/scenarios/evidence belong, aligning
  headless and UI harnesses, or planning reusable agent-driven proof surfaces.
---

# Product Harness System

Use this skill to design the shared harness layer that lets agents prove product
capabilities without confusing proof surfaces with product authority.

This skill owns cross-cutting harness doctrine. It does not own concrete
headless commands or concrete frontend tests.

## Collaboration Contract

```text
Owns: shared harness artifact vocabulary, trace spine, lifecycle, claim limit,
coverage matrix, gaps, and placement rules.
Does not own: product truth, concrete CLI/xtask/smoke code, concrete React /
router / Playwright code, Goal Pack evidence records, or docs-layer authority.
Inputs: capability refs, desired claim, proof surfaces, fixture/seed needs,
headless/UI proof refs, and evidence refs.
Outputs: Harness Scenario, Harness Fixture/Seed, Harness Surface, coverage
matrix, claim limit, non-claims, gaps, and placement guidance.
Handoff: unnamed user-facing capability -> interface capability
workflow; command proof -> headless harness workflow; browser-visible proof ->
UI harness workflow; docs-layer decision -> governance workflow; multi-evidence record
execution -> goal flow.
Stop: continuing needs product truth, public API/schema/protocol,
security/private-data, destructive behavior, docs authority, or claim_limit
choice.
```

## Core Model

```text
Product Capability
  -> InterfaceCapability when user-facing behavior is involved
  -> Harness Scenario
  -> Harness Fixture / Seed
  -> Headless Product Harness and/or UI Harness Surface
  -> Harness Evidence
  -> Coverage / Gap / Promotion decision
```

Official terminology is `Harness`. Use `Harness Coverage Matrix` when describing
grid-like coverage; do not introduce metaphorical names as formal terms.

## Quick Start

1. Identify the capability and the strongest claim the user wants.
2. Split product facts from interface consumption:
   - product facts -> `headless-product-harness`;
   - frontend state/render/browser proof -> `ui-product-harness`.
3. Define shared artifacts: scenario, fixture/seed, surface, evidence, and trace
   links.
4. Pick lifecycle state: `candidate`, `accepted`, `regression`, or `retired`.
5. Write claim limits and non-claims before implementation.
6. Place durable trace in project docs or a Goal Pack companion only when
   traceability matters.

Read:

- [Artifact Model](references/artifact-model.md)
- [Lifecycle And Placement](references/lifecycle-and-placement.md)
- [Claim Limits](references/claim-ceilings.md)
- [Trace Contract](references/trace-contract.md)

## Ownership

This skill owns:

- shared harness artifact vocabulary;
- cross-layer trace from capability to proof and evidence;
- lifecycle states and promotion/retirement policy;
- claim limits and non-claim discipline;
- placement rules for harness docs, runtime support code, and evidence.

This skill does not own:

- product truth, domain facts, API schemas, or database state;
- concrete CLI/xtask/smoke command design;
- React, router, Playwright, or `agent-browser` implementation details;
- Goal Pack state, evidence records, or completion review lifecycle.

## Routing

- Use `interface-capability-planning` before this skill when the user-facing
  capability contract is not yet named.
- Use `headless-product-harness` for command surfaces, fixture/replay ladders,
  boundary checks, storage/runtime proof, and product-fact evidence.
- Use `ui-product-harness` for interface-headless tests, Harness Components,
  Harness Routes, browser-visible proof, and frontend adapter discovery.
- Use `docs-governance` for docs-layer authority and retained-evidence
  placement.

## Stop / Ask

Ask only when continuing would change product truth, public protocol/API/schema
posture, security/private-data rules, destructive behavior, or the desired
claim_limit. Missing harness detail is implementation scope.
