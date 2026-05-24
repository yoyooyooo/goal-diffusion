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
headless-product-harness  owns proof command and evidence-envelope design
```

Do not create OS-owned durable state. If something must be persisted, route it
to the owning method:

- target planning or durable continuation -> `$goal-diffusion`;
- docs layer, authority placement, cleanup, or audit -> `$docs-governance`;
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
