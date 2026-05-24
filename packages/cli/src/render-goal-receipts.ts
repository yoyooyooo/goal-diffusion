import { loadGoalPack, NEXT_DECISIONS, RECEIPT_RESULTS, TASK_TYPES } from "./lib/goal-pack.ts";
import { maybeSet, normalizeReadControls, readControlFilterFields, setIncluded, withoutZeroBuckets } from "./read-output-control.ts";

const COMMAND_STATUSES = ["pass", "fail"];
const ORACLE_SATISFIED_VALUES = ["true", "false"];

type ReceiptListOptions = {
  json?: boolean;
  limit?: string | number | null;
  task?: string | null;
  type?: string | null;
  result?: string | null;
  decision?: string | null;
  nextDecision?: string | null;
  oracleSatisfied?: string | null;
  changedFile?: string | null;
  commandStatus?: string | null;
  contains?: string | null;
};

type ReceiptShowOptions = {
  json?: boolean;
  index?: string | number | null;
};

export function runReceiptsList(goalRoot, options: ReceiptListOptions = {}) {
  const result = listGoalReceipts(goalRoot, options);
  if (options.json) return JSON.stringify(result, null, 2);
  return renderReceiptsListText(result);
}

export function runReceiptShow(goalRoot, options: ReceiptShowOptions = {}) {
  const result = showGoalReceipt(goalRoot, options);
  if (options.json) return JSON.stringify(result, null, 2);
  return renderReceiptShowText(result);
}

export function listGoalReceipts(goalRoot, options: ReceiptListOptions = {}) {
  const controls = normalizeReadControls(options, { defaultLimit: 5 });
  const filters = normalizeListFilters({ ...options, limit: controls.limit });
  const pack = loadGoalPack(goalRoot);
  const indexed = pack.receipts.map((receipt, index) => ({ index: index + 1, receipt }));
  const matched = indexed.filter((item) => matchesFilters(item.receipt, filters));
  const visible = matched.slice(Math.max(0, matched.length - filters.limit));

  const result: any = {
    goal_id: pack.contract.id || pack.state.goal_id || pack.name,
    filters: {
      ...filters,
      ...readControlFilterFields(controls),
    },
    total: indexed.length,
    matched: matched.length,
    shown: visible.length,
    items: visible.map((item) => compactReceiptItem(item.index, item.receipt, controls)),
  };
  setIncluded(result, "path", pack.root, controls);
  return result;
}

export function showGoalReceipt(goalRoot, options: ReceiptShowOptions = {}) {
  const index = positiveInteger(options.index, "index");
  const pack = loadGoalPack(goalRoot);
  if (index < 1 || index > pack.receipts.length) {
    throw new Error(`receipt index out of range: ${index}`);
  }
  return {
    goal_id: pack.contract.id || pack.state.goal_id || pack.name,
    path: pack.root,
    index,
    receipt: pack.receipts[index - 1],
  };
}

function normalizeListFilters(options) {
  const limit = options.limit === undefined || options.limit === null
    ? 5
    : positiveInteger(options.limit, "limit");
  const type = validateOptional(options.type, TASK_TYPES, "type");
  const result = validateOptional(options.result, RECEIPT_RESULTS, "result");
  const nextDecision = validateOptional(options.nextDecision, NEXT_DECISIONS, "next_decision");
  const commandStatus = validateOptional(options.commandStatus, COMMAND_STATUSES, "command status");
  const oracleSatisfied = validateOptional(options.oracleSatisfied, ORACLE_SATISFIED_VALUES, "oracle_satisfied");

  return {
    limit,
    task: options.task ?? null,
    type,
    result,
    decision: options.decision ?? null,
    next_decision: nextDecision,
    oracle_satisfied: oracleSatisfied === null ? null : oracleSatisfied === "true",
    changed_file: options.changedFile ?? null,
    command_status: commandStatus,
    contains: options.contains ?? null,
  };
}

function validateOptional(value, allowed, label) {
  if (value === undefined || value === null) return null;
  if (!allowed.includes(value)) {
    throw new Error(`${label} must be ${allowed.join(", ")}; got ${value}`);
  }
  return value;
}

function positiveInteger(value, label) {
  const number = Number(value);
  if (!Number.isInteger(number) || number < 1) {
    throw new Error(`${label} must be a positive integer; got ${value ?? "<missing>"}`);
  }
  return number;
}

function matchesFilters(receipt, filters) {
  if (filters.task && receipt.task_id !== filters.task) return false;
  if (filters.type && receipt.type !== filters.type) return false;
  if (filters.result && receipt.result !== filters.result) return false;
  if (filters.decision && receipt.decision !== filters.decision) return false;
  if (filters.next_decision && receipt.next_decision !== filters.next_decision) return false;
  if (filters.oracle_satisfied !== null && (receipt.oracle_satisfied === true) !== filters.oracle_satisfied) return false;
  if (filters.changed_file && !arrayIncludesGlob(receipt.changed_files, filters.changed_file)) return false;
  if (filters.command_status && !arrayIncludesCommandStatus(receipt.commands, filters.command_status)) return false;
  if (filters.contains && !JSON.stringify(receipt).includes(filters.contains)) return false;
  return true;
}

function compactReceiptItem(index, receipt, controls) {
  const item: any = {
    index,
  };
  maybeSet(item, "task_id", receipt.task_id || null, controls);
  maybeSet(item, "type", receipt.type || null, controls);
  maybeSet(item, "result", receipt.result || null, controls);
  maybeSet(item, "decision", receipt.decision || null, controls);
  if (receipt.oracle_satisfied === true || controls.show_empty || controls.include.includes("oracle_satisfied")) {
    item.oracle_satisfied = receipt.oracle_satisfied === true;
  }
  maybeSet(item, "next_decision", receipt.next_decision || null, controls);
  const counts = withoutZeroBuckets({
      changed_files: Array.isArray(receipt.changed_files) ? receipt.changed_files.length : 0,
      commands: Array.isArray(receipt.commands) ? receipt.commands.length : 0,
      evidence: Array.isArray(receipt.evidence) ? receipt.evidence.length : 0,
      claims: Array.isArray(receipt.claims) ? receipt.claims.length : 0,
      blocked_by: Array.isArray(receipt.blocked_by) ? receipt.blocked_by.length : 0,
    }, controls);
  maybeSet(item, "counts", counts, controls);
  maybeSet(item, "summary", typeof receipt.summary === "string" ? receipt.summary : null, controls);
  return item;
}

function renderReceiptsListText(result) {
  const lines = [
    `goal_id: ${result.goal_id}`,
    `filters: limit=${result.filters.limit} task=${result.filters.task || "all"} type=${result.filters.type || "all"} result=${result.filters.result || "all"}`,
    `receipts: total=${result.total} matched=${result.matched} shown=${result.shown}`,
  ];
  for (const item of result.items) {
    lines.push(renderReceiptLine(item));
  }
  return lines.join("\n");
}

function renderReceiptLine(item) {
  const parts = [
    `#${item.index}`,
    item.task_id || "null",
    item.type || "null",
    item.result || "null",
  ];
  if (item.decision) parts.push(`decision=${item.decision}`);
  if (item.oracle_satisfied) parts.push("oracle=true");
  if (item.next_decision) parts.push(`next=${item.next_decision}`);
  parts.push(`files=${item.counts?.changed_files || 0}`);
  parts.push(`commands=${item.counts?.commands || 0}`);
  parts.push(`evidence=${item.counts?.evidence || 0}`);
  parts.push(`claims=${item.counts?.claims || 0}`);
  if ((item.counts?.blocked_by || 0) > 0) parts.push(`blocked_by=${item.counts.blocked_by}`);
  if (item.summary) parts.push(`summary="${truncate(item.summary)}"`);
  return parts.join("  ");
}

function renderReceiptShowText(result) {
  return JSON.stringify(result, null, 2);
}

function truncate(value, max = 120) {
  return value.length > max ? `${value.slice(0, max - 1)}...` : value;
}

function arrayIncludesCommandStatus(commands, status) {
  return Array.isArray(commands) && commands.some((command) => command && command.status === status);
}

function arrayIncludesGlob(values, glob) {
  return Array.isArray(values) && values.some((value) => globMatches(String(value), glob));
}

function globMatches(value, glob) {
  if (!glob.includes("*")) return value === glob;
  const pattern = glob
    .split("*")
    .map((part) => part.replace(/[|\\{}()[\]^$+?.]/g, "\\$&"))
    .join(".*");
  return new RegExp(`^${pattern}$`).test(value);
}
