---
name: ai-coding-os
description: >-
  Thin user-facing router for AI coding workspace work. Use as the default entry
  when the user asks to govern, plan, execute, audit, converge, roll through, or
  continue work in a software workspace and has not explicitly selected a more
  specific skill.
---

# AI Coding OS Router

This skill is the lightweight entrypoint for AI Coding OS workspace
work. It chooses and orchestrates methods; it does not own their artifacts.

## Collaboration Contract

```text
Owns: user-intent routing, method orchestration, and inline-vs-durable scope.
Does not own: durable artifacts, product truth, docs lifecycle, Goal Pack state,
interface trace semantics, harness lifecycle, or concrete proof commands.
Inputs: user intent, host instructions, authority signals, repo state, and
available verification paths.
Outputs: route decision, orchestration order, inline execution boundary, and
claim / not_claimed summary.
Handoff: durable plan -> goal flow; docs placement -> governance;
interface trace -> interface capability workflow; harness model ->
harness system workflow; browser-visible proof -> UI harness workflow; command
proof -> headless harness workflow; reusable frontend architecture doctrine ->
frontend architecture workflow.
Stop: continuing needs product truth, authority, security, compliance,
private-data, public API/schema/protocol, destructive, or claim_limit choice.
```

## Core Boundary

```text
ai-coding-os      routes user intent and coordinates methods
docs-governance           owns docs/* layer governance and cleanup
goal-proof            owns Goal Pack planning and execution artifacts
interface-capability-planning owns UI/IA interaction capability contracts
product-harness-system    owns shared harness artifact model and lifecycle
ui-product-harness        owns frontend/UI harness design and evidence
headless-product-harness  owns proof command and evidence-envelope design
frontend-architecture     owns frontend dependency direction, naming, package
                           boundaries, and React/Effect/Query/Store doctrine
```

Do not create OS-owned durable state. If something must be persisted, route it
to the owning method:

- target planning or durable continuation -> `$goal-proof`;
- docs layer, authority placement, cleanup, or audit -> `$docs-governance`;
- UI/IA, app shell, navigation, route/page structure, interaction states,
  frontend handoff, headless-to-interface growth, or InterfaceCapability trace
  artifacts -> `$interface-capability-planning`;
- workspace-level harness architecture, Harness Scenario/Fixture/Surface/Evidence
  vocabulary, claim_ceiling, Harness Coverage Matrix, lifecycle, or placement rules ->
  `$product-harness-system`;
- frontend state/data/cache/mutation/realtime/router testing, UI dogfood,
  browser-visible proof, Playwright/agent-browser harnesses,
  interface-headless proof, or UI evidence envelopes -> `$ui-product-harness`;
- command surface, smoke proof, fixture/replay, or evidence envelope ->
  `$headless-product-harness`;
- reusable frontend architecture, feature-first layout, source-only shared /
  package boundaries, naming suffixes, React/Effect/Query/Zustand split, or
  frontend architecture audit -> `$frontend-architecture`;
- small work that can be completed and verified in the current turn -> inline.

## Routing Rules

Respect explicit user selection first. If the user names a specific skill, use
that skill.

Otherwise route by intent:

- asks for a Goal Plan, target plan, durable planning state, saved context,
  cross-session continuation, or explicitly says Goal Proof System / Goal Pack ->
  `$goal-proof`;
- asks for docs layer design, SSoT / standards / ADR / roadmap placement,
  obsolete docs cleanup, migration of planning folders, docs audit, or artifact
  placement -> `$docs-governance`;
- asks for UI/UX, IA, app shell, navigation, route/page structure, interaction
  capability, frontend handoff, headless-to-interface growth, or interface
  trace contracts -> `$interface-capability-planning`;
- asks for harness architecture, proof surface taxonomy, Harness Components /
  Routes / Fixtures / Scenarios / Evidence, Harness Coverage Matrix, lifecycle,
  placement, claim_ceiling, or alignment between headless and UI proof ->
  `$product-harness-system`;
- asks for frontend state/data/cache/mutation/realtime/router testing, UI
  product proof, browser-visible acceptance, agent-browser/Playwright dogfood,
  interface-headless tests, render wiring, or UI evidence envelopes ->
  `$ui-product-harness`;
- asks for xtask / just / pnpm command surfaces, smoke checks, headless proof,
  fixture replay, boundary checks, evidence envelope, or not_claimed ->
  `$headless-product-harness`;
- asks for reusable frontend architecture standards, feature-first directory
  rules, naming semantics, React/Effect/Query/Zustand boundaries,
  `packages/client`, `packages/ui`, source-only shared rules, or frontend
  architecture audit -> `$frontend-architecture`;
- asks for high-risk execution planning inside a Goal Pack -> route through
  `$goal-proof` to `write-work-plans`;
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
it as candidate understanding or `not_claimed`.

## Gap Routing

A gap is not automatically blocked. First classify the missing piece by owner:

- missing durable plan, continuation state, leftover gap, or evidence chain ->
  `$goal-proof`;
- missing docs placement, authority relation, cleanup verdict, or index ->
  `$docs-governance`;
- missing interface capability, IA surface, interaction contract, state/data
  ownership, or testability planning -> `$interface-capability-planning`;
- missing shared harness artifact model, trace spine, Harness Coverage Matrix,
  lifecycle, placement, or claim_ceiling -> `$product-harness-system`;
- missing frontend harness, interface-headless reducer/store/query proof,
  render wiring test, browser-visible proof, or UI evidence envelope ->
  `$ui-product-harness`;
- missing command wrapper, fixture, replay, boundary check, proof path, or
  evidence envelope -> `$headless-product-harness`;
- missing reusable frontend architecture rule, naming decision, source-only
  package boundary, or React/Effect/Query/Store split -> `$frontend-architecture`;
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
-> report only proven claims and explicit not_claimed
```

## Rolling Goal Execution

Do not rely on the user to name rolling execution. User phrases such as "one
pass", "end-to-end", "roll through", or "do the whole plan" are strong signals,
not required triggers.

Automatically route to rolling Goal execution when repo reality, Goal Pack
state, completion evidence, and proof path indicate a long-running
multi-evidence task that can keep moving safely.

```text
route to goal-proof
-> run current proof_step
-> append evidence and apply progress
-> if the goal contract is still valid and the next step is falsifiable:
     sharpen next proof_step and continue
-> otherwise review, block, or ask for a human decision
```

Rolling execution uses a small stable vocabulary: `target_slice`,
`proof_level`, `claim_ceiling`, `positive_tokens`, `not_claimed`,
`promotion_gate`, `next_action`, and `failure_inspection`. These may appear in
Goal Pack prose, companion traces, or evidence records; do not invent parallel
schema when existing fields can carry the meaning.

Do not compress multiple proof levels into one evidence record. Continuing is
allowed only while the next step is honest, falsifiable, inside the current
claim boundary, and does not require product-truth, public API/schema/protocol,
security, private-data, destructive, or `claim_limit` decisions.

## Non-Ownership Rules

Do not own or rewrite:

- Goal Pack `goal.yaml`, `progress.yaml`, `evidence.jsonl`, or
  `plans/<work_id>.md` lifecycle;
- InterfaceCapability trace artifact ownership that belongs to
  `$interface-capability-planning`;
- shared harness artifact/lifecycle ownership that belongs to
  `$product-harness-system`;
- UI harness command/evidence details that belong to `$ui-product-harness`;
- docs layer lifecycle rules that belong to `$docs-governance`;
- command/evidence schema details that belong to `$headless-product-harness`;
- frontend architecture doctrine that belongs to `$frontend-architecture`;
- product truth, public API/schema/protocol posture, security policy, or
  private/raw-data handling decisions.

## Stop Rules

Stop and ask only when continuing would require a new product, authority,
security, compliance, public API/schema/protocol, private-data, destructive, or
claim_limit decision.

Missing local detail is not enough to stop. Route to the method that can create
the minimum honest bridge, harness, Goal Pack, docs cleanup, or inline fix.
