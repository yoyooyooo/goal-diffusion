#!/usr/bin/env node
import { realpathSync } from "node:fs";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { Command, CommanderError, Option } from "commander";
import { checkGoalPack } from "./check-goal-pack.ts";
import { runActivateWork } from "./activate-goal-work.ts";
import { runApply } from "./apply-goal-progress.ts";
import { runAppendEvidence } from "./append-evidence.ts";
import { runWorkBrief } from "./render-goal-work-brief.ts";
import { runEvidenceList, runEvidenceShow } from "./render-goal-evidence.ts";
import { runRelationsCheck, runRelationsGoals, runRelationsGraph, runRelationsList, runRelationsWork } from "./render-goal-relations.ts";
import { runWork } from "./render-goal-work.ts";
import { runInspect } from "./inspect-goal-pack.ts";
import { COMPLETION_VALUES, runList, runSummary } from "./summarize-goal-packs.ts";
import { EVIDENCE_RESULTS, NEXT_ACTIONS, STATUS_VALUES, WORK_ITEM_STATUSES, WORK_ITEM_TYPES } from "./lib/goal-pack.ts";

type CliResult = {
  status: number;
  stdout?: string;
  stderr?: string;
};

type CliOutput = {
  writeOut: (text: string) => void;
  writeErr: (text: string) => void;
  outputError: (text: string, write: (text: string) => void) => void;
};

const require = createRequire(import.meta.url);
const packageJson = require("../package.json") as { version?: string };
const CLI_VERSION = packageJson.version ?? "0.0.0";

class CliExit extends Error {
  constructor(readonly status: number) {
    super(`exit ${status}`);
  }
}

export function createGoalProofProgram(output: CliOutput = defaultOutput()) {
  const program = new Command();
  const emit = (text: string) => output.writeOut(ensureTrailingNewline(text));

  program
    .name("goal-proof")
    .description("Goal Proof System CLI for evidence-backed Goal Packs.")
    .version(CLI_VERSION)
    .showHelpAfterError()
    .showSuggestionAfterError()
    .configureOutput(output)
    .exitOverride();

  program
    .command("inspect")
    .description("Inspect compact Goal Pack progress.")
    .argument("<goal-pack>", "Goal Pack directory or id under docs/goal-proof/goals")
    .option("--json", "print JSON output")
    .action((goalRoot: string, options: { json?: boolean }) => {
      emit(runInspect(goalRoot, { json: Boolean(options.json) }));
    });

  program
    .command("summary")
    .description("Summarize Goal Packs under a project or goals directory.")
    .argument("[target]", "project root or docs/goal-proof/goals directory", ".")
    .option("--completion <value>", `filter by completion: ${COMPLETION_VALUES.join(", ")}`, "all")
    .option("--status <value>", "filter by Goal Pack status")
    .option("--depth <value>", "output depth: repo, groups, items", "groups")
    .option("--limit <number>", "maximum groups/items to show", "20")
    .option("--include <fields>", "comma-separated fields to include, such as path,objective")
    .option("--show-empty", "show empty/default fields")
    .option("--json", "print JSON output")
    .action((target: string, options: { json?: boolean; completion?: string; status?: string; depth?: string; limit?: string; include?: string; showEmpty?: boolean }) => {
      emit(runSummary(target, { json: Boolean(options.json), completion: options.completion, status: options.status ?? null, depth: options.depth, limit: options.limit, include: options.include, showEmpty: Boolean(options.showEmpty) }));
    });

  program
    .command("list")
    .description("List Goal Packs under a project or goals directory.")
    .argument("[target]", "project root or docs/goal-proof/goals directory", ".")
    .option("--completion <value>", `filter by completion: ${COMPLETION_VALUES.join(", ")}`, "all")
    .option("--status <value>", "filter by Goal Pack status")
    .option("--limit <number>", "maximum items to show", "20")
    .option("--include <fields>", "comma-separated fields to include, such as path,objective")
    .option("--show-empty", "show empty/default fields")
    .option("--json", "print JSON output")
    .action((target: string, options: { json?: boolean; completion?: string; status?: string; limit?: string; include?: string; showEmpty?: boolean }) => {
      emit(runList(target, { json: Boolean(options.json), completion: options.completion, status: options.status ?? null, limit: options.limit, include: options.include, showEmpty: Boolean(options.showEmpty) }));
    });

  const work = program
    .command("work")
    .description("List, brief, and activate work items inside one Goal Pack.");

  work
    .command("list")
    .description("List work items inside one Goal Pack.")
    .argument("<goal-pack>", "Goal Pack directory or id under docs/goal-proof/goals")
    .option("--completion <value>", `filter by work item completion: ${COMPLETION_VALUES.join(", ")}`, "todo")
    .option("--status <value>", `filter by work item status: ${WORK_ITEM_STATUSES.join(", ")}`)
    .option("--limit <number>", "maximum items to show", "20")
    .option("--include <fields>", "comma-separated fields to include")
    .option("--show-empty", "show empty/default fields")
    .option("--json", "print JSON output")
    .action((goalRoot: string, options: { json?: boolean; completion?: string; status?: string; limit?: string; include?: string; showEmpty?: boolean }) => {
      emit(runWork(goalRoot, { json: Boolean(options.json), completion: options.completion, status: options.status ?? null, limit: options.limit, include: options.include, showEmpty: Boolean(options.showEmpty) }));
    });

  work
    .command("brief")
    .description("Render a work item brief for the active or selected work item.")
    .argument("<goal-pack>", "Goal Pack directory or id under docs/goal-proof/goals")
    .option("--work <id>", "work item id, for example W001")
    .option("--json", "print JSON output")
    .action((goalRoot: string, options: { work?: string; json?: boolean }) => {
      emit(runWorkBrief(goalRoot, { workId: options.work ?? null, json: Boolean(options.json) }));
    });

  work
    .command("activate")
    .description("Move a queued work item into running active state.")
    .argument("<goal-pack>", "Goal Pack directory or id under docs/goal-proof/goals")
    .requiredOption("--work <id>", "work item id, for example W001")
    .option("--dry-run", "print the progress transition without writing files")
    .action((goalRoot: string, options: { work: string; dryRun?: boolean }) => {
      emit(JSON.stringify(runActivateWork(goalRoot, { workId: options.work, dryRun: Boolean(options.dryRun) }), null, 2));
    });

  const evidence = program
    .command("evidence")
    .description("Inspect and append evidence records for one Goal Pack.");

  evidence
    .command("list")
    .description("List compact evidence history with filters.")
    .argument("<goal-pack>", "Goal Pack directory or id under docs/goal-proof/goals")
    .option("--limit <number>", "maximum records to show", "5")
    .option("--work <id>", "filter by work item id, for example W001")
    .option("--type <value>", `filter by work item type: ${WORK_ITEM_TYPES.join(", ")}`)
    .option("--result <value>", `filter by evidence result: ${EVIDENCE_RESULTS.join(", ")}`)
    .option("--decision <value>", "filter by evidence decision")
    .option("--next-action <value>", `filter by next_action: ${NEXT_ACTIONS.join(", ")}`)
    .option("--completion-satisfied <value>", "filter by completion_satisfied: true, false")
    .option("--changed-file <glob>", "filter by changed file glob")
    .option("--command-status <value>", "filter by command status: pass, fail")
    .option("--contains <text>", "filter by raw evidence text")
    .option("--include <fields>", "comma-separated fields to include")
    .option("--show-empty", "show empty/default fields")
    .option("--json", "print JSON output")
    .action((goalRoot: string, options: {
      limit?: string;
      work?: string;
      type?: string;
      result?: string;
      decision?: string;
      nextAction?: string;
      completionSatisfied?: string;
      changedFile?: string;
      commandStatus?: string;
      contains?: string;
      include?: string;
      showEmpty?: boolean;
      json?: boolean;
    }) => {
      emit(runEvidenceList(goalRoot, { ...options, json: Boolean(options.json) }));
    });

  evidence
    .command("show")
    .description("Show one full evidence record by append-order index.")
    .argument("<goal-pack>", "Goal Pack directory or id under docs/goal-proof/goals")
    .requiredOption("--index <number>", "1-based evidence record index")
    .option("--json", "print JSON output")
    .action((goalRoot: string, options: { index: string; json?: boolean }) => {
      emit(runEvidenceShow(goalRoot, { index: options.index, json: Boolean(options.json) }));
    });

  evidence
    .command("add")
    .description("Append a validated evidence record to evidence.jsonl.")
    .argument("<goal-pack>", "Goal Pack directory or id under docs/goal-proof/goals")
    .addOption(new Option("--file <path>", "evidence JSON file").conflicts(["json", "stdin"]))
    .addOption(new Option("--json <value>", "evidence JSON string").conflicts(["file", "stdin"]))
    .addOption(new Option("--stdin", "read evidence JSON from stdin").conflicts(["file", "json"]))
    .option("--apply", "apply deterministic progress after adding evidence")
    .option("--check", "validate the Goal Pack after adding and optional apply")
    .action((goalRoot: string, options: { file?: string; json?: string; stdin?: boolean; apply?: boolean; check?: boolean }) => {
      const result = runAppendEvidence(goalRoot, {
        file: options.file ?? null,
        json: options.json ?? null,
        stdin: Boolean(options.stdin),
        apply: Boolean(options.apply),
        check: Boolean(options.check),
      });
      emit(JSON.stringify({
        ok: result.ok && (result.check ? result.check.ok : true),
        evidence_id: result.evidence_record.evidence_id,
        work_id: result.evidence_record.work_id,
        result: result.evidence_record.result,
        applied: result.applied ? {
          status: result.applied.progress.status,
          active_work_item: result.applied.progress.active_work_item,
          next_action: result.applied.progress.next_action,
          warnings: result.applied.warnings,
        } : null,
        check: result.check ? {
          ok: result.check.ok,
          errors: result.check.errors,
          warnings: result.check.warnings,
        } : null,
      }, null, 2));
      if (result.check && !result.check.ok) throw new CliExit(1);
    });

  const relations = program
    .command("relations")
    .description("Inspect and verify Goal Pack relations.");

  relations
    .command("list")
    .description("List Goal Pack relations under a project or goals directory.")
    .argument("[target]", "project root or docs/goal-proof/goals directory", ".")
    .option("--thread <id>", "filter by relations.thread_id")
    .option("--limit <number>", "maximum items to show", "20")
    .option("--include <fields>", "comma-separated fields to include")
    .option("--show-empty", "show empty/default fields")
    .option("--json", "print JSON output")
    .action((target: string, options: { thread?: string; limit?: string; include?: string; showEmpty?: boolean; json?: boolean }) => {
      emit(runRelationsList(target, { thread: options.thread ?? null, limit: options.limit, include: options.include, showEmpty: Boolean(options.showEmpty), json: Boolean(options.json) }));
    });

  relations
    .command("goals")
    .description("Discover thread-member Goal Packs without queue semantics.")
    .argument("[target]", "project root or docs/goal-proof/goals directory", ".")
    .option("--thread <id>", "filter by relations.thread_id")
    .option("--completion <value>", `filter by Goal Pack completion: ${COMPLETION_VALUES.join(", ")}`, "all")
    .option("--status <value>", `filter by Goal Pack status: ${STATUS_VALUES.join(", ")}`)
    .option("--next-action <value>", `filter by next_action: ${NEXT_ACTIONS.join(", ")}`)
    .option("--limit <number>", "maximum items to show", "20")
    .option("--include <fields>", "comma-separated fields to include")
    .option("--show-empty", "show empty/default fields")
    .option("--json", "print JSON output")
    .action((target: string, options: { thread?: string; completion?: string; status?: string; nextAction?: string; limit?: string; include?: string; showEmpty?: boolean; json?: boolean }) => {
      emit(runRelationsGoals(target, {
        thread: options.thread ?? null,
        completion: options.completion,
        status: options.status ?? null,
        nextAction: options.nextAction ?? null,
        limit: options.limit,
        include: options.include,
        showEmpty: Boolean(options.showEmpty),
        json: Boolean(options.json),
      }));
    });

  relations
    .command("work")
    .description("Discover thread-member work items without queue semantics.")
    .argument("[target]", "project root or docs/goal-proof/goals directory", ".")
    .option("--thread <id>", "filter by relations.thread_id")
    .option("--completion <value>", `filter by work item completion: ${COMPLETION_VALUES.join(", ")}`, "todo")
    .option("--status <value>", `filter by work item status: ${WORK_ITEM_STATUSES.join(", ")}`)
    .option("--goal-completion <value>", `filter by parent Goal Pack completion: ${COMPLETION_VALUES.join(", ")}`, "all")
    .option("--goal-status <value>", `filter by parent Goal Pack status: ${STATUS_VALUES.join(", ")}`)
    .option("--goal <goal-id>", "filter by parent goal_id")
    .option("--limit <number>", "maximum items to show", "20")
    .option("--include <fields>", "comma-separated fields to include")
    .option("--show-empty", "show empty/default fields")
    .option("--json", "print JSON output")
    .action((target: string, options: {
      thread?: string;
      completion?: string;
      status?: string;
      goalCompletion?: string;
      goalStatus?: string;
      goal?: string;
      limit?: string;
      include?: string;
      showEmpty?: boolean;
      json?: boolean;
    }) => {
      emit(runRelationsWork(target, {
        thread: options.thread ?? null,
        completion: options.completion,
        status: options.status ?? null,
        goalCompletion: options.goalCompletion,
        goalStatus: options.goalStatus ?? null,
        goal: options.goal ?? null,
        limit: options.limit,
        include: options.include,
        showEmpty: Boolean(options.showEmpty),
        json: Boolean(options.json),
      }));
    });

  relations
    .command("check")
    .description("Validate Goal Pack relation evidence.")
    .argument("[target]", "project root or docs/goal-proof/goals directory", ".")
    .option("--thread <id>", "filter by relations.thread_id")
    .option("--json", "print JSON output")
    .action((target: string, options: { thread?: string; json?: boolean }) => {
      const result = runRelationsCheck(target, { thread: options.thread ?? null, json: Boolean(options.json) });
      emit(result.output);
      if (!result.ok) throw new CliExit(1);
    });

  relations
    .command("graph")
    .description("Render a derived graph view from Goal Pack relations.")
    .argument("[target]", "project root or docs/goal-proof/goals directory", ".")
    .option("--thread <id>", "filter by relations.thread_id")
    .option("--json", "print JSON output")
    .action((target: string, options: { thread?: string; json?: boolean }) => {
      emit(runRelationsGraph(target, { thread: options.thread ?? null, json: Boolean(options.json) }));
    });

  program
    .command("apply")
    .description("Apply deterministic progress from the latest evidence record.")
    .argument("<goal-pack>", "Goal Pack directory or id under docs/goal-proof/goals")
    .option("--dry-run", "print the progress transition without writing files")
    .action((goalRoot: string, options: { dryRun?: boolean }) => {
      const result = runApply(goalRoot, { dryRun: Boolean(options.dryRun) });
      emit(JSON.stringify({
        ok: result.ok,
        dry_run: result.dry_run,
        evidence_record: result.evidence_record,
        status: result.progress.status,
        active_work_item: result.progress.active_work_item,
        next_action: result.progress.next_action,
        warnings: result.warnings,
      }, null, 2));
    });

  program
    .command("check")
    .description("Validate a Goal Pack.")
    .argument("<goal-pack>", "Goal Pack directory or id under docs/goal-proof/goals")
    .action((goalRoot: string) => {
      const result = checkGoalPack(goalRoot);
      emit(JSON.stringify(result, null, 2));
      if (!result.ok) throw new CliExit(1);
    });

  return program;
}

export function runGoalProofCli(argv: string[]): CliResult {
  let stdout = "";
  let stderr = "";
  const output = {
    writeOut: (text: string) => {
      stdout += text;
    },
    writeErr: (text: string) => {
      stderr += text;
    },
    outputError: (text: string, write: (text: string) => void) => write(text),
  };

  try {
    createGoalProofProgram(output).parse(["node", "goal-proof", ...argv], { from: "node" });
    return { status: 0, stdout, stderr };
  } catch (error) {
    if (error instanceof CliExit) return { status: error.status, stdout, stderr };
    if (error instanceof CommanderError) return { status: error.exitCode, stdout, stderr };
    return { status: 1, stdout, stderr: `${stderr}${errorMessage(error)}\n` };
  }
}

function defaultOutput(): CliOutput {
  return {
    writeOut: (text: string) => {
      process.stdout.write(text);
    },
    writeErr: (text: string) => {
      process.stderr.write(text);
    },
    outputError: (text: string, write: (text: string) => void) => write(text),
  };
}

function ensureTrailingNewline(text: string) {
  return text.endsWith("\n") ? text : `${text}\n`;
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}

function isCliEntry() {
  const argvPath = process.argv[1];
  if (!argvPath) return false;
  try {
    return realpathSync(argvPath) === realpathSync(fileURLToPath(import.meta.url));
  } catch {
    return false;
  }
}

if (isCliEntry()) {
  const result = runGoalProofCli(process.argv.slice(2));
  if (result.stdout) process.stdout.write(result.stdout);
  if (result.stderr) process.stderr.write(result.stderr);
  process.exitCode = result.status;
}
