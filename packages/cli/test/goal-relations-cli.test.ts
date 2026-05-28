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

function run(args, options: { cwd?: string } = {}) {
  return spawnSync(process.execPath, [cliScript, ...args], { encoding: "utf8", cwd: options.cwd });
}

function writePack(root, { goal, progress, evidence = "" }) {
  mkdirSync(join(root, "notes"), { recursive: true });
  writeFileSync(join(root, "goal.yaml"), goal.trimStart());
  writeFileSync(join(root, "progress.yaml"), progress.trimStart());
  writeFileSync(join(root, "evidence.jsonl"), evidence.trimStart());
}

function relationGoal({
  id,
  status = "running",
  thread = "goal-relations",
  links = [],
}: {
  id: string;
  status?: string;
  thread?: string | null;
  links?: Array<{ goal_id: string; relation: string; evidence_ref?: string; evidence?: string[] }>;
}) {
  const serializedLinks = links.length === 0
    ? "  links: []"
    : [
      "  links:",
      ...links.flatMap((link) => [
        `    - goal_id: ${link.goal_id}`,
        `      relation: ${link.relation}`,
        ...(link.evidence_ref ? [`      evidence_ref: ${link.evidence_ref}`] : []),
        ...(link.evidence && link.evidence.length > 0
          ? ["      evidence:", ...link.evidence.map((token) => `        - ${token}`)]
          : []),
      ]),
    ].join("\n");

  return `
schema_version: 2
id: ${id}
status: ${status}
objective: "Exercise relation CLI behavior."
guiding_principle: "Relation continuity stays inspectable."
relations:
  thread_id: ${thread ?? "null"}
${serializedLinks}
authority_refs:
  - "README.md"
engineering_guidance:
  standards:
    - "Relations are inspection metadata."
completion:
  signal: "Relations CLI can inspect and verify links."
  required_evidence: "CLI tests pass."
claim_limit: "Only proves relation command behavior."
`;
}

function relationProgress({
  id,
  status = "running",
  active = "W001",
  workStatus = "active",
  nextAction = "continue",
  workItems = null,
}: {
  id: string;
  status?: string;
  active?: string | null;
  workStatus?: string;
  nextAction?: string;
  workItems?: Array<{ id: string; type?: string; status: string; objective?: string }> | null;
}) {
  const items = workItems ?? [{ id: "W001", type: "implementation", status: workStatus, objective: "Implement relations CLI." }];
  const serialized = items.flatMap((item) => [
    `  - id: ${item.id}`,
    `    type: ${item.type ?? "implementation"}`,
    `    status: ${item.status}`,
    `    objective: "${item.objective ?? "Implement relations CLI."}"`,
    `    allowed_scope:`,
    `      - "packages/cli/**"`,
    `    checks:`,
    `      - "bun test packages/cli/test/goal-relations-cli.test.ts"`,
    `    stop_if:`,
    `      - "Need schema changes."`,
  ]).join("\n");

  return `
schema_version: 2
goal_id: ${id}
status: ${status}
proof_step:
  from: "Relations missing"
  target_delta: "Relations inspectable"
  proof_path:
    - "Run relations CLI tests"
  checks:
    - "bun test packages/cli/test/goal-relations-cli.test.ts"
  failure_inspection:
    - "packages/cli/src/"
active_work_item: ${active ?? "null"}
work_items:
${serialized}
blockers: []
last_check:
  result: unknown
  checks: []
next_action: ${nextAction}
`;
}

function doneProgress(id: string) {
  return relationProgress({
    id,
    status: "done",
    active: null,
    nextAction: "done",
    workItems: [{ id: "W999", type: "review", status: "done", objective: "Completion review." }],
  });
}

function reviewEvidence(evidence = ["protocol=true"]) {
  return `${JSON.stringify({
    schema_version: 2,
    evidence_id: "E999",
    work_id: "W999",
    type: "review",
    result: "done",
    decision: "complete",
    completion_satisfied: true,
    recorded_at: "2026-05-28T00:00:00Z",
    claim_evidence: [{ claim: "completion.required_evidence", evidence }],
    evidence,
    summary: "Completion review passed.",
    next_action: "done",
  })}\n`;
}

function makeRelationsProject() {
  const project = mkdtempSync(join(tmpdir(), "goal-proof-relations-"));
  const goalsRoot = join(project, "docs", "goal-proof", "goals");
  writePack(join(goalsRoot, "protocol-goal"), {
    goal: relationGoal({ id: "protocol-goal", status: "done", links: [] }),
    progress: doneProgress("protocol-goal"),
    evidence: reviewEvidence(["protocol=true", "done_pack_closed=true"]),
  });
  writePack(join(goalsRoot, "cli-goal"), {
    goal: relationGoal({
      id: "cli-goal",
      links: [{ goal_id: "protocol-goal", relation: "successor_of", evidence_ref: "E999", evidence: ["protocol=true"] }],
    }),
    progress: relationProgress({
      id: "cli-goal",
      workItems: [
        { id: "W001", status: "active", objective: "Implement active relation discovery." },
        { id: "W002", status: "queued", objective: "Implement queued work discovery." },
        { id: "W003", status: "blocked", objective: "Document relation discovery." },
        { id: "W004", status: "done", objective: "Close old relation work." },
      ],
    }),
  });
  writePack(join(goalsRoot, "other-goal"), {
    goal: relationGoal({ id: "other-goal", thread: "other-thread", links: [] }),
    progress: relationProgress({ id: "other-goal" }),
  });
  return { project };
}

test("relations list filters Goal Packs by thread", () => {
  const { project } = makeRelationsProject();
  try {
    const json = run(["relations", "list", project, "--thread", "goal-relations", "--include", "links", "--json"]);
    assert.equal(json.status, 0, json.stderr);
    const payload = JSON.parse(json.stdout);
    assert.equal(payload.filters.thread, "goal-relations");
    assert.equal(payload.goal_count, 2);
    assert.equal(payload.relation_count, 1);
    assert.deepEqual(payload.items.map((item) => item.goal_id), ["cli-goal", "protocol-goal"]);
    assert.equal(payload.items[0].links[0].evidence_ref, "E999");

    const text = run(["relations", "list", project, "--thread", "goal-relations"]);
    assert.equal(text.status, 0, text.stderr);
    assert.match(text.stdout, /successor_of\s+protocol-goal\s+evidence_record=E999\s+evidence=1/);
    assert.doesNotMatch(text.stdout, /other-goal/);
  } finally {
    rmSync(project, { recursive: true, force: true });
  }
});

test("relations goals and work discover thread members with filters", () => {
  const { project } = makeRelationsProject();
  try {
    const goals = run(["relations", "goals", project, "--thread", "goal-relations", "--show-empty", "--json"]);
    assert.equal(goals.status, 0, goals.stderr);
    const goalPayload = JSON.parse(goals.stdout);
    assert.deepEqual(goalPayload.items.map((item) => item.goal_id), ["cli-goal", "protocol-goal"]);
    assert.equal(goalPayload.items[0].next_action, "continue");
    assert.deepEqual(goalPayload.items[0].work_items, {
      total: 4,
      done: 1,
      todo: 3,
      by_status: { queued: 1, active: 1, blocked: 1, done: 1, unknown: 0 },
    });

    const work = run(["relations", "work", project, "--thread", "goal-relations", "--completion", "todo", "--json"]);
    assert.equal(work.status, 0, work.stderr);
    const workPayload = JSON.parse(work.stdout);
    assert.deepEqual(workPayload.items.map((item) => `${item.goal_id}:${item.work_item.id}:${item.work_item.status}`), [
      "cli-goal:W001:active",
      "cli-goal:W002:queued",
      "cli-goal:W003:blocked",
    ]);

    const done = run(["relations", "work", project, "--thread", "goal-relations", "--goal", "cli-goal", "--completion", "done"]);
    assert.equal(done.status, 0, done.stderr);
    assert.match(done.stdout, /cli-goal W004  work_item_status=done work_item_type=implementation goal_status=running goal_next_action=continue Close old relation work\./);
  } finally {
    rmSync(project, { recursive: true, force: true });
  }
});

test("relations check validates hard evidence and reports related_to as warnings", () => {
  const project = mkdtempSync(join(tmpdir(), "goal-proof-relations-check-"));
  const goalsRoot = join(project, "docs", "goal-proof", "goals");
  writePack(join(goalsRoot, "protocol-goal"), {
    goal: relationGoal({ id: "protocol-goal", status: "done", links: [] }),
    progress: doneProgress("protocol-goal"),
    evidence: reviewEvidence(["protocol=true"]),
  });
  writePack(join(goalsRoot, "bad-enum"), {
    goal: relationGoal({ id: "bad-enum", links: [{ goal_id: "protocol-goal", relation: "blocked_by", evidence_ref: "E999", evidence: ["protocol=true"] }] }),
    progress: relationProgress({ id: "bad-enum" }),
  });
  writePack(join(goalsRoot, "missing-target"), {
    goal: relationGoal({ id: "missing-target", links: [{ goal_id: "missing-goal", relation: "successor_of", evidence_ref: "E999", evidence: ["protocol=true"] }] }),
    progress: relationProgress({ id: "missing-target" }),
  });
  writePack(join(goalsRoot, "missing-record"), {
    goal: relationGoal({ id: "missing-record", links: [{ goal_id: "protocol-goal", relation: "depends_on", evidence_ref: "E123", evidence: ["protocol=true"] }] }),
    progress: relationProgress({ id: "missing-record" }),
  });
  writePack(join(goalsRoot, "missing-evidence"), {
    goal: relationGoal({ id: "missing-evidence", links: [{ goal_id: "protocol-goal", relation: "supersedes", evidence_ref: "E999", evidence: ["absent=true"] }] }),
    progress: relationProgress({ id: "missing-evidence" }),
  });
  writePack(join(goalsRoot, "soft-related"), {
    goal: relationGoal({ id: "soft-related", links: [{ goal_id: "missing-related", relation: "related_to", evidence_ref: "E000", evidence: ["absent=true"] }] }),
    progress: relationProgress({ id: "soft-related" }),
  });

  try {
    const result = run(["relations", "check", project, "--thread", "goal-relations", "--json"]);
    assert.equal(result.status, 1);
    const payload = JSON.parse(result.stdout);
    assert.equal(payload.ok, false);
    assert.match(payload.errors.join("\n"), /bad-enum.*invalid relation blocked_by/);
    assert.match(payload.errors.join("\n"), /missing-target.*missing target missing-goal/);
    assert.match(payload.errors.join("\n"), /missing-record.*missing evidence record E123/);
    assert.match(payload.errors.join("\n"), /missing-evidence.*missing evidence absent=true/);
    assert.match(payload.warnings.join("\n"), /soft-related.*related_to target missing-related is missing/);
  } finally {
    rmSync(project, { recursive: true, force: true });
  }
});

test("relations check matches structured evidence and graph renders derived view", () => {
  const { project } = makeRelationsProject();
  try {
    const check = run(["relations", "check", project, "--thread", "goal-relations", "--json"]);
    assert.equal(check.status, 0, check.stderr);
    assert.equal(JSON.parse(check.stdout).ok, true);

    const goalsRoot = join(project, "docs", "goal-proof", "goals");
    const before = readFileSync(join(goalsRoot, "cli-goal", "progress.yaml"), "utf8");
    const graph = run(["relations", "graph", project, "--thread", "goal-relations", "--json"]);
    assert.equal(graph.status, 0, graph.stderr);
    const payload = JSON.parse(graph.stdout);
    assert.deepEqual(payload.threads[0].edges, [{
      from: "protocol-goal",
      to: "cli-goal",
      relation: "successor_of",
      evidence_ref: "E999",
      evidence: "ok",
    }]);
    assert.equal(readFileSync(join(goalsRoot, "cli-goal", "progress.yaml"), "utf8"), before);

    const text = run(["relations", "graph", project, "--thread", "goal-relations"]);
    assert.match(text.stdout, /protocol-goal --successor_of--> cli-goal evidence_record=E999 evidence=ok/);
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
    readFileSync(join(repoRoot, "skills/goal/goal-proof-system/SKILL.md"), "utf8"),
  ].join("\n");

  assert.match(docs, /goal-proof relations list/);
  assert.match(docs, /goal-proof relations check/);
  assert.match(docs, /goal-proof relations graph/);
  assert.match(docs, /relations\.thread_id/);
});
