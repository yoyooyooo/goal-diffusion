# Artifact Graph

This reference defines a lightweight, agent-first graph inventory layer for
docs artifacts. It is useful when a repository has many candidate, source,
Goal Proof System, report, spec, or roadmap nodes and agents need a small current
view without reading the whole corpus.

## Doctrine

```text
human writes intent
agent maintains artifacts
YAML frontmatter is graph metadata
scripts generate views
human only resolves ambiguous edges
```

Do not maintain a large hand-written graph document. Store judged node facts in
artifact frontmatter, then use scripts for inventory, current view, readiness
and graph hygiene.

## Minimal Frontmatter

Only three fields are always required for a graph node:

```yaml
---
node_id: web-channel-projection-verification
artifact_type: goal
status: open-candidate
---
```

Do not add empty optional fields. Missing optional fields mean empty.

Frontmatter is graph metadata. Keep keys and status values stable even when the
host repo requires a different narrative language for body prose.

Allowed `artifact_type` values are intentionally broad and backward-compatible:

```text
seed proposal source brief goal plan report roadmap
```

When a project uses `$goal-proof`, the meaning and lifecycle of Goal
Proof-specific types are owned by that skill. This graph only indexes
declared metadata and links.

Allowed `status` values:

```text
weak-signal open-candidate bridge-needed ready active completed blocked retired
```

## Optional Fields

Add only when semantically judged from the artifact and current planning state:

```yaml
depends_on:
  - post-batch-evaluation
blocks:
  - remote-relay-production-readiness
unblocks:
  - trusted-team-relay-access-policy
bridges_to:
  - runtime-materialization-hardening
related_to:
  - cli-surface-taxonomy
supersedes:
  - old-node-id
source_material:
  - ../sources/source-id.md
evidence:
  - ../reports/report-id.md
objective: concise objective, for ready/active goals
claim_limit: what evidence may prove
evidence_contract: commands or evidence bar
next_action: nearest unresolved decision
```

Do not auto-infer hard edges from prose. If unsure, use `related_to` or leave
the relation absent until a human or higher-authority artifact resolves it.

Do not add review-cluster metadata to artifact frontmatter. Clusters are
sweep/report output, not graph metadata. When a review discovers durable
relations, encode only the judged relation:

- duplicate / absorbed material -> `supersedes` or `source_material`;
- loose horizontal relation -> `related_to`;
- hard prerequisite -> `depends_on`;
- blocker -> `blocks`;
- docs-layer bridge -> `bridges_to`.

## Node Identity

`node_id` must be unique across scanned roots. Reports and sources often need a
prefix to avoid colliding with the goal or brief they explain:

```text
report-2026-05-16-channel-stream-realtime-kernel
source-manual-channel-candidate-intake
```

Do not reuse the same `node_id` for a source and the brief created from that
source. Link them with `source_material` or `related_to`.

## Script

Use:

```bash
python3 scripts/artifact_graph.py scan
python3 scripts/artifact_graph.py audit
python3 scripts/artifact_graph.py consistency
python3 scripts/artifact_graph.py current --anchor <node_id>
python3 scripts/artifact_graph.py node <node_id>
python3 scripts/artifact_graph.py blockers <node_id>
python3 scripts/artifact_graph.py unblock-review <node_id>
python3 scripts/artifact_graph.py status-impact --node <node_id> --to <status>
python3 scripts/artifact_graph.py ready
python3 scripts/artifact_graph.py orphans
python3 scripts/artifact_graph.py review-list
python3 scripts/artifact_graph.py queue-consistency --queue <path/to/queue.md>
python3 scripts/artifact_graph.py mermaid --anchor <node_id> --depth 2
```

Defaults:

- `--repo` resolves from the current working directory to the nearest project
  root; do not infer the project from the skill directory.
- scanned roots default to `docs/goal-proof` and `docs/roadmap`;
- only Markdown files with `node_id` frontmatter become graph nodes;
- read commands output stdout JSON and write no files.

## Consistency Checks

Use the graph script as an agent linkage checker, not as an automatic planning
state machine.

```bash
python3 scripts/artifact_graph.py consistency
python3 scripts/artifact_graph.py queue-consistency --queue <path/to/queue.md>
python3 scripts/artifact_graph.py status-impact --node <node_id> --to completed
python3 scripts/artifact_graph.py unblock-review <node_id>
```

These commands look for metadata review candidates:

- ready / active nodes with unresolved dependencies or blockers;
- blocked nodes whose blockers appear resolved;
- completed nodes without evidence;
- missing evidence or source paths;
- explicitly supplied queue items whose queue state conflicts with graph state;
- prompt plan paths that do not exist or are not graph nodes;
- obvious frontmatter / prose drift such as `status=ready` with blocked wording.

Findings are advisory unless marked `blocker`. A `review-for-ready` suggestion
does not mean the script has proven readiness.

## Write Helpers

Write helpers exist only for mechanically certain metadata edits explicitly
provided by the agent or user:

```bash
python3 scripts/artifact_graph.py update-node \
  --node <node_id> \
  --status ready \
  --next-action "selected after accepted evidence"

python3 scripts/artifact_graph.py add-evidence \
  --node <node_id> \
  --evidence ../reports/<report>.md

python3 scripts/artifact_graph.py add-relation \
  --node <node_id> \
  --field depends_on \
  --target <target_node_id>

python3 scripts/artifact_graph.py remove-relation \
  --node <node_id> \
  --field related_to \
  --target <target_node_id>
```

Defaults:

- all write helpers are dry-run unless `--write` is passed;
- helpers only edit YAML frontmatter;
- helpers preserve known field order and avoid duplicate list entries;
- `add-evidence` requires the evidence path to exist;
- `add-relation` requires the target node to exist;
- helpers do not infer status, readiness, completion, evidence sufficiency, or
  downstream unblocking.

After any `--write`, run:

```bash
python3 scripts/artifact_graph.py audit
python3 scripts/artifact_graph.py consistency
python3 scripts/artifact_graph.py queue-consistency --queue <path/to/queue.md>
```

## Agent Use

For a new session:

```text
current -> read only focus_nodes/read_next -> inspect selected artifact
```

For a new human idea:

```text
scan/review-list -> decide docs-layer or method placement -> write minimal YAML
```

For Goal Proof System inbox/source/Goal Pack lifecycle:

```text
hand off to $goal-proof
```

For a docs-layer cleanup sweep:

```text
scan/review-list -> read target artifact set -> write report output when useful
-> update only judged graph relations in frontmatter -> audit/consistency
```

Before implementation:

```text
node + blockers + audit
```

If a Goal Proof System artifact is not ready, route to `$goal-proof` instead
of using this graph as a readiness authority.

When writing a new graph artifact, apply the host repo language policy to body
prose. The graph YAML, commands, paths, schema examples, code symbols and prompt
blocks may remain English; narrative sections should use the language required
by `AGENTS.md` or the nearest docs policy.

After execution:

```text
report evidence -> update node status/evidence -> current for next anchor
```

If a report completes a blocker, first run `status-impact` or `unblock-review`
to discover downstream review candidates. Patch or use write helpers only after
the agent has made the semantic judgment.

For multi-goal continuity, keep the graph anchored on the child Goal Packs and
their evidence reports. Goal Proof System relations and completion remain owned by
`$goal-proof`:

```text
for each child goal:
  node + blockers -> execute -> report evidence -> update status/evidence
  -> status-impact / unblock-review for downstream children
```

Do not add `artifact_type: wave` unless the host project has deliberately
extended the graph schema and audit scripts. Use `depends_on`, `blocks`,
`unblocks`, `related_to` and `evidence` only as metadata inventory; do not treat
them as a scheduler or Goal Proof System state.

## Orphans

`orphans` reports only isolated nodes with no incoming or outgoing graph edges.
Single-sided nodes are normal:

- no incoming + outgoing = root/source/candidate;
- incoming + no outgoing = leaf/report/target;
- no incoming + no outgoing = isolated node to review.

Completed reports and retired sources are not treated as orphan problems by
default.

## Limits

The script is not semantic review. It should not claim that mechanical
frontmatter is correct. Use `review-list` to prioritize applied agent passes
that read the artifact, judge lifecycle state, update minimal YAML, and improve
the artifact text when needed.

The script may write only mechanically certain metadata supplied explicitly by
the caller. It must not cascade status changes or promote artifacts by itself.
