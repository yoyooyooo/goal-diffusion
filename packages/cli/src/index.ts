export {
  activateGoalWork,
  appendEvidenceRecord,
  applyGoalProgress,
  compactEvidenceRecord,
  getActiveWorkItem,
  inspectGoalPack,
  loadGoalPack,
  matchesAllowedScope,
  normalizePath,
  parseEvidenceLog,
  parseGoal,
  parseProgress,
  renderWorkBrief,
  validateEvidenceRecord,
  validateGoalPack,
  GOAL_RELATION_TYPES,
} from "./lib/goal-pack.ts";

export { checkGoalPack } from "./check-goal-pack.ts";
export { runGoalProofCli } from "./goal-proof.ts";
export { runActivateWork } from "./activate-goal-work.ts";
export { runApply } from "./apply-goal-progress.ts";
export { runAppendEvidence } from "./append-evidence.ts";
export { runWorkBrief } from "./render-goal-work-brief.ts";
export { runEvidenceList, runEvidenceShow, listGoalEvidence, showGoalEvidence } from "./render-goal-evidence.ts";
export { runRelationsCheck, runRelationsGraph, runRelationsGoals, runRelationsList, runRelationsWork, checkGoalRelations, collectGoalRelationGoals, collectGoalRelations, collectGoalRelationWork, renderGoalRelationsGraph } from "./render-goal-relations.ts";
export { runWork, listGoalWork } from "./render-goal-work.ts";
export { runInspect } from "./inspect-goal-pack.ts";
export { runList, runSummary, listGoalPacks, summarizeGoalPacks, listGoalPackRoots, resolveGoalsRoot } from "./summarize-goal-packs.ts";
