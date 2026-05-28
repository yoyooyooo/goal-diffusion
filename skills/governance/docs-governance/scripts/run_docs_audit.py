#!/usr/bin/env python3
"""Run docs governance audits and print a single stdout JSON report."""

from __future__ import annotations

import argparse
import importlib.util
import json
import sys
from datetime import datetime, timezone
from pathlib import Path
from types import ModuleType


def _load_module(path: Path, name: str) -> ModuleType:
    spec = importlib.util.spec_from_file_location(name, path)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"cannot load module: {path}")
    module = importlib.util.module_from_spec(spec)
    sys.modules[name] = module
    spec.loader.exec_module(module)
    return module


def _count_findings(findings: list[dict]) -> dict:
    counts = {"blocker": 0, "warn": 0, "info": 0}
    for finding in findings:
        severity = str(finding.get("severity", "info"))
        counts[severity] = counts.get(severity, 0) + 1
    counts["total"] = len(findings)
    return counts


def main() -> None:
    parser = argparse.ArgumentParser(description="Run stdout-only docs governance audit")
    parser.add_argument("--repo", default=".", help="Repository root")
    parser.add_argument(
        "--queue",
        default=None,
        help="Optional method-specific queue markdown path for legacy/project-local queue consistency checks",
    )
    parser.add_argument(
        "--include-artifact-graph-findings",
        action="store_true",
        help="Promote all artifact graph findings into top-level docs audit findings; default promotes blockers only",
    )
    args = parser.parse_args()

    script_dir = Path(__file__).resolve().parent
    repo = Path(args.repo).resolve()
    baseline = _load_module(script_dir / "scan_docs_baseline.py", "scan_docs_baseline")
    readability = _load_module(script_dir / "scan_docs_agent_readability.py", "scan_docs_agent_readability")
    artifact_graph = _load_module(script_dir / "artifact_graph.py", "artifact_graph")

    reports = {
        "docsBaseline": baseline.scan(repo),
        "docsAgentReadability": readability.scan(repo),
        "artifactGraph": artifact_graph.command_audit(
            argparse.Namespace(repo=repo, roots=list(artifact_graph.DEFAULT_ROOTS))
        ),
        "artifactGraphConsistency": artifact_graph.command_consistency(
            argparse.Namespace(repo=repo, roots=list(artifact_graph.DEFAULT_ROOTS), include_audit_findings=False)
        ),
        "queueConsistency": (
            artifact_graph.command_queue_consistency(
                argparse.Namespace(repo=repo, roots=list(artifact_graph.DEFAULT_ROOTS), queue=args.queue)
            )
            if args.queue
            else {
                "version": "v1",
                "summary": {"blocker": 0, "warn": 0, "info": 0, "total": 0},
                "findings": [],
                "skipped": True,
                "reason": "queue checks require explicit --queue; Goal Proof System state is owned by $goal-proof",
            }
        ),
    }
    findings: list[dict] = []
    for report_name, report in reports.items():
        for item in report.get("findings", []):
            if report_name in {"artifactGraph", "artifactGraphConsistency", "queueConsistency"} and not args.include_artifact_graph_findings and item.get("severity") != "blocker":
                continue
            enriched = dict(item)
            enriched.setdefault("source", report_name)
            findings.append(enriched)

    summary = _count_findings(findings)
    result = {
        "version": "v1",
        "scannedAt": datetime.now(timezone.utc).isoformat(),
        "repoRoot": str(repo),
        "summary": summary,
        "findings": findings,
        "reports": reports,
    }
    print(json.dumps(result, ensure_ascii=True, indent=2))
    if summary.get("blocker", 0) > 0:
        sys.exit(1)


if __name__ == "__main__":
    main()
