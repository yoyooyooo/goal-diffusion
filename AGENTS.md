# Agent 协作规则

本仓库是 AI Coding OS 方法套件、agent skills 和 `goal-proof` CLI 的源码仓库。

## 沟通与文档语言

- 始终用中文回复用户。
- `README.zh-CN.md`、`docs/**`、Goal Pack 叙述性正文优先使用中文。
- YAML 字段名、CLI 命令、代码符号、协议名、schema 示例和可复制模板可保留英文。
- 不写情绪价值开场白；分歧时按事实和约束说明。

## 当前顶层口径

AI Coding OS 面向高智能 agent，不面向弱模型防御式流程。默认落地边界是 workspace/repo，不进入方法论品牌名。

默认用户入口是 `$ai-coding-os`。它是轻量路由 skill，不拥有持久 artifact；按用户意图路由到：

- `$goal-proof`：目标计划、Goal Pack、跨会话延续、长期执行。
- `$docs-governance`：docs 分层、权威放置、文档清理和审计。
- `$frontend-architecture`：TypeScript 前端架构、依赖方向、命名语义、React / Effect / Query / Store 分层和 source-only package 边界。
- `$interface-capability-planning`：UI/IA、surface、route、交互状态、前端状态/数据归属和 InterfaceCapability trace 规划。
- `$product-harness-system`：通用 Harness artifact、claim ceiling、coverage matrix、生命周期和 trace 规范。
- `$ui-product-harness`：interface-headless、render wiring、browser-visible 和 production-near UI proof。
- `$headless-product-harness`：headless proof command、smoke evidence、fixture/replay、证据 envelope。
- inline work：一轮内可完成且有明确验证路径的小改动。

Goal Proof System 是本套件的目标计划和滚动执行载体。只要用户要求“生成目标计划 / Goal Plan / Goal Pack / 使用 Goal Proof System”，就进入 Goal Proof System；随口小改动不创建 Goal Pack，直接实施并验证。

默认工作流是：

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

Goal Pack 语义：

```text
goal.yaml             目标授权与人类意图压缩
progress.yaml               当前运行态
evidence.jsonl           追加式证据检查点
plans/<work_id>.md   仅 needs_plan 时存在
notes/                   长材料，不承载当前状态
```

当前仓库主路径使用 v2 Goal Pack schema：`schema_version: 2`、`goal.yaml`、`progress.yaml`、`evidence.jsonl`、`proof_step`、`work_items`、`evidence_id`、`work_id`、`next_action`、`claim_limit`、`completion review`。新增或重写方法论文档、CLI、checker、template、测试和 dogfood Goal Pack 时，同步更新相关文档和测试。

## Skill 迭代原则

持续优化 skill、schema、artifact 或字段时，默认按这些原则裁决：

- 面向高智能 agent：提供边界、claim、proof path、gap 和 stop rule，不设计弱模型防御式重流程。
- 非必要不结构化：只有当结构化 artifact 能帮助下一个 agent 执行、验证、审计或交接时才创建。
- 浅到够用：使用能支撑当前 claim 的最小分解深度；只有权限、状态归属、异步、realtime、可见性或 handoff 会含糊时才加深。
- DSL 要薄：能从源码、测试、路由、命令输出或现有 authority 推导的内容，不写进长期合同；除非它本身就是 contract。
- 字段按 claim 触发：不要为了“完整”添加字段；新增字段必须能约束 claim、暴露 gap、避免 overclaim，或改善 agent 执行。
- ownership 要硬：一个概念只能有一个主 owner；如果像两个 skill 都该管，先收敛边界，不新增混合层。
- proof level 不是 checklist：按 claim 选择最低诚实 proof level；不要默认跑满所有 harness 层级。
- 记录不声称的内容：会被误读的相邻 surface 要写 `not_claimed`；没有检查过的写 `not_proven`，不要伪装成已证明。
- 保持 claim 诚实：改 skill 口径时区分本仓公开 source claim 和下游 runtime install claim；本仓验证不能被说成任意 runtime 已安装。

## 目录结构

- `packages/cli/src/`：CLI 命令和库代码。
- `packages/cli/test/`：CLI 行为测试。
- `scripts/`：发布脚本和脚本级测试。
- `skills/`：AI Coding OS suite 的 agent skill 源码视图，按 router / goal / governance / architecture / capability / harness 分组。
- `docs/`：项目文档分层入口。先读 `docs/README.md`。
- `docs/standards/docs-governance.md`：本仓 docs layer、authority、promotion / demotion 和 audit 标准。
- `docs/standards/skill-source-layout.md`：公开 skill source layout、触发名和旧名退役标准。
- `docs/goal-proof/goals/`：Goal Pack 示例或历史工作记录。
- `assets/`：README 横幅等媒体资源。

## Docs 治理

遵循 `docs-governance` 口径：

- `docs/README.md` 是文档路由入口，不承载领域真相。
- `docs/product/**` 放产品/方法论定位和用户价值。
- `docs/ssot/**` 放当前事实、术语和不变量。
- `docs/standards/**` 放可执行规则、命令、质量门和协作 SOP。
- `docs/adr/**` 放已采纳取舍。
- `docs/architecture/**` 放系统结构、模块关系和运行时视图。
- `docs/roadmap/**` 放迁移顺序、状态、证据链接和后续波次。
- `docs/goal-proof/**` 放 Goal Proof System 方法产物；不要放项目级 docs 治理规则。
- 涉及 docs layer 准入、authority 顺序、promotion / demotion、旧材料清理或 audit 门时，按 `docs/standards/docs-governance.md`。
- 涉及 skill source layout、公开触发名或旧入口退役时，按 `docs/standards/skill-source-layout.md`。

新增或迁移文档时：

1. 先判断文档层。
2. 更新最近的 README / 索引。
3. 不保留两个 current home。
4. 不删除仍被引用的证据。
5. 报告只承载证据摘要，不写过程日记。

## 开发命令

使用 Bun。

```bash
bun install
bun run build
bun run typecheck
bun run test
bun run check
```

- `bun run build` 构建 CLI 到 `dist/`。
- `bun run typecheck` 运行 TypeScript 检查。
- `bun run test` 运行 Bun 测试。
- `bun run check` 运行 build、typecheck、test；提交前使用。
- `bun run pack:dry` 检查 npm 包内容。

## 代码规范

- TypeScript 使用 ES modules。
- 保持现有风格：2 空格缩进、分号、双引号、显式 `node:*` imports。
- 源码文件用 kebab-case；函数和变量用 camelCase。
- CLI 行为必须确定性；优先结构化解析，避免 ad hoc 字符串处理。

## Agent 实施规则

- 不重写真实 Goal Pack 的历史 `evidence.jsonl`；需要修正解释时追加新 evidence record。
- 默认继续推进：只要目标、边界、证据路径和风险仍在 `goal.yaml` 内，就继续执行。
- 不把普通目标膨胀成完整任务树；只找当前 `proof_step`，执行最大安全有用 slice。
- 只有 public API / schema / protocol、安全、权限、私有数据、破坏性迁移、release/compliance、多 agent 严格协作等场景才升级到 strict。
- `plans/<work_id>.md` 只用于 `needs_plan` 高风险 slice；它不是第二套任务系统。
- 改公开命令、Goal Pack schema、evidence record 语义、skill 口径时，同步更新 README、docs、skills、templates、checker rules 和测试。

## Pull Request

提交应保持 scope 小。PR 需要包含：

- 变更摘要；
- 用户可见命令或 schema 变化；
- 文档 / skill / template 是否同步；
- 验证命令，通常是 `bun run check`。
