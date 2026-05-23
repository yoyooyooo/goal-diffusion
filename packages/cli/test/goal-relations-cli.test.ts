import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { test } from "bun:test";
import assert from "node:assert/strict";

const cliScript = resolve("src/goal-diffusion.ts");

function writePack(root, { contract, state, receipts = "" }) {
  mkdirSync(join(root, "notes"), { recursive: true });
  writeFileSync(join(root, "contract.yaml"), contract.trimStart());
  writeFileSync(join(root, "state.yaml"), state.trimStart());
  writeFileSync(join(root, "receipts.jsonl"), receipts.trimStart());
  return root;
}

function run(script, args, options: { cwd?: string } = {}) {
  return spawnSync(process.execPath, [script, ...args], { encoding: "utf8", cwd: options.cwd });
}

function relationContract({
  id,
  status = "running",
  thread = "goal-relations",
  links = [],
}: {
  id: string;
  status?: string;
  thread?: string | null;
  links?: Array<{ goal_id: string; relation: string; receipt_ref?: string; evidence?: string[] }>;
}) {
  const serializedLinks = links.length === 0
    ? "  links: []"
    : [
      "  links:",
      ...links.flatMap((link) => [
        `    - goal_id: ${link.goal_id}`,
        `      relation: ${link.relation}`,
        ...(link.receipt_ref ? [`      receipt_ref: ${link.receipt_ref}`] : []),
        ...(link.evidence && link.evidence.length > 0
          ? ["      evidence:", ...link.evidence.map((token) => `        - ${token}`)]
          : []),
      ]),
    ].join("\n");

  return `
id: ${id}
status: ${status}
objective: "Exercise relation CLI behavior."
north_star: "Relation continuity stays inspectable."
goal_relations:
  thread_id: ${thread ?? "null"}
${serializedLinks}
authority_refs:
  - "README.md"
architecture_standard:
  - "Relations are inspection metadata."
completion_oracle:
  signal: "Relations CLI can inspect and verify links."
  final_proof: "CLI tests pass."
claim_boundary: "Only proves relation command behavior."
`;
}

function relationState({
  id,
  status = "running",
  activeTask = "T001",
  taskStatus = "active",
}: { id: string; status?: string; activeTask?: string | null; taskStatus?: string }) {
  return `
version: 1
goal_id: ${id}
status: ${status}
current_edge:
  from: "Relations missing"
  target_delta: "Relations inspectable"
  harnessed_path:
    - "Run relations CLI tests"
  verify:
    - "bun test packages/cli/test/goal-relations-cli.test.ts"
  failure_inspection:
    - "packages/cli/src/"
active_task: ${activeTask ?? "null"}
tasks:
  - id: T001
    type: worker
    status: ${taskStatus}
    objective: "Implement relations CLI."
    allowed_scope:
      - "packages/cli/**"
    verify:
      - "bun test packages/cli/test/goal-relations-cli.test.ts"
    stop_if:
      - "Need schema changes."
blockers: []
last_verification:
  result: unknown
  commands: []
next_decision: continue
`;
}

function doneRelationState(id: string) {
  return `
version: 1
goal_id: ${id}
status: done
current_edge:
  from: "Relation evidence missing"
  target_delta: "Relation evidence recorded"
  harnessed_path:
    - "Run relations CLI tests"
  verify:
    - "bun test packages/cli/test/goal-relations-cli.test.ts"
  failure_inspection:
    - "packages/cli/src/"
active_task: null
tasks:
  - id: T999
    type: audit
    status: done
    objective: "Audit relation evidence."
blockers: []
last_verification:
  result: pass
  commands:
    - "bun test packages/cli/test/goal-relations-cli.test.ts"
next_decision: done
`;
}

function auditReceipt(evidence = ["protocol=true"]) {
  return `${JSON.stringify({
    task_id: "T999",
    type: "audit",
    result: "done",
    decision: "complete",
    oracle_satisfied: true,
    evidence,
    claims: ["done"],
    summary: "Audit complete.",
    next_decision: "done",
  })}\n`;
}

function makeRelationsProject() {
  const project = mkdtempSync(join(tmpdir(), "goal-relations-project-test-"));
  const goalsRoot = join(project, "docs", "goal-diffusion", "goals");
  writePack(join(goalsRoot, "protocol-goal"), {
    contract: relationContract({ id: "protocol-goal", status: "done", links: [] }),
    state: doneRelationState("protocol-goal"),
    receipts: auditReceipt(["protocol=true", "done_pack_append_only_closed=true"]),
  });
  writePack(join(goalsRoot, "cli-goal"), {
    contract: relationContract({
      id: "cli-goal",
      links: [{ goal_id: "protocol-goal", relation: "successor_of", receipt_ref: "T999", evidence: ["protocol=true"] }],
    }),
    state: relationState({ id: "cli-goal" }),
  });
  writePack(join(goalsRoot, "other-goal"), {
    contract: relationContract({ id: "other-goal", thread: "other-thread", links: [] }),
    state: relationState({ id: "other-goal" }),
  });
  return { project };
}

test("relations list filters Goal Packs by thread with compact and JSON output", () => {
  const { project } = makeRelationsProject();
  try {
    const json = run(cliScript, ["relations", "list", project, "--thread", "goal-relations", "--json"]);
    assert.equal(json.status, 0, json.stderr);
    const payload = JSON.parse(json.stdout);
    assert.equal(payload.filters.thread, "goal-relations");
    assert.equal(payload.goal_count, 2);
    assert.equal(payload.relation_count, 1);
    assert.deepEqual(payload.items.map((item) => item.goal_id), ["cli-goal", "protocol-goal"]);
    assert.equal(payload.items[0].links[0].relation, "successor_of");

    const text = run(cliScript, ["relations", "list", project, "--thread", "goal-relations"]);
    assert.equal(text.status, 0, text.stderr);
    assert.match(text.stdout, /thread: goal-relations/);
    assert.match(text.stdout, /goals: 2/);
    assert.match(text.stdout, /relations: 1/);
    assert.match(text.stdout, /successor_of\s+protocol-goal\s+receipt=T999\s+evidence=1/);
    assert.doesNotMatch(text.stdout, /other-goal/);
  } finally {
    rmSync(project, { recursive: true, force: true });
  }
});

test("relations check validates hard evidence and reports related_to as warnings", () => {
  const project = mkdtempSync(join(tmpdir(), "goal-relations-check-test-"));
  const goalsRoot = join(project, "docs", "goal-diffusion", "goals");
  writePack(join(goalsRoot, "protocol-goal"), {
    contract: relationContract({ id: "protocol-goal", status: "done", links: [] }),
    state: doneRelationState("protocol-goal"),
    receipts: auditReceipt(["protocol=true"]),
  });
  writePack(join(goalsRoot, "bad-enum"), {
    contract: relationContract({ id: "bad-enum", links: [{ goal_id: "protocol-goal", relation: "blocked_by", receipt_ref: "T999", evidence: ["protocol=true"] }] }),
    state: relationState({ id: "bad-enum" }),
  });
  writePack(join(goalsRoot, "missing-target"), {
    contract: relationContract({ id: "missing-target", links: [{ goal_id: "missing-goal", relation: "successor_of", receipt_ref: "T999", evidence: ["protocol=true"] }] }),
    state: relationState({ id: "missing-target" }),
  });
  writePack(join(goalsRoot, "missing-receipt"), {
    contract: relationContract({ id: "missing-receipt", links: [{ goal_id: "protocol-goal", relation: "depends_on", receipt_ref: "T123", evidence: ["protocol=true"] }] }),
    state: relationState({ id: "missing-receipt" }),
  });
  writePack(join(goalsRoot, "missing-evidence"), {
    contract: relationContract({ id: "missing-evidence", links: [{ goal_id: "protocol-goal", relation: "supersedes", receipt_ref: "T999", evidence: ["absent=true"] }] }),
    state: relationState({ id: "missing-evidence" }),
  });
  writePack(join(goalsRoot, "soft-related"), {
    contract: relationContract({ id: "soft-related", links: [{ goal_id: "missing-related", relation: "related_to", receipt_ref: "T000", evidence: ["absent=true"] }] }),
    state: relationState({ id: "soft-related" }),
  });

  try {
    const result = run(cliScript, ["relations", "check", project, "--thread", "goal-relations", "--json"]);
    assert.equal(result.status, 1);
    const payload = JSON.parse(result.stdout);
    assert.equal(payload.ok, false);
    assert.match(payload.errors.join("\n"), /bad-enum.*invalid relation blocked_by/);
    assert.match(payload.errors.join("\n"), /missing-target.*missing target missing-goal/);
    assert.match(payload.errors.join("\n"), /missing-receipt.*missing receipt T123/);
    assert.match(payload.errors.join("\n"), /missing-evidence.*missing evidence absent=true/);
    assert.match(payload.warnings.join("\n"), /soft-related.*related_to target missing-related is missing/);
    assert.match(payload.warnings.join("\n"), /soft-related.*related_to evidence absent=true is missing/);
  } finally {
    rmSync(project, { recursive: true, force: true });
  }
});

test("relations graph renders a derived thread view without mutating files", () => {
  const { project } = makeRelationsProject();
  try {
    const goalsRoot = join(project, "docs", "goal-diffusion", "goals");
    const before = readFileSync(join(goalsRoot, "cli-goal", "state.yaml"), "utf8");
    const json = run(cliScript, ["relations", "graph", project, "--thread", "goal-relations", "--json"]);
    assert.equal(json.status, 0, json.stderr);
    const payload = JSON.parse(json.stdout);
    assert.equal(payload.threads[0].thread_id, "goal-relations");
    assert.deepEqual(payload.threads[0].goals, ["cli-goal", "protocol-goal"]);
    assert.deepEqual(payload.threads[0].edges, [{
      from: "protocol-goal",
      to: "cli-goal",
      relation: "successor_of",
      receipt_ref: "T999",
      evidence: "ok",
    }]);
    assert.equal(readFileSync(join(goalsRoot, "cli-goal", "state.yaml"), "utf8"), before);

    const text = run(cliScript, ["relations", "graph", project, "--thread", "goal-relations"]);
    assert.equal(text.status, 0, text.stderr);
    assert.match(text.stdout, /protocol-goal --successor_of--> cli-goal receipt=T999 evidence=ok/);
  } finally {
    rmSync(project, { recursive: true, force: true });
  }
});

test("relations command family is documented in root, package, and skill docs", () => {
  const docs = [
    readFileSync(resolve("../..", "README.md"), "utf8"),
    readFileSync(resolve("../..", "README.zh-CN.md"), "utf8"),
    readFileSync(resolve("README.md"), "utf8"),
    readFileSync(resolve("README.zh-CN.md"), "utf8"),
    readFileSync(resolve("../..", "skills/goal-diffusion/SKILL.md"), "utf8"),
  ].join("\n");

  assert.match(docs, /goal-diffusion relations list/);
  assert.match(docs, /goal-diffusion relations check/);
  assert.match(docs, /goal-diffusion relations graph/);
  assert.match(docs, /goal_relations\.thread_id/);
});
