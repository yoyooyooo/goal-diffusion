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
goal-diffusion brief <goal-id>
goal-diffusion check <goal-id>
```

Use `summary` and `list` at project level. Use `inspect`, `tasks`, `brief`,
`record`, `advance`, and `check` on a single goal folder.

## Commands

```bash
goal-diffusion --help
goal-diffusion <command> --help
goal-diffusion inspect <goal-pack> [--json]
goal-diffusion summary [project-root|goals-dir] [--completion all|todo|done] [--status <status>] [--json]
goal-diffusion list [project-root|goals-dir] [--completion all|todo|done] [--status <status>] [--json]
goal-diffusion tasks <goal-pack> [--completion all|todo|done] [--status queued|active|blocked|done] [--json]
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
