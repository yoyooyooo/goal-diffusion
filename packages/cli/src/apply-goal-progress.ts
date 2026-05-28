import { applyGoalProgress } from "./lib/goal-pack.ts";

export function runApply(goalRoot, { dryRun = false } = {}) {
  return applyGoalProgress(goalRoot, { dryRun });
}
