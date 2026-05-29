# Core Doctrine

## Dependency Layers

Frontend architecture is a one-way dependency graph.

```text
app            composition runtime
routes         framework route adapters
features       product-facing capability slices
shared         app-local source-only capabilities
generated      generated or projected contracts
packages/*     source-only reusable packages
```

Default direction:

```text
app -> routes -> features -> shared
app -> features
app/routes/features/shared -> generated
apps/<app>/src/features -> packages/client/packages/ui/packages/api-contract
packages/client -> packages/api-contract
packages/ui -> packages/design-tokens
```

Forbidden direction:

```text
shared -> app/routes/features/other-shared
features/a -> features/b
routes -> app
generated -> hand-written source
packages/* -> apps/*
packages/ui -> packages/client or business contracts
packages/client -> React/Query/Zustand/UI
```

## Layer Responsibilities

`app` owns application composition runtime:

- bootstrap entry;
- providers;
- router setup;
- query client setup;
- client/runtime/config wiring;
- app layout and shell;
- global error handling;
- app-level policy and feature flag wiring;
- global style/token injection.

`app` may import lower layers only for assembly. If it starts owning feature API calls, mappers, state machines, or server-state cache semantics, move that logic down.

`routes` own route adapter duties:

- params and search parsing;
- redirects and not found;
- loader/action/prefetch;
- route context;
- error boundary wiring;
- composing page-level features.

Routes may call client capabilities for prefetch, preferably through feature query options. Routes must not write feature mappers, view-models, stores, or business state machines.

`features` own capability UI logic:

- query options/hooks;
- local interaction state;
- realtime projection adapter;
- mapper/view-model;
- page and surface composition;
- feature tests and fixtures.

Feature-to-feature imports are off by default. Shared concepts should move to a source-only shared capability or package.

`shared` is source-only:

- higher layers may import it;
- it may import npm dependencies;
- `shared/<capability>` may import files inside the same capability;
- it may not import another shared capability or any app/route/feature code.

Content that needs multiple cooperating files can live in `shared/<capability>`. Small early code may be flat under `shared`, but flat files follow the same import rules.

`generated` is read-only projection:

- app-local generated artifacts live in `apps/<app>/src/generated`;
- cross-app or versioned contracts live in `packages/*`;
- hand-written adapters, mappers, and fallbacks do not live in `generated`.

## Package Boundaries

All reusable packages are source-only packages.

`packages/api-contract` owns DTO/protocol/generated contract consumption. It does not import client, UI, app, feature, React, Query, or Zustand.

`packages/client` is the typed capability gateway between hosts and backend/runtime capabilities. It may import `packages/api-contract`. It may contain Effect service key/Layer/live/fake, transport, decode/assert, normalized errors, timeout/retry/cancel/resource lifecycle. It must not import React, TanStack Query, Zustand, UI, app, features, or app-local shared.

`packages/ui` owns business-neutral UI primitives and composite primitives. It may import `packages/design-tokens`. It must not import client, api-contract, app, features, or business contracts. It must not contain app shell, route, or business components.

`packages/design-tokens` owns design tokens and primitive theme data. It does not import UI/client/app/features.

Package root `src/index.ts` may re-export public surface. Package internals still reject generic buckets such as `shared`, `lib`, `utils`, `components`, or `common`.

## Client Gateway

`client` means typed capability gateway, not all frontend business code.

It carries:

- capability interfaces such as `ChannelClient`;
- HTTP/RPC/realtime access;
- DTO decode/assert;
- request id, auth/config/header injection;
- normalized client errors;
- Effect service/Layer/live/fake;
- host variants such as `.browser.live.ts`, `.server.live.ts`, `.desktop.live.ts`.

It does not carry:

- React hooks;
- Query options;
- Zustand stores;
- view-models;
- route params;
- page/surface components;
- app shell.

Return DTOs or client-level normalized results, not UI view-models. Web, desktop, server routes, and tests should all be able to consume the same capability gateway with different live/fake implementations.

## Realtime Capability Boundary

Realtime capability follows these invariants:

```text
Fact authority != realtime delivery
Realtime transport != React hook
Runtime lifecycle != feature logic
Feature adapter != business fact owner
```

`packages/client` owns realtime capability contracts, host-specific live/fake
implementations, low-level transport, decode/assert, normalized errors,
timeout/retry/cancel, and subscription close semantics.

`app` owns runtime/config/live client wiring and injection.

`features/<feature>/<feature>.realtime.ts` owns typed event -> reducer/cache/store
adapter logic. It consumes a client subscription and may expose React lifecycle
glue, but it must not create WebSocket/EventSource, import transport, read
config/env, or create a live singleton.

Realtime events are projection notifications, not facts. If continuity, decode,
permission, or shape is uncertain, invalidate or backfill from the authority
source instead of inventing frontend truth.

## Shared And UI

`shared/ui` may internally compose its own primitives, for example `icon-button` using `button` and `tooltip`. It must not import other shared capabilities or feature/app code.

App shell/layout belongs in `app/layout/*`, not `shared/ui`, unless it is a truly host-neutral primitive. Components such as split shell, navigation rail, and composer frame are usually app layout.

Do not keep `shared/config`. App config belongs in `app/config` or app runtime wiring. A shared capability may define its own minimal contract type but does not depend on a config bucket.

## UI And Token Promotion

Use this decision tree for UI primitives and design tokens:

1. Is it app shell, navigation, split-pane frame, or product workspace layout?
   - Put it in `apps/<app>/src/app/layout/*`.
2. Is it business-specific UI tied to one feature capability?
   - Put it in that feature as `.surface.tsx` or same-feature child surface.
3. Is it an app-local business-neutral primitive used by multiple features?
   - Put it in `apps/<app>/src/shared/ui/<subject>.tsx`.
4. Is it a business-neutral primitive needed by multiple apps/packages?
   - Promote it to `packages/ui`.
5. Is it primitive theme data, semantic color, spacing, typography, radius, or
   motion token shared across apps?
   - Promote it to `packages/design-tokens`.
6. Is it product-specific copy, status vocabulary, workflow semantics, or
   feature affordance?
   - Do not put it in `packages/ui` or design tokens. Keep it in feature or
     product authority.

## Styles And Tokens

`app` owns global reset, font loading, body/root baseline, and token injection.

`shared/ui` or `packages/ui` consumes tokens for primitives.

`features` own feature-specific class composition only. They do not define `:root` tokens or body styles.

When multiple apps need the same tokens, promote tokens to `packages/design-tokens`.
