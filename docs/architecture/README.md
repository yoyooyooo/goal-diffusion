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

## Boundary

本层保存结构视图：skill 分组、CLI、docs layer、Goal Pack artifact 和运行时使用面的关系。
它可以解释对象之间如何连接，但不能把结构图变成新的事实来源或任务队列。

## Promotion / Demotion

- 多个文档反复依赖的系统结构、数据流、运行时边界，可以 promote 到本层。
- 当前任务状态 demote 到 roadmap 或 Goal Pack；规范性规则 demote 到 standards；
  术语和对象事实 demote 到 SSoT。

## Conflict

若结构图与 SSoT、standards、ADR 或代码证据冲突，本层视为过期。更新结构图或记录 gap，
不要让 architecture prose 覆盖更高权威。

## 当前结构摘要

```text
skills/router/                        薄入口：用户意图路由和方法编排
skills/goal/                          目标治理：Goal Pack 方法、阶段 skill、执行和 evidence record
skills/governance/                    文档治理：docs 层、权威、cleanup、audit
skills/capability/                    界面能力规划：IA、交互合同、状态/数据归属、testability
skills/harness/                       Harness 总纲、headless proof、UI proof 与 evidence envelope
packages/cli/**                       goal-proof CLI
docs/**                               项目文档层和 Goal Pack 记录
README*.md                            对外入口
```

`ai-coding-os` 不写持久状态。需要持久化时，artifact 归属如下：

```text
目标计划 / 长期执行 -> docs/goal-proof/goals/<goal-id>/
文档权威 / standards / ADR / roadmap -> docs/*
界面能力 trace -> docs/interface-capabilities/** 或 Goal Pack interface-capabilities.yaml
通用 harness trace / coverage -> docs/product-harness/** 或 Goal Pack product-harness.yaml
UI harness 方法与证据 envelope -> owning project test surface + optional Goal Pack evidence records
proof command / smoke evidence / fixture/replay 规则 -> owning project command surface + docs/standards/**
CLI 状态读取 / evidence record / apply -> packages/cli/**
```

当前 CLI / checker / skills / templates / historical dogfood Goal Packs 已迁移到 v2 Goal Pack 主路径。CLI 包名暂保留 `goal-proof`。

## Read Next

- 当前事实：[../ssot/README.md](../ssot/README.md)
- 迁移顺序：[../roadmap/README.md](../roadmap/README.md)
- 文档治理：[../standards/docs-governance.md](../standards/docs-governance.md)
