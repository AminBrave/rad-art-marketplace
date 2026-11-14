import os
import sys
import tempfile
import unittest
from pathlib import Path

BROWSER_TESTS = Path(__file__).resolve().parents[1] / "browser"
sys.path.insert(0, str(BROWSER_TESTS))

import diagnostics


class AutomaticBrowserDiagnosticsTests(unittest.TestCase):
    def setUp(self):
        self.temp_dir = tempfile.TemporaryDirectory()
        self.previous_report_dir = os.environ.get("RAD_ART_TEST_REPORT_DIR")
        os.environ["RAD_ART_TEST_REPORT_DIR"] = self.temp_dir.name
        diagnostics._PENDING.clear()

    def tearDown(self):
        diagnostics._PENDING.clear()
        if self.previous_report_dir is None:
            os.environ.pop("RAD_ART_TEST_REPORT_DIR", None)
        else:
            os.environ["RAD_ART_TEST_REPORT_DIR"] = self.previous_report_dir
        self.temp_dir.cleanup()

    def test_success_discards_temporary_browser_artifacts(self):
        test_id = "browser.TestCase.test_success"
        pending = Path(self.temp_dir.name) / "browser-artifacts" / ".pending" / "test" / "run"
        pending.mkdir(parents=True)
        (pending / "trace.zip").write_bytes(b"trace")
        diagnostics._PENDING[test_id] = [pending]

        diagnostics.finish_test_success(test_id)

        self.assertFalse(pending.exists())
        self.assertNotIn(test_id, diagnostics._PENDING)

    def test_failure_promotes_screenshots_trace_and_debug_to_test_folder(self):
        test_id = "browser.TestCase.test_failure"
        pending = Path(self.temp_dir.name) / "browser-artifacts" / ".pending" / "test" / "run"
        pending.mkdir(parents=True)
        for filename in ("failure-1.png", "trace.zip", "debug.json"):
            (pending / filename).write_bytes(b"artifact")
        diagnostics._PENDING[test_id] = [pending]

        saved = diagnostics.finish_test_failure(test_id)

        self.assertEqual(len(saved), 1)
        destination = Path(saved[0])
        self.assertEqual(destination.parent.parent, Path(self.temp_dir.name) / "browser-artifacts")
        self.assertTrue((destination / "failure-1.png").is_file())
        self.assertTrue((destination / "trace.zip").is_file())
        self.assertTrue((destination / "debug.json").is_file())
        self.assertFalse(pending.exists())


if __name__ == "__main__":
    unittest.main()
