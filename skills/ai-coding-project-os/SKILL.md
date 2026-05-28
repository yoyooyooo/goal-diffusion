---
name: ai-coding-project-os
description: >-
  Thin user-facing router for AI coding project work. Use as the default entry
  when the user asks to govern, plan, execute, audit, converge, or continue work
  in a software project and has not explicitly selected a more specific skill.
---

# AI Coding Project OS

This skill is the lightweight entrypoint for project-level AI coding work. It
chooses and orchestrates methods; it does not own their artifacts.

## Core Boundary

```text
ai-coding-project-os      routes user intent and coordinates methods
docs-governance           owns docs/* layer governance and cleanup
goal-diffusion            owns Goal Pack planning and execution artifacts
interface-capability-planning owns UI/IA interaction capability contracts
product-harness-system    owns shared harness artifact model and lifecycle
ui-product-harness        owns frontend/UI harness design and evidence
headless-product-harness  owns proof command and evidence-envelope design
```

Do not create OS-owned durable state. If something must be persisted, route it
to the owning method:

- target planning or durable continuation -> `$goal-diffusion`;
- docs layer, authority placement, cleanup, or audit -> `$docs-governance`;
- UI/IA, app shell, navigation, route/page structure, interaction states,
  frontend handoff, headless-to-interface growth, or InterfaceCapability trace
  artifacts -> `$interface-capability-planning`;
- project-wide harness architecture, Harness Scenario/Fixture/Surface/Evidence
  vocabulary, claim ceilings, coverage matrix, lifecycle, or placement rules ->
  `$product-harness-system`;
- frontend state/data/cache/mutation/realtime/router testing, UI dogfood,
  browser-visible proof, Playwright/agent-browser harnesses,
  interface-headless proof, or UI evidence envelopes -> `$ui-product-harness`;
- command surface, smoke proof, fixture/replay, or evidence envelope ->
  `$headless-product-harness`;
- small work that can be completed and verified in the current turn -> inline.

## Routing Rules

Respect explicit user selection first. If the user names a specific skill, use
that skill.

Otherwise route by intent:

- asks for a Goal Plan, target plan, durable planning state, saved context,
  cross-session continuation, or explicitly says Goal Diffusion / Goal Pack ->
  `$goal-diffusion`;
- asks for docs layer design, SSoT / standards / ADR / roadmap placement,
  obsolete docs cleanup, migration of planning folders, docs audit, or artifact
  placement -> `$docs-governance`;
- asks for UI/UX, IA, app shell, navigation, route/page structure, interaction
  capability, frontend handoff, headless-to-interface growth, or interface
  trace contracts -> `$interface-capability-planning`;
- asks for harness architecture, proof surface taxonomy, Harness Components /
  Routes / Fixtures / Scenarios / Evidence, coverage matrix, lifecycle,
  placement, claim ceilings, or alignment between headless and UI proof ->
  `$product-harness-system`;
- asks for frontend state/data/cache/mutation/realtime/router testing, UI
  product proof, browser-visible acceptance, agent-browser/Playwright dogfood,
  interface-headless tests, render wiring, or UI evidence envelopes ->
  `$ui-product-harness`;
- asks for xtask / just / pnpm command surfaces, smoke checks, headless proof,
  fixture replay, boundary checks, evidence envelope, or negative claims ->
  `$headless-product-harness`;
- asks for high-risk execution planning inside a Goal Pack -> route through
  `$goal-diffusion` to `write-implementation-plans`;
- asks for a small concrete change with one clear verification path -> stay
  inline and do the work.

When several routes apply, orchestrate them in the order needed by the user's
current intent. Do not stop at recommending another skill when the user asked
for end-to-end work and the next method can continue safely.

## Authority Signals

Search, semantic retrieval, provider summaries, generated explanations, and
other external signals are discovery aids. They may identify candidate files,
symbols, commands, questions, or routes; they do not become authority by
themselves.

Ground final claims in host instructions, local repository files, source
authority, code, tests, command output, or method-owned evidence. If a
conclusion still depends only on a provider summary or unverified signal, report
it as a candidate understanding or non-claim.

## Gap Routing

A gap is not automatically blocked. First classify the missing piece by owner:

- missing durable plan, continuation state, leftover gap, or receipt chain ->
  `$goal-diffusion`;
- missing docs placement, authority relation, cleanup verdict, or index ->
  `$docs-governance`;
- missing interface capability, IA surface, interaction contract, state/data
  ownership, or testability planning -> `$interface-capability-planning`;
- missing shared harness artifact model, trace spine, coverage matrix,
  lifecycle, placement, or claim ceiling -> `$product-harness-system`;
- missing frontend harness, interface-headless reducer/store/query proof,
  render wiring test, browser-visible proof, or UI evidence envelope ->
  `$ui-product-harness`;
- missing command wrapper, fixture, replay, boundary check, proof path, or
  evidence envelope -> `$headless-product-harness`;
- small local defect with one clear proof path -> inline.

Continue when an honest minimum path can be named inside current authority and
claim boundary. Stop only when the gap requires a human / higher-authority
decision, product-truth change, public API/schema/protocol posture change,
security or private-data decision, destructive action, or no honest falsifiable
path exists.

## One-Pass Operating Loop

```text
read host instructions
-> classify user intent
-> identify authority and verification boundary
-> route to inline work or an owning method
-> execute until the current intent naturally closes, blocks, or needs a user decision
-> report only proven claims and explicit non-claims
```

## Non-Ownership Rules

Do not own or rewrite:

- Goal Pack `charter.yaml`, `state.yaml`, `receipts.jsonl`, or
  `implementation-plan.md` lifecycle;
- InterfaceCapability trace artifact ownership that belongs to
  `$interface-capability-planning`;
- shared harness artifact/lifecycle ownership that belongs to
  `$product-harness-system`;
- UI harness command/evidence details that belong to `$ui-product-harness`;
- docs layer lifecycle rules that belong to `$docs-governance`;
- command/evidence schema details that belong to `$headless-product-harness`;
- product truth, public API/schema/protocol posture, security policy, or
  private/raw-data handling decisions.

## Stop Rules

Stop and ask only when continuing would require a new product, authority,
security, compliance, public API/schema/protocol, private-data, destructive, or
claim-boundary decision.

Missing local detail is not enough to stop. Route to the method that can create
the minimum honest bridge, harness, Goal Pack, docs cleanup, or inline fix.
