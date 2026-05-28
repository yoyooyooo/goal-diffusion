# Product

本层描述 AI Coding OS 的产品/方法论定位。

## Owns

- AI Coding OS 服务谁。
- 适用场景和非目标。
- 面向高智能 agent 的默认姿态。
- 用户为什么需要统一入口、目标计划、文档治理、界面能力规划、Product Harness System、UI harness、证据 harness 和滚动实施。

## Must Not Own

- CLI 具体实现。
- Goal Pack 当前状态。
- checker 规则细节。
- 未采纳的迁移计划。

## Boundary

本层回答 AI Coding OS 面向谁、解决什么问题、默认相信怎样的 agent 能力，
以及哪些方向不是目标。它不定义 schema、命令、分发状态或当前执行结果。

## Promotion / Demotion

- 稳定的产品/方法论定位、目标用户、非目标和用户价值，可以从 README、ADR、
  Goal Pack completion 或讨论 source promote 到本层。
- 具体实现规则 demote 到 standards；结构关系 demote 到 architecture；
  当前状态或 gate demote 到 roadmap。

## Conflict

本层低于 SSoT、standards 和 ADR。若产品定位与当前事实或已采纳决策冲突，
先更新更高权威层，再调整本层叙事。

## 当前定位

AI Coding OS 是面向高智能 agent 的长期 AI coding 方法论和 skill suite。它默认相信 agent 能自主实施，但要求入口路由、目标授权、文档权威、验证路径、证据检查点和完成收口足够清楚。

默认落地边界是 workspace/repo，不进入方法论品牌名。多数场景仍以一个 repo、一个产品工作区、一组 docs 和一个目标流为工作边界。

默认不是弱模型防御式流程，而是：

```text
strong-agent optimistic workflow
```

## 套件构成

| 方法 | 作用 |
| --- | --- |
| `ai-coding-os` | 默认用户入口；薄路由，不拥有持久 artifact |
| `goal-proof` | 目标计划和滚动执行；Goal Pack 是规划与延续载体 |
| `docs-governance` | 文档层、SSoT、standards、ADR、roadmap 的治理 |
| `interface-capability-planning` | UI/IA 交互能力、状态/数据归属和 testability contract 的规划 |
| `product-harness-system` | 通用 harness artifact、生命周期、claim limit、coverage matrix 和 trace 规范 |
| `ui-product-harness` | 界面能力的 interface-headless、render wiring、browser-visible 和 production-near proof |
| `headless-product-harness` | proof command、smoke check、fixture/replay、evidence envelope |

Goal Proof System 的上限是长期目标执行，但不限于长期目标。只要用户明确要生成目标计划、Goal Pack 或使用 Goal Proof System，就由它承载规划；一轮内可完成的小改动直接 inline 实施。

## Read Next

- 根 README：`../../README.zh-CN.md`
- 当前事实：`../ssot/README.md`
- 执行规则：`../standards/README.md`
- 文档治理：`../standards/docs-governance.md`
