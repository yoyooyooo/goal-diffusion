#!/usr/bin/env python3
"""Inspect lightweight artifact graph metadata for agent-first planning.

The script reads Markdown YAML frontmatter with at least:

  node_id:
  artifact_type:
  status:

It does not infer semantic edges from prose. Write commands only perform
explicit, mechanically safe frontmatter edits requested by the caller.
"""

from __future__ import annotations

import argparse
import difflib
import json
import re
import sys
from collections import Counter, defaultdict, deque
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

DEFAULT_ROOTS = ("docs/goal-proof", "docs/roadmap")
SKIP_DIRS = {".git", "node_modules", "dist", "build", "target", ".venv", "venv", "__pycache__"}
NODE_TYPES = {"seed", "proposal", "source", "brief", "goal", "plan", "report", "roadmap"}
STATUSES = {
    "weak-signal",
    "open-candidate",
    "bridge-needed",
    "ready",
    "active",
    "completed",
    "blocked",
    "retired",
}
EDGE_FIELDS = ("depends_on", "blocks", "unblocks", "bridges_to", "related_to", "supersedes")
REFERENCE_FIELDS = ("source_material", "evidence")
FRONTMATTER_RE = re.compile(r"\A---\n(.*?)\n---\n", re.S)
FRONTMATTER_ORDER = (
    "node_id",
    "artifact_type",
    "status",
    "depends_on",
    "blocks",
    "unblocks",
    "bridges_to",
    "related_to",
    "supersedes",
    "source_material",
    "evidence",
    "objective",
    "claim_limit",
    "evidence_contract",
    "next_action",
)
UNRESOLVED_STATUSES = {"weak-signal", "open-candidate", "bridge-needed", "blocked"}
RESOLVED_STATUSES = {"completed", "retired"}
READYISH_STATUSES = {"ready", "active"}
QUEUE_DEFAULT = ""


@dataclass(frozen=True)
class Node:
    node_id: str
    artifact_type: str
    status: str
    path: str
    title: str
    fields: dict[str, Any]


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def repo_root(start: Path) -> Path:
    current = start.resolve()
    if current.is_file():
        current = current.parent
    for candidate in [current, *current.parents]:
        if (candidate / "docs").exists() or (candidate / ".git").exists() or (candidate / "AGENTS.md").exists():
            return candidate
    return current


def read_text(path: Path) -> str:
    return path.read_text(encoding="utf-8", errors="ignore")


def parse_scalar(value: str) -> Any:
    value = value.strip()
    if value == "[]":
        return []
    if value in {"true", "false"}:
        return value == "true"
    if (value.startswith('"') and value.endswith('"')) or (value.startswith("'") and value.endswith("'")):
        return value[1:-1]
    return value


def parse_frontmatter(text: str) -> dict[str, Any] | None:
    match = FRONTMATTER_RE.match(text)
    if not match:
        return None
    fields: dict[str, Any] = {}
    current_key: str | None = None
    for raw_line in match.group(1).splitlines():
        line = raw_line.rstrip()
        if not line.strip() or line.lstrip().startswith("#"):
            continue
        if line.startswith("  - ") and current_key:
            current = fields.setdefault(current_key, [])
            if not isinstance(current, list):
                current = []
                fields[current_key] = current
            current.append(parse_scalar(line[4:]))
            continue
        key_match = re.match(r"^([A-Za-z_][A-Za-z0-9_-]*):(?:\s*(.*))?$", line)
        if not key_match:
            current_key = None
            continue
        key = key_match.group(1)
        rest = key_match.group(2) or ""
        current_key = key
        if rest.strip() == "":
            fields[key] = []
        else:
            fields[key] = parse_scalar(rest)
    return fields


def frontmatter_match(text: str) -> re.Match[str] | None:
    return FRONTMATTER_RE.match(text)


def frontmatter_key_order(frontmatter_text: str) -> list[str]:
    keys: list[str] = []
    for line in frontmatter_text.splitlines():
        match = re.match(r"^([A-Za-z_][A-Za-z0-9_-]*):", line.rstrip())
        if match:
            keys.append(match.group(1))
    return keys


def scalar_to_yaml(value: Any) -> str:
    text = str(value)
    if text == "":
        return '""'
    if "\n" in text:
        raise ValueError("multiline frontmatter values are not supported")
    if text.strip() != text or text.startswith(("{", "}", "[", "]", "#", "-", "!", "&", "*")):
        return json.dumps(text)
    return text


def serialize_frontmatter(fields: dict[str, Any], existing_order: list[str]) -> str:
    ordered: list[str] = []
    for key in FRONTMATTER_ORDER:
        if key in fields and key not in ordered:
            ordered.append(key)
    for key in existing_order:
        if key in fields and key not in ordered:
            ordered.append(key)
    for key in sorted(fields):
        if key not in ordered:
            ordered.append(key)

    lines = ["---"]
    for key in ordered:
        value = fields[key]
        if isinstance(value, list):
            if not value:
                continue
            lines.append(f"{key}:")
            for item in value:
                lines.append(f"  - {scalar_to_yaml(item)}")
        elif value is None:
            continue
        else:
            lines.append(f"{key}: {scalar_to_yaml(value)}")
    lines.append("---")
    return "\n".join(lines) + "\n"


def first_heading(text: str) -> str:
    for line in text.splitlines():
        if line.startswith("# "):
            return line[2:].strip()
    return ""


def as_list(value: Any) -> list[str]:
    if value is None or value == "":
        return []
    if isinstance(value, list):
        return [str(item).strip() for item in value if str(item).strip()]
    return [str(value).strip()]


def severity_summary(findings: list[dict]) -> dict[str, int]:
    counts = Counter(str(item.get("severity", "info")) for item in findings)
    return {
        "findings": len(findings),
        "blocker": counts.get("blocker", 0),
        "warn": counts.get("warn", 0),
        "info": counts.get("info", 0),
    }


def resolve_reference_path(repo: Path, node: Node, ref: str) -> Path:
    ref_path = Path(ref)
    if ref_path.is_absolute():
        return ref_path
    repo_relative = repo / ref_path
    if repo_relative.exists():
        return repo_relative
    return repo / Path(node.path).parent / ref_path


def is_markdown_candidate(path: Path) -> bool:
    if path.suffix.lower() != ".md":
        return False
    return not any(part in SKIP_DIRS for part in path.parts)


def iter_markdown(repo: Path, roots: list[str]) -> list[Path]:
    paths: list[Path] = []
    for rel in roots:
        root = (repo / rel).resolve()
        if not root.exists():
            continue
        if root.is_file() and is_markdown_candidate(root):
            paths.append(root)
        elif root.is_dir():
            paths.extend(sorted(path for path in root.rglob("*.md") if is_markdown_candidate(path)))
    return sorted(set(paths))


def load_nodes(repo: Path, roots: list[str]) -> tuple[list[Node], list[dict]]:
    nodes: list[Node] = []
    findings: list[dict] = []
    for path in iter_markdown(repo, roots):
        text = read_text(path)
        frontmatter = parse_frontmatter(text)
        if not frontmatter or "node_id" not in frontmatter:
            continue
        rel = path.relative_to(repo).as_posix()
        node_id = str(frontmatter.get("node_id", "")).strip()
        artifact_type = str(frontmatter.get("artifact_type", "")).strip()
        status = str(frontmatter.get("status", "")).strip()
        if not node_id:
            findings.append(finding("blocker", "GRAPH_NODE_ID_EMPTY", rel, "frontmatter node_id is empty"))
            continue
        nodes.append(Node(node_id=node_id, artifact_type=artifact_type, status=status, path=rel, title=first_heading(text), fields=frontmatter))
    return nodes, findings


def finding(severity: str, rule_id: str, path: str, summary: str, **extra: Any) -> dict:
    result = {"severity": severity, "ruleId": rule_id, "path": path, "summary": summary}
    result.update(extra)
    return result


def node_maps(nodes: list[Node]) -> tuple[dict[str, Node], dict[str, list[Node]]]:
    by_id: dict[str, Node] = {}
    duplicates: dict[str, list[Node]] = defaultdict(list)
    for node in nodes:
        duplicates[node.node_id].append(node)
        by_id.setdefault(node.node_id, node)
    return by_id, duplicates


def build_edges(nodes: list[Node]) -> list[dict]:
    edges: list[dict] = []
    for node in nodes:
        for field in EDGE_FIELDS:
            for target in as_list(node.fields.get(field)):
                edges.append({"source": node.node_id, "target": target, "relation": field})
    return edges


def incoming_outgoing(edges: list[dict]) -> tuple[dict[str, list[dict]], dict[str, list[dict]]]:
    incoming: dict[str, list[dict]] = defaultdict(list)
    outgoing: dict[str, list[dict]] = defaultdict(list)
    for edge in edges:
        outgoing[edge["source"]].append(edge)
        incoming[edge["target"]].append(edge)
    return incoming, outgoing


def audit_findings(nodes: list[Node], edges: list[dict], base_findings: list[dict]) -> list[dict]:
    findings = list(base_findings)
    by_id, duplicates = node_maps(nodes)
    for node_id, items in sorted(duplicates.items()):
        if len(items) > 1:
            findings.append(
                finding(
                    "blocker",
                    "GRAPH_DUPLICATE_NODE_ID",
                    ", ".join(item.path for item in items),
                    f"duplicate node_id: {node_id}",
                    node_id=node_id,
                )
            )
    for node in nodes:
        if node.artifact_type not in NODE_TYPES:
            findings.append(finding("warn", "GRAPH_UNKNOWN_ARTIFACT_TYPE", node.path, f"unknown artifact_type: {node.artifact_type}", node_id=node.node_id))
        if node.status not in STATUSES:
            findings.append(finding("warn", "GRAPH_UNKNOWN_STATUS", node.path, f"unknown status: {node.status}", node_id=node.node_id))
        if node.artifact_type == "goal" and node.status in {"ready", "active"}:
            for required in ("objective", "claim_limit", "evidence_contract"):
                if required not in node.fields:
                    findings.append(finding("info", "GRAPH_GOAL_READY_FIELD_MISSING", node.path, f"goal {node.status} is missing optional readiness field: {required}", node_id=node.node_id))
        if node.status == "completed" and not as_list(node.fields.get("evidence")) and node.artifact_type != "report":
            findings.append(finding("warn", "GRAPH_COMPLETED_WITHOUT_EVIDENCE", node.path, "completed node has no evidence reference", node_id=node.node_id))
        if node.status == "bridge-needed" and not (as_list(node.fields.get("bridges_to")) or as_list(node.fields.get("next_action"))):
            findings.append(finding("warn", "GRAPH_BRIDGE_WITHOUT_TARGET", node.path, "bridge-needed node has no bridges_to or next_action", node_id=node.node_id))
    for edge in edges:
        if edge["target"] not in by_id:
            findings.append(
                finding(
                    "warn",
                    "GRAPH_DANGLING_EDGE",
                    by_id.get(edge["source"], Node("", "", "", "", "", {})).path,
                    f"{edge['relation']} points to missing node_id: {edge['target']}",
                    source=edge["source"],
                    target=edge["target"],
                    relation=edge["relation"],
                )
            )
    return findings


def node_blocker_ids(node: Node, incoming: dict[str, list[dict]], outgoing: dict[str, list[dict]]) -> list[str]:
    depends_on = [edge["target"] for edge in outgoing.get(node.node_id, []) if edge["relation"] == "depends_on"]
    blocked_by = [edge["source"] for edge in incoming.get(node.node_id, []) if edge["relation"] == "blocks"]
    ordered: list[str] = []
    seen: set[str] = set()
    for node_id in [*depends_on, *blocked_by]:
        if node_id not in seen:
            seen.add(node_id)
            ordered.append(node_id)
    return ordered


def unresolved_blockers(node: Node, by_id: dict[str, Node], incoming: dict[str, list[dict]], outgoing: dict[str, list[dict]]) -> list[Node]:
    result: list[Node] = []
    for node_id in node_blocker_ids(node, incoming, outgoing):
        blocker = by_id.get(node_id)
        if blocker and blocker.status not in RESOLVED_STATUSES:
            result.append(blocker)
    return result


def text_drift_findings(repo: Path, node: Node) -> list[dict]:
    text = read_text(repo / node.path).lower()
    findings: list[dict] = []
    if node.status == "ready":
        for pattern in ("not implementation-ready", "state: blocked", "blocked until", " is blocked"):
            if pattern in text:
                findings.append(
                    finding(
                        "info",
                        "GRAPH_READY_TEXT_DRIFT_REVIEW",
                        node.path,
                        f"frontmatter status=ready but text contains '{pattern}'",
                        node_id=node.node_id,
                        suggested_action="review whether status or readiness prose is stale",
                    )
                )
                break
    if node.status == "blocked":
        for pattern in ("state: executable", "ready to launch", "status: current"):
            if pattern in text:
                findings.append(
                    finding(
                        "info",
                        "GRAPH_BLOCKED_TEXT_DRIFT_REVIEW",
                        node.path,
                        f"frontmatter status=blocked but text contains '{pattern}'",
                        node_id=node.node_id,
                        suggested_action="review whether status or launch prose is stale",
                    )
                )
                break
    return findings


def consistency_findings(repo: Path, nodes: list[Node], edges: list[dict]) -> list[dict]:
    by_id, _ = node_maps(nodes)
    incoming, outgoing = incoming_outgoing(edges)
    findings: list[dict] = []

    for node in nodes:
        for field in REFERENCE_FIELDS:
            for ref in as_list(node.fields.get(field)):
                if not resolve_reference_path(repo, node, ref).exists():
                    findings.append(
                        finding(
                            "warn",
                            "GRAPH_REFERENCE_PATH_MISSING",
                            node.path,
                            f"{field} path does not exist: {ref}",
                            node_id=node.node_id,
                            reference=ref,
                        )
                    )

        blockers = unresolved_blockers(node, by_id, incoming, outgoing)
        if node.status in READYISH_STATUSES and blockers:
            findings.append(
                finding(
                    "info",
                    "GRAPH_READY_WITH_UNRESOLVED_BLOCKERS_REVIEW",
                    node.path,
                    "ready/active node has unresolved blockers or dependencies",
                    node_id=node.node_id,
                    blockers=[blocker.node_id for blocker in blockers],
                    suggested_action="review whether status is premature or dependency is only context",
                )
            )
        if node.status == "blocked" and node_blocker_ids(node, incoming, outgoing) and not blockers:
            findings.append(
                finding(
                    "info",
                    "GRAPH_BLOCKED_WITH_RESOLVED_BLOCKERS_REVIEW",
                    node.path,
                    "blocked node has no unresolved blockers",
                    node_id=node.node_id,
                    suggested_action="review whether node can move to ready or needs a new blocker",
                )
            )
        if node.status == "completed" and node.artifact_type not in {"report", "source"} and not as_list(node.fields.get("evidence")):
            findings.append(
                finding(
                    "warn",
                    "GRAPH_COMPLETED_WITHOUT_EVIDENCE_REVIEW",
                    node.path,
                    "completed non-report/source node has no evidence reference",
                    node_id=node.node_id,
                )
            )
        findings.extend(text_drift_findings(repo, node))

    return findings


def graph_report(repo: Path, roots: list[str]) -> dict:
    nodes, base_findings = load_nodes(repo, roots)
    edges = build_edges(nodes)
    findings = audit_findings(nodes, edges, base_findings)
    status_counts = Counter(node.status for node in nodes)
    type_counts = Counter(node.artifact_type for node in nodes)
    severity_counts = Counter(item["severity"] for item in findings)
    return {
        "version": "v1",
        "scannedAt": now_iso(),
        "repoRoot": str(repo),
        "roots": roots,
        "summary": {
            "nodes": len(nodes),
            "edges": len(edges),
            "findings": len(findings),
            "blocker": severity_counts.get("blocker", 0),
            "warn": severity_counts.get("warn", 0),
            "info": severity_counts.get("info", 0),
            "statusCounts": dict(sorted(status_counts.items())),
            "typeCounts": dict(sorted(type_counts.items())),
        },
        "nodes": [node_to_dict(node) for node in nodes],
        "edges": edges,
        "findings": findings,
    }


def node_to_dict(node: Node) -> dict:
    return {
        "node_id": node.node_id,
        "artifact_type": node.artifact_type,
        "status": node.status,
        "path": node.path,
        "title": node.title,
        "relations": {field: as_list(node.fields.get(field)) for field in EDGE_FIELDS if as_list(node.fields.get(field))},
        "references": {field: as_list(node.fields.get(field)) for field in REFERENCE_FIELDS if as_list(node.fields.get(field))},
        "next_action": node.fields.get("next_action", ""),
    }


def load_graph(repo: Path, roots: list[str]) -> tuple[list[Node], list[dict], list[dict]]:
    nodes, base_findings = load_nodes(repo, roots)
    edges = build_edges(nodes)
    return nodes, edges, base_findings


def neighborhood(nodes: list[Node], edges: list[dict], anchor: str, depth: int, limit: int) -> tuple[list[Node], list[dict]]:
    by_id, _ = node_maps(nodes)
    if anchor not in by_id:
        return [], []
    adjacency: dict[str, set[str]] = defaultdict(set)
    for edge in edges:
        adjacency[edge["source"]].add(edge["target"])
        adjacency[edge["target"]].add(edge["source"])
    seen = {anchor}
    queue: deque[tuple[str, int]] = deque([(anchor, 0)])
    ordered = [anchor]
    while queue and len(ordered) < limit:
        current, dist = queue.popleft()
        if dist >= depth:
            continue
        for nxt in sorted(adjacency.get(current, set())):
            if nxt in seen or nxt not in by_id:
                continue
            seen.add(nxt)
            ordered.append(nxt)
            queue.append((nxt, dist + 1))
            if len(ordered) >= limit:
                break
    selected = {node_id for node_id in ordered}
    selected_edges = [edge for edge in edges if edge["source"] in selected and edge["target"] in selected]
    return [by_id[node_id] for node_id in ordered], selected_edges


def default_anchor(nodes: list[Node]) -> str | None:
    for status in ("active", "ready", "open-candidate"):
        matches = [node for node in nodes if node.status == status and node.artifact_type in {"goal", "brief", "roadmap"}]
        if matches:
            return sorted(matches, key=lambda item: item.path)[0].node_id
    return nodes[0].node_id if nodes else None


def command_scan(args: argparse.Namespace) -> dict:
    return graph_report(args.repo, args.roots)


def command_audit(args: argparse.Namespace) -> dict:
    report = graph_report(args.repo, args.roots)
    return {key: report[key] for key in ("version", "scannedAt", "repoRoot", "roots", "summary", "findings")}


def command_consistency(args: argparse.Namespace) -> dict:
    nodes, edges, base_findings = load_graph(args.repo, args.roots)
    audit_items = audit_findings(nodes, edges, base_findings)
    consistency_items = consistency_findings(args.repo, nodes, edges)
    findings = consistency_items
    if args.include_audit_findings:
        findings = [*audit_items, *consistency_items]
    return {
        "version": "v1",
        "scannedAt": now_iso(),
        "repoRoot": str(args.repo),
        "roots": args.roots,
        "summary": severity_summary(findings),
        "findings": findings,
    }


def command_status_impact(args: argparse.Namespace) -> dict:
    nodes, edges, _ = load_graph(args.repo, args.roots)
    by_id, _ = node_maps(nodes)
    incoming, outgoing = incoming_outgoing(edges)
    node = by_id.get(args.node_id)
    if not node:
        return {"found": False, "node_id": args.node_id, "findings": [finding("blocker", "GRAPH_NODE_NOT_FOUND", "", f"node not found: {args.node_id}")]}

    downstream_ids: list[str] = []
    for edge in outgoing.get(args.node_id, []):
        if edge["relation"] in {"blocks", "unblocks"}:
            downstream_ids.append(edge["target"])
    for edge in incoming.get(args.node_id, []):
        if edge["relation"] == "depends_on":
            downstream_ids.append(edge["source"])
    downstream: list[dict] = []
    seen: set[str] = set()
    for node_id in downstream_ids:
        if node_id in seen or node_id not in by_id:
            continue
        seen.add(node_id)
        item = by_id[node_id]
        blockers_after = unresolved_blockers(item, by_id, incoming, outgoing)
        simulated_blockers = [blocker for blocker in blockers_after if blocker.node_id != args.node_id or args.to_status not in RESOLVED_STATUSES]
        suggested = "review"
        if item.status == "blocked" and not simulated_blockers:
            suggested = "review-for-ready"
        elif item.status in READYISH_STATUSES and simulated_blockers:
            suggested = "review-premature-ready"
        elif item.status == "open-candidate":
            suggested = "keep-or-promote-after-semantic-review"
        downstream.append(
            {
                "node": node_to_dict(item),
                "current_status": item.status,
                "unresolved_blockers_after_simulation": [blocker.node_id for blocker in simulated_blockers],
                "suggested_action": suggested,
            }
        )

    return {
        "found": True,
        "node": node_to_dict(node),
        "simulated_status": args.to_status,
        "evidence": args.evidence,
        "downstream": downstream,
        "note": "impact is advisory; script does not infer readiness or cascade status changes",
    }


def command_unblock_review(args: argparse.Namespace) -> dict:
    nodes, edges, _ = load_graph(args.repo, args.roots)
    by_id, _ = node_maps(nodes)
    incoming, outgoing = incoming_outgoing(edges)
    node = by_id.get(args.node_id)
    if not node:
        return {"found": False, "node_id": args.node_id, "findings": [finding("blocker", "GRAPH_NODE_NOT_FOUND", "", f"node not found: {args.node_id}")]}

    blockers = node_blocker_ids(node, incoming, outgoing)
    unresolved = unresolved_blockers(node, by_id, incoming, outgoing)
    missing_fields = []
    if node.artifact_type == "goal":
        for field in ("objective", "claim_limit", "evidence_contract"):
            if field not in node.fields:
                missing_fields.append(field)
    verdict = "not-blocked"
    if unresolved:
        verdict = "still-blocked"
    elif missing_fields:
        verdict = "needs-metadata-review"
    elif node.status == "blocked":
        verdict = "ready-candidate"

    queue = queue_consistency_report(args.repo, args.queue, by_id, incoming, outgoing) if args.queue else None
    return {
        "found": True,
        "node": node_to_dict(node),
        "verdict": verdict,
        "blockers": blockers,
        "unresolved_blockers": [blocker.node_id for blocker in unresolved],
        "missing_ready_fields": missing_fields,
        "suggested_action": "semantic review required before status change" if verdict == "ready-candidate" else "none",
        "queue": queue,
    }


def parse_queue_items(repo: Path, queue_path: Path) -> tuple[list[dict], list[dict]]:
    findings: list[dict] = []
    if not queue_path.exists():
        return [], [finding("info", "GRAPH_QUEUE_FILE_MISSING", queue_path.as_posix(), "queue file does not exist")]
    try:
        rel_queue = queue_path.relative_to(repo).as_posix()
    except ValueError:
        rel_queue = queue_path.as_posix()
    items: list[dict] = []
    current_section = ""
    current: dict[str, Any] | None = None
    for line in read_text(queue_path).splitlines():
        h2 = re.match(r"^##\s+(.+?)\s*$", line)
        if h2:
            current_section = h2.group(1).strip()
            current = None
            continue
        h3 = re.match(r"^###\s+(.+?)\s*$", line)
        if h3:
            current = {
                "title": h3.group(1).strip(),
                "section": current_section,
                "path": rel_queue,
                "plan": "",
                "status": "",
            }
            items.append(current)
            continue
        if current is None:
            continue
        plan = re.match(r"^-\s+plan:\s+\[[^\]]+\]\(([^)]+)\)", line)
        if plan:
            current["plan"] = plan.group(1).strip()
            continue
        status = re.match(r"^-\s+status:\s+(.+?)\s*$", line)
        if status:
            current["status"] = status.group(1).strip()
            continue
    return items, findings


def queue_plan_to_rel(repo: Path, queue_path: Path, plan: str) -> str:
    plan_path = Path(plan)
    if plan_path.is_absolute():
        try:
            return plan_path.resolve().relative_to(repo).as_posix()
        except ValueError:
            return plan_path.as_posix()
    return (queue_path.parent / plan_path).resolve().relative_to(repo).as_posix()


def queue_consistency_report(repo: Path, queue: Path | str, by_id: dict[str, Node], incoming: dict[str, list[dict]], outgoing: dict[str, list[dict]]) -> dict:
    queue_path = Path(queue)
    if not queue_path.is_absolute():
        queue_path = repo / queue_path
    items, findings = parse_queue_items(repo, queue_path)
    by_path = {node.path: node for node in by_id.values()}
    checked: list[dict] = []
    for item in items:
        plan = str(item.get("plan", ""))
        if not plan:
            findings.append(finding("warn", "GRAPH_QUEUE_ITEM_WITHOUT_PLAN", item["path"], f"queue item has no plan link: {item['title']}", item=item["title"]))
            checked.append({**item, "node_id": "", "graph_status": ""})
            continue
        try:
            rel_plan = queue_plan_to_rel(repo, queue_path, plan)
        except ValueError:
            rel_plan = plan
        node = by_path.get(rel_plan)
        if not (repo / rel_plan).exists():
            findings.append(finding("warn", "GRAPH_QUEUE_PLAN_PATH_MISSING", item["path"], f"queue plan path does not exist: {plan}", item=item["title"], plan=plan))
        if not node:
            findings.append(finding("info", "GRAPH_QUEUE_PLAN_NOT_GRAPH_NODE", item["path"], f"queue plan is not an artifact graph node: {plan}", item=item["title"], plan=plan))
            checked.append({**item, "plan_resolved": rel_plan, "node_id": "", "graph_status": ""})
            continue
        status = str(item.get("status", ""))
        section = str(item.get("section", "")).lower()
        unresolved = unresolved_blockers(node, by_id, incoming, outgoing)
        checked.append({**item, "plan_resolved": rel_plan, "node_id": node.node_id, "graph_status": node.status, "unresolved_blockers": [blocker.node_id for blocker in unresolved]})

        if status == "current" and node.status == "blocked":
            findings.append(finding("warn", "GRAPH_QUEUE_CURRENT_BLOCKED", item["path"], "queue current item is graph-blocked", item=item["title"], node_id=node.node_id))
        if status == "parked-ready" and node.status != "ready":
            findings.append(finding("info", "GRAPH_QUEUE_PARKED_READY_STATUS_DRIFT", item["path"], "queue parked-ready item is not graph-ready", item=item["title"], node_id=node.node_id, graph_status=node.status))
        if status == "blocked" and node.status != "blocked" and "blocked" in section:
            findings.append(finding("info", "GRAPH_QUEUE_BLOCKED_STATUS_DRIFT", item["path"], "queue blocked item is not graph-blocked", item=item["title"], node_id=node.node_id, graph_status=node.status))
        if status in {"current", "parked-ready"} and unresolved:
            findings.append(finding("info", "GRAPH_QUEUE_READY_WITH_UNRESOLVED_BLOCKERS_REVIEW", item["path"], "queue ready/current item has unresolved graph blockers", item=item["title"], node_id=node.node_id, blockers=[blocker.node_id for blocker in unresolved]))
    return {
        "version": "v1",
        "queue": queue_path.as_posix(),
        "summary": severity_summary(findings),
        "items": checked,
        "findings": findings,
    }


def command_queue_consistency(args: argparse.Namespace) -> dict:
    nodes, edges, _ = load_graph(args.repo, args.roots)
    by_id, _ = node_maps(nodes)
    incoming, outgoing = incoming_outgoing(edges)
    return queue_consistency_report(args.repo, args.queue, by_id, incoming, outgoing)


def load_node_for_write(repo: Path, roots: list[str], node_id: str) -> tuple[Node, Path, str, dict[str, Any], list[str]]:
    nodes, _ = load_nodes(repo, roots)
    by_id, _ = node_maps(nodes)
    node = by_id.get(node_id)
    if not node:
        raise ValueError(f"node not found: {node_id}")
    path = repo / node.path
    text = read_text(path)
    match = frontmatter_match(text)
    if not match:
        raise ValueError(f"node has no parseable frontmatter: {node.path}")
    fields = parse_frontmatter(text)
    if fields is None:
        raise ValueError(f"node has no parseable frontmatter: {node.path}")
    order = frontmatter_key_order(match.group(1))
    return node, path, text, fields, order


def apply_frontmatter_update(path: Path, text: str, fields: dict[str, Any], order: list[str], write: bool) -> dict:
    match = frontmatter_match(text)
    if not match:
        raise ValueError(f"file has no parseable frontmatter: {path}")
    replacement = serialize_frontmatter(fields, order)
    new_text = replacement + text[match.end() :]
    diff = "".join(
        difflib.unified_diff(
            text.splitlines(keepends=True),
            new_text.splitlines(keepends=True),
            fromfile=path.as_posix(),
            tofile=path.as_posix(),
        )
    )
    if write and new_text != text:
        path.write_text(new_text, encoding="utf-8")
    return {"changed": new_text != text, "written": write and new_text != text, "diff": diff}


def validate_write_node_fields(fields: dict[str, Any]) -> None:
    status = str(fields.get("status", ""))
    artifact_type = str(fields.get("artifact_type", ""))
    if status and status not in STATUSES:
        raise ValueError(f"invalid status: {status}")
    if artifact_type and artifact_type not in NODE_TYPES:
        raise ValueError(f"invalid artifact_type: {artifact_type}")


def write_result(args: argparse.Namespace, node: Node, path: Path, text: str, fields: dict[str, Any], order: list[str]) -> dict:
    validate_write_node_fields(fields)
    result = apply_frontmatter_update(path, text, fields, order, args.write)
    return {
        "node_id": node.node_id,
        "path": node.path,
        "dry_run": not args.write,
        **result,
        "note": "write commands do not infer readiness or cascade changes; run audit/consistency after write",
    }


def command_update_node(args: argparse.Namespace) -> dict:
    node, path, text, fields, order = load_node_for_write(args.repo, args.roots, args.node_id)
    updates = {
        "status": args.status,
        "next_action": args.next_action,
        "objective": args.objective,
        "claim_limit": args.claim_limit,
        "evidence_contract": args.evidence_contract,
    }
    if not any(value is not None for value in updates.values()):
        raise ValueError("no update fields provided")
    for key, value in updates.items():
        if value is not None:
            fields[key] = value
    return write_result(args, node, path, text, fields, order)


def command_add_evidence(args: argparse.Namespace) -> dict:
    node, path, text, fields, order = load_node_for_write(args.repo, args.roots, args.node_id)
    if not resolve_reference_path(args.repo, node, args.evidence).exists():
        raise ValueError(f"evidence path does not exist: {args.evidence}")
    evidence = as_list(fields.get("evidence"))
    if args.evidence not in evidence:
        evidence.append(args.evidence)
    fields["evidence"] = evidence
    return write_result(args, node, path, text, fields, order)


def command_add_relation(args: argparse.Namespace) -> dict:
    nodes, _ = load_nodes(args.repo, args.roots)
    by_id, _ = node_maps(nodes)
    if args.target not in by_id:
        raise ValueError(f"target node not found: {args.target}")
    node, path, text, fields, order = load_node_for_write(args.repo, args.roots, args.node_id)
    values = as_list(fields.get(args.field))
    if args.target not in values:
        values.append(args.target)
    fields[args.field] = values
    return write_result(args, node, path, text, fields, order)


def command_remove_relation(args: argparse.Namespace) -> dict:
    node, path, text, fields, order = load_node_for_write(args.repo, args.roots, args.node_id)
    values = as_list(fields.get(args.field))
    fields[args.field] = [value for value in values if value != args.target]
    return write_result(args, node, path, text, fields, order)


def command_node(args: argparse.Namespace) -> dict:
    report = graph_report(args.repo, args.roots)
    nodes = {node["node_id"]: node for node in report["nodes"]}
    return {"node": nodes.get(args.node_id), "found": args.node_id in nodes}


def command_current(args: argparse.Namespace) -> dict:
    nodes, base_findings = load_nodes(args.repo, args.roots)
    edges = build_edges(nodes)
    anchor = args.anchor or default_anchor(nodes)
    focus, focus_edges = neighborhood(nodes, edges, anchor or "", args.depth, args.limit) if anchor else ([], [])
    return {
        "version": "v1",
        "repoRoot": str(args.repo),
        "anchor": anchor,
        "depth": args.depth,
        "limit": args.limit,
        "focus_nodes": [node_to_dict(node) for node in focus],
        "edges": focus_edges,
        "read_next": [node.path for node in focus[: min(5, len(focus))]],
        "findings": base_findings,
    }


def command_ready(args: argparse.Namespace) -> dict:
    report = graph_report(args.repo, args.roots)
    nodes = [node for node in report["nodes"] if node["status"] == "ready"]
    return {"ready_nodes": nodes, "count": len(nodes)}


def command_blockers(args: argparse.Namespace) -> dict:
    nodes, _ = load_nodes(args.repo, args.roots)
    edges = build_edges(nodes)
    by_id, _ = node_maps(nodes)
    incoming, outgoing = incoming_outgoing(edges)
    target = by_id.get(args.node_id)
    if target and target.status in {"completed", "retired"}:
        return {"node_id": args.node_id, "blocked_by": [], "incoming": incoming.get(args.node_id, [])}
    depends_on = [edge for edge in outgoing.get(args.node_id, []) if edge["relation"] == "depends_on"]
    blocked_by_edges = [edge for edge in incoming.get(args.node_id, []) if edge["relation"] == "blocks"]
    blocker_ids = [edge["target"] for edge in depends_on] + [edge["source"] for edge in blocked_by_edges]
    seen: set[str] = set()
    blocked_by: list[Node] = []
    for node_id in blocker_ids:
        if node_id in seen or node_id not in by_id:
            continue
        if by_id[node_id].status in {"completed", "retired"}:
            continue
        seen.add(node_id)
        blocked_by.append(by_id[node_id])
    return {
        "node_id": args.node_id,
        "blocked_by": [node_to_dict(node) for node in blocked_by],
        "incoming": incoming.get(args.node_id, []),
    }


def command_orphans(args: argparse.Namespace) -> dict:
    nodes, _ = load_nodes(args.repo, args.roots)
    edges = build_edges(nodes)
    incoming, outgoing = incoming_outgoing(edges)
    orphans = [
        node_to_dict(node)
        for node in nodes
        if not incoming.get(node.node_id)
        and not outgoing.get(node.node_id)
        and not (node.status in {"retired", "completed"} and node.artifact_type in {"report", "source"})
    ]
    return {"orphans": orphans, "count": len(orphans)}


def command_review_list(args: argparse.Namespace) -> dict:
    report = graph_report(args.repo, args.roots)
    priority = {
        "active": 0,
        "ready": 1,
        "blocked": 2,
        "bridge-needed": 3,
        "open-candidate": 4,
        "weak-signal": 5,
        "completed": 6,
        "retired": 7,
    }
    nodes = sorted(report["nodes"], key=lambda item: (priority.get(item["status"], 99), item["artifact_type"], item["path"]))
    return {"review_nodes": nodes[: args.limit], "count": len(nodes), "limit": args.limit}


def mermaid_id(node_id: str) -> str:
    sanitized = re.sub(r"[^A-Za-z0-9_]", "_", node_id)
    if not sanitized or sanitized[0].isdigit():
        sanitized = "n_" + sanitized
    return sanitized


def command_mermaid(args: argparse.Namespace) -> str:
    nodes, _ = load_nodes(args.repo, args.roots)
    edges = build_edges(nodes)
    anchor = args.anchor or default_anchor(nodes)
    focus, focus_edges = neighborhood(nodes, edges, anchor or "", args.depth, args.limit) if anchor else ([], [])
    lines = ["flowchart LR"]
    for node in focus:
        label = f"{node.node_id}\\n{node.status}"
        lines.append(f'  {mermaid_id(node.node_id)}["{label}"]')
    for edge in focus_edges:
        lines.append(f"  {mermaid_id(edge['source'])} -- {edge['relation']} --> {mermaid_id(edge['target'])}")
    return "\n".join(lines)


def add_common(parser: argparse.ArgumentParser) -> None:
    parser.add_argument("--repo", default=None, type=Path, help="Repository root; defaults to cwd or nearest project root")
    parser.add_argument("--roots", nargs="*", default=list(DEFAULT_ROOTS), help="Artifact roots relative to repo")


def normalize_args(args: argparse.Namespace) -> None:
    start = args.repo or Path.cwd()
    args.repo = repo_root(start)


def main() -> None:
    parser = argparse.ArgumentParser(description="Inspect docs artifact graph frontmatter")
    subparsers = parser.add_subparsers(dest="command", required=True)

    for name in ("scan", "audit", "ready", "orphans", "review-list"):
        sub = subparsers.add_parser(name)
        add_common(sub)
        if name == "review-list":
            sub.add_argument("--limit", type=int, default=30)

    current = subparsers.add_parser("current")
    add_common(current)
    current.add_argument("--anchor", default=None)
    current.add_argument("--depth", type=int, default=1)
    current.add_argument("--limit", type=int, default=10)

    node = subparsers.add_parser("node")
    add_common(node)
    node.add_argument("node_id")

    blockers = subparsers.add_parser("blockers")
    add_common(blockers)
    blockers.add_argument("node_id")

    consistency = subparsers.add_parser("consistency")
    add_common(consistency)
    consistency.add_argument("--include-audit-findings", action="store_true")

    status_impact = subparsers.add_parser("status-impact")
    add_common(status_impact)
    status_impact.add_argument("--node", dest="node_id", required=True)
    status_impact.add_argument("--to", dest="to_status", required=True, choices=sorted(STATUSES))
    status_impact.add_argument("--evidence", default=None)

    unblock_review = subparsers.add_parser("unblock-review")
    add_common(unblock_review)
    unblock_review.add_argument("node_id")
    unblock_review.add_argument("--queue", default=QUEUE_DEFAULT, help="optional queue markdown path; omitted by default because Goal Proof System state is owned by $goal-proof")

    queue_consistency = subparsers.add_parser("queue-consistency")
    add_common(queue_consistency)
    queue_consistency.add_argument("--queue", default=QUEUE_DEFAULT, required=True)

    mermaid = subparsers.add_parser("mermaid")
    add_common(mermaid)
    mermaid.add_argument("--anchor", default=None)
    mermaid.add_argument("--depth", type=int, default=1)
    mermaid.add_argument("--limit", type=int, default=10)

    update_node = subparsers.add_parser("update-node")
    add_common(update_node)
    update_node.add_argument("--node", dest="node_id", required=True)
    update_node.add_argument("--status", choices=sorted(STATUSES))
    update_node.add_argument("--next-action", dest="next_action")
    update_node.add_argument("--objective")
    update_node.add_argument("--claim-limit", dest="claim_limit")
    update_node.add_argument("--evidence-contract")
    update_node.add_argument("--write", action="store_true")

    add_evidence = subparsers.add_parser("add-evidence")
    add_common(add_evidence)
    add_evidence.add_argument("--node", dest="node_id", required=True)
    add_evidence.add_argument("--evidence", required=True)
    add_evidence.add_argument("--write", action="store_true")

    for name in ("add-relation", "remove-relation"):
        relation = subparsers.add_parser(name)
        add_common(relation)
        relation.add_argument("--node", dest="node_id", required=True)
        relation.add_argument("--field", required=True, choices=EDGE_FIELDS)
        relation.add_argument("--target", required=True)
        relation.add_argument("--write", action="store_true")

    args = parser.parse_args()
    normalize_args(args)

    if args.command == "scan":
        result: Any = command_scan(args)
    elif args.command == "audit":
        result = command_audit(args)
    elif args.command == "node":
        result = command_node(args)
    elif args.command == "current":
        result = command_current(args)
    elif args.command == "ready":
        result = command_ready(args)
    elif args.command == "blockers":
        result = command_blockers(args)
    elif args.command == "consistency":
        result = command_consistency(args)
    elif args.command == "status-impact":
        result = command_status_impact(args)
    elif args.command == "unblock-review":
        result = command_unblock_review(args)
    elif args.command == "queue-consistency":
        result = command_queue_consistency(args)
    elif args.command == "orphans":
        result = command_orphans(args)
    elif args.command == "review-list":
        result = command_review_list(args)
    elif args.command == "mermaid":
        print(command_mermaid(args))
        return
    elif args.command == "update-node":
        result = command_update_node(args)
    elif args.command == "add-evidence":
        result = command_add_evidence(args)
    elif args.command == "add-relation":
        result = command_add_relation(args)
    elif args.command == "remove-relation":
        result = command_remove_relation(args)
    else:
        raise AssertionError(args.command)

    print(json.dumps(result, ensure_ascii=True, indent=2))
    summary = result.get("summary") if isinstance(result, dict) else None
    if isinstance(summary, dict) and summary.get("blocker", 0) > 0:
        sys.exit(1)


if __name__ == "__main__":
    main()
