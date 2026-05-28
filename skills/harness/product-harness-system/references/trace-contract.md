# Harness Trace Contract

Trace exists so agents can move from capability planning to implementation,
tests, evidence, and retirement without losing `claim_ceiling`.

## Minimal YAML Convention

```yaml
kind: HarnessScenario
id: hs.<domain>.<case>
status: candidate # candidate | accepted | regression | retired

covers:
  product_capability: pc.<domain>.<action>
  interface_capability: ic.<domain>.<action> # optional

claim_ceiling:
  level: browser_visible # headless_product | interface_headless | render_wiring | browser_visible | production_near
  headless_sublevel: null # boundary | offline_fixture | replay | adapter | projection | db_backed | real_runtime_opt_in
  environment: local

fixtures:
  - hf.<domain>.<case>

surfaces:
  commands:
    - hp.<domain>.<case>
  routes:
    - hr.<domain>.<case>
  components:
    - hc.<domain>.<case>

evidence:
  positive_tokens: []
  refs:
    - uh.<domain>.<case>
    - hp.<domain>.<case>

not_claimed: []
not_proven: []
remaining_gaps: []
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
  claim_ceiling: { level: "browser_visible", headless_sublevel: null, environment: "local" },
  status: "candidate",
  fixtures: ["success", "mutation-error", "realtime-created"],
}
```

## Coverage Matrix

Use a Harness Coverage Matrix when the project needs an inspectable map from
capability to proof levels:

`coverage` may be `candidate`, `accepted`, `regression`, `retired`, or `gap`.

```yaml
kind: HarnessCoverageMatrix
capabilities:
  - id: pc.<domain>.<action>
    scenarios:
      - hs.<domain>.<case>
    levels:
      headless_product:
        coverage: accepted
        headless_sublevel: projection
        evidence: [hp.<domain>.<case>]
        not_claimed: []
        gaps: []
      interface_headless:
        coverage: gap
        evidence: []
        gaps: [missing frontend state proof]
      render_wiring:
        coverage: gap
        evidence: []
        gaps: []
      browser_visible:
        coverage: candidate
        evidence: [uh.<domain>.<case>]
        not_claimed: [business_fact_claim=false unless paired with hp.<domain>.<case>]
        gaps: []
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
- each scenario declares `claim_ceiling.level`;
- each headless scenario that needs a sublevel declares
  `claim_ceiling.headless_sublevel`;
- evidence records include positive tokens, `not_claimed`, and `not_proven`;
- retired artifacts point to replacement coverage or recorded gaps.
