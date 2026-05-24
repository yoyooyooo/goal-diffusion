![](https://github.com/yoyooyooo/goal-diffusion/raw/main/assets/banner.png)
[English](README.md) | **中文**

# Goal Diffusion

Goal Diffusion 是一套面向高智能 agent 的长期 AI coding 方法论和工作流。

它适用于新项目、老项目、功能开发、迁移、重构、排障、审计、研究探索、文档治理和工具链建设。区别不在于“能不能用”，而在于不同项目需要不同的边界、验证方式、证据强度和停止条件。

Goal Diffusion 的目标不是把强 agent 关进表格，而是给它清晰跳板：

```text
目标不漂移
路径可验证
过程可滚动
完成可解释
高风险可升级
```

默认姿态是强 agent optimistic workflow：相信 agent 能自主实施，但要求它在目标、边界、证据和完成声明上保持诚实。

## 核心思想

传统 Spec-driven AI Coding 往往在规划阶段和 agent 对齐“怎么做”。这在一些场景有效，但也容易把强模型过早锁死在实施细节里。

Goal Diffusion 把重心移到这些问题：

- 要达到什么目标？
- 目标边界是什么？
- 当前最小可验证推进路径是什么？
- 完成声明需要回扣哪些证据？
- 什么时候应该继续、升级计划、阻塞或回到人类确认？

它不是不要规划，而是不默认写完整任务树。agent 只要目标授权、边界、验证和停止条件清楚，就应该自主选择实现路径，并用 receipt 持续校准。

## Diffusion 类比

这里的 Diffusion 类比“从低精度目标到高精度目标”。

一开始，你可能只有一个较粗的目标。随着执行推进，agent 会在目标和现实之间补出更小、更清晰、可验证的中间节点。

```text
粗目标 -> 当前 edge -> 有证据的状态变化 -> 更清晰的下一步
```

这些节点之间的连线是 Harness Path：从当前状态走向更清晰状态的可验证路径。验证可以是测试脚本、构建命令、CLI 输出、截图、日志、人工验收清单、数据对比或其他能支撑 claim 的证据。

## 核心对象

| 对象 | 作用 |
| --- | --- |
| Goal Pack | 一个长期目标的完成单元 |
| Goal Charter | agent 对人类意图的可执行压缩和目标授权 |
| Current Edge | 当前最小可验证推进路径 |
| Check | 支撑本轮 claim 的检查；命令只是 check 的一种 |
| Receipt | 一段已执行工作的追加式证据检查点 |
| Final Audit | 完成前的证据摘要，必须回扣 completion |
| Goal Relation | Goal Pack 之间的证据关系 |
| Goal Thread | 多个 Goal Pack 共享的标签，不拥有状态 |
| `charter.yaml` | 目标授权、边界、完成标准和自主策略 |
| `state.yaml` | 当前运行态、active task、edge 和 next decision |
| `receipts.jsonl` | append-only receipts |
| `implementation-plan.md` | 仅 `plan_required` 高风险 slice 使用 |

## 最小完整流程

```text
human intent
  -> agent writes goal charter
  -> agent finds current edge
  -> agent executes largest safe useful slice
  -> agent records receipt
  -> continue | plan_required | blocked | audit
  -> final audit maps evidence to completion
  -> done
```

默认不做机器级形式化证明。完成 discipline 仍然存在：任何 `done` 都必须说明完成了哪个标准、证据在哪里、没有声明什么、剩余 gap 被路由到哪里。

## 字段等级

Goal Charter 使用字段等级，而不是把所有字段都变成必填。

```text
must    缺失则不能启动长期目标
should  强烈建议；缺失可启动，但应记录 assumption 或 warning
when    场景触发才需要
strict  仅 evidence_mode: strict 时需要
```

默认字段口径：

```yaml
id:
status: forming | ready | running | blocked | done | retired

intent:
  source:
  interpreted_as:
  assumptions: []
  open_questions: []

objective:
north_star:

authority_refs: []

engineering_guidance:
  standards: []
  architecture_notes: []
  quality_bar:
  preferred_harness:

constraints: []
non_goals: []

completion:
  signal:
  final_proof:

claim_boundary:
stop_rules: []

autonomy:
  continue_by_default: true
  agent_may_revise:
    - next_slice
    - task_order
    - harness_strength
    - implementation_shape
  cannot_silently_change:
    - objective
    - completion
    - claim_boundary
    - stop_rules
    - authority_refs

evidence_mode: light | normal | strict

conditional:
  interfaces: []
  data_policy:
  security_boundary:
  migration_guard:
  release_gate:
  coordination:

strict:
  required_checks: []
  required_evidence: []
  provenance: []
```

`engineering_guidance` 是强烈建议字段，不是硬性架构合同。项目早期没有正式架构标准时，agent 可以继续，但应说明它将以现有代码结构、测试风格和最近权威文档作为工程指引。

## Evidence Mode

`light` 用于小修小补或一轮可完成的工作。可以只有一个 worker receipt 和一个 final audit。

`normal` 是长期目标默认模式。需要 receipt、checks、evidence、claims、not_claimed 和 final audit 的 `evidence_map`。

`strict` 只用于高风险场景，例如 public API/schema/protocol、安全、权限、私有数据、破坏性迁移、release/compliance、多 agent 严格协作，或 successor goal 依赖前置证据。

## 完成证明

默认 final audit 形态：

```json
{
  "task_id": "T999",
  "type": "audit",
  "result": "done",
  "decision": "complete",
  "oracle_satisfied": true,
  "evidence_map": [
    {
      "claim": "completion.final_proof",
      "evidence": []
    }
  ],
  "not_claimed": [],
  "remaining_gaps": [],
  "summary": "",
  "next_decision": "done"
}
```

这不是形式化 proof，而是完成理由压缩。它回答：

- 哪个 `completion.final_proof` 被满足？
- 哪些 receipt / check / evidence 支撑它？
- 本次没有声明什么？
- 剩余 gap 是删除、放入 inbox、创建 successor，还是进入最近实现 artifact？

## 滚动实施

Goal Diffusion 每轮只问一个问题：当前最小可验证、同时又能推进目标的 edge 是什么？

```text
charter -> edge -> work -> check -> receipt -> continue | plan_required | blocked | audit
```

edge phase 找最小可验证路径。run phase 执行最大安全有用 slice。这样不会把任务切成无意义小块，也不会一开始写完整任务树。

agent 默认继续推进。只有以下情况才停：

- 无法命名诚实可验证路径；
- 需要静默改变 objective、completion、claim_boundary、stop_rules 或 authority_refs；
- 触发安全、权限、私有数据、public API/schema/protocol、破坏性数据或 compliance 边界；
- 验证反复失败且修复会越界。

## `implementation-plan.md`

`implementation-plan.md` 只在 `plan_required` 时存在。

典型触发：

- public API / schema / protocol；
- security / permissions / private data；
- destructive migration；
- release / compliance；
- 多 agent 严格协作；
- 错一步回滚成本很高。

它不是第二套任务系统。plan receipt 只声明“执行计划已就绪”，不声明目标完成。计划就绪后回到 rolling implementation。

## Goal Relations

Goal Relations 连接彼此独立的 Goal Pack，但不引入新的规划对象。Goal Pack 仍然是完成单位：一个 objective、一个 completion、一个 state 文件、一条 append-only receipt 链。

Goal Thread 只是共享标签。它没有自己的生命周期、任务列表、状态文件、receipt 流、注册表或存储图。

graph 是检查时从 Goal Relations 派生出来的视图，不作为规划状态写入仓库。

## 当前迁移状态

本 README 使用未来 v1 口径：`charter.yaml`、`completion`、`engineering_guidance`、`checks`、`evidence_map`。

当前 CLI、templates、skills、checker、tests、README 和 dogfood Goal Pack 主路径已使用 v1 口径。旧口径只应出现在归档 source 或迁移 receipts 中，用于保留证据链。

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

开始一个长期目标时，给 agent 这些信息即可：

```text
使用 $goal-diffusion：
目标：我要达到什么结果……
背景：项目当前情况是……
边界：哪些不能改、哪些必须遵守……
验收：怎样算完成……
停止条件：遇到什么必须回来问我……
```

agent 会在项目内创建或更新 `docs/goal-diffusion/goals/<goal-id>`，并用 CLI 做状态检查、简报、记录和推进。执行 agent 默认信任 charter；只有发现意图误解、completion 不可验证、边界必须改变或风险升级时才 repair charter。

## 五个 skill 的关系

用户日常只需要点名 `$goal-diffusion`。其余四个是阶段 skill，由 agent 按状态调用；高级用户才需要直接点名阶段 skill。

| Skill | 什么时候用 | 未来职责 |
| --- | --- | --- |
| `goal-diffusion` | 用户日常点名 | 总入口，判断当前应进入哪个阶段 |
| `goal-plans` | 没有 Goal Pack，或目标授权不清楚 | 生成或修复 `charter.yaml` |
| `finding-harnessed-path` | 没有可验证下一步 | 找 current edge，写入 `state.yaml.current_edge` |
| `diffusion-implementation` | 已有 active task | 执行、验证、记录 receipt、advance，并在边界内继续 |
| `write-implementation-plans` | 高风险任务 | 写 `implementation-plan.md`，计划就绪后回到执行 |

## 快速查看

这些命令主要给人类或 agent 查看当前状态：

```bash
goal-diffusion summary .
goal-diffusion list . --completion todo
goal-diffusion inspect <goal-pack> --json
goal-diffusion tasks <goal-pack>
goal-diffusion receipts list <goal-pack> --limit 5
goal-diffusion relations goals . --thread <thread-id> --completion todo --json
goal-diffusion relations tasks . --thread <thread-id> --completion todo --json
goal-diffusion brief <goal-pack>
```

Relations 命令用于检查跨 Goal Pack 连续性，也用于发现 thread 成员候选 goal/task。它不创建队列、worklist、scheduler、thread 生命周期或执行顺序。

## CLI

```bash
goal-diffusion --help
goal-diffusion <command> --help
goal-diffusion inspect <goal-pack> [--json]
goal-diffusion summary [project-root|goals-dir] [--completion all|todo|done] [--status <status>] [--depth repo|groups|items] [--limit N] [--include fields] [--show-empty] [--json]
goal-diffusion list [project-root|goals-dir] [--completion all|todo|done] [--status <status>] [--limit N] [--include fields] [--show-empty] [--json]
goal-diffusion tasks <goal-pack> [--completion all|todo|done] [--status queued|active|blocked|done] [--limit N] [--include fields] [--show-empty] [--json]
goal-diffusion receipts list <goal-pack> [--limit N] [--task T###] [--type <value>] [--result done|blocked] [--decision <value>] [--next-decision <value>] [--oracle-satisfied true|false] [--changed-file <glob>] [--command-status pass|fail] [--contains <text>] [--include fields] [--show-empty] [--json]
goal-diffusion receipts show <goal-pack> --index N [--json]
goal-diffusion relations list [project-root|goals-dir] [--thread <id>] [--limit N] [--include fields] [--show-empty] [--json]
goal-diffusion relations goals [project-root|goals-dir] [--thread <id>] [--completion all|todo|done] [--status forming|ready|running|blocked|done|retired] [--next-decision edge|continue|plan_required|blocked|audit|done|needs-human] [--limit N] [--include fields] [--show-empty] [--json]
goal-diffusion relations tasks [project-root|goals-dir] [--thread <id>] [--completion all|todo|done] [--status queued|active|blocked|done] [--goal-completion all|todo|done] [--goal-status forming|ready|running|blocked|done|retired] [--goal <goal-id>] [--limit N] [--include fields] [--show-empty] [--json]
goal-diffusion relations check [project-root|goals-dir] [--thread <id>] [--json]
goal-diffusion relations graph [project-root|goals-dir] [--thread <id>] [--json]
goal-diffusion brief <goal-pack> [--task T###] [--json]
goal-diffusion dispatch <goal-pack> [--task T###]
goal-diffusion activate <goal-pack> --task T### [--dry-run]
goal-diffusion record <goal-pack> (--file receipt.json | --json '<json>' | --stdin)
goal-diffusion advance <goal-pack> [--dry-run]
goal-diffusion check <goal-pack>
```

典型循环：

```text
check -> inspect -> brief -> work -> record -> advance -> check
```

只有在把当前或选中的任务交给另一个 agent 时才使用 `dispatch`。

## 目标文件夹结构

未来目标结构：

```text
docs/goal-diffusion/
  README.md
  inbox/
  sources/
  goals/<goal-id>/
    charter.yaml
    state.yaml
    receipts.jsonl
    implementation-plan.md  # 仅 plan_required 时存在
    notes/
```

历史 dogfood Goal Pack 已按 v1 结构保留为 `charter.yaml`、`state.yaml`、`receipts.jsonl`。后续迁移 schema 时仍应同步更新 skills、CLI checker、README、测试和历史示例，不应只替换文件名。

## 仓库结构

```text
packages/cli/                    TypeScript CLI，使用 Bun 构建
skills/goal-diffusion/           入口 skill
skills/goal-plans/               目标授权编写 skill（命名待收敛）
skills/finding-harnessed-path/   下一步选择 skill
skills/diffusion-implementation/ 工作执行 skill
skills/write-implementation-plans/ plan-required 工作 skill
docs/                            文档治理与方法论分层入口
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
