import { loadGoalPack, validateGoalPack } from "./lib/goal-pack.ts";

export function checkGoalPack(goalRoot) {
  return validateGoalPack(loadGoalPack(goalRoot));
}

export function printCheckResult(result) {
  console.log(JSON.stringify(result, null, 2));
}
