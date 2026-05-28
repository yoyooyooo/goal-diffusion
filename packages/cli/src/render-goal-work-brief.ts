import { renderWorkBrief } from "./lib/goal-pack.ts";

export function runWorkBrief(goalRoot, { workId = null, json = false } = {}) {
  const brief = renderWorkBrief(goalRoot, { workId });
  if (json) return JSON.stringify(brief, null, 2);
  return renderWorkBriefText(brief);
}

export function renderWorkBriefText(brief) {
  const lines = [];
  lines.push("# Goal Pack Work Brief");
  lines.push("");
  lines.push(`Goal: ${brief.goal_id}`);
  lines.push(`Status: ${brief.status}`);
  for (const warning of brief.warnings) lines.push(`Warning: ${warning}`);
  lines.push("");
  lines.push("## Protected Fields");
  lines.push(`objective: ${brief.goal_fields.objective}`);
  lines.push(`authority_refs: ${formatList(brief.goal_fields.authority_refs)}`);
  lines.push(`engineering_guidance.standards: ${formatList(brief.goal_fields.engineering_guidance.standards)}`);
  lines.push(`engineering_guidance.architecture_notes: ${formatList(brief.goal_fields.engineering_guidance.architecture_notes)}`);
  lines.push(`completion.signal: ${brief.goal_fields.completion.signal}`);
  lines.push(`completion.required_evidence: ${brief.goal_fields.completion.required_evidence}`);
  lines.push(`claim_limit: ${brief.goal_fields.claim_limit}`);
  lines.push(`stop_rules: ${formatList(brief.goal_fields.stop_rules)}`);
  lines.push("");
  lines.push("## Proof Step");
  lines.push(`from: ${brief.proof_step.from}`);
  lines.push(`target_delta: ${brief.proof_step.target_delta}`);
  lines.push(`proof_path: ${formatList(brief.proof_step.proof_path)}`);
  lines.push(`checks: ${formatList(brief.proof_step.checks)}`);
  lines.push(`failure_inspection: ${formatList(brief.proof_step.failure_inspection)}`);
  lines.push("");
  lines.push(`## Work Item: ${brief.work_item.id}`);
  lines.push(`type: ${brief.work_item.type}`);
  lines.push(`status: ${brief.work_item.status}`);
  lines.push(`objective: ${brief.work_item.objective}`);
  if (brief.work_item.plan) lines.push(`plan: ${brief.work_item.plan}`);
  lines.push(`allowed_scope: ${formatList(brief.work_item.allowed_scope)}`);
  lines.push(`checks: ${formatList(brief.work_item.checks)}`);
  lines.push(`stop_if: ${formatList(brief.work_item.stop_if)}`);
  lines.push("");
  lines.push("## Stop Rules");
  for (const rule of brief.stop_rules) lines.push(`- ${rule}`);
  lines.push("");
  lines.push("## Evidence JSON");
  lines.push("```json");
  lines.push(JSON.stringify(brief.evidence_schema, null, 2));
  lines.push("```");
  return lines.join("\n");
}

function formatList(values) {
  if (!values || values.length === 0) return "[]";
  return values.map((value) => `\n- ${value}`).join("");
}
