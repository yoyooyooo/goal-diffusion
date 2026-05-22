import { inspectGoalPack } from "./lib/goal-pack.ts";

export function runInspect(goalRoot, { json = false } = {}) {
  const summary = inspectGoalPack(goalRoot);
  if (json) return JSON.stringify(summary, null, 2);
  return [
    `goal_id: ${summary.goal_id}`,
    `status: ${summary.status}`,
    `objective: ${summary.objective}`,
    `active_task: ${summary.active_task ? `${summary.active_task.id} ${summary.active_task.type} ${summary.active_task.status}` : "null"}`,
    `next_decision: ${summary.next_decision}`,
    `can_continue: ${summary.can_continue}`,
    `tasks: ${summary.task_count}`,
    `receipts: ${summary.receipt_count}`,
    `last_receipt: ${summary.last_receipt ? `${summary.last_receipt.task_id} ${summary.last_receipt.result}` : "null"}`,
    `blockers: ${summary.blockers.length > 0 ? summary.blockers.join("; ") : "[]"}`,
    `warnings: ${summary.warnings.length > 0 ? summary.warnings.join("; ") : "[]"}`,
    `errors: ${summary.errors.length > 0 ? summary.errors.join("; ") : "[]"}`,
  ].join("\n");
}
