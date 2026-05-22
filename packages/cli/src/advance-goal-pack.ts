import { advanceGoalPack } from "./lib/goal-pack.ts";

export function runAdvance(goalRoot, { dryRun = false } = {}) {
  return advanceGoalPack(goalRoot, { dryRun });
}
