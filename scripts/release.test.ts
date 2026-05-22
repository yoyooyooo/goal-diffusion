import { copyFileSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { test } from "bun:test";
import assert from "node:assert/strict";

type RunResult = {
  status: number | null;
  stdout: string;
  stderr: string;
};

const releaseScript = resolve("scripts/release.ts");

function makeReleaseRepo(branch = "main"): string {
  const root = mkdtempSync(join(tmpdir(), "release-test-"));
  mkdirSync(join(root, ".github"), { recursive: true });
  mkdirSync(join(root, "scripts"), { recursive: true });
  mkdirSync(join(root, "packages/cli"), { recursive: true });
  copyFileSync(releaseScript, join(root, "scripts/release.ts"));
  writeFileSync(join(root, "package.json"), `${JSON.stringify({ version: "1.2.3" }, null, 2)}\n`);
  writeFileSync(join(root, "packages/cli/package.json"), `${JSON.stringify({ version: "1.2.3" }, null, 2)}\n`);
  writeFileSync(join(root, ".github/release.config.json"), `${JSON.stringify({
    defaultBranch: "main",
    remote: "origin",
    tagPrefix: "v",
    versionFiles: ["package.json", "packages/cli/package.json"],
    lockfiles: [],
    lockfileCommand: null,
    localCheckCommand: null,
    commitMessage: "chore: release {tag}",
    publishMode: "none",
    publishPackage: null,
    publishRegistry: "https://registry.npmjs.org",
    reuseFailedVersion: true,
    releaseBranchPrefix: "release/",
  }, null, 2)}\n`);
  git(root, ["init"]);
  git(root, ["checkout", "-B", branch]);
  git(root, ["config", "user.name", "Release Test"]);
  git(root, ["config", "user.email", "release-test@example.com"]);
  git(root, ["add", "."]);
  git(root, ["commit", "-m", "init"]);
  return root;
}

function git(cwd: string, args: string[]): void {
  const result = spawnSync("git", args, { cwd, encoding: "utf8" });
  assert.equal(result.status, 0, result.stderr || result.stdout);
}

function runRelease(cwd: string, args: string[]): RunResult {
  const result = spawnSync(process.execPath, [join(cwd, "scripts/release.ts"), ...args], {
    cwd,
    encoding: "utf8",
  });
  return {
    status: result.status,
    stdout: result.stdout,
    stderr: result.stderr,
  };
}

test("release precheck validates git readiness without mutating files or tags", () => {
  const root = makeReleaseRepo();
  try {
    const beforeRootPackage = readFileSync(join(root, "package.json"), "utf8");
    const beforeCliPackage = readFileSync(join(root, "packages/cli/package.json"), "utf8");

    const result = runRelease(root, ["patch", "--precheck", "--no-push"]);

    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, /Release precheck:/);
    assert.match(result.stdout, /tag: v1\.2\.4/);
    assert.match(result.stdout, /main commit: no/);
    assert.equal(readFileSync(join(root, "package.json"), "utf8"), beforeRootPackage);
    assert.equal(readFileSync(join(root, "packages/cli/package.json"), "utf8"), beforeCliPackage);

    const tags = spawnSync("git", ["tag", "--list"], { cwd: root, encoding: "utf8" });
    assert.equal(tags.status, 0, tags.stderr);
    assert.equal(tags.stdout.trim(), "");
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("release no-push tags a temporary release commit without mutating main", () => {
  const root = makeReleaseRepo();
  try {
    const beforeRootPackage = readFileSync(join(root, "package.json"), "utf8");
    const beforeCliPackage = readFileSync(join(root, "packages/cli/package.json"), "utf8");

    const result = runRelease(root, ["patch", "--no-push"]);

    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, /v1\.2\.4 created locally\. No tag was pushed\./);
    assert.equal(readFileSync(join(root, "package.json"), "utf8"), beforeRootPackage);
    assert.equal(readFileSync(join(root, "packages/cli/package.json"), "utf8"), beforeCliPackage);

    const branch = spawnSync("git", ["branch", "--show-current"], { cwd: root, encoding: "utf8" });
    assert.equal(branch.stdout.trim(), "main");

    const tagVersion = spawnSync("git", ["show", "v1.2.4:package.json"], { cwd: root, encoding: "utf8" });
    assert.equal(tagVersion.status, 0, tagVersion.stderr);
    assert.equal(JSON.parse(tagVersion.stdout).version, "1.2.4");
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("release precheck reuses failed tag versions that are not published", () => {
  const root = makeReleaseRepo();
  try {
    git(root, ["tag", "-a", "v1.2.4", "-m", "v1.2.4"]);

    const result = runRelease(root, ["patch", "--precheck", "--no-push"]);

    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, /next: 1\.2\.4/);
    assert.match(result.stdout, /reuse failed release tag v1\.2\.4/);
    assert.match(result.stdout, /replace failed tag: yes/);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("release precheck refuses non-main branches by default", () => {
  const root = makeReleaseRepo("feature/release");
  try {
    const result = runRelease(root, ["patch", "--precheck", "--no-push"]);

    assert.equal(result.status, 1);
    assert.match(result.stderr, /Release must run on main\. Current branch: feature\/release\./);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
