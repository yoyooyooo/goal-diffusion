---
name: ui-product-harness
description: >-
  Designs and audits UI-first product harnesses for high-capability coding
  agents: interface-headless tests, render wiring, browser-visible proof,
  frontend state/data/realtime/router adapter discovery, claim ceilings, and
  evidence envelopes. Use when validating UI/UX functionality, frontend
  state-management behavior, async data/cache/mutation flows, browser dogfood,
  Playwright/agent-browser coverage, or when an InterfaceCapability needs test
  harness planning.
---

# UI Product Harness

Prove that a user-facing interface capability is correctly consumed by frontend
state/data/interaction code and, when needed, visible to users in a browser.

Use `product-harness-system` for shared Harness Component / Route / Fixture /
Scenario / Evidence vocabulary, lifecycle, placement, trace, and claim ceilings.
This skill applies those rules to frontend and browser proof.

## Collaboration Contract

```text
Owns: interface-headless proof, render wiring proof, browser-visible proof,
frontend state/data/router/realtime adapter discovery, UI evidence envelope, and
UI gaps.
Does not own: product facts, final visual/IA decisions, shared harness lifecycle
policy, Goal Pack evidence records, docs placement, or headless command proof.
Inputs: InterfaceCapability, frontend owner map, harness scenario /
claim_ceiling, headless proof refs, test stack, and browser/runtime constraints.
Outputs: UI harness plan, Harness Component/Route guidance, browser-visible
path, evidence envelope, status recommendation, gaps, not_claimed, and
not_proven.
Handoff: missing capability contract -> interface capability workflow;
product-fact proof -> headless harness workflow; shared coverage / claim_ceiling
-> harness system workflow; durable placement -> governance workflow; multi-step
execution -> goal flow.
Stop: desired UI claim requires product truth, security/permission,
public API/schema/protocol, private-data handling, destructive behavior, or
final visual/IA decision.
```

## Core Rule

Separate proof layers: Headless Product proves business/product facts;
Interface Headless proves frontend state, cache, command, realtime, router, and
view-model behavior; Rendered / Browser UI proves users can see, reach,
operate, reload, and recover through the actual interface.

Do not report a stronger claim than the harness level proves.
Select proof levels by claim, not by checklist.

## Quick Start

1. Identify the `InterfaceCapability` or user interaction being tested.
2. Locate project-specific owners: local interaction state, remote data cache,
   async command / mutation, realtime stream, URL state, derived view model,
   render wiring, and browser-visible path.
3. Choose the smallest honest harness level required by the claim:
   - `interface_headless`
   - `render_wiring`
   - `browser_visible`
   - `production_near`
4. State `claim_ceiling` before writing or running tests.
5. Pair UI proof with headless proof when the claim depends on product facts.
6. Emit evidence with positive tokens, `not_claimed`, `not_proven`, and
   screenshots/logs where relevant.

References:

- [Frontend Boundary Model](references/frontend-boundary-model.md): state/data
  ownership and proof boundaries.
- [Harness Ladder](references/harness-ladder.md): level definitions, examples,
  and lifecycle rules.
- [Adapter Discovery](references/adapter-discovery.md): how to identify the
  current project's frontend stack and test tools.
- [Interface Trace DSL](references/interface-trace-dsl.md): durable
  `HarnessEvidence` convention.

## Level Summary

```text
interface_headless -> frontend state/cache/router/realtime/view-model proof
render_wiring      -> controls, roles, pending/error, intent wiring proof
browser_visible    -> reachability, user path, reload, console/network proof
production_near    -> product UI through local/staged backend with headless proof
```

## Claim Ceiling

Always name what the harness level proves and what it does not prove. Default
`not_claimed`: `business_fact_claim=false` unless paired with headless proof,
`frontend_cache_authority=false`, `realtime_event_authority=false`,
`optimistic_state_is_business_fact=false`, and
`final_visual_design_claim=false` unless explicitly reviewed.

## Evidence

Use the envelope in [Interface Trace DSL](references/interface-trace-dsl.md)
when a durable evidence add is needed. Include `interface_capability`, `scenario`,
`claim_ceiling`, `frontend_owners`, `headless_proof_refs`,
`positive_tokens`, `not_claimed`, `not_proven`, `status`, and
`gaps`.

## Rolling Handoff

During rolling Goal execution, this skill proves one UI level at a time and
hands status back to Goal Proof. A successful `interface_headless` proof may
make `render_wiring` eligible; a successful `render_wiring` proof may make
`browser_visible` eligible; `production_near` requires paired product/runtime
proof. Do not skip the evidence handoff between levels.

## Tool Guidance

Match the tool to the level: unit tests for interface headless, component tests
for render wiring, Playwright for stable browser regression, `agent-browser` for
exploratory dogfood and screenshots, and project CLI/smoke harnesses for paired
headless product proof. Prefer smaller deterministic tests before browser
tests; promote only stable browser checks to regression.

## Stop / Ask

Stop and ask only when the desired UI claim would require new product truth,
security/permission choices, public API/schema/protocol changes, private-data
handling, destructive behavior, or a final visual/IA decision.

If the interface is not settled, create a provisional `interface_headless` or
`browser_visible` exploratory harness with `status: candidate`, not a regression
claim.
