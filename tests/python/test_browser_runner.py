"""Focused tests for manual Playwright selection safety."""

import sys
import unittest
from pathlib import Path

BROWSER_DIR = Path(__file__).resolve().parents[1] / "browser"
sys.path.insert(0, str(BROWSER_DIR))

from run_tests import flatten_tests, is_manual_dev_safe, manual_selection_error  # noqa: E402


class ManualSafeCase(unittest.TestCase):
    manual_dev_safe = True

    def runTest(self):
        pass


class UnclassifiedCase(unittest.TestCase):
    def runTest(self):
        pass


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

    def test_manual_safe_cases_need_no_mutation_opt_in(self):
        self.assertTrue(is_manual_dev_safe(ManualSafeCase()))
        self.assertIsNone(manual_selection_error([ManualSafeCase()], allow_mutations=False))

    def test_per_method_manual_safe_marker_is_supported(self):
        case = UnclassifiedCase()
        case.runTest.manual_dev_safe = True
        self.assertTrue(is_manual_dev_safe(case))
        self.assertIsNone(manual_selection_error([case], allow_mutations=False))

    def test_unclassified_cases_are_blocked_without_mutation_opt_in(self):
        error = manual_selection_error([UnclassifiedCase()], allow_mutations=False)
        self.assertIn("manual_dev_safe", error)
        self.assertIn("UnclassifiedCase.runTest", error)

    def test_mutation_opt_in_allows_an_explicit_unclassified_selection(self):
        self.assertIsNone(manual_selection_error([UnclassifiedCase()], allow_mutations=True))

    def test_complete_manual_suite_requires_mutation_opt_in(self):
        error = manual_selection_error([ManualSafeCase()], allow_mutations=False, run_all=True)
        self.assertIn("complete browser suite", error)


if __name__ == "__main__":
    unittest.main()
