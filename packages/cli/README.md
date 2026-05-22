# goal-diffusion

TypeScript CLI for Goal Diffusion Goal Packs.

```bash
npm install -g goal-diffusion
```

## Commands

```bash
goal-diffusion --help
goal-diffusion <command> --help
goal-diffusion inspect <goal-pack> [--json]
goal-diffusion brief <goal-pack> [--task T###] [--json]
goal-diffusion dispatch <goal-pack> [--task T###]
goal-diffusion activate <goal-pack> --task T### [--dry-run]
goal-diffusion record <goal-pack> (--file receipt.json | --json '<json>')
goal-diffusion advance <goal-pack> [--dry-run]
goal-diffusion check <goal-pack>
```

`<goal-pack>` may be a directory or a bare goal id under
`docs/goal-diffusion/goals/`.

## Development

```bash
bun install
bun run --filter goal-diffusion build
bun run --filter goal-diffusion typecheck
bun run --filter goal-diffusion test
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

## 中文

`goal-diffusion` 是 Goal Pack 的 TypeScript CLI。

安装：

```bash
npm install -g goal-diffusion
```

发布前验证：

```bash
bun run check
bun run pack:dry
```

发布从仓库根目录执行：

```bash
bun run release:check patch
bun run release patch
```

`bun run release:check` 只做发布前 git 预检测，不改文件。
`bun run release` 在临时本地 release 分支写版本、提交并打 tag，只 push tag。
GitHub Actions 通过 npm Trusted Publishing 发布。
