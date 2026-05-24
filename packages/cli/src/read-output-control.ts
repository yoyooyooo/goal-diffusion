export const SUMMARY_DEPTH_VALUES = ["repo", "groups", "items"];

export function normalizeReadControls(options: any = {}, {
  allowedDepths = null,
  defaultDepth = null,
  defaultLimit = 20,
}: any = {}) {
  const depth = defaultDepth === null
    ? null
    : normalizeDepth(options.depth ?? defaultDepth, allowedDepths);
  return {
    depth,
    limit: positiveInteger(options.limit ?? defaultLimit, "limit"),
    include: normalizeInclude(options.include),
    show_empty: Boolean(options.showEmpty ?? options.show_empty),
  };
}

export function readControlFilterFields(controls) {
  const fields: any = {
    limit: controls.limit,
  };
  if (controls.depth) fields.depth = controls.depth;
  if (controls.include.length > 0) fields.include = controls.include;
  if (controls.show_empty) fields.show_empty = true;
  return fields;
}

export function wantsField(controls, field) {
  return controls.include.includes("*") || controls.include.includes(field);
}

export function maybeSet(target, key, value, controls, includeFields = [key]) {
  if (shouldEmit(value) || controls.show_empty || includeFields.some((field) => wantsField(controls, field))) {
    target[key] = value;
  }
}

export function setIncluded(target, key, value, controls, includeFields = [key]) {
  if (includeFields.some((field) => wantsField(controls, field))) {
    target[key] = value;
  }
}

export function setOmittedCount(target, key, value, controls) {
  if (value > 0 || controls.show_empty || wantsField(controls, key)) {
    target[key] = value;
  }
}

export function limitItems(items, limit) {
  const visible = items.slice(0, limit);
  return {
    items: visible,
    omitted: Math.max(0, items.length - visible.length),
  };
}

export function withoutZeroBuckets(counts, controls) {
  if (controls.show_empty || wantsField(controls, "by_status") || wantsField(controls, "counts")) return counts;
  return Object.fromEntries(Object.entries(counts).filter(([, value]) => value !== 0));
}

function normalizeDepth(depth, allowedDepths) {
  if (!allowedDepths || allowedDepths.length === 0) return depth;
  if (!allowedDepths.includes(depth)) {
    throw new Error(`depth must be ${allowedDepths.join(", ")}; got ${depth || "<missing>"}`);
  }
  return depth;
}

function normalizeInclude(value) {
  if (value === undefined || value === null || value === "") return [];
  return String(value)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function positiveInteger(value, label) {
  const number = Number(value);
  if (!Number.isInteger(number) || number < 1) {
    throw new Error(`${label} must be a positive integer; got ${value ?? "<missing>"}`);
  }
  return number;
}

function shouldEmit(value) {
  if (value === null || value === undefined) return false;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === "object") return Object.keys(value).length > 0;
  return true;
}
