# Fixture And Replay Ladder

Use this reference when deciding how much harness is enough.

## Ladder

```text
1. Unit rule test
2. Offline fixture
3. Normalized replay
4. Adapter/source import smoke
5. Projection/facts smoke
6. DB-backed restart/rebuild smoke
7. Real external runtime opt-in smoke
```

Start at the lowest level that can falsify the claim. Move up only when the
current claim requires integration behavior.

## Claim Limit

| Level | Can prove | Must not claim |
|---|---|---|
| `boundary` | Structure, imports, dependency direction, schema drift | Business behavior completion |
| `offline-fixture` | Deterministic input through product/core logic | Real runtime compatibility |
| `replay` | Sanitized or normalized trace handling | Raw capture authority |
| `adapter` | External/source mapping into canonical candidates | Persisted domain facts |
| `projection` | Product facts exposed through view/query/read surfaces | Mutation authority |
| `db-backed` | Persistence, restart, rebuild, migration path | Production deploy readiness |
| `real-runtime-opt-in` | Explicit external process/API path | Default CI safety or whole-product completion |

## Fixture Rules

- Fixtures are deterministic and small.
- Fixtures should preserve the shape that product core needs, not raw private
  data.
- Sanitized real traces are sources for replay, not product truth by themselves.
- Keep fixture names capability-based.

## Replay Rules

- Replay proves parser/normalizer/materialization behavior without launching the
  real external runtime.
- Raw external traces should be sanitized before entering reusable fixtures.
- Replay outputs must still use the same evidence envelope as normal smoke.

## Real Runtime Opt-In

Real runtime smoke must require explicit opt-in, such as an env var or dedicated
manual command. It should not be part of default CI unless the external system is
deterministic, cheap, authorized, and safe to run repeatedly.

Always separate:

```text
runtime_seen=true
runtime_completed=true
product_fact_materialized=true
product_completion_claim=true|false
```
