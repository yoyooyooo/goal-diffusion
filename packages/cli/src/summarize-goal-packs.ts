import { existsSync, readdirSync, statSync } from "node:fs";
import { basename, dirname, join, resolve } from "node:path";
import {
  loadGoalPack,
  NEXT_DECISIONS,
  STATUS_VALUES,
  TASK_STATUSES,
  validateGoalPack,
} from "./lib/goal-pack.ts";
import {
  limitItems,
  maybeSet,
  normalizeReadControls,
  readControlFilterFields,
  setIncluded,
  setOmittedCount,
  SUMMARY_DEPTH_VALUES,
  wantsField,
  withoutZeroBuckets,
} from "./read-output-control.ts";

export const COMPLETION_VALUES = ["all", "todo", "done"];

export function runSummary(target = ".", options: any = {}) {
  const { json = false } = options;
  const summary = summarizeGoalPacks(target, options);
  if (json) return JSON.stringify(summary, null, 2);
  return renderSummaryText(summary);
}

export function runList(target = ".", options: any = {}) {
  const { json = false } = options;
  const list = listGoalPacks(target, options);
  if (json) return JSON.stringify(list, null, 2);
  return renderListText(list);
}

export function summarizeGoalPacks(target = ".", filterOptions = {}) {
  const controls = normalizeReadControls(filterOptions, {
    allowedDepths: SUMMARY_DEPTH_VALUES,
    defaultDepth: "groups",
    defaultLimit: 20,
  });
  const { goalsRoot, filters, items } = collectGoalPackSummaries(target, filterOptions);
  const grouped = groupSummaries(items);
  const totals = aggregateSummaries(items, controls);
  const result: any = {
    filters: {
      ...filters,
      ...readControlFilterFields(controls),
    },
    goals: totals.goals,
    tasks: totals.tasks,
    receipt_count: totals.receipt_count,
    problem_count: totals.problem_count,
  };

  setIncluded(result, "goals_root", goalsRoot, controls, ["path", "goals_root"]);
  maybeSet(result, "warnings", totals.warnings, controls);
  maybeSet(result, "errors", totals.errors, controls);

  if (controls.depth === "repo") {
    result.threads = threadTotals(grouped.threads, controls);
    result.unthreaded = groupSummary(grouped.unthreaded, controls);
    return result;
  }

  const limitedThreads = limitItems(grouped.threads, controls.limit);
  result.threads = limitedThreads.items.map((thread) => threadSummary(thread, controls));
  setOmittedCount(result, "threads_omitted", limitedThreads.omitted, controls);
  result.unthreaded = groupSummary(grouped.unthreaded, controls);

  if (controls.depth === "items") {
    for (const thread of result.threads) {
      const source = grouped.threads.find((item) => item.thread_id === thread.thread_id);
      const limitedGoals = limitItems(source.items, controls.limit);
      thread.items = limitedGoals.items.map((item) => compactGoalItem(item, controls));
      setOmittedCount(thread, "items_omitted", limitedGoals.omitted, controls);
    }
    const limitedItems = limitItems(grouped.unthreaded, controls.limit);
    result.items = limitedItems.items.map((item) => compactGoalItem(item, controls));
    setOmittedCount(result, "items_omitted", limitedItems.omitted, controls);
  }

  return result;
}

export function listGoalPacks(target = ".", filterOptions = {}) {
  const controls = normalizeReadControls(filterOptions);
  const { goalsRoot, filters, items } = collectGoalPackSummaries(target, filterOptions);
  const limited = limitItems(items, controls.limit);
  const compactItems = limited.items.map((item) => compactGoalItem(item, controls));
  const result: any = {
    filters: {
      ...filters,
      ...readControlFilterFields(controls),
    },
    count: items.length,
    shown: compactItems.length,
    items: compactItems,
  };
  setIncluded(result, "goals_root", goalsRoot, controls, ["path", "goals_root"]);
  setOmittedCount(result, "items_omitted", limited.omitted, controls);
  return result;
}

function renderSummaryText(summary) {
  const lines = [
    summary.goals_root ? `goals_root: ${summary.goals_root}` : null,
    `filters: completion=${summary.filters.completion} status=${summary.filters.status}`,
    `goals: total=${summary.goals.total} done=${summary.goals.done} todo=${summary.goals.todo} retired=${summary.goals.retired}`,
    `tasks: total=${summary.tasks.total} done=${summary.tasks.done} todo=${summary.tasks.todo}`,
    `receipts: ${summary.receipt_count}`,
    `problem_packs: ${summary.problem_count}`,
    `threads: ${Array.isArray(summary.threads) ? summary.threads.length : summary.threads.total}`,
    `unthreaded: ${summary.unthreaded.goals.total}`,
  ].filter(Boolean);
  if (summary.warnings) lines.push(`warnings: ${summary.warnings.length > 0 ? summary.warnings.join("; ") : "[]"}`);
  if (summary.errors) lines.push(`errors: ${summary.errors.length > 0 ? summary.errors.join("; ") : "[]"}`);
  if (Array.isArray(summary.threads)) {
    for (const thread of summary.threads) {
      lines.push(`${thread.thread_id}  goals=${thread.goals.total} done=${thread.goals.done} todo=${thread.goals.todo}`);
    }
  }
  if (Array.isArray(summary.items)) {
    for (const item of summary.items) lines.push(`${item.goal_id}  status=${item.status} next_decision=${item.next_decision}`);
  }
  return lines.join("\n");
}

function renderListText(list) {
  const lines = [
    ...(list.goals_root ? [`goals_root: ${list.goals_root}`] : []),
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
  const relations = pack.contract.goal_relations || { thread_id: null };
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
    objective: pack.contract.objective || null,
    thread_id: relations.thread_id || null,
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

function groupSummaries(items) {
  const threads = new Map();
  const unthreaded = [];
  for (const item of items) {
    if (!item.thread_id) {
      unthreaded.push(item);
      continue;
    }
    if (!threads.has(item.thread_id)) threads.set(item.thread_id, { thread_id: item.thread_id, items: [] });
    threads.get(item.thread_id).items.push(item);
  }
  return {
    threads: [...threads.values()].sort((a, b) => a.thread_id.localeCompare(b.thread_id)),
    unthreaded,
  };
}

function threadTotals(threads, controls) {
  return {
    total: threads.length,
    ...groupSummary(threads.flatMap((thread) => thread.items), controls),
  };
}

function threadSummary(thread, controls) {
  return {
    thread_id: thread.thread_id,
    ...groupSummary(thread.items, controls),
  };
}

function groupSummary(items, controls) {
  return aggregateSummaries(items, controls, { compact: true });
}

function aggregateSummaries(items, controls, { compact = false } = {}) {
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
  const goals: any = {
    total: totalGoals,
    done: goalStatusCounts.done,
    todo: Math.max(0, totalGoals - goalStatusCounts.done - goalStatusCounts.retired),
    retired: goalStatusCounts.retired,
  };
  const tasks: any = {
    total: totalTasks,
    done: taskStatusCounts.done,
    todo: Math.max(0, totalTasks - taskStatusCounts.done),
  };
  if (!compact || wantsField(controls, "by_status") || controls.show_empty) {
    goals.by_status = withoutZeroBuckets(goalStatusCounts, controls);
    goals.by_next_decision = withoutZeroBuckets(nextDecisionCounts, controls);
    tasks.by_status = withoutZeroBuckets(taskStatusCounts, controls);
  }
  const result: any = {
    goals,
    tasks,
    receipt_count: receiptCount,
    problem_count: problemPacks.length,
  };
  const warnings = problemPacks.flatMap((item) => item.warnings.map((warning) => `${item.goal_id}: ${warning}`));
  const errors = problemPacks.flatMap((item) => item.errors.map((error) => `${item.goal_id}: ${error}`));
  if (compact) {
    maybeSet(result, "warnings", warnings, controls);
    maybeSet(result, "errors", errors, controls);
  } else {
    result.warnings = warnings;
    result.errors = errors;
  }
  return result;
}

function compactGoalItem(item, controls) {
  const result = {
    goal_id: item.goal_id,
    status: item.status,
    next_decision: item.next_decision,
    tasks: {
      total: item.tasks.total,
      done: item.tasks.done,
      todo: item.tasks.todo,
    },
    receipt_count: item.receipt_count,
  };
  maybeSet(result, "active_task", item.active_task, controls);
  maybeSet(result, "thread_id", item.thread_id, controls);
  setIncluded(result, "path", item.path, controls);
  setIncluded(result, "objective", item.objective, controls);
  maybeSet(result, "warnings", item.warnings, controls);
  maybeSet(result, "errors", item.errors, controls);
  return result;
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
