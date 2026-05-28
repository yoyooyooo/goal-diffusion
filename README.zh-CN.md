![](https://github.com/yoyooyooo/ai-coding-os/raw/main/assets/banner.png)

[English](README.md) | **中文**

# AI Coding OS

AI Coding OS 是一套面向高智能 agent 的 AI coding 方法论和 skill suite。
它默认相信模型能力会持续进化，所以系统不把 agent 当弱执行器，也不把
agent 锁进防御式流程表格。它提供的是边界、路由、验证路径和 claim 标准。

默认落地边界是 workspace：一个 repo、一个产品表面、一组 docs、一个目标流。
这套方法可用于 MVP、功能、迁移、重构、排障、审计、研究、文档治理和工具建设。

默认入口是 `$ai-coding-os`。它不拥有持久 artifact，只负责把工作路由到
Goal Proof System、Docs Governance、Interface Capability Planning、Product
Harness System、UI Product Harness、Headless Product Harness，或一轮内 inline 实施。

## 核心原则

```text
高智能 agent 优先
目标和边界清楚
proof path 可运行
evidence 支撑 claim
gap 显式留下
```

这不是形式化证明系统。默认口径是 strong-agent optimistic workflow：相信 agent
能自主推进，但要求它在 evidence、not_claimed、stop signal 和 completion claim 上诚实。

## Skill Suite

多数用户只需要从 `$ai-coding-os` 进入。进阶用户可直接点名某个方法或阶段 skill。

| Group | Skill | 作用 |
| --- | --- | --- |
| `router/` | `ai-coding-os` | 用户入口、意图路由、inline-vs-durable 判断 |
| `goal/` | `goal-proof` | Goal Pack、goal contract、proof step、evidence chain、completion review |
| `goal/` | `goal-contracts` | 创建或修复 `goal.yaml` |
| `goal/` | `finding-proof-step` | 寻找可证伪的 `proof_step` |
| `goal/` | `proof-step-implementation` | 执行、验证、添加 evidence、apply progress |
| `goal/` | `write-work-plans` | 为高风险 work item 写 `plans/<work_id>.md` |
| `governance/` | `docs-governance` | docs layer、SSoT、standards、ADR、roadmap、cleanup、audit |
| `capability/` | `interface-capability-planning` | UI/IA、InterfaceCapability、surface、state/data ownership、harness handoff |
| `harness/` | `product-harness-system` | harness artifact model、claim limit、coverage matrix、trace lifecycle |
| `harness/` | `ui-product-harness` | interface-headless、render wiring、browser-visible、production-near UI proof |
| `harness/` | `headless-product-harness` | proof command、smoke、fixture/replay、evidence envelope |

## Diffusion 隐喻

Goal Diffusion 只保留为隐喻：粗目标通过更小、更清楚、已验证的状态逐步变清晰。

```text
coarse goal -> proof step -> evidenced state change -> sharper next action
```

正式方法名是 Goal Proof System。正式 CLI 是 `goal-proof`。

## 核心词汇

| 词 | 含义 |
| --- | --- |
| Goal Pack | 一个长期目标的持久 completion unit |
| Goal Contract | `goal.yaml`；目标授权、边界、完成标准和 claim limit |
| Proof Step | `progress.yaml.proof_step`；当前可证伪推进步 |
| Proof Path | 支撑或证伪 proof step 的可运行/可检查路径 |
| Work Item | `progress.yaml.work_items` 内的有界工作单元，通常 `W###` |
| Evidence Record | `evidence.jsonl` 内 append-only 证据记录，通常 `E###` |
| Completion Review | 最终把 evidence 回扣到 `completion.required_evidence` 的 review evidence |
| Claim Limit | 当前目标或 proof 能声明和不能声明的范围 |
| Gap | 未覆盖 claim、缺证据、待决策或需人类介入点 |
| Goal Thread | 多个 Goal Pack 共享的 `relations.thread_id` 标签 |
| Goal Relation | Goal Pack 之间的 typed metadata link |
| Derived Graph View | CLI 从 relations 派生出来的图视图，不是存储状态 |

## Goal Proof System

Goal Proof System 是 OS 的长期目标载体。

```text
human intent
  -> goal.yaml
  -> progress.yaml proof_step
  -> work item
  -> checks
  -> evidence.jsonl evidence record
  -> apply progress
  -> proof_step | continue | needs_plan | blocked | review | done | needs_human
```

Goal Pack ready 的条件是：goal contract 稳定，且当前 `proof_step` 能证明或证伪一次有意义推进。
不是因为列了 work item 就 ready。

`plans/<work_id>.md` 只在高风险 work item 需要先审计划时出现。它不是第二套任务系统。

完成必须有 review evidence record，包含 `completion_satisfied: true`，并用
`claim_evidence` 把 completion claim 映射到 evidence。

## Goal Pack 文件

```text
docs/goal-proof/
  README.md
  inbox/
  sources/
  goals/<goal-id>/
    goal.yaml
    progress.yaml
    evidence.jsonl
    plans/<work_id>.md  # only when needs_plan
    interface-capabilities.yaml  # optional UI/interface trace companion
    product-harness.yaml  # optional harness proof companion
    notes/
```

`goal.yaml` 拥有 objective、authority refs、engineering guidance、completion、
claim limit、stop rules 和 agent authority。`progress.yaml` 拥有运行态、
active work item、proof step、blockers、last check 和 next action。`evidence.jsonl`
是 append-only evidence。`notes/` 只存长上下文。

## Interface Capability 和 Harness

UI / Harness 体系让 agent 可以从底层和界面两端验证产品能力。

```text
Product Capability
  -> InterfaceCapability
  -> InterfaceSurface / Region
  -> Interaction State Contract
  -> Frontend State/Data Ownership
  -> Harness Scenario
  -> Headless Proof and/or UI Proof
  -> Evidence
  -> Claim / Gap
```

最终 UI 未定时，仍可用 harness route、harness component、interface-headless test
或 browser-visible candidate path 先证明局部链路。正式界面稳定后，可复用 proof path
再提升为 regression。

持久放置：

- 项目级界面 trace：`docs/interface-capabilities/**`
- 项目级 harness contract：`docs/product-harness/**`
- Goal-local interface companion：`docs/goal-proof/goals/<goal-id>/interface-capabilities.yaml`
- Goal-local harness companion：`docs/goal-proof/goals/<goal-id>/product-harness.yaml`

## 安装

安装 CLI：

```bash
npm install -g goal-proof
goal-proof --help
```

安装全套 AI Coding OS skills：

```bash
npx skills add https://github.com/yoyooyooo/ai-coding-os -g --agent '*' --skill '*' --full-depth -y
```

Codex-only：

```bash
npx skills add https://github.com/yoyooyooo/ai-coding-os -g --agent codex --skill '*' --full-depth -y
```

仓库和 skill suite 名是 AI Coding OS。CLI 和 npm package 仍是 `goal-proof`。

## 使用

日常项目工作：

```text
使用 $ai-coding-os：
我要治理/规划/实施/审计……
背景：……
边界：……
验收：……
```

长期目标：

```text
使用 $goal-proof：
目标：……
背景：……
边界：……
验收：……
停止条件：……
```

UI capability 规划：

```text
使用 $interface-capability-planning：
拆 InterfaceCapability、surface、interaction state、frontend state/data ownership 和 harness needs。
```

UI proof：

```text
使用 $ui-product-harness：
规划 interface-headless、render wiring、browser-visible proof、evidence、gap 和 claim limit。
```

Headless proof：

```text
使用 $headless-product-harness：
设计最小 proof command、fixture/replay、evidence envelope 和 not_claimed。
```

Docs governance：

```text
使用 $docs-governance：
检查 docs layer、authority placement、README route、obsolete planning docs 和 audit。
```

本仓文档层规则见 `docs/standards/docs-governance.md`；skill SSoT / runtime
分发规则见 `docs/standards/skill-source-distribution.md`。

## CLI 快速查看

```bash
goal-proof summary .
goal-proof list . --completion todo
goal-proof inspect <goal-pack> --json
goal-proof work list <goal-pack>
goal-proof evidence list <goal-pack> --limit 5
goal-proof relations goals . --thread <thread-id> --completion todo --json
goal-proof relations work . --thread <thread-id> --completion todo --json
goal-proof relations check . --thread <thread-id>
goal-proof relations graph . --thread <thread-id>
goal-proof work brief <goal-pack>
goal-proof check <goal-pack>
```

Relations commands 用于检查跨 Goal Pack 连续性和发现 thread 成员候选。它不创建队列、
worklist、scheduler、thread 生命周期、存储图或执行顺序。`relations.thread_id` 只是标签。

典型循环：

```text
check -> inspect -> work brief -> work -> evidence add -> apply -> check
```

完整 CLI 见 [packages/cli/README.zh-CN.md](packages/cli/README.zh-CN.md)。

## 文档和 Artifact Homes

| 路径 | 作用 |
| --- | --- |
| `docs/README.md` | 文档层路由和 authority 顺序 |
| `docs/product/**` | OS 产品/方法论定位 |
| `docs/ssot/**` | 当前事实、术语、不变量 |
| `docs/standards/**` | 可执行规则、命令、质量门、协作 SOP |
| `docs/adr/**` | 已采纳取舍 |
| `docs/roadmap/**` | 顺序、状态、证据链接、迁移波次 |
| `docs/interface-capabilities/**` | 项目级 InterfaceCapability / InterfaceSurface trace |
| `docs/product-harness/**` | 项目级 harness scenario、claim limit、coverage matrix、evidence refs |
| `docs/goal-proof/**` | Goal Pack、inbox、sources、evidence records、Goal Relations |
| `skills/**` | AI Coding OS 公开 skill suite 源码视图 |
| `packages/cli/**` | `goal-proof` CLI |

## 仓库结构

```text
packages/cli/                         TypeScript CLI，使用 Bun 构建
skills/router/                        OS 入口和用户意图路由
skills/goal/                          Goal Pack 方法和执行阶段
skills/governance/                    文档层治理
skills/capability/                    Interface capability planning
skills/harness/                       Product、headless 和 UI harness guidance
skills/README.md                      Skill suite 分组索引
docs/                                 文档治理与方法论分层入口
assets/                               README media
```

CLI 包发布名为 `goal-proof`。

## 发布

发布由 tag 驱动，通过 GitHub Actions 和 npm Trusted Publishing 完成：

```bash
bun run release:check patch
bun run release patch
# 或
bun run release 0.2.0
```

`bun run release:check` 只执行发布决策预检，不改文件。`bun run release`
创建临时本地 release 分支，更新版本文件，提交，给该提交打 `vX.Y.Z` tag，
只 push tag，然后回到原分支。GitHub Actions 从 tag 发布 npm 包。

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
