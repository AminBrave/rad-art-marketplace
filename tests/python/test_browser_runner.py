"""Focused tests for Playwright discovery and test classification."""

import sys
import unittest
from pathlib import Path

BROWSER_DIR = Path(__file__).resolve().parents[1] / "browser"
sys.path.insert(0, str(BROWSER_DIR))

from run_tests import flatten_tests, is_manual_dev_safe  # noqa: E402


class ManualSafeCase(unittest.TestCase):
    manual_dev_safe = True

    def runTest(self):
        pass


class UnclassifiedCase(unittest.TestCase):
    def runTest(self):
        pass


class MethodSafeCase(unittest.TestCase):
    def runTest(self):
        pass


MethodSafeCase.runTest.manual_dev_safe = True


class ManualBrowserSelectionTests(unittest.TestCase):
    def test_nested_suites_are_flattened_to_test_cases(self):
        suite = unittest.TestSuite([
            ManualSafeCase(),
            unittest.TestSuite([UnclassifiedCase()]),
        ])
        self.assertEqual(
            [case.__class__ for case in flatten_tests(suite)],
            [ManualSafeCase, UnclassifiedCase],
        )

    def test_manual_safe_cases_are_classified_for_listing(self):
        self.assertTrue(is_manual_dev_safe(ManualSafeCase()))

    def test_unclassified_cases_are_classified_for_listing(self):
        self.assertFalse(is_manual_dev_safe(UnclassifiedCase()))

    def test_per_method_manual_safe_marker_is_supported(self):
        self.assertTrue(is_manual_dev_safe(MethodSafeCase()))



if __name__ == "__main__":
    unittest.main()
