import { loadGoalPack, WORK_ITEM_STATUSES } from "./lib/goal-pack.ts";
import { limitItems, maybeSet, normalizeReadControls, readControlFilterFields, setIncluded, setOmittedCount } from "./read-output-control.ts";
import { COMPLETION_VALUES } from "./summarize-goal-packs.ts";

export function runWork(goalRoot, options: any = {}) {
  const { json = false } = options;
  const result = listGoalWork(goalRoot, json ? options : withIncluded(options, "objective"));
  if (json) return JSON.stringify(result, null, 2);
  return renderWorkText(result);
}

function withIncluded(options, field) {
  const include = options.include ? `${options.include},${field}` : field;
  return { ...options, include };
}

export function listGoalWork(goalRoot, filterOptions = {}) {
  const controls = normalizeReadControls(filterOptions);
  const filters = normalizeWorkFilters(filterOptions);
  const pack = loadGoalPack(goalRoot);
  const workItems = pack.progress.work_items.filter((item) => matchesWorkFilters(item, filters));
  const limited = limitItems(workItems, controls.limit);

  const result: any = {
    goal_id: pack.goal.id || pack.progress.goal_id || pack.name,
    filters: {
      ...filters,
      ...readControlFilterFields(controls),
    },
    count: workItems.length,
    shown: limited.items.length,
    items: limited.items.map((item) => compactWorkItem(item, controls)),
  };
  setIncluded(result, "path", pack.root, controls);
  setOmittedCount(result, "items_omitted", limited.omitted, controls);
  return result;
}

function normalizeWorkFilters({ completion = "todo", status = null } = {}) {
  if (!COMPLETION_VALUES.includes(completion)) {
    throw new Error(`completion must be ${COMPLETION_VALUES.join(", ")}; got ${completion || "<missing>"}`);
  }
  if (status !== null && status !== "all" && !WORK_ITEM_STATUSES.includes(status)) {
    throw new Error(`status must be ${WORK_ITEM_STATUSES.join(", ")}; got ${status}`);
  }
  return {
    completion,
    status: status || "all",
  };
}

function matchesWorkFilters(item, filters) {
  return matchesWorkCompletion(item, filters.completion)
    && (filters.status === "all" || item.status === filters.status);
}

function matchesWorkCompletion(item, completion) {
  if (completion === "all") return true;
  if (completion === "done") return item.status === "done";
  return item.status !== "done";
}

function renderWorkText(result) {
  const lines = [
    `goal_id: ${result.goal_id}`,
    `filters: completion=${result.filters.completion} status=${result.filters.status}`,
    `work_items: ${result.count}`,
  ];
  for (const item of result.items) {
    lines.push(`${item.id}  ${item.status}  ${item.type}  ${item.objective || ""}`);
  }
  return lines.join("\n");
}

function compactWorkItem(item, controls) {
  const output: any = {
    id: item.id,
    type: item.type,
    status: item.status,
  };
  setIncluded(output, "objective", item.objective || null, controls);
  maybeSet(output, "plan", item.plan, controls);
  if (controls.show_empty) {
    output.allowed_scope = item.allowed_scope;
    output.checks = item.checks;
    output.stop_if = item.stop_if;
  } else {
    setIncluded(output, "allowed_scope", item.allowed_scope, controls);
    setIncluded(output, "checks", item.checks, controls);
    setIncluded(output, "stop_if", item.stop_if, controls);
  }
  return output;
}
