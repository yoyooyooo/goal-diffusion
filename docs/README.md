# 文档路由

本目录按文档层组织，而不是按阶段、个人习惯或临时计划组织。

## 最短阅读路径

1. 先读仓库根目录 [AGENTS.md](../AGENTS.md)，确认协作语言、开发命令和当前方法论口径。
2. 读本文件，确定文档放置层。
3. 读 [docs/product/README.md](docs/product/README.md)，理解 Goal Diffusion 的产品/方法论定位。
4. 读 [docs/ssot/README.md](docs/ssot/README.md) 和 [docs/standards/README.md](docs/standards/README.md)，确认当前事实和可执行规则。
5. 需要查看长期目标状态时，读 [docs/goal-diffusion/README.md](docs/goal-diffusion/README.md)。

## 当前迁移状态

顶层方法论已冻结为未来 v1 口径：

```text
charter.yaml
state.yaml
receipts.jsonl
implementation-plan.md
```

当前仓库主路径已使用 v1 Goal Pack 口径。后续 schema 迁移仍应通过 Goal Diffusion 目标推进，并同步更新 skills、templates、checker、README、测试和 dogfood Goal Pack。

## 文档层

| 层 | 拥有 | 不拥有 |
| --- | --- | --- |
| `docs/product/**` | 产品/方法论定位、用户价值、非目标 | 工程规则、当前任务状态 |
| `docs/ssot/**` | 当前事实、术语、不变量、权威边界 | 路线图、任务清单、历史讨论 |
| `docs/standards/**` | 可执行规则、命令、质量门、协作 SOP | 产品愿景、未采纳提案 |
| `docs/adr/**` | 已采纳取舍及后果 | 当前任务状态或完整标准 |
| `docs/architecture/**` | 系统结构、模块关系、运行时视图 | 覆盖 SSoT 或隐藏任务 |
| `docs/roadmap/**` | 顺序、状态、证据链接、迁移波次 | 逐步实施任务清单 |
| `docs/goal-diffusion/**` | Goal Pack、inbox、sources、receipts、Goal Relations | 项目级 docs 治理或产品权威 |

## 冲突顺序

默认冲突顺序：

```text
docs/ssot/**
  -> docs/standards/**
  -> code + tests + generated evidence
  -> docs/adr/**
  -> docs/architecture/**
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
- Goal Pack 生命周期 -> `docs/goal-diffusion/**`
- 实施任务和本地证据 -> root `specs/**`，不要放 `docs/specs/**`

## 语言策略

叙述性正文使用中文。字段名、命令、路径、schema 示例和代码符号可保留英文。

## 下一步阅读

- 产品/方法论定位：[docs/product/README.md](docs/product/README.md)
- 当前事实：[docs/ssot/README.md](docs/ssot/README.md)
- 可执行规则：[docs/standards/README.md](docs/standards/README.md)
