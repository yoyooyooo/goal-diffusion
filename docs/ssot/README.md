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

## 当前事实

- 仓库定位是 AI Coding Project OS 项目仓：一组平铺公开 skill、一个轻量入口 skill，以及仍以 `goal-diffusion` 发布的 Goal Pack CLI。
- 默认用户入口是 `ai-coding-project-os`。它只路由和编排，不拥有持久 artifact。
- `docs-governance` 独立公开，拥有文档分层、权威放置、cleanup 和 audit。
- `headless-product-harness` 独立公开，拥有 headless proof command、smoke evidence、fixture/replay 和 evidence envelope。
- `goal-diffusion` 独立公开，拥有 Goal Pack 目标计划、滚动执行和跨会话延续。
- CLI / npm package 暂保留 `goal-diffusion` 命名。
- Goal Pack 产物是 `charter.yaml`、`state.yaml`、`receipts.jsonl`、`implementation-plan.md`。
- `charter.yaml` 表示目标授权和 agent 对人类意图的可执行压缩。
- `implementation-plan.md` 只在 `plan_required` 高风险 slice 中存在。
- 默认证据模式面向强 agent，不要求每一步机器级证明。
- final audit 必须回扣 `completion.final_proof`，并说明 `not_claimed` 与 `remaining_gaps`。
- 当前 CLI、templates、skills、checker、tests、README 和 dogfood Goal Pack 主路径使用 v1 schema 口径。

## Priority

默认冲突顺序：

```text
docs/ssot/**
  -> docs/standards/**
  -> code + tests + generated evidence
  -> docs/adr/**
  -> docs/architecture/**
  -> docs/roadmap/**
  -> docs/goal-diffusion/**
```

## Read Next

- 执行规则：`../standards/README.md`
- 文档路由：`../README.md`
