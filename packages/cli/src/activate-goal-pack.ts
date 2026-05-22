import { activateGoalPack } from "./lib/goal-pack.ts";

type ActivateOptions = {
  taskId?: string | null;
  dryRun?: boolean;
};

export function runActivate(goalRoot: string, { taskId, dryRun = false }: ActivateOptions = {}) {
  if (!taskId) throw new Error("activate requires --task T###");
  return activateGoalPack(goalRoot, { taskId, dryRun });
}
