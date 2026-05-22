# Goal Diffusion

[English](README.md) | **中文**

Goal Diffusion 是一套目标驱动的长期 agent 任务方法论。

它适用于任何类型的项目：从 0 到 1 做 MVP、新功能、迁移、重构、排障、审计、研究探索、文档治理、工具链建设。
区别不在于“能不能用”，而在于不同项目的边界、验证方式和停止条件不同。

它解决的问题很具体：当一个任务需要 agent 长时间持续推进时，怎样让目标越来越清楚、路径越来越可验证，同时不把 agent 绑死在过早写好的实施细节里。

## Diffusion 类比

这里的 Diffusion 类比扩散模型的“从低精度到高精度”。

一开始，你可能只有几个很粗的大目标节点。随着工作推进，两个较远的目标节点之间会补进更小、更清晰的目标节点。目标图从稀疏变密，从模糊变清楚。

```text
粗目标 -> 中间目标 -> 更小目标 -> 可验证目标
```

这些目标节点之间的连线，就是 Harness Path：一条从当前目标走向下一个目标的可验证路径。
每条 Harness Path 都必须有验证方式，可以是测试脚本、构建命令、截图、人工验收清单、日志采集、数据对比，或其他能证明路径成立的手段。

## 目标驱动，而不是实施细节驱动

传统 Spec-driven AI Coding 往往在规划阶段和 agent 对齐“怎么做”。这在一些场景有效，但也容易把大量精力花在提前约束实施细节上。

Goal Diffusion 把重心移到这些问题：

- 要达到什么目标？
- 目标边界是什么？
- 怎样验证目标已经达成？
- 什么时候应该停止、推进或回到人类确认？

这样做不是不要规划，而是避免用过细的实施计划浪费强模型的自主实施能力。只要目标、边界、验证和停止条件清楚，agent 可以自己选择具体路径，并用证据持续校准。

## 核心对象

| 术语 | 人话 |
| --- | --- |
| Goal Node | 一个可描述、可验收的目标点 |
| Goal Plan | 目标合同的生成或修复阶段，产物主要是 `contract.yaml` |
| Harness Path | 连接两个目标点的可验证路径 |
| Validation | 证明路径成立的测试、检查、采集或验收方式 |
| Receipt | 完成一次验证后留下的证据记录 |
| Goal Pack | 项目里承载一个长期目标的文件夹 |
| `contract.yaml` | 目标、范围、约束、验收方式 |
| `state.yaml` | 当前进度和下一步允许做的小工作 |
| `receipts.jsonl` | 完成工作后追加的验证证据 |
| `implementation-plan.md` | 只给高风险工作用的执行计划 |

## 运行方式

Goal Diffusion 每轮只问一个问题：下一步最小可验证、同时又能推进目标的工作是什么？

```text
目标和边界 -> contract -> Harness Path -> state -> 验证 -> receipt -> 下一目标 | 审计
```

这个循环刻意保持窄。它不要求一开始生成完整任务树，而是先锁住目标和边界，再找一条能验证的路径，做一段有用工作，留下证据，然后继续细化目标图。

## 安装

先安装 CLI。CLI 负责查看目标状态、列出 todo 和 done、生成简报、记录证据、推进状态和检查一致性。

```bash
npm install -g goal-diffusion
goal-diffusion --help
```

再安装 Agent Skill。Skill 负责把这套方法论交给 agent 执行：创建或更新目标文件夹、寻找 Harness Path、验证、记录 receipt，并决定下一步。

推荐安装整套 Goal Diffusion skills：

```bash
npx skills add https://github.com/yoyooyooo/goal-diffusion -g --agent '*' --skill '*' --full-depth -y
```

如果只给 Codex 安装：

```bash
npx skills add https://github.com/yoyooyooo/goal-diffusion -g --agent codex --skill '*' --full-depth -y
```

## 如何使用

安装后，用户不需要手动创建 Goal Pack 或维护 `contract.yaml` / `state.yaml`。把目标交给 agent，并明确使用 `$goal-diffusion` 即可。

开始一个长期目标时，给 agent 这些信息就够：

```text
使用 $goal-diffusion：
目标：我要达到什么结果……
背景：项目当前情况是……
边界：哪些不能改、哪些必须遵守……
验收：怎样算完成……
停止条件：遇到什么必须回来问我……
```

agent 会在项目内创建或更新 `docs/goal-diffusion/goals/<goal-id>`，并用 CLI 做状态检查、简报、记录和推进。

## 和 agent 对齐

用户负责说清目标、边界、验收和停止条件。agent 负责把这些输入编译成 Goal Plan，并落到 Goal Pack 文件里。

这里的 Goal Plan 不是“详细实施步骤清单”，而是目标合同：要达成什么、范围在哪里、怎样验证、什么时候停下来。它主要落在 `contract.yaml`。

对齐完成后，agent 会继续找第一条 Harness Path，并写入 `state.yaml`。如果目标还太模糊，agent 应该先追问；如果边界和验收足够清楚，agent 应该开始找可验证路径。

## 滚动实施

让 agent 长时间运行，不能只靠一句“继续做”。目标太近，agent 会做一点就回来确认；目标太远，实施过程又会失控。

Goal Diffusion 的做法是：给 agent 一个足够远的目标作为方向，同时不断在目标图里补充更小、更清晰的目标节点。agent 每次只沿着一条可验证的 Harness Path 推进。

```text
brief -> work -> verify -> receipt -> advance -> continue or block
```

每轮结束时，agent 都要回答：

- 这一步是否已经验证？
- 证据是什么？
- 下一步是否仍在 contract 边界内？

如果答案成立，就记录 receipt 并继续推进。如果遇到越界、缺权限、验证失败、目标不清或没有诚实可验证路径，就停止并汇报 block。

这就是滚动实施：不是一次性写完整计划，也不是每做一点就问人，而是在目标、验证、证据和停止条件之间持续滚动。

## 配合 Codex `/goal` 使用

Goal Diffusion 负责保存长期目标状态；Codex `/goal` 负责把一次执行交给 agent 长时间推进。

常用短提示词：

```text
/goal 使用 $goal-diffusion：读取 `goal-diffusion brief <goal-id>`，完成当前 active task，验证后记录 receipt 并 advance；能继续就继续，遇到越界、缺权限、验证失败或目标不清就停止汇报。
```

更完整的提示词：

```text
/goal 使用 $goal-diffusion：
执行 `goal-diffusion brief <goal-id>` 获取当前简报。
按简报完成当前 active task。
完成后运行必要验证。
记录 receipt，并执行 advance 推进状态。
如果下一步仍在 contract 内，继续滚动实施。
如果越界、缺权限、验证失败、目标不清或没有可验证路径，停止并汇报 block。
```

这里的 `brief` 是当前目标的执行简报，不是完整项目计划。Codex 读取它之后，应按 Goal Diffusion 的规则执行、验证、记录和推进。

## 五个 skill 的关系

用户日常只需要点名 `$goal-diffusion`。其余四个是阶段 skill，由 agent 按状态调用；高级用户才需要直接点名阶段 skill。

| Skill | 什么时候用 | 作用 |
| --- | --- | --- |
| `goal-diffusion` | 用户日常点名 | 总入口，判断现在该进入哪个阶段 |
| `goal-plans` | 没有 Goal Pack，或目标合同不清楚 | 生成或修复 `contract.yaml` |
| `finding-harnessed-path` | 没有可验证下一步 | 找 Harness Path，写入 `state.yaml.current_edge` |
| `diffusion-implementation` | 已有 active task | 执行、验证、记录 receipt、advance，并在边界内继续 |
| `write-implementation-plans` | 高风险任务 | 先写 `implementation-plan.md`，再执行 |

高风险通常包括迁移、安全、公共 API/schema/protocol、不可逆数据、严格多 agent 协调，或回滚代价很高的任务。

## 快速查看

这些命令主要给人类或 agent 查看当前状态：

```bash
goal-diffusion summary .
goal-diffusion list . --completion todo
goal-diffusion inspect <goal-pack> --json
goal-diffusion brief <goal-pack>
```

在含有 `docs/goal-diffusion/goals/<goal-id>` 的项目内，可以直接传裸 goal id；也可以传目标文件夹。

## CLI

```bash
goal-diffusion --help
goal-diffusion <command> --help
goal-diffusion inspect <goal-pack> [--json]
goal-diffusion summary [project-root|goals-dir] [--completion all|todo|done] [--status <status>] [--json]
goal-diffusion list [project-root|goals-dir] [--completion all|todo|done] [--status <status>] [--json]
goal-diffusion brief <goal-pack> [--task T###] [--json]
goal-diffusion dispatch <goal-pack> [--task T###]
goal-diffusion activate <goal-pack> --task T### [--dry-run]
goal-diffusion record <goal-pack> (--file receipt.json | --json '<json>')
goal-diffusion advance <goal-pack> [--dry-run]
goal-diffusion check <goal-pack>
```

`<goal-pack>` 可以是目标文件夹，也可以是裸 goal id。裸 id 会从当前目录向上解析到 `docs/goal-diffusion/goals/<goal-id>`。
`summary` 可接收项目根目录或 `docs/goal-diffusion/goals` 目录；不传参数时从当前目录向上查找。
`--completion todo` 表示 status 既不是 `done` 也不是 `retired`；`--status` 过滤原始目标 status。

典型循环：

```text
check -> inspect -> brief -> work -> record -> advance -> check
```

只有在把当前或选中的任务交给另一个 agent 时才使用 `dispatch`。

## 目标文件夹结构

```text
docs/goal-diffusion/
  README.md
  inbox/
  sources/
  goals/<goal-id>/
    contract.yaml
    state.yaml
    receipts.jsonl
    implementation-plan.md  # 仅 plan_required 时存在
    notes/
```

`contract.yaml` 定义目标和边界。`state.yaml` 记录当前进度和下一步允许做的任务。`receipts.jsonl` 保存追加式证据。`notes/` 只在需要时保存长上下文。
`implementation-plan.md` 只在被选中的 `plan_required` 任务需要先审执行计划时存在。

## 仓库结构

```text
packages/cli/                   TypeScript CLI，使用 Bun 构建
skills/goal-diffusion/          入口 skill
skills/goal-plans/              合同编写 skill
skills/finding-harnessed-path/  下一步选择 skill
skills/diffusion-implementation/ 工作执行 skill
skills/write-implementation-plans/ plan-required 工作 skill
```

CLI 包发布名为 `goal-diffusion`。

## 发布

发布由 tag 驱动，通过 GitHub Actions 和 npm Trusted Publishing 完成。先配置一次 npm package trusted publisher：

- Repository：本 GitHub 仓库。
- Workflow：`.github/workflows/publish.yml`。
- Environment：`npm-publish`。

```bash
bun run release:check patch
bun run release patch
# 或
bun run release 0.2.0
```

`bun run release:check` 只执行发布决策预检，不改文件：检查工作区干净、已 checkout 到分支、默认必须是 `main`，查询 npm 版本、git tag 和默认 `origin`。

发布脚本会创建临时本地 release 分支，在那里更新 `package.json`、`packages/cli/package.json` 和 `bun.lock`，提交 `chore: release vX.Y.Z`，让 `vX.Y.Z` tag 指向该提交，只 push tag，然后回到原分支。`main` 不会收到仅用于发布的版本提交。如果已有 `vX.Y.Z` tag 但 npm 没有 `X.Y.Z`，下一次发布会复用并替换失败 tag。已推送 tag 触发 GitHub Actions，运行检查、打 npm tarball，并通过 npm Trusted Publishing 发布。

包使用 `files` allowlisting，因此 npm tarball 只包含 `dist/`、`README.md`、`README.zh-CN.md`、`LICENSE` 和 package metadata。

## 开发

```bash
bun install
bun run build
bun run typecheck
bun run test
bun run check
```

CLI 源码是 TypeScript。`bun build` 将 npm 包产物输出到 `packages/cli/dist/`。

## 许可证

MIT
