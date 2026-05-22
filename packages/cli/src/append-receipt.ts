import { readFileSync } from "node:fs";
import { appendReceipt } from "./lib/goal-pack.ts";

export function runAppendReceipt(goalRoot, { file = null, json = null } = {}) {
  if (!file && !json) throw new Error("receipt requires --file <path> or --json '<json>'");
  const receipt = JSON.parse(file ? readFileSync(file, "utf8") : json);
  return appendReceipt(goalRoot, receipt);
}
