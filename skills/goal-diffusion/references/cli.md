# Goal Diffusion CLI

Install and inspect:

```bash
npm install -g goal-diffusion
goal-diffusion --help
goal-diffusion <command> --help
```

Read commands:

```bash
goal-diffusion inspect <goal-pack> [--json]
goal-diffusion summary [project-root|goals-dir] [--completion all|todo|done] [--status <status>] [--depth repo|groups|items] [--limit N] [--include fields] [--show-empty] [--json]
goal-diffusion list [project-root|goals-dir] [--completion all|todo|done] [--status <status>] [--limit N] [--include fields] [--show-empty] [--json]
goal-diffusion tasks <goal-pack> [--completion all|todo|done] [--status queued|active|blocked|done] [--limit N] [--include fields] [--show-empty] [--json]
goal-diffusion receipts list <goal-pack> [--limit N] [--task T###] [--type <value>] [--result done|blocked] [--decision <value>] [--next-decision <value>] [--oracle-satisfied true|false] [--changed-file <glob>] [--command-status pass|fail] [--contains <text>] [--include fields] [--show-empty] [--json]
goal-diffusion receipts show <goal-pack> --index N [--json]
goal-diffusion brief <goal-pack> [--task T###] [--json]
goal-diffusion dispatch <goal-pack> [--task T###]
```

For repo-wide progress questions, prefer direct `list`, `summary`, `tasks`, and
`receipts list` over hand-written roadmap prose. Use `relations *` for
thread-scoped continuity, predecessor evidence, and graph checks; it is not a
replacement for direct repo-wide ready/running/done queries. A roadmap can
constrain product strategy and launch gates, but Goal Pack state and receipts
remain the source for ready / running / done and active-task claims.

State commands:

```bash
goal-diffusion activate <goal-pack> --task T### [--dry-run]
goal-diffusion record <goal-pack> (--file receipt.json | --json '<json>' | --stdin)
goal-diffusion advance <goal-pack> [--dry-run]
goal-diffusion check <goal-pack>
```

Relation commands:

```bash
goal-diffusion relations list [project-root|goals-dir] [--thread <id>] [--limit N] [--include fields] [--show-empty] [--json]
goal-diffusion relations goals [project-root|goals-dir] [--thread <id>] [--completion all|todo|done] [--status forming|ready|running|blocked|done|retired] [--next-decision edge|continue|plan_required|blocked|audit|done|needs-human] [--limit N] [--include fields] [--show-empty] [--json]
goal-diffusion relations tasks [project-root|goals-dir] [--thread <id>] [--completion all|todo|done] [--status queued|active|blocked|done] [--goal-completion all|todo|done] [--goal-status forming|ready|running|blocked|done|retired] [--goal <goal-id>] [--limit N] [--include fields] [--show-empty] [--json]
goal-diffusion relations check [project-root|goals-dir] [--thread <id>] [--json]
goal-diffusion relations graph [project-root|goals-dir] [--thread <id>] [--json]
```

`<goal-pack>` may be a directory or a bare goal id under
`docs/goal-diffusion/goals/`. `summary` and `list` accept a project root or
`docs/goal-diffusion/goals` directory.

For `summary` and `list`, `--completion todo` means goal status is neither
`done` nor `retired`, and `--status` filters raw Goal Pack status. For `tasks`,
`--completion todo` means task status is not `done`, and `--status` filters raw
task status.

For `receipts list`, filters compose with AND semantics and output compact
receipt summaries by default. Use `receipts show --index N` to expand one full
receipt.

Read JSON commands share output controls: `--limit` bounds collections,
`--include path,objective,links` restores omitted detail, and `--show-empty`
restores empty/default fields. `summary` defaults to `--depth groups` and
`--limit 20`; `--depth repo` returns only repo totals plus thread/unthreaded
counts, while `--depth items` nests threaded goal items under `threads` and
leaves only unthreaded goals in top-level `items`.

For `record`, choose exactly one input source. Use `--stdin` for heredoc receipt
JSON. `activate` and `advance` are state-transition commands, not payload input
commands.

Local development:

```bash
bun install
bun run check
```
