# Product Harness

本层保存项目级 harness 证明合同。它回答“怎么证明、证明到什么强度、证据和 gap 怎么追踪”。

## Owns

- `HarnessScenario`：语义级 proof story。
- `HarnessFixture` 引用：fixture / seed / replay / mock / runtime fixture 的 ID 和位置。
- `HarnessRoute` / `HarnessComponent` 引用：UI Harness Surface 的运行入口和源码位置。
- `HarnessEvidence` 引用：evidence record、report、test artifact 或外部证据位置。
- claim limit、not_claimed / non-claim tokens、not_proven、coverage matrix。
- harness lifecycle：`candidate | accepted | regression | retired`。
- 从 Goal Pack `product-harness.yaml` promote 出来的稳定证明合同。

## Must Not Own

- Product truth、domain authority、API schema、数据库事实。
- `InterfaceCapability` 的用户能力语义。
- 最终 UX / UI / IA / 视觉设计。
- 可执行测试代码、fixture 数据本体、Playwright 脚本。
- Goal Pack 运行状态、evidence record 原文或 completion review 原文。

## Boundary

本层只能通过 `covers` 引用 capability，不能重新定义 capability 语义。

```yaml
kind: HarnessScenario
id: hs.channel.issue-from-message
covers:
  interface_capability: ic.channel.issue-from-message
levels:
  - headless_product
  - interface_headless
  - browser_visible
claim_ceiling: browser_visible_candidate  # claim limit field; schema name kept
negative_claims:
  - final_visual_design_claim=false
  - business_fact_claim=false unless paired with hp.channel.issue-from-message
```

`InterfaceCapability` 定义放 `docs/interface-capabilities/**`。

## Evidence Policy

本层保存 evidence refs 和 coverage 状态，不保存每次运行的原始结果。

```text
raw execution evidence -> Goal Pack evidence records / test artifacts / reports
project-level proof contract -> docs/product-harness/**
```

## Promotion / Demotion

Goal Pack 可以先生成候选稿：

```text
docs/goal-proof/goals/<goal-id>/product-harness.yaml
```

完成时必须给 retention verdict：

```text
promote | keep-in-goal | split | retire | block
```

Promote 后，Goal Pack companion 应只保留 source / promoted_to / evidence
link，不再作为长期权威。

如果 harness 只证明一次性候选、已被正式测试覆盖、或 claim limit 已失效，
demote 到 Goal Pack source/report，或在本层标记 retired 后删除重复合同。

## Conflict

冲突时按本仓 `docs/README.md` 的顺序裁决。`docs/ssot/**`、`docs/standards/**`
和已采纳 ADR 高于本层；执行证据可以证明本层过期；本层高于 roadmap /
Goal Pack 中的候选稿。

## Read Next

- 界面能力合同：`../interface-capabilities/README.md`
- 文档路由：`../README.md`
- 当前事实：`../ssot/README.md`
- 文档治理：`../standards/docs-governance.md`
