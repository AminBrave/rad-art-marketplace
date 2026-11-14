#!/usr/bin/env python3
"""Build a truthful cross-suite index from existing JUnit reports."""

from __future__ import annotations

import argparse
import subprocess
import xml.etree.ElementTree as ET
from datetime import datetime, timezone
from pathlib import Path


SUITES = (
    ("Backend", "backend-junit.xml"),
    ("Frontend", "frontend-junit.xml"),
    ("Browser", "browser-junit.xml"),
)


def git_snapshot(root: Path) -> tuple[int | None, bool, str | None]:
    """Return HEAD commit time, dirty-worktree state and any inspection error."""
    try:
        head = subprocess.run(
            ["git", "log", "-1", "--format=%ct"],
            cwd=root,
            check=True,
            capture_output=True,
            text=True,
        )
        status = subprocess.run(
            ["git", "status", "--porcelain", "--untracked-files=all"],
            cwd=root,
            check=True,
            capture_output=True,
            text=True,
        )
        dirty_paths = []
        for line in status.stdout.splitlines():
            path_text = line[3:].split(" -> ")[-1].strip()
            normalized = path_text.replace("\\", "/")
            if normalized == "build/test-reports" or normalized.startswith("build/test-reports/"):
                continue
            dirty_paths.append(path_text)
        return int(head.stdout.strip()), bool(dirty_paths), None
    except (OSError, subprocess.CalledProcessError, ValueError) as error:
        return None, True, str(error)


def parse_junit(path: Path) -> dict[str, int]:
    root = ET.parse(path).getroot()
    nodes = [root] if root.tag == "testsuite" else root.findall(".//testsuite")

    def count(attribute: str) -> int:
        if attribute in root.attrib:
            return int(root.attrib[attribute])
        return sum(int(node.attrib.get(attribute, "0")) for node in nodes)

    return {
        "tests": count("tests"),
        "failures": count("failures"),
        "errors": count("errors"),
        "skipped": count("skipped"),
    }


def freshness(
    report_mtime: float,
    head_timestamp: int | None,
    worktree_dirty: bool,
    git_error: str | None,
) -> tuple[str, str]:
    if git_error or head_timestamp is None:
        return "STALE", f"Git freshness could not be established: {git_error or 'unknown Git state'}"
    if worktree_dirty:
        return "STALE", "Project changes exist; this report cannot be tied to a clean snapshot"
    if report_mtime < head_timestamp:
        return "STALE", "Report predates the current HEAD commit"
    return "CURRENT", "Generated at or after current HEAD with no project changes present"


def summarize_suite(
    name: str,
    filename: str,
    report_dir: Path,
    head_timestamp: int | None,
    worktree_dirty: bool,
    git_error: str | None,
) -> dict:
    path = report_dir / filename
    if not path.is_file():
        return {
            "name": name,
            "status": "MISSING",
            "path": path,
            "reason": "No report exists for this suite; it was not verified by this report set",
            "counts": None,
        }

    try:
        counts = parse_junit(path)
    except (ET.ParseError, OSError, ValueError) as error:
        return {
            "name": name,
            "status": "STALE",
            "path": path,
            "reason": f"Report is unreadable or invalid JUnit XML: {error}",
            "counts": None,
        }

    status, reason = freshness(path.stat().st_mtime, head_timestamp, worktree_dirty, git_error)
    return {
        "name": name,
        "status": status,
        "path": path,
        "reason": reason,
        "counts": counts,
    }


def build_report(report_dir: Path, root: Path) -> str:
    head_timestamp, worktree_dirty, git_error = git_snapshot(root)
    suites = [
        summarize_suite(name, filename, report_dir, head_timestamp, worktree_dirty, git_error)
        for name, filename in SUITES
    ]
    generated = datetime.now(timezone.utc).isoformat(timespec="seconds")
    lines = [
        "# Quality report",
        "",
        f"Generated: {generated}",
        "",
        "## Suite status",
        "",
        "| Suite | Status | Tests | Failures | Errors | Skipped | Report |",
        "|---|---:|---:|---:|---:|---:|---|",
    ]
    for suite in suites:
        counts = suite["counts"]
        values = [str(counts[key]) for key in ("tests", "failures", "errors", "skipped")] if counts else ["—"] * 4
        path_label = suite["path"].relative_to(root).as_posix() if suite["path"].is_relative_to(root) else suite["path"].as_posix()
        lines.append(
            f"| {suite['name']} | **{suite['status']}** | "
            + " | ".join(values)
            + f" | [{path_label}]({path_label}) |"
        )
        lines.append(f"| | | | | | | {suite['reason']} |")

    lines.extend([
        "",
        "## Browser diagnostics",
        "",
        "- [Browser execution log](browser-run.log)",
        "- [Structured browser debug summary](browser-debug.json)",
        "- Failure screenshots and traces: browser-artifacts/ (when captured)",
        "",
        "## Freshness contract",
        "",
        "- CURRENT means the JUnit file parses, its modification time is at or after the current Git HEAD commit, and the project worktree has no tracked or untracked changes outside this report directory.",
        "- STALE means the report is invalid, predates HEAD, the worktree is dirty, or Git freshness could not be established.",
        "- MISSING means no report exists. It is never treated as a pass or as a zero-test success.",
        "- A current report is evidence for the checked-out snapshot only; it does not prove lint, builds, accessibility, performance or manual release checks were performed.",
        "- This command only reads existing reports and Git metadata. It does not run tests or create CI workflows.",
        "",
        "## Release-readiness evidence",
        "",
        "| Check | Evidence | Status in this report |",
        "|---|---|---|",
        "| Backend, frontend and browser tests | Suite reports above | Report presence/freshness only; inspect counts and failures |",
        "| Lint and static analysis | Separate command output or CI evidence | Not assessed here |",
        "| Production builds | Separate build output or CI evidence | Not assessed here |",
        "| Accessibility | Automated scan plus documented keyboard/screen-reader review | Not assessed here |",
        "| Visual and responsive review | Manual review on agreed viewports/devices | Not assessed here |",
        "| Performance | Reproducible Lighthouse/Core Web Vitals or load evidence | Not assessed here |",
        "",
    ])
    return "\n".join(lines)


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--report-dir", type=Path, default=Path("build/test-reports"))
    parser.add_argument("--output", type=Path, default=None)
    args = parser.parse_args(argv)

    root = Path.cwd().resolve()
    report_dir = args.report_dir.resolve()
    output = (args.output or report_dir / "quality-summary.md").resolve()
    output.parent.mkdir(parents=True, exist_ok=True)
    report = build_report(report_dir, root)
    output.write_text(report, encoding="utf-8")
    print(f"Quality report: {output}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
