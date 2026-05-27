import { readFileSync } from "node:fs";
import { advanceGoalPack, appendReceipt, loadGoalPack, validateGoalPack } from "./lib/goal-pack.ts";

export function runAppendReceipt(goalRoot, { file = null, json = null, stdin = false, advance = false, check = false } = {}) {
  const inputCount = [file, json, stdin].filter(Boolean).length;
  if (inputCount !== 1) throw new Error("receipt requires exactly one input source: --file <path>, --json '<json>', or --stdin");

  const input = file ? readFileSync(file, "utf8") : stdin ? readStdin() : json;
  const receipt = JSON.parse(input);
  const recorded = appendReceipt(goalRoot, receipt);
  const advanced = advance ? advanceGoalPack(goalRoot) : null;
  const validation = check ? validateGoalPack(loadGoalPack(goalRoot)) : null;
  return {
    ...recorded,
    advanced,
    check: validation,
  };
}

function readStdin() {
  if (process.stdin.isTTY) throw new Error("--stdin requires JSON input on stdin");
  const input = readFileSync(0, "utf8");
  if (input.trim().length === 0) throw new Error("--stdin requires JSON input on stdin");
  return input;
}
