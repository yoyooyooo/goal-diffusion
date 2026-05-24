# Standards

本层保存可执行规则、命令、质量门和协作 SOP。

## Owns

- 开发和验证命令。
- 文档治理规则。
- skill 分发和入口口径。
- Goal Diffusion schema 迁移时必须同步的对象。
- agent 协作规则。

## Must Not Own

- 产品定位。
- 当前 Goal Pack 运行状态。
- 未决取舍。

## 开发标准

使用 Bun：

```bash
bun install
bun run build
bun run typecheck
bun run test
bun run check
```

改公开命令、Goal Pack schema、receipt 语义、skill 口径时，同步更新：

- `README.zh-CN.md`
- `README.md`
- `skills/**`
- `skills/**/templates/**`
- CLI checker / renderer
- tests

## Skill 分发标准

- SSoT 是 `~/Documents/code/personal/personal-skills`。
- 本仓 `skills/` 是 AI Coding Project OS 公开 skill suite 的镜像，由 `$skill-manager` / `$skillshare` 分发。
- 本仓公开 suite 只保留平铺 skill：`ai-coding-project-os`、`docs-governance`、`headless-product-harness`、`goal-diffusion`、`goal-plans`、`finding-harnessed-path`、`diffusion-implementation`、`write-implementation-plans`。
- 旧 `ai-coding-project-governance` 不保留兼容 alias。
- 改 suite 收口策略时，先改 SSoT，再 sync 到本仓和运行时 targets。

## 文档标准

- 新增文档必须放入正确 `docs/*` 层。
- 高密度目录必须有 README。
- 不创建 `docs/specs/**`；实施规格放 root `specs/**`。
- 不保留两个 current home。
- 叙述性正文使用中文；字段名、命令、路径和 schema 示例可保留英文。

## Goal Diffusion 标准

- 默认采用 strong-agent optimistic workflow。
- Goal Diffusion 是当前唯一规划载体：用户明确要求目标计划、Goal Pack 或使用 `$goal-diffusion` 时由它生成规划。
- 随口小需求不创建 Goal Pack；直接 inline 实施并验证。
- 简单工作不引入 strict proof。
- 高风险工作使用 `evidence_mode: strict`。
- 真实 Goal Pack 的历史 `receipts.jsonl` 不重写，只追加。
- `implementation-plan.md` 不作为第二套任务系统。

## Read Next

- 当前事实：`../ssot/README.md`
- 结构视图：`../architecture/README.md`
