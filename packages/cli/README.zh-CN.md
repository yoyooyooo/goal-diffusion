# goal-diffusion

[English](README.md) | **中文**

用于查看进度、读取下一步、记录证据的 Goal Diffusion CLI。

在任何把 Goal Diffusion 目标文件夹放到 `docs/goal-diffusion/goals/<goal-id>` 的项目内都可使用。CLI 先回答运行问题：项目里有哪些目标、哪些已完成、哪些待办、当前下一步是什么、文件是否一致。

```bash
npm install -g goal-diffusion
```

## 常用流程

```bash
goal-diffusion summary .
goal-diffusion list . --completion todo
goal-diffusion inspect <goal-id>
goal-diffusion tasks <goal-id>
goal-diffusion receipts list <goal-id> --limit 5
goal-diffusion brief <goal-id>
goal-diffusion check <goal-id>
```

`summary` 和 `list` 面向项目级使用。`inspect`、`tasks`、`receipts`、`brief`、`record`、`advance` 和 `check` 面向单个目标文件夹。

## 命令

```bash
goal-diffusion --help
goal-diffusion <command> --help
goal-diffusion inspect <goal-pack> [--json]
goal-diffusion summary [project-root|goals-dir] [--completion all|todo|done] [--status <status>] [--json]
goal-diffusion list [project-root|goals-dir] [--completion all|todo|done] [--status <status>] [--json]
goal-diffusion tasks <goal-pack> [--completion all|todo|done] [--status queued|active|blocked|done] [--json]
goal-diffusion receipts list <goal-pack> [--limit N] [--task T###] [--type <type>] [--result done|blocked] [--decision <value>] [--next-decision <value>] [--oracle-satisfied true|false] [--changed-file <glob>] [--command-status pass|fail] [--contains <text>] [--json]
goal-diffusion receipts show <goal-pack> --index N [--json]
goal-diffusion brief <goal-pack> [--task T###] [--json]
goal-diffusion dispatch <goal-pack> [--task T###]
goal-diffusion activate <goal-pack> --task T### [--dry-run]
goal-diffusion record <goal-pack> (--file receipt.json | --json '<json>')
goal-diffusion advance <goal-pack> [--dry-run]
goal-diffusion check <goal-pack>
```

`<goal-pack>` 可以是目录，也可以是 `docs/goal-diffusion/goals/` 下的裸 goal id。
`summary` 可接收项目根目录或 `docs/goal-diffusion/goals` 目录；不传参数时从当前目录向上查找。
对 `summary` 和 `list`，`--completion todo` 表示 goal status 既不是 `done` 也不是 `retired`，`--status` 过滤原始 Goal Pack status。
对 `tasks`，`--completion todo` 表示 task status 不是 `done`，`--status` 过滤原始 task status。
对 `receipts list`，多个过滤条件按 AND 组合，默认输出 compact receipt 摘要。需要展开单条完整 receipt 时使用 `receipts show --index N`。

典型执行环：

```text
check -> inspect -> brief -> work -> record -> advance -> check
```

## 发布

从仓库根目录执行发布：

```bash
bun run release:check patch
bun run release patch
# 或
bun run release 0.2.0
```

`bun run release:check` 验证发布所需 git 状态，不改文件。
`bun run release` 在临时本地 release 分支写版本，给该提交打 tag，并且只 push tag。GitHub Actions 通过 npm Trusted Publishing 发布。

## 开发

```bash
bun install
bun run --filter goal-diffusion build
bun run --filter goal-diffusion typecheck
bun run --filter goal-diffusion test
```
