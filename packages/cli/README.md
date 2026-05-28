# goal-proof

**English** | [中文](README.zh-CN.md)

CLI for inspecting Goal Proof System Goal Packs, reading the active work item,
recording evidence, applying deterministic progress, and checking consistency.

Use it inside any project that stores Goal Pack folders under
`docs/goal-proof/goals/<goal-id>`.

```bash
npm install -g goal-proof
```

## Common Flow

```bash
goal-proof summary .
goal-proof list . --completion todo
goal-proof inspect <goal-id>
goal-proof work list <goal-id>
goal-proof evidence list <goal-id> --limit 5
goal-proof relations goals . --thread <thread-id> --completion todo --json
goal-proof relations work . --thread <thread-id> --completion todo --json
goal-proof relations check . --thread <thread-id>
goal-proof work brief <goal-id>
goal-proof check <goal-id>
```

Use `summary` and `list` at project level. Use `inspect`, `work list`,
`work brief`, `work activate`, `evidence list`, `evidence show`,
`evidence add`, `apply`, and `check` on one Goal Pack. Use `relations` at
project or goals-directory level to inspect continuity metadata and discover
thread-member goal/work candidates. Relations do not create a queue, scheduler,
thread lifecycle, stored graph, or execution order.

## Commands

```bash
goal-proof --help
goal-proof <command> --help
goal-proof inspect <goal-pack> [--json]
goal-proof summary [project-root|goals-dir] [--completion all|todo|done] [--status <status>] [--depth repo|groups|items] [--limit N] [--include fields] [--show-empty] [--json]
goal-proof list [project-root|goals-dir] [--completion all|todo|done] [--status <status>] [--limit N] [--include fields] [--show-empty] [--json]
goal-proof work list <goal-pack> [--completion all|todo|done] [--status queued|active|blocked|done] [--limit N] [--include fields] [--show-empty] [--json]
goal-proof work brief <goal-pack> [--work <id>] [--json]
goal-proof work activate <goal-pack> --work <id> [--dry-run]
goal-proof evidence list <goal-pack> [--limit N] [--work <id>] [--type discovery|decision|implementation|coordination|review|planning] [--result done|blocked] [--decision <value>] [--next-action proof_step|continue|needs_plan|blocked|review|done|needs_human] [--completion-satisfied true|false] [--changed-file <glob>] [--command-status pass|fail] [--contains <text>] [--include fields] [--show-empty] [--json]
goal-proof evidence show <goal-pack> --index N [--json]
goal-proof evidence add <goal-pack> (--file evidence-record.json | --json '<json>' | --stdin) [--apply] [--check]
goal-proof relations list [project-root|goals-dir] [--thread <id>] [--limit N] [--include fields] [--show-empty] [--json]
goal-proof relations goals [project-root|goals-dir] [--thread <id>] [--completion all|todo|done] [--status forming|ready|running|blocked|done|retired] [--next-action proof_step|continue|needs_plan|blocked|review|done|needs_human] [--limit N] [--include fields] [--show-empty] [--json]
goal-proof relations work [project-root|goals-dir] [--thread <id>] [--completion all|todo|done] [--status queued|active|blocked|done] [--goal-completion all|todo|done] [--goal-status forming|ready|running|blocked|done|retired] [--goal <goal-id>] [--limit N] [--include fields] [--show-empty] [--json]
goal-proof relations check [project-root|goals-dir] [--thread <id>] [--json]
goal-proof relations graph [project-root|goals-dir] [--thread <id>] [--json]
goal-proof apply <goal-pack> [--dry-run]
goal-proof check <goal-pack>
```

`<goal-pack>` may be a directory or a bare goal id under
`docs/goal-proof/goals/`. `summary` accepts a project root or a
`docs/goal-proof/goals` directory, defaulting upward from the current directory.

Read JSON commands share output controls. `--limit` bounds visible collections,
`--include path,objective,links` restores omitted detail, and `--show-empty`
restores empty/default fields. `summary` defaults to `--depth groups` and
`--limit 20`; `--depth items` nests threaded goals under `threads` and leaves
only unthreaded goals in top-level `items`.

For `summary` and `list`, `--completion todo` means Goal Pack status is neither
`done` nor `retired`. For `work list`, `--completion todo` means work item
status is not `done`.

For `evidence list`, filters compose with AND semantics and compact evidence
record summaries are shown by default. Use `evidence show --index N` to expand
one full evidence record. For `evidence add`, choose exactly one input source.
Use `--stdin` for heredoc JSON and `--apply --check` for the common append,
deterministic progress update, and validation path.

For `relations`, `list` shows relation metadata, `goals` discovers
thread-member Goal Packs, `work` discovers thread-member work items, `check`
validates relation evidence with token-aware matching, and `graph` renders a
derived relation view. `relations.thread_id` is a label only.

Typical execution loop:

```text
check -> inspect -> work brief -> work -> evidence add -> apply -> check
```

## Release

Run releases from the repository root:

```bash
bun run release:check patch
bun run release patch
# or
bun run release 0.2.0
```

`bun run release:check` validates release git readiness without changing files.
`bun run release` writes the version on a temporary local release branch, tags
that commit, and pushes only the tag. GitHub Actions publishes through npm
Trusted Publishing.

## Development

```bash
bun install
bun run --filter goal-proof build
bun run --filter goal-proof typecheck
bun run --filter goal-proof test
```
