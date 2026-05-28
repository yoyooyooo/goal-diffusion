import {
  existsSync,
  readFileSync,
  renameSync,
  writeFileSync,
} from "node:fs";
import { basename, dirname, join, resolve } from "node:path";
import { allChecksPass, checkLines, hasCompletionReviewEvidence, recordChecks } from "./goal-evidence-helpers.ts";

export const STATUS_VALUES = ["forming", "ready", "running", "blocked", "done", "retired"];
export const WORK_ITEM_TYPES = ["discovery", "decision", "implementation", "coordination", "review", "planning"];
export const WORK_ITEM_STATUSES = ["queued", "active", "blocked", "done"];
export const NEXT_ACTIONS = ["proof_step", "continue", "needs_plan", "blocked", "review", "done", "needs_human"];
export const EVIDENCE_RESULTS = ["done", "blocked"];
export const GOAL_RELATION_TYPES = ["successor_of", "depends_on", "supersedes", "related_to"];

export function loadGoalPack(goalRoot) {
  const root = resolveGoalPackRoot(goalRoot);
  const files = {
    goal: join(root, "goal.yaml"),
    progress: join(root, "progress.yaml"),
    evidence: join(root, "evidence.jsonl"),
  };
  const missing = [];
  if (!existsSync(files.goal)) missing.push("goal.yaml");
  if (!existsSync(files.progress)) missing.push("progress.yaml");
  if (!existsSync(files.evidence)) missing.push("evidence.jsonl");

  const goalText = existsSync(files.goal) ? readFileSync(files.goal, "utf8") : "";
  const progressText = existsSync(files.progress) ? readFileSync(files.progress, "utf8") : "";
  const evidenceText = existsSync(files.evidence) ? readFileSync(files.evidence, "utf8") : "";
  const { records: evidenceRecords, parseErrors: evidenceParseErrors } = parseEvidenceLog(evidenceText);
  const goal = parseGoal(goalText);

  return {
    root,
    name: basename(root),
    files,
    missing,
    schema: existsSync(files.goal) ? "v2" : "missing",
    texts: {
      goal: goalText,
      progress: progressText,
      evidence: evidenceText,
    },
    goal,
    progress: parseProgress(progressText),
    evidence_records: evidenceRecords,
    evidenceParseErrors,
  };
}

export function resolveGoalPackRoot(goalRoot, { cwd = process.cwd() } = {}) {
  const direct = resolve(cwd, goalRoot);
  if (existsSync(direct) || looksLikePath(goalRoot)) return direct;

  const candidate = findGoalPackById(cwd, goalRoot);
  return candidate ?? direct;
}

function findGoalPackById(startDir, goalId) {
  let current = resolve(startDir);
  while (true) {
    const candidate = join(current, "docs", "goal-proof", "goals", goalId);
    if (existsSync(candidate)) return candidate;
    const parent = dirname(current);
    if (parent === current) return null;
    current = parent;
  }
}

function looksLikePath(value) {
  return value.includes("/") || value.includes("\\") || value === "." || value === ".." || value.startsWith("./") || value.startsWith("../") || value.startsWith("~/");
}

export function parseGoal(text) {
  const engineeringGuidanceBody = blockText(text, "engineering_guidance", 0);
  const agentAuthorityBody = blockText(text, "agent_authority", 0);
  return {
    schema_version: topScalar(text, "schema_version"),
    id: topScalar(text, "id"),
    status: topScalar(text, "status"),
    intent: {
      source: pathScalar(text, ["intent"], "source"),
      interpreted_as: pathScalar(text, ["intent"], "interpreted_as"),
      assumptions: listScalar(blockText(text, "intent", 0), "assumptions", 2),
      open_questions: listScalar(blockText(text, "intent", 0), "open_questions", 2),
    },
    objective: topScalar(text, "objective"),
    guiding_principle: topScalar(text, "guiding_principle"),
    relations: parseRelations(text),
    authority_refs: listScalar(text, "authority_refs", 0),
    engineering_guidance: {
      standards: listScalar(engineeringGuidanceBody, "standards", 2),
      architecture_notes: listScalar(engineeringGuidanceBody, "architecture_notes", 2),
      quality_bar: pathScalar(text, ["engineering_guidance"], "quality_bar"),
      preferred_proof_path: pathScalar(text, ["engineering_guidance"], "preferred_proof_path"),
    },
    constraints: listScalar(text, "constraints", 0),
    non_goals: listScalar(text, "non_goals", 0),
    stop_rules: listScalar(text, "stop_rules", 0),
    completion: {
      signal: pathScalar(text, ["completion"], "signal"),
      required_evidence: pathScalar(text, ["completion"], "required_evidence"),
    },
    claim_limit: topScalar(text, "claim_limit"),
    agent_authority: {
      continue_by_default: pathScalar(text, ["agent_authority"], "continue_by_default"),
      requires_human_decision: listScalar(agentAuthorityBody, "requires_human_decision", 2),
      agent_may_revise: listScalar(agentAuthorityBody, "agent_may_revise", 2),
    },
    evidence_mode: topScalar(text, "evidence_mode"),
  };
}

function parseRelations(text) {
  const body = blockText(text, "relations", 0);
  if (!body) return { thread_id: null, links: [] };
  return {
    thread_id: pathScalar(text, ["relations"], "thread_id"),
    links: parseRelationLinks(body),
  };
}

function parseRelationLinks(relationsBody) {
  const linksBody = blockText(relationsBody, "links", 2);
  if (!linksBody) return [];
  const lines = linksBody.split(/\r?\n/);
  const links = [];
  let current = null;
  let currentLines = [];
  const finish = () => {
    if (!current) return;
    const body = currentLines.join("\n");
    links.push({
      goal_id: current.goal_id || relationScalar(currentLines, "goal_id"),
      relation: relationScalar(currentLines, "relation"),
      evidence_ref: relationScalar(currentLines, "evidence_ref"),
      evidence: listScalar(body, "evidence", 6),
    });
  };

  for (const line of lines) {
    const item = line.match(/^ {4}-[ \t]*(.*?)[ \t]*$/);
    if (item) {
      finish();
      current = {};
      currentLines = [line];
      const inline = item[1];
      const inlineMatch = inline.match(/^([A-Za-z_][A-Za-z0-9_]*):[ \t]*(.*?)$/);
      if (inlineMatch) current[inlineMatch[1]] = clean(inlineMatch[2]);
      continue;
    }
    if (current) currentLines.push(line);
  }
  finish();
  return links.filter((link) => link.goal_id || link.relation || link.evidence_ref || link.evidence.length > 0);
}

function relationScalar(lines, key) {
  return keyValue(lines.join("\n"), key, 6);
}

export function parseProgress(text) {
  const lastCheck = blockText(text, "last_check", 0);
  return {
    schema_version: topScalar(text, "schema_version"),
    goal_id: topScalar(text, "goal_id"),
    status: topScalar(text, "status"),
    proof_step: {
      from: pathScalar(text, ["proof_step"], "from"),
      target_delta: pathScalar(text, ["proof_step"], "target_delta"),
      proof_path: listScalar(blockText(text, "proof_step", 0), "proof_path", 2),
      checks: listScalar(blockText(text, "proof_step", 0), "checks", 2),
      failure_inspection: listScalar(blockText(text, "proof_step", 0), "failure_inspection", 2),
    },
    active_work_item: topScalar(text, "active_work_item"),
    work_items: parseWorkItems(text),
    blockers: listScalar(text, "blockers", 0),
    last_check: {
      result: pathScalar(text, ["last_check"], "result") || "unknown",
      checks: listScalar(lastCheck, "checks", 2),
    },
    next_action: topScalar(text, "next_action"),
  };
}

export function parseEvidenceLog(text) {
  const records = [];
  const parseErrors = [];
  for (const [index, line] of text.split(/\r?\n/).entries()) {
    if (!line.trim()) continue;
    try {
      records.push(JSON.parse(line));
    } catch {
      parseErrors.push(`invalid evidence.jsonl line ${index + 1}`);
    }
  }
  return { records, parseErrors };
}

export function findWorkItem(progress, workId) {
  return progress.work_items.find((item) => item.id === workId) || null;
}

export function getActiveWorkItem(progress) {
  if (!progress.active_work_item) return null;
  return findWorkItem(progress, progress.active_work_item);
}

export function compactEvidenceRecord(record) {
  if (!record) return null;
  return {
    evidence_id: record.evidence_id || null,
    work_id: record.work_id || null,
    type: record.type || null,
    result: record.result || null,
    decision: record.decision || null,
    completion_satisfied: record.completion_satisfied === true,
    next_action: record.next_action || null,
  };
}

export function inspectGoalPack(goalRoot) {
  const pack = loadGoalPack(goalRoot);
  const validation = validateGoalPack(pack);
  const activeWorkItem = getActiveWorkItem(pack.progress);
  const lastEvidenceRecord = pack.evidence_records.at(-1) || null;
  const blocked = pack.progress.status === "blocked" || pack.progress.next_action === "blocked";
  const canContinue = pack.progress.status === "running"
    && !blocked
    && ["proof_step", "continue", "needs_plan", "review"].includes(String(pack.progress.next_action || ""));

  return {
    goal_id: pack.goal.id || pack.progress.goal_id || null,
    status: pack.progress.status || pack.goal.status || null,
    objective: pack.goal.objective || null,
    completion: pack.goal.completion,
    claim_limit: pack.goal.claim_limit || null,
    proof_step: pack.progress.proof_step,
    active_work_item: activeWorkItem,
    last_evidence_record: compactEvidenceRecord(lastEvidenceRecord),
    next_action: pack.progress.next_action || null,
    blockers: pack.progress.blockers,
    can_continue: canContinue,
    work_item_count: pack.progress.work_items.length,
    evidence_count: pack.evidence_records.length,
    warnings: validation.warnings,
    errors: validation.errors,
  };
}

export function renderWorkBrief(goalRoot, { workId = null } = {}) {
  const pack = loadGoalPack(goalRoot);
  const selectedWorkId = workId || pack.progress.active_work_item;
  const workItem = selectedWorkId ? findWorkItem(pack.progress, selectedWorkId) : null;
  if (!workItem) {
    throw new Error(`work item not found: ${selectedWorkId || "<active_work_item>"}`);
  }

  const warnings = [];
  if (workItem.id !== pack.progress.active_work_item) {
    warnings.push(`selected work item ${workItem.id} is not active_work_item ${pack.progress.active_work_item || "null"}`);
  }

  return {
    goal_id: pack.goal.id || pack.progress.goal_id || null,
    status: pack.progress.status || null,
    goal_fields: {
      objective: pack.goal.objective || null,
      authority_refs: pack.goal.authority_refs,
      engineering_guidance: pack.goal.engineering_guidance,
      completion: pack.goal.completion,
      claim_limit: pack.goal.claim_limit || null,
      stop_rules: pack.goal.stop_rules,
    },
    proof_step: pack.progress.proof_step,
    work_item: workItem,
    stop_rules: [
      "Do not change protected fields.",
      "Do not write outside allowed_scope.",
      "Stop if no honest falsifiable proof path exists.",
      ...workItem.stop_if,
    ],
    evidence_schema: evidenceSchemaForWorkItem(workItem),
    warnings,
  };
}

export function validateGoalPack(pack) {
  const errors = [];
  const warnings = [];
  for (const missing of pack.missing) errors.push(`missing ${missing}`);
  for (const error of pack.evidenceParseErrors) errors.push(error);

  const { goal, progress, evidence_records: evidenceRecords } = pack;
  if (String(goal.schema_version || "") !== "2") errors.push("goal.yaml schema_version must be 2");
  if (String(progress.schema_version || "") !== "2") errors.push("progress.yaml schema_version must be 2");
  if (!goal.id) errors.push("goal.yaml missing id");
  if (!STATUS_VALUES.includes(goal.status)) {
    errors.push(`goal status must be ${STATUS_VALUES.join(", ")}; got ${goal.status || "<missing>"}`);
  }
  if (!STATUS_VALUES.includes(progress.status)) {
    errors.push(`progress status must be ${STATUS_VALUES.join(", ")}; got ${progress.status || "<missing>"}`);
  }
  if (goal.status && progress.status && goal.status !== progress.status) {
    warnings.push(`goal status ${goal.status} differs from progress status ${progress.status}`);
  }
  if (progress.next_action && !NEXT_ACTIONS.includes(progress.next_action)) {
    errors.push(`progress next_action must be ${NEXT_ACTIONS.join(", ")}; got ${progress.next_action}`);
  }
  if (isWeak(goal.completion.signal)) warnings.push("completion.signal is missing or weak");
  if (isWeak(goal.completion.required_evidence)) warnings.push("completion.required_evidence is missing or weak");
  if (isWeak(goal.claim_limit)) warnings.push("claim_limit is missing or weak");
  if (progress.work_items.length === 0) errors.push("progress.yaml work_items must contain at least one work item");

  const activeWorkItems = progress.work_items.filter((item) => item.status === "active");
  if (progress.status === "running") {
    if (activeWorkItems.length !== 1) errors.push(`running Goal Pack must have exactly one active work item; found ${activeWorkItems.length}`);
    if (!progress.active_work_item) errors.push("running Goal Pack must set active_work_item");
  }
  if (activeWorkItems.length === 1 && progress.active_work_item !== activeWorkItems[0].id) {
    errors.push(`active_work_item must point to ${activeWorkItems[0].id}; got ${progress.active_work_item || "null"}`);
  }
  if (progress.active_work_item && !progress.work_items.some((item) => item.id === progress.active_work_item)) {
    errors.push(`active_work_item points to unknown work item: ${progress.active_work_item}`);
  }

  for (const item of progress.work_items) {
    validateWorkItem(item, errors);
  }
  validateProgressActionHints(progress, warnings);

  for (const record of evidenceRecords) {
    for (const error of validateEvidenceRecord(pack, record)) {
      errors.push(error);
    }
  }

  if (progress.status === "done") {
    if (progress.active_work_item !== null) errors.push("done Goal Pack must set active_work_item: null");
    if (activeWorkItems.length > 0) errors.push("done Goal Pack must not have active work items");
    if (isWeak(goal.completion.signal) || isWeak(goal.completion.required_evidence) || isWeak(goal.claim_limit)) {
      errors.push("done Goal Pack requires concrete completion and claim_limit");
    }
    const completionReview = evidenceRecords.find((record) =>
      (record.type === "review" || record.work_id === "W999")
        && record.result === "done"
        && record.decision === "complete"
    );
    if (!completionReview) {
      errors.push("done Goal Pack requires a completion review evidence record with decision: complete");
    } else {
      if (completionReview.completion_satisfied !== true) errors.push("completion review evidence record must set completion_satisfied: true");
      if (!hasCompletionReviewEvidence(completionReview)) errors.push("completion review evidence record must include claim_evidence");
    }
  }

  return {
    ok: errors.length === 0,
    goal_pack: pack.name,
    goal_status: goal.status,
    progress_status: progress.status,
    active_work_item: progress.active_work_item,
    work_item_count: progress.work_items.length,
    evidence_count: evidenceRecords.length,
    errors,
    warnings,
  };
}

export function validateEvidenceRecord(pack, record) {
  const errors = [];
  if (!record || typeof record !== "object" || Array.isArray(record)) return ["evidence record must be an object"];
  if (String(record.schema_version || "") !== "2") errors.push("evidence record schema_version must be 2");
  if (!record.evidence_id || !/^E\d{3}$/.test(record.evidence_id)) errors.push(`evidence record id must use E### format; got ${record.evidence_id || "<missing>"}`);
  if (!record.recorded_at) errors.push(`evidence record ${record.evidence_id || "<missing>"} missing recorded_at`);
  if (!record.work_id) {
    errors.push("evidence record missing work_id");
    return errors;
  }

  const workItem = findWorkItem(pack.progress, record.work_id);
  if (!workItem) {
    errors.push(`evidence record references unknown work item ${record.work_id}`);
    return errors;
  }

  if (!record.type || !WORK_ITEM_TYPES.includes(record.type)) errors.push(`evidence record ${record.evidence_id || record.work_id} type must be ${WORK_ITEM_TYPES.join(", ")}`);
  if (!EVIDENCE_RESULTS.includes(record.result)) errors.push(`evidence record ${record.evidence_id || record.work_id} result must be ${EVIDENCE_RESULTS.join(", ")}`);
  if (record.next_action && !NEXT_ACTIONS.includes(record.next_action)) {
    errors.push(`evidence record ${record.evidence_id || record.work_id} next_action must be ${NEXT_ACTIONS.join(", ")}`);
  }

  const changedFiles = Array.isArray(record.changed_files) ? record.changed_files : [];
  for (const file of changedFiles) {
    if (!matchesAllowedScope(file, workItem.allowed_scope)) {
      errors.push(`evidence record ${record.evidence_id || record.work_id} changed file outside allowed_scope: ${normalizePath(file)}`);
    }
  }

  if (record.result === "done" && record.type === "implementation") {
    if (!Array.isArray(record.changed_files) || record.changed_files.length === 0) errors.push(`evidence record ${record.evidence_id || record.work_id} done implementation missing changed_files`);
    if (!Array.isArray(recordChecks(record)) || recordChecks(record).length === 0) errors.push(`evidence record ${record.evidence_id || record.work_id} done implementation missing checks`);
    for (const check of recordChecks(record)) {
      if (!check || check.status !== "pass") errors.push(`evidence record ${record.evidence_id || record.work_id} done implementation check did not pass`);
    }
    if (!Array.isArray(record.evidence) || record.evidence.length === 0) errors.push(`evidence record ${record.evidence_id || record.work_id} done implementation missing evidence`);
    if (!Array.isArray(record.claims) || record.claims.length === 0) errors.push(`evidence record ${record.evidence_id || record.work_id} done implementation missing claims`);
    if (!record.summary || typeof record.summary !== "string") errors.push(`evidence record ${record.evidence_id || record.work_id} done implementation missing summary`);
  }

  if (record.result === "blocked" && (!Array.isArray(record.blocked_by) || record.blocked_by.length === 0)) {
    errors.push(`blocked evidence record ${record.evidence_id || record.work_id} missing blocked_by`);
  }

  if (record.type === "review" && record.decision === "complete") {
    if (record.completion_satisfied !== true) errors.push("completion review evidence record must set completion_satisfied: true");
    if (!hasCompletionReviewEvidence(record)) errors.push("completion review evidence record must include claim_evidence");
  }

  return errors;
}

function validateProgressActionHints(progress, warnings) {
  if (progress.active_work_item) return;
  const firstQueued = progress.work_items.find((item) => item.status === "queued");
  if (!firstQueued) return;
  if (firstQueued.type !== "planning") return;
  if (progress.next_action === "needs_plan") return;
  warnings.push(`first queued work item ${firstQueued.id} is planning but next_action is ${progress.next_action || "<missing>"}; consider next_action: needs_plan`);
}

export function appendEvidenceRecord(goalRoot, record) {
  const pack = loadGoalPack(goalRoot);
  const errors = validateEvidenceRecord(pack, record);
  if (errors.length > 0) {
    const error = new Error(errors.join("\n")) as Error & { errors: string[] };
    error.errors = errors;
    throw error;
  }

  const existing = pack.texts.evidence;
  const prefix = existing.length > 0 && !existing.endsWith("\n") ? "\n" : "";
  atomicWrite(pack.files.evidence, `${existing}${prefix}${JSON.stringify(record)}\n`);
  return { ok: true, evidence_record: record };
}

type ActivateGoalWorkOptions = {
  workId?: string | null;
  dryRun?: boolean;
};

export function activateGoalWork(goalRoot, { workId, dryRun = false }: ActivateGoalWorkOptions = {}) {
  if (!workId) throw new Error("activate requires workId");
  const pack = loadGoalPack(goalRoot);
  const workItem = findWorkItem(pack.progress, workId);
  if (!workItem) throw new Error(`work item not found: ${workId}`);
  if (["done", "retired"].includes(String(pack.progress.status || "")) || ["done", "retired"].includes(String(pack.goal.status || ""))) {
    throw new Error(`cannot activate work item in ${pack.progress.status || pack.goal.status} Goal Pack`);
  }
  if (["done", "blocked"].includes(workItem.status)) {
    throw new Error(`cannot activate ${workId}; work item status is ${workItem.status}`);
  }
  if (workItem.type === "implementation") {
    if (workItem.allowed_scope.length === 0) throw new Error(`cannot activate implementation ${workId}; missing allowed_scope`);
    if (workItem.checks.length === 0) throw new Error(`cannot activate implementation ${workId}; missing checks`);
    if (workItem.stop_if.length === 0) throw new Error(`cannot activate implementation ${workId}; missing stop_if`);
  }

  const activeWorkItems = pack.progress.work_items.filter((candidate) => candidate.status === "active");
  if (activeWorkItems.length > 0 && !activeWorkItems.some((candidate) => candidate.id === workId)) {
    throw new Error(`cannot activate ${workId}; active work item already set to ${activeWorkItems.map((candidate) => candidate.id).join(", ")}`);
  }

  const nextProgress = structuredClone(pack.progress);
  const nextWorkItem = findWorkItem(nextProgress, workId);
  const warnings = [];
  const alreadyActive = nextProgress.status === "running"
    && nextProgress.active_work_item === workId
    && nextWorkItem.status === "active";

  if (!alreadyActive) {
    nextWorkItem.status = "active";
    nextProgress.status = "running";
    nextProgress.active_work_item = workId;
    nextProgress.next_action = actionForWorkItem(nextWorkItem);
  }

  const serializedProgress = serializeProgress(nextProgress);
  const goalStatus = pack.goal.status === "running"
    ? pack.goal.status
    : "running";
  const serializedGoal = goalStatus !== pack.goal.status
    ? updateTopScalar(pack.texts.goal, "status", goalStatus)
    : pack.texts.goal;

  if (!dryRun && !alreadyActive) {
    atomicWrite(pack.files.progress, serializedProgress);
    if (serializedGoal !== pack.texts.goal) atomicWrite(pack.files.goal, serializedGoal);
  }

  if (alreadyActive) warnings.push(`${workId} is already active`);

  return {
    ok: true,
    dry_run: dryRun,
    goal_id: pack.goal.id || pack.progress.goal_id || null,
    work_id: workId,
    status: nextProgress.status,
    active_work_item: nextProgress.active_work_item,
    next_action: nextProgress.next_action,
    goal_status: goalStatus,
    warnings,
  };
}

export function applyGoalProgress(goalRoot, { dryRun = false } = {}) {
  const pack = loadGoalPack(goalRoot);
  const latest = pack.evidence_records.at(-1);
  if (!latest) throw new Error("evidence.jsonl has no evidence records to apply from");

  const errors = validateEvidenceRecord(pack, latest);
  if (errors.length > 0) {
    const error = new Error(errors.join("\n")) as Error & { errors: string[] };
    error.errors = errors;
    throw error;
  }

  const nextProgress = structuredClone(pack.progress);
  const workItem = findWorkItem(nextProgress, latest.work_id);
  const warnings = [];
  let goalStatus = pack.goal.status;

  if (latest.result === "blocked") {
    workItem.status = "blocked";
    nextProgress.status = "blocked";
    nextProgress.active_work_item = null;
    nextProgress.blockers = unique([...nextProgress.blockers, ...latest.blocked_by]);
    nextProgress.last_check = {
      result: "blocked",
      checks: checkLines(recordChecks(latest)),
    };
    nextProgress.next_action = "blocked";
  } else if (latest.type === "review" && latest.decision === "complete" && latest.completion_satisfied === true) {
    workItem.status = "done";
    nextProgress.status = "done";
    nextProgress.active_work_item = null;
    nextProgress.last_check = {
      result: "pass",
      checks: checkLines(recordChecks(latest)),
    };
    nextProgress.next_action = "done";
    goalStatus = "done";
  } else if (latest.result === "done") {
    workItem.status = "done";
    nextProgress.last_check = {
      result: allChecksPass(recordChecks(latest)) ? "pass" : "unknown",
      checks: checkLines(recordChecks(latest)),
    };
    const action = latest.next_action || "proof_step";
    applyNextAction(nextProgress, action, warnings);
  }

  const serializedProgress = serializeProgress(nextProgress);
  const serializedGoal = goalStatus !== pack.goal.status
    ? updateTopScalar(pack.texts.goal, "status", goalStatus)
    : pack.texts.goal;

  if (!dryRun) {
    atomicWrite(pack.files.progress, serializedProgress);
    if (serializedGoal !== pack.texts.goal) atomicWrite(pack.files.goal, serializedGoal);
  }

  return {
    ok: true,
    dry_run: dryRun,
    evidence_record: compactEvidenceRecord(latest),
    progress: nextProgress,
    goal_status: goalStatus,
    warnings,
  };
}

export function serializeProgress(progress) {
  const lines = [];
  lines.push(`schema_version: ${progress.schema_version ?? 2}`);
  lines.push(`goal_id: ${yamlScalar(progress.goal_id)}`);
  lines.push(`status: ${progress.status}`);
  lines.push("");
  lines.push("proof_step:");
  lines.push(`  from: ${yamlScalar(progress.proof_step.from)}`);
  lines.push(`  target_delta: ${yamlScalar(progress.proof_step.target_delta)}`);
  appendList(lines, "  proof_path:", progress.proof_step.proof_path, 4);
  appendList(lines, "  checks:", progress.proof_step.checks, 4);
  appendList(lines, "  failure_inspection:", progress.proof_step.failure_inspection, 4);
  lines.push("");
  lines.push(`active_work_item: ${progress.active_work_item || "null"}`);
  lines.push("");
  lines.push("work_items:");
  for (const item of progress.work_items) {
    lines.push(`  - id: ${item.id}`);
    lines.push(`    type: ${item.type}`);
    lines.push(`    status: ${item.status}`);
    lines.push(`    objective: ${yamlScalar(item.objective)}`);
    if (item.plan) lines.push(`    plan: ${yamlScalar(item.plan)}`);
    if (item.allowed_scope.length > 0) appendList(lines, "    allowed_scope:", item.allowed_scope, 6);
    if (item.checks.length > 0) appendList(lines, "    checks:", item.checks, 6);
    if (item.stop_if.length > 0) appendList(lines, "    stop_if:", item.stop_if, 6);
  }
  lines.push("");
  appendList(lines, "blockers:", progress.blockers, 2);
  lines.push("");
  lines.push("last_check:");
  lines.push(`  result: ${progress.last_check.result || "unknown"}`);
  appendList(lines, "  checks:", progress.last_check.checks || [], 4);
  lines.push("");
  lines.push(`next_action: ${progress.next_action || "proof_step"}`);
  return `${lines.join("\n")}\n`;
}

export function matchesAllowedScope(file, allowedScope = []) {
  const normalizedFile = normalizePath(file);
  for (const scope of allowedScope || []) {
    const normalizedScope = normalizePath(scope);
    if (!normalizedScope) continue;
    if (normalizedScope === normalizedFile) return true;
    if (normalizedScope.endsWith("/**")) {
      const base = normalizedScope.slice(0, -3);
      if (normalizedFile === base || normalizedFile.startsWith(`${base}/`)) return true;
      continue;
    }
    if (normalizedScope.startsWith("*.")) {
      if (normalizedFile.endsWith(normalizedScope.slice(1))) return true;
      continue;
    }
    if (normalizedScope.includes("*")) {
      const pattern = `^${escapeRegExp(normalizedScope).replaceAll("\\*", ".*")}$`;
      if (new RegExp(pattern).test(normalizedFile)) return true;
    }
  }
  return false;
}

export function normalizePath(value) {
  return String(value || "").replaceAll("\\", "/").replace(/^\.\//, "").replace(/\/+/g, "/");
}

export function isWeak(value) {
  if (value === null || value === undefined) return true;
  const normalized = String(value).trim().toLowerCase();
  return normalized === "" || normalized === "unknown" || normalized === "tbd" || normalized === "todo" || /^<.*>$/.test(normalized);
}

export function clean(value) {
  if (value === undefined || value === null) return null;
  const trimmed = String(value).replace(/\s+#.*$/, "").trim();
  if (!trimmed || trimmed === "null") return null;
  if (trimmed === "true") return true;
  if (trimmed === "false") return false;
  return trimmed.replace(/^['"]|['"]$/g, "");
}

export function topScalar(text, key) {
  return keyValue(text, key, 0);
}

export function pathScalar(text, path, key) {
  let body = text;
  for (const segment of path) {
    body = blockText(body, segment, 0);
    if (!body) return null;
  }
  const indent = path.length * 2;
  return keyValue(body, key, indent);
}

export function blockText(text, key, indent) {
  const lines = text.split(/\r?\n/);
  const start = lines.findIndex((line) => new RegExp(`^ {${indent}}${escapeRegExp(key)}:[ \t]*$`).test(line));
  if (start === -1) return "";
  const collected = [];
  for (let index = start + 1; index < lines.length; index += 1) {
    const line = lines[index];
    if (line.trim() && lineIndent(line) <= indent) break;
    collected.push(line);
  }
  return collected.join("\n");
}

export function listScalar(text, key, indent) {
  const lines = text.split(/\r?\n/);
  const start = findKeyLine(lines, key, indent);
  if (start === -1) return [];
  const inline = keyLineValue(lines[start], key, indent);
  if (inline.trim() === "[]") return [];
  if (inline.trim().startsWith("[") && inline.trim().endsWith("]")) return parseInlineList(inline);
  return listAfterKey(lines, start, indent);
}

function parseWorkItems(text) {
  const body = blockText(text, "work_items", 0);
  if (!body) return [];
  const lines = body.split(/\r?\n/);
  const items = [];
  let current = null;
  let currentLines = [];
  const finish = () => {
    if (!current) return;
    items.push({
      id: current.id,
      type: workItemScalar(currentLines, "type"),
      status: workItemScalar(currentLines, "status"),
      objective: workItemScalar(currentLines, "objective"),
      plan: workItemScalar(currentLines, "plan"),
      allowed_scope: workItemList(currentLines, "allowed_scope"),
      checks: workItemList(currentLines, "checks"),
      stop_if: workItemList(currentLines, "stop_if"),
    });
  };
  for (const line of lines) {
    const idMatch = line.match(/^\s{2}-\s+id:\s*(.+?)\s*$/);
    if (idMatch) {
      finish();
      current = { id: clean(idMatch[1]) };
      currentLines = [line];
      continue;
    }
    if (current) currentLines.push(line);
  }
  finish();
  return items;
}

function workItemScalar(lines, key) {
  return keyValue(lines.join("\n"), key, 4);
}

function workItemList(lines, key) {
  return listScalar(lines.join("\n"), key, 4);
}

function validateWorkItem(item, errors) {
  if (!item.id || !/^W\d{3}$/.test(item.id)) errors.push(`work item id must use W### format; got ${item.id || "<missing>"}`);
  if (!WORK_ITEM_TYPES.includes(item.type)) errors.push(`work item ${item.id} type must be ${WORK_ITEM_TYPES.join(", ")}`);
  if (!WORK_ITEM_STATUSES.includes(item.status)) errors.push(`work item ${item.id} status must be ${WORK_ITEM_STATUSES.join(", ")}`);
  if (!item.objective) errors.push(`work item ${item.id} missing objective`);
  if (item.type === "implementation" && item.status === "active") {
    if (item.allowed_scope.length === 0) errors.push(`active implementation ${item.id} missing allowed_scope`);
    if (item.checks.length === 0) errors.push(`active implementation ${item.id} missing checks`);
    if (item.stop_if.length === 0) errors.push(`active implementation ${item.id} missing stop_if`);
  }
}

function evidenceSchemaForWorkItem(item) {
  if (item.type === "review") {
    return {
      schema_version: 2,
      evidence_id: "E999",
      work_id: item.id,
      type: "review",
      result: "done",
      decision: "complete",
      completion_satisfied: true,
      recorded_at: "<ISO-8601-UTC>",
      claim_evidence: [{ claim: "completion.required_evidence", evidence: ["<evidence/check reference>"] }],
      not_claimed: [],
      remaining_gaps: [],
      summary: "",
      next_action: "done",
    };
  }
  return {
    schema_version: 2,
    evidence_id: "<E###>",
    work_id: item.id,
    type: item.type,
    result: "done",
    recorded_at: "<ISO-8601-UTC>",
    changed_files: ["<file-in-allowed-scope>"],
    checks: [{ kind: "command", cmd: "<command>", status: "pass" }],
    evidence: ["<evidence>"],
    claims: ["<claim>"],
    not_claimed: [],
    summary: "",
    next_action: "continue",
  };
}

function actionForWorkItem(item) {
  if (item.type === "review") return "review";
  if (item.type === "planning") return "needs_plan";
  return "continue";
}

function applyNextAction(progress, action, warnings) {
  if (action === "blocked" || action === "needs_human") {
    progress.status = "blocked";
    progress.active_work_item = null;
    progress.next_action = action;
    return;
  }
  if (action === "done") {
    progress.status = "done";
    progress.active_work_item = null;
    progress.next_action = "done";
    return;
  }
  if (action === "needs_plan") {
    progress.active_work_item = null;
    progress.next_action = "needs_plan";
    return;
  }
  if (action === "review") {
    activateQueuedWorkItem(progress, warnings, { preferredType: "review", fallbackAction: "review" });
    return;
  }
  if (action === "continue") {
    activateQueuedWorkItem(progress, warnings, { preferredType: null, fallbackAction: "proof_step" });
    return;
  }
  progress.active_work_item = null;
  progress.next_action = "proof_step";
}

function activateQueuedWorkItem(progress, warnings, { preferredType, fallbackAction }) {
  const queued = progress.work_items.filter((item) => item.status === "queued" && (!preferredType || item.type === preferredType));
  if (queued.length === 1) {
    queued[0].status = "active";
    progress.active_work_item = queued[0].id;
    progress.status = "running";
    progress.next_action = queued[0].type === "review" ? "review" : "continue";
    return;
  }
  progress.active_work_item = null;
  progress.next_action = fallbackAction;
  if (queued.length > 1) warnings.push(`multiple queued work items match ${preferredType || "any"}; active_work_item not changed`);
  if (queued.length === 0) warnings.push(`no queued work item matches ${preferredType || "any"}; next_action set to ${fallbackAction}`);
}

function appendList(lines, label, values, itemIndent) {
  lines.push(label);
  if (!values || values.length === 0) return;
  const prefix = " ".repeat(itemIndent);
  for (const value of values) lines.push(`${prefix}- ${yamlScalar(value)}`);
}

function yamlScalar(value) {
  if (value === null || value === undefined) return "null";
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  const string = String(value);
  if (/^[A-Za-z0-9_./*:-]+$/.test(string)) return string;
  return JSON.stringify(string);
}

function atomicWrite(path, text) {
  const tmp = `${path}.tmp-${process.pid}`;
  writeFileSync(tmp, text);
  renameSync(tmp, path);
}

function updateTopScalar(text, key, value) {
  const pattern = new RegExp(`^${escapeRegExp(key)}:\\s*.*$`, "m");
  if (pattern.test(text)) return text.replace(pattern, `${key}: ${value}`);
  return `${key}: ${value}\n${text}`;
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function keyValue(text, key, indent) {
  const lines = text.split(/\r?\n/);
  const index = findKeyLine(lines, key, indent);
  if (index === -1) return null;

  const raw = keyLineValue(lines[index], key, indent);
  const inline = raw.trim();
  if (inline === "[]") return [];
  if (inline.startsWith("[") && inline.endsWith("]")) return parseInlineList(inline);

  const value = clean(raw);
  if (typeof value === "string" && /^([>|])[-+]?$/.test(value)) {
    return parseBlockScalar(lines, index, indent, value[0]);
  }
  if (value !== null) return value;

  const nestedList = listAfterKey(lines, index, indent);
  return nestedList.length > 0 ? nestedList : null;
}

function findKeyLine(lines, key, indent) {
  const pattern = new RegExp(`^ {${indent}}${escapeRegExp(key)}:(?:[ \t]*(.*))?$`);
  return lines.findIndex((line) => pattern.test(line));
}

function keyLineValue(line, key, indent) {
  const match = line.match(new RegExp(`^ {${indent}}${escapeRegExp(key)}:(?:[ \t]*(.*))?$`));
  return match ? match[1] ?? "" : "";
}

function listAfterKey(lines, start, indent) {
  const values = [];
  const itemPattern = new RegExp(`^ {${indent + 2}}-[ \t]*(.*?)[ \t]*$`);
  for (let index = start + 1; index < lines.length; index += 1) {
    const line = lines[index];
    if (line.trim() && lineIndent(line) <= indent) break;
    const item = line.match(itemPattern);
    if (item) {
      const value = clean(item[1]);
      if (value !== null) values.push(value);
    }
  }
  return values;
}

function parseInlineList(value) {
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.map(clean).filter((item) => item !== null) : [];
  } catch {
    return value.slice(1, -1).split(",").map(clean).filter((item) => item !== null);
  }
}

function parseBlockScalar(lines, start, indent, style) {
  const rawBlock = collectChildLines(lines, start, indent);
  const block = stripBlockIndent(rawBlock);
  while (block.length > 0 && !block[0].trim()) block.shift();
  while (block.length > 0 && !block.at(-1).trim()) block.pop();
  if (style === "|") return block.join("\n");

  const folded = [];
  let paragraph = [];
  const flushParagraph = () => {
    if (paragraph.length === 0) return;
    folded.push(paragraph.map((line) => line.trim()).join(" "));
    paragraph = [];
  };

  for (const line of block) {
    if (!line.trim()) {
      flushParagraph();
      folded.push("");
      continue;
    }
    paragraph.push(line);
  }
  flushParagraph();
  return folded.join("\n").trim();
}

function collectChildLines(lines, start, indent) {
  const collected = [];
  for (let index = start + 1; index < lines.length; index += 1) {
    const line = lines[index];
    if (line.trim() && lineIndent(line) <= indent) break;
    collected.push(line);
  }
  return collected;
}

function stripBlockIndent(lines) {
  const minIndent = Math.min(
    ...lines.filter((line) => line.trim()).map(lineIndent),
  );
  if (!Number.isFinite(minIndent)) return [];
  return lines.map((line) => line.slice(Math.min(lineIndent(line), minIndent)));
}

function lineIndent(line) {
  return line.match(/^ */)[0].length;
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
