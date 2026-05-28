export function recordChecks(record) {
  if (Array.isArray(record?.checks)) return record.checks;
  return [];
}

export function allChecksPass(checks) {
  if (!Array.isArray(checks) || checks.length === 0) return false;
  return checks.every((check) => check && check.status === "pass");
}

export function checkLines(checks) {
  if (!Array.isArray(checks)) return [];
  return checks.map((check) => {
    if (typeof check === "string") return check;
    if (!check || !check.cmd) return null;
    return `${check.cmd} [${check.status || "unknown"}]`;
  }).filter(Boolean);
}

export function hasCompletionReviewEvidence(record) {
  if (Array.isArray(record?.claim_evidence) && record.claim_evidence.length > 0) return true;
  return Array.isArray(record?.evidence) && record.evidence.length > 0;
}
