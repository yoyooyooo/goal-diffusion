# Architecture

本层保存系统结构、模块关系和运行时视图。

## Owns

- OS 入口 skill、方法 skill、CLI、docs、Goal Pack artifact 之间的结构关系。
- 运行时边界和数据流。
- 迁移前后的 schema surface 关系图。

## Must Not Own

- 当前事实的最高权威。
- 任务执行状态。
- 未采纳计划。

## 当前结构摘要

```text
skills/ai-coding-project-os/          薄入口：用户意图路由和方法编排
skills/docs-governance/               文档治理：docs 层、权威、cleanup、audit
skills/interface-capability-planning/ 界面能力规划：IA、交互合同、状态/数据归属、testability
skills/product-harness-system/        Harness 总纲：artifact、claim ceiling、coverage、lifecycle、trace
skills/ui-product-harness/            UI 验证治理：interface-headless、render wiring、browser-visible proof
skills/headless-product-harness/      验证治理：headless proof 与 evidence envelope
skills/goal-diffusion/                目标治理：Goal Pack 方法入口
skills/goal-plans/                    Goal Charter authoring
skills/finding-harnessed-path/        current edge / harness path
skills/diffusion-implementation/      run slice / receipt / advance
skills/write-implementation-plans/    plan_required 高风险计划
packages/cli/**                       goal-diffusion CLI
docs/**                               项目文档层和 Goal Pack 记录
README*.md                            对外入口
```

`ai-coding-project-os` 不写持久状态。需要持久化时，artifact 归属如下：

```text
目标计划 / 长期执行 -> docs/goal-diffusion/goals/<goal-id>/
文档权威 / standards / ADR / roadmap -> docs/*
界面能力 trace -> docs/interface-capabilities/** 或 Goal Pack interface-capabilities.yaml
通用 harness trace / coverage -> docs/product-harness/** 或 Goal Pack product-harness.yaml
UI harness 方法与证据 envelope -> owning project test surface + optional Goal Pack receipts
proof command / smoke evidence / fixture/replay 规则 -> owning project command surface + docs/standards/**
CLI 状态读取 / receipt / advance -> packages/cli/**
```

当前 CLI / checker / skills / templates / historical dogfood Goal Packs 已迁移到 v1 `charter.yaml` 主路径。CLI 包名暂保留 `goal-diffusion`。

## Read Next

- 当前事实：[../ssot/README.md](../ssot/README.md)
- 迁移顺序：[../roadmap/README.md](../roadmap/README.md)
