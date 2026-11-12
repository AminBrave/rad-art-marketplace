"""Run Playwright unittest cases and emit a JUnit XML report using stdlib only."""

from __future__ import annotations

import os
import sys
import time
import unittest
import xml.etree.ElementTree as ET
from pathlib import Path


class TimedTextTestResult(unittest.TextTestResult):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.executed = []
        self.started_at = {}
        self.duration_by_id = {}

    def startTest(self, test):
        self.executed.append(test)
        self.started_at[test.id()] = time.perf_counter()
        super().startTest(test)

    def stopTest(self, test):
        started = self.started_at.pop(test.id(), None)
        self.duration_by_id[test.id()] = time.perf_counter() - started if started is not None else 0.0
        super().stopTest(test)


def write_junit_report(result: TimedTextTestResult, destination: Path) -> None:
    failures = {test.id(): detail for test, detail in result.failures}
    errors = {test.id(): detail for test, detail in result.errors}
    skipped = {test.id(): reason for test, reason in result.skipped}
    total_time = sum(result.duration_by_id.values())

    suite = ET.Element(
        "testsuite",
        {
            "name": "Rademan Playwright Browser Suite",
            "tests": str(result.testsRun),
            "failures": str(len(failures)),
            "errors": str(len(errors)),
            "skipped": str(len(skipped)),
            "time": f"{total_time:.3f}",
        },
    )

    for test in result.executed:
        test_id = test.id()
        case = ET.SubElement(
            suite,
            "testcase",
            {
                "classname": test.__class__.__module__ + "." + test.__class__.__name__,
                "name": getattr(test, "_testMethodName", test_id),
                "time": f"{result.duration_by_id.get(test_id, 0.0):.3f}",
            },
        )
        if test_id in failures:
            ET.SubElement(case, "failure", {"message": "Assertion failure"}).text = failures[test_id]
        elif test_id in errors:
            ET.SubElement(case, "error", {"message": "Test error"}).text = errors[test_id]
        elif test_id in skipped:
            ET.SubElement(case, "skipped", {"message": skipped[test_id]})

    destination.parent.mkdir(parents=True, exist_ok=True)
    ET.indent(suite, space="  ")
    ET.ElementTree(suite).write(destination, encoding="utf-8", xml_declaration=True)


def main() -> int:
    try:
        import playwright.sync_api
    except ImportError:
        print(
            "Playwright is required for local browser tests. Install requirements-test.txt "
            "and run 'python -m playwright install chromium'.",
            file=sys.stderr,
        )
        return 2

    browser_dir = Path(__file__).resolve().parent
    sys.path.insert(0, str(browser_dir))
    suite = unittest.defaultTestLoader.discover(
        start_dir=str(browser_dir),
        pattern="test_*.py",
        top_level_dir=str(browser_dir),
    )
    runner = unittest.TextTestRunner(verbosity=2, resultclass=TimedTextTestResult)
    result = runner.run(suite)

    report_dir = Path(os.environ.get("RAD_ART_TEST_REPORT_DIR", "build/test-reports"))
    report_path = report_dir / "browser-junit.xml"
    write_junit_report(result, report_path)
    print(f"JUnit browser report: {report_path}")

    return 0 if result.wasSuccessful() else 1


if __name__ == "__main__":
    raise SystemExit(main())
