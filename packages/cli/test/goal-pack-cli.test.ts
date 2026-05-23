import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { test } from "bun:test";
import assert from "node:assert/strict";

const cliScript = resolve("src/goal-diffusion.ts");

function makePack({ contract = contractYaml, state = stateYaml, receipts = "" } = {}) {
  const root = mkdtempSync(join(tmpdir(), "goal-pack-cli-test-"));
  return writePack(root, { contract, state, receipts });
}

function makeProjectPack(goalId = "cli-test-goal", options = {}) {
  const project = mkdtempSync(join(tmpdir(), "goal-pack-project-test-"));
  const root = join(project, "docs", "goal-diffusion", "goals", goalId);
  writePack(root, options);
  return { project, root };
}

function writePack(root, { contract = contractYaml, state = stateYaml, receipts = "" } = {}) {
  mkdirSync(join(root, "notes"), { recursive: true });
  writeFileSync(join(root, "contract.yaml"), contract.trimStart());
  writeFileSync(join(root, "state.yaml"), state.trimStart());
  writeFileSync(join(root, "receipts.jsonl"), receipts.trimStart());
  return root;
}

function run(script, args, options: { cwd?: string } = {}) {
  return spawnSync(process.execPath, [script, ...args], { encoding: "utf8", cwd: options.cwd });
}

function readReceipts(root) {
  return readFileSync(join(root, "receipts.jsonl"), "utf8").trim().split(/\r?\n/).filter(Boolean);
}

const contractYaml = `
id: cli-test-goal
status: running
objective: "Exercise the Goal Pack command surface."
authority_refs:
  - "goal-diffusion/SKILL.md"
architecture_standard:
  - "Command scripts mutate only receipts and deterministic state."
completion_oracle:
  signal: "CLI can inspect, brief, dispatch, activate, record receipts, advance state, and check packs."
  final_proof: "Node tests pass."
claim_boundary: "Only proves local script behavior."
`;

const stateYaml = `
version: 1
goal_id: cli-test-goal
status: running
current_edge:
  from: "No command surface"
  target_delta: "Agent-readable command surface"
  harnessed_path:
    - "Run CLI tests"
  verify:
    - "bun test packages/cli/test/goal-pack-cli.test.ts"
  failure_inspection:
    - "packages/cli/src/"
active_task: T001
tasks:
  - id: T001
    type: worker
    status: active
    objective: "Implement command scripts."
    allowed_scope:
      - "packages/cli/**"
    verify:
      - "bun test packages/cli/test/goal-pack-cli.test.ts"
    stop_if:
      - "Need package manager changes."
  - id: T002
    type: audit
    status: queued
    objective: "Audit command scripts."
blockers: []
last_verification:
  result: unknown
  commands: []
next_decision: continue
`;

const doneSummaryContractYaml = `
id: cli-done-goal
status: done
objective: "Exercise completed Goal Pack summary."
authority_refs:
  - "goal-diffusion/SKILL.md"
architecture_standard:
  - "Command scripts summarize deterministic state."
completion_oracle:
  signal: "Summary counts completed packs."
  final_proof: "Node tests pass."
claim_boundary: "Only proves summary command behavior."
`;

const doneSummaryStateYaml = `
version: 1
goal_id: cli-done-goal
status: done
current_edge:
  from: "Summary missing"
  target_delta: "Summary available"
  harnessed_path:
    - "Run CLI summary tests"
  verify:
    - "bun test packages/cli/test/goal-pack-cli.test.ts"
  failure_inspection:
    - "packages/cli/src/summarize-goal-packs.ts"
active_task: null
tasks:
  - id: T999
    type: audit
    status: done
    objective: "Audit summary command."
blockers: []
last_verification:
  result: pass
  commands:
    - "bun test packages/cli/test/goal-pack-cli.test.ts"
next_decision: done
`;

const blockScalarContractYaml = `
id: block-scalar-goal
status: running
objective: >
  Build source connection UI
  from a real Goal Pack.
authority_refs:
  - "docs/authority.md"
architecture_standard:
  - "Stay bounded."
completion_oracle:
  signal:
    - "Route opens"
    - "List renders"
  final_proof:
    - "Checks pass"
claim_boundary: >
  Claims UI route only.
`;

const blockScalarStateYaml = `
version: 1
goal_id: block-scalar-goal
status: running
current_edge:
  from: >
    No product route
  target_delta: >
    Product route usable
  harnessed_path:
    - "Create route"
  verify:
    - "bun test packages/cli/test/goal-pack-cli.test.ts"
  failure_inspection:
    - "packages/cli/src/"
active_task: T001
tasks:
  - id: T001
    type: worker
    status: active
    objective: >
      Implement product route
    allowed_scope:
      - "packages/cli/**"
    verify:
      - "bun test packages/cli/test/goal-pack-cli.test.ts"
    stop_if:
      - "Need authority change."
blockers: []
last_verification:
  result: unknown
commands: []
next_decision: continue
`;

const receiptHistoryJsonl = [
  {
    task_id: "T001",
    type: "pm",
    result: "done",
    evidence: ["seed context"],
    summary: "Seeded the command surface.",
    next_decision: "continue",
  },
  {
    task_id: "T001",
    type: "worker",
    result: "done",
    changed_files: ["packages/cli/src/goal-diffusion.ts", "packages/cli/src/render-goal-receipts.ts"],
    commands: [{ cmd: "bun test packages/cli/test/goal-pack-cli.test.ts", status: "pass" }],
    evidence: ["DO_NOT_DUMP_FULL_EVIDENCE", "compact receipt list"],
    claims: ["receipt list works"],
    summary: "Added compact receipts list.",
    next_decision: "continue",
  },
  {
    task_id: "T001",
    type: "worker",
    result: "blocked",
    commands: [{ cmd: "bun test packages/cli/test/goal-pack-cli.test.ts", status: "fail" }],
    blocked_by: ["filter failure"],
    evidence: ["failed command"],
    summary: "Blocked on filter failure.",
    next_decision: "blocked",
  },
  {
    task_id: "T002",
    type: "audit",
    result: "done",
    decision: "complete",
    oracle_satisfied: true,
    evidence: ["audit proof"],
    claims: ["complete"],
    summary: "Audit complete.",
    next_decision: "done",
  },
].map((receipt) => JSON.stringify(receipt)).join("\n");

test("inspect --json returns compact agent-readable state", () => {
  const root = makePack({
    receipts: `{"task_id":"T000","type":"pm","result":"done","summary":"DO_NOT_DUMP_FULL_RECEIPTS","evidence":["seed"],"next_decision":"continue"}\n`,
  });
  try {
    const result = run(cliScript, ["inspect", root, "--json"]);
    assert.equal(result.status, 0, result.stderr);
    const payload = JSON.parse(result.stdout);
    assert.equal(payload.goal_id, "cli-test-goal");
    assert.equal(payload.status, "running");
    assert.equal(payload.active_task.id, "T001");
    assert.equal(payload.task_count, 2);
    assert.equal(payload.receipt_count, 1);
    assert.equal(payload.last_receipt.task_id, "T000");
    assert.equal(payload.can_continue, true);
    assert.equal(JSON.stringify(payload).includes("DO_NOT_DUMP_FULL_RECEIPTS"), false);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("inspect --json parses YAML block scalars and nested lists", () => {
  const root = makePack({
    contract: blockScalarContractYaml,
    state: blockScalarStateYaml,
  });
  try {
    const result = run(cliScript, ["inspect", root, "--json"]);
    assert.equal(result.status, 0, result.stderr);
    const payload = JSON.parse(result.stdout);
    assert.equal(payload.objective, "Build source connection UI from a real Goal Pack.");
    assert.deepEqual(payload.oracle.signal, ["Route opens", "List renders"]);
    assert.deepEqual(payload.oracle.final_proof, ["Checks pass"]);
    assert.equal(payload.claim_boundary, "Claims UI route only.");
    assert.equal(payload.current_edge.from, "No product route");
    assert.equal(payload.current_edge.target_delta, "Product route usable");
    assert.equal(payload.active_task.objective, "Implement product route");
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("commands resolve bare goal id under docs/goal-diffusion/goals from project subdirectories", () => {
  const { project } = makeProjectPack();
  const nested = join(project, "apps", "web-start", "src");
  mkdirSync(nested, { recursive: true });
  try {
    const inspect = run(cliScript, ["inspect", "cli-test-goal", "--json"], { cwd: nested });
    assert.equal(inspect.status, 0, inspect.stderr);
    const payload = JSON.parse(inspect.stdout);
    assert.equal(payload.goal_id, "cli-test-goal");
    assert.equal(payload.active_task.id, "T001");

    const check = run(cliScript, ["check", "cli-test-goal"], { cwd: project });
    assert.equal(check.status, 0, check.stderr);
    assert.equal(JSON.parse(check.stdout).goal_pack, "cli-test-goal");
  } finally {
    rmSync(project, { recursive: true, force: true });
  }
});

test("summary counts Goal Pack and task completion under a project root", () => {
  const { project } = makeProjectPack("cli-active-goal");
  const doneRoot = join(project, "docs", "goal-diffusion", "goals", "cli-done-goal");
  writePack(doneRoot, {
    contract: doneSummaryContractYaml,
    state: doneSummaryStateYaml,
    receipts: `{"task_id":"T999","type":"audit","result":"done","decision":"complete","oracle_satisfied":true,"evidence":["test"],"claims":["claim"],"summary":"done","next_decision":"done"}\n`,
  });

  try {
    const json = run(cliScript, ["summary", project, "--json"]);
    assert.equal(json.status, 0, json.stderr);
    const payload = JSON.parse(json.stdout);
    assert.equal(payload.goals.total, 2);
    assert.equal(payload.goals.done, 1);
    assert.equal(payload.goals.todo, 1);
    assert.equal(payload.goals.by_status.running, 1);
    assert.equal(payload.goals.by_status.done, 1);
    assert.equal(payload.tasks.total, 3);
    assert.equal(payload.tasks.done, 1);
    assert.equal(payload.tasks.todo, 2);
    assert.equal(payload.tasks.by_status.active, 1);
    assert.equal(payload.tasks.by_status.queued, 1);
    assert.equal(payload.problem_count, 0);

    const todo = run(cliScript, ["summary", project, "--completion", "todo", "--json"]);
    assert.equal(todo.status, 0, todo.stderr);
    const todoPayload = JSON.parse(todo.stdout);
    assert.equal(todoPayload.filters.completion, "todo");
    assert.equal(todoPayload.goals.total, 1);
    assert.equal(todoPayload.goals.done, 0);
    assert.equal(todoPayload.goals.todo, 1);
    assert.equal(todoPayload.items[0].goal_id, "cli-test-goal");

    const done = run(cliScript, ["summary", project, "--completion", "done", "--json"]);
    assert.equal(done.status, 0, done.stderr);
    const donePayload = JSON.parse(done.stdout);
    assert.equal(donePayload.goals.total, 1);
    assert.equal(donePayload.goals.done, 1);
    assert.equal(donePayload.items[0].goal_id, "cli-done-goal");

    const ready = run(cliScript, ["summary", project, "--status", "running", "--json"]);
    assert.equal(ready.status, 0, ready.stderr);
    const readyPayload = JSON.parse(ready.stdout);
    assert.equal(readyPayload.filters.status, "running");
    assert.equal(readyPayload.goals.total, 1);
    assert.equal(readyPayload.items[0].status, "running");

    const text = run(cliScript, ["summary", join(project, "docs", "goal-diffusion", "goals")]);
    assert.equal(text.status, 0, text.stderr);
    assert.match(text.stdout, /goals: total=2 done=1 todo=1 retired=0/);
    assert.match(text.stdout, /tasks: total=3 done=1 todo=2/);
  } finally {
    rmSync(project, { recursive: true, force: true });
  }
});

test("list filters Goal Packs by completion and status", () => {
  const { project } = makeProjectPack("cli-active-goal");
  const doneRoot = join(project, "docs", "goal-diffusion", "goals", "cli-done-goal");
  writePack(doneRoot, {
    contract: doneSummaryContractYaml,
    state: doneSummaryStateYaml,
    receipts: `{"task_id":"T999","type":"audit","result":"done","decision":"complete","oracle_satisfied":true,"evidence":["test"],"claims":["claim"],"summary":"done","next_decision":"done"}\n`,
  });

  try {
    const todo = run(cliScript, ["list", project, "--completion", "todo"]);
    assert.equal(todo.status, 0, todo.stderr);
    assert.match(todo.stdout, /goals: 1/);
    assert.match(todo.stdout, /cli-test-goal  status=running/);
    assert.doesNotMatch(todo.stdout, /cli-done-goal/);

    const done = run(cliScript, ["list", project, "--completion", "done", "--json"]);
    assert.equal(done.status, 0, done.stderr);
    const donePayload = JSON.parse(done.stdout);
    assert.equal(donePayload.count, 1);
    assert.equal(donePayload.items[0].goal_id, "cli-done-goal");

    const impossible = run(cliScript, ["list", project, "--completion", "todo", "--status", "done", "--json"]);
    assert.equal(impossible.status, 0, impossible.stderr);
    assert.equal(JSON.parse(impossible.stdout).count, 0);

    const badCompletion = run(cliScript, ["list", project, "--completion", "finished"]);
    assert.equal(badCompletion.status, 1);
    assert.match(badCompletion.stderr, /completion must be all, todo, done/);

    const badStatus = run(cliScript, ["summary", project, "--status", "todo"]);
    assert.equal(badStatus.status, 1);
    assert.match(badStatus.stderr, /status must be forming, ready, running, blocked, done, retired/);
  } finally {
    rmSync(project, { recursive: true, force: true });
  }
});

test("tasks lists unfinished tasks by default", () => {
  const root = makePack();
  try {
    const result = run(cliScript, ["tasks", root]);
    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, /goal_id: cli-test-goal/);
    assert.match(result.stdout, /filters: completion=todo status=all/);
    assert.match(result.stdout, /tasks: 2/);
    assert.match(result.stdout, /T001\s+active\s+worker\s+Implement command scripts\./);
    assert.match(result.stdout, /T002\s+queued\s+audit\s+Audit command scripts\./);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("tasks filters by completion and status with JSON output", () => {
  const root = makePack();
  try {
    const queued = run(cliScript, ["tasks", root, "--status", "queued", "--json"]);
    assert.equal(queued.status, 0, queued.stderr);
    const queuedPayload = JSON.parse(queued.stdout);
    assert.equal(queuedPayload.goal_id, "cli-test-goal");
    assert.equal(queuedPayload.filters.completion, "todo");
    assert.equal(queuedPayload.filters.status, "queued");
    assert.equal(queuedPayload.count, 1);
    assert.equal(queuedPayload.items[0].id, "T002");
    assert.equal(queuedPayload.items[0].status, "queued");
    assert.equal(queuedPayload.items[0].type, "audit");

    const done = run(cliScript, ["tasks", root, "--completion", "done", "--json"]);
    assert.equal(done.status, 0, done.stderr);
    assert.equal(JSON.parse(done.stdout).count, 0);

    const all = run(cliScript, ["tasks", root, "--completion", "all", "--json"]);
    assert.equal(all.status, 0, all.stderr);
    assert.equal(JSON.parse(all.stdout).count, 2);

    const badCompletion = run(cliScript, ["tasks", root, "--completion", "finished"]);
    assert.equal(badCompletion.status, 1);
    assert.match(badCompletion.stderr, /completion must be all, todo, done/);

    const badStatus = run(cliScript, ["tasks", root, "--status", "waiting"]);
    assert.equal(badStatus.status, 1);
    assert.match(badStatus.stderr, /status must be queued, active, blocked, done/);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("receipts list defaults to compact recent receipt output", () => {
  const root = makePack({ receipts: receiptHistoryJsonl });
  try {
    const result = run(cliScript, ["receipts", "list", root]);
    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, /goal_id: cli-test-goal/);
    assert.match(result.stdout, /filters: limit=5/);
    assert.match(result.stdout, /receipts: total=4 matched=4 shown=4/);
    assert.match(result.stdout, /#1\s+T001\s+pm\s+done\s+next=continue/);
    assert.match(result.stdout, /#2\s+T001\s+worker\s+done\s+next=continue\s+files=2\s+commands=1\s+evidence=2\s+claims=1/);
    assert.match(result.stdout, /#4\s+T002\s+audit\s+done\s+decision=complete\s+oracle=true\s+next=done/);
    assert.doesNotMatch(result.stdout, /DO_NOT_DUMP_FULL_EVIDENCE/);
    assert.doesNotMatch(result.stdout, /changed_files/);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("receipts list composes filters with JSON output", () => {
  const root = makePack({ receipts: receiptHistoryJsonl });
  try {
    const worker = run(cliScript, [
      "receipts",
      "list",
      root,
      "--task",
      "T001",
      "--type",
      "worker",
      "--result",
      "done",
      "--next-decision",
      "continue",
      "--changed-file",
      "packages/cli/src/**",
      "--command-status",
      "pass",
      "--contains",
      "compact receipt list",
      "--json",
    ]);
    assert.equal(worker.status, 0, worker.stderr);
    const workerPayload = JSON.parse(worker.stdout);
    assert.equal(workerPayload.total, 4);
    assert.equal(workerPayload.matched, 1);
    assert.equal(workerPayload.shown, 1);
    assert.equal(workerPayload.items[0].index, 2);
    assert.equal(workerPayload.items[0].task_id, "T001");
    assert.equal(workerPayload.items[0].type, "worker");
    assert.equal(workerPayload.items[0].counts.changed_files, 2);
    assert.equal(JSON.stringify(workerPayload).includes("DO_NOT_DUMP_FULL_EVIDENCE"), false);

    const audit = run(cliScript, [
      "receipts",
      "list",
      root,
      "--type",
      "audit",
      "--decision",
      "complete",
      "--oracle-satisfied",
      "true",
      "--json",
    ]);
    assert.equal(audit.status, 0, audit.stderr);
    const auditPayload = JSON.parse(audit.stdout);
    assert.equal(auditPayload.matched, 1);
    assert.equal(auditPayload.items[0].index, 4);
    assert.equal(auditPayload.items[0].oracle_satisfied, true);

    const failed = run(cliScript, ["receipts", "list", root, "--command-status", "fail", "--json"]);
    assert.equal(failed.status, 0, failed.stderr);
    const failedPayload = JSON.parse(failed.stdout);
    assert.equal(failedPayload.matched, 1);
    assert.equal(failedPayload.items[0].result, "blocked");
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("receipts show returns one full receipt by index", () => {
  const root = makePack({ receipts: receiptHistoryJsonl });
  try {
    const result = run(cliScript, ["receipts", "show", root, "--index", "2", "--json"]);
    assert.equal(result.status, 0, result.stderr);
    const payload = JSON.parse(result.stdout);
    assert.equal(payload.goal_id, "cli-test-goal");
    assert.equal(payload.index, 2);
    assert.equal(payload.receipt.task_id, "T001");
    assert.deepEqual(payload.receipt.evidence, ["DO_NOT_DUMP_FULL_EVIDENCE", "compact receipt list"]);

    const missing = run(cliScript, ["receipts", "show", root, "--index", "99"]);
    assert.equal(missing.status, 1);
    assert.match(missing.stderr, /receipt index out of range: 99/);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("brief renders active task without dumping receipt history", () => {
  const root = makePack({
    receipts: `{"task_id":"T000","type":"pm","result":"done","summary":"DO_NOT_DUMP_FULL_RECEIPTS","evidence":["seed"],"next_decision":"continue"}\n`,
  });
  try {
    const result = run(cliScript, ["brief", root]);
    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, /Task: T001/);
    assert.match(result.stdout, /allowed_scope/);
    assert.match(result.stdout, /packages\/cli\/\*\*/);
    assert.match(result.stdout, /Receipt JSON/);
    assert.doesNotMatch(result.stdout, /DO_NOT_DUMP_FULL_RECEIPTS/);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("dispatch renders a paste-ready goal handoff without mutating state", () => {
  const root = makePack();
  try {
    const before = readFileSync(join(root, "state.yaml"), "utf8");
    const result = run(cliScript, ["dispatch", root]);
    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, /^\/goal 实施这个 Goal Pack task。/);
    assert.match(result.stdout, /goal-diffusion brief .* --task T001/);
    assert.match(result.stdout, /goal-diffusion activate .* --task T001/);
    assert.match(result.stdout, /Goal Pack Task Brief/);
    assert.equal(readFileSync(join(root, "state.yaml"), "utf8"), before);

    const explicit = run(cliScript, ["dispatch", root, "--task", "T001"]);
    assert.equal(explicit.status, 0, explicit.stderr);
    assert.match(explicit.stdout, /goal-diffusion brief .* --task T001/);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("activate moves a queued task into running active state", () => {
  const root = makePack();
  try {
    const statePath = join(root, "state.yaml");
    const contractPath = join(root, "contract.yaml");
    writeFileSync(contractPath, contractYaml.replace("status: running", "status: ready").trimStart());
    writeFileSync(statePath, stateYaml
      .replace("status: running", "status: ready")
      .replace("active_task: T001", "active_task: null")
      .replace("status: active", "status: queued")
      .trimStart());

    const result = run(cliScript, ["activate", root, "--task", "T001"]);
    assert.equal(result.status, 0, result.stderr);
    const payload = JSON.parse(result.stdout);
    assert.equal(payload.status, "running");
    assert.equal(payload.active_task, "T001");
    assert.equal(payload.next_decision, "continue");
    assert.match(readFileSync(statePath, "utf8"), /status: running/);
    assert.match(readFileSync(statePath, "utf8"), /active_task: T001/);
    assert.match(readFileSync(statePath, "utf8"), /id: T001[\s\S]*?status: active/);
    assert.match(readFileSync(contractPath, "utf8"), /status: running/);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("plan_required tasks keep implementation plan reference through activate", () => {
  const root = makePack({
    state: `
version: 1
goal_id: cli-test-goal
status: ready
current_edge:
  from: "High-risk slice needs review"
  target_delta: "Reviewed implementation plan"
  harnessed_path:
    - "Write implementation plan"
  verify:
    - "Review implementation plan"
  failure_inspection:
    - "docs/goal-diffusion/goals/cli-test-goal/implementation-plan.md"
active_task: null
tasks:
  - id: T003
    type: plan_required
    status: queued
    objective: "Plan a high-risk implementation slice."
    plan: implementation-plan.md
    allowed_scope:
      - "docs/goal-diffusion/goals/cli-test-goal/implementation-plan.md"
    verify:
      - "Review implementation plan"
    stop_if:
      - "Plan needs protected contract changes."
blockers: []
last_verification:
  result: unknown
  commands: []
next_decision: plan_required
`,
  });
  try {
    const statePath = join(root, "state.yaml");
    const result = run(cliScript, ["activate", root, "--task", "T003"]);
    assert.equal(result.status, 0, result.stderr);
    const payload = JSON.parse(result.stdout);
    assert.equal(payload.active_task, "T003");
    assert.equal(payload.next_decision, "plan_required");
    assert.match(readFileSync(statePath, "utf8"), /plan: implementation-plan\.md/);

    const brief = run(cliScript, ["brief", root, "--task", "T003", "--json"]);
    assert.equal(brief.status, 0, brief.stderr);
    assert.equal(JSON.parse(brief.stdout).task.plan, "implementation-plan.md");
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("main CLI exposes only official command names", () => {
  const root = makePack();
  try {
    const help = run(cliScript, ["help"]);
    assert.equal(help.status, 0, help.stderr);
    assert.match(help.stdout, /summary \[options\] \[target\]/);
    assert.match(help.stdout, /list \[options\] \[target\]/);
    assert.match(help.stdout, /tasks \[options\] <goal-pack>/);
    assert.match(help.stdout, /receipts\s+Inspect receipt history/);
    assert.match(help.stdout, /brief \[options\] <goal-pack>/);
    assert.match(help.stdout, /dispatch \[options\] <goal-pack>/);
    assert.match(help.stdout, /activate \[options\] <goal-pack>/);
    assert.match(help.stdout, /record \[options\] <goal-pack>/);
    assert.doesNotMatch(help.stdout, /brief\|prompt/);
    assert.doesNotMatch(help.stdout, /record\|receipt/);

    const brief = run(cliScript, ["brief", root, "--task", "T001"]);
    assert.equal(brief.status, 0, brief.stderr);
    assert.match(brief.stdout, /Goal Pack Task Brief/);

    const promptAlias = run(cliScript, ["prompt", root, "--task", "T001"]);
    assert.notEqual(promptAlias.status, 0);

    const receiptAlias = run(cliScript, ["receipt", root, "--file", "receipt.json"]);
    assert.notEqual(receiptAlias.status, 0);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("main CLI exposes structured commander help at every command layer", () => {
  const helpCases = [
    {
      args: ["--help"],
      patterns: [/Usage: goal-diffusion \[options\] \[command\]/, /Options:/, /Commands:/, /inspect/, /brief/, /record/],
    },
    {
      args: ["summary", "--help"],
      patterns: [/Usage: goal-diffusion summary \[options\] \[target\]/, /Arguments:/, /Options:/, /--completion <value>/, /--status <value>/, /--json/],
    },
    {
      args: ["list", "--help"],
      patterns: [/Usage: goal-diffusion list \[options\] \[target\]/, /Arguments:/, /Options:/, /--completion <value>/, /--status <value>/, /--json/],
    },
    {
      args: ["tasks", "--help"],
      patterns: [/Usage: goal-diffusion tasks \[options\] <goal-pack>/, /Arguments:/, /Options:/, /--completion <value>/, /--status <value>/, /--json/],
    },
    {
      args: ["receipts", "--help"],
      patterns: [/Usage: goal-diffusion receipts \[options\] \[command\]/, /Commands:/, /list/, /show/],
    },
    {
      args: ["receipts", "list", "--help"],
      patterns: [/Usage: goal-diffusion receipts list \[options\] <goal-pack>/, /--limit <number>/, /--task <id>/, /--type <value>/, /--result <value>/, /--decision <value>/, /--next-decision <value>/, /--oracle-satisfied <value>/, /--changed-file <glob>/, /--command-status <value>/, /--contains <text>/, /--json/],
    },
    {
      args: ["receipts", "show", "--help"],
      patterns: [/Usage: goal-diffusion receipts show \[options\] <goal-pack>/, /--index <number>/, /--json/],
    },
    {
      args: ["inspect", "--help"],
      patterns: [/Usage: goal-diffusion inspect \[options\] <goal-pack>/, /Arguments:/, /Options:/, /--json/],
    },
    {
      args: ["brief", "--help"],
      patterns: [/Usage: goal-diffusion brief \[options\] <goal-pack>/, /Arguments:/, /Options:/, /--task <id>/, /--json/],
    },
    {
      args: ["dispatch", "--help"],
      patterns: [/Usage: goal-diffusion dispatch \[options\] <goal-pack>/, /Arguments:/, /Options:/, /--task <id>/],
    },
    {
      args: ["activate", "--help"],
      patterns: [/Usage: goal-diffusion activate \[options\] <goal-pack>/, /Arguments:/, /Options:/, /--task <id>/, /--dry-run/],
    },
    {
      args: ["record", "--help"],
      patterns: [/Usage: goal-diffusion record \[options\] <goal-pack>/, /Arguments:/, /Options:/, /--file <path>/, /--json <value>/],
    },
    {
      args: ["advance", "--help"],
      patterns: [/Usage: goal-diffusion advance \[options\] <goal-pack>/, /Arguments:/, /Options:/, /--dry-run/],
    },
    {
      args: ["check", "--help"],
      patterns: [/Usage: goal-diffusion check \[options\] <goal-pack>/, /Arguments:/, /Options:/],
    },
  ];

  for (const helpCase of helpCases) {
    const result = run(cliScript, helpCase.args);
    assert.equal(result.status, 0, result.stderr);
    assert.equal(result.stderr, "");
    for (const pattern of helpCase.patterns) {
      assert.match(result.stdout, pattern, `${helpCase.args.join(" ")} missing ${pattern}`);
    }
  }
});

test("receipt rejects out-of-scope changes and appends valid JSONL atomically", () => {
  const root = makePack();
  const badReceiptPath = join(root, "bad-receipt.json");
  const goodReceiptPath = join(root, "good-receipt.json");
  writeFileSync(badReceiptPath, JSON.stringify({
    task_id: "T001",
    type: "worker",
    result: "done",
    changed_files: ["outside.txt"],
    commands: [{ cmd: "bun test packages/cli/test/goal-pack-cli.test.ts", status: "pass" }],
    evidence: ["test"],
    claims: ["claim"],
    summary: "done",
    next_decision: "continue",
  }));
  writeFileSync(goodReceiptPath, JSON.stringify({
    task_id: "T001",
    type: "worker",
    result: "done",
    changed_files: ["packages/cli/src/goal-diffusion.ts"],
    commands: [{ cmd: "bun test packages/cli/test/goal-pack-cli.test.ts", status: "pass" }],
    evidence: ["test"],
    claims: ["claim"],
    summary: "done",
    next_decision: "continue",
  }));

  try {
    const bad = run(cliScript, ["record", root, "--file", badReceiptPath]);
    assert.equal(bad.status, 1);
    assert.match(bad.stderr, /outside allowed_scope/i);
    assert.equal(readReceipts(root).length, 0);

    const good = run(cliScript, ["record", root, "--file", goodReceiptPath]);
    assert.equal(good.status, 0, good.stderr);
    const lines = readReceipts(root);
    assert.equal(lines.length, 1);
    assert.deepEqual(JSON.parse(lines[0]).changed_files, ["packages/cli/src/goal-diffusion.ts"]);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("main CLI record appends receipts", () => {
  const root = makePack();
  const receiptPath = join(root, "receipt.json");
  writeFileSync(receiptPath, JSON.stringify({
    task_id: "T001",
    type: "worker",
    result: "done",
    changed_files: ["packages/cli/src/goal-diffusion.ts"],
    commands: [{ cmd: "bun test packages/cli/test/goal-pack-cli.test.ts", status: "pass" }],
    evidence: ["test"],
    claims: ["claim"],
    summary: "done",
    next_decision: "continue",
  }));

  try {
    const record = run(cliScript, ["record", root, "--file", receiptPath]);
    assert.equal(record.status, 0, record.stderr);
    assert.equal(readReceipts(root).length, 1);

    assert.equal(readReceipts(root).length, 1);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("advance turns latest receipt into deterministic state", () => {
  const root = makePack({
    receipts: `{"task_id":"T001","type":"worker","result":"done","changed_files":["packages/cli/src/goal-diffusion.ts"],"commands":[{"cmd":"bun test packages/cli/test/goal-pack-cli.test.ts","status":"pass"}],"evidence":["test"],"claims":["claim"],"summary":"done","next_decision":"continue"}\n`,
  });
  try {
    const result = run(cliScript, ["advance", root]);
    assert.equal(result.status, 0, result.stderr);
    const state = readFileSync(join(root, "state.yaml"), "utf8");
    assert.match(state, /active_task: T002/);
    assert.match(state, /id: T001[\s\S]*?status: done/);
    assert.match(state, /id: T002[\s\S]*?status: active/);
    assert.match(state, /last_verification:\n  result: pass/);
    assert.match(state, /next_decision: audit/);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
