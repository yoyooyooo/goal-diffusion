# goal-diffusion

**English** | [中文](README.zh-CN.md)

CLI for checking progress, reading next steps, and recording evidence for Goal
Diffusion work.

Use it inside any project that stores Goal Diffusion goal folders under
`docs/goal-diffusion/goals/<goal-id>`. It answers the operational questions
first: which goals exist, which are done, which are still todo, what next step is
active, and whether the files are consistent.

```bash
npm install -g goal-diffusion
```

## Common Flow

```bash
goal-diffusion summary .
goal-diffusion list . --completion todo
goal-diffusion inspect <goal-id>
goal-diffusion tasks <goal-id>
goal-diffusion receipts list <goal-id> --limit 5
goal-diffusion relations check . --thread <thread-id>
goal-diffusion brief <goal-id>
goal-diffusion check <goal-id>
```

Use `summary` and `list` at project level. Use `inspect`, `tasks`, `receipts`,
`brief`, `record`, `advance`, and `check` on a single goal folder.
Use `relations` at project or goals-directory level to inspect and verify
cross-pack continuity metadata.

## Commands

```bash
goal-diffusion --help
goal-diffusion <command> --help
goal-diffusion inspect <goal-pack> [--json]
goal-diffusion summary [project-root|goals-dir] [--completion all|todo|done] [--status <status>] [--json]
goal-diffusion list [project-root|goals-dir] [--completion all|todo|done] [--status <status>] [--json]
goal-diffusion tasks <goal-pack> [--completion all|todo|done] [--status queued|active|blocked|done] [--json]
goal-diffusion receipts list <goal-pack> [--limit N] [--task T###] [--type <type>] [--result done|blocked] [--decision <value>] [--next-decision <value>] [--oracle-satisfied true|false] [--changed-file <glob>] [--command-status pass|fail] [--contains <text>] [--json]
goal-diffusion receipts show <goal-pack> --index N [--json]
goal-diffusion relations list [project-root|goals-dir] [--thread <id>] [--json]
goal-diffusion relations check [project-root|goals-dir] [--thread <id>] [--json]
goal-diffusion relations graph [project-root|goals-dir] [--thread <id>] [--json]
goal-diffusion brief <goal-pack> [--task T###] [--json]
goal-diffusion dispatch <goal-pack> [--task T###]
goal-diffusion activate <goal-pack> --task T### [--dry-run]
goal-diffusion record <goal-pack> (--file receipt.json | --json '<json>')
goal-diffusion advance <goal-pack> [--dry-run]
goal-diffusion check <goal-pack>
```

`<goal-pack>` may be a directory or a bare goal id under
`docs/goal-diffusion/goals/`.
`summary` accepts a project root or `docs/goal-diffusion/goals` directory, and
defaults upward from the current directory.
For `summary` and `list`, `--completion todo` means goal status is neither
`done` nor `retired`, and `--status` filters raw Goal Pack status.
For `tasks`, `--completion todo` means task status is not `done`, and `--status`
filters raw task status.
For `receipts list`, filters compose with AND semantics and output compact
receipt summaries by default. Use `receipts show --index N` to expand one full
receipt.
For `relations`, `list` shows relation metadata, `check` validates hard relation
evidence, and `graph` renders a derived view. `--thread` filters by
`goal_relations.thread_id`; the commands do not create thread files or graph
state.

Typical execution loop:

```text
check -> inspect -> brief -> work -> record -> advance -> check
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
bun run --filter goal-diffusion build
bun run --filter goal-diffusion typecheck
bun run --filter goal-diffusion test
```
