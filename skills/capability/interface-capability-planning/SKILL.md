---
name: interface-capability-planning
description: >-
  Plans interface capabilities for high-capability coding agents: user work_items,
  IA/surfaces, interaction contracts, frontend state/data ownership, testability
  contracts, and handoff to UI and headless harnesses. Use when planning UI/UX,
  app shell, navigation, route/page structure, interaction states, frontend
  handoff, headless-to-interface growth, or when a project needs an
  InterfaceCapability trace artifact before implementation.
---

# Interface Capability Planning

Plan user-facing capabilities as traceable interface contracts, not just pages
or visual mockups.

Core spine:

```text
Product Capability
  -> Interface Capability Contract
      -> IA / Surface / Region
      -> Interaction State Contract
      -> UI Product Harness
      -> Headless Proof
      -> Evidence / Coverage / Gap
```

## Collaboration Contract

```text
Owns: user work item -> InterfaceCapability mapping, surface/region trace,
interaction state contract, frontend state/data ownership, and testability needs.
Does not own: product truth, domain/API/database facts, concrete test code,
browser automation commands, harness evidence, Goal Pack evidence records, or final
visual system decisions.
Inputs: product intent, SSoT/architecture/standards, known headless proof,
existing UI/design docs, and user mental model constraints.
Outputs: InterfaceCapability contract, InterfaceSurface map, state/data owner
contract, harness needs, trace refs, and explicit gaps.
Handoff: shared coverage / claim_ceiling -> harness system workflow;
browser-visible or render proof -> UI harness workflow; product-fact proof ->
headless harness workflow; durable placement -> governance workflow; multi-step
execution -> goal flow.
Stop: continuing would invent product truth, user mental model,
security/permission posture, public API/schema/protocol, or claim_limit.
```

## Quick Start

1. Read the host language and docs policy first: `AGENTS.md`, `docs/README.md`,
   and existing interface/design docs when present.
2. Read product intent, SSoT, architecture, standards, Goal Pack evidence, and
   known headless proof artifacts before defining interface capability.
3. Choose mode:
   - `generic-interface-capability`: start from product intent and user work_items.
   - `headless-to-interface-capability`: map proven headless capabilities to
     user work_items, surfaces, interaction states, and harness needs.
   - `existing-interface-increment`: inventory current routes/components/state
     patterns, then produce capability gaps and incremental slices.
   - `interaction-island`: when IA is not settled, define the smallest local
     interface capability that can still be tested and traced.
4. Produce inline output unless a durable trace artifact is needed. Durable
   default: `docs/interface-capabilities/<surface>.yaml` or a Goal Pack
   optional companion `interface-capabilities.yaml`.

Read [Planning Workflow](references/planning-workflow.md) when producing a
plan, durable trace artifact, DSL example, or handoff contract.

## Ownership

This skill owns:

- user work item to interface capability mapping;
- IA / surface / route / page-region decomposition needed by the capability;
- interaction contracts: entrypoint, pending, success, failure, recovery;
- state/data ownership contracts using technology-neutral frontend language;
- testability planning and harness handoff;
- visual constraints only when they affect comprehension, reachability, or
  implementation.

This skill does not own:

- product truth, domain authority, API schemas, or database facts;
- concrete UI test code, Playwright scripts, or browser automation commands;
- headless proof command design;
- Goal Pack lifecycle, evidence records, or completion review;
- final brand, visual system, or asset production.

## Contract Rules

- Default to thin YAML only when durable traceability matters.
- Use `InterfaceCapability` and `InterfaceSurface` as the first object kinds.
  Reference harness IDs when proof is needed; do not define full harness
  evidence records here.
- Use technology-neutral frontend boundaries: local interaction state, remote
  data state, async command state, realtime state, URL state, derived view
  model, render wiring, and browser-visible proof.
- Treat frameworks as adapters. Map Zustand, Redux, signals, XState, TanStack
  Query, Apollo, SWR, RTK Query, or custom repositories to those boundaries.
- Do not encode low-level DOM steps or selectors in the capability contract.
- Do not report a capability as complete unless referenced harness evidence
  exists in the owning harness artifact or the remaining gap is explicitly
  marked.

## Stop / Ask

Ask one short question only when continuing would invent product truth, user
mental model, authority boundary, security posture, or a public protocol/API
decision. Missing UI detail is not enough to block: produce a provisional
`interaction-island` with `status: sketch` or `candidate` and clear gaps.
