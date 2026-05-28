# Frozen Plan: Relations Thread Discovery CLI

## Decision

`relations` is a broad candidate-discovery surface. It must help agents find
thread-member Goal Packs and work items quickly, then leave deeper implementation
context to `inspect`, `work list`, `evidence list`, and `work brief`.

Do not add queue or worklist semantics. A `thread_id` is only a label, and
relation links are evidence metadata, not execution order.

## Keep Existing Semantics

```bash
goal-proof relations list [target] [--thread <id>] [--json]
goal-proof relations check [target] [--thread <id>] [--json]
goal-proof relations graph [target] [--thread <id>] [--json]
```

- `list` shows relation metadata.
- `check` validates relation evidence.
- `graph` renders a derived relation graph, not execution order.

## Add Discovery Commands

```bash
goal-proof relations goals [target] \
  [--thread <id>] \
  [--completion all|todo|done] \
  [--status forming|ready|running|blocked|done|retired] \
  [--next-action proof_step|continue|needs_plan|blocked|review|done|needs_human] \
  [--json]
```

```bash
goal-proof relations work [target] \
  [--thread <id>] \
  [--completion all|todo|done] \
  [--status queued|active|blocked|done] \
  [--goal-completion all|todo|done] \
  [--goal-status forming|ready|running|blocked|done|retired] \
  [--goal <goal-id>] \
  [--json]
```

## Filter Rules

- `--thread` selects member goals by `relations.thread_id`.
- `relations goals --completion todo` means goal status is neither `done` nor
  `retired`.
- `relations work --completion todo` means work item status is not `done`.
- `relations work --status` always filters work item status.
- `relations work --goal-status` filters parent Goal Pack status.
- `relations work --goal-completion` filters parent Goal Pack completion.
- `relations work --goal` filters by parent `goal_id`.
- All filters compose with AND semantics.

## Non-Commands

Do not add:

```bash
goal-proof relations queue
goal-proof relations worklist
goal-proof thread ...
goal-proof threads ...
```

Do not add output fields named or equivalent to:

```text
priority
rank
order_confidence
execution_order
queue_position
```

## Agent Usage

Use discovery first:

```bash
goal-proof relations goals . --thread <thread-id> --completion todo --json
goal-proof relations work . --thread <thread-id> --completion todo --json
```

Then inspect the selected Goal Pack or work item:

```bash
goal-proof inspect <goal-id> --json
goal-proof work list <goal-id> --completion todo --json
goal-proof evidence list <goal-id> --limit 5 --json
goal-proof work brief <goal-id> --work <work-id> --json
```
