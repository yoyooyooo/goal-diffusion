import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { test } from "bun:test";
import assert from "node:assert/strict";

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const cliScript = join(packageRoot, "src", "goal-proof.ts");

function makePack({ goal = goalYaml(), progress = progressYaml(), evidence = "" } = {}) {
  const root = mkdtempSync(join(tmpdir(), "goal-proof-check-"));
  mkdirSync(join(root, "notes"), { recursive: true });
  writeFileSync(join(root, "goal.yaml"), goal.trimStart());
  writeFileSync(join(root, "progress.yaml"), progress.trimStart());
  writeFileSync(join(root, "evidence.jsonl"), evidence.trimStart());
  return root;
}

function runChecker(root) {
  const result = spawnSync(process.execPath, [cliScript, "check", root], { encoding: "utf8" });
  return {
    status: result.status,
    stdout: JSON.parse(result.stdout),
    stderr: result.stderr,
  };
}

function goalYaml({ id = "cli-checker-goal", status = "running" } = {}) {
  return `
schema_version: 2
id: ${id}
status: ${status}
objective: "Exercise the Goal Pack checker."
guiding_principle: "Progress is evidence-backed."
authority_refs:
  - "skills/goal/goal-proof-system/SKILL.md"
engineering_guidance:
  standards:
    - "Goal Proof v2 schema."
completion:
  signal: "Checker validates Goal Pack progress and evidence."
  required_evidence: "Checker passes and completion review maps evidence to completion."
claim_limit: "Only claims local checker behavior."
stop_rules:
  - "Stop on schema mismatch."
agent_authority:
  continue_by_default: true
  requires_human_decision:
    - objective
    - completion
    - claim_limit
  agent_may_revise:
    - proof_step
    - work_items
evidence_mode: normal
`;
}

function progressYaml({ id = "cli-checker-goal", status = "running", active = "W001", workStatus = "active", nextAction = "continue", workType = "implementation" } = {}) {
  return `
schema_version: 2
goal_id: ${id}
status: ${status}
proof_step:
  from: "Checker fixture"
  target_delta: "Valid Goal Pack"
  proof_path:
    - "Run checker"
  checks:
    - "bun test packages/cli/test/check-goal-pack.test.ts"
  failure_inspection:
    - "packages/cli/src/"
active_work_item: ${active ?? "null"}
work_items:
  - id: W001
    type: ${workType}
    status: ${workStatus}
    objective: "Validate a scoped work item."
    allowed_scope:
      - "packages/cli/**"
    checks:
      - "bun test packages/cli/test/check-goal-pack.test.ts"
    stop_if:
      - "Need authority change."
blockers: []
last_check:
  result: unknown
  checks: []
next_action: ${nextAction}
`;
}

test("accepts a running Goal Proof v2 pack with one active scoped implementation", () => {
  const root = makePack();
  try {
    const result = runChecker(root);
    assert.equal(result.status, 0, result.stderr || JSON.stringify(result.stdout));
    assert.equal(result.stdout.ok, true);
    assert.equal(result.stdout.active_work_item, "W001");
    assert.equal(result.stdout.work_item_count, 1);
    assert.equal(result.stdout.evidence_count, 0);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("rejects active implementation work without checks and stop_if", () => {
  const progress = `
schema_version: 2
goal_id: cli-checker-goal
status: running
proof_step:
  from: "Checker fixture"
  target_delta: "Invalid Goal Pack"
  proof_path:
    - "Run checker"
  checks:
    - "bun test packages/cli/test/check-goal-pack.test.ts"
  failure_inspection:
    - "packages/cli/src/"
active_work_item: W001
work_items:
  - id: W001
    type: implementation
    status: active
    objective: "Rewrite the controller."
    allowed_scope:
      - "packages/cli/**"
blockers: []
last_check:
  result: unknown
  checks: []
next_action: continue
`;
  const root = makePack({ progress });
  try {
    const result = runChecker(root);
    assert.equal(result.status, 1);
    assert.match(result.stdout.errors.join("\n"), /active implementation W001 missing checks/i);
    assert.match(result.stdout.errors.join("\n"), /active implementation W001 missing stop_if/i);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("warns when queued planning work disagrees with next_action", () => {
  const progress = `
schema_version: 2
goal_id: cli-checker-goal
status: ready
proof_step:
  from: "Queued planning work"
  target_delta: "Planning decision is explicit"
  proof_path:
    - "Run checker"
  checks:
    - "Review work plan"
  failure_inspection:
    - "plans/W001.md"
active_work_item: null
work_items:
  - id: W001
    type: planning
    status: queued
    objective: "Plan a high-risk slice."
    plan: plans/W001.md
    allowed_scope:
      - "plans/W001.md"
    checks:
      - "Review work plan"
    stop_if:
      - "Plan needs protected goal changes."
blockers: []
last_check:
  result: unknown
  checks: []
next_action: continue
`;
  const root = makePack({ goal: goalYaml({ status: "ready" }), progress });
  try {
    const result = runChecker(root);
    assert.equal(result.status, 0, result.stderr || JSON.stringify(result.stdout));
    assert.match(result.stdout.warnings.join("\n"), /first queued work item W001 is planning/);
    assert.match(result.stdout.warnings.join("\n"), /consider next_action: needs_plan/);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("rejects invalid implementation evidence records", () => {
  const evidence = `${JSON.stringify({
    schema_version: 2,
    evidence_id: "E001",
    work_id: "W001",
    type: "implementation",
    result: "done",
    recorded_at: "2026-05-28T00:00:00Z",
    changed_files: ["outside.txt"],
    checks: [{ kind: "command", cmd: "bun test", status: "fail" }],
    evidence: ["test"],
    claims: ["claim"],
    summary: "done",
    next_action: "continue",
  })}\n`;
  const root = makePack({ evidence });
  try {
    const result = runChecker(root);
    assert.equal(result.status, 1);
    assert.match(result.stdout.errors.join("\n"), /changed file outside allowed_scope: outside\.txt/i);
    assert.match(result.stdout.errors.join("\n"), /done implementation check did not pass/i);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("accepts done packs only with completion review evidence", () => {
  const progress = `
schema_version: 2
goal_id: cli-checker-goal
status: done
proof_step:
  from: "Review pending"
  target_delta: "Completion reviewed"
  proof_path:
    - "Run checker"
  checks:
    - "bun test packages/cli/test/check-goal-pack.test.ts"
  failure_inspection:
    - "packages/cli/src/"
active_work_item: null
work_items:
  - id: W999
    type: review
    status: done
    objective: "Completion review."
blockers: []
last_check:
  result: pass
  checks:
    - "bun test packages/cli/test/check-goal-pack.test.ts"
next_action: done
`;
  const evidence = `${JSON.stringify({
    schema_version: 2,
    evidence_id: "E999",
    work_id: "W999",
    type: "review",
    result: "done",
    decision: "complete",
    completion_satisfied: true,
    recorded_at: "2026-05-28T00:00:00Z",
    claim_evidence: [{ claim: "completion.required_evidence", evidence: ["checker_passed=true"] }],
    not_claimed: [],
    remaining_gaps: [],
    summary: "Completion review passed.",
    next_action: "done",
  })}\n`;
  const root = makePack({ goal: goalYaml({ status: "done" }), progress, evidence });
  try {
    const result = runChecker(root);
    assert.equal(result.status, 0, result.stderr || JSON.stringify(result.stdout));
    assert.equal(result.stdout.ok, true);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
