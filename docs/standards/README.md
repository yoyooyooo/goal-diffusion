# Standards

本层保存可执行规则、命令、质量门和协作 SOP。

## Owns

- 开发和验证命令。
- 文档治理规则。
- skill 分发和入口口径。
- Goal Proof System schema 迁移时必须同步的对象。
- agent 协作规则。

## Must Not Own

- 产品定位。
- 当前 Goal Pack 运行状态。
- 未决取舍。

## Boundary

本层写可执行规则：命令、检查门、命名、schema 同步要求、文档治理 SOP、
skill 分发协议和 agent 协作规则。它不解释产品为什么存在，也不保存当前任务状态。

当本层规则和代码行为冲突时，代码只能证明当前实现状态；是否接受该行为为新规则，
必须通过本层、SSoT 或 ADR 明确更新。

## Promotion / Demotion

- 重复出现的 review 规则、命令门、docs governance 规则、skill distribution 规则，
  从 Goal Pack、roadmap 或 report promote 到本层。
- 一次性计划、候选取舍或执行证据从本层 demote 到 roadmap、ADR、Goal Pack 或 report。
- 被 ADR 或更高标准替代的旧规则应删除，不能留下并行 current home。

## 开发标准

使用 Bun：

```bash
bun install
bun run build
bun run typecheck
bun run test
bun run check
```

改公开命令、Goal Pack schema、evidence record 语义、skill 口径时，同步更新：

- `README.zh-CN.md`
- `README.md`
- `skills/**`
- `skills/**/templates/**`
- CLI checker / renderer
- tests

## Skill 分发标准

- 详细规则见 [Skill Source And Distribution](skill-source-distribution.md)。
- SSoT 是 `~/Documents/code/personal/personal-skills`；本仓 `skills/` 是 AI Coding OS 公开 skill suite 的 repo mirror。
- 当前公开 skill suite 入口见 [skills/README.md](../../skills/README.md)。
- Skill 运行时触发名由 `SKILL.md` frontmatter `name` 决定，不由目录名决定。
- `skillshare` 支持递归发现；copy target 可能把嵌套路径编码成扁平目录名，这是分发细节，不改变本仓源码布局。
- 旧 skill 名不保留兼容 alias；历史 evidence/source 可保留追溯旧词，但不能定义当前口径。
- 改 suite 收口策略时，默认先改 SSoT，再 sync 到本仓和 runtime targets。若先落本仓，必须在 roadmap / handoff 标记 `mirror-draft`，不能对外声称 source 已同步或 runtime 已分发。

## 文档标准

- 新增文档必须放入正确 `docs/*` 层。
- 高密度目录必须有 README。
- 每个 durable docs layer README 至少包含 `Owns`、`Must Not Own`、入口或 `Read Next`；权威密集层还必须包含 `Boundary` 或冲突规则，以及 promotion / demotion 路径。
- 详细文档治理规则见 [Docs Governance](docs-governance.md)。
- 不创建 `docs/specs/**`；实施规格放 root `specs/**`。
- 不保留两个 current home。
- 叙述性正文使用中文；字段名、命令、路径和 schema 示例可保留英文。

## Goal Proof System 标准

- 默认采用 strong-agent optimistic workflow。
- Goal Proof System 是当前唯一规划载体：用户明确要求目标计划、Goal Pack 或使用 `$goal-proof` 时由它生成规划。
- 随口小需求不创建 Goal Pack；直接 inline 实施并验证。
- 简单工作不引入 strict proof。
- 高风险工作使用 `evidence_mode: strict`。
- 真实 Goal Pack 的历史 `evidence.jsonl` 不重写，只追加。
- `plans/<work_id>.md` 不作为第二套任务系统。

## Read Next

- 当前事实：`../ssot/README.md`
- 结构视图：`../architecture/README.md`
- 文档治理：`docs-governance.md`
- Skill source / distribution：`skill-source-distribution.md`
