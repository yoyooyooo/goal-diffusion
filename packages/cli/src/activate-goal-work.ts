import { activateGoalWork } from "./lib/goal-pack.ts";

type ActivateOptions = {
  workId?: string | null;
  dryRun?: boolean;
};

export function runActivateWork(goalRoot: string, { workId, dryRun = false }: ActivateOptions = {}) {
  if (!workId) throw new Error("work activate requires --work W###");
  return activateGoalWork(goalRoot, { workId, dryRun });
}
