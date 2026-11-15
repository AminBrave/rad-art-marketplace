"""Computed-color accessibility checks against the live development app.

The pages are read-only. The audit uses browser-computed styles, so Tailwind
utilities and CSS variables are evaluated as the browser actually renders them.
"""

from pathlib import Path
import unittest

from playwright.sync_api import sync_playwright

from config import BASE_URL, IGNORE_HTTPS_ERRORS


ROOT = Path(__file__).resolve().parents[3]
AUDIT_SOURCE = (
    ROOT / "resources" / "js" / "lib" / "colorAccessibility.js"
).read_text(encoding="utf-8")
AUDIT_SCRIPT = AUDIT_SOURCE.replace("export function ", "function ")
AUDIT_SCRIPT += "\nwindow.__radColorAccessibilityAudit = auditColorAccessibility;"


class RenderedColorContrastTests(unittest.TestCase):
    """Read-only browser checks; no application records are created or changed."""

    manual_dev_safe = True

    @classmethod
    def setUpClass(cls):
        cls.playwright = sync_playwright().start()
        cls.browser = cls.playwright.chromium.launch()

    @classmethod
    def tearDownClass(cls):
        cls.browser.close()
        cls.playwright.stop()

    def test_public_and_auth_screens_have_no_computed_color_contrast_failures(self):
        context = self.browser.new_context(
            viewport={"width": 1365, "height": 900},
            ignore_https_errors=IGNORE_HTTPS_ERRORS,
        )
        page = context.new_page()
        page.set_default_timeout(15000)

        try:
            for route in ("/login", "/register", "/artworks"):
                response = page.goto(BASE_URL + route, wait_until="domcontentloaded")
                self.assertIsNotNone(response, f"No document response for {route}")
                self.assertLess(response.status, 400, f"{route} returned HTTP {response.status}")
                page.locator("main").first.wait_for(state="visible")

                page.add_script_tag(content=AUDIT_SCRIPT)
                result = page.evaluate("() => window.__radColorAccessibilityAudit(document)")

                self.assertGreater(
                    result["textChecks"],
                    0,
                    f"The computed-style audit did not inspect any text on {route}: {result}",
                )
                self.assertEqual(
                    result["failures"],
                    [],
                    f"Computed WCAG contrast failures on {route}: {result['failures']}",
                )
        finally:
            context.close()


if __name__ == "__main__":
    unittest.main(verbosity=2)
