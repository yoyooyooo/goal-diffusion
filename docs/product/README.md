# Product

本层描述 AI Coding Project OS 的产品/方法论定位。

## Owns

- AI Coding Project OS 服务谁。
- 适用场景和非目标。
- 面向高智能 agent 的默认姿态。
- 用户为什么需要统一入口、目标计划、文档治理、证据 harness 和滚动实施。

## Must Not Own

- CLI 具体实现。
- Goal Pack 当前状态。
- checker 规则细节。
- 未采纳的迁移计划。

## 当前定位

AI Coding Project OS 是面向高智能 agent 的长期 AI coding 方法套件。它默认相信 agent 能自主实施，但要求入口路由、目标授权、文档权威、验证路径、证据检查点和完成收口足够清楚。

默认不是弱模型防御式流程，而是：

```text
strong-agent optimistic workflow
```

## 套件构成

| 方法 | 作用 |
| --- | --- |
| `ai-coding-project-os` | 默认用户入口；薄路由，不拥有持久 artifact |
| `goal-diffusion` | 目标计划和滚动执行；Goal Pack 是规划与延续载体 |
| `docs-governance` | 文档层、SSoT、standards、ADR、roadmap 的治理 |
| `headless-product-harness` | proof command、smoke check、fixture/replay、evidence envelope |

Goal Diffusion 的上限是长期目标执行，但不限于长期目标。只要用户明确要生成目标计划、Goal Pack 或使用 Goal Diffusion，就由它承载规划；一轮内可完成的小改动直接 inline 实施。

## Read Next

- 根 README：`../../README.zh-CN.md`
- 当前事实：`../ssot/README.md`
- 执行规则：`../standards/README.md`
