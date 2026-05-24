import { loadGoalPack, TASK_STATUSES } from "./lib/goal-pack.ts";
import { limitItems, maybeSet, normalizeReadControls, readControlFilterFields, setIncluded, setOmittedCount } from "./read-output-control.ts";
import { COMPLETION_VALUES } from "./summarize-goal-packs.ts";

export function runTasks(goalRoot, options: any = {}) {
  const { json = false } = options;
  const result = listGoalTasks(goalRoot, json ? options : withIncluded(options, "objective"));
  if (json) return JSON.stringify(result, null, 2);
  return renderTasksText(result);
}

function withIncluded(options, field) {
  const include = options.include ? `${options.include},${field}` : field;
  return { ...options, include };
}

export function listGoalTasks(goalRoot, filterOptions = {}) {
  const controls = normalizeReadControls(filterOptions);
  const filters = normalizeTaskFilters(filterOptions);
  const pack = loadGoalPack(goalRoot);
  const tasks = pack.state.tasks.filter((task) => matchesTaskFilters(task, filters));
  const limited = limitItems(tasks, controls.limit);

  const result: any = {
    goal_id: pack.contract.id || pack.state.goal_id || pack.name,
    filters: {
      ...filters,
      ...readControlFilterFields(controls),
    },
    count: tasks.length,
    shown: limited.items.length,
    items: limited.items.map((task) => compactTaskItem(task, controls)),
  };
  setIncluded(result, "path", pack.root, controls);
  setOmittedCount(result, "items_omitted", limited.omitted, controls);
  return result;
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

function compactTaskItem(task, controls) {
  const item: any = {
    id: task.id,
    type: task.type,
    status: task.status,
  };
  setIncluded(item, "objective", task.objective || null, controls);
  maybeSet(item, "plan", task.plan, controls);
  if (controls.show_empty) {
    item.allowed_scope = task.allowed_scope;
    item.verify = task.verify;
    item.stop_if = task.stop_if;
  } else {
    setIncluded(item, "allowed_scope", task.allowed_scope, controls);
    setIncluded(item, "verify", task.verify, controls);
    setIncluded(item, "stop_if", task.stop_if, controls);
  }
  return item;
}
