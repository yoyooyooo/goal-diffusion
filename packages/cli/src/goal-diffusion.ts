#!/usr/bin/env node
import { realpathSync } from "node:fs";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { Command, CommanderError, Option } from "commander";
import { checkGoalPack } from "./check-goal-pack.ts";
import { runActivate } from "./activate-goal-pack.ts";
import { runAdvance } from "./advance-goal-pack.ts";
import { runAppendReceipt } from "./append-receipt.ts";
import { runBrief } from "./render-goal-task-brief.ts";
import { runDispatch } from "./render-goal-task-dispatch.ts";
import { runReceiptsList, runReceiptShow } from "./render-goal-receipts.ts";
import { runRelationsCheck, runRelationsGoals, runRelationsGraph, runRelationsList, runRelationsTasks } from "./render-goal-relations.ts";
import { runTasks } from "./render-goal-tasks.ts";
import { runInspect } from "./inspect-goal-pack.ts";
import { COMPLETION_VALUES, runList, runSummary } from "./summarize-goal-packs.ts";
import { NEXT_DECISIONS, RECEIPT_RESULTS, STATUS_VALUES, TASK_STATUSES, TASK_TYPES } from "./lib/goal-pack.ts";

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

export function createGoalDiffusionProgram(output: CliOutput = defaultOutput()) {
  const program = new Command();
  const emit = (text: string) => output.writeOut(ensureTrailingNewline(text));

  program
    .name("goal-diffusion")
    .description("Goal Pack command surface for long-running AI coding loops.")
    .version(CLI_VERSION)
    .showHelpAfterError()
    .showSuggestionAfterError()
    .configureOutput(output)
    .exitOverride();

  program
    .command("inspect")
    .description("Inspect compact Goal Pack state.")
    .argument("<goal-pack>", "Goal Pack directory or id under docs/goal-diffusion/goals")
    .option("--json", "print JSON output")
    .action((goalRoot: string, options: { json?: boolean }) => {
      emit(runInspect(goalRoot, { json: Boolean(options.json) }));
    });

  program
    .command("summary")
    .description("Summarize Goal Packs under a project or goals directory.")
    .argument("[target]", "project root or docs/goal-diffusion/goals directory", ".")
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
    .argument("[target]", "project root or docs/goal-diffusion/goals directory", ".")
    .option("--completion <value>", `filter by completion: ${COMPLETION_VALUES.join(", ")}`, "all")
    .option("--status <value>", "filter by Goal Pack status")
    .option("--limit <number>", "maximum items to show", "20")
    .option("--include <fields>", "comma-separated fields to include, such as path,objective")
    .option("--show-empty", "show empty/default fields")
    .option("--json", "print JSON output")
    .action((target: string, options: { json?: boolean; completion?: string; status?: string; limit?: string; include?: string; showEmpty?: boolean }) => {
      emit(runList(target, { json: Boolean(options.json), completion: options.completion, status: options.status ?? null, limit: options.limit, include: options.include, showEmpty: Boolean(options.showEmpty) }));
    });

  program
    .command("tasks")
    .description("List tasks inside one Goal Pack.")
    .argument("<goal-pack>", "Goal Pack directory or id under docs/goal-diffusion/goals")
    .option("--completion <value>", `filter by task completion: ${COMPLETION_VALUES.join(", ")}`, "todo")
    .option("--status <value>", `filter by task status: ${TASK_STATUSES.join(", ")}`)
    .option("--limit <number>", "maximum items to show", "20")
    .option("--include <fields>", "comma-separated fields to include")
    .option("--show-empty", "show empty/default fields")
    .option("--json", "print JSON output")
    .action((goalRoot: string, options: { json?: boolean; completion?: string; status?: string; limit?: string; include?: string; showEmpty?: boolean }) => {
      emit(runTasks(goalRoot, { json: Boolean(options.json), completion: options.completion, status: options.status ?? null, limit: options.limit, include: options.include, showEmpty: Boolean(options.showEmpty) }));
    });

  const receipts = program
    .command("receipts")
    .description("Inspect receipt history for one Goal Pack.");

  receipts
    .command("list")
    .description("List compact receipt history with filters.")
    .argument("<goal-pack>", "Goal Pack directory or id under docs/goal-diffusion/goals")
    .option("--limit <number>", "maximum receipts to show", "5")
    .option("--task <id>", "filter by task id, for example T001")
    .option("--type <value>", `filter by receipt type: ${TASK_TYPES.join(", ")}`)
    .option("--result <value>", `filter by receipt result: ${RECEIPT_RESULTS.join(", ")}`)
    .option("--decision <value>", "filter by receipt decision")
    .option("--next-decision <value>", `filter by next_decision: ${NEXT_DECISIONS.join(", ")}`)
    .option("--oracle-satisfied <value>", "filter by oracle_satisfied: true, false")
    .option("--changed-file <glob>", "filter by changed file glob")
    .option("--command-status <value>", "filter by command status: pass, fail")
    .option("--contains <text>", "filter by raw receipt text")
    .option("--include <fields>", "comma-separated fields to include")
    .option("--show-empty", "show empty/default fields")
    .option("--json", "print JSON output")
    .action((goalRoot: string, options: {
      limit?: string;
      task?: string;
      type?: string;
      result?: string;
      decision?: string;
      nextDecision?: string;
      oracleSatisfied?: string;
      changedFile?: string;
      commandStatus?: string;
      contains?: string;
      include?: string;
      showEmpty?: boolean;
      json?: boolean;
    }) => {
      emit(runReceiptsList(goalRoot, { ...options, json: Boolean(options.json) }));
    });

  receipts
    .command("show")
    .description("Show one full receipt by append-order index.")
    .argument("<goal-pack>", "Goal Pack directory or id under docs/goal-diffusion/goals")
    .requiredOption("--index <number>", "1-based receipt index")
    .option("--json", "print JSON output")
    .action((goalRoot: string, options: { index: string; json?: boolean }) => {
      emit(runReceiptShow(goalRoot, { index: options.index, json: Boolean(options.json) }));
    });

  const relations = program
    .command("relations")
    .description("Inspect and verify Goal Pack relations.");

  relations
    .command("list")
    .description("List Goal Pack relations under a project or goals directory.")
    .argument("[target]", "project root or docs/goal-diffusion/goals directory", ".")
    .option("--thread <id>", "filter by goal_relations.thread_id")
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
    .argument("[target]", "project root or docs/goal-diffusion/goals directory", ".")
    .option("--thread <id>", "filter by goal_relations.thread_id")
    .option("--completion <value>", `filter by Goal Pack completion: ${COMPLETION_VALUES.join(", ")}`, "all")
    .option("--status <value>", `filter by Goal Pack status: ${STATUS_VALUES.join(", ")}`)
    .option("--next-decision <value>", `filter by next_decision: ${NEXT_DECISIONS.join(", ")}`)
    .option("--limit <number>", "maximum items to show", "20")
    .option("--include <fields>", "comma-separated fields to include")
    .option("--show-empty", "show empty/default fields")
    .option("--json", "print JSON output")
    .action((target: string, options: { thread?: string; completion?: string; status?: string; nextDecision?: string; limit?: string; include?: string; showEmpty?: boolean; json?: boolean }) => {
      emit(runRelationsGoals(target, {
        thread: options.thread ?? null,
        completion: options.completion,
        status: options.status ?? null,
        nextDecision: options.nextDecision ?? null,
        limit: options.limit,
        include: options.include,
        showEmpty: Boolean(options.showEmpty),
        json: Boolean(options.json),
      }));
    });

  relations
    .command("tasks")
    .description("Discover thread-member tasks without queue semantics.")
    .argument("[target]", "project root or docs/goal-diffusion/goals directory", ".")
    .option("--thread <id>", "filter by goal_relations.thread_id")
    .option("--completion <value>", `filter by task completion: ${COMPLETION_VALUES.join(", ")}`, "todo")
    .option("--status <value>", `filter by task status: ${TASK_STATUSES.join(", ")}`)
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
      emit(runRelationsTasks(target, {
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
    .argument("[target]", "project root or docs/goal-diffusion/goals directory", ".")
    .option("--thread <id>", "filter by goal_relations.thread_id")
    .option("--json", "print JSON output")
    .action((target: string, options: { thread?: string; json?: boolean }) => {
      const result = runRelationsCheck(target, { thread: options.thread ?? null, json: Boolean(options.json) });
      emit(result.output);
      if (!result.ok) throw new CliExit(1);
    });

  relations
    .command("graph")
    .description("Render a derived graph view from Goal Pack relations.")
    .argument("[target]", "project root or docs/goal-diffusion/goals directory", ".")
    .option("--thread <id>", "filter by goal_relations.thread_id")
    .option("--json", "print JSON output")
    .action((target: string, options: { thread?: string; json?: boolean }) => {
      emit(runRelationsGraph(target, { thread: options.thread ?? null, json: Boolean(options.json) }));
    });

  program
    .command("brief")
    .description("Render a task brief for the active or selected task.")
    .argument("<goal-pack>", "Goal Pack directory or id under docs/goal-diffusion/goals")
    .option("--task <id>", "task id, for example T001")
    .option("--json", "print JSON output")
    .action((goalRoot: string, options: { task?: string; json?: boolean }) => {
      emit(runBrief(goalRoot, { taskId: options.task ?? null, json: Boolean(options.json) }));
    });

  program
    .command("dispatch")
    .description("Render a paste-ready handoff for a specific task.")
    .argument("<goal-pack>", "Goal Pack directory or id under docs/goal-diffusion/goals")
    .option("--task <id>", "task id, defaults to active_task")
    .action((goalRoot: string, options: { task?: string }) => {
      emit(runDispatch(goalRoot, { taskId: options.task ?? null }));
    });

  program
    .command("activate")
    .description("Move a queued task into running active state.")
    .argument("<goal-pack>", "Goal Pack directory or id under docs/goal-diffusion/goals")
    .requiredOption("--task <id>", "task id, for example T001")
    .option("--dry-run", "print the state transition without writing files")
    .action((goalRoot: string, options: { task: string; dryRun?: boolean }) => {
      emit(JSON.stringify(runActivate(goalRoot, { taskId: options.task, dryRun: Boolean(options.dryRun) }), null, 2));
    });

  program
    .command("record")
    .description("Append a validated receipt to receipts.jsonl.")
    .argument("<goal-pack>", "Goal Pack directory or id under docs/goal-diffusion/goals")
    .addOption(new Option("--file <path>", "receipt JSON file").conflicts(["json", "stdin"]))
    .addOption(new Option("--json <value>", "receipt JSON string").conflicts(["file", "stdin"]))
    .addOption(new Option("--stdin", "read receipt JSON from stdin").conflicts(["file", "json"]))
    .option("--advance", "advance deterministic state after recording")
    .option("--check", "validate the Goal Pack after recording and optional advance")
    .action((goalRoot: string, options: { file?: string; json?: string; stdin?: boolean; advance?: boolean; check?: boolean }) => {
      const result = runAppendReceipt(goalRoot, {
        file: options.file ?? null,
        json: options.json ?? null,
        stdin: Boolean(options.stdin),
        advance: Boolean(options.advance),
        check: Boolean(options.check),
      });
      emit(JSON.stringify({
        ok: result.ok && (result.check ? result.check.ok : true),
        task_id: result.receipt.task_id,
        result: result.receipt.result,
        advanced: result.advanced ? {
          status: result.advanced.state.status,
          active_task: result.advanced.state.active_task,
          next_decision: result.advanced.state.next_decision,
          warnings: result.advanced.warnings,
        } : null,
        check: result.check ? {
          ok: result.check.ok,
          errors: result.check.errors,
          warnings: result.check.warnings,
        } : null,
      }, null, 2));
      if (result.check && !result.check.ok) throw new CliExit(1);
    });

  program
    .command("advance")
    .description("Advance deterministic state from the latest receipt.")
    .argument("<goal-pack>", "Goal Pack directory or id under docs/goal-diffusion/goals")
    .option("--dry-run", "print the state transition without writing files")
    .action((goalRoot: string, options: { dryRun?: boolean }) => {
      const result = runAdvance(goalRoot, { dryRun: Boolean(options.dryRun) });
      emit(JSON.stringify({
        ok: result.ok,
        dry_run: result.dry_run,
        receipt: result.receipt,
        status: result.state.status,
        active_task: result.state.active_task,
        next_decision: result.state.next_decision,
        warnings: result.warnings,
      }, null, 2));
    });

  program
    .command("check")
    .description("Validate a Goal Pack.")
    .argument("<goal-pack>", "Goal Pack directory or id under docs/goal-diffusion/goals")
    .action((goalRoot: string) => {
      const result = checkGoalPack(goalRoot);
      emit(JSON.stringify(result, null, 2));
      if (!result.ok) throw new CliExit(1);
    });

  return program;
}

export function runGoalDiffusionCli(argv: string[]): CliResult {
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
    createGoalDiffusionProgram(output).parse(["node", "goal-diffusion", ...argv], { from: "node" });
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
  const result = runGoalDiffusionCli(process.argv.slice(2));
  if (result.stdout) process.stdout.write(result.stdout);
  if (result.stderr) process.stderr.write(result.stderr);
  process.exitCode = result.status;
}
