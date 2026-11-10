import os
import unittest

from playwright.sync_api import sync_playwright

BASE_URL = os.environ.get("RAD_ART_BASE_URL", "http://127.0.0.1:8000")
VIEWPORTS = (320, 375, 768, 1024, 1440)
PUBLIC_ROUTES = ("/", "/artworks", "/artists", "/login")


class ResponsiveRtlBrowserSmokeTests(unittest.TestCase):
    """Exercise the real Laravel-served app shell at supported viewport widths."""

    @classmethod
    def setUpClass(cls):
        cls.playwright = sync_playwright().start()
        cls.browser = cls.playwright.chromium.launch()

    @classmethod
    def tearDownClass(cls):
        cls.browser.close()
        cls.playwright.stop()

    def test_persian_document_metadata_and_responsive_overflow(self):
        context = self.browser.new_context(
            viewport={"width": 375, "height": 812},
            reduced_motion="reduce",
        )
        page = context.new_page()
        page.set_default_timeout(15000)
        page.route(
            "**/api/v1/**",
            lambda route: route.fulfill(
                status=200,
                content_type="application/json",
                body='{"data":[],"current_page":1,"last_page":1,"per_page":12,"total":0}',
            ),
        )

        try:
            for route_path in PUBLIC_ROUTES:
                response = page.goto(BASE_URL + route_path, wait_until="domcontentloaded")
                self.assertIsNotNone(response, f"No document response for {route_path}")
                self.assertLess(response.status, 400, f"{route_path} returned HTTP {response.status}")

                self.assertEqual(
                    page.locator("html").get_attribute("lang"),
                    "fa",
                    f"{route_path} must declare Persian as its document language",
                )
                self.assertEqual(
                    page.locator("html").get_attribute("dir"),
                    "rtl",
                    f"{route_path} must declare RTL document direction",
                )
                self.assertTrue(
                    page.locator('meta[name="viewport"]').count(),
                    f"{route_path} is missing the responsive viewport declaration",
                )

                for width in VIEWPORTS:
                    page.set_viewport_size({"width": width, "height": 812})
                    page.evaluate("() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)))")
                    dimensions = page.evaluate(
                        "() => ({ viewport: document.documentElement.clientWidth, "
                        "document: document.documentElement.scrollWidth, "
                        "body: document.body.scrollWidth })"
                    )
                    self.assertLessEqual(
                        dimensions["document"],
                        dimensions["viewport"] + 1,
                        f"Horizontal document overflow on {route_path} at {width}px: {dimensions}",
                    )
                    self.assertLessEqual(
                        dimensions["body"],
                        dimensions["viewport"] + 1,
                        f"Horizontal body overflow on {route_path} at {width}px: {dimensions}",
                    )
        finally:
            context.close()


if __name__ == "__main__":
    unittest.main()
