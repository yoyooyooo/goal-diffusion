#!/usr/bin/env python3
"""Scan a repository for a minimal project-agnostic docs governance baseline."""

from __future__ import annotations

import argparse
import json
from datetime import datetime, timezone
from pathlib import Path

SKIP_DIRS = {
    ".git",
    "node_modules",
    "dist",
    "build",
    ".next",
    ".turbo",
    ".cache",
    "coverage",
    "target",
    ".venv",
    "venv",
    "__pycache__",
}

PROJECT_MANIFESTS = {
    "package.json",
    "pyproject.toml",
    "requirements.txt",
    "Cargo.toml",
    "go.mod",
    "pom.xml",
    "build.gradle",
    "build.gradle.kts",
}

LOCK_FILES = {
    "pnpm-lock.yaml",
    "package-lock.json",
    "yarn.lock",
    "bun.lock",
    "bun.lockb",
    "poetry.lock",
    "uv.lock",
    "Cargo.lock",
    "go.sum",
}

CODE_EXTENSIONS = {
    ".ts",
    ".tsx",
    ".js",
    ".jsx",
    ".mjs",
    ".cjs",
    ".py",
    ".rs",
    ".go",
    ".java",
    ".kt",
    ".swift",
}

REQUIRED_DOCS = [
    "docs/README.md",
    "docs/product/README.md",
    "docs/ssot/README.md",
    "docs/adr/_template.md",
    "docs/standards/README.md",
]

PRODUCT_DOCS = [
    "docs/architecture/README.md",
    "docs/roadmap/README.md",
]

GOAL_DIFFUSION_DOCS = [
    "docs/goal-diffusion/README.md",
]

LAYER_README_OPTIONAL_SECTIONS = {
    "boundary": ("## Boundary", "## Conflict", "## Priority", "## 冲突", "## 边界"),
    "promotion": ("## Promotion", "## Demotion", "## Promotion / Demotion", "## 提升", "## 生命周期"),
}


def _has_root_manifest(root: Path) -> bool:
    return any((root / name).exists() for name in PROJECT_MANIFESTS)


def _has_root_lock_file(root: Path) -> bool:
    return any((root / name).exists() for name in LOCK_FILES)


def _has_root_code_hint(root: Path) -> bool:
    for dirname in ("src", "app", "apps", "packages", "services", "libs", "crates"):
        if (root / dirname).exists():
            return True
    for child in root.iterdir():
        if child.is_file() and child.suffix.lower() in CODE_EXTENSIONS:
            return True
    return False


def _nested_project_roots(root: Path) -> list[Path]:
    nested: list[Path] = []
    for child in root.iterdir():
        if not child.is_dir():
            continue
        if child.name.startswith(".") or child.name in SKIP_DIRS:
            continue
        if any((child / marker).exists() for marker in PROJECT_MANIFESTS):
            nested.append(child)
    return nested


def _top_level_app_dirs(root: Path) -> list[str]:
    apps_root = root / "apps"
    if not apps_root.exists() or not apps_root.is_dir():
        return []
    return sorted(child.name for child in apps_root.iterdir() if child.is_dir() and not child.name.startswith("."))


def _is_product_shaped_repo(root: Path) -> bool:
    return bool(_top_level_app_dirs(root)) or (root / "packages").exists() or (root / "crates").exists()


def _is_multi_entry_repo(root: Path) -> bool:
    return len(_top_level_app_dirs(root)) >= 2


def _architecture_docs_have_host_guidance(root: Path) -> bool:
    architecture_root = root / "docs" / "architecture"
    if not architecture_root.exists():
        return False
    tokens = ("宿主", "host", "server", "deployable")
    for path in architecture_root.rglob("*.md"):
        text = path.read_text(encoding="utf-8", errors="ignore").lower()
        if any(token.lower() in text for token in tokens):
            return True
    return False


def _resolve_policy(root: Path) -> dict:
    root_has_manifest = _has_root_manifest(root)
    root_has_lock = _has_root_lock_file(root)
    root_has_code = _has_root_code_hint(root)
    nested_projects = _nested_project_roots(root)

    if not root_has_manifest and not root_has_lock and nested_projects:
        return {
            "mode": "aggregate-root",
            "enforceRequired": False,
            "reason": f"detected {len(nested_projects)} nested projects and no root-level manifest",
            "nestedProjectCount": len(nested_projects),
            "nestedProjectSamples": [p.name for p in nested_projects[:8]],
        }

    if root_has_manifest or root_has_lock or root_has_code:
        return {
            "mode": "project-root",
            "enforceRequired": True,
            "reason": "root appears to be an executable project boundary",
            "nestedProjectCount": len(nested_projects),
            "nestedProjectSamples": [p.name for p in nested_projects[:8]],
        }

    return {
        "mode": "unknown-root",
        "enforceRequired": True,
        "reason": "no project markers detected; treat as new repo convergence with little prior material",
        "nestedProjectCount": len(nested_projects),
        "nestedProjectSamples": [p.name for p in nested_projects[:8]],
    }


def _presence(root: Path, paths: list[str]) -> tuple[list[dict], list[str]]:
    status: list[dict] = []
    missing: list[str] = []
    for rel in paths:
        ok = (root / rel).is_file()
        status.append({"path": rel, "status": "present" if ok else "missing"})
        if not ok:
            missing.append(rel)
    return status, missing


def _docs_layer_readmes(root: Path) -> list[Path]:
    docs_root = root / "docs"
    if not docs_root.exists() or not docs_root.is_dir():
        return []
    readmes: list[Path] = []
    for child in docs_root.iterdir():
        if child.name.startswith(".") or not child.is_dir():
            continue
        readme = child / "README.md"
        if readme.is_file():
            readmes.append(readme)
    return sorted(readmes)


def _has_any(text: str, needles: tuple[str, ...]) -> bool:
    return any(needle.lower() in text.lower() for needle in needles)


def _scan_layer_readme_contract(root: Path) -> tuple[list[dict], list[dict]]:
    status: list[dict] = []
    findings: list[dict] = []
    for readme in _docs_layer_readmes(root):
        rel = readme.relative_to(root).as_posix()
        text = readme.read_text(encoding="utf-8", errors="ignore")
        has_owns = "## Owns" in text
        has_must_not_own = "## Must Not Own" in text
        has_entry = "## Read Next" in text or "## Homes" in text or "## 下一步阅读" in text or "## 使用方式" in text
        status.append(
            {
                "path": rel,
                "owns": has_owns,
                "mustNotOwn": has_must_not_own,
                "entry": has_entry,
            }
        )
        missing = []
        if not has_owns:
            missing.append("Owns")
        if not has_must_not_own:
            missing.append("Must Not Own")
        if not has_entry:
            missing.append("Read Next / entry points")
        if missing:
            findings.append(
                {
                    "id": f"DOCS_LAYER_README::{rel}",
                    "severity": "warn",
                    "ruleId": "DOCS_LAYER_README_CONTRACT_MISSING",
                    "path": str(readme),
                    "summary": f"docs layer README is missing contract sections: {', '.join(missing)}",
                    "evidence": [rel],
                    "fixHint": "add Owns, Must Not Own, and Read Next or entry-point sections",
                }
            )
    return status, findings


def scan(repo: Path) -> dict:
    root = repo.resolve()
    policy = _resolve_policy(root)
    required_status, required_missing = _presence(root, REQUIRED_DOCS)
    product_status, product_missing = _presence(root, PRODUCT_DOCS)
    gd_status, gd_missing = _presence(root, GOAL_DIFFUSION_DOCS)
    layer_readme_status, layer_readme_findings = _scan_layer_readme_contract(root)

    findings: list[dict] = []
    findings.extend(layer_readme_findings)
    if policy.get("enforceRequired"):
        for rel in required_missing:
            findings.append(
                {
                    "id": f"DOCS_BASELINE::{rel}",
                    "severity": "warn",
                    "ruleId": "DOCS_BASELINE_MISSING",
                    "path": str(root / rel),
                    "summary": f"missing docs baseline file: {rel}",
                    "evidence": ["required: " + ", ".join(REQUIRED_DOCS)],
                    "fixHint": "create the missing governance baseline file or document the host equivalent",
                }
            )

    if policy.get("enforceRequired") and _is_product_shaped_repo(root):
        for rel in product_missing:
            findings.append(
                {
                    "id": f"DOCS_PRODUCT_SHAPE::{rel}",
                    "severity": "info",
                    "ruleId": "DOCS_PRODUCT_SHAPE_MISSING",
                    "path": str(root / rel),
                    "summary": f"product-shaped repo is missing docs entry skeleton: {rel}",
                    "evidence": ["expected architecture/product/ssot/standards/roadmap routing"],
                    "fixHint": "add README entries for architecture and roadmap if those layers are used",
                }
            )

    if (root / "docs" / "goal-diffusion").exists():
        for rel in gd_missing:
            findings.append(
                {
                    "id": f"DOCS_GOAL_DIFFUSION::{rel}",
                    "severity": "warn",
                    "ruleId": "DOCS_GOAL_DIFFUSION_INDEX_MISSING",
                    "path": str(root / rel),
                    "summary": f"goal-diffusion layer is missing expected index: {rel}",
                    "evidence": ["goal-diffusion layer exists"],
                    "fixHint": "add the missing README or remove the unused goal-diffusion layer",
                }
            )

    if policy.get("enforceRequired") and _is_multi_entry_repo(root) and not _architecture_docs_have_host_guidance(root):
        findings.append(
            {
                "id": "DOCS_MULTI_ENTRY::missing-host-guidance",
                "severity": "info",
                "ruleId": "DOCS_MULTI_ENTRY_HOST_GUIDANCE_MISSING",
                "path": str(root / "docs" / "architecture"),
                "summary": "multi-entry repo should document host/server guidance",
                "evidence": [f"apps={_top_level_app_dirs(root)}"],
                "fixHint": "add architecture guidance for shared deployable host or server boundary",
            }
        )

    ssot_root = root / "docs" / "ssot" / "README.md"
    if ssot_root.is_file() and "docs/standards" not in ssot_root.read_text(encoding="utf-8", errors="ignore"):
        findings.append(
            {
                "id": "DOCS_SSOT_PRIORITY::missing-standards",
                "severity": "warn",
                "ruleId": "DOCS_SSOT_PRIORITY_MISSING_STANDARDS",
                "path": str(ssot_root),
                "summary": "docs/ssot/README.md should include docs/standards/** in priority list",
                "evidence": ["expected to mention docs/standards/** under priority rules"],
                "fixHint": "update SSoT priority to include docs/standards/**",
            }
        )

    return {
        "version": "v1",
        "scannedAt": datetime.now(timezone.utc).isoformat(),
        "repoRoot": str(root),
        "policy": policy,
        "required": required_status,
        "productShape": product_status,
        "goalDiffusion": gd_status,
        "layerReadmes": layer_readme_status,
        "findings": findings,
    }


def main() -> None:
    parser = argparse.ArgumentParser(description="Scan docs governance baseline")
    parser.add_argument("--repo", default=".", help="Repository root")
    args = parser.parse_args()
    print(json.dumps(scan(Path(args.repo)), ensure_ascii=True, indent=2))


if __name__ == "__main__":
    main()
