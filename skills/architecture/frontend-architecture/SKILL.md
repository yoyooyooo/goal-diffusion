---
name: frontend-architecture
description: >-
  Defines and audits TypeScript frontend architecture: dependency direction, feature-first layout,
  naming semantics, source-only shared/package boundaries, client/query/store/realtime split, and
  harness-ready React integration. Use when designing, reviewing, refactoring, or standardizing
  frontend apps, React features, UI harnesses, packages/client, packages/ui, Effect integration,
  TanStack Query/Zustand boundaries, realtime/WebSocket/SSE subscriptions, route adapters, or
  frontend naming and import rules.
---

# Frontend Architecture

## Quick Start

1. Classify the task: `new-app`, `feature-slice`, `react-effect`, `realtime-capability`, `harness-readiness`, or `audit`.
2. Read the minimum needed reference:
   - Dependency/package rules: [Core Doctrine](references/core-doctrine.md).
   - Naming and suffixes: [Naming Semantics](references/naming-semantics.md).
   - React, Effect, Query, Store: [React Adapter](references/react-adapter.md).
   - WebSocket, SSE, subscriptions, streams, cursor/gap/backfill: [Realtime Capability](references/realtime-capability.md).
   - Existing repo review: [Audit Checklist](references/audit-checklist.md).
3. Use project `AGENTS.md`, SSoT, standards, ADRs, and package scripts for repo-specific adapters. This skill owns generic doctrine, not project facts.
4. If the repo uses Effect, also use `effect-best-practices` for Service/Layer/runtime/error/Scope details.

## Core Model

Use a one-way dependency graph. Directory names are carriers; dependency direction is the architecture.

```text
app -> routes -> features -> shared
app -> features
app/routes/features/shared -> generated
packages/client -> packages/api-contract
packages/ui -> packages/design-tokens
apps/<app>/src/features -> packages/client/packages/ui/packages/api-contract
```

Default app layout:

```text
apps/<app>/src/
  app/
  routes/
  features/
  shared/
  generated/
```

`app` is application composition runtime: bootstrap, providers, router setup, runtime wiring, app layout, app-level policy, and global error handling. It may import lower layers for assembly; lower layers must not import `app`.

`routes` are framework route adapters: URL params/search, loader/action/prefetch, route context, redirects, not found, and page composition. They may compose multiple features but must not own feature business logic.

`features` own product-facing UI slices. Features do not import each other by default. Cross-feature reuse moves to `shared`, `packages/*`, or generated contracts.

`shared` is a source-only zone. Higher layers may import it, but it must not import `app`, `routes`, `features`, or another `shared` capability. `shared/<capability>` may import its own internal files.

## Default Stack Policy

This skill enforces capability slots, not irreplaceable libraries. Without a repo adapter override, the recommended stack is:

```text
React + TanStack Router/Start + TanStack Query + Zustand + Effect + Oxc
```

Replacing a default library requires an ADR or repo adapter explaining the equivalent capability: route adapter, server-state cache, local interaction state, effect/runtime boundary, typed capability gateway, UI primitive system, format/lint, typecheck, tests, and boundary check.

## Forbidden Defaults

Do not introduce generic buckets:

```text
lib utils common core base helpers foundation services manager modules components containers internal
```

Do not use default `@/*` aliases that hide dependency direction. Prefer package imports and local relative imports; if aliases are needed, make them layer-explicit.

Do not add `index.ts` barrels inside `app`, `routes`, `features`, or `shared`. Package root `src/index.ts` is allowed only as a public export map with no implementation logic.

## Audit Output

```text
classification:
references_read:
fits:
drift:
blockers:
auto_fix_candidates:
human_decisions:
verification:
```
