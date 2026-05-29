# ADR: AI Coding OS 命名与边界

## Status

Accepted

## Context

本仓已经从单一 Goal Proof / Goal Diffusion 实验，演进为面向高智能 agent
的 AI coding 方法套件。旧口径存在三个问题：

- `ai-coding-project-os` 把品牌拉回项目管理或项目级工具。
- `Goal Diffusion` 曾同时承担隐喻、方法名、CLI/package、skill 名和目录名，边界过宽。
- `Project` 作为品牌词会遮蔽真实方法论边界；当前默认落地边界其实是 workspace/repo。

本仓还需要同时保留一个现实约束：`goal-proof` CLI / npm package 已经是独立公开
命令面，重命名 CLI/package 会引入额外 release 和兼容决策。

## Decision

采纳以下命名和边界：

- 方法论和 skill suite 品牌名：`AI Coding OS`。
- 默认用户入口 skill：`ai-coding-os`。
- 长目标与 Goal Pack 系统：`Goal Proof System`。
- CLI / npm package：继续使用 `goal-proof`。
- `Goal Diffusion` 只可作为 README 中的隐喻，不作为正式对象、skill、schema、目录或命令名。
- `Project` 不进入品牌名；默认落地边界表述为 `workspace/repo`。
- 活跃 docs、skills、templates、tests、CLI docs 和 package metadata 不保留旧入口 alias。
- 历史 `evidence.jsonl` 和 `docs/goal-proof/sources/**` 可保留旧口径作为追溯材料，但不能作为当前口径引用。

## Alternatives

- 保留 `ai-coding-project-os`：
  - 拒绝。该名称会让 agent 把套件误解成项目管理 OS，而不是通用 AI coding 方法论。
- 把 CLI / npm package 也改成 `ai-coding-os`：
  - 暂不采纳。CLI 当前明确服务 Goal Pack / Goal Proof，不拥有整个 OS suite。
- 完全删除 `Goal Diffusion` 隐喻：
  - 暂不采纳。隐喻仍可帮助解释“粗目标逐步变清晰”，但必须与正式对象解耦。

## Consequences

- 新会话默认应从 `$ai-coding-os` 进入。
- 需要跨目标、跨会话、证据化滚动执行时，路由到 `$goal-proof`。
- 后续新增方法或 skill 时，优先按 decision surface 放入 `skills/router`、
  `skills/goal`、`skills/governance`、`skills/capability` 或 `skills/harness`。
- 旧 skill 名和旧目录名不得作为兼容 alias 分发。
- repo 外壳、公开 skill source layout 和旧名退役必须按
  [Skill Source Layout](../standards/skill-source-layout.md) 收敛。

## Evidence

- 当前事实：[docs/ssot/README.md](../ssot/README.md)
- 文档路由：[docs/README.md](../README.md)
- skill suite index：[skills/README.md](../../skills/README.md)
- 验证命令：
  - `bun run check`
  - `python3 skills/governance/docs-governance/scripts/run_docs_audit.py --repo .`
  - `goal-proof check docs/goal-proof/goals/<goal-id>`
