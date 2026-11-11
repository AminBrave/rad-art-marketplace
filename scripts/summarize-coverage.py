"""Summarize the union of PHPUnit Clover statement coverage reports."""

from __future__ import annotations

import argparse
import xml.etree.ElementTree as ET
from pathlib import Path


def normalized_path(value: str) -> str:
    marker = "/app/"
    return "app/" + value.split(marker, 1)[1] if marker in value else value


def read_report(path: Path):
    root = ET.parse(path).getroot()
    project = root.find("project")
    if project is None:
        raise ValueError(f"{path} does not contain a Clover project element")

    metrics = project.find("metrics")
    suite_covered = int(metrics.attrib.get("coveredstatements", "0")) if metrics is not None else 0
    suite_total = int(metrics.attrib.get("statements", "0")) if metrics is not None else 0

    files: dict[str, dict[int, bool]] = {}
    for file_node in project.findall(".//file"):
        name = normalized_path(file_node.attrib["name"])
        lines = files.setdefault(name, {})
        for line in file_node.findall("./line"):
            if line.attrib.get("type") != "stmt":
                continue
            number = int(line.attrib["num"])
            covered = int(line.attrib.get("count", "0")) > 0
            lines[number] = lines.get(number, False) or covered

    return suite_covered, suite_total, files


def build_summary(reports: list[Path]) -> str:
    merged: dict[str, dict[int, bool]] = {}
    suite_rows = []

    for report in reports:
        covered, total, files = read_report(report)
        suite_rows.append((report.stem.replace("-clover", ""), covered, total))
        for name, lines in files.items():
            target = merged.setdefault(name, {})
            for number, is_covered in lines.items():
                target[number] = target.get(number, False) or is_covered

    total_statements = sum(len(lines) for lines in merged.values())
    covered_statements = sum(
        sum(1 for is_covered in lines.values() if is_covered)
        for lines in merged.values()
    )
    percentage = 100 * covered_statements / total_statements if total_statements else 0.0

    output = [
        "# Backend line-coverage summary",
        "",
        f"**Combined:** {covered_statements:,} / {total_statements:,} statements ({percentage:.1f}%).",
        "",
        "Coverage is the union of statement lines across the PHPUnit Unit, Feature and Integration reports. PCOV reports line/statement coverage; it does not provide branch/condition coverage.",
        "",
        "| Suite | Covered statements | Suite statements | Coverage |",
        "|---|---:|---:|---:|",
    ]

    for name, covered, total in suite_rows:
        pct = 100 * covered / total if total else 0.0
        output.append(f"| {name} | {covered:,} | {total:,} | {pct:.1f}% |")

    low_coverage = []
    for name, lines in merged.items():
        total = len(lines)
        if total < 5:
            continue
        covered = sum(1 for value in lines.values() if value)
        low_coverage.append((100 * covered / total, covered, total, name))

    output.extend([
        "",
        "## Lowest-covered application files",
        "",
        "| File | Covered statements | Coverage |",
        "|---|---:|---:|",
    ])
    for pct, covered, total, name in sorted(low_coverage)[:12]:
        output.append(f"| {name} | {covered}/{total} | {pct:.1f}% |")

    output.extend([
        "",
        "Use this report to prioritize meaningful behavior and risk branches. Do not add tests solely to increase a percentage.",
        "",
    ])
    return "\n".join(output)


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("reports", nargs="+", type=Path, help="PHPUnit Clover XML report files")
    parser.add_argument("--output", type=Path, help="Optional Markdown output path")
    args = parser.parse_args()

    missing = [str(path) for path in args.reports if not path.is_file()]
    if missing:
        parser.error("Coverage report(s) not found: " + ", ".join(missing))

    summary = build_summary(args.reports)
    if args.output:
        args.output.parent.mkdir(parents=True, exist_ok=True)
        args.output.write_text(summary, encoding="utf-8")
    print(summary, end="")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
