# Interface Trace DSL

This is a thin YAML convention for traceability. It is not a UI generation
language, a workflow engine, or a replacement for tests.

## Goals

- connect IA, interaction capability, UI harness, headless proof, and evidence;
- let high-capability agents infer concrete test paths from semantic contracts;
- support future coverage matrix and gap inspection;
- avoid encoding low-level DOM steps or framework-specific implementation.

## Object References

UI harness evidence usually references these object kinds:

```text
InterfaceCapability  # definition lives in interface-capability artifacts
InterfaceSurface     # definition lives in interface-capability artifacts
HarnessEvidence      # proof evidence add/ref governed by product-harness-system
```

Optional ID prefixes:

```text
ic.<domain>.<action>
surface.<area>.<name>
region.<area>.<name>
uh.<domain>.<scenario>
hp.<domain>.<proof>
```

## InterfaceCapability

Do not define long-lived InterfaceCapability records here. Use this shape only
to understand what `HarnessEvidence.covers` points at.

```yaml
kind: InterfaceCapability
id: ic.<domain>.<action>
status: sketch | candidate | accepted | regression

intent: ...
authority_refs: {}
surface_refs: []
entrypoint: {}
interaction_contract: {}
state_ownership: {}
data_contract: {}
coverage_intent: {}
forbidden_paths: []
agent_freedom: {}
promotion_gate: {}
evidence_links: []
```

Required for non-trivial UI work:

- `id`
- `status`
- `intent`
- `surface_refs`
- `interaction_contract`
- `state_ownership`
- `coverage_intent`
- `forbidden_paths`

Use `authority_refs` or explicit `missing_authority` when facts are not yet
grounded.

## InterfaceSurface

Do not define long-lived InterfaceSurface records here. Use this shape only to
understand surface references.

```yaml
kind: InterfaceSurface
id: surface.<area>.<name>
title: ...
regions:
  - id: region.<area>.<name>
    role: ...
capabilities:
  - ic.<domain>.<action>
```

Surface files are IA indexes. They should not become product truth or test code.

## HarnessEvidence

Durable project-level HarnessEvidence refs belong in `docs/product-harness/**`
or a Goal Pack `product-harness.yaml`. Test-local reports may use this shape
inline.

```yaml
kind: HarnessEvidence
id: uh.<domain>.<scenario>
covers: ic.<domain>.<action>
level: interface_headless | render_wiring | browser_visible | production_near
status: candidate | accepted | regression | retired

seed: {}
steps_intent: []
assertions: []
positive_tokens: []
negative_claims: []
non_claims: []
artifacts: []
```

`steps_intent` names semantic actions, not brittle selectors. Test code or
browser scripts may choose exact selectors later.

## Example

```yaml
kind: HarnessEvidence
id: uh.issue-intake.browser
covers: ic.issue-intake.from-channel-message
level: browser_visible
status: candidate

seed:
  headless_proof: hp.channel-message.seeded
  data_mode: mock-server-or-local-backend

steps_intent:
  - open the Channel workspace
  - create an Issue from the source message
  - verify visible success
  - reload and verify consistency

assertions:
  - issue affordance visible on source message
  - issue detail opens from the affordance
  - source message context visible in detail
  - draft or pending duplicate does not survive as accepted fact after reload
  - console has no framework error
  - network has no failed mutation

negative_claims:
  - production_auth=false
  - db_persistence=false unless paired with hp.issue-source-link.db-backed
```

## Rules

- Claims must link to evidence or be marked missing.
- Visual details are recorded only when they are test-relevant.
- Keep unstable InterfaceCapability work `sketch` or `candidate`; keep unstable
  HarnessEvidence as `candidate`. Do not promote it to `regression` until the
  entrypoint semantics and evidence are stable.
- Do not duplicate test code in the DSL.
- Do not use the DSL to invent product objects, API schemas, or domain facts.
