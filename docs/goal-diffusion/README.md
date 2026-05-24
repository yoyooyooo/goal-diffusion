# Goal Diffusion

本目录存放 Goal Diffusion 方法产物：inbox、sources、Goal Pack、receipt 和需要保留的长上下文。

项目级 docs 治理规则不放在这里；先读 `../README.md`。

## Homes

| 角色 | 路径 |
| --- | --- |
| inbox | `docs/goal-diffusion/inbox/` |
| sources | `docs/goal-diffusion/sources/` |
| goal packs | `docs/goal-diffusion/goals/<goal-id>/` |
| implementation plans | `docs/goal-diffusion/goals/<goal-id>/implementation-plan.md` |

Goal Pack 结构：

```text
goals/<goal-id>/
  charter.yaml
  state.yaml
  receipts.jsonl
  implementation-plan.md  # 仅 plan_required 时存在
  notes/
```

当前 dogfood Goal Pack 主路径使用 v1 `charter.yaml` 结构。旧口径只保留在归档 source 或迁移 receipt 文本中作为证据记录。

## Active Goal Packs

当前没有 active Goal Pack。

## Completed Goal Packs

- `goals/2026-05-24-charter-v1-dogfood-migration/` - migrated this repository to v1 charter/completion/checks/evidence_map schema.
- `goals/2026-05-24-agent-first-output-control-cli/` - added shared read-output controls and thread-aware repo summary.
- `goals/2026-05-23-receipts-query-cli/` - added compact, filterable receipt history queries to the CLI.
- `goals/2026-05-23-goal-relations-protocol/` - defined minimal cross-pack relation metadata and skill guidance.
- `goals/2026-05-23-goal-relations-cli-verification/` - added relations CLI verification and derived graph view.
- `goals/2026-05-23-record-stdin-input-cli/` - added explicit `record --stdin` receipt input for heredoc-safe agent writes.
- `goals/2026-05-23-relations-thread-discovery-cli/` - added thread-member goal/task discovery for relation-aware continuation.

## Goal Threads

- `agent-first-cli` - CLI command and output surfaces optimized for agent routing and bounded context.
- `goal-relations` - completed protocol and CLI verification packs.
- `receipt-cli` - receipt command-surface improvements for agent-first read/write workflows.

Goal Thread 只是共享标签。Goal Pack 仍然是完成单位；relation graph 是派生视图，不作为存储规划状态。

## Inbox

弱信号、开放候选和未准备进入 Goal Pack 的输入放这里。Inbox 不是 backlog。

## Sources

已被消费但需要保留追溯的材料放这里。Sources 不是开放候选。
