import { loadGoalPack, GOAL_RELATION_TYPES } from "./lib/goal-pack.ts";
import { listGoalPackRoots, resolveGoalsRoot } from "./summarize-goal-packs.ts";

const HARD_RELATIONS = ["successor_of", "depends_on", "supersedes"];

export function runRelationsList(target = ".", { json = false, thread = null } = {}) {
  const model = collectGoalRelations(target, { thread });
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

export function collectGoalRelations(target = ".", { thread = null } = {}) {
  const goalsRoot = resolveGoalsRoot(target);
  const packs = listGoalPackRoots(goalsRoot).map((root) => loadGoalPack(root));
  const items = packs
    .map((pack) => relationItem(pack))
    .filter((item) => item.thread_id || item.links.length > 0)
    .filter((item) => !thread || item.thread_id === thread)
    .sort((a, b) => a.goal_id.localeCompare(b.goal_id));

  return {
    goals_root: goalsRoot,
    filters: {
      thread: thread || "all",
    },
    goal_count: items.length,
    relation_count: items.reduce((sum, item) => sum + item.links.length, 0),
    items,
  };
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
