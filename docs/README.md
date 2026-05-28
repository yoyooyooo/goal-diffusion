# 文档路由

本目录按文档层组织，而不是按阶段、个人习惯或临时计划组织。

## 最短阅读路径

1. 先读仓库根目录 [AGENTS.md](../AGENTS.md)，确认协作语言、开发命令和当前方法论口径。
2. 读本文件，确定文档放置层。
3. 读 [docs/product/README.md](product/README.md)，理解 AI Coding OS 方法论定位和 workspace 落地边界。
4. 读 [docs/ssot/README.md](ssot/README.md)、[docs/standards/README.md](standards/README.md) 和
   [Docs Governance](standards/docs-governance.md)，确认当前事实、可执行规则和文档放置边界。
5. 需要查看长期目标状态时，读 [docs/goal-proof/README.md](goal-proof/README.md)。
6. 需要判断命名或分发边界时，读 [docs/adr/2026-05-28-ai-coding-os-naming-and-boundary.md](adr/2026-05-28-ai-coding-os-naming-and-boundary.md) 和 [docs/standards/skill-source-distribution.md](standards/skill-source-distribution.md)。

## 当前状态

本仓库是 AI Coding OS 方法套件仓：一组按决策面分组的公开 skill、一个轻量 OS 入口，以及仍以 `goal-proof` 发布的 Goal Pack CLI。默认落地边界是 workspace/repo；默认入口仍是 `$ai-coding-os`，它不拥有持久 artifact，只负责把 AI coding 意图路由到拥有方法和 artifact 的 skill。

当前 skill suite 见 [skills/README.md](../skills/README.md)。逻辑分组：

| Group | Skills | 定位 |
| --- | --- | --- |
| `router/` | `ai-coding-os` | 用户默认入口，轻量路由和编排 |
| `goal/` | `goal-proof`, `goal-contracts`, `finding-proof-step`, `proof-step-implementation`, `write-work-plans` | Goal Pack、目标授权、当前验证步、执行、证据记录和高风险实施计划 |
| `governance/` | `docs-governance` | 文档分层、权威放置、cleanup、audit |
| `capability/` | `interface-capability-planning` | UI/IA、交互能力、前端状态/数据归属和 trace artifact |
| `harness/` | `product-harness-system`, `ui-product-harness`, `headless-product-harness` | harness artifact、`claim_ceiling`、Harness Coverage Matrix、UI/headless proof |

Goal Proof System 主路径已使用 v2 Goal Pack 口径：

```text
goal.yaml
progress.yaml
evidence.jsonl
plans/<work_id>.md
```

后续 schema、docs layer 或 skill 口径变更仍应同步更新 skills、templates、checker、README、测试和 dogfood Goal Pack。
涉及 skill source、mirror、runtime 分发或旧入口退役时，按
[Skill Source And Distribution](standards/skill-source-distribution.md) 执行。
涉及 docs layer 准入、promotion / demotion、旧材料清理或审计门时，按
[Docs Governance](standards/docs-governance.md) 执行。

## 文档层

| 层 | 拥有 | 不拥有 |
| --- | --- | --- |
| `docs/product/**` | 产品/方法论定位、用户价值、非目标 | 工程规则、当前任务状态 |
| `docs/ssot/**` | 当前事实、术语、不变量、权威边界 | 路线图、任务清单、历史讨论 |
| `docs/standards/**` | 可执行规则、命令、质量门、协作 SOP | 产品愿景、未采纳提案 |
| `docs/adr/**` | 已采纳取舍及后果 | 当前任务状态或完整标准 |
| `docs/architecture/**` | 系统结构、模块关系、运行时视图 | 覆盖 SSoT 或隐藏任务 |
| `docs/roadmap/**` | 顺序、状态、证据链接、迁移波次 | 逐步实施任务清单 |
| `docs/interface-capabilities/**` | 项目级 InterfaceCapability / InterfaceSurface trace artifact，当项目选择集中管理 UI 能力追溯时使用 | 业务事实、测试代码、Goal Pack 运行状态 |
| `docs/product-harness/**` | 项目级 HarnessScenario / HarnessFixture refs / HarnessRoute refs / evidence refs / `claim_ceiling` / Harness Coverage Matrix | 用户能力语义、产品事实、测试代码、Goal Pack 运行状态 |
| `docs/goal-proof/**` | Goal Pack、inbox、sources、evidence records、Goal Relations | 项目级 docs 治理或产品权威 |

## 冲突顺序

默认意图权威顺序：

```text
docs/ssot/**
  -> docs/standards/**
  -> docs/adr/**
  -> code + tests + generated evidence
  -> docs/protocols/** when the question is wire/schema compatibility
  -> docs/interface-capabilities/**
  -> docs/product-harness/**
  -> docs/architecture/**
  -> docs/roadmap/**
  -> docs/goal-proof/**
  -> README / research / external notes
```

代码和测试能证明实际行为，但不能静默重定义更高层的当前事实、规则或已采纳取舍。
如果某次迁移发现两层都可能是最高权威，先记录 decision/gap，不要把冲突埋进 prose。

## 放置规则

- 当前事实或术语 -> `docs/ssot/**`
- 可执行规则或命令 -> `docs/standards/**`
- 已采纳取舍 -> `docs/adr/**`
- 结构视图 -> `docs/architecture/**`
- 顺序/状态/证据链接 -> `docs/roadmap/**`
- 项目级界面能力 trace -> `docs/interface-capabilities/**`
- 项目级 harness 证明合同、Harness Coverage Matrix 和 evidence refs -> `docs/product-harness/**`
- Goal Pack 生命周期 -> `docs/goal-proof/**`
- 实施任务和本地证据 -> root `specs/**`，不要放 `docs/specs/**`

## 语言策略

叙述性正文使用中文。字段名、命令、路径、schema 示例和代码符号可保留英文。

## 下一步阅读

- 产品/方法论定位：[docs/product/README.md](product/README.md)
- 当前事实：[docs/ssot/README.md](ssot/README.md)
- 可执行规则：[docs/standards/README.md](standards/README.md)
- 文档治理：[docs/standards/docs-governance.md](standards/docs-governance.md)
- Skill source / distribution：[docs/standards/skill-source-distribution.md](standards/skill-source-distribution.md)
