# Source: Goal Proof v2 Dogfood Migration Handoff

来源：`/var/folders/sf/rnr3jjbn3qb0c43yyjl3p9900000gn/T/handoff-XXXXXX.md.W1rKGF2zzr`

本 source 固化后续 dogfood Goal Pack 的输入，避免只依赖临时 handoff 文件。

## 冻结口径

Goal Proof System v2 采用 strong-agent optimistic workflow：

```text
human intent
-> agent writes goal contract
-> agent finds current proof_step
-> agent executes largest safe useful slice
-> agent adds evidence record
-> proof_step | continue | needs_plan | blocked | review | done | needs_human
-> completion review maps evidence to completion
-> done
```

目标产物：

```text
goal.yaml
progress.yaml
evidence.jsonl
plans/<work_id>.md  # 仅 needs_plan 时存在
notes/
```

核心命名迁移：

```text
contract.yaml -> goal.yaml
state.yaml -> progress.yaml
receipts.jsonl -> evidence.jsonl
task_id -> work_id
receipt -> evidence_record
current_edge -> proof_step
harnessed_path -> proof_path
next_decision -> next_action
Goal Plan -> Goal Pack / goal contract
```

历史 Goal Pack 策略：本仓库 dogfood 迁移目标允许直接重写历史 Goal Pack 到 v2 schema，不走 legacy/archive 保守策略。这是本仓库方法论迁移的目标边界，不代表普通用户项目默认可以重写历史 evidence。

## 已完成输入状态

- `AGENTS.md` 已写入中文协作规则和 v2 口径。
- `README.zh-CN.md` 已写入 v2 中文入口。
- `docs/README.md` 与 core docs layer README 已创建。
- `docs/goal-proof/README.md` 已改为中文并标记 Goal Pack 主路径。
- `bun run check` 通过。
- docs governance review 通过。

## 迁移范围

- `README.md` 英文版。
- `skills/**`。
- `skills/goal/goal-proof-system/templates/**`。
- CLI parser / checker / renderer / tests。
- 历史 `docs/goal-proof/goals/**`。
