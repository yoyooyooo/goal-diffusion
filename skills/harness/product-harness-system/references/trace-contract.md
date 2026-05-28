# Harness Trace Contract

Trace exists so agents can move from capability planning to implementation,
tests, evidence, and retirement without losing the claim_limit.

## Minimal YAML Convention

```yaml
kind: HarnessScenario
id: hs.<domain>.<case>
covers:
  interface_capability: ic.<domain>.<action>
  product_capability: pc.<domain>.<action>
status: candidate | accepted | regression | retired
levels:
  - headless_product
  - interface_headless
  - render_wiring
  - browser_visible
fixtures:
  - hf.<domain>.<case>
surfaces:
  - hr.<domain>.<case>
evidence:
  - uh.<domain>.<case>
  - hp.<domain>.<case>
claim_ceiling: ...
negative_claims: []
not_proven: []
```

Use this convention only when durable traceability matters. Inline reports are
enough for small one-turn work.

## Harness Route Metadata

For runtime routes, include equivalent metadata near the route or in an index:

```ts
export const harnessMeta = {
  id: "hr.issue-intake.from-channel-message",
  covers: "ic.issue-intake.from-channel-message",
  scenario: "hs.issue-intake.from-channel-message",
  level: "browser_visible",
  status: "candidate",
  fixtures: ["success", "mutation-error", "realtime-created"],
}
```

## Goal Pack Relationship

Goal Pack goal contracts should reference harness IDs or companion artifact paths.
Do not paste full harness DSL into `goal.yaml`.

Suggested locations:

```text
docs/interface-capabilities/<surface>.yaml
docs/goal-proof/goals/<goal-id>/interface-capabilities.yaml
docs/product-harness/<domain>.yaml
docs/goal-proof/goals/<goal-id>/product-harness.yaml
docs/reports/ui-harness/<date>-<scenario>.md
```

## Trace Quality Gate

Before claiming coverage, check:

- each capability ID maps to at least one scenario or explicit gap;
- each scenario declares the harness level it exercised;
- evidence records include positive tokens and non-claims;
- retired artifacts point to replacement coverage or recorded gaps.
