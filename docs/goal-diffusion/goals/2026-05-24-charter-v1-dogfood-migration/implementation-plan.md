# 2026-05-24-charter-v1-dogfood-migration Implementation Plan

## Goal Pack

- charter: `docs/goal-diffusion/goals/2026-05-24-charter-v1-dogfood-migration/charter.yaml`
- state: `docs/goal-diffusion/goals/2026-05-24-charter-v1-dogfood-migration/state.yaml`
- receipts: `docs/goal-diffusion/goals/2026-05-24-charter-v1-dogfood-migration/receipts.jsonl`
- plan: `docs/goal-diffusion/goals/2026-05-24-charter-v1-dogfood-migration/implementation-plan.md`
- task: `T002`

本计划只约束高风险 schema / CLI / 历史 Goal Pack 迁移 slice。执行状态继续由本 Goal Pack 的 `state.yaml` 和 `receipts.jsonl` 拥有；`docs/roadmap/**` 只能承载迁移波次摘要和证据链接。

## Protected Boundary

- objective: migrate this repository to the future v1 charter-based schema and strong-agent optimistic workflow.
- completion: docs, skills, templates, CLI behavior, checker behavior, tests, and dogfood Goal Packs use `charter.yaml`, `completion`, `checks`, and `evidence_map` as the primary path.
- claim_boundary: repository-local migration only; no external project migration, npm release, or stable public v1 release claim.
- stop_if: public compatibility or release/versioning needs a product decision; historical rewrite would destroy unrecoverable evidence; default path would require strict proof fields.

## Allowed Scope

- T003: `skills/goal-diffusion/templates/**`, `skills/goal-diffusion/references/**`, `skills/goal-diffusion/SKILL.md`, phase skills.
- T004: `packages/cli/**`, `scripts/**`, root/package README files, docs touched by CLI behavior.
- T005: `docs/goal-diffusion/goals/**`, `docs/goal-diffusion/README.md`, `docs/goal-diffusion/sources/**`.
- T999: current Goal Pack files plus `docs/goal-diffusion/README.md`.

## Execution Chunks

1. Template and checker-facing examples:
   - Rename the active template from legacy contract shape to `charter.yaml`.
   - Convert receipt examples from `commands` to `checks`.
   - Convert final audit examples to `evidence_map`, `not_claimed`, and `remaining_gaps`.
   - Keep relation metadata in `charter.yaml`.

2. CLI parser/checker/renderer/tests:
   - Teach Goal Pack loading to prefer `charter.yaml`.
   - Render `completion.signal` and `completion.final_proof`.
   - Validate worker receipts with `checks` and final audit `evidence_map`.
   - Keep compatibility only as an internal migration aid if needed, not as a product promise.
   - Update tests before claiming checker validation.

3. Historical dogfood Goal Packs:
   - Rewrite each `docs/goal-diffusion/goals/**/contract.yaml` to `charter.yaml`.
   - Convert old fields: `completion_oracle` -> `completion`, `architecture_standard` -> `engineering_guidance`, `autonomy_policy.protected_fields` -> `autonomy.cannot_silently_change`, receipt `commands` -> `checks`.
   - Preserve evidence meaning while rewriting schema; do not delete historical receipt claims.
   - Update `docs/goal-diffusion/README.md` indexes and thread notes.

4. Final audit:
   - Run repository check, docs audit, v1 Goal Pack check, and static vocabulary scan.
   - Append T999 audit receipt with `evidence_map`, `not_claimed`, `remaining_gaps`, and `oracle_satisfied: true` only if every completion proof element has current evidence.

## Verification

- `bun run check`
- `python3 /Users/yoyo/.agents/skills/ai-coding-project-governance/scripts/run_docs_audit.py --repo /Users/yoyo/Documents/code/personal/goal-diffusion`
- `goal-diffusion check docs/goal-diffusion/goals/2026-05-24-charter-v1-dogfood-migration`
- `rg -n "contract.yaml|completion_oracle|architecture_standard|protected_fields|\"commands\"|Goal Plan" README.md README.zh-CN.md AGENTS.md docs skills packages scripts`

## Receipt Requirements

Each implementation receipt must include:

```json
{
  "task_id": "T###",
  "type": "worker",
  "result": "done",
  "changed_files": [],
  "checks": [{ "kind": "command", "cmd": "<verification>", "status": "pass" }],
  "evidence": [],
  "claims": [],
  "not_claimed": [],
  "summary": "",
  "next_decision": "continue"
}
```

T999 final audit must map every `completion.final_proof` clause to evidence:

```json
{
  "task_id": "T999",
  "type": "audit",
  "result": "done",
  "decision": "complete",
  "oracle_satisfied": true,
  "evidence_map": [],
  "not_claimed": [],
  "remaining_gaps": [],
  "summary": "",
  "next_decision": "done"
}
```

## Handoff

- ready_for_run: true
- blocked_by: []
- next_decision: continue
