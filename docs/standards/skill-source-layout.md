# Skill Source Layout

本标准规定 AI Coding OS 公开 skill suite 的源码布局、触发名、旧入口退役和本仓验证口径。
本仓是对外开源源码仓，不承载下游 runtime、安装器或同步流程叙事。

## Owns

- `skills/**` grouped source layout。
- `SKILL.md` frontmatter `name` 和公开触发名。
- 何时可以声明“本仓源码已更新 / 本仓验证已通过”。
- 旧 skill 名、旧目录和历史 evidence 的保留边界。

## Must Not Own

- 单个 skill 的方法论内容。
- Goal Pack 当前执行状态。
- npm publish、GitHub release 或 CLI 版本策略。
- 下游 runtime、安装器或同步流程。
- 下游用户如何安装、复制、镜像或分发这些 skill。

## Source Layers

| Layer | Path | Authority |
| --- | --- | --- |
| Public source | `skills/**` | AI Coding OS 公开 skill suite 的源码 |
| Skill trigger names | each `SKILL.md` frontmatter `name` | 运行时触发名的公开约定 |
| Public docs | `README*.md`, `docs/**`, `AGENTS.md` | 源码布局、旧名退役和验证口径 |
| Historical evidence | `docs/goal-proof/goals/**/evidence.jsonl`, `docs/goal-proof/sources/**` | 追溯材料，不定义当前口径 |

修改 AI Coding OS suite 时，只能对本仓公开 claim 做如下声明：

```text
source_updated: true|false
repo_verified: true|false
downstream_distribution_claimed: false
```

下游用户或维护者可以在自己的安装器或 runtime 中镜像这些 skill，但那是
downstream distribution，不是本仓公开 authority。本仓文档不得写入下游路径、同步脚本或本机策略。

## Current Canonical Skill Names

```text
ai-coding-os
goal-proof
goal-contracts
finding-proof-step
proof-step-implementation
write-work-plans
docs-governance
frontend-architecture
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

除此之外，活跃 docs、skills、templates、README 和 package metadata 不应出现旧名称。

## Change Protocol

改 skill 名、入口、分组、schema、trigger 或公开路由时，必须完成同一变更波次：

1. 更新本仓 `skills/**` grouped SSoT 目录和 `SKILL.md` frontmatter `name`。
2. 更新 `docs/ssot/**`、`docs/standards/**`、必要 ADR、README 和 AGENTS。
3. 更新相关 template、CLI checker / renderer、测试或示例。
4. 运行验证和复扫。
5. 如存在下游安装或镜像需求，把它作为外部 follow-up 记录在对应下游系统中，不写入本仓公开叙事。

如果某一步暂不执行，roadmap 必须记录为 explicit gap，不得隐式留下旧口径。

## Public Claim Levels

| Claim | Required evidence |
| --- | --- |
| `source-updated` | 本仓 `skills/**`、公开 docs 和必要测试已更新 |
| `repo-verified` | 本仓验证命令通过 |
| `old-entry-retired` | 活跃面复扫无旧名；历史 evidence/source 仅作为追溯材料保留 |
| `downstream-distribution-not-claimed` | 未声明任何下游 runtime 或安装状态 |

对用户汇报时必须使用最窄成立 claim。不能用 `source-updated` 代替
`repo-verified`，也不能把本仓验证说成下游 runtime 已安装。

## Required Verification

AI Coding OS repo 至少运行：

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

## Repo Shell

仓库外壳属于发布和协作入口，不是方法论事实。当前正式 repo URL：
`github.com/yoyooyooo/ai-coding-os`。

在远端实际 rename 完成前，roadmap 必须保留 repo shell gap。完成后同步：

- GitHub repo name / remote URL。
- package metadata。
- README install URLs。
