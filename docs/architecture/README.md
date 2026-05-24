# Architecture

本层保存系统结构、模块关系和运行时视图。

## Owns

- CLI、skills、docs、Goal Pack artifact 之间的结构关系。
- 运行时边界和数据流。
- 迁移前后的 schema surface 关系图。

## Must Not Own

- 当前事实的最高权威。
- 任务执行状态。
- 未采纳计划。

## 当前结构摘要

```text
skills/**            agent 方法论与执行指导
packages/cli/**      goal-diffusion CLI
docs/**              项目文档层和 Goal Pack 记录
README*.md           对外入口
```

未来目标结构要求 `charter.yaml` 成为 Goal Pack 的目标授权入口；当前 CLI / checker / historical packs 仍待迁移。

## Read Next

- 当前事实：[../ssot/README.md](../ssot/README.md)
- 迁移顺序：[../roadmap/README.md](../roadmap/README.md)
