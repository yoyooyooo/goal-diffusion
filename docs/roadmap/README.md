# Roadmap

本层保存顺序、状态、证据链接和迁移波次。

## Owns

- 已选择的迁移顺序。
- 当前状态摘要。
- 证据链接。
- 待执行 Goal Pack 或 roadmap 级 gap。

## Must Not Own

- 逐步实施任务清单。
- receipt 细节。
- 产品事实。

## 当前状态

已完成：

- v1 Goal Pack schema 迁移：`charter.yaml`、`completion`、`engineering_guidance`、`checks`、`evidence_map`。
- CLI / checker / renderer / tests / README / skills / templates / dogfood Goal Pack 主路径同步到 v1 口径。
- 仓库定位升级为 AI Coding Project OS 项目仓。
- skill 收口为 8 个平铺公开 skill，并通过 `skill-manager` / `skillshare` 分发到本仓 `skills/`。

已完成 Goal Pack 状态由 `../goal-diffusion/goals/` 下 receipts 保留。当前没有 active Goal Pack。

## 后续波次

- 如果未来决定重命名 CLI / npm package，再单独开 Goal Pack；当前明确保留 `goal-diffusion`。
- 如果 OS 入口未来承载 CLI 或更重 artifact lifecycle，再重新评估 CLI / npm package 命名。
- 新增方法 skill 时，先更新 SSoT、scene profile、suite 镜像、README 和 docs 索引，再分发。

## Evidence

- 顶层目标口径：`../../README.zh-CN.md`
- 文档路由：`../README.md`
- 当前事实：`../ssot/README.md`
- v1 迁移记录：`../goal-diffusion/goals/2026-05-24-charter-v1-dogfood-migration/`
