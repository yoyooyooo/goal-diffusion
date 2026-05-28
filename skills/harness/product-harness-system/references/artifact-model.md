# Harness Artifact Model

Use these artifact names across UI and headless proof so agents can trace claims
without inventing project-specific vocabulary.

## Core Artifacts

```text
Harness Scenario
  Semantic proof story for one bounded capability.

Harness Fixture / Seed
  Deterministic input, backend seed, replay trace, mock server state, or browser
  runtime fixture used by a scenario.

Headless Product Harness
  Command, fixture/replay, adapter, projection, DB, or runtime proof that
  establishes product facts without relying on UI.

UI Harness Surface
  Auxiliary interface used for frontend and browser proof. It may include
  Harness Components, Harness Routes, stories, fixture selectors, and debug
  panels.

Harness Component
  Minimal component that consumes real frontend boundaries and exposes visible
  pending/success/failure/recovery states. It is not final product UI.

Harness Route
  Dev/test route such as `/__harness/<scenario>` that renders a UI Harness
  Surface for browser proof. It must not enter formal product navigation.

Harness Evidence
  Durable or inline evidence add of what ran, what passed, what was not proven, and
  which claims remain forbidden.

Harness Coverage Matrix
  Coverage view that maps capability IDs to harness levels, evidence,
  coverage status, and gaps.
```

## Trace Spine

Default trace:

```text
product capability id
  -> interface capability id when applicable
  -> harness scenario id
  -> harness surface / command id
  -> evidence id
```

Suggested ID prefixes:

```text
ic.<domain>.<action>   InterfaceCapability
hs.<domain>.<case>     Harness Scenario
hr.<domain>.<case>     Harness Route
hc.<domain>.<case>     Harness Component
hf.<domain>.<case>     Harness Fixture
uh.<domain>.<case>     UI Harness Evidence
hp.<domain>.<case>     Headless Product Harness Evidence
```

## Rules

- Harness artifacts prove or support claims; they do not become product
  authority.
- UI Harness Surface may be long-lived test infrastructure, but it must not be
  described as final UI.
- Fixture data may support deterministic proof, but it must not be reported as
  real business fact unless paired with a headless/product proof that establishes
  the fact.
- Keep scenario steps semantic. Avoid low-level selectors in trace artifacts.
- Use canonical fields: `claim_ceiling`, `not_claimed`, `not_proven`, and
  `status`. Do not introduce parallel claim-limit fields.
