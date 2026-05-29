# Docs Governance

本标准规定 AI Coding OS 仓库的文档分层、权威顺序、生命周期和审计门。
通用方法论由 `docs-governance` skill 拥有；本文是本仓落地适配层。

## Owns

- `docs/*` 顶层 layer 的准入、边界和冲突规则。
- layer README 必须声明的治理字段。
- 文档从候选、Goal Pack、report、source 到长期权威层的 promotion / demotion 路径。
- 本仓 docs audit 的最低检查口径。

## Must Not Own

- AI Coding OS 的产品定位；归 `docs/product/**`。
- 当前术语和方法论事实；归 `docs/ssot/**`。
- 单个 Goal Pack 的运行状态、evidence record 或 completion review；归 `docs/goal-proof/**`。
- skill source layout、触发名和旧入口退役；归 [Skill Source Layout](skill-source-layout.md)。

## Layer Contract

`docs/<layer>` 必须表示文档类型，不表示阶段、个人习惯、临时计划、某个当前任务或工具偏好。

每个长期存在的 layer README 必须至少包含：

- `Owns`
- `Must Not Own`
- `Boundary` 或 `Conflict` / `Priority`
- `Promotion` / `Demotion` 或等价生命周期规则
- `Read Next`、`Homes` 或明确入口

新增 `docs/<layer>` 前必须同时满足：

- 该名称是长期文档类型。
- 现有 layer 放不下，且会造成权威混淆。
- 未来 agent 只看目录名也能判断大致放置位置。
- 能写出清楚的 `Owns` / `Must Not Own` / conflict / promotion 规则。
- 最近索引会被同步更新。

不得新增 `docs/specs/**`、`docs/tmp/**`、`docs/wip/**`、`docs/old/**`、
`docs/archive/**`、`docs/phase-*`。实施规格放 root `specs/**`；Goal Pack
材料放 `docs/goal-proof/**`；历史来源放 method source 或 evidence layer。

## Authority

默认意图权威顺序：

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
  -> README / external notes
```

问题类型可收窄权威：

| 问题 | 最高权威 |
| --- | --- |
| 当前术语、对象含义、方法论事实 | `docs/ssot/**` |
| 可执行规则、命令、质量门、协作 SOP | `docs/standards/**` |
| 已采纳取舍及替代方案 | `docs/adr/**` |
| 实际代码行为 | code + tests + generated evidence |
| Goal Pack 状态、active work item、completion review | `docs/goal-proof/goals/<goal-id>/**` 与 `goal-proof` CLI 输出 |
| InterfaceCapability 语义和 surface trace | `docs/interface-capabilities/**`，但不得覆盖 SSoT / standards / ADR |
| HarnessScenario、`claim_ceiling`、Harness Coverage Matrix、evidence refs | `docs/product-harness/**`，但不得重定义 InterfaceCapability 或产品事实 |
| 迁移顺序、当前 gate、证据链接 | `docs/roadmap/**` |

代码和测试能证明“实际行为”，但不能静默重定义 SSoT、standard 或 ADR。发生冲突时，
要么更新更高权威层，要么把差异记录为 gap。

## Lifecycle

文档状态按最小可保留价值判断：

| 状态 | 放置 |
| --- | --- |
| current truth | `docs/ssot/**` |
| executable rule | `docs/standards/**` |
| accepted decision | `docs/adr/**` |
| structure view | `docs/architecture/**` |
| sequence / gate / evidence link | `docs/roadmap/**` |
| Goal Pack lifecycle | `docs/goal-proof/**` |
| interface capability trace | `docs/interface-capabilities/**` |
| harness proof contract | `docs/product-harness/**` |
| executable implementation spec | root `specs/**` |
| evidence summary | `docs/reports/**` when the repo has that layer, otherwise method evidence |
| consumed source | `docs/goal-proof/sources/**` or owning method source layer |

默认 retention verdict：

| Verdict | 含义 |
| --- | --- |
| `keep` | 当前权威、当前路由或必要证据 |
| `promote` | 候选材料上升到 SSoT / standards / ADR / roadmap / interface / harness |
| `demote` | 不是权威，但仍可作为 source、report、Goal Pack note 或 implementation spec |
| `split` | 一个文件混合多个 layer 责任 |
| `merge` | 多个文件重复同一职责 |
| `archive-as-source` | 已被消费，只保留追溯 |
| `delete` | 无当前价值且保留会误导 agent |
| `block` | 需要人类或更高权威决策 |

Goal Pack companion artifact 的完成 verdict 必须是：

```text
promote | keep-in-goal | split | retire | block
```

Promote 后，Goal Pack companion 只保留 source / promoted_to / evidence link，
不再作为长期权威。

## Scan Policy

旧口径扫描分两层：

- active scan：排除历史 evidence/source、ADR context、roadmap migration gate、
  retired vocabulary registry 和负向测试。
- historical scan：包含所有路径，只确认旧词只在允许区出现。

旧入口允许区由 [Skill Source Layout](skill-source-layout.md) 定义。

## Required Verification

文档治理变更至少运行：

```bash
bun run check
python3 skills/governance/docs-governance/scripts/run_docs_audit.py --repo .
git diff --check
```

涉及 Goal Pack artifact 时，逐个运行：

```bash
goal-proof check docs/goal-proof/goals/<goal-id>
```

涉及 skill source layout 或旧入口退役时，再执行
[Skill Source Layout](skill-source-layout.md) 的 claim-level 验证。

## Read Next

- 文档路由：`../README.md`
- 当前事实：`../ssot/README.md`
- Skill source layout：`skill-source-layout.md`
