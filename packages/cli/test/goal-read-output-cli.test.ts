import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { test } from "bun:test";
import assert from "node:assert/strict";

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const repoRoot = resolve(packageRoot, "../..");
const cliScript = join(packageRoot, "src", "goal-diffusion.ts");

function writePack(root, { contract, state, receipts = "" }) {
  mkdirSync(join(root, "notes"), { recursive: true });
  writeFileSync(join(root, "charter.yaml"), contract.trimStart());
  writeFileSync(join(root, "state.yaml"), state.trimStart());
  writeFileSync(join(root, "receipts.jsonl"), receipts.trimStart());
}

function run(args) {
  return spawnSync(process.execPath, [cliScript, ...args], { encoding: "utf8" });
}

function contract({ id, status, thread = null, objective = "Exercise read output." }) {
  const relations = thread === null ? "" : `
goal_relations:
  thread_id: ${thread}
  links: []
`;
  return `
id: ${id}
status: ${status}
objective: "${objective}"
${relations}authority_refs:
  - "goal-diffusion/SKILL.md"
engineering_guidance:
  standards:
    - "Read output stays bounded and thread-aware."
completion:
  signal: "Summary exposes thread groups without duplicate goal placement."
  final_proof: "CLI tests pass."
claim_boundary: "Only proves read-output CLI behavior."
`;
}

function state({ id, status, nextDecision, activeTask = null, tasks }) {
  const taskYaml = tasks.flatMap((task) => [
    `  - id: ${task.id}`,
    `    type: ${task.type ?? "worker"}`,
    `    status: ${task.status}`,
    `    objective: "${task.objective ?? "Exercise read output."}"`,
    `    allowed_scope:`,
    `      - "packages/cli/**"`,
    `    verify:`,
    `      - "bun test packages/cli/test/goal-read-output-cli.test.ts"`,
    `    stop_if:`,
    `      - "Need schema changes."`,
  ]).join("\n");
  return `
version: 1
goal_id: ${id}
status: ${status}
current_edge:
  from: "Flat output"
  target_delta: "Grouped bounded output"
  harnessed_path:
    - "Run CLI read-output tests"
  verify:
    - "bun test packages/cli/test/goal-read-output-cli.test.ts"
  failure_inspection:
    - "packages/cli/src/"
active_task: ${activeTask ?? "null"}
tasks:
${taskYaml}
blockers: []
last_verification:
  result: ${status === "done" ? "pass" : "unknown"}
  checks: []
next_decision: ${nextDecision}
`;
}

function auditReceipt(evidence) {
  return `${JSON.stringify({
    task_id: "T999",
    type: "audit",
    result: "done",
    decision: "complete",
    oracle_satisfied: true,
    evidence,
    claims: ["complete"],
    summary: "Audit complete.",
    next_decision: "done",
  })}\n`;
}

function makeProject() {
  const project = mkdtempSync(join(tmpdir(), "goal-read-output-test-"));
  const goals = join(project, "docs", "goal-diffusion", "goals");
  writePack(join(goals, "fermi-ingest"), {
    contract: contract({ id: "fermi-ingest", status: "done", thread: "fermi-thread", objective: "Import fermi source data." }),
    state: state({ id: "fermi-ingest", status: "done", nextDecision: "done", tasks: [{ id: "T999", type: "audit", status: "done" }] }),
    receipts: auditReceipt(["fermi_import_done=true"]),
  });
  writePack(join(goals, "fermi-report"), {
    contract: contract({ id: "fermi-report", status: "done", thread: "fermi-thread", objective: "Publish fermi output report." }),
    state: state({ id: "fermi-report", status: "done", nextDecision: "done", tasks: [{ id: "T999", type: "audit", status: "done" }] }),
    receipts: auditReceipt(["fermi_report_done=true"]),
  });
  writePack(join(goals, "cli-output"), {
    contract: contract({ id: "cli-output", status: "running", thread: "cli-thread", objective: "Implement CLI output controls." }),
    state: state({
      id: "cli-output",
      status: "running",
      nextDecision: "continue",
      activeTask: "T001",
      tasks: [
        { id: "T001", status: "active", objective: "Implement controls." },
        { id: "T002", type: "audit", status: "queued", objective: "Audit controls." },
      ],
    }),
  });
  writePack(join(goals, "docs-todo"), {
    contract: contract({ id: "docs-todo", status: "ready", objective: "Document read output controls." }),
    state: state({ id: "docs-todo", status: "ready", nextDecision: "edge", tasks: [{ id: "T001", status: "queued" }] }),
  });
  writePack(join(goals, "unthreaded-done"), {
    contract: contract({ id: "unthreaded-done", status: "done", objective: "Close standalone output goal." }),
    state: state({ id: "unthreaded-done", status: "done", nextDecision: "done", tasks: [{ id: "T999", type: "audit", status: "done" }] }),
    receipts: auditReceipt(["standalone_done=true"]),
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
    assert.equal(payload.filters.limit, 20);
    assert.equal(payload.goals.total, 5);
    assert.equal(payload.goals.done, 3);
    assert.equal(payload.goals.todo, 2);
    assert.deepEqual(payload.threads.map((item) => item.thread_id), ["cli-thread", "fermi-thread"]);
    assert.equal(payload.threads[0].goals.total, 1);
    assert.equal(payload.threads[1].goals.done, 2);
    assert.equal(payload.unthreaded.goals.total, 2);
    assert.equal("items" in payload, false);
    assert.equal("goals_root" in payload, false);
    assert.equal("warnings" in payload, false);
    assert.equal("errors" in payload, false);
    assert.equal("path" in payload.threads[0], false);
    assert.equal("warnings" in payload.threads[0], false);
    assert.equal("errors" in payload.unthreaded, false);
  } finally {
    rmSync(project, { recursive: true, force: true });
  }
});

test("summary depth items places threaded goals only under threads and unthreaded goals only in top-level items", () => {
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
    assert.equal("path" in payload.items[0], false);
  } finally {
    rmSync(project, { recursive: true, force: true });
  }
});

test("summary applies filters before aggregation so completed threads disappear under todo", () => {
  const project = makeProject();
  try {
    const result = run(["summary", project, "--completion", "todo", "--depth", "items", "--json"]);
    assert.equal(result.status, 0, result.stderr);
    const payload = JSON.parse(result.stdout);
    assert.deepEqual(payload.threads.map((item) => item.thread_id), ["cli-thread"]);
    assert.deepEqual(payload.threads[0].items.map((item) => item.goal_id), ["cli-output"]);
    assert.deepEqual(payload.items.map((item) => item.goal_id), ["docs-todo"]);
    assert.equal(JSON.stringify(payload).includes("fermi-thread"), false);
    assert.equal(payload.goals.total, 2);
    assert.equal(payload.goals.done, 0);
    assert.equal(payload.goals.todo, 2);
  } finally {
    rmSync(project, { recursive: true, force: true });
  }
});

test("summary depth repo and limit expose bounded progressive disclosure", () => {
  const project = makeProject();
  try {
    const repo = run(["summary", project, "--depth", "repo", "--json"]);
    assert.equal(repo.status, 0, repo.stderr);
    const repoPayload = JSON.parse(repo.stdout);
    assert.equal(repoPayload.threads.total, 2);
    assert.equal(repoPayload.threads.goals.total, 3);
    assert.equal(repoPayload.unthreaded.goals.total, 2);
    assert.equal("items" in repoPayload, false);

    const limited = run(["summary", project, "--depth", "items", "--limit", "1", "--json"]);
    assert.equal(limited.status, 0, limited.stderr);
    const limitedPayload = JSON.parse(limited.stdout);
    assert.equal(limitedPayload.threads.length, 1);
    assert.equal(limitedPayload.threads_omitted, 1);
    assert.equal(limitedPayload.threads[0].items.length, 1);
    assert.equal(limitedPayload.items.length, 1);
    assert.equal(limitedPayload.items_omitted, 1);
  } finally {
    rmSync(project, { recursive: true, force: true });
  }
});

test("summary include and show-empty expand omitted default fields explicitly", () => {
  const project = makeProject();
  try {
    const result = run(["summary", project, "--depth", "items", "--include", "path,objective", "--show-empty", "--json"]);
    assert.equal(result.status, 0, result.stderr);
    const payload = JSON.parse(result.stdout);
    assert.equal(Array.isArray(payload.warnings), true);
    assert.equal(Array.isArray(payload.errors), true);
    assert.equal(typeof payload.goals_root, "string");
    assert.equal(typeof payload.items[0].path, "string");
    assert.equal(payload.items[0].objective, "Document read output controls.");
    assert.equal(payload.items_omitted, 0);
    assert.equal(payload.goals.by_status.blocked, 0);
    assert.equal(payload.threads[0].items_omitted, 0);
  } finally {
    rmSync(project, { recursive: true, force: true });
  }
});

test("read commands expose shared output-control vocabulary without command-specific aliases", () => {
  const cases = [
    ["summary", "--help"],
    ["list", "--help"],
    ["tasks", "--help"],
    ["receipts", "list", "--help"],
    ["relations", "list", "--help"],
    ["relations", "goals", "--help"],
    ["relations", "tasks", "--help"],
  ];

  for (const args of cases) {
    const result = run(args);
    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, /--limit <number>/, args.join(" "));
    assert.match(result.stdout, /--include <fields>/, args.join(" "));
    assert.match(result.stdout, /--show-empty/, args.join(" "));
    assert.doesNotMatch(result.stdout, /--max|--fields|--verbose|--expand/);
  }

  const summary = run(["summary", "--help"]);
  assert.match(summary.stdout, /--depth <value>/);
});

test("list tasks receipts and relation reads apply limit/include/show-empty controls", () => {
  const project = makeProject();
  try {
    const list = run(["list", project, "--limit", "1", "--json"]);
    assert.equal(list.status, 0, list.stderr);
    const listPayload = JSON.parse(list.stdout);
    assert.equal(listPayload.items.length, 1);
    assert.equal(listPayload.items_omitted, 4);
    assert.equal("path" in listPayload.items[0], false);

    const tasksPath = join(project, "docs", "goal-diffusion", "goals", "cli-output");
    const tasks = run(["tasks", tasksPath, "--json"]);
    assert.equal(tasks.status, 0, tasks.stderr);
    const tasksPayload = JSON.parse(tasks.stdout);
    assert.equal("objective" in tasksPayload.items[0], false);
    assert.equal("path" in tasksPayload, false);

    const tasksExpanded = run(["tasks", tasksPath, "--limit", "1", "--include", "path,objective", "--show-empty", "--json"]);
    assert.equal(tasksExpanded.status, 0, tasksExpanded.stderr);
    const tasksExpandedPayload = JSON.parse(tasksExpanded.stdout);
    assert.equal(tasksExpandedPayload.items.length, 1);
    assert.equal(tasksExpandedPayload.items_omitted, 1);
    assert.equal(typeof tasksExpandedPayload.path, "string");
    assert.equal(tasksExpandedPayload.items[0].objective, "Implement controls.");
    assert.deepEqual(tasksExpandedPayload.items[0].allowed_scope, ["packages/cli/**"]);

    const receiptsPath = join(project, "docs", "goal-diffusion", "goals", "fermi-ingest");
    const receipts = run(["receipts", "list", receiptsPath, "--include", "path", "--show-empty", "--json"]);
    assert.equal(receipts.status, 0, receipts.stderr);
    const receiptsPayload = JSON.parse(receipts.stdout);
    assert.equal(typeof receiptsPayload.path, "string");
    assert.equal(receiptsPayload.items[0].counts.checks, 0);

    const goals = run(["relations", "goals", project, "--thread", "fermi-thread", "--limit", "1", "--json"]);
    assert.equal(goals.status, 0, goals.stderr);
    const goalsPayload = JSON.parse(goals.stdout);
    assert.equal(goalsPayload.items.length, 1);
    assert.equal(goalsPayload.items_omitted, 1);
    assert.equal("goals_root" in goalsPayload, false);
    assert.equal("links" in goalsPayload.items[0], false);
    assert.equal("path" in goalsPayload.items[0], false);
  } finally {
    rmSync(project, { recursive: true, force: true });
  }
});

test("read-output control protocol is documented in root package and skill docs", () => {
  const docs = [
    readFileSync(join(repoRoot, "README.md"), "utf8"),
    readFileSync(join(repoRoot, "README.zh-CN.md"), "utf8"),
    readFileSync(join(packageRoot, "README.md"), "utf8"),
    readFileSync(join(packageRoot, "README.zh-CN.md"), "utf8"),
    readFileSync(join(repoRoot, "skills/goal-diffusion/SKILL.md"), "utf8"),
    readFileSync(join(repoRoot, "CHANGELOG.md"), "utf8"),
  ].join("\n");

  assert.match(docs, /--depth repo\|groups\|items/);
  assert.match(docs, /--include path,objective,links/);
  assert.match(docs, /--show-empty/);
  assert.match(docs, /--limit 20/);
  assert.match(docs, /threaded goals|threaded goal items|threaded goals 放在/);
});
