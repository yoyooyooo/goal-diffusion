# Standards

本层保存可执行规则、命令、质量门和协作 SOP。

## Owns

- 开发和验证命令。
- 文档治理规则。
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

## 文档标准

- 新增文档必须放入正确 `docs/*` 层。
- 高密度目录必须有 README。
- 不创建 `docs/specs/**`；实施规格放 root `specs/**`。
- 不保留两个 current home。
- 叙述性正文使用中文；字段名、命令、路径和 schema 示例可保留英文。

## Goal Diffusion 标准

- 默认采用 strong-agent optimistic workflow。
- 简单工作不引入 strict proof。
- 高风险工作使用 `evidence_mode: strict`。
- 真实 Goal Pack 的历史 `receipts.jsonl` 不重写，只追加。
- `implementation-plan.md` 不作为第二套任务系统。

## Read Next

- 当前事实：`../ssot/README.md`
- 结构视图：`../architecture/README.md`
