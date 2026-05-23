import { existsSync, readdirSync, statSync } from "node:fs";
import { basename, dirname, join, resolve } from "node:path";
import {
  loadGoalPack,
  NEXT_DECISIONS,
  STATUS_VALUES,
  TASK_STATUSES,
  validateGoalPack,
} from "./lib/goal-pack.ts";

export const COMPLETION_VALUES = ["all", "todo", "done"];

export function runSummary(target = ".", { json = false, completion = "all", status = null } = {}) {
  const summary = summarizeGoalPacks(target, { completion, status });
  if (json) return JSON.stringify(summary, null, 2);
  return renderSummaryText(summary);
}

export function runList(target = ".", { json = false, completion = "all", status = null } = {}) {
  const list = listGoalPacks(target, { completion, status });
  if (json) return JSON.stringify(list, null, 2);
  return renderListText(list);
}

export function summarizeGoalPacks(target = ".", filterOptions = {}) {
  const { goalsRoot, filters, items } = collectGoalPackSummaries(target, filterOptions);
  const goalStatusCounts = emptyCounts([...STATUS_VALUES, "unknown"]);
  const nextDecisionCounts = emptyCounts([...NEXT_DECISIONS, "unknown"]);
  const taskStatusCounts = emptyCounts([...TASK_STATUSES, "unknown"]);
  let receiptCount = 0;

  for (const item of items) {
    increment(goalStatusCounts, item.status);
    increment(nextDecisionCounts, item.next_decision);
    receiptCount += item.receipt_count;
    for (const [status, count] of Object.entries(item.tasks.by_status)) {
      taskStatusCounts[status] = (taskStatusCounts[status] || 0) + count;
    }
  }

  const totalGoals = items.length;
  const totalTasks = Object.values(taskStatusCounts).reduce((sum, count) => sum + count, 0);
  const problemPacks = items.filter((item) => item.errors.length > 0 || item.warnings.length > 0);

  return {
    goals_root: goalsRoot,
    filters,
    goals: {
      total: totalGoals,
      done: goalStatusCounts.done,
      todo: Math.max(0, totalGoals - goalStatusCounts.done - goalStatusCounts.retired),
      retired: goalStatusCounts.retired,
      by_status: goalStatusCounts,
      by_next_decision: nextDecisionCounts,
    },
    tasks: {
      total: totalTasks,
      done: taskStatusCounts.done,
      todo: Math.max(0, totalTasks - taskStatusCounts.done),
      by_status: taskStatusCounts,
    },
    receipt_count: receiptCount,
    problem_count: problemPacks.length,
    warnings: problemPacks.flatMap((item) => item.warnings.map((warning) => `${item.goal_id}: ${warning}`)),
    errors: problemPacks.flatMap((item) => item.errors.map((error) => `${item.goal_id}: ${error}`)),
    items,
  };
}

export function listGoalPacks(target = ".", filterOptions = {}) {
  const { goalsRoot, filters, items } = collectGoalPackSummaries(target, filterOptions);
  return {
    goals_root: goalsRoot,
    filters,
    count: items.length,
    items,
  };
}

function renderSummaryText(summary) {
  return [
    `goals_root: ${summary.goals_root}`,
    `filters: completion=${summary.filters.completion} status=${summary.filters.status}`,
    `goals: total=${summary.goals.total} done=${summary.goals.done} todo=${summary.goals.todo} retired=${summary.goals.retired}`,
    `goal_status: ${formatCounts(summary.goals.by_status, [...STATUS_VALUES, "unknown"])}`,
    `next_decision: ${formatCounts(summary.goals.by_next_decision, [...NEXT_DECISIONS, "unknown"])}`,
    `tasks: total=${summary.tasks.total} done=${summary.tasks.done} todo=${summary.tasks.todo}`,
    `task_status: ${formatCounts(summary.tasks.by_status, TASK_STATUSES)}`,
    `receipts: ${summary.receipt_count}`,
    `problem_packs: ${summary.problem_count}`,
    `warnings: ${summary.warnings.length > 0 ? summary.warnings.join("; ") : "[]"}`,
    `errors: ${summary.errors.length > 0 ? summary.errors.join("; ") : "[]"}`,
  ].join("\n");
}

function renderListText(list) {
  const lines = [
    `goals_root: ${list.goals_root}`,
    `filters: completion=${list.filters.completion} status=${list.filters.status}`,
    `goals: ${list.count}`,
  ];
  for (const item of list.items) {
    lines.push(`${item.goal_id}  status=${item.status} next_decision=${item.next_decision} active_task=${item.active_task || "null"} tasks=${item.tasks.total} done=${item.tasks.done} todo=${item.tasks.todo} receipts=${item.receipt_count}`);
  }
  return lines.join("\n");
}

function collectGoalPackSummaries(target, filterOptions) {
  const goalsRoot = resolveGoalsRoot(target);
  const filters = normalizeFilters(filterOptions);
  const items = listGoalPackRoots(goalsRoot)
    .map((root) => summarizeOneGoalPack(root))
    .filter((item) => matchesFilters(item, filters));
  return { goalsRoot, filters, items };
}

function normalizeFilters({ completion = "all", status = null } = {}) {
  if (!COMPLETION_VALUES.includes(completion)) {
    throw new Error(`completion must be ${COMPLETION_VALUES.join(", ")}; got ${completion || "<missing>"}`);
  }
  if (status !== null && status !== "all" && !STATUS_VALUES.includes(status)) {
    throw new Error(`status must be ${STATUS_VALUES.join(", ")}; got ${status}`);
  }
  return {
    completion,
    status: status || "all",
  };
}

function matchesFilters(item, filters) {
  return matchesCompletion(item, filters.completion)
    && (filters.status === "all" || item.status === filters.status);
}

function matchesCompletion(item, completion) {
  if (completion === "all") return true;
  if (completion === "done") return item.status === "done";
  return item.status !== "done" && item.status !== "retired";
}

export function resolveGoalsRoot(target = ".", { cwd = process.cwd() } = {}) {
  const direct = resolve(cwd, target || ".");
  const nested = join(direct, "docs", "goal-diffusion", "goals");
  if (isGoalsDirectory(direct)) return direct;
  if (isGoalsDirectory(nested)) return nested;

  const upward = findGoalsRootUpward(direct);
  if (upward) return upward;

  throw new Error(`goals root not found: ${target || "."}`);
}

function findGoalsRootUpward(startDir) {
  let current = resolve(startDir);
  while (true) {
    const candidate = join(current, "docs", "goal-diffusion", "goals");
    if (isGoalsDirectory(candidate)) return candidate;
    const parent = dirname(current);
    if (parent === current) return null;
    current = parent;
  }
}

function isGoalsDirectory(path) {
  try {
    return existsSync(path) && statSync(path).isDirectory() && basename(path) === "goals";
  } catch {
    return false;
  }
}

export function listGoalPackRoots(goalsRoot) {
  return readdirSync(goalsRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => join(goalsRoot, entry.name))
    .filter((root) => existsSync(join(root, "contract.yaml")) || existsSync(join(root, "state.yaml")) || existsSync(join(root, "receipts.jsonl")))
    .sort();
}

function summarizeOneGoalPack(root) {
  const pack = loadGoalPack(root);
  const validation = validateGoalPack(pack);
  const status = knownOrUnknown(pack.state.status || pack.contract.status, STATUS_VALUES);
  const nextDecision = knownOrUnknown(pack.state.next_decision, NEXT_DECISIONS);
  const taskStatusCounts = emptyCounts([...TASK_STATUSES, "unknown"]);

  for (const task of pack.state.tasks) {
    increment(taskStatusCounts, knownOrUnknown(task.status, TASK_STATUSES));
  }

  const totalTasks = pack.state.tasks.length;

  return {
    goal_id: pack.contract.id || pack.state.goal_id || pack.name,
    path: pack.root,
    status,
    next_decision: nextDecision,
    active_task: pack.state.active_task,
    tasks: {
      total: totalTasks,
      done: taskStatusCounts.done,
      todo: Math.max(0, totalTasks - taskStatusCounts.done),
      by_status: taskStatusCounts,
    },
    receipt_count: pack.receipts.length,
    warnings: validation.warnings,
    errors: validation.errors,
  };
}

function emptyCounts(keys) {
  return Object.fromEntries(keys.map((key) => [key, 0]));
}

function increment(counts, key) {
  counts[key] = (counts[key] || 0) + 1;
}

function knownOrUnknown(value, allowed) {
  return allowed.includes(value) ? value : "unknown";
}

function formatCounts(counts, keys) {
  return keys.map((key) => `${key}=${counts[key] || 0}`).join(" ");
}
