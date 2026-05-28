import { EVIDENCE_RESULTS, loadGoalPack, NEXT_ACTIONS, WORK_ITEM_TYPES } from "./lib/goal-pack.ts";
import { recordChecks } from "./lib/goal-evidence-helpers.ts";
import { maybeSet, normalizeReadControls, readControlFilterFields, setIncluded, withoutZeroBuckets } from "./read-output-control.ts";

const COMMAND_STATUSES = ["pass", "fail"];
const COMPLETION_SATISFIED_VALUES = ["true", "false"];

type EvidenceListOptions = {
  json?: boolean;
  limit?: string | number | null;
  work?: string | null;
  type?: string | null;
  result?: string | null;
  decision?: string | null;
  nextAction?: string | null;
  completionSatisfied?: string | null;
  changedFile?: string | null;
  commandStatus?: string | null;
  contains?: string | null;
};

type EvidenceShowOptions = {
  json?: boolean;
  index?: string | number | null;
};

export function runEvidenceList(goalRoot, options: EvidenceListOptions = {}) {
  const result = listGoalEvidence(goalRoot, options);
  if (options.json) return JSON.stringify(result, null, 2);
  return renderEvidenceListText(result);
}

export function runEvidenceShow(goalRoot, options: EvidenceShowOptions = {}) {
  const result = showGoalEvidence(goalRoot, options);
  if (options.json) return JSON.stringify(result, null, 2);
  return renderEvidenceShowText(result);
}

export function listGoalEvidence(goalRoot, options: EvidenceListOptions = {}) {
  const controls = normalizeReadControls(options, { defaultLimit: 5 });
  const filters = normalizeListFilters({ ...options, limit: controls.limit });
  const pack = loadGoalPack(goalRoot);
  const indexed = pack.evidence_records.map((record, index) => ({ index: index + 1, record }));
  const matched = indexed.filter((item) => matchesFilters(item.record, filters));
  const visible = matched.slice(Math.max(0, matched.length - filters.limit));

  const result: any = {
    goal_id: pack.goal.id || pack.progress.goal_id || pack.name,
    filters: {
      ...filters,
      ...readControlFilterFields(controls),
    },
    total: indexed.length,
    matched: matched.length,
    shown: visible.length,
    items: visible.map((item) => compactEvidenceItem(item.index, item.record, controls)),
  };
  setIncluded(result, "path", pack.root, controls);
  return result;
}

export function showGoalEvidence(goalRoot, options: EvidenceShowOptions = {}) {
  const index = positiveInteger(options.index, "index");
  const pack = loadGoalPack(goalRoot);
  if (index < 1 || index > pack.evidence_records.length) {
    throw new Error(`evidence index out of range: ${index}`);
  }
  return {
    goal_id: pack.goal.id || pack.progress.goal_id || pack.name,
    path: pack.root,
    index,
    evidence_record: pack.evidence_records[index - 1],
  };
}

function normalizeListFilters(options) {
  const limit = options.limit === undefined || options.limit === null
    ? 5
    : positiveInteger(options.limit, "limit");
  const type = validateOptional(options.type, WORK_ITEM_TYPES, "type");
  const result = validateOptional(options.result, EVIDENCE_RESULTS, "result");
  const nextAction = validateOptional(options.nextAction, NEXT_ACTIONS, "next_action");
  const commandStatus = validateOptional(options.commandStatus, COMMAND_STATUSES, "command status");
  const completionSatisfied = validateOptional(options.completionSatisfied, COMPLETION_SATISFIED_VALUES, "completion_satisfied");

  return {
    limit,
    work: options.work ?? null,
    type,
    result,
    decision: options.decision ?? null,
    next_action: nextAction,
    completion_satisfied: completionSatisfied === null ? null : completionSatisfied === "true",
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

function matchesFilters(record, filters) {
  if (filters.work && record.work_id !== filters.work) return false;
  if (filters.type && record.type !== filters.type) return false;
  if (filters.result && record.result !== filters.result) return false;
  if (filters.decision && record.decision !== filters.decision) return false;
  if (filters.next_action && record.next_action !== filters.next_action) return false;
  if (filters.completion_satisfied !== null && (record.completion_satisfied === true) !== filters.completion_satisfied) return false;
  if (filters.changed_file && !arrayIncludesGlob(record.changed_files, filters.changed_file)) return false;
  if (filters.command_status && !arrayIncludesCommandStatus(recordChecks(record), filters.command_status)) return false;
  if (filters.contains && !JSON.stringify(record).includes(filters.contains)) return false;
  return true;
}

function compactEvidenceItem(index, record, controls) {
  const item: any = {
    index,
  };
  maybeSet(item, "evidence_id", record.evidence_id || null, controls);
  maybeSet(item, "work_id", record.work_id || null, controls);
  maybeSet(item, "type", record.type || null, controls);
  maybeSet(item, "result", record.result || null, controls);
  maybeSet(item, "decision", record.decision || null, controls);
  if (record.completion_satisfied === true || controls.show_empty || controls.include.includes("completion_satisfied")) {
    item.completion_satisfied = record.completion_satisfied === true;
  }
  maybeSet(item, "next_action", record.next_action || null, controls);
  const counts = withoutZeroBuckets({
      changed_files: Array.isArray(record.changed_files) ? record.changed_files.length : 0,
      checks: recordChecks(record).length,
      evidence: Array.isArray(record.evidence) ? record.evidence.length : 0,
      claims: Array.isArray(record.claims) ? record.claims.length : 0,
      blocked_by: Array.isArray(record.blocked_by) ? record.blocked_by.length : 0,
    }, controls);
  maybeSet(item, "counts", counts, controls);
  maybeSet(item, "summary", typeof record.summary === "string" ? record.summary : null, controls);
  return item;
}

function renderEvidenceListText(result) {
  const lines = [
    `goal_id: ${result.goal_id}`,
    `filters: limit=${result.filters.limit} work=${result.filters.work || "all"} type=${result.filters.type || "all"} result=${result.filters.result || "all"}`,
    `evidence_records: total=${result.total} matched=${result.matched} shown=${result.shown}`,
  ];
  for (const item of result.items) {
    lines.push(renderEvidenceLine(item));
  }
  return lines.join("\n");
}

function renderEvidenceLine(item) {
  const parts = [
    `#${item.index}`,
    item.evidence_id || "null",
    item.work_id || "null",
    item.type || "null",
    item.result || "null",
  ];
  if (item.decision) parts.push(`decision=${item.decision}`);
  if (item.completion_satisfied) parts.push("completion=true");
  if (item.next_action) parts.push(`next=${item.next_action}`);
  parts.push(`files=${item.counts?.changed_files || 0}`);
  parts.push(`checks=${item.counts?.checks || 0}`);
  parts.push(`evidence=${item.counts?.evidence || 0}`);
  parts.push(`claims=${item.counts?.claims || 0}`);
  if ((item.counts?.blocked_by || 0) > 0) parts.push(`blocked_by=${item.counts.blocked_by}`);
  if (item.summary) parts.push(`summary="${truncate(item.summary)}"`);
  return parts.join("  ");
}

function renderEvidenceShowText(result) {
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
