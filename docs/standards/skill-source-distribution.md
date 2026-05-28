# Skill Source And Distribution

本标准规定 AI Coding OS skill 的 source、mirror、runtime target 和发布口径。

## Owns

- skill 文本从 SSoT 到 OS repo mirror 再到 runtime targets 的流向。
- 何时可以声明“已同步 / 已分发 / 可被新会话使用”。
- 旧 skill 名、旧目录和历史 evidence 的保留边界。
- scene profile / suite target include 的治理要求。

## Must Not Own

- 单个 skill 的方法论内容。
- Goal Pack 当前执行状态。
- npm publish、GitHub release 或 CLI 版本策略。
- runtime target 的工具私有实现细节。

## Source Layers

| Layer | Path | Authority |
| --- | --- | --- |
| Editing SSoT | `~/Documents/code/personal/personal-skills/**` | 长期 skill 编辑真源 |
| OS repo mirror | `skills/**` | 对外开源阅读、review、dogfood 和 release mirror |
| Runtime targets | `~/.agents/skills/**`, `~/.codex/skills/**`, other agent homes | 新会话实际加载面 |
| Historical evidence | `docs/goal-proof/goals/**/evidence.jsonl`, `docs/goal-proof/sources/**` | 追溯材料，不定义当前口径 |

默认先改 Editing SSoT，再同步 runtime targets，并显式更新 OS repo mirror。若用户明确要求先在
OS repo 起草，必须在 roadmap 或 handoff 标记：

```text
source_status: mirror-draft
promoted_to_ssot: false
distributed_to_runtime: false
```

未完成 promote / distribution 前，不能对外声称新 skill 口径已成为所有新会话默认行为。

当前 `personal-skills` 使用 flat canonical skill dirs；OS repo mirror 使用
`skills/router|goal|governance|capability|harness` grouped layout。不要把 OS repo
mirror 作为普通 `skillshare` copy target，避免 copy target 把 nested path 扁平化成
`router__ai-coding-os` 这类运行时目录。

## Current Canonical Skill Names

```text
ai-coding-os
goal-proof
goal-contracts
finding-proof-step
proof-step-implementation
write-work-plans
docs-governance
interface-capability-planning
product-harness-system
ui-product-harness
headless-product-harness
```

旧名称不保留兼容 alias：

```text
ai-coding-project-os
goal-diffusion
goal-plans
finding-harnessed-path
diffusion-implementation
write-implementation-plans
interface-design-planning
ai-coding-project-governance
```

旧名称只能出现在以下位置：

- 本标准的 retired vocabulary registry。
- 已采纳 ADR 的 context / alternatives / consequences。
- roadmap 的 migration gate 或 gap 描述。
- 历史 evidence 或 source handoff。
- 负向测试，证明旧命令或旧入口不会回流。

除此之外，活跃 docs、skills、templates、README、package metadata 和 scene
profiles 不应出现旧名称。

## Change Protocol

改 skill 名、入口、分组、schema、trigger 或公开路由时，必须完成同一变更波次：

1. 更新 SSoT skill 目录和 `SKILL.md` frontmatter `name`。
2. 更新 OS repo mirror 下 `skills/**` 的目录、frontmatter、README 和引用。
3. 更新 `docs/ssot/**`、`docs/standards/**`、必要 ADR、README 和 AGENTS。
4. 更新 `skill-manager` scene profile、suite target include 和 source-sync policy。
5. 分发到 runtime targets。
6. 运行验证和复扫。

如果某一步暂不执行，roadmap 必须记录为 explicit gap，不得隐式留下旧口径。

## Distribution Claim Levels

| Claim | Required evidence |
| --- | --- |
| `mirror-updated` | OS repo docs / skills / tests 已更新并通过本仓验证 |
| `ssot-promoted` | `personal-skills` 已同步，旧 skill 目录已删除或退役 |
| `runtime-distributed` | 目标 runtime homes 已更新，新会话可发现新 skill 名 |
| `old-entry-retired` | 活跃面复扫无旧名；历史 evidence/source 仅作为追溯材料保留 |

对用户汇报时必须使用最窄成立 claim。不能用 `mirror-updated` 代替
`runtime-distributed`。

## Required Verification

OS repo mirror 至少运行：

```bash
bun run check
python3 skills/governance/docs-governance/scripts/run_docs_audit.py --repo .
```

Goal Pack 记录存在时，逐个运行：

```bash
goal-proof check docs/goal-proof/goals/<goal-id>
```

旧口径复扫必须分两层：

```text
active scan: 排除 **/evidence.jsonl、docs/goal-proof/sources/**、retired vocabulary registry、ADR context、roadmap gate 和负向测试
historical scan: 包含全部路径，只确认旧词只存在于 retired vocabulary registry、ADR context、roadmap gate、evidence/source 或负向测试
```

运行时分发还必须验证 runtime target 中不存在旧入口 skill：

```text
ai-coding-project-os
goal-diffusion
goal-plans
finding-harnessed-path
diffusion-implementation
write-implementation-plans
```

## Repo Shell

仓库外壳属于发布和协作入口，不是方法论事实。当前正式 repo URL：
`github.com/yoyooyooo/ai-coding-os`。

在远端实际 rename 完成前，roadmap 必须保留 repo shell gap。完成后同步：

- GitHub repo name / remote URL。
- 本地目录名。
- package metadata。
- README install URLs。
- skill-manager source target path。
