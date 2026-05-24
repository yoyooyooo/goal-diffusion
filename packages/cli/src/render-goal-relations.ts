import { loadGoalPack, GOAL_RELATION_TYPES, NEXT_DECISIONS, STATUS_VALUES, TASK_STATUSES } from "./lib/goal-pack.ts";
import { limitItems, maybeSet, normalizeReadControls, readControlFilterFields, setIncluded, setOmittedCount, wantsField, withoutZeroBuckets } from "./read-output-control.ts";
import { COMPLETION_VALUES, listGoalPackRoots, resolveGoalsRoot } from "./summarize-goal-packs.ts";

const HARD_RELATIONS = ["successor_of", "depends_on", "supersedes"];

export function runRelationsList(target = ".", { json = false, thread = null, limit = null, include = null, showEmpty = false } = {}) {
  const readOptions = json ? { thread, limit, include, showEmpty } : { thread, limit, include: include ? `${include},links,path` : "links,path", showEmpty };
  const model = collectGoalRelations(target, readOptions);
  if (json) return JSON.stringify(model, null, 2);
  return renderRelationsListText(model);
}

export function runRelationsCheck(target = ".", { json = false, thread = null } = {}) {
  const model = checkGoalRelations(target, { thread });
  return {
    ok: model.ok,
    output: json ? JSON.stringify(model, null, 2) : renderRelationsCheckText(model),
  };
}

export function runRelationsGraph(target = ".", { json = false, thread = null } = {}) {
  const graph = renderGoalRelationsGraph(target, { thread });
  if (json) return JSON.stringify(graph, null, 2);
  return renderRelationsGraphText(graph);
}

export function runRelationsGoals(target = ".", { json = false, thread = null, completion = "all", status = null, nextDecision = null, limit = null, include = null, showEmpty = false } = {}) {
  const readOptions = json ? { thread, completion, status, nextDecision, limit, include, showEmpty } : { thread, completion, status, nextDecision, limit, include: include ? `${include},path` : "path", showEmpty };
  const model = collectGoalRelationGoals(target, readOptions);
  if (json) return JSON.stringify(model, null, 2);
  return renderRelationsGoalsText(model);
}

export function runRelationsTasks(target = ".", {
  json = false,
  thread = null,
  completion = "todo",
  status = null,
  goalCompletion = "all",
  goalStatus = null,
  goal = null,
  limit = null,
  include = null,
  showEmpty = false,
} = {}) {
  const readOptions = json ? { thread, completion, status, goalCompletion, goalStatus, goal, limit, include, showEmpty } : { thread, completion, status, goalCompletion, goalStatus, goal, limit, include: include ? `${include},objective,path` : "objective,path", showEmpty };
  const model = collectGoalRelationTasks(target, readOptions);
  if (json) return JSON.stringify(model, null, 2);
  return renderRelationsTasksText(model);
}

export function collectGoalRelations(target = ".", options: any = {}) {
  const { thread = null } = options;
  const controls = normalizeReadControls(options);
  const goalsRoot = resolveGoalsRoot(target);
  const packs = listGoalPackRoots(goalsRoot).map((root) => loadGoalPack(root));
  const items = packs
    .map((pack) => relationItem(pack))
    .filter((item) => item.thread_id || item.links.length > 0)
    .filter((item) => !thread || item.thread_id === thread)
    .sort((a, b) => a.goal_id.localeCompare(b.goal_id));
  const limited = limitItems(items, controls.limit);

  const result: any = {
    filters: {
      thread: thread || "all",
      ...readControlFilterFields(controls),
    },
    goal_count: items.length,
    relation_count: items.reduce((sum, item) => sum + item.links.length, 0),
    shown: limited.items.length,
    items: limited.items.map((item) => relationListOutputItem(item, controls)),
  };
  setIncluded(result, "goals_root", goalsRoot, controls, ["path", "goals_root"]);
  setOmittedCount(result, "items_omitted", limited.omitted, controls);
  return result;
}

export function collectGoalRelationGoals(target = ".", filterOptions = {}) {
  const controls = normalizeReadControls(filterOptions);
  const goalsRoot = resolveGoalsRoot(target);
  const filters = normalizeRelationGoalFilters(filterOptions);
  const items = listGoalPackRoots(goalsRoot)
    .map((root) => relationGoalItem(loadGoalPack(root)))
    .filter((item) => item.thread_id)
    .filter((item) => matchesRelationGoalFilters(item, filters))
    .sort((a, b) => a.goal_id.localeCompare(b.goal_id));
  const limited = limitItems(items, controls.limit);

  const result: any = {
    filters: {
      ...filters,
      ...readControlFilterFields(controls),
    },
    count: items.length,
    shown: limited.items.length,
    items: limited.items.map((item) => relationGoalOutputItem(item, controls)),
  };
  setIncluded(result, "goals_root", goalsRoot, controls, ["path", "goals_root"]);
  setOmittedCount(result, "items_omitted", limited.omitted, controls);
  return result;
}

export function collectGoalRelationTasks(target = ".", filterOptions = {}) {
  const controls = normalizeReadControls(filterOptions);
  const goalsRoot = resolveGoalsRoot(target);
  const filters = normalizeRelationTaskFilters(filterOptions);
  const items = [];

  for (const root of listGoalPackRoots(goalsRoot)) {
    const pack = loadGoalPack(root);
    const goal = relationGoalItem(pack);
    if (!goal.thread_id || !matchesRelationTaskGoalFilters(goal, filters)) continue;
    for (const task of pack.state.tasks) {
      if (!matchesRelationTaskFilters(task, filters)) continue;
      items.push(relationTaskItem(goal, task));
    }
  }

  items.sort((a, b) => `${a.goal_id}:${a.task.id}`.localeCompare(`${b.goal_id}:${b.task.id}`));
  const limited = limitItems(items, controls.limit);

  const result: any = {
    filters: {
      ...filters,
      ...readControlFilterFields(controls),
    },
    goal_count: new Set(items.map((item) => item.goal_id)).size,
    task_count: items.length,
    shown: limited.items.length,
    items: limited.items.map((item) => relationTaskOutputItem(item, controls)),
  };
  setIncluded(result, "goals_root", goalsRoot, controls, ["path", "goals_root"]);
  setOmittedCount(result, "items_omitted", limited.omitted, controls);
  return result;
}

export function checkGoalRelations(target = ".", { thread = null } = {}) {
  const goalsRoot = resolveGoalsRoot(target);
  const packs = listGoalPackRoots(goalsRoot).map((root) => loadGoalPack(root));
  const itemByGoalId = new Map(packs.map((pack) => [goalId(pack), relationItem(pack)]));
  const packByGoalId = new Map(packs.map((pack) => [goalId(pack), pack]));
  const items = packs
    .map((pack) => relationItem(pack))
    .filter((item) => item.thread_id || item.links.length > 0)
    .filter((item) => !thread || item.thread_id === thread)
    .sort((a, b) => a.goal_id.localeCompare(b.goal_id));
  const errors = [];
  const warnings = [];

  for (const item of items) {
    for (const link of item.links) {
      validateRelationLink({ item, link, itemByGoalId, packByGoalId, errors, warnings });
    }
  }

  return {
    ok: errors.length === 0,
    goals_root: goalsRoot,
    filters: {
      thread: thread || "all",
    },
    goal_count: items.length,
    relation_count: items.reduce((sum, item) => sum + item.links.length, 0),
    error_count: errors.length,
    warning_count: warnings.length,
    errors,
    warnings,
    items,
  };
}

export function renderGoalRelationsGraph(target = ".", { thread = null } = {}) {
  const check = checkGoalRelations(target, { thread });
  const threads = new Map();

  for (const item of check.items) {
    const threadId = item.thread_id || "unthreaded";
    if (!threads.has(threadId)) threads.set(threadId, { thread_id: threadId, goals: new Set(), edges: [] });
    const group = threads.get(threadId);
    group.goals.add(item.goal_id);
    for (const link of item.links) {
      const edge = graphEdge(item, link, check.errors);
      group.goals.add(edge.from);
      group.goals.add(edge.to);
      group.edges.push(edge);
    }
  }

  return {
    goals_root: check.goals_root,
    filters: check.filters,
    threads: [...threads.values()]
      .map((group) => ({
        thread_id: group.thread_id,
        goals: [...group.goals].sort(),
        edges: group.edges.sort((a, b) =>
          `${a.from}:${a.to}:${a.relation}`.localeCompare(`${b.from}:${b.to}:${b.relation}`),
        ),
      }))
      .sort((a, b) => a.thread_id.localeCompare(b.thread_id)),
  };
}

function relationTaskItem(goal, task) {
  return {
    goal_id: goal.goal_id,
    path: goal.path,
    thread_id: goal.thread_id,
    goal_status: goal.status,
    goal_next_decision: goal.next_decision,
    task: {
      id: task.id,
      type: task.type,
      status: task.status,
      objective: task.objective || null,
    },
  };
}

function relationListOutputItem(item, controls) {
  const output: any = {
    goal_id: item.goal_id,
    status: item.status,
  };
  maybeSet(output, "thread_id", item.thread_id, controls);
  setIncluded(output, "path", item.path, controls);
  setIncluded(output, "links", item.links, controls);
  return output;
}

function relationGoalOutputItem(item, controls) {
  const output: any = {
    goal_id: item.goal_id,
    thread_id: item.thread_id,
    status: item.status,
    next_decision: item.next_decision,
    tasks: {
      total: item.tasks.total,
      done: item.tasks.done,
      todo: item.tasks.todo,
    },
    receipt_count: item.receipt_count,
  };
  maybeSet(output, "active_task", item.active_task, controls);
  if (controls.show_empty || wantsField(controls, "by_status")) {
    output.tasks.by_status = withoutZeroBuckets(item.tasks.by_status, controls);
  }
  setIncluded(output, "path", item.path, controls);
  setIncluded(output, "links", item.links, controls);
  return output;
}

function relationTaskOutputItem(item, controls) {
  const output: any = {
    goal_id: item.goal_id,
    thread_id: item.thread_id,
    goal_status: item.goal_status,
    goal_next_decision: item.goal_next_decision,
    task: {
      id: item.task.id,
      type: item.task.type,
      status: item.task.status,
    },
  };
  setIncluded(output.task, "objective", item.task.objective, controls);
  setIncluded(output, "path", item.path, controls);
  return output;
}

function relationGoalItem(pack) {
  const item = relationItem(pack);
  const taskCounts = taskStatusCounts(pack.state.tasks);
  const totalTasks = pack.state.tasks.length;

  return {
    ...item,
    next_decision: pack.state.next_decision || null,
    active_task: pack.state.active_task || null,
    tasks: {
      total: totalTasks,
      done: taskCounts.done || 0,
      todo: Math.max(0, totalTasks - (taskCounts.done || 0)),
      by_status: taskCounts,
    },
    receipt_count: pack.receipts.length,
  };
}

function relationItem(pack) {
  const relations = pack.contract.goal_relations || { thread_id: null, links: [] };
  return {
    goal_id: goalId(pack),
    path: pack.root,
    status: pack.state.status || pack.contract.status || null,
    thread_id: relations.thread_id || null,
    links: (relations.links || []).map((link) => ({
      goal_id: link.goal_id || null,
      relation: link.relation || null,
      receipt_ref: link.receipt_ref || null,
      evidence: Array.isArray(link.evidence) ? link.evidence : [],
    })),
  };
}

function normalizeRelationTaskFilters({
  thread = null,
  completion = "todo",
  status = null,
  goalCompletion = "all",
  goalStatus = null,
  goal = null,
} = {}) {
  if (!COMPLETION_VALUES.includes(completion)) {
    throw new Error(`completion must be ${COMPLETION_VALUES.join(", ")}; got ${completion || "<missing>"}`);
  }
  if (status !== null && status !== "all" && !TASK_STATUSES.includes(status)) {
    throw new Error(`status must be ${TASK_STATUSES.join(", ")}; got ${status}`);
  }
  if (!COMPLETION_VALUES.includes(goalCompletion)) {
    throw new Error(`goal_completion must be ${COMPLETION_VALUES.join(", ")}; got ${goalCompletion || "<missing>"}`);
  }
  if (goalStatus !== null && goalStatus !== "all" && !STATUS_VALUES.includes(goalStatus)) {
    throw new Error(`goal_status must be ${STATUS_VALUES.join(", ")}; got ${goalStatus}`);
  }
  return {
    thread: thread || "all",
    completion,
    status: status || "all",
    goal_completion: goalCompletion,
    goal_status: goalStatus || "all",
    goal: goal || "all",
  };
}

function normalizeRelationGoalFilters({ thread = null, completion = "all", status = null, nextDecision = null } = {}) {
  if (!COMPLETION_VALUES.includes(completion)) {
    throw new Error(`completion must be ${COMPLETION_VALUES.join(", ")}; got ${completion || "<missing>"}`);
  }
  if (status !== null && status !== "all" && !STATUS_VALUES.includes(status)) {
    throw new Error(`status must be ${STATUS_VALUES.join(", ")}; got ${status}`);
  }
  if (nextDecision !== null && nextDecision !== "all" && !NEXT_DECISIONS.includes(nextDecision)) {
    throw new Error(`next_decision must be ${NEXT_DECISIONS.join(", ")}; got ${nextDecision}`);
  }
  return {
    thread: thread || "all",
    completion,
    status: status || "all",
    next_decision: nextDecision || "all",
  };
}

function matchesRelationTaskGoalFilters(goal, filters) {
  return (filters.thread === "all" || goal.thread_id === filters.thread)
    && (filters.goal === "all" || goal.goal_id === filters.goal)
    && matchesGoalCompletion(goal, filters.goal_completion)
    && (filters.goal_status === "all" || goal.status === filters.goal_status);
}

function matchesRelationTaskFilters(task, filters) {
  return matchesTaskCompletion(task, filters.completion)
    && (filters.status === "all" || task.status === filters.status);
}

function matchesRelationGoalFilters(item, filters) {
  return (filters.thread === "all" || item.thread_id === filters.thread)
    && matchesGoalCompletion(item, filters.completion)
    && (filters.status === "all" || item.status === filters.status)
    && (filters.next_decision === "all" || item.next_decision === filters.next_decision);
}

function matchesGoalCompletion(item, completion) {
  if (completion === "all") return true;
  if (completion === "done") return item.status === "done";
  return item.status !== "done" && item.status !== "retired";
}

function matchesTaskCompletion(task, completion) {
  if (completion === "all") return true;
  if (completion === "done") return task.status === "done";
  return task.status !== "done";
}

function taskStatusCounts(tasks) {
  const counts = Object.fromEntries([...TASK_STATUSES, "unknown"].map((status) => [status, 0]));
  for (const task of tasks) {
    const status = TASK_STATUSES.includes(task.status) ? task.status : "unknown";
    counts[status] = (counts[status] || 0) + 1;
  }
  return counts;
}

function validateRelationLink({ item, link, itemByGoalId, packByGoalId, errors, warnings }) {
  const relation = link.relation;
  const soft = relation === "related_to";
  const targetId = link.goal_id;
  const targetPack = targetId ? packByGoalId.get(targetId) : null;
  const targetItem = targetId ? itemByGoalId.get(targetId) : null;

  if (!GOAL_RELATION_TYPES.includes(relation)) {
    errors.push(`${item.goal_id}: invalid relation ${relation || "<missing>"} to ${targetId || "<missing>"}`);
    return;
  }

  if (!targetId || !targetPack || !targetItem) {
    pushProblem(soft, errors, warnings, `${item.goal_id}: ${relation} missing target ${targetId || "<missing>"}; ${relation} target ${targetId || "<missing>"} is missing`);
    if (soft) {
      for (const token of link.evidence) {
        warnings.push(`${item.goal_id}: related_to evidence ${token} is missing because target ${targetId || "<missing>"} is missing`);
      }
    }
    return;
  }

  if (link.evidence.length > 0 && !link.receipt_ref) {
    pushProblem(soft, errors, warnings, `${item.goal_id}: ${relation} missing receipt_ref for required evidence`);
    return;
  }

  if (!link.receipt_ref) return;

  const receipt = targetPack.receipts.filter((candidate) => candidate.task_id === link.receipt_ref).at(-1);
  if (!receipt) {
    pushProblem(soft, errors, warnings, `${item.goal_id}: ${relation} target ${targetId} missing receipt ${link.receipt_ref}`);
    if (soft) {
      for (const token of link.evidence) {
        warnings.push(`${item.goal_id}: related_to evidence ${token} is missing because receipt ${link.receipt_ref} is missing`);
      }
    }
    return;
  }

  const receiptEvidence = Array.isArray(receipt.evidence) ? receipt.evidence.map(String) : [];
  for (const token of link.evidence) {
    if (!receiptEvidence.includes(token)) {
      pushProblem(soft, errors, warnings, `${item.goal_id}: ${relation} target ${targetId} receipt ${link.receipt_ref} missing evidence ${token}`);
    }
  }
}

function graphEdge(item, link, errors) {
  const reversed = HARD_RELATIONS.includes(link.relation);
  const from = reversed ? link.goal_id : item.goal_id;
  const to = reversed ? item.goal_id : link.goal_id;
  return {
    from,
    to,
    relation: link.relation,
    receipt_ref: link.receipt_ref || null,
    evidence: linkEvidenceStatus(item.goal_id, link, errors),
  };
}

function linkEvidenceStatus(goalId, link, errors) {
  if (!link.evidence || link.evidence.length === 0) return "none";
  const prefix = `${goalId}: ${link.relation} target ${link.goal_id}`;
  return errors.some((error) => error.startsWith(prefix) && error.includes("evidence")) ? "missing" : "ok";
}

function renderRelationsListText(model) {
  const lines = [
    `goals_root: ${model.goals_root}`,
    `thread: ${model.filters.thread}`,
    `goals: ${model.goal_count}`,
    `relations: ${model.relation_count}`,
  ];
  for (const item of model.items) {
    lines.push(`${item.goal_id}  thread=${item.thread_id || "null"} links=${item.links.length}`);
    for (const link of item.links) {
      lines.push(`  ${link.relation || "<missing>"} ${link.goal_id || "<missing>"} receipt=${link.receipt_ref || "null"} evidence=${link.evidence.length}`);
    }
  }
  return lines.join("\n");
}

function renderRelationsGoalsText(model) {
  const lines = [
    `goals_root: ${model.goals_root}`,
    `filters: thread=${model.filters.thread} completion=${model.filters.completion} status=${model.filters.status} next_decision=${model.filters.next_decision}`,
    `goals: ${model.count}`,
  ];
  for (const item of model.items) {
    lines.push(`${item.goal_id}  thread=${item.thread_id} status=${item.status || "unknown"} next_decision=${item.next_decision || "unknown"} active_task=${item.active_task || "null"} tasks=${item.tasks.total} done=${item.tasks.done} todo=${item.tasks.todo} receipts=${item.receipt_count}`);
  }
  return lines.join("\n");
}

function renderRelationsTasksText(model) {
  const lines = [
    `goals_root: ${model.goals_root}`,
    `filters: thread=${model.filters.thread} completion=${model.filters.completion} status=${model.filters.status} goal_completion=${model.filters.goal_completion} goal_status=${model.filters.goal_status} goal=${model.filters.goal}`,
    `goals: ${model.goal_count}`,
    `tasks: ${model.task_count}`,
  ];
  for (const item of model.items) {
    lines.push(`${item.goal_id} ${item.task.id}  task_status=${item.task.status} task_type=${item.task.type} goal_status=${item.goal_status || "unknown"} goal_next_decision=${item.goal_next_decision || "unknown"} ${item.task.objective || ""}`);
  }
  return lines.join("\n");
}

function renderRelationsCheckText(model) {
  const lines = [
    `goals_root: ${model.goals_root}`,
    `thread: ${model.filters.thread}`,
    `ok: ${model.ok}`,
    `goals: ${model.goal_count}`,
    `relations: ${model.relation_count}`,
    `errors: ${model.error_count}`,
    `warnings: ${model.warning_count}`,
  ];
  for (const error of model.errors) lines.push(`error: ${error}`);
  for (const warning of model.warnings) lines.push(`warning: ${warning}`);
  return lines.join("\n");
}

function renderRelationsGraphText(graph) {
  const lines = [
    `goals_root: ${graph.goals_root}`,
    `thread: ${graph.filters.thread}`,
    `threads: ${graph.threads.length}`,
  ];
  for (const thread of graph.threads) {
    lines.push(`thread: ${thread.thread_id}`);
    lines.push(`goals: ${thread.goals.length}`);
    for (const edge of thread.edges) {
      lines.push(`${edge.from} --${edge.relation}--> ${edge.to} receipt=${edge.receipt_ref || "null"} evidence=${edge.evidence}`);
    }
  }
  return lines.join("\n");
}

function pushProblem(soft, errors, warnings, message) {
  if (soft) warnings.push(message);
  else errors.push(message);
}

function goalId(pack) {
  return pack.contract.id || pack.state.goal_id || pack.name;
}
