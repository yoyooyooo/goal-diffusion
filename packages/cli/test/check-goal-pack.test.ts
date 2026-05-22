import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { test } from "bun:test";
import assert from "node:assert/strict";

const cliScript = resolve("src/goal-diffusion.ts");

function makePack() {
  const root = mkdtempSync(join(tmpdir(), "goal-pack-test-"));
  mkdirSync(join(root, "notes"), { recursive: true });
  writeFileSync(join(root, "receipts.jsonl"), "");
  return root;
}

function writePack(root, { contract, state, receipts = "" }) {
  writeFileSync(join(root, "contract.yaml"), contract.trimStart());
  writeFileSync(join(root, "state.yaml"), state.trimStart());
  writeFileSync(join(root, "receipts.jsonl"), receipts.trimStart());
}

function runChecker(root) {
  const result = spawnSync(process.execPath, [cliScript, "check", root], { encoding: "utf8" });
  return {
    status: result.status,
    stdout: JSON.parse(result.stdout),
    stderr: result.stderr,
  };
}

const baseContract = `
id: cli-checker-goal
status: running
objective: "Exercise the Goal Pack checker."
authority_refs:
  - "goal-diffusion/SKILL.md"
architecture_standard:
  - "Contract / Edge / State / Receipt are the minimum primitives."
completion_oracle:
  signal: "The checker validates Goal Pack state, tasks, receipts, and final audits."
  final_proof: "Checker passes and final audit maps receipts to the oracle."
claim_boundary: "Only claims local checker behavior."
`;

test("rejects an active worker task without verify and stop_if", () => {
  const root = makePack();
  try {
    writePack(root, {
      contract: baseContract,
      state: `
version: 1
goal_id: cli-checker-goal
status: running
active_task: T001
tasks:
  - id: T001
    type: worker
    status: active
    objective: "Rewrite the controller."
    allowed_scope:
      - "goal-diffusion/SKILL.md"
`,
    });

    const result = runChecker(root);
    assert.equal(result.status, 1);
    assert.match(result.stdout.errors.join("\n"), /active worker T001 missing verify/i);
    assert.match(result.stdout.errors.join("\n"), /active worker T001 missing stop_if/i);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("accepts a running goal pack with one active scoped worker", () => {
  const root = makePack();
  try {
    writePack(root, {
      contract: baseContract,
      state: `
version: 1
goal_id: cli-checker-goal
status: running
current_edge:
  from: "Checker fixture"
  target_delta: "Valid running Goal Pack"
  harnessed_path:
    - "Run checker"
  verify:
    - "bun test packages/cli/test/check-goal-pack.test.ts"
  failure_inspection:
    - "goal-diffusion/SKILL.md"
active_task: T001
tasks:
  - id: T001
    type: worker
    status: active
    objective: "Validate a scoped worker task."
    allowed_scope:
      - "goal-diffusion/SKILL.md"
    verify:
      - "bun test packages/cli/test/check-goal-pack.test.ts"
    stop_if:
      - "Need to change authority."
blockers: []
next_decision: continue
`,
    });

    const result = runChecker(root);
    assert.equal(result.status, 0, result.stderr || JSON.stringify(result.stdout));
    assert.equal(result.stdout.ok, true);
    assert.equal(result.stdout.active_task, "T001");
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("rejects done goal packs without an oracle-backed final audit receipt", () => {
  const root = makePack();
  try {
    writePack(root, {
      contract: baseContract.replace("status: running", "status: done"),
      state: `
version: 1
goal_id: cli-checker-goal
status: done
active_task: null
tasks:
  - id: T999
    type: audit
    status: done
    objective: "Final audit."
blockers: []
next_decision: done
`,
      receipts: `{"task_id":"T999","type":"audit","result":"done","decision":"complete","summary":"Looks good."}\n`,
    });

    const result = runChecker(root);
    assert.equal(result.status, 1);
    assert.match(result.stdout.errors.join("\n"), /final audit receipt must set oracle_satisfied: true/i);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("rejects receipts for unknown tasks", () => {
  const root = makePack();
  try {
    writePack(root, {
      contract: baseContract,
      state: `
version: 1
goal_id: cli-checker-goal
status: running
active_task: T001
tasks:
  - id: T001
    type: worker
    status: active
    objective: "Rewrite the controller."
    allowed_scope:
      - "packages/cli/**"
    verify:
      - "bun test packages/cli/test/check-goal-pack.test.ts"
    stop_if:
      - "Need authority change."
blockers: []
next_decision: continue
`,
      receipts: `{"task_id":"T404","type":"worker","result":"done","changed_files":["goal-diffusion/SKILL.md"],"commands":[{"cmd":"bun test packages/cli/test/check-goal-pack.test.ts","status":"pass"}],"evidence":["test"],"claims":["claim"],"summary":"done","next_decision":"continue"}\n`,
    });

    const result = runChecker(root);
    assert.equal(result.status, 1);
    assert.match(result.stdout.errors.join("\n"), /receipt references unknown task T404/i);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("rejects done worker receipts without passing commands inside allowed scope", () => {
  const root = makePack();
  try {
    writePack(root, {
      contract: baseContract,
      state: `
version: 1
goal_id: cli-checker-goal
status: running
active_task: T001
tasks:
  - id: T001
    type: worker
    status: active
    objective: "Rewrite the controller."
    allowed_scope:
      - "packages/cli/**"
    verify:
      - "bun test packages/cli/test/check-goal-pack.test.ts"
    stop_if:
      - "Need authority change."
blockers: []
next_decision: continue
`,
      receipts: `{"task_id":"T001","type":"worker","result":"done","changed_files":["outside.txt"],"commands":[{"cmd":"bun test packages/cli/test/check-goal-pack.test.ts","status":"fail"}],"evidence":["test"],"claims":["claim"],"summary":"done","next_decision":"continue"}\n`,
    });

    const result = runChecker(root);
    assert.equal(result.status, 1);
    assert.match(result.stdout.errors.join("\n"), /receipt T001 changed file outside allowed_scope: outside\.txt/i);
    assert.match(result.stdout.errors.join("\n"), /receipt T001 done worker command did not pass/i);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("rejects blocked receipts without blocked_by and invalid next decisions", () => {
  const root = makePack();
  try {
    writePack(root, {
      contract: baseContract,
      state: `
version: 1
goal_id: cli-checker-goal
status: blocked
active_task: null
tasks:
  - id: T001
    type: worker
    status: blocked
    objective: "Rewrite the controller."
    allowed_scope:
      - "packages/cli/**"
    verify:
      - "bun test packages/cli/test/check-goal-pack.test.ts"
    stop_if:
      - "Need authority change."
blockers: []
next_decision: maybe
`,
      receipts: `{"task_id":"T001","type":"worker","result":"blocked","evidence":["blocked"],"next_decision":"blocked"}\n`,
    });

    const result = runChecker(root);
    assert.equal(result.status, 1);
    assert.match(result.stdout.errors.join("\n"), /blocked receipt T001 missing blocked_by/i);
    assert.match(result.stdout.errors.join("\n"), /state next_decision must be/i);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
