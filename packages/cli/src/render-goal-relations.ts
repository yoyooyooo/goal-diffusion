import { loadGoalPack, GOAL_RELATION_TYPES, NEXT_ACTIONS, STATUS_VALUES, WORK_ITEM_STATUSES } from "./lib/goal-pack.ts";
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

export function runRelationsGoals(target = ".", { json = false, thread = null, completion = "all", status = null, nextAction = null, limit = null, include = null, showEmpty = false } = {}) {
  const readOptions = json ? { thread, completion, status, nextAction, limit, include, showEmpty } : { thread, completion, status, nextAction, limit, include: include ? `${include},path` : "path", showEmpty };
  const model = collectGoalRelationGoals(target, readOptions);
  if (json) return JSON.stringify(model, null, 2);
  return renderRelationsGoalsText(model);
}

export function runRelationsWork(target = ".", {
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
  const model = collectGoalRelationWork(target, readOptions);
  if (json) return JSON.stringify(model, null, 2);
  return renderRelationsWorkText(model);
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

export function collectGoalRelationWork(target = ".", filterOptions = {}) {
  const controls = normalizeReadControls(filterOptions);
  const goalsRoot = resolveGoalsRoot(target);
  const filters = normalizeRelationWorkFilters(filterOptions);
  const items = [];

  for (const root of listGoalPackRoots(goalsRoot)) {
    const pack = loadGoalPack(root);
    const goal = relationGoalItem(pack);
    if (!goal.thread_id || !matchesRelationWorkGoalFilters(goal, filters)) continue;
    for (const workItem of pack.progress.work_items) {
      if (!matchesRelationWorkFilters(workItem, filters)) continue;
      items.push(relationWorkItem(goal, workItem));
    }
  }

  items.sort((a, b) => `${a.goal_id}:${a.work_item.id}`.localeCompare(`${b.goal_id}:${b.work_item.id}`));
  const limited = limitItems(items, controls.limit);

  const result: any = {
    filters: {
      ...filters,
      ...readControlFilterFields(controls),
    },
    goal_count: new Set(items.map((item) => item.goal_id)).size,
    work_item_count: items.length,
    shown: limited.items.length,
    items: limited.items.map((item) => relationWorkOutputItem(item, controls)),
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

function relationWorkItem(goal, workItem) {
  return {
    goal_id: goal.goal_id,
    path: goal.path,
    thread_id: goal.thread_id,
    goal_status: goal.status,
    goal_next_action: goal.next_action,
    work_item: {
      id: workItem.id,
      type: workItem.type,
      status: workItem.status,
      objective: workItem.objective || null,
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
    next_action: item.next_action,
    work_items: {
      total: item.work_items.total,
      done: item.work_items.done,
      todo: item.work_items.todo,
    },
    evidence_count: item.evidence_count,
  };
  maybeSet(output, "active_work_item", item.active_work_item, controls);
  if (controls.show_empty || wantsField(controls, "by_status")) {
    output.work_items.by_status = withoutZeroBuckets(item.work_items.by_status, controls);
  }
  setIncluded(output, "path", item.path, controls);
  setIncluded(output, "links", item.links, controls);
  return output;
}

function relationWorkOutputItem(item, controls) {
  const output: any = {
    goal_id: item.goal_id,
    thread_id: item.thread_id,
    goal_status: item.goal_status,
    goal_next_action: item.goal_next_action,
    work_item: {
      id: item.work_item.id,
      type: item.work_item.type,
      status: item.work_item.status,
    },
  };
  setIncluded(output.work_item, "objective", item.work_item.objective, controls);
  setIncluded(output, "path", item.path, controls);
  return output;
}

function relationGoalItem(pack) {
  const item = relationItem(pack);
  const workCounts = workStatusCounts(pack.progress.work_items);
  const totalWork = pack.progress.work_items.length;

  return {
    ...item,
    next_action: pack.progress.next_action || null,
    active_work_item: pack.progress.active_work_item || null,
    work_items: {
      total: totalWork,
      done: workCounts.done || 0,
      todo: Math.max(0, totalWork - (workCounts.done || 0)),
      by_status: workCounts,
    },
    evidence_count: pack.evidence_records.length,
  };
}

function relationItem(pack) {
  const relations = pack.goal.relations || { thread_id: null, links: [] };
  return {
    goal_id: goalId(pack),
    path: pack.root,
    status: pack.progress.status || pack.goal.status || null,
    thread_id: relations.thread_id || null,
    links: (relations.links || []).map((link) => ({
      goal_id: link.goal_id || null,
      relation: link.relation || null,
      evidence_ref: link.evidence_ref || null,
      evidence: Array.isArray(link.evidence) ? link.evidence : [],
    })),
  };
}

function normalizeRelationWorkFilters({
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
  if (status !== null && status !== "all" && !WORK_ITEM_STATUSES.includes(status)) {
    throw new Error(`status must be ${WORK_ITEM_STATUSES.join(", ")}; got ${status}`);
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

function normalizeRelationGoalFilters({ thread = null, completion = "all", status = null, nextAction = null } = {}) {
  if (!COMPLETION_VALUES.includes(completion)) {
    throw new Error(`completion must be ${COMPLETION_VALUES.join(", ")}; got ${completion || "<missing>"}`);
  }
  if (status !== null && status !== "all" && !STATUS_VALUES.includes(status)) {
    throw new Error(`status must be ${STATUS_VALUES.join(", ")}; got ${status}`);
  }
  if (nextAction !== null && nextAction !== "all" && !NEXT_ACTIONS.includes(nextAction)) {
    throw new Error(`next_action must be ${NEXT_ACTIONS.join(", ")}; got ${nextAction}`);
  }
  return {
    thread: thread || "all",
    completion,
    status: status || "all",
    next_action: nextAction || "all",
  };
}

function matchesRelationWorkGoalFilters(goal, filters) {
  return (filters.thread === "all" || goal.thread_id === filters.thread)
    && (filters.goal === "all" || goal.goal_id === filters.goal)
    && matchesGoalCompletion(goal, filters.goal_completion)
    && (filters.goal_status === "all" || goal.status === filters.goal_status);
}

function matchesRelationWorkFilters(workItem, filters) {
  return matchesWorkCompletion(workItem, filters.completion)
    && (filters.status === "all" || workItem.status === filters.status);
}

function matchesRelationGoalFilters(item, filters) {
  return (filters.thread === "all" || item.thread_id === filters.thread)
    && matchesGoalCompletion(item, filters.completion)
    && (filters.status === "all" || item.status === filters.status)
    && (filters.next_action === "all" || item.next_action === filters.next_action);
}

function matchesGoalCompletion(item, completion) {
  if (completion === "all") return true;
  if (completion === "done") return item.status === "done";
  return item.status !== "done" && item.status !== "retired";
}

function matchesWorkCompletion(workItem, completion) {
  if (completion === "all") return true;
  if (completion === "done") return workItem.status === "done";
  return workItem.status !== "done";
}

function workStatusCounts(workItems) {
  const counts = Object.fromEntries([...WORK_ITEM_STATUSES, "unknown"].map((status) => [status, 0]));
  for (const workItem of workItems) {
    const status = WORK_ITEM_STATUSES.includes(workItem.status) ? workItem.status : "unknown";
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

  if (link.evidence.length > 0 && !link.evidence_ref) {
    pushProblem(soft, errors, warnings, `${item.goal_id}: ${relation} missing evidence_ref for required evidence`);
    return;
  }

  if (!link.evidence_ref) return;

  const evidenceRecord = targetPack.evidence_records.filter((candidate) => candidate.evidence_id === link.evidence_ref).at(-1);
  if (!evidenceRecord) {
    pushProblem(soft, errors, warnings, `${item.goal_id}: ${relation} target ${targetId} missing evidence record ${link.evidence_ref}`);
    if (soft) {
      for (const token of link.evidence) {
        warnings.push(`${item.goal_id}: related_to evidence ${token} is missing because evidence record ${link.evidence_ref} is missing`);
      }
    }
    return;
  }

  const evidenceIndex = evidenceRecordIndex(evidenceRecord);
  for (const token of link.evidence) {
    if (!matchesEvidenceToken(evidenceIndex, token)) {
      const hint = nearestEvidenceHint(evidenceIndex.hints, token);
      const hintText = hint ? `; nearest evidence: ${hint}` : "";
      pushProblem(soft, errors, warnings, `${item.goal_id}: ${relation} target ${targetId} evidence record ${link.evidence_ref} missing evidence ${token}${hintText}`);
    }
  }
}

function evidenceRecordIndex(record: any) {
  const candidates = collectEvidenceStrings(record)
    .map((value) => value.trim())
    .filter(Boolean);
  const hints = uniqueStrings([
    ...collectEvidenceStrings(record?.evidence),
    ...collectEvidenceStrings(record?.claim_evidence),
    ...collectEvidenceStrings(record?.checks),
    ...collectEvidenceStrings(record?.summary),
    ...candidates.filter((value) => /[A-Za-z0-9_.-]=/.test(value)),
  ])
    .map((value) => value.trim())
    .filter(Boolean);
  return {
    candidates,
    hints,
    normalized: new Set(candidates.map(normalizeEvidenceText)),
  };
}

function collectEvidenceStrings(value: unknown, output: string[] = []): string[] {
  if (value === null || value === undefined) return output;
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    output.push(String(value));
    return output;
  }
  if (Array.isArray(value)) {
    for (const item of value) collectEvidenceStrings(item, output);
    return output;
  }
  if (typeof value === "object") {
    for (const [key, item] of Object.entries(value)) {
      if (item === null || item === undefined) continue;
      if (typeof item === "string" || typeof item === "number" || typeof item === "boolean") {
        output.push(`${key}=${String(item)}`);
      }
      collectEvidenceStrings(item, output);
    }
  }
  return output;
}

function matchesEvidenceToken(index: { normalized: Set<string> }, token: string) {
  const normalizedToken = normalizeEvidenceText(token);
  if (index.normalized.has(normalizedToken)) return true;
  const tokenParts = evidenceKeyValueTokens(token).map(normalizeEvidenceText);
  const wanted = tokenParts.length > 0 ? tokenParts : [normalizedToken];
  return [...index.normalized].some((candidate) =>
    wanted.some((part) => candidate === part || candidate.includes(part)),
  );
}

function evidenceKeyValueTokens(value: unknown) {
  return normalizeEvidenceText(value).match(/[a-z0-9_.-]+=(?:\[[^\]]+\]|[^,\s.;]+)/g) || [];
}

function nearestEvidenceHint(candidates: string[], token: string) {
  const tokenParts = evidenceKeyValueTokens(token);
  const keys = tokenParts
    .map((part) => part.split("=")[0])
    .filter(Boolean);
  if (keys.length === 0) return candidates[0] || "";

  return candidates.find((candidate) => {
    const normalized = normalizeEvidenceText(candidate);
    return keys.some((key) => normalized.includes(`${key}=`));
  }) || candidates[0] || "";
}

function normalizeEvidenceText(value: unknown) {
  return String(value)
    .replaceAll("\\\"", "\"")
    .replace(/\s+/g, " ")
    .replace(/\s*([=[\],])\s*/g, "$1")
    .trim();
}

function uniqueStrings(values: string[]) {
  return [...new Set(values)];
}

function graphEdge(item, link, errors) {
  const reversed = HARD_RELATIONS.includes(link.relation);
  const from = reversed ? link.goal_id : item.goal_id;
  const to = reversed ? item.goal_id : link.goal_id;
  return {
    from,
    to,
    relation: link.relation,
    evidence_ref: link.evidence_ref || null,
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
      lines.push(`  ${link.relation || "<missing>"} ${link.goal_id || "<missing>"} evidence_record=${link.evidence_ref || "null"} evidence=${link.evidence.length}`);
    }
  }
  return lines.join("\n");
}

function renderRelationsGoalsText(model) {
  const lines = [
    `goals_root: ${model.goals_root}`,
    `filters: thread=${model.filters.thread} completion=${model.filters.completion} status=${model.filters.status} next_action=${model.filters.next_action}`,
    `goals: ${model.count}`,
  ];
  for (const item of model.items) {
    lines.push(`${item.goal_id}  thread=${item.thread_id} status=${item.status || "unknown"} next_action=${item.next_action || "unknown"} active_work_item=${item.active_work_item || "null"} work_items=${item.work_items.total} done=${item.work_items.done} todo=${item.work_items.todo} evidence_records=${item.evidence_count}`);
  }
  return lines.join("\n");
}

function renderRelationsWorkText(model) {
  const lines = [
    `goals_root: ${model.goals_root}`,
    `filters: thread=${model.filters.thread} completion=${model.filters.completion} status=${model.filters.status} goal_completion=${model.filters.goal_completion} goal_status=${model.filters.goal_status} goal=${model.filters.goal}`,
    `goals: ${model.goal_count}`,
    `work_items: ${model.work_item_count}`,
  ];
  for (const item of model.items) {
    lines.push(`${item.goal_id} ${item.work_item.id}  work_item_status=${item.work_item.status} work_item_type=${item.work_item.type} goal_status=${item.goal_status || "unknown"} goal_next_action=${item.goal_next_action || "unknown"} ${item.work_item.objective || ""}`);
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
      lines.push(`${edge.from} --${edge.relation}--> ${edge.to} evidence_record=${edge.evidence_ref || "null"} evidence=${edge.evidence}`);
    }
  }
  return lines.join("\n");
}

function pushProblem(soft, errors, warnings, message) {
  if (soft) warnings.push(message);
  else errors.push(message);
}

function goalId(pack) {
  return pack.goal.id || pack.progress.goal_id || pack.name;
}
