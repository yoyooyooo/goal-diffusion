![](https://github.com/yoyooyooo/ai-coding-os/raw/main/assets/banner.png)

**English** | [中文](README.zh-CN.md)

# AI Coding OS

AI Coding OS is a methodology and skill suite for highly capable coding agents.
It assumes models will keep improving, so the system should give agents clear
boundaries, routing, verification paths, and claim standards instead of locking
them into defensive process tables.

The default application boundary is a workspace: a repo, product surface, docs
set, and goal flow. The method applies to MVPs, features, migrations,
refactors, debugging campaigns, audits, research, documentation governance, and
tooling.

The default entry is `$ai-coding-os`. It owns no durable artifacts. It
routes work to Goal Proof System, Docs Governance, Interface Capability
Planning, Product Harness System, UI Product Harness, Headless Product Harness,
or inline execution.

## Core Principles

```text
high-capability agent first
goal and boundary explicit
proof path runnable
evidence supports claim
gaps remain visible
```

This is not a formal proof system. It is an optimistic workflow for strong
agents, with strict honesty around evidence, non-claims, stop signals, and
completion claims.

## Skill Suite

| Group | Skill | Role |
| --- | --- | --- |
| `router/` | `ai-coding-os` | Default user entry; routes intent and chooses inline vs durable method |
| `goal/` | `goal-proof` | Goal Packs, goal contracts, proof steps, evidence chain, completion review |
| `goal/` | `goal-contracts` | Create or repair `goal.yaml` |
| `goal/` | `finding-proof-step` | Find the next falsifiable `proof_step` |
| `goal/` | `proof-step-implementation` | Execute, verify, add evidence, apply progress |
| `goal/` | `write-work-plans` | Write `plans/<work_id>.md` for high-risk work items |
| `governance/` | `docs-governance` | Docs layers, SSoT, standards, ADRs, roadmaps, cleanup, audit |
| `capability/` | `interface-capability-planning` | UI/IA capability contracts, surfaces, state/data ownership, harness handoff |
| `harness/` | `product-harness-system` | Harness artifact model, claim limits, coverage matrix, trace lifecycle |
| `harness/` | `ui-product-harness` | Interface-headless, render wiring, browser-visible, production-near UI proof |
| `harness/` | `headless-product-harness` | Proof commands, smoke checks, fixture/replay, evidence envelope |

Most users should name only `$ai-coding-os`. Advanced users may call a
specific method or phase skill directly.

## Diffusion Analogy

Goal Diffusion remains a metaphor only: a coarse target becomes sharper through
smaller verified states.

```text
coarse goal -> proof step -> evidenced state change -> sharper next action
```

The formal method name is Goal Proof System. The formal CLI is `goal-proof`.

## Core Vocabulary

| Term | Meaning |
| --- | --- |
| Goal Pack | Durable completion unit for one long-running goal |
| Goal Contract | `goal.yaml`; goal authorization, boundaries, completion criteria, claim limit |
| Proof Step | `progress.yaml.proof_step`; current falsifiable movement from state A to state B |
| Proof Path | Runnable or inspectable path that can support or falsify the proof step |
| Work Item | Bounded unit inside `progress.yaml.work_items`, usually `W###` |
| Evidence Record | Append-only JSONL entry in `evidence.jsonl`, usually `E###` |
| Completion Review | Final review evidence that maps evidence back to `completion.required_evidence` |
| Claim Limit | What the current goal or proof may and may not claim |
| Gap | Uncovered claim area, missing evidence, unresolved decision, or human-intervention point |
| Goal Thread | Shared `relations.thread_id` label across related Goal Packs |
| Goal Relation | Typed metadata link from one Goal Pack to another |
| Derived Graph View | CLI-rendered view from relations; not stored planning state |

## Goal Proof System

Goal Proof System is the long-running goal carrier for AI Coding OS.

```text
human intent
  -> goal.yaml
  -> progress.yaml proof_step
  -> work item
  -> checks
  -> evidence.jsonl evidence record
  -> apply progress
  -> proof_step | continue | needs_plan | blocked | review | done | needs_human
```

A Goal Pack is ready when the goal contract is stable and the next
`proof_step` can prove or falsify a meaningful movement. It is not ready merely
because a work item list exists.

Use `plans/<work_id>.md` only when a selected work item is high risk and needs a
reviewed execution plan before implementation. It is not a second task system.

Completion requires a review evidence record with `completion_satisfied: true`
and `claim_evidence` mapping each completion claim to evidence.

## Goal Pack Files

```text
docs/goal-proof/
  README.md
  inbox/
  sources/
  goals/<goal-id>/
    goal.yaml
    progress.yaml
    evidence.jsonl
    plans/<work_id>.md  # only when needs_plan
    interface-capabilities.yaml  # optional UI/interface trace companion
    product-harness.yaml  # optional harness proof companion
    notes/
```

`goal.yaml` owns objective, authority refs, engineering guidance, completion,
claim limit, stop rules, and agent authority. `progress.yaml` owns runtime
state, active work item, proof step, blockers, last check, and next action.
`evidence.jsonl` is append-only evidence. `notes/` stores long context only.

## Interface Capability And Harness

UI and harness skills let agents validate product capability from both
directions:

```text
Product Capability
  -> InterfaceCapability
  -> InterfaceSurface / Region
  -> Interaction State Contract
  -> Frontend State/Data Ownership
  -> Harness Scenario
  -> Headless Proof and/or UI Proof
  -> Evidence
  -> Claim / Gap
```

When the final UI is not fixed, agents can still use harness routes, harness
components, interface-headless tests, or browser-visible candidate paths to
prove local behavior. When the production interface stabilizes, reusable proof
paths can become regression coverage.

Durable placement:

- Workspace interface trace: `docs/interface-capabilities/**`
- Workspace harness contract: `docs/product-harness/**`
- Goal-local interface companion: `docs/goal-proof/goals/<goal-id>/interface-capabilities.yaml`
- Goal-local harness companion: `docs/goal-proof/goals/<goal-id>/product-harness.yaml`

## Install

Install the CLI:

```bash
npm install -g goal-proof
goal-proof --help
```

Install all AI Coding OS skills:

```bash
npx skills add https://github.com/yoyooyooo/ai-coding-os -g --agent '*' --skill '*' --full-depth -y
```

Codex-only:

```bash
npx skills add https://github.com/yoyooyooo/ai-coding-os -g --agent codex --skill '*' --full-depth -y
```

The repository and skill suite name is AI Coding OS. The CLI and npm package
remain `goal-proof`.

## Use

Normal workspace work:

```text
Use $ai-coding-os:
I want to govern / plan / implement / audit ...
Context: ...
Boundaries: ...
Acceptance: ...
```

Long-running goal:

```text
Use $goal-proof:
Goal: ...
Context: ...
Boundaries: ...
Acceptance: ...
Stop conditions: ...
```

UI capability planning:

```text
Use $interface-capability-planning:
Split product intent into InterfaceCapability, surface, interaction state,
frontend state/data ownership, and harness needs.
```

UI proof:

```text
Use $ui-product-harness:
Plan interface-headless, render wiring, browser-visible proof, evidence, gaps,
and claim limits for this InterfaceCapability.
```

Headless proof:

```text
Use $headless-product-harness:
Design the smallest proof command, fixture/replay path, evidence envelope, and
not_claimed list for this capability.
```

Docs governance:

```text
Use $docs-governance:
Check docs layers, authority placement, README routes, obsolete planning docs,
and audit.
```

This repository's docs layer rules live in `docs/standards/docs-governance.md`;
skill SSoT / runtime distribution rules live in
`docs/standards/skill-source-distribution.md`.

## CLI Quick Inspect

```bash
goal-proof summary .
goal-proof list . --completion todo
goal-proof inspect <goal-pack> --json
goal-proof work list <goal-pack>
goal-proof evidence list <goal-pack> --limit 5
goal-proof relations goals . --thread <thread-id> --completion todo --json
goal-proof relations work . --thread <thread-id> --completion todo --json
goal-proof relations check . --thread <thread-id>
goal-proof relations graph . --thread <thread-id>
goal-proof work brief <goal-pack>
goal-proof check <goal-pack>
```

Relations commands inspect cross-pack continuity and discover thread-member
candidates. They do not create a queue, worklist, scheduler, thread lifecycle,
stored graph, or execution order. `relations.thread_id` is a label only.

## CLI Reference

```bash
goal-proof --help
goal-proof <command> --help
goal-proof inspect <goal-pack> [--json]
goal-proof summary [project-root|goals-dir] [--completion all|todo|done] [--status <status>] [--depth repo|groups|items] [--limit N] [--include fields] [--show-empty] [--json]
goal-proof list [project-root|goals-dir] [--completion all|todo|done] [--status <status>] [--limit N] [--include fields] [--show-empty] [--json]
goal-proof work list <goal-pack> [--completion all|todo|done] [--status queued|active|blocked|done] [--limit N] [--include fields] [--show-empty] [--json]
goal-proof work brief <goal-pack> [--work <id>] [--json]
goal-proof work activate <goal-pack> --work <id> [--dry-run]
goal-proof evidence list <goal-pack> [--limit N] [--work <id>] [--type discovery|decision|implementation|coordination|review|planning] [--result done|blocked] [--decision <value>] [--next-action proof_step|continue|needs_plan|blocked|review|done|needs_human] [--completion-satisfied true|false] [--changed-file <glob>] [--command-status pass|fail] [--contains <text>] [--include fields] [--show-empty] [--json]
goal-proof evidence show <goal-pack> --index N [--json]
goal-proof evidence add <goal-pack> (--file evidence-record.json | --json '<json>' | --stdin) [--apply] [--check]
goal-proof relations list [project-root|goals-dir] [--thread <id>] [--limit N] [--include fields] [--show-empty] [--json]
goal-proof relations goals [project-root|goals-dir] [--thread <id>] [--completion all|todo|done] [--status forming|ready|running|blocked|done|retired] [--next-action proof_step|continue|needs_plan|blocked|review|done|needs_human] [--limit N] [--include fields] [--show-empty] [--json]
goal-proof relations work [project-root|goals-dir] [--thread <id>] [--completion all|todo|done] [--status queued|active|blocked|done] [--goal-completion all|todo|done] [--goal-status forming|ready|running|blocked|done|retired] [--goal <goal-id>] [--limit N] [--include fields] [--show-empty] [--json]
goal-proof relations check [project-root|goals-dir] [--thread <id>] [--json]
goal-proof relations graph [project-root|goals-dir] [--thread <id>] [--json]
goal-proof apply <goal-pack> [--dry-run]
goal-proof check <goal-pack>
```

Typical loop:

```text
check -> inspect -> work brief -> work -> evidence add -> apply -> check
```

Use a bare goal id when running inside a project with
`docs/goal-proof/goals/<goal-id>`, or pass the goal folder.

## Repository Layout

```text
packages/cli/                         TypeScript CLI, built with Bun
skills/router/                        OS entry and user intent routing
skills/goal/                          Goal Pack method and execution phases
skills/governance/                    Docs layer governance
skills/capability/                    Interface capability planning
skills/harness/                       Product, headless, and UI harness guidance
skills/README.md                      Skill suite group index
docs/                                 Workspace documentation and Goal Pack examples
assets/                               README media
```

## Release

Publishing is tag-driven through GitHub Actions and npm Trusted Publishing.

```bash
bun run release:check patch
bun run release patch
# or
bun run release 0.2.0
```

`bun run release:check` validates release readiness without changing files.
`bun run release` creates a temporary local release branch, updates package
versions, commits, tags `vX.Y.Z`, pushes only the tag, then returns to the
original branch. GitHub Actions publishes the npm package from the tag.

The npm tarball contains only `dist/`, `README.md`, `README.zh-CN.md`,
`LICENSE`, and package metadata.

## Development

```bash
bun install
bun run build
bun run typecheck
bun run test
bun run check
```

The CLI source is TypeScript. `bun build` emits npm package artifacts under
`packages/cli/dist/`.

## License

MIT
