#!/usr/bin/env python3
"""Scan docs agent-readability heuristics without writing state files."""

from __future__ import annotations

import argparse
import json
import re
from datetime import datetime, timezone
from pathlib import Path

DOCS_ROOT = Path("docs")
MD_LINK_RE = re.compile(r"\[[^\]]+\]\(([^)]+)\)")
SECTION_HINT_PATTERNS = {
    "agentGuide": ["面向 Agent", "For Agents", "for agents"],
    "shortestPath": ["最短阅读路径", "Shortest Reading Path", "read first"],
    "readNext": ["Read Next", "下一步", "下一步阅读", "继续阅读"],
    "systemSummary": ["One-Screen Summary", "一页摘要", "一句话总图", "System Summary"],
    "currentGaps": ["Current Gaps", "当前缺口", "Gap Ledger", "Current Gap Ledger"],
    "optimizationGuide": ["Optimization Rules", "优化抓手", "优化顺序", "推荐优化顺序"],
}

ENTRY_LINK_EXPECTATIONS = {
    "docs/README.md": [
        "docs/product/README.md",
        "docs/ssot/README.md",
        "docs/standards/README.md",
    ],
    "docs/architecture/README.md": [
        "docs/ssot/README.md",
    ],
}


def _read(path: Path) -> str:
    return path.read_text(encoding="utf-8", errors="ignore") if path.exists() else ""


def _contains_any(text: str, patterns: list[str]) -> bool:
    lowered = text.lower()
    return any(item.lower() in lowered for item in patterns)


def _all_markdown_files(root: Path) -> list[Path]:
    if not root.exists():
        return []
    return sorted(p for p in root.rglob("*.md") if p.is_file())


def _dense_dirs(root: Path) -> list[tuple[Path, int]]:
    counts: dict[Path, int] = {}
    for path in _all_markdown_files(root):
        counts[path.parent] = counts.get(path.parent, 0) + 1
    return sorted((directory, count) for directory, count in counts.items() if count >= 5 and not (directory / "README.md").exists())


def _resolve_internal_targets(path: Path, repo: Path) -> tuple[set[Path], list[str]]:
    resolved: set[Path] = set()
    broken: list[str] = []
    for raw_target in MD_LINK_RE.findall(_read(path)):
        target = raw_target.strip()
        if not target or "://" in target or target.startswith("#"):
            continue
        normalized = target.split("#", 1)[0].strip()
        if not normalized:
            continue
        candidate = (path.parent / normalized).resolve()
        candidate2 = (repo / normalized).resolve()
        if candidate.exists():
            resolved.add(candidate)
        elif candidate2.exists():
            resolved.add(candidate2)
        else:
            broken.append(target)
    return resolved, broken


def _entry_findings(repo: Path) -> list[dict]:
    findings: list[dict] = []
    checks = {
        "docs/README.md": ["shortestPath"],
        "docs/ssot/README.md": [],
        "docs/standards/README.md": [],
    }
    for rel, needs in checks.items():
        path = repo / rel
        if not path.exists():
            continue
        text = _read(path)
        missing = [name for name in needs if not _contains_any(text, SECTION_HINT_PATTERNS[name])]
        if missing:
            findings.append(
                {
                    "id": f"DOCS_AGENT_ENTRY::{rel}",
                    "severity": "warn",
                    "ruleId": "DOCS_AGENT_ENTRY_GUIDE_MISSING",
                    "path": str(path),
                    "summary": f"entry docs missing agent-oriented reading guidance: {', '.join(missing)}",
                    "evidence": [f"missing signals={missing}"],
                    "fixHint": "add entry role, shortest path, or read-next style hints",
                }
            )
    return findings


def _dense_dir_findings(repo: Path) -> list[dict]:
    return [
        {
            "id": f"DOCS_DENSE_DIR::{directory.relative_to(repo)}",
            "severity": "warn",
            "ruleId": "DOCS_DENSE_DIR_NO_README",
            "path": str(directory),
            "summary": "docs directory is dense but missing README.md",
            "evidence": [f"markdownFileCount={count}"],
            "fixHint": "add a directory README with scope, exclusions, shortest path, and task-oriented entry hints",
        }
        for directory, count in _dense_dirs(repo / DOCS_ROOT)
    ]


def _broken_link_findings(repo: Path) -> list[dict]:
    findings: list[dict] = []
    for path in _all_markdown_files(repo / DOCS_ROOT):
        _, broken = _resolve_internal_targets(path, repo)
        if broken:
            findings.append(
                {
                    "id": f"DOCS_BROKEN_LINK::{path.relative_to(repo)}",
                    "severity": "warn",
                    "ruleId": "DOCS_BROKEN_INTERNAL_LINK",
                    "path": str(path),
                    "summary": "docs file contains broken internal markdown links",
                    "evidence": [f"broken={item}" for item in broken[:10]],
                    "fixHint": "update or remove broken internal links",
                }
            )
    return findings


def _read_next_findings(repo: Path) -> list[dict]:
    findings: list[dict] = []
    for path in [repo / "docs/README.md", repo / "docs/ssot/README.md", repo / "docs/standards/README.md"]:
        if path.exists() and not _contains_any(_read(path), SECTION_HINT_PATTERNS["readNext"]):
            findings.append(
                {
                    "id": f"DOCS_READNEXT::{path.relative_to(repo)}",
                    "severity": "info",
                    "ruleId": "DOCS_READNEXT_HINT_MISSING",
                    "path": str(path),
                    "summary": "entry docs could be improved with explicit Read Next hints",
                    "evidence": ["missing read-next style signals"],
                    "fixHint": "add Read Next / 下一步阅读 style hints to shorten agent handoff time",
                }
            )
    return findings


def _entry_link_closure_findings(repo: Path) -> list[dict]:
    findings: list[dict] = []
    for rel, required_links in ENTRY_LINK_EXPECTATIONS.items():
        source = repo / rel
        if not source.exists():
            continue
        resolved, _ = _resolve_internal_targets(source, repo)
        missing = [target_rel for target_rel in required_links if (repo / target_rel).exists() and (repo / target_rel).resolve() not in resolved]
        if missing:
            findings.append(
                {
                    "id": f"DOCS_ENTRY_LINK::{rel}",
                    "severity": "warn",
                    "ruleId": "DOCS_ENTRY_LINK_CLOSURE_MISSING",
                    "path": str(source),
                    "summary": "docs entry page is missing expected cross-links to neighboring entry points",
                    "evidence": [f"missing={item}" for item in missing],
                    "fixHint": "link adjacent entry docs so later readers can move between layer roots without dead ends",
                }
            )
    return findings


def _system_brief_findings(repo: Path) -> list[dict]:
    architecture_root = repo / "docs" / "architecture"
    markdown_files = _all_markdown_files(architecture_root)
    if len(markdown_files) < 8:
        return []
    for path in markdown_files:
        text = _read(path)
        if (
            _contains_any(text, SECTION_HINT_PATTERNS["systemSummary"])
            and _contains_any(text, SECTION_HINT_PATTERNS["currentGaps"])
            and _contains_any(text, SECTION_HINT_PATTERNS["optimizationGuide"])
        ):
            return []
    return [
        {
            "id": "DOCS_SYSTEM_BRIEF::docs/architecture",
            "severity": "warn",
            "ruleId": "DOCS_SYSTEM_BRIEF_MISSING",
            "path": str(architecture_root),
            "summary": "complex architecture docs are missing a concise system brief",
            "evidence": [f"markdownFileCount={len(markdown_files)}"],
            "fixHint": "add one architecture-facing summary doc with current architecture, gaps, and optimization guidance",
        }
    ]


def scan(repo: Path) -> dict:
    root = repo.resolve()
    findings: list[dict] = []
    findings.extend(_entry_findings(root))
    findings.extend(_dense_dir_findings(root))
    findings.extend(_broken_link_findings(root))
    findings.extend(_read_next_findings(root))
    findings.extend(_entry_link_closure_findings(root))
    findings.extend(_system_brief_findings(root))
    return {
        "version": "v1",
        "scannedAt": datetime.now(timezone.utc).isoformat(),
        "repoRoot": str(root),
        "findings": findings,
    }


def main() -> None:
    parser = argparse.ArgumentParser(description="Scan docs agent-readability heuristics")
    parser.add_argument("--repo", default=".", help="Repository root")
    args = parser.parse_args()
    print(json.dumps(scan(Path(args.repo)), ensure_ascii=True, indent=2))


if __name__ == "__main__":
    main()
