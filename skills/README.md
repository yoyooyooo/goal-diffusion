# Skills

本目录保存 AI Coding OS 公开 skill suite。物理目录按维护者阅读时的决策面分组；运行时触发名仍由每个 `SKILL.md` frontmatter 的 `name` 字段决定。

## Groups

| Group | Owns | Skills |
| --- | --- | --- |
| `router/` | 用户意图入口和方法编排 | `ai-coding-os` |
| `goal/` | Goal Pack、长期目标流转、evidence-backed execution | `goal-proof`, `goal-contracts`, `finding-proof-step`, `proof-step-implementation`, `write-work-plans` |
| `governance/` | docs layer、authority placement、cleanup、audit | `docs-governance` |
| `capability/` | interface capability、surface、state/data ownership、trace planning | `interface-capability-planning` |
| `harness/` | harness contract、headless proof、UI harness proof | `product-harness-system`, `headless-product-harness`, `ui-product-harness` |

## Common Vocabulary

- `claim`: 当前证据允许 agent 对外声明什么。
- `proof`: 怎么证明或证伪 claim。
- `evidence`: 实际观测到的命令输出、测试结果、截图、日志或 evidence record。
- `gap`: 当前 claim 未覆盖、仍需后续验证、实现、决策或人类介入的缺口。

`harness` 是 `proof` 的可运行实现：命令、测试、fixture、脚本、路由、组件或浏览器流程。

高能力 agent 不需要重流程；需要清楚边界、最小可运行验证路径、claim limit 和 gap。只有当结构化 artifact 能帮助下一个 agent 执行、验证或交接时才创建。

## Rules

- 不按目录名触发 skill；始终按 `name:` 触发。
- 新 skill 先判断 decision surface，再放入对应 group。
- 如果一个 skill 同时像两个 group，优先收敛它的 ownership，不新增混合 group。
- `skillshare` 支持递归发现；copy target 可能把嵌套路径编码成扁平目录名，这是分发细节，不改变本仓源码布局。
