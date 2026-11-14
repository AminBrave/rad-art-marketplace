import sys
import tempfile
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / "scripts"))

from summarize_test_reports import freshness, parse_junit, summarize_suite


class QualityReportTests(unittest.TestCase):
    def test_parses_junit_suite_counts(self):
        with tempfile.TemporaryDirectory() as directory:
            report = Path(directory) / "backend-junit.xml"
            report.write_text(
                '<testsuites tests="8" failures="1" errors="2" skipped="3">'
                '<testsuite name="unit" tests="8" failures="1" errors="2" skipped="3"/>'
                '</testsuites>',
                encoding="utf-8",
            )
            self.assertEqual(
                parse_junit(report),
                {"tests": 8, "failures": 1, "errors": 2, "skipped": 3},
            )

    def test_missing_report_is_not_a_pass(self):
        with tempfile.TemporaryDirectory() as directory:
            result = summarize_suite("Browser", "browser-junit.xml", Path(directory), 100, False, None)
            self.assertEqual(result["status"], "MISSING")
            self.assertIsNone(result["counts"])
            self.assertIn("not verified", result["reason"])

    def test_report_is_current_only_for_clean_current_snapshot(self):
        self.assertEqual(freshness(101, 100, False, None)[0], "CURRENT")
        self.assertEqual(freshness(99, 100, False, None)[0], "STALE")
        self.assertEqual(freshness(101, 100, True, None)[0], "STALE")
        self.assertEqual(freshness(101, None, False, "git unavailable")[0], "STALE")


if __name__ == "__main__":
    unittest.main()
