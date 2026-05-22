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

test("main CLI exposes only official command names", () => {
  const root = makePack();
  try {
    const help = run(cliScript, ["help"]);
    assert.equal(help.status, 0, help.stderr);
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
