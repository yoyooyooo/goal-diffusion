export function receiptChecks(receipt) {
  if (Array.isArray(receipt?.checks)) return receipt.checks;
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

export function hasFinalAuditEvidence(receipt) {
  if (Array.isArray(receipt?.evidence_map) && receipt.evidence_map.length > 0) return true;
  return Array.isArray(receipt?.evidence) && receipt.evidence.length > 0;
}
