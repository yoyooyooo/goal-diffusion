# SSoT

本层保存当前事实、术语和不变量。

## Owns

- 当前方法论对象的权威含义。
- 顶层命名和字段语义。
- 不应被 roadmap、Goal Pack 或 README 随意改写的事实。

## Must Not Own

- 迁移顺序。
- 临时任务状态。
- 历史讨论。
- 未采纳提案。

## Boundary

本层只写“现在应被视为事实”的对象、术语和不变量。ADR 可以解释为什么采纳；
standards 可以规定怎么执行；roadmap 可以说明何时迁移；Goal Pack 可以记录执行证据。
这些层都不能静默改写本层事实。

如果代码或测试和本层冲突，代码证据只能证明实际行为已经漂移，不能自动成为方法论事实。
需要同步更新 SSoT / standards / ADR，或把差异记录为 gap。

## Promotion / Demotion

- 从 ADR、完成的 Goal Pack、roadmap gate 或 verified evidence 中抽取稳定事实时，promote 到本层。
- 若本层内容退化为迁移计划、历史解释或执行状态，demote 到 roadmap、ADR、source 或 report。
- 废弃事实必须删除或明确改写为历史来源，不能继续以当前事实语气保留。

## 当前事实

- 仓库定位是 AI Coding OS 方法套件仓：一组按 decision surface 分组的公开 skill、一个轻量入口 skill，以及仍以 `goal-proof` 发布的 Goal Pack CLI。
- AI Coding OS 是方法论和 skill suite 品牌名；默认落地边界是 workspace/repo，不进入品牌名。
- 默认用户入口是 `ai-coding-os`。它只路由和编排，不拥有持久 artifact。
- 命名裁决由 [ADR: AI Coding OS 命名与边界](../adr/2026-05-28-ai-coding-os-naming-and-boundary.md) 固化。
- `docs-governance` 独立公开，拥有文档分层、权威放置、cleanup 和 audit。
- `interface-capability-planning` 独立公开，拥有 UI/IA 交互能力合同、状态/数据归属、testability planning 和 harness handoff。
- `product-harness-system` 独立公开，拥有通用 Harness artifact、生命周期、`claim_ceiling`、Harness Coverage Matrix 和 trace 规范。
- `ui-product-harness` 独立公开，拥有 interface-headless、render wiring、browser-visible 和 production-near UI proof 方法。
- `headless-product-harness` 独立公开，拥有 headless proof command、smoke evidence、fixture/replay 和 evidence envelope。
- `goal-proof` 独立公开，拥有 Goal Pack 目标计划、滚动执行和跨会话延续。
- CLI / npm package 暂保留 `goal-proof` 命名。
- Goal Pack 核心产物是 `goal.yaml`、`progress.yaml`、`evidence.jsonl`、`plans/<work_id>.md`；涉及 UI/IA/interaction trace 时可带 optional companion `interface-capabilities.yaml`；涉及 harness proof trace 时可带 optional companion `product-harness.yaml`。
- `goal.yaml` 表示目标授权和 agent 对人类意图的可执行压缩。
- `plans/<work_id>.md` 只在 `needs_plan` 高风险 slice 中存在。
- 默认证据模式面向强 agent，不要求每一步机器级证明。
- Completion review 必须回扣 `completion.required_evidence`，并说明 `not_claimed` 与 `remaining_gaps`。
- 当前 CLI、templates、skills、checker、tests、README 和 dogfood Goal Pack 主路径使用 v2 schema 口径。

## Priority

默认冲突顺序：

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
```

## Read Next

- 执行规则：`../standards/README.md`
- 文档治理：`../standards/docs-governance.md`
- Skill source layout：`../standards/skill-source-layout.md`
- 文档路由：`../README.md`
