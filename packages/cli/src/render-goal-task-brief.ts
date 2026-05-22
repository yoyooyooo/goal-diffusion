import { renderPrompt } from "./lib/goal-pack.ts";

export function runBrief(goalRoot, { taskId = null, json = false } = {}) {
  const brief = renderPrompt(goalRoot, { taskId });
  if (json) return JSON.stringify(brief, null, 2);
  return renderBriefText(brief);
}

export function renderBriefText(brief) {
  const lines = [];
  lines.push(`# Goal Pack Task Brief`);
  lines.push("");
  lines.push(`Goal: ${brief.goal_id}`);
  lines.push(`Status: ${brief.status}`);
  for (const warning of brief.warnings) lines.push(`Warning: ${warning}`);
  lines.push("");
  lines.push("## Protected Fields");
  lines.push(`objective: ${brief.protected_fields.objective}`);
  lines.push(`authority_refs: ${formatList(brief.protected_fields.authority_refs)}`);
  lines.push(`architecture_standard: ${formatList(brief.protected_fields.architecture_standard)}`);
  lines.push(`completion_oracle.signal: ${brief.protected_fields.completion_oracle.signal}`);
  lines.push(`completion_oracle.final_proof: ${brief.protected_fields.completion_oracle.final_proof}`);
  lines.push(`claim_boundary: ${brief.protected_fields.claim_boundary}`);
  lines.push(`stop_rules: ${formatList(brief.protected_fields.stop_rules)}`);
  lines.push("");
  lines.push("## Current Edge");
  lines.push(`from: ${brief.current_edge.from}`);
  lines.push(`target_delta: ${brief.current_edge.target_delta}`);
  lines.push(`harnessed_path: ${formatList(brief.current_edge.harnessed_path)}`);
  lines.push(`verify: ${formatList(brief.current_edge.verify)}`);
  lines.push(`failure_inspection: ${formatList(brief.current_edge.failure_inspection)}`);
  lines.push("");
  lines.push(`## Task: ${brief.task.id}`);
  lines.push(`type: ${brief.task.type}`);
  lines.push(`status: ${brief.task.status}`);
  lines.push(`objective: ${brief.task.objective}`);
  lines.push(`allowed_scope: ${formatList(brief.task.allowed_scope)}`);
  lines.push(`verify: ${formatList(brief.task.verify)}`);
  lines.push(`stop_if: ${formatList(brief.task.stop_if)}`);
  lines.push("");
  lines.push("## Stop Rules");
  for (const rule of brief.stop_rules) lines.push(`- ${rule}`);
  lines.push("");
  lines.push("## Receipt JSON");
  lines.push("```json");
  lines.push(JSON.stringify(brief.receipt_schema, null, 2));
  lines.push("```");
  return lines.join("\n");
}

function formatList(values) {
  if (!values || values.length === 0) return "[]";
  return values.map((value) => `\n- ${value}`).join("");
}
