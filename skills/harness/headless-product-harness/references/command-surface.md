# Command Surface

Use this reference when naming or auditing a headless product command surface.

## Naming

Prefer capability names:

```text
pnpm xtask boundary
pnpm xtask source inventory
pnpm xtask smoke offline-import
cargo run -p xtask -- boundary-check
just smoke-channel-realtime
```

Avoid progress labels as primary names:

```text
smoke-mvp-0-1
phase-2-complete
current-status
```

Compatibility aliases may remain when they call the durable semantic command.

## Command Contract

For each command, define:

```text
name:
capability:
authority_used:
input:
output_format:
evidence_tokens:
not_claimed:
not_proven:
failure_codes:
default_ci:
opt_in_env:
```

## Parameter Rules

- Name parameters by semantic role, not internal type.
- Keep common names stable: `--source`, `--source-unit`, `--profile`, `--out`,
  `--format`, `--limit`.
- `--out` writes artifacts; stdout still emits the summary envelope.
- `--limit` may affect samples, not final smoke truth.
- Commands must not depend on hidden global state for common agent paths.

## Review Questions

- Can a new agent infer what this command proves from its name?
- Does this command prove exactly one capability?
- Does passing this command avoid implying server, web, DB, or real runtime
  proof unless those are explicitly in scope?
- Is there a structured failure path with next action?
