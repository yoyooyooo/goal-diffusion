# Interface Capabilities

本层保存项目级界面能力合同。它回答“用户界面能力是什么、要证明什么”。

## Owns

- `InterfaceCapability`：用户任务、入口、交互合同、状态/数据归属、coverage intent。
- `InterfaceSurface`：surface / region 到 capability 的索引。
- capability 到 product / SSoT / design / harness ID 的引用。
- 从 Goal Pack companion artifact promote 出来的稳定界面能力合同。

## Must Not Own

- HarnessScenario、HarnessFixture、HarnessRoute、HarnessComponent 或 HarnessEvidence 的完整定义。
- Playwright / agent-browser / unit test 的步骤。
- fixture 数据、mock handler、seed 数据或 replay trace。
- 产品事实、API schema、数据库事实、正式 UI 视觉方案。
- Goal Pack 运行状态、evidence record 或 completion review。

## Boundary

`InterfaceCapability` 可以声明 `coverage_intent`，但只能引用 harness ID
或需要的 harness level，不能内嵌完整 proof 方案。

```yaml
coverage_intent:
  required_harness:
    - hs.channel.issue-from-message
  required_levels:
    - headless_product
    - interface_headless
    - browser_visible
```

完整证明方案放 `docs/product-harness/**`。

## Promotion / Demotion

Goal Pack 可以先生成候选稿：

```text
docs/goal-proof/goals/<goal-id>/interface-capabilities.yaml
```

完成时必须给 retention verdict：

```text
promote | keep-in-goal | split | retire | block
```

Promote 后，Goal Pack companion 应只保留 source / promoted_to / evidence
link，不再作为长期权威。

如果 capability 只是一次性验证脚手架、未被产品化、或已被新的 capability 吸收，
demote 回 Goal Pack note/source 或在本层标记 retired 后删除重复定义。

## Conflict

冲突时按本仓 `docs/README.md` 的顺序裁决。`docs/ssot/**`、`docs/standards/**`
和已采纳 ADR 高于本层；本层高于 roadmap / Goal Pack 中的候选稿。

## Read Next

- Harness 证明合同：`../product-harness/README.md`
- 文档路由：`../README.md`
- 当前事实：`../ssot/README.md`
- 文档治理：`../standards/docs-governance.md`
