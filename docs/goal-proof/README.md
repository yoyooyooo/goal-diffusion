# Goal Proof System

本目录存放 Goal Proof System 方法产物：inbox、sources、Goal Pack、evidence records 和需要保留的长上下文。

项目级 docs 治理规则不放在这里；先读 `../README.md`。

## Owns

- Goal Pack、inbox、sources、evidence records、notes 和 relation metadata。
- Goal Pack companion artifacts：`interface-capabilities.yaml`、`product-harness.yaml`。
- Goal Proof System 方法内的运行状态、active work item、completion review 和完成证据链。

## Must Not Own

- 项目级产品事实、SSoT、standards、ADR 或 roadmap 权威。
- 长期 InterfaceCapability 权威；promote 后归 `docs/interface-capabilities/**`。
- 长期 Product Harness 权威；promote 后归 `docs/product-harness/**`。
- docs layer governance 规则。

## Boundary

本层拥有 Goal Proof System 方法内事实：Goal Pack 目标授权、progress、evidence records、
notes、relations、completion review 和 source material。它可以生成 companion artifact
候选稿，但不能长期替代 `docs/interface-capabilities/**`、`docs/product-harness/**`、
SSoT、standards、ADR 或 roadmap。

## Promotion / Demotion

- Goal Pack completion 后必须判断 companion artifact 和 notes 的 retention verdict。
- 稳定界面能力 promote 到 `docs/interface-capabilities/**`。
- 稳定 harness 证明合同 promote 到 `docs/product-harness/**`。
- 稳定事实 promote 到 SSoT；稳定规则 promote 到 standards；长期取舍 promote 到 ADR。
- 已消费长材料保留在 `sources/`；无当前价值且无证据风险的材料删除。

## Conflict

Goal Pack 状态以本层 artifact 和 `goal-proof` CLI 输出为准。Roadmap 只能链接或摘要。
若 Goal Pack 候选稿与已 promote 的长期权威冲突，长期权威优先，Goal Pack 记录 gap 或后续 work item。

## Homes

| 角色 | 路径 |
| --- | --- |
| inbox | `docs/goal-proof/inbox/` |
| sources | `docs/goal-proof/sources/` |
| goal packs | `docs/goal-proof/goals/<goal-id>/` |
| implementation plans | `docs/goal-proof/goals/<goal-id>/plans/<work_id>.md` |
| interface capability companions | `docs/goal-proof/goals/<goal-id>/interface-capabilities.yaml` |
| product harness companions | `docs/goal-proof/goals/<goal-id>/product-harness.yaml` |

Goal Pack 结构：

```text
goals/<goal-id>/
  goal.yaml
  progress.yaml
  evidence.jsonl
  plans/<work_id>.md  # 仅 needs_plan 时存在
  interface-capabilities.yaml  # UI/IA/interaction trace，可选
  product-harness.yaml  # harness proof trace，可选
  notes/
```

当前 dogfood Goal Pack 主路径使用 v2 `goal.yaml` / `progress.yaml` / `evidence.jsonl` 结构。旧口径只保留在归档 source 或历史 evidence record 文本中作为追溯材料。

## Active Goal Packs

当前没有 active Goal Pack。

## Completed Goal Packs

- `goals/2026-05-24-goal-proof-v2-dogfood-migration/` - migrated this repository to v2 goal/progress/evidence schema.
- `goals/2026-05-24-agent-first-output-control-cli/` - added shared read-output controls and thread-aware repo summary.
- `goals/2026-05-23-evidence-query-cli/` - added compact, filterable evidence history queries to the CLI.
- `goals/2026-05-23-goal-relations-protocol/` - defined minimal cross-pack relation metadata and skill guidance.
- `goals/2026-05-23-goal-relations-cli-verification/` - added relations CLI verification and derived graph view.
- `goals/2026-05-23-evidence-add-stdin-input-cli/` - added explicit `evidence add --stdin` evidence record input for heredoc-safe agent writes.
- `goals/2026-05-23-relations-thread-discovery-cli/` - added thread-member goal/work item discovery for relation-aware continuation.

## Goal Threads

- `agent-first-cli` - CLI command and output surfaces optimized for agent routing and bounded context.
- `goal-relations` - completed protocol and CLI verification packs.
- `evidence-cli` - evidence record command-surface improvements for agent-first read/write workflows.

Goal Thread 只是共享标签。Goal Pack 仍然是完成单位；relation graph 是派生视图，不作为存储规划状态。

## Inbox

弱信号、开放候选和未准备进入 Goal Pack 的输入放这里。Inbox 不是 backlog。

## Sources

已被消费但需要保留追溯的材料放这里。Sources 不是开放候选。

## Read Next

- 文档治理：`../standards/docs-governance.md`
- 当前事实：`../ssot/README.md`
- Roadmap gate：`../roadmap/README.md`
