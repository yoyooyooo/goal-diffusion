# Harness Lifecycle And Placement

Harness artifacts can be temporary, long-lived, or regression-critical. Name
the lifecycle state explicitly.

## Lifecycle States

```text
candidate
  Exploratory or unstable. Useful for dogfood, screenshots, or local proof.
  Do not treat as regression.

accepted
  Semantics are stable enough for other agents to reuse. The artifact can still
  move if trace links and evidence are updated.

regression
  CI, release checks, or stable Playwright/component tests depend on it. Changes
  must update tests and trace metadata.

retired
  Equivalent coverage moved to final UI or stronger proof. Keep the evidence
  link or migration note, then delete or demote runtime support code.
```

## Placement

Use the host project's conventions first. When no convention exists:

```text
src/harness/**
  Runtime harness support imported by dev/test routes, stories, or browser
  proof. Good for Harness Components, Harness Routes, runtime fixture selectors,
  and debug panels.

tests/fixtures/**
  Test-runner-only fixtures, mock handlers, replay data, and builders that do
  not need to enter an app bundle.

src/features/** or src/frontend-boundaries/**
  Real product frontend boundaries: query options, mutation adapters, view
  models, router helpers, realtime reducers, stores.

tests/interface-headless/**
  Store/cache/router/realtime/view-model tests without full UI rendering.

tests/render-wiring/**
  Thin component tests for work brief, roles, pending/error/success wiring.

tests/browser-visible/**
  Playwright or equivalent browser scenarios.

docs/interface-capabilities/** or Goal Pack interface-capabilities.yaml
  Durable InterfaceCapability / InterfaceSurface contracts.

docs/product-harness/** or Goal Pack product-harness.yaml
  Durable HarnessScenario, fixture refs, route/component refs, evidence refs,
  claim limits, lifecycle, and coverage matrix.
```

## Harness Route Rules

- Use a reserved namespace such as `/__harness/*`.
- Keep it out of formal product navigation.
- Gate it to dev/test builds unless production-near proof explicitly requires a
  staged or protected environment.
- Support fixture or seed selection when that keeps browser proof deterministic.
- Pair browser-visible claims with headless proof when business facts matter.

## Retirement Gate

Before deleting a harness artifact, confirm:

- equivalent capability coverage exists elsewhere;
- trace links and evidence records point to the replacement;
- CI or agent docs no longer depend on the old route/component/fixture;
- remaining gaps are recorded instead of silently dropped.
