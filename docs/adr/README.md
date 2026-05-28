# ADR

本层保存已采纳的架构和方法论取舍。

## Owns

- 已采纳决策。
- 被拒绝的主要替代方案。
- 决策后果。

## Must Not Own

- 当前任务状态。
- 完整 standards。
- 临时提案或开放问题。

## Boundary

ADR 记录已经采纳的长期取舍、主要替代方案和后果。ADR 不代替 SSoT 的当前事实，
也不代替 standards 的可执行规则。一个 ADR 被接受后，仍应把稳定事实 promote 到
SSoT，把执行规则 promote 到 standards。

## Promotion / Demotion

- 需要长期解释“为什么这样命名、为什么这样分层、为什么拒绝替代方案”的决策，promote 到 ADR。
- ADR 中形成的当前事实应同步到 SSoT；可执行规则应同步到 standards。
- 过期或被替代的 ADR 不改写历史，可新增 successor ADR 或在索引中标明 superseded。

## Conflict

SSoT 和 standards 承载当前口径；ADR 承载决策原因。若 ADR 与当前 SSoT /
standards 不一致，先判断是否已有后续 ADR 或标准更新；没有时记录 governance gap。

## 使用方式

当某个选择会长期影响命名、schema、CLI surface、docs layer 或 agent 工作流时，创建 ADR。

使用模板：`_template.md`。

## Accepted

- [2026-05-28 AI Coding OS 命名与边界](2026-05-28-ai-coding-os-naming-and-boundary.md)

## Read Next

- 文档路由：`../README.md`
- 当前事实：`../ssot/README.md`
- 文档治理：`../standards/docs-governance.md`
