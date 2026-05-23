# Frozen Plan: Relations Thread Discovery CLI

## Decision

`relations` is a broad candidate-discovery surface. It must help agents find
thread-member Goal Packs and tasks quickly, then leave deeper implementation
context to `inspect`, `tasks`, `receipts`, and `brief`.

Do not add queue or worklist semantics. A `thread_id` is only a label, and
relation links are evidence metadata, not execution order.

## Keep Existing Semantics

```bash
goal-diffusion relations list [target] [--thread <id>] [--json]
goal-diffusion relations check [target] [--thread <id>] [--json]
goal-diffusion relations graph [target] [--thread <id>] [--json]
```

- `list` shows relation metadata.
- `check` validates relation evidence.
- `graph` renders a derived relation graph, not execution order.

## Add Discovery Commands

```bash
goal-diffusion relations goals [target] \
  [--thread <id>] \
  [--completion all|todo|done] \
  [--status forming|ready|running|blocked|done|retired] \
  [--next-decision edge|continue|plan_required|blocked|audit|done|needs-human] \
  [--json]
```

```bash
goal-diffusion relations tasks [target] \
  [--thread <id>] \
  [--completion all|todo|done] \
  [--status queued|active|blocked|done] \
  [--goal-completion all|todo|done] \
  [--goal-status forming|ready|running|blocked|done|retired] \
  [--goal <goal-id>] \
  [--json]
```

## Filter Rules

- `--thread` selects member goals by `goal_relations.thread_id`.
- `relations goals --completion todo` means goal status is neither `done` nor
  `retired`.
- `relations tasks --completion todo` means task status is not `done`.
- `relations tasks --status` always filters task status.
- `relations tasks --goal-status` filters parent Goal Pack status.
- `relations tasks --goal-completion` filters parent Goal Pack completion.
- `relations tasks --goal` filters by parent `goal_id`.
- All filters compose with AND semantics.

## Non-Commands

Do not add:

```bash
goal-diffusion relations queue
goal-diffusion relations worklist
goal-diffusion thread ...
goal-diffusion threads ...
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
goal-diffusion relations goals . --thread <thread-id> --completion todo --json
goal-diffusion relations tasks . --thread <thread-id> --completion todo --json
```

Then inspect the selected Goal Pack or task:

```bash
goal-diffusion inspect <goal-id> --json
goal-diffusion tasks <goal-id> --completion todo --json
goal-diffusion receipts list <goal-id> --limit 5 --json
goal-diffusion brief <goal-id> --task <task-id> --json
```
