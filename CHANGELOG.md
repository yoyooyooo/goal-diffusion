# Changelog

## Unreleased

- Grouped the public OS skill suite under `skills/router/`, `skills/goal/`, `skills/governance/`, `skills/capability/`, and `skills/harness/` for source readability.
- Renamed the formal long-running goal method to Goal Proof System, with `goal-proof` CLI, v2 Goal Pack artifacts, and `work` / `evidence` command groups.
- Added shared read-output controls (`--limit`, `--include`, `--show-empty`, and `summary --depth`) with bounded, thread-aware repo summary output.
- Added `goal-proof evidence add --stdin` for heredoc evidence record JSON input.
- Added `goal-proof work list` for listing work items inside one Goal Pack, with work item completion/status filters and JSON output.
- Added `goal-proof evidence list/show` for compact, filterable evidence history inspection and explicit full evidence record expansion.

## 0.1.0

- Rebuilt Goal Proof System as a Bun monorepo.
- Added the `goal-proof` npm CLI package in TypeScript.
- Moved the agent skill into the public OS skill suite.
- Added Bun build, typecheck, test, pack, and local install workflows.
- Added bilingual README documentation.
