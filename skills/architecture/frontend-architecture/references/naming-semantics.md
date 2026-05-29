# Naming Semantics

## Decision Tree

1. Are you naming a capability/object/surface? Use a concrete subject.
2. Are you naming a responsibility/boundary role? Use a registered suffix.
3. If the subject is generic, reject it.
4. If the suffix already exists, follow its defined responsibility and import boundary.
5. If the suffix does not exist, first try mapping to an existing suffix.
6. If it is genuinely new, mark it provisional in the plan or notes.
7. Before merging long-term code, either rename to an existing suffix or update the suffix table and obtain project confirmation.

Agents may create new concrete subjects. Agents must not silently create long-term suffixes.

This decision tree applies to files, directories, package names, and feature names.

## Forbidden Names

Reject generic buckets and pseudo-subjects:

```text
lib utils common core base helpers foundation services manager misc general modules components containers internal
```

Also reject names that only describe technical shape when a capability name is available. Use `shared/ui` for UI primitives and concrete feature files for business components; do not create `components/`.

## Syntax

Use dot filenames:

```text
<subject>.<semantic>[.<variant>].ts
<subject>.<semantic>[.<variant>].tsx
```

Examples:

```text
channel.query.ts
channel.realtime.ts
channel.view-model.ts
channel.client.browser.live.ts
transport.http.ts
button.test.tsx
```

Do not create a full set mechanically. Create a file only when the responsibility exists.

## Suffix Table

`.client.ts`

- typed capability interface or facade;
- usually in `packages/client`;
- no React, Query, Zustand, app, feature, or UI imports;
- feature-local only as a temporary bridge before package promotion.

`.client.<host>.live.ts`

- live implementation for a host such as browser, server, desktop;
- may use transport, Effect, contract decode, config injection;
- may create host-specific HTTP/realtime capability resources;
- exposes capability methods such as `subscribeXxx`, not React hooks;
- does not export React hooks or Query adapters.

`.client.fake.ts`

- fake implementation for tests, demos, and harnesses;
- may return fixtures and record calls;
- not a production fallback.

`transport.<kind>.ts`

- packages/client internal communication primitive;
- examples: `transport.http.ts`, `transport.realtime.ts`, `transport.ipc.ts`;
- handles request/connection mechanics, auth/header/request id, timeout/retry/cancel, low-level error normalization;
- `transport.realtime.ts` is the only default home for WebSocket/SSE/IPC/polling transport mechanics;
- may use Effect or the repo runtime boundary for resource lifecycle;
- not imported by apps or `apps/<app>/src/features` as public API.

`.query.ts`

- TanStack Query options/mutation options and optional React hooks;
- queryFn/mutationFn consumes a client contract;
- does not create live client, runtime, config, or Effect Layer;
- prefer options factories so route prefetch and headless harness can reuse the same query semantics.

`.store.ts`

- local interaction state only;
- examples: draft, drawer target, selected tab/filter, pending echo, viewport interaction, connection UI state;
- no server truth, DTO mirror, fetch side effect, realtime connection, or canonical domain facts.

`.realtime.ts`

- feature realtime projection adapter;
- consumes client subscription and connects it to Query cache / local store / reducer;
- no WebSocket/EventSource construction, transport import, live singleton, runtime/Layer creation, or config/env read;
- React hook exports are allowed only as subscribe/unsubscribe lifecycle glue around an injected client contract.

`.mappers.ts`

- boundary data conversion layer;
- inputs: DTO, envelope, URL/search parse result, fixture raw data;
- outputs: feature projection or view-model input;
- pure functions by default;
- no IO, React, Query, Zustand, client, store reads, or rendering.

`.view-model.ts`

- surface/headless harness consumption model;
- combines feature projection with local interaction state and derived labels/actions;
- pure functions by default;
- no IO/runtime/fetch/realtime.

`.page.tsx`

- feature page-level container;
- can connect query/store/realtime/client props and event glue;
- route uses it as a page component;
- business logic that grows beyond glue should move into feature modules.

`.surface.tsx`

- harnessable UI surface;
- consumes view-model and callbacks;
- may import same-feature child surfaces and `shared/ui`;
- should not import query/store/client/realtime.

`.layout.tsx`

- local layout primitive within a layer or feature;
- app shell/layout belongs under `app/layout/*`;
- not a reason to create `shared/layout`.

`.types.ts`

- feature-local or package-local types;
- not a whole-repo dumping ground.

`.fixture.ts`

- static sample data for tests, stories, demos, and harnesses;
- no mutable behavior or fake server state machine;
- production code must not import it.

`.public.ts`

- explicit public surface for a complex feature;
- use when routes/app need a stable feature export boundary;
- avoid default barrels.

## Tests

Tests colocate with source unless they are cross-app e2e or production-near harnesses.

Common test names:

```text
<feature>.mappers.test.ts
<feature>.view-model.test.ts
<feature>.store.test.ts
<feature>.realtime.test.ts
<feature>.headless.test.ts
<feature>.surface.test.tsx
<feature>.layout.test.tsx
```

`.headless.test.ts` proves view-model and command trace without requiring final DOM or screenshots.

`.surface.test.tsx` renders the harnessable surface and verifies callbacks, visible controls, and key states.

`.layout.test.tsx` verifies structural layout contracts only: hosts, regions, landmarks, fixed composer area, drawer host. It is not visual QA.
