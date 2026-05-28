import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { test } from "bun:test";
import assert from "node:assert/strict";

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const repoRoot = resolve(packageRoot, "../..");
const cliScript = join(packageRoot, "src", "goal-proof.ts");

function makePack({ goal = goalYaml(), progress = progressYaml(), evidence = "" } = {}) {
  const root = mkdtempSync(join(tmpdir(), "goal-proof-cli-"));
  return writePack(root, { goal, progress, evidence });
}

function makeProjectPack(goalId = "cli-test-goal", options = {}) {
  const project = mkdtempSync(join(tmpdir(), "goal-proof-project-"));
  const root = join(project, "docs", "goal-proof", "goals", goalId);
  writePack(root, options);
  return { project, root };
}

function writePack(root, { goal = goalYaml(), progress = progressYaml(), evidence = "" } = {}) {
  mkdirSync(join(root, "notes"), { recursive: true });
  mkdirSync(join(root, "plans"), { recursive: true });
  writeFileSync(join(root, "goal.yaml"), goal.trimStart());
  writeFileSync(join(root, "progress.yaml"), progress.trimStart());
  writeFileSync(join(root, "evidence.jsonl"), evidence.trimStart());
  return root;
}

function run(args, options: { cwd?: string; input?: string } = {}) {
  return spawnSync(process.execPath, [cliScript, ...args], { encoding: "utf8", cwd: options.cwd, input: options.input });
}

function goalYaml({ id = "cli-test-goal", status = "running", thread = null, links = "" } = {}) {
  const relations = thread === null ? "" : `
relations:
  thread_id: ${thread}
  links:
${links || "    []"}
`;
  return `
schema_version: 2
id: ${id}
status: ${status}
objective: "Exercise the Goal Proof command surface."
guiding_principle: "Progress is evidence-backed."
${relations}authority_refs:
  - "skills/goal/goal-proof-system/SKILL.md"
engineering_guidance:
  standards:
    - "Command scripts mutate only evidence and deterministic progress."
completion:
  signal: "CLI can inspect, brief, activate, add evidence, apply progress, and check packs."
  required_evidence: "Bun tests pass."
claim_limit: "Only proves local CLI behavior."
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

function progressYaml({ id = "cli-test-goal", status = "running", active = "W001", workStatus = "active", nextAction = "continue", includeReview = true } = {}) {
  return `
schema_version: 2
goal_id: ${id}
status: ${status}
proof_step:
  from: "No command surface"
  target_delta: "Agent-readable command surface"
  proof_path:
    - "Run CLI tests"
  checks:
    - "bun test packages/cli/test/goal-pack-cli.test.ts"
  failure_inspection:
    - "packages/cli/src/"
active_work_item: ${active ?? "null"}
work_items:
  - id: W001
    type: implementation
    status: ${workStatus}
    objective: "Implement command scripts."
    allowed_scope:
      - "packages/cli/**"
    checks:
      - "bun test packages/cli/test/goal-pack-cli.test.ts"
    stop_if:
      - "Need package manager changes."
${includeReview ? `  - id: W002
    type: review
    status: queued
    objective: "Review command scripts."
` : ""}
blockers: []
last_check:
  result: unknown
  checks: []
next_action: ${nextAction}
`;
}

function doneProgressYaml(id = "cli-done-goal") {
  return `
schema_version: 2
goal_id: ${id}
status: done
proof_step:
  from: "Summary missing"
  target_delta: "Summary available"
  proof_path:
    - "Run CLI summary tests"
  checks:
    - "bun test packages/cli/test/goal-pack-cli.test.ts"
  failure_inspection:
    - "packages/cli/src/summarize-goal-packs.ts"
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
    - "bun test packages/cli/test/goal-pack-cli.test.ts"
next_action: done
`;
}

function implementationEvidence({ evidenceId = "E001", workId = "W001", nextAction = "continue", changedFiles = ["packages/cli/src/goal-proof.ts"] } = {}) {
  return {
    schema_version: 2,
    evidence_id: evidenceId,
    work_id: workId,
    type: "implementation",
    result: "done",
    recorded_at: "2026-05-28T00:00:00Z",
    changed_files: changedFiles,
    checks: [{ kind: "command", cmd: "bun test packages/cli/test/goal-pack-cli.test.ts", status: "pass" }],
    evidence: ["compact_evidence_list=true"],
    claims: ["implementation evidence recorded"],
    not_claimed: [],
    summary: "Implementation evidence recorded.",
    next_action: nextAction,
  };
}

function reviewEvidence({ evidenceId = "E999", workId = "W999" } = {}) {
  return {
    schema_version: 2,
    evidence_id: evidenceId,
    work_id: workId,
    type: "review",
    result: "done",
    decision: "complete",
    completion_satisfied: true,
    recorded_at: "2026-05-28T00:00:00Z",
    claim_evidence: [{ claim: "completion.required_evidence", evidence: ["tests_passed=true"] }],
    not_claimed: [],
    remaining_gaps: [],
    summary: "Completion review passed.",
    next_action: "done",
  };
}

function jsonl(records) {
  return `${records.map((record) => JSON.stringify(record)).join("\n")}\n`;
}

test("inspect and check read Goal Proof v2 artifacts", () => {
  const root = makePack({ evidence: jsonl([{ ...implementationEvidence(), evidence_id: "E000", work_id: "W001" }]) });
  try {
    const result = run(["inspect", root, "--json"]);
    assert.equal(result.status, 0, result.stderr);
    const payload = JSON.parse(result.stdout);
    assert.equal(payload.goal_id, "cli-test-goal");
    assert.equal(payload.status, "running");
    assert.equal(payload.active_work_item.id, "W001");
    assert.equal(payload.work_item_count, 2);
    assert.equal(payload.evidence_count, 1);
    assert.equal(payload.last_evidence_record.evidence_id, "E000");
    assert.equal(payload.can_continue, true);

    const check = run(["check", root]);
    assert.equal(check.status, 0, check.stderr);
    assert.equal(JSON.parse(check.stdout).ok, true);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("commands resolve bare goal id under docs/goal-proof/goals", () => {
  const { project } = makeProjectPack();
  const nested = join(project, "apps", "web", "src");
  mkdirSync(nested, { recursive: true });
  try {
    const inspect = run(["inspect", "cli-test-goal", "--json"], { cwd: nested });
    assert.equal(inspect.status, 0, inspect.stderr);
    assert.equal(JSON.parse(inspect.stdout).goal_id, "cli-test-goal");
  } finally {
    rmSync(project, { recursive: true, force: true });
  }
});

test("summary and list count goals, work items, and evidence", () => {
  const { project } = makeProjectPack("cli-active-goal");
  const doneRoot = join(project, "docs", "goal-proof", "goals", "cli-done-goal");
  writePack(doneRoot, {
    goal: goalYaml({ id: "cli-done-goal", status: "done" }),
    progress: doneProgressYaml("cli-done-goal"),
    evidence: jsonl([reviewEvidence()]),
  });

  try {
    const summary = run(["summary", project, "--depth", "items", "--json"]);
    assert.equal(summary.status, 0, summary.stderr);
    const payload = JSON.parse(summary.stdout);
    assert.equal(payload.goals.total, 2);
    assert.equal(payload.goals.done, 1);
    assert.equal(payload.work_items.total, 3);
    assert.equal(payload.work_items.done, 1);
    assert.equal(payload.evidence_count, 1);

    const list = run(["list", project, "--completion", "done", "--json"]);
    assert.equal(list.status, 0, list.stderr);
    assert.equal(JSON.parse(list.stdout).items[0].goal_id, "cli-done-goal");

    const text = run(["summary", join(project, "docs", "goal-proof", "goals")]);
    assert.match(text.stdout, /work_items: total=3 done=1 todo=2/);
  } finally {
    rmSync(project, { recursive: true, force: true });
  }
});

test("work list, work brief, and work activate use work item vocabulary", () => {
  const root = makePack();
  try {
    const list = run(["work", "list", root]);
    assert.equal(list.status, 0, list.stderr);
    assert.match(list.stdout, /work_items: 2/);
    assert.match(list.stdout, /W001\s+active\s+implementation\s+Implement command scripts\./);

    const brief = run(["work", "brief", root, "--work", "W001"]);
    assert.equal(brief.status, 0, brief.stderr);
    assert.match(brief.stdout, /Goal Pack Work Brief/);
    assert.match(brief.stdout, /Proof Step/);
    assert.match(brief.stdout, /Evidence JSON/);

    const readyRoot = makePack({
      goal: goalYaml({ status: "ready" }),
      progress: progressYaml({ status: "ready", active: null, workStatus: "queued" }),
    });
    const activated = run(["work", "activate", readyRoot, "--work", "W001"]);
    assert.equal(activated.status, 0, activated.stderr);
    const payload = JSON.parse(activated.stdout);
    assert.equal(payload.active_work_item, "W001");
    assert.equal(payload.next_action, "continue");
    assert.match(readFileSync(join(readyRoot, "progress.yaml"), "utf8"), /active_work_item: W001/);
    rmSync(readyRoot, { recursive: true, force: true });
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("evidence list/show/add and apply update progress", () => {
  const evidence = jsonl([
    { ...implementationEvidence(), evidence_id: "E001", evidence: ["DO_NOT_DUMP_FULL_EVIDENCE", "compact evidence list"] },
    {
      schema_version: 2,
      evidence_id: "E002",
      work_id: "W001",
      type: "implementation",
      result: "blocked",
      recorded_at: "2026-05-28T00:00:00Z",
      checks: [{ kind: "command", cmd: "bun test", status: "fail" }],
      blocked_by: ["filter failure"],
      evidence: ["failed command"],
      summary: "Blocked on filter failure.",
      next_action: "blocked",
    },
  ]);
  const root = makePack({ evidence });
  try {
    const list = run(["evidence", "list", root]);
    assert.equal(list.status, 0, list.stderr);
    assert.match(list.stdout, /evidence_records: total=2 matched=2 shown=2/);
    assert.match(list.stdout, /#1\s+E001\s+W001\s+implementation\s+done/);
    assert.doesNotMatch(list.stdout, /DO_NOT_DUMP_FULL_EVIDENCE/);

    const filtered = run(["evidence", "list", root, "--work", "W001", "--type", "implementation", "--command-status", "pass", "--json"]);
    assert.equal(filtered.status, 0, filtered.stderr);
    assert.equal(JSON.parse(filtered.stdout).matched, 1);

    const show = run(["evidence", "show", root, "--index", "1", "--json"]);
    assert.equal(show.status, 0, show.stderr);
    assert.equal(JSON.parse(show.stdout).evidence_record.evidence_id, "E001");

    const addRoot = makePack();
    const record = implementationEvidence({ evidenceId: "E003", nextAction: "review" });
    const add = run(["evidence", "add", addRoot, "--stdin", "--apply", "--check"], { input: JSON.stringify(record) });
    assert.equal(add.status, 0, add.stderr);
    const payload = JSON.parse(add.stdout);
    assert.equal(payload.evidence_id, "E003");
    assert.equal(payload.applied.active_work_item, "W002");
    assert.equal(payload.applied.next_action, "review");
    assert.match(readFileSync(join(addRoot, "progress.yaml"), "utf8"), /id: W001[\s\S]*?status: done/);
    assert.match(readFileSync(join(addRoot, "progress.yaml"), "utf8"), /id: W002[\s\S]*?status: active/);
    rmSync(addRoot, { recursive: true, force: true });
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("main CLI exposes the Goal Proof command surface without old aliases", () => {
  const root = makePack();
  try {
    const help = run(["--help"]);
    assert.equal(help.status, 0, help.stderr);
    assert.match(help.stdout, /Usage: goal-proof \[options\] \[command\]/);
    assert.match(help.stdout, /work\s+List, brief, and activate work items/);
    assert.match(help.stdout, /evidence\s+Inspect and append evidence records/);
    assert.match(help.stdout, /apply \[options\] <goal-pack>/);
    assert.doesNotMatch(help.stdout, /receipts/);
    assert.doesNotMatch(help.stdout, /tasks/);
    assert.doesNotMatch(help.stdout, /^\s+record\b/m);
    assert.doesNotMatch(help.stdout, /advance/);
    assert.doesNotMatch(help.stdout, /dispatch/);

    const oldBrief = run(["brief", root, "--work", "W001"]);
    assert.notEqual(oldBrief.status, 0);
    const oldRecord = run(["record", root, "--stdin"], { input: "{}" });
    assert.notEqual(oldRecord.status, 0);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("help is structured at every official command layer", () => {
  const helpCases = [
    { args: ["summary", "--help"], patterns: [/Usage: goal-proof summary \[options\] \[target\]/, /--completion <value>/, /--json/] },
    { args: ["list", "--help"], patterns: [/Usage: goal-proof list \[options\] \[target\]/, /--completion <value>/, /--json/] },
    { args: ["work", "--help"], patterns: [/Usage: goal-proof work \[options\] \[command\]/, /list/, /brief/, /activate/] },
    { args: ["work", "list", "--help"], patterns: [/Usage: goal-proof work list \[options\] <goal-pack>/, /--completion <value>/, /--status <value>/] },
    { args: ["work", "brief", "--help"], patterns: [/Usage: goal-proof work brief \[options\] <goal-pack>/, /--work <id>/, /--json/] },
    { args: ["work", "activate", "--help"], patterns: [/Usage: goal-proof work activate \[options\] <goal-pack>/, /--work <id>/, /--dry-run/] },
    { args: ["evidence", "--help"], patterns: [/Usage: goal-proof evidence \[options\] \[command\]/, /list/, /show/, /add/] },
    { args: ["evidence", "list", "--help"], patterns: [/Usage: goal-proof evidence list \[options\] <goal-pack>/, /--work <id>/, /--next-action <value>/, /--completion-satisfied <value>/] },
    { args: ["evidence", "show", "--help"], patterns: [/Usage: goal-proof evidence show \[options\] <goal-pack>/, /--index <number>/] },
    { args: ["evidence", "add", "--help"], patterns: [/Usage: goal-proof evidence add \[options\] <goal-pack>/, /--stdin/, /--apply/, /--check/] },
    { args: ["relations", "work", "--help"], patterns: [/Usage: goal-proof relations work \[options\] \[target\]/, /--goal-status <value>/] },
    { args: ["apply", "--help"], patterns: [/Usage: goal-proof apply \[options\] <goal-pack>/, /--dry-run/] },
    { args: ["check", "--help"], patterns: [/Usage: goal-proof check \[options\] <goal-pack>/] },
  ];

  for (const item of helpCases) {
    const result = run(item.args);
    assert.equal(result.status, 0, `${item.args.join(" ")}\n${result.stderr}`);
    for (const pattern of item.patterns) assert.match(result.stdout, pattern, item.args.join(" "));
  }
});

test("relations command family is documented in root, package, and skill docs", () => {
  const docs = [
    readFileSync(join(repoRoot, "README.md"), "utf8"),
    readFileSync(join(repoRoot, "README.zh-CN.md"), "utf8"),
    readFileSync(join(packageRoot, "README.md"), "utf8"),
    readFileSync(join(packageRoot, "README.zh-CN.md"), "utf8"),
    readFileSync(join(repoRoot, "skills/goal/goal-proof-system/SKILL.md"), "utf8"),
  ].join("\n");

  assert.match(docs, /goal-proof relations list/);
  assert.match(docs, /goal-proof relations goals/);
  assert.match(docs, /goal-proof relations work/);
  assert.match(docs, /goal-proof relations check/);
  assert.match(docs, /goal-proof relations graph/);
  assert.match(docs, /relations\.thread_id/);
});
