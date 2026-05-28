# Boundary Check

Use this reference when the harness must protect product architecture from
dependency or authority drift.

## Purpose

A boundary check verifies mechanical rules. It does not replace SSoT,
architecture, or human review for ambiguous ownership questions.

## Rule Template

```text
owner:
forbidden_dependency:
allowed_dependency:
scan_method:
failure_message:
authority_doc:
```

## Common Rules

- Product core must not depend on server or web.
- Contract/schema must not depend on product core implementation.
- Web must not import product core directly.
- Server must not reimplement core normalizers, risk rules, or projection facts.
- Harness may depend on product core for orchestration, but cannot become the
  product authority.
- Platform/shared types must not define business objects unless SSoT says so.

## Implementation Guidance

- Rust: read `cargo metadata --no-deps` and inspect workspace crate edges.
- TypeScript: inspect workspace manifests and import graph with the repo's
  existing tooling before adding new dependencies.
- Keep checks deterministic and explain the violated edge.
- Add an allowlist only when the authority doc is updated in the same change.

## Failure Output

Boundary failures should identify:

```text
violating_package:
forbidden_edge:
rule:
authority_doc:
next_action:
```
