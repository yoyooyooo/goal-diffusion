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
engineering_guidance:
  standards:
    - "Relations are inspection metadata."
completion:
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
  nextDecision = "continue",
  tasks = null,
}: {
  id: string;
  status?: string;
  activeTask?: string | null;
  taskStatus?: string;
  nextDecision?: string;
  tasks?: Array<{ id: string; type?: string; status: string; objective?: string }> | null;
}) {
  const taskItems = tasks ?? [{ id: "T001", type: "worker", status: taskStatus, objective: "Implement relations CLI." }];
  const serializedTasks = taskItems.flatMap((task) => [
    `  - id: ${task.id}`,
    `    type: ${task.type ?? "worker"}`,
    `    status: ${task.status}`,
    `    objective: "${task.objective ?? "Implement relations CLI."}"`,
    `    allowed_scope:`,
    `      - "packages/cli/**"`,
    `    verify:`,
    `      - "bun test packages/cli/test/goal-relations-cli.test.ts"`,
    `    stop_if:`,
    `      - "Need schema changes."`,
  ]).join("\n");

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
${serializedTasks}
blockers: []
last_verification:
  result: unknown
  checks: []
next_decision: ${nextDecision}
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
  checks:
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
    state: relationState({
      id: "cli-goal",
      tasks: [
        { id: "T001", status: "active", objective: "Implement active relation discovery." },
        { id: "T002", status: "queued", objective: "Implement queued task discovery." },
        { id: "T003", status: "blocked", objective: "Document relation discovery." },
        { id: "T004", status: "done", objective: "Close old relation task." },
      ],
    }),
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
    const json = run(cliScript, ["relations", "list", project, "--thread", "goal-relations", "--include", "links", "--json"]);
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

test("relations goals discovers thread-member Goal Packs with goal filters", () => {
  const { project } = makeRelationsProject();
  try {
    const json = run(cliScript, ["relations", "goals", project, "--thread", "goal-relations", "--show-empty", "--json"]);
    assert.equal(json.status, 0, json.stderr);
    const payload = JSON.parse(json.stdout);
    assert.equal(payload.filters.thread, "goal-relations");
    assert.equal(payload.filters.completion, "all");
    assert.equal(payload.count, 2);
    assert.deepEqual(payload.items.map((item) => item.goal_id), ["cli-goal", "protocol-goal"]);
    assert.equal(payload.items[0].thread_id, "goal-relations");
    assert.equal(payload.items[0].status, "running");
    assert.equal(payload.items[0].next_decision, "continue");
    assert.deepEqual(payload.items[0].tasks, {
      total: 4,
      done: 1,
      todo: 3,
      by_status: { queued: 1, active: 1, blocked: 1, done: 1, unknown: 0 },
    });

    const todo = run(cliScript, ["relations", "goals", project, "--thread", "goal-relations", "--completion", "todo", "--json"]);
    assert.equal(todo.status, 0, todo.stderr);
    assert.deepEqual(JSON.parse(todo.stdout).items.map((item) => item.goal_id), ["cli-goal"]);

    const done = run(cliScript, ["relations", "goals", project, "--thread", "goal-relations", "--status", "done", "--json"]);
    assert.equal(done.status, 0, done.stderr);
    assert.deepEqual(JSON.parse(done.stdout).items.map((item) => item.goal_id), ["protocol-goal"]);

    const nextDecision = run(cliScript, ["relations", "goals", project, "--thread", "goal-relations", "--next-decision", "continue"]);
    assert.equal(nextDecision.status, 0, nextDecision.stderr);
    assert.match(nextDecision.stdout, /filters: thread=goal-relations completion=all status=all next_decision=continue/);
    assert.match(nextDecision.stdout, /cli-goal  thread=goal-relations status=running next_decision=continue active_task=T001 tasks=4 done=1 todo=3 receipts=0/);
    assert.doesNotMatch(nextDecision.stdout, /protocol-goal/);

    const badCompletion = run(cliScript, ["relations", "goals", project, "--completion", "finished"]);
    assert.equal(badCompletion.status, 1);
    assert.match(badCompletion.stderr, /completion must be all, todo, done/);

    const badStatus = run(cliScript, ["relations", "goals", project, "--status", "waiting"]);
    assert.equal(badStatus.status, 1);
    assert.match(badStatus.stderr, /status must be forming, ready, running, blocked, done, retired/);

    const badNextDecision = run(cliScript, ["relations", "goals", project, "--next-decision", "later"]);
    assert.equal(badNextDecision.status, 1);
    assert.match(badNextDecision.stderr, /next_decision must be edge, continue, plan_required, blocked, audit, done, needs-human/);
  } finally {
    rmSync(project, { recursive: true, force: true });
  }
});

test("relations tasks discovers thread-member tasks with task and parent-goal filters", () => {
  const { project } = makeRelationsProject();
  try {
    const todo = run(cliScript, ["relations", "tasks", project, "--thread", "goal-relations", "--completion", "todo", "--json"]);
    assert.equal(todo.status, 0, todo.stderr);
    const todoPayload = JSON.parse(todo.stdout);
    assert.equal(todoPayload.filters.thread, "goal-relations");
    assert.equal(todoPayload.filters.completion, "todo");
    assert.equal(todoPayload.filters.status, "all");
    assert.equal(todoPayload.filters.goal_completion, "all");
    assert.equal(todoPayload.task_count, 3);
    assert.equal(todoPayload.goal_count, 1);
    assert.deepEqual(todoPayload.items.map((item) => `${item.goal_id}:${item.task.id}:${item.task.status}`), [
      "cli-goal:T001:active",
      "cli-goal:T002:queued",
      "cli-goal:T003:blocked",
    ]);

    const queued = run(cliScript, ["relations", "tasks", project, "--thread", "goal-relations", "--status", "queued", "--json"]);
    assert.equal(queued.status, 0, queued.stderr);
    assert.deepEqual(JSON.parse(queued.stdout).items.map((item) => item.task.id), ["T002"]);

    const doneParent = run(cliScript, ["relations", "tasks", project, "--thread", "goal-relations", "--completion", "all", "--goal-completion", "done", "--json"]);
    assert.equal(doneParent.status, 0, doneParent.stderr);
    assert.deepEqual(JSON.parse(doneParent.stdout).items.map((item) => `${item.goal_id}:${item.task.id}`), ["protocol-goal:T999"]);

    const doneParentStatus = run(cliScript, ["relations", "tasks", project, "--thread", "goal-relations", "--completion", "all", "--goal-status", "done", "--json"]);
    assert.equal(doneParentStatus.status, 0, doneParentStatus.stderr);
    assert.deepEqual(JSON.parse(doneParentStatus.stdout).items.map((item) => `${item.goal_id}:${item.task.id}`), ["protocol-goal:T999"]);

    const doneTaskForGoal = run(cliScript, ["relations", "tasks", project, "--thread", "goal-relations", "--goal", "cli-goal", "--completion", "done"]);
    assert.equal(doneTaskForGoal.status, 0, doneTaskForGoal.stderr);
    assert.match(doneTaskForGoal.stdout, /filters: thread=goal-relations completion=done status=all goal_completion=all goal_status=all goal=cli-goal/);
    assert.match(doneTaskForGoal.stdout, /cli-goal T004  task_status=done task_type=worker goal_status=running goal_next_decision=continue Close old relation task\./);
    assert.doesNotMatch(doneTaskForGoal.stdout, /protocol-goal/);

    const badCompletion = run(cliScript, ["relations", "tasks", project, "--completion", "finished"]);
    assert.equal(badCompletion.status, 1);
    assert.match(badCompletion.stderr, /completion must be all, todo, done/);

    const badStatus = run(cliScript, ["relations", "tasks", project, "--status", "waiting"]);
    assert.equal(badStatus.status, 1);
    assert.match(badStatus.stderr, /status must be queued, active, blocked, done/);

    const badGoalCompletion = run(cliScript, ["relations", "tasks", project, "--goal-completion", "finished"]);
    assert.equal(badGoalCompletion.status, 1);
    assert.match(badGoalCompletion.stderr, /goal_completion must be all, todo, done/);

    const badGoalStatus = run(cliScript, ["relations", "tasks", project, "--goal-status", "waiting"]);
    assert.equal(badGoalStatus.status, 1);
    assert.match(badGoalStatus.stderr, /goal_status must be forming, ready, running, blocked, done, retired/);
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
    readFileSync(join(repoRoot, "README.md"), "utf8"),
    readFileSync(join(repoRoot, "README.zh-CN.md"), "utf8"),
    readFileSync(join(packageRoot, "README.md"), "utf8"),
    readFileSync(join(packageRoot, "README.zh-CN.md"), "utf8"),
    readFileSync(join(repoRoot, "skills/goal-diffusion/SKILL.md"), "utf8"),
  ].join("\n");

  assert.match(docs, /goal-diffusion relations list/);
  assert.match(docs, /goal-diffusion relations check/);
  assert.match(docs, /goal-diffusion relations graph/);
  assert.match(docs, /goal_relations\.thread_id/);
});
