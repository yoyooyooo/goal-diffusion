import { inspectGoalPack } from "./lib/goal-pack.ts";

export function runInspect(goalRoot, { json = false } = {}) {
  const summary = inspectGoalPack(goalRoot);
  if (json) return JSON.stringify(summary, null, 2);
  return [
    `goal_id: ${summary.goal_id}`,
    `status: ${summary.status}`,
    `objective: ${summary.objective}`,
    `active_work_item: ${summary.active_work_item ? `${summary.active_work_item.id} ${summary.active_work_item.type} ${summary.active_work_item.status}` : "null"}`,
    `next_action: ${summary.next_action}`,
    `can_continue: ${summary.can_continue}`,
    `work_items: ${summary.work_item_count}`,
    `evidence_records: ${summary.evidence_count}`,
    `last_evidence_record: ${summary.last_evidence_record ? `${summary.last_evidence_record.evidence_id} ${summary.last_evidence_record.result}` : "null"}`,
    `blockers: ${summary.blockers.length > 0 ? summary.blockers.join("; ") : "[]"}`,
    `warnings: ${summary.warnings.length > 0 ? summary.warnings.join("; ") : "[]"}`,
    `errors: ${summary.errors.length > 0 ? summary.errors.join("; ") : "[]"}`,
  ].join("\n");
}
