# 文档路由

本目录按文档层组织，而不是按阶段、个人习惯或临时计划组织。

## 最短阅读路径

1. 先读仓库根目录 [AGENTS.md](../AGENTS.md)，确认协作语言、开发命令和当前方法论口径。
2. 读本文件，确定文档放置层。
3. 读 [docs/product/README.md](product/README.md)，理解 AI Coding Project OS 项目定位。
4. 读 [docs/ssot/README.md](ssot/README.md) 和 [docs/standards/README.md](standards/README.md)，确认当前事实和可执行规则。
5. 需要查看长期目标状态时，读 [docs/goal-diffusion/README.md](goal-diffusion/README.md)。

## 当前状态

本仓库是 AI Coding Project OS 项目仓：一组平铺公开 skill、一个轻量 OS 入口，以及仍以 `goal-diffusion` 发布的 Goal Pack CLI。默认入口是 `$ai-coding-project-os`；它不拥有持久 artifact，只负责把项目级 AI coding 意图路由到拥有方法和 artifact 的 skill。

当前平铺 skill：

| Skill | 定位 |
| --- | --- |
| `ai-coding-project-os` | 用户默认入口，轻量路由和编排 |
| `docs-governance` | 文档分层、权威放置、cleanup、audit |
| `interface-capability-planning` | UI/IA、交互能力、前端状态/数据归属和 trace artifact |
| `product-harness-system` | 通用 harness artifact、claim ceiling、coverage matrix、生命周期和 trace |
| `ui-product-harness` | interface-headless、render wiring、browser-visible、production-near UI proof |
| `headless-product-harness` | headless proof command 与证据 envelope |
| `goal-diffusion` | Goal Pack 方法总入口 |
| `goal-plans` | `charter.yaml` 生成/修复 |
| `finding-harnessed-path` | current edge / harness path |
| `diffusion-implementation` | 执行、验证、receipt、advance |
| `write-implementation-plans` | `plan_required` 高风险 slice 的实施计划 |

Goal Diffusion 主路径已使用 v1 Goal Pack 口径：

```text
charter.yaml
state.yaml
receipts.jsonl
implementation-plan.md
```

后续 schema 或 skill 口径变更仍应同步更新 skills、templates、checker、README、测试和 dogfood Goal Pack。

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
| `docs/product-harness/**` | 项目级 HarnessScenario / HarnessFixture refs / HarnessRoute refs / evidence refs / claim ceiling / coverage matrix | 用户能力语义、产品事实、测试代码、Goal Pack 运行状态 |
| `docs/goal-diffusion/**` | Goal Pack、inbox、sources、receipts、Goal Relations | 项目级 docs 治理或产品权威 |

## 冲突顺序

默认冲突顺序：

```text
docs/ssot/**
  -> docs/standards/**
  -> code + tests + generated evidence
  -> docs/adr/**
  -> docs/architecture/**
  -> docs/interface-capabilities/**
  -> docs/product-harness/**
  -> docs/roadmap/**
  -> docs/goal-diffusion/**
  -> README / research / external notes
```

如果某次迁移发现两层都可能是最高权威，先记录决策项，不要把冲突埋进 prose。

## 放置规则

- 当前事实或术语 -> `docs/ssot/**`
- 可执行规则或命令 -> `docs/standards/**`
- 已采纳取舍 -> `docs/adr/**`
- 结构视图 -> `docs/architecture/**`
- 顺序/状态/证据链接 -> `docs/roadmap/**`
- 项目级界面能力 trace -> `docs/interface-capabilities/**`
- 项目级 harness 证明合同、coverage matrix 和 evidence refs -> `docs/product-harness/**`
- Goal Pack 生命周期 -> `docs/goal-diffusion/**`
- 实施任务和本地证据 -> root `specs/**`，不要放 `docs/specs/**`

## 语言策略

叙述性正文使用中文。字段名、命令、路径、schema 示例和代码符号可保留英文。

## 下一步阅读

- 产品/方法论定位：[docs/product/README.md](product/README.md)
- 当前事实：[docs/ssot/README.md](ssot/README.md)
- 可执行规则：[docs/standards/README.md](standards/README.md)
