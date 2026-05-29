# Audit Checklist

Use this checklist when reviewing an existing frontend repo or planning a migration.

## 1. Dependency Direction

- `app` only composes and wires runtime.
- `routes` own route adapter duties, not feature logic.
- features do not import each other.
- `shared` does not import app/routes/features/other shared.
- generated files do not import hand-written source.
- packages do not import apps or app-local shared.

## 2. Naming

- Feature-first layout exists or has a migration path.
- Dot filenames use stable suffix semantics.
- No generic buckets: `lib`, `utils`, `common`, `core`, `base`, `helpers`, `services`, `manager`, `components`, `containers`, `internal`.
- New suffixes are documented or marked provisional.
- No default `index.ts` barrels outside package public exports.

## 3. Shared And Packages

- `shared/<name>` can be lifted to a package.
- `shared/config`, `shared/lib`, `shared/layout`, and `shared/effect` are not treated as long-term defaults.
- `packages/ui` is business-neutral and source-only.
- `packages/client` is a typed capability gateway and does not import React/Query/Zustand/UI.
- `packages/api-contract` stays generated/contract-only.

## 4. React / Query / Store / Realtime

- Components do not create transport or run Effect directly.
- Query options consume client contracts.
- Query keys are centralized.
- Store holds only local interaction state.
- Realtime feature adapters consume client subscription and update Query/store through pure reducers where possible.
- WebSocket/EventSource/SSE/IPC/polling transport mechanics live in `packages/client` transport/live files, not features or hooks.
- Hooks only subscribe/unsubscribe through an injected client contract.
- Realtime handlers are stable enough to avoid reconnecting on ordinary renders.
- Realtime events are projection notifications, not business facts.
- Gaps and decode failures invalidate/backfill rather than inventing frontend truth.
- Fake subscriptions cover success, error, gap/backfill, and close paths.

## 5. Effect

- Effect services/layers live in client/runtime boundaries.
- App wires runtime/config/live implementations.
- Feature code does not import app runtime.
- Pure mappers/view-models are ordinary functions.
- Fake Layer/client replacement exists or is planned for tests/harnesses.

## 6. Harness And Tests

- `.fixture.ts` is static data only.
- `.client.fake.ts` owns fake behavior.
- Production code does not import fixture/fake/test.
- `.headless.test.ts` covers view-model and command trace where UI is not final.
- `.surface.test.tsx` covers harnessable surface behavior.
- `.layout.test.tsx` covers structural layout only.
- Harness Coverage Matrix and claim ceilings are routed to `product-harness-system`, not invented inside this skill.
- Browser-visible proof is delegated to UI harness tooling.

## 7. CSS And Tokens

- App owns global style and token injection.
- UI package consumes tokens for primitives.
- `app/layout/*` owns app shell/workspace layout; `shared/ui` and `packages/ui` do not own app shell.
- Features do not define root tokens or body styles.
- Business-specific colors and semantic states are tokenized or isolated.
- Cross-app primitive theme data is promoted to `packages/design-tokens`; product semantics stay out of token packages.

## 8. Tooling

- `tsc --noEmit` is the TypeScript authority.
- Oxc or equivalent covers format/lint.
- Boundary check is automated with a semantic import/path script or equivalent.
- CI/test commands cover typecheck, lint, unit/headless/surface/layout, and e2e when claimed.

## Output Template

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
