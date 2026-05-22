import {
  existsSync,
  readFileSync,
  renameSync,
  writeFileSync,
} from "node:fs";
import { basename, join, resolve } from "node:path";

export const STATUS_VALUES = ["forming", "ready", "running", "blocked", "done", "retired"];
export const TASK_TYPES = ["scout", "judge", "worker", "pm", "audit", "plan_required"];
export const TASK_STATUSES = ["queued", "active", "blocked", "done"];
export const NEXT_DECISIONS = ["edge", "continue", "plan_required", "blocked", "audit", "done", "needs-human"];
export const RECEIPT_RESULTS = ["done", "blocked"];

export function loadGoalPack(goalRoot) {
  const root = resolve(goalRoot);
  const files = {
    contract: join(root, "contract.yaml"),
    state: join(root, "state.yaml"),
    receipts: join(root, "receipts.jsonl"),
  };
  const missing = [];
  if (!existsSync(files.contract)) missing.push("contract.yaml");
  if (!existsSync(files.state)) missing.push("state.yaml");
  if (!existsSync(files.receipts)) missing.push("receipts.jsonl");

  const contractText = existsSync(files.contract) ? readFileSync(files.contract, "utf8") : "";
  const stateText = existsSync(files.state) ? readFileSync(files.state, "utf8") : "";
  const receiptsText = existsSync(files.receipts) ? readFileSync(files.receipts, "utf8") : "";
  const { receipts, parseErrors: receiptParseErrors } = parseReceipts(receiptsText);

  return {
    root,
    name: basename(root),
    files,
    missing,
    texts: {
      contract: contractText,
      state: stateText,
      receipts: receiptsText,
    },
    contract: parseContract(contractText),
    state: parseState(stateText),
    receipts,
    receiptParseErrors,
  };
}

export function parseContract(text) {
  return {
    id: topScalar(text, "id"),
    status: topScalar(text, "status"),
    objective: topScalar(text, "objective"),
    north_star: topScalar(text, "north_star"),
    authority_refs: listScalar(text, "authority_refs", 0),
    architecture_standard: listScalar(text, "architecture_standard", 0),
    constraints: listScalar(text, "constraints", 0),
    non_goals: listScalar(text, "non_goals", 0),
    stop_rules: listScalar(text, "stop_rules", 0),
    completion_oracle: {
      signal: pathScalar(text, ["completion_oracle"], "signal"),
      final_proof: pathScalar(text, ["completion_oracle"], "final_proof"),
    },
    claim_boundary: topScalar(text, "claim_boundary"),
    autonomy_policy: {
      continue_by_default: pathScalar(text, ["autonomy_policy"], "continue_by_default"),
      protected_fields: listScalar(blockText(text, "autonomy_policy", 0), "protected_fields", 2),
    },
  };
}

export function parseState(text) {
  return {
    version: topScalar(text, "version"),
    goal_id: topScalar(text, "goal_id"),
    status: topScalar(text, "status"),
    current_edge: {
      from: pathScalar(text, ["current_edge"], "from"),
      target_delta: pathScalar(text, ["current_edge"], "target_delta"),
      harnessed_path: listScalar(blockText(text, "current_edge", 0), "harnessed_path", 2),
      verify: listScalar(blockText(text, "current_edge", 0), "verify", 2),
      failure_inspection: listScalar(blockText(text, "current_edge", 0), "failure_inspection", 2),
    },
    active_task: topScalar(text, "active_task"),
    tasks: parseTasks(text),
    blockers: listScalar(text, "blockers", 0),
    last_verification: {
      result: pathScalar(text, ["last_verification"], "result") || "unknown",
      commands: listScalar(blockText(text, "last_verification", 0), "commands", 2),
    },
    next_decision: topScalar(text, "next_decision"),
  };
}

export function parseReceipts(text) {
  const receipts = [];
  const parseErrors = [];
  for (const [index, line] of text.split(/\r?\n/).entries()) {
    if (!line.trim()) continue;
    try {
      receipts.push(JSON.parse(line));
    } catch {
      parseErrors.push(`invalid receipts.jsonl line ${index + 1}`);
    }
  }
  return { receipts, parseErrors };
}

export function findTask(state, taskId) {
  return state.tasks.find((task) => task.id === taskId) || null;
}

export function getActiveTask(state) {
  if (!state.active_task) return null;
  return findTask(state, state.active_task);
}

export function compactReceipt(receipt) {
  if (!receipt) return null;
  return {
    task_id: receipt.task_id || null,
    type: receipt.type || null,
    result: receipt.result || null,
    decision: receipt.decision || null,
    oracle_satisfied: receipt.oracle_satisfied === true,
    next_decision: receipt.next_decision || null,
  };
}

export function inspectGoalPack(goalRoot) {
  const pack = loadGoalPack(goalRoot);
  const validation = validateGoalPack(pack);
  const activeTask = getActiveTask(pack.state);
  const lastReceipt = pack.receipts.at(-1) || null;
  const blocked = pack.state.status === "blocked" || pack.state.next_decision === "blocked";
  const canContinue = pack.state.status === "running"
    && !blocked
    && ["edge", "continue", "plan_required", "audit"].includes(String(pack.state.next_decision || ""));

  return {
    goal_id: pack.contract.id || pack.state.goal_id || null,
    status: pack.state.status || pack.contract.status || null,
    objective: pack.contract.objective || null,
    oracle: pack.contract.completion_oracle,
    claim_boundary: pack.contract.claim_boundary || null,
    current_edge: pack.state.current_edge,
    active_task: activeTask,
    last_receipt: compactReceipt(lastReceipt),
    next_decision: pack.state.next_decision || null,
    blockers: pack.state.blockers,
    can_continue: canContinue,
    task_count: pack.state.tasks.length,
    receipt_count: pack.receipts.length,
    warnings: validation.warnings,
    errors: validation.errors,
  };
}

export function renderPrompt(goalRoot, { taskId = null } = {}) {
  const pack = loadGoalPack(goalRoot);
  const selectedTaskId = taskId || pack.state.active_task;
  const task = selectedTaskId ? findTask(pack.state, selectedTaskId) : null;
  if (!task) {
    throw new Error(`task not found: ${selectedTaskId || "<active_task>"}`);
  }

  const warnings = [];
  if (task.id !== pack.state.active_task) warnings.push(`selected task ${task.id} is not active_task ${pack.state.active_task || "null"}`);

  return {
    goal_id: pack.contract.id || pack.state.goal_id || null,
    status: pack.state.status || null,
    protected_fields: {
      objective: pack.contract.objective || null,
      authority_refs: pack.contract.authority_refs,
      architecture_standard: pack.contract.architecture_standard,
      completion_oracle: pack.contract.completion_oracle,
      claim_boundary: pack.contract.claim_boundary || null,
      stop_rules: pack.contract.stop_rules,
    },
    current_edge: pack.state.current_edge,
    task,
    stop_rules: [
      "Do not change protected fields.",
      "Do not write outside allowed_scope.",
      "Stop if no honest falsifiable verification path exists.",
      ...task.stop_if,
    ],
    receipt_schema: receiptSchemaForTask(task),
    warnings,
  };
}

export function validateGoalPack(pack) {
  const errors = [];
  const warnings = [];
  for (const missing of pack.missing) errors.push(`missing ${missing}`);
  for (const error of pack.receiptParseErrors) errors.push(error);

  const { contract, state, receipts } = pack;
  if (!contract.id) errors.push("contract.yaml missing id");
  if (!STATUS_VALUES.includes(contract.status)) {
    errors.push(`contract status must be ${STATUS_VALUES.join(", ")}; got ${contract.status || "<missing>"}`);
  }
  if (!STATUS_VALUES.includes(state.status)) {
    errors.push(`state status must be ${STATUS_VALUES.join(", ")}; got ${state.status || "<missing>"}`);
  }
  if (contract.status && state.status && contract.status !== state.status) {
    warnings.push(`contract status ${contract.status} differs from state status ${state.status}`);
  }
  if (state.next_decision && !NEXT_DECISIONS.includes(state.next_decision)) {
    errors.push(`state next_decision must be ${NEXT_DECISIONS.join(", ")}; got ${state.next_decision}`);
  }
  if (isWeak(contract.completion_oracle.signal)) warnings.push("completion_oracle.signal is missing or weak");
  if (isWeak(contract.completion_oracle.final_proof)) warnings.push("completion_oracle.final_proof is missing or weak");
  if (isWeak(contract.claim_boundary)) warnings.push("claim_boundary is missing or weak");
  if (state.tasks.length === 0) errors.push("state.yaml tasks must contain at least one task");

  const activeTasks = state.tasks.filter((task) => task.status === "active");
  if (state.status === "running") {
    if (activeTasks.length !== 1) errors.push(`running goal pack must have exactly one active task; found ${activeTasks.length}`);
    if (!state.active_task) errors.push("running goal pack must set active_task");
  }
  if (activeTasks.length === 1 && state.active_task !== activeTasks[0].id) {
    errors.push(`active_task must point to ${activeTasks[0].id}; got ${state.active_task || "null"}`);
  }
  if (state.active_task && !state.tasks.some((task) => task.id === state.active_task)) {
    errors.push(`active_task points to unknown task: ${state.active_task}`);
  }

  for (const task of state.tasks) {
    validateTask(task, errors);
  }

  for (const receipt of receipts) {
    for (const error of validateReceipt(pack, receipt)) {
      errors.push(error);
    }
  }

  if (state.status === "done") {
    if (state.active_task !== null) errors.push("done goal pack must set active_task: null");
    if (activeTasks.length > 0) errors.push("done goal pack must not have active tasks");
    if (isWeak(contract.completion_oracle.signal) || isWeak(contract.completion_oracle.final_proof) || isWeak(contract.claim_boundary)) {
      errors.push("done goal pack requires concrete completion_oracle and claim_boundary");
    }
    const finalAudit = receipts.find((receipt) =>
      (receipt.type === "audit" || receipt.task_id === "T999")
        && receipt.result === "done"
        && receipt.decision === "complete"
    );
    if (!finalAudit) {
      errors.push("done goal pack requires a final audit receipt with decision: complete");
    } else {
      if (finalAudit.oracle_satisfied !== true) errors.push("final audit receipt must set oracle_satisfied: true");
      if (!Array.isArray(finalAudit.evidence) || finalAudit.evidence.length === 0) errors.push("final audit receipt must include evidence");
    }
  }

  return {
    ok: errors.length === 0,
    goal_pack: pack.name,
    contract_status: contract.status,
    state_status: state.status,
    active_task: state.active_task,
    task_count: state.tasks.length,
    receipt_count: receipts.length,
    errors,
    warnings,
  };
}

export function validateReceipt(pack, receipt) {
  const errors = [];
  if (!receipt || typeof receipt !== "object" || Array.isArray(receipt)) return ["receipt must be an object"];
  if (!receipt.task_id) {
    errors.push("receipt missing task_id");
    return errors;
  }

  const task = findTask(pack.state, receipt.task_id);
  if (!task) {
    errors.push(`receipt references unknown task ${receipt.task_id}`);
    return errors;
  }

  if (!receipt.type || !TASK_TYPES.includes(receipt.type)) errors.push(`receipt ${receipt.task_id} type must be ${TASK_TYPES.join(", ")}`);
  if (!RECEIPT_RESULTS.includes(receipt.result)) errors.push(`receipt ${receipt.task_id} result must be ${RECEIPT_RESULTS.join(", ")}`);
  if (receipt.next_decision && !NEXT_DECISIONS.includes(receipt.next_decision)) {
    errors.push(`receipt ${receipt.task_id} next_decision must be ${NEXT_DECISIONS.join(", ")}`);
  }

  const changedFiles = Array.isArray(receipt.changed_files) ? receipt.changed_files : [];
  for (const file of changedFiles) {
    if (!matchesAllowedScope(file, task.allowed_scope)) {
      errors.push(`receipt ${receipt.task_id} changed file outside allowed_scope: ${normalizePath(file)}`);
    }
  }

  if (receipt.result === "done" && receipt.type === "worker") {
    if (!Array.isArray(receipt.changed_files) || receipt.changed_files.length === 0) errors.push(`receipt ${receipt.task_id} done worker missing changed_files`);
    if (!Array.isArray(receipt.commands) || receipt.commands.length === 0) errors.push(`receipt ${receipt.task_id} done worker missing commands`);
    for (const command of Array.isArray(receipt.commands) ? receipt.commands : []) {
      if (!command || command.status !== "pass") errors.push(`receipt ${receipt.task_id} done worker command did not pass`);
    }
    if (!Array.isArray(receipt.evidence) || receipt.evidence.length === 0) errors.push(`receipt ${receipt.task_id} done worker missing evidence`);
    if (!Array.isArray(receipt.claims) || receipt.claims.length === 0) errors.push(`receipt ${receipt.task_id} done worker missing claims`);
    if (!receipt.summary || typeof receipt.summary !== "string") errors.push(`receipt ${receipt.task_id} done worker missing summary`);
  }

  if (receipt.result === "blocked" && (!Array.isArray(receipt.blocked_by) || receipt.blocked_by.length === 0)) {
    errors.push(`blocked receipt ${receipt.task_id} missing blocked_by`);
  }

  if (receipt.type === "audit" && receipt.decision === "complete") {
    if (receipt.oracle_satisfied !== true) errors.push("final audit receipt must set oracle_satisfied: true");
    if (!Array.isArray(receipt.evidence) || receipt.evidence.length === 0) errors.push("final audit receipt must include evidence");
  }

  return errors;
}

export function appendReceipt(goalRoot, receipt) {
  const pack = loadGoalPack(goalRoot);
  const errors = validateReceipt(pack, receipt);
  if (errors.length > 0) {
    const error = new Error(errors.join("\n")) as Error & { errors: string[] };
    error.errors = errors;
    throw error;
  }

  const existing = pack.texts.receipts;
  const prefix = existing.length > 0 && !existing.endsWith("\n") ? "\n" : "";
  atomicWrite(pack.files.receipts, `${existing}${prefix}${JSON.stringify(receipt)}\n`);
  return { ok: true, receipt };
}

type ActivateGoalPackOptions = {
  taskId?: string | null;
  dryRun?: boolean;
};

export function activateGoalPack(goalRoot, { taskId, dryRun = false }: ActivateGoalPackOptions = {}) {
  if (!taskId) throw new Error("activate requires taskId");
  const pack = loadGoalPack(goalRoot);
  const task = findTask(pack.state, taskId);
  if (!task) throw new Error(`task not found: ${taskId}`);
  if (["done", "retired"].includes(String(pack.state.status || "")) || ["done", "retired"].includes(String(pack.contract.status || ""))) {
    throw new Error(`cannot activate task in ${pack.state.status || pack.contract.status} goal pack`);
  }
  if (["done", "blocked"].includes(task.status)) {
    throw new Error(`cannot activate ${taskId}; task status is ${task.status}`);
  }
  if (task.type === "worker") {
    if (task.allowed_scope.length === 0) throw new Error(`cannot activate worker ${taskId}; missing allowed_scope`);
    if (task.verify.length === 0) throw new Error(`cannot activate worker ${taskId}; missing verify`);
    if (task.stop_if.length === 0) throw new Error(`cannot activate worker ${taskId}; missing stop_if`);
  }

  const activeTasks = pack.state.tasks.filter((candidate) => candidate.status === "active");
  if (activeTasks.length > 0 && !activeTasks.some((candidate) => candidate.id === taskId)) {
    throw new Error(`cannot activate ${taskId}; active task already set to ${activeTasks.map((candidate) => candidate.id).join(", ")}`);
  }

  const nextState = structuredClone(pack.state);
  const nextTask = findTask(nextState, taskId);
  const warnings = [];
  const alreadyActive = nextState.status === "running"
    && nextState.active_task === taskId
    && nextTask.status === "active";

  if (!alreadyActive) {
    nextTask.status = "active";
    nextState.status = "running";
    nextState.active_task = taskId;
    nextState.next_decision = decisionForTask(nextTask);
  }

  const serializedState = serializeState(nextState);
  const contractStatus = pack.contract.status === "running"
    ? pack.contract.status
    : "running";
  const serializedContract = contractStatus !== pack.contract.status
    ? updateTopScalar(pack.texts.contract, "status", contractStatus)
    : pack.texts.contract;

  if (!dryRun && !alreadyActive) {
    atomicWrite(pack.files.state, serializedState);
    if (serializedContract !== pack.texts.contract) atomicWrite(pack.files.contract, serializedContract);
  }

  if (alreadyActive) warnings.push(`${taskId} is already active`);

  return {
    ok: true,
    dry_run: dryRun,
    goal_id: pack.contract.id || pack.state.goal_id || null,
    task_id: taskId,
    status: nextState.status,
    active_task: nextState.active_task,
    next_decision: nextState.next_decision,
    contract_status: contractStatus,
    warnings,
  };
}

export function advanceGoalPack(goalRoot, { dryRun = false } = {}) {
  const pack = loadGoalPack(goalRoot);
  const latest = pack.receipts.at(-1);
  if (!latest) throw new Error("receipts.jsonl has no receipts to advance from");

  const errors = validateReceipt(pack, latest);
  if (errors.length > 0) {
    const error = new Error(errors.join("\n")) as Error & { errors: string[] };
    error.errors = errors;
    throw error;
  }

  const nextState = structuredClone(pack.state);
  const task = findTask(nextState, latest.task_id);
  const warnings = [];
  let contractStatus = pack.contract.status;

  if (latest.result === "blocked") {
    task.status = "blocked";
    nextState.status = "blocked";
    nextState.active_task = null;
    nextState.blockers = unique([...nextState.blockers, ...latest.blocked_by]);
    nextState.last_verification = {
      result: "blocked",
      commands: commandLines(latest.commands),
    };
    nextState.next_decision = "blocked";
  } else if (latest.type === "audit" && latest.decision === "complete" && latest.oracle_satisfied === true) {
    task.status = "done";
    nextState.status = "done";
    nextState.active_task = null;
    nextState.last_verification = {
      result: "pass",
      commands: commandLines(latest.commands),
    };
    nextState.next_decision = "done";
    contractStatus = "done";
  } else if (latest.result === "done") {
    task.status = "done";
    nextState.last_verification = {
      result: allCommandsPass(latest.commands) ? "pass" : "unknown",
      commands: commandLines(latest.commands),
    };
    const decision = latest.next_decision || "edge";
    applyNextDecision(nextState, decision, warnings);
  }

  const serializedState = serializeState(nextState);
  const serializedContract = contractStatus !== pack.contract.status
    ? updateTopScalar(pack.texts.contract, "status", contractStatus)
    : pack.texts.contract;

  if (!dryRun) {
    atomicWrite(pack.files.state, serializedState);
    if (serializedContract !== pack.texts.contract) atomicWrite(pack.files.contract, serializedContract);
  }

  return {
    ok: true,
    dry_run: dryRun,
    receipt: compactReceipt(latest),
    state: nextState,
    contract_status: contractStatus,
    warnings,
  };
}

export function serializeState(state) {
  const lines = [];
  lines.push(`version: ${state.version ?? 1}`);
  lines.push(`goal_id: ${yamlScalar(state.goal_id)}`);
  lines.push(`status: ${state.status}`);
  lines.push("");
  lines.push("current_edge:");
  lines.push(`  from: ${yamlScalar(state.current_edge.from)}`);
  lines.push(`  target_delta: ${yamlScalar(state.current_edge.target_delta)}`);
  appendList(lines, "  harnessed_path:", state.current_edge.harnessed_path, 4);
  appendList(lines, "  verify:", state.current_edge.verify, 4);
  appendList(lines, "  failure_inspection:", state.current_edge.failure_inspection, 4);
  lines.push("");
  lines.push(`active_task: ${state.active_task || "null"}`);
  lines.push("");
  lines.push("tasks:");
  for (const task of state.tasks) {
    lines.push(`  - id: ${task.id}`);
    lines.push(`    type: ${task.type}`);
    lines.push(`    status: ${task.status}`);
    lines.push(`    objective: ${yamlScalar(task.objective)}`);
    if (task.allowed_scope.length > 0) appendList(lines, "    allowed_scope:", task.allowed_scope, 6);
    if (task.verify.length > 0) appendList(lines, "    verify:", task.verify, 6);
    if (task.stop_if.length > 0) appendList(lines, "    stop_if:", task.stop_if, 6);
  }
  lines.push("");
  appendList(lines, "blockers:", state.blockers, 2);
  lines.push("");
  lines.push("last_verification:");
  lines.push(`  result: ${state.last_verification.result || "unknown"}`);
  appendList(lines, "  commands:", state.last_verification.commands || [], 4);
  lines.push("");
  lines.push(`next_decision: ${state.next_decision || "edge"}`);
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
  const match = text.match(new RegExp(`^${escapeRegExp(key)}:\\s*(.*?)\\s*$`, "m"));
  return match ? clean(match[1]) : null;
}

export function pathScalar(text, path, key) {
  let body = text;
  for (const segment of path) {
    body = blockText(body, segment, 0);
    if (!body) return null;
  }
  const indent = path.length * 2;
  const match = body.match(new RegExp(`^\\s{${indent}}${escapeRegExp(key)}:\\s*(.*?)\\s*$`, "m"));
  return match ? clean(match[1]) : null;
}

export function blockText(text, key, indent) {
  const lines = text.split(/\r?\n/);
  const start = lines.findIndex((line) => new RegExp(`^\\s{${indent}}${escapeRegExp(key)}:\\s*$`).test(line));
  if (start === -1) return "";
  const collected = [];
  for (let index = start + 1; index < lines.length; index += 1) {
    const line = lines[index];
    if (line.trim() && line.match(/^ */)[0].length <= indent) break;
    collected.push(line);
  }
  return collected.join("\n");
}

export function listScalar(text, key, indent) {
  const lines = text.split(/\r?\n/);
  const start = lines.findIndex((line) => new RegExp(`^\\s{${indent}}${escapeRegExp(key)}:\\s*$`).test(line));
  if (start === -1) return [];
  const values = [];
  for (let index = start + 1; index < lines.length; index += 1) {
    const line = lines[index];
    if (line.trim() && line.match(/^ */)[0].length <= indent) break;
    const item = line.match(new RegExp(`^\\s{${indent + 2}}-\\s*(.+?)\\s*$`));
    if (item) values.push(clean(item[1]));
  }
  return values.filter((value) => value !== null);
}

function parseTasks(text) {
  const body = blockText(text, "tasks", 0);
  if (!body) return [];
  const lines = body.split(/\r?\n/);
  const tasks = [];
  let current = null;
  let currentLines = [];
  const finish = () => {
    if (!current) return;
    tasks.push({
      id: current.id,
      type: taskScalar(currentLines, "type"),
      status: taskScalar(currentLines, "status"),
      objective: taskScalar(currentLines, "objective"),
      allowed_scope: taskList(currentLines, "allowed_scope"),
      verify: taskList(currentLines, "verify"),
      stop_if: taskList(currentLines, "stop_if"),
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
  return tasks;
}

function taskScalar(lines, key) {
  const text = lines.join("\n");
  const match = text.match(new RegExp(`^\\s{4}${escapeRegExp(key)}:\\s*(.*?)\\s*$`, "m"));
  return match ? clean(match[1]) : null;
}

function taskList(lines, key) {
  return listScalar(lines.join("\n"), key, 4);
}

function validateTask(task, errors) {
  if (!task.id || !/^T\d{3}$/.test(task.id)) errors.push(`task id must use T### format; got ${task.id || "<missing>"}`);
  if (!TASK_TYPES.includes(task.type)) errors.push(`task ${task.id} type must be ${TASK_TYPES.join(", ")}`);
  if (!TASK_STATUSES.includes(task.status)) errors.push(`task ${task.id} status must be ${TASK_STATUSES.join(", ")}`);
  if (!task.objective) errors.push(`task ${task.id} missing objective`);
  if (task.type === "worker" && task.status === "active") {
    if (task.allowed_scope.length === 0) errors.push(`active worker ${task.id} missing allowed_scope`);
    if (task.verify.length === 0) errors.push(`active worker ${task.id} missing verify`);
    if (task.stop_if.length === 0) errors.push(`active worker ${task.id} missing stop_if`);
  }
}

function receiptSchemaForTask(task) {
  if (task.type === "audit") {
    return {
      task_id: task.id,
      type: "audit",
      result: "done",
      decision: "complete",
      oracle_satisfied: true,
      evidence: ["<oracle evidence>"],
      claims: ["<claim>"],
      summary: "",
      next_decision: "done",
    };
  }
  return {
    task_id: task.id,
    type: task.type,
    result: "done",
    changed_files: ["<file-in-allowed-scope>"],
    commands: [{ cmd: "<command>", status: "pass" }],
    evidence: ["<evidence>"],
    claims: ["<claim>"],
    summary: "",
    next_decision: "continue",
  };
}

function decisionForTask(task) {
  if (task.type === "audit") return "audit";
  if (task.type === "plan_required") return "plan_required";
  return "continue";
}

function applyNextDecision(state, decision, warnings) {
  if (decision === "blocked" || decision === "needs-human") {
    state.status = "blocked";
    state.active_task = null;
    state.next_decision = decision;
    return;
  }
  if (decision === "done") {
    state.status = "done";
    state.active_task = null;
    state.next_decision = "done";
    return;
  }
  if (decision === "plan_required") {
    state.active_task = null;
    state.next_decision = "plan_required";
    return;
  }
  if (decision === "audit") {
    activateQueuedTask(state, warnings, { preferredType: "audit", fallbackDecision: "audit" });
    return;
  }
  if (decision === "continue") {
    activateQueuedTask(state, warnings, { preferredType: null, fallbackDecision: "edge" });
    return;
  }
  state.active_task = null;
  state.next_decision = "edge";
}

function activateQueuedTask(state, warnings, { preferredType, fallbackDecision }) {
  const queued = state.tasks.filter((task) => task.status === "queued" && (!preferredType || task.type === preferredType));
  if (queued.length === 1) {
    queued[0].status = "active";
    state.active_task = queued[0].id;
    state.status = "running";
    state.next_decision = queued[0].type === "audit" ? "audit" : "continue";
    return;
  }
  state.active_task = null;
  state.next_decision = fallbackDecision;
  if (queued.length > 1) warnings.push(`multiple queued tasks match ${preferredType || "any"}; active_task not changed`);
  if (queued.length === 0) warnings.push(`no queued task matches ${preferredType || "any"}; next_decision set to ${fallbackDecision}`);
}

function allCommandsPass(commands) {
  if (!Array.isArray(commands) || commands.length === 0) return false;
  return commands.every((command) => command && command.status === "pass");
}

function commandLines(commands) {
  if (!Array.isArray(commands)) return [];
  return commands.map((command) => {
    if (typeof command === "string") return command;
    if (!command || !command.cmd) return null;
    return `${command.cmd} [${command.status || "unknown"}]`;
  }).filter(Boolean);
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

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
