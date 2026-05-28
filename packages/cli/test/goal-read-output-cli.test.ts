import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { test } from "bun:test";
import assert from "node:assert/strict";

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const cliScript = join(packageRoot, "src", "goal-proof.ts");

function run(args) {
  return spawnSync(process.execPath, [cliScript, ...args], { encoding: "utf8" });
}

function writePack(root, { goal, progress, evidence = "" }) {
  mkdirSync(join(root, "notes"), { recursive: true });
  writeFileSync(join(root, "goal.yaml"), goal.trimStart());
  writeFileSync(join(root, "progress.yaml"), progress.trimStart());
  writeFileSync(join(root, "evidence.jsonl"), evidence.trimStart());
}

function goal({ id, status, thread = null, objective = "Exercise read output." }) {
  const relations = thread === null ? "" : `
relations:
  thread_id: ${thread}
  links: []
`;
  return `
schema_version: 2
id: ${id}
status: ${status}
objective: "${objective}"
${relations}authority_refs:
  - "README.md"
engineering_guidance:
  standards:
    - "Read output stays bounded and thread-aware."
completion:
  signal: "Summary exposes thread groups without duplicate goal placement."
  required_evidence: "CLI tests pass."
claim_limit: "Only proves read-output CLI behavior."
`;
}

function progress({ id, status, nextAction, active = null, workItems }) {
  const serialized = workItems.flatMap((item) => [
    `  - id: ${item.id}`,
    `    type: ${item.type ?? "implementation"}`,
    `    status: ${item.status}`,
    `    objective: "${item.objective ?? "Exercise read output."}"`,
    `    allowed_scope:`,
    `      - "packages/cli/**"`,
    `    checks:`,
    `      - "bun test packages/cli/test/goal-read-output-cli.test.ts"`,
    `    stop_if:`,
    `      - "Need schema changes."`,
  ]).join("\n");
  return `
schema_version: 2
goal_id: ${id}
status: ${status}
proof_step:
  from: "Flat output"
  target_delta: "Grouped bounded output"
  proof_path:
    - "Run CLI read-output tests"
  checks:
    - "bun test packages/cli/test/goal-read-output-cli.test.ts"
  failure_inspection:
    - "packages/cli/src/"
active_work_item: ${active ?? "null"}
work_items:
${serialized}
blockers: []
last_check:
  result: ${status === "done" ? "pass" : "unknown"}
  checks: []
next_action: ${nextAction}
`;
}

function reviewEvidence(id = "E999") {
  return `${JSON.stringify({
    schema_version: 2,
    evidence_id: id,
    work_id: "W999",
    type: "review",
    result: "done",
    decision: "complete",
    completion_satisfied: true,
    recorded_at: "2026-05-28T00:00:00Z",
    claim_evidence: [{ claim: "completion.required_evidence", evidence: ["done=true"] }],
    summary: "Completion review passed.",
    next_action: "done",
  })}\n`;
}

function makeProject() {
  const project = mkdtempSync(join(tmpdir(), "goal-proof-read-output-"));
  const goals = join(project, "docs", "goal-proof", "goals");
  writePack(join(goals, "fermi-ingest"), {
    goal: goal({ id: "fermi-ingest", status: "done", thread: "fermi-thread", objective: "Import fermi source data." }),
    progress: progress({ id: "fermi-ingest", status: "done", nextAction: "done", workItems: [{ id: "W999", type: "review", status: "done" }] }),
    evidence: reviewEvidence("E901"),
  });
  writePack(join(goals, "fermi-report"), {
    goal: goal({ id: "fermi-report", status: "done", thread: "fermi-thread", objective: "Publish fermi output report." }),
    progress: progress({ id: "fermi-report", status: "done", nextAction: "done", workItems: [{ id: "W999", type: "review", status: "done" }] }),
    evidence: reviewEvidence("E902"),
  });
  writePack(join(goals, "cli-output"), {
    goal: goal({ id: "cli-output", status: "running", thread: "cli-thread", objective: "Implement CLI output controls." }),
    progress: progress({
      id: "cli-output",
      status: "running",
      nextAction: "continue",
      active: "W001",
      workItems: [
        { id: "W001", status: "active", objective: "Implement controls." },
        { id: "W002", type: "review", status: "queued", objective: "Review controls." },
      ],
    }),
  });
  writePack(join(goals, "docs-todo"), {
    goal: goal({ id: "docs-todo", status: "ready", objective: "Document read output controls." }),
    progress: progress({ id: "docs-todo", status: "ready", nextAction: "proof_step", workItems: [{ id: "W001", status: "queued" }] }),
  });
  writePack(join(goals, "unthreaded-done"), {
    goal: goal({ id: "unthreaded-done", status: "done", objective: "Close standalone output goal." }),
    progress: progress({ id: "unthreaded-done", status: "done", nextAction: "done", workItems: [{ id: "W999", type: "review", status: "done" }] }),
    evidence: reviewEvidence("E903"),
  });
  return project;
}

test("summary defaults to bounded thread groups and omits default-noise fields", () => {
  const project = makeProject();
  try {
    const result = run(["summary", project, "--json"]);
    assert.equal(result.status, 0, result.stderr);
    const payload = JSON.parse(result.stdout);
    assert.equal(payload.filters.depth, "groups");
    assert.equal(payload.goals.total, 5);
    assert.equal(payload.goals.done, 3);
    assert.equal(payload.work_items.total, 6);
    assert.deepEqual(payload.threads.map((item) => item.thread_id), ["cli-thread", "fermi-thread"]);
    assert.equal("items" in payload, false);
    assert.equal("goals_root" in payload, false);
    assert.equal("warnings" in payload, false);
    assert.equal("errors" in payload, false);
  } finally {
    rmSync(project, { recursive: true, force: true });
  }
});

test("summary depth items places threaded and unthreaded goals in separate buckets", () => {
  const project = makeProject();
  try {
    const result = run(["summary", project, "--depth", "items", "--json"]);
    assert.equal(result.status, 0, result.stderr);
    const payload = JSON.parse(result.stdout);
    const threadedGoalIds = payload.threads.flatMap((thread) => thread.items.map((item) => item.goal_id));
    const topLevelGoalIds = payload.items.map((item) => item.goal_id);
    assert.deepEqual(threadedGoalIds, ["cli-output", "fermi-ingest", "fermi-report"]);
    assert.deepEqual(topLevelGoalIds, ["docs-todo", "unthreaded-done"]);
    assert.equal(threadedGoalIds.some((id) => topLevelGoalIds.includes(id)), false);
    assert.equal("objective" in payload.items[0], false);
  } finally {
    rmSync(project, { recursive: true, force: true });
  }
});

test("summary filters before aggregation and read controls expand on request", () => {
  const project = makeProject();
  try {
    const todo = run(["summary", project, "--completion", "todo", "--depth", "items", "--json"]);
    assert.equal(todo.status, 0, todo.stderr);
    const todoPayload = JSON.parse(todo.stdout);
    assert.deepEqual(todoPayload.threads.map((item) => item.thread_id), ["cli-thread"]);
    assert.deepEqual(todoPayload.items.map((item) => item.goal_id), ["docs-todo"]);
    assert.equal(todoPayload.goals.total, 2);

    const expanded = run(["summary", project, "--depth", "items", "--include", "path,objective", "--show-empty", "--json"]);
    assert.equal(expanded.status, 0, expanded.stderr);
    const payload = JSON.parse(expanded.stdout);
    assert.equal(Array.isArray(payload.warnings), true);
    assert.equal(typeof payload.goals_root, "string");
    assert.equal(typeof payload.items[0].path, "string");
    assert.equal(payload.items[0].objective, "Document read output controls.");
    assert.equal(payload.goals.by_status.blocked, 0);
  } finally {
    rmSync(project, { recursive: true, force: true });
  }
});

test("read commands share limit/include/show-empty controls", () => {
  const project = makeProject();
  try {
    const list = run(["list", project, "--limit", "1", "--json"]);
    assert.equal(list.status, 0, list.stderr);
    const listPayload = JSON.parse(list.stdout);
    assert.equal(listPayload.items.length, 1);
    assert.equal(listPayload.items_omitted, 4);
    assert.equal("path" in listPayload.items[0], false);

    const workPath = join(project, "docs", "goal-proof", "goals", "cli-output");
    const work = run(["work", "list", workPath, "--json"]);
    assert.equal(work.status, 0, work.stderr);
    assert.equal("objective" in JSON.parse(work.stdout).items[0], false);

    const evidencePath = join(project, "docs", "goal-proof", "goals", "fermi-ingest");
    const evidence = run(["evidence", "list", evidencePath, "--include", "path", "--show-empty", "--json"]);
    assert.equal(evidence.status, 0, evidence.stderr);
    const evidencePayload = JSON.parse(evidence.stdout);
    assert.equal(typeof evidencePayload.path, "string");
    assert.equal(evidencePayload.items[0].counts.claims, 0);
  } finally {
    rmSync(project, { recursive: true, force: true });
  }
});

test("read command help uses shared output-control vocabulary", () => {
  const cases = [
    ["summary", "--help"],
    ["list", "--help"],
    ["work", "list", "--help"],
    ["evidence", "list", "--help"],
    ["relations", "list", "--help"],
    ["relations", "goals", "--help"],
    ["relations", "work", "--help"],
  ];

  for (const args of cases) {
    const result = run(args);
    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, /--limit <number>/, args.join(" "));
    assert.match(result.stdout, /--include <fields>/, args.join(" "));
    assert.match(result.stdout, /--show-empty/, args.join(" "));
    assert.doesNotMatch(result.stdout, /--max|--fields|--verbose|--expand/);
  }
});
