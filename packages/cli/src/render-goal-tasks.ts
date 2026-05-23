import { loadGoalPack, TASK_STATUSES } from "./lib/goal-pack.ts";
import { COMPLETION_VALUES } from "./summarize-goal-packs.ts";

export function runTasks(goalRoot, { json = false, completion = "todo", status = null } = {}) {
  const result = listGoalTasks(goalRoot, { completion, status });
  if (json) return JSON.stringify(result, null, 2);
  return renderTasksText(result);
}

export function listGoalTasks(goalRoot, filterOptions = {}) {
  const filters = normalizeTaskFilters(filterOptions);
  const pack = loadGoalPack(goalRoot);
  const tasks = pack.state.tasks.filter((task) => matchesTaskFilters(task, filters));

  return {
    goal_id: pack.contract.id || pack.state.goal_id || pack.name,
    path: pack.root,
    filters,
    count: tasks.length,
    items: tasks,
  };
}

function normalizeTaskFilters({ completion = "todo", status = null } = {}) {
  if (!COMPLETION_VALUES.includes(completion)) {
    throw new Error(`completion must be ${COMPLETION_VALUES.join(", ")}; got ${completion || "<missing>"}`);
  }
  if (status !== null && status !== "all" && !TASK_STATUSES.includes(status)) {
    throw new Error(`status must be ${TASK_STATUSES.join(", ")}; got ${status}`);
  }
  return {
    completion,
    status: status || "all",
  };
}

function matchesTaskFilters(task, filters) {
  return matchesTaskCompletion(task, filters.completion)
    && (filters.status === "all" || task.status === filters.status);
}

function matchesTaskCompletion(task, completion) {
  if (completion === "all") return true;
  if (completion === "done") return task.status === "done";
  return task.status !== "done";
}

function renderTasksText(result) {
  const lines = [
    `goal_id: ${result.goal_id}`,
    `filters: completion=${result.filters.completion} status=${result.filters.status}`,
    `tasks: ${result.count}`,
  ];
  for (const task of result.items) {
    lines.push(`${task.id}  ${task.status}  ${task.type}  ${task.objective || ""}`);
  }
  return lines.join("\n");
}
