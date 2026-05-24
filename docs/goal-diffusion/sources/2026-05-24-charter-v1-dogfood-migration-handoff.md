# Source: charter v1 dogfood migration handoff

来源：`/var/folders/sf/rnr3jjbn3qb0c43yyjl3p9900000gn/T/handoff-XXXXXX.md.W1rKGF2zzr`

本 source 固化后续 dogfood Goal Pack 的输入，避免只依赖临时 handoff 文件。

## 冻结口径

Goal Diffusion 未来 v1 采用 strong-agent optimistic workflow：

```text
human intent
-> agent writes goal charter
-> agent finds current edge
-> agent executes largest safe useful slice
-> agent records receipt
-> continue | plan_required | blocked | audit
-> final audit maps evidence to completion
-> done
```

目标产物：

```text
charter.yaml
state.yaml
receipts.jsonl
implementation-plan.md  # 仅 plan_required 时存在
notes/
```

核心命名迁移：

```text
contract.yaml -> charter.yaml
completion_oracle -> completion
architecture_standard -> engineering_guidance
protected_fields -> autonomy.cannot_silently_change
commands -> checks
Goal Plan -> Goal Charter authoring
goal-plans skill role -> charter authoring role
```

历史 Goal Pack 策略：本仓库 dogfood 迁移目标允许直接重写历史 Goal Pack 到 v1 schema，不走 legacy/archive 保守策略。这是本仓库方法论迁移的目标边界，不代表普通用户项目默认可以重写历史 evidence。

## 已完成输入状态

- `AGENTS.md` 已写入中文协作规则和 future v1 口径。
- `README.zh-CN.md` 已写入 future v1 中文入口。
- `docs/README.md` 与 core docs layer README 已创建。
- `docs/goal-diffusion/README.md` 已改为中文并标记历史 Goal Pack 仍待迁移。
- `bun run check` 通过。
- docs governance audit 通过。

## 待迁移范围

- `README.md` 英文版。
- `skills/**`。
- `skills/goal-diffusion/templates/**`。
- CLI parser / checker / renderer / tests。
- 历史 `docs/goal-diffusion/goals/**`。
