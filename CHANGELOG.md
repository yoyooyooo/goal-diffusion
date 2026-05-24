# Changelog

## Unreleased

- Added shared read-output controls (`--limit`, `--include`, `--show-empty`, and `summary --depth`) with bounded, thread-aware repo summary output.
- Added `goal-diffusion record --stdin` for heredoc receipt JSON input.
- Added `goal-diffusion tasks` for listing tasks inside one Goal Pack, with task completion/status filters and JSON output.
- Added `goal-diffusion receipts list/show` for compact, filterable receipt history inspection and explicit full receipt expansion.

## 0.1.0

- Rebuilt Goal Diffusion as a Bun monorepo.
- Added the `goal-diffusion` npm CLI package in TypeScript.
- Moved the agent skill to `skills/goal-diffusion/`.
- Added Bun build, typecheck, test, pack, and local install workflows.
- Added bilingual README documentation.
