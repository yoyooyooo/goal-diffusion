# Goal Diffusion

Goal Diffusion is a Goal Pack operating loop for long-running AI coding work.

It keeps the original goal visible, finds the first falsifiable path, runs a
useful verified slice, records evidence, and continues only while the next step
stays inside the human-owned contract.

```text
human target + authority -> contract -> harnessed edge -> state -> receipt -> next edge | audit
```

## Why It Exists

Large agentic coding work often fails in two ways: a speculative task tree is
written before the system has evidence, or the agent stops after tiny helper
slices that do not move the owner outcome.

Goal Diffusion separates the two decisions:

```text
Find path small.
Execute slice useful.
```

The path must be falsifiable. The slice must move the outcome: a working screen,
API path, data path, real bug fix, migration slice, milestone review, or harness
that proves the current edge.

## Repository Layout

```text
packages/cli/                   TypeScript CLI, built with Bun
skills/goal-diffusion/          Controller skill
skills/goal-plans/              Contract phase skill
skills/finding-harnessed-path/  Edge phase skill
skills/diffusion-implementation/ Run phase skill
skills/write-implementation-plans/ Plan-required phase skill
```

The controller skill is stored at `skills/goal-diffusion/`. Phase skills are
flat under `skills/` so skill loaders can discover them directly. The CLI
package is published as `goal-diffusion`.

## Skill Source Of Truth

For Goal Diffusion skill content, this repository is the development source of
truth. Edit these directories here first:

```text
skills/goal-diffusion/
skills/goal-plans/
skills/finding-harnessed-path/
skills/diffusion-implementation/
skills/write-implementation-plans/
```

`~/Documents/code/personal/personal-skills` remains the machine-wide
skillshare source of truth for distribution to runtime targets such as
`~/.agents/skills` and `~/.claude/skills`.

Sync direction:

```text
goal-diffusion repo skills/* -> personal-skills root skill dirs -> skillshare targets
```

Do not edit the mirrored Goal Diffusion skill dirs in `personal-skills` as the
long-lived source. Promote changes from this repo instead, then run
`skillshare sync -g` or `skillshare sync --force -g` from `personal-skills`.

Safe manual sync from this repo:

```bash
for d in goal-diffusion goal-plans finding-harnessed-path diffusion-implementation write-implementation-plans; do
  test -d "skills/$d" || exit 1
  rsync -ain --delete "skills/$d/" "$HOME/Documents/code/personal/personal-skills/$d/"
done

for d in goal-diffusion goal-plans finding-harnessed-path diffusion-implementation write-implementation-plans; do
  test -d "skills/$d" || exit 1
  rsync -a --delete "skills/$d/" "$HOME/Documents/code/personal/personal-skills/$d/"
done
```

After adding, removing, or renaming a skill directory, update
`personal-skills/skill-manager/references/scene-profiles.json`, refresh the
active scene, and sync distribution targets.

## Install

```bash
npm install -g goal-diffusion
```

For local development:

```bash
bun install
bun run check
bun run --filter goal-diffusion build
bun run install:local
```

## CLI

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

`<goal-pack>` may be either a Goal Pack directory or a bare goal id. Bare ids
are resolved upward from the current directory through
`docs/goal-diffusion/goals/<goal-id>`.

Typical loop:

```text
check -> inspect -> brief -> work -> record -> advance -> check
```

Use `dispatch` only when handing the active or selected task to another agent.

## Goal Pack Shape

```text
docs/goal-diffusion/
  README.md
  inbox/
  sources/
  goals/<goal-id>/
    contract.yaml
    state.yaml
    receipts.jsonl
    notes/
specs/<goal-id>/implementation-spec.md
```

`contract.yaml` is the human-owned goal node. `state.yaml` is the agent's
operating memory. `receipts.jsonl` is append-only evidence. `notes/` stores
long-form context only when needed.

## Skill

Use the skill from:

```text
skills/goal-diffusion/SKILL.md
```

Flat phase skills:

- `skills/goal-plans/`: compile or repair `contract.yaml`.
- `skills/finding-harnessed-path/`: write `state.yaml.current_edge`.
- `skills/diffusion-implementation/`: run, verify, receipt, advance, continue.
- `skills/write-implementation-plans/`: create an implementation spec only for
  high-risk selected slices.

The skill follows progressive disclosure: the controller stays compact, and
details live in `skills/goal-diffusion/references/`.

## Development

```bash
bun install
bun run build
bun run typecheck
bun run test
bun run check
```

The CLI source is TypeScript. `bun build` emits the npm package artifacts under
`packages/cli/dist/`.

## Release

Publishing is tag-driven through GitHub Actions and npm Trusted Publishing.
Configure the npm package trusted publisher once:

- Repository: this GitHub repository.
- Workflow: `.github/workflows/publish.yml`.
- Environment: `npm-publish`.

```bash
bun run release:check patch
bun run release patch
# or
bun run release 0.2.0
```

`bun run release:check` runs the release decision without changing files:
clean working tree, checked-out branch, `main` unless `--allow-branch`, npm
version lookup, git tag lookup, and `origin` unless `--no-push`.

The release script creates a temporary local release branch, updates
`package.json`, `packages/cli/package.json`, and `bun.lock` there, commits
`chore: release vX.Y.Z`, creates the `vX.Y.Z` tag on that commit, pushes only the
tag, then returns to the original branch. `main` does not receive a release-only
version commit. If a previous `vX.Y.Z` tag exists but npm does not contain
`X.Y.Z`, the next release reuses and replaces that failed tag. The pushed tag
triggers GitHub Actions, which runs checks, packs the npm tarball, and publishes
with npm Trusted Publishing.

The package uses `files` allowlisting, so the npm tarball contains only
`dist/`, `README.md`, `LICENSE`, and package metadata.

## License

MIT

---

## 中文

Goal Diffusion 是面向长期 AI 编码任务的 Goal Pack 运行环。

它不先写完整任务树，而是保留原始目标，寻找第一个可证伪路径，执行一个有用且可验证的切片，记录证据，然后只在仍处于人类定义的合同边界内时继续。

核心规则：

```text
Find path small.
Execute slice useful.
```

仓库结构：

```text
packages/cli/                   TypeScript CLI，使用 Bun 构建
skills/goal-diffusion/          总入口 skill
skills/goal-plans/              contract phase skill
skills/finding-harnessed-path/  edge phase skill
skills/diffusion-implementation/ run phase skill
skills/write-implementation-plans/ plan-required phase skill
```

Skill 真源口径：

- 本仓是 Goal Diffusion skill 内容的开发真源。
- `~/Documents/code/personal/personal-skills` 是本机 skillshare 分发真源。
- 同步方向固定为：`本仓 skills/* -> personal-skills 根级 skill 目录 -> runtime targets`。
- 不把 `personal-skills` 里的 Goal Diffusion 镜像当长期编辑源；要改先改本仓，再提升过去。

安装：

```bash
npm install -g goal-diffusion
```

本地开发：

```bash
bun install
bun run check
bun run install:local
```

常用命令：

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

`<goal-pack>` 可传完整目录，也可传 goal id；CLI 会从当前目录向上查
`docs/goal-diffusion/goals/<goal-id>`。

发布：

```bash
bun run release:check patch
bun run release patch
# 或
bun run release 0.2.0
```

`bun run release:check` 只做发布决策预检，不改文件：工作区干净、已
checkout 到分支、默认必须是 `main`、查询 npm 版本、查询 git tag、默认存在
`origin`。

脚本会创建临时本地 release 分支，在那里更新版本和 `bun.lock`，提交
`chore: release vX.Y.Z`，把 `vX.Y.Z` tag 指向该提交，只 push tag，然后回到
原分支。`main` 不产生发布版本提交。如果已有 `vX.Y.Z` tag 但 npm 没有
`X.Y.Z`，下一次发布会复用并替换这个失败 tag。GitHub Actions 收到 tag 后跑
检查、pack dry-run，并通过 npm Trusted Publishing 发布。npm 侧需先配置
Trusted Publishing：workflow 用 `.github/workflows/publish.yml`，environment
用 `npm-publish`。
