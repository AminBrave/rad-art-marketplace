import unittest

from playwright.sync_api import sync_playwright

from config import BASE_URL, IGNORE_HTTPS_ERRORS

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
            ignore_https_errors=IGNORE_HTTPS_ERRORS,
        )
        page = context.new_page()
        page.set_default_timeout(15000)

        def api_fixture(route):
            if route.request.url.endswith("/api/v1/auth/me"):
                payload = '{"data":null}'
            else:
                payload = '{"data":[],"current_page":1,"last_page":1,"per_page":12,"total":0}'
            route.fulfill(status=200, content_type="application/json", body=payload)

        page.route("**/api/v1/**", api_fixture)

        try:
            for route_path in PUBLIC_ROUTES:
                response = page.goto(BASE_URL + route_path, wait_until="commit")
                self.assertIsNotNone(response, f"No document response for {route_path}")
                page.locator('html[lang="fa"][dir="rtl"]').wait_for(state="attached")
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
                    page.evaluate(
                        "() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)))"
                    )
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

    def test_authenticated_workspaces_respect_rtl_and_viewport_widths(self):
        workspace_roles = (
            ("/dashboard/buyer", "buyer"),
            ("/dashboard/buyer/messages", "buyer"),
            ("/dashboard/artist", "artist"),
            ("/dashboard/artist/messages", "artist"),
            ("/admin", "admin"),
        )
        for route_path, role in workspace_roles:
            context = self.browser.new_context(
                viewport={"width": 375, "height": 812},
                reduced_motion="reduce",
                ignore_https_errors=IGNORE_HTTPS_ERRORS,
            )
            page = context.new_page()
            page.set_default_timeout(15000)

            def api_fixture(route):
                url = route.request.url
                if url.endswith("/api/v1/auth/me"):
                    payload = {"data": {"id": 1, "name": "کاربر آزمایشی", "email": "test@example.test", "role": role}}
                elif url.endswith("/api/v1/notifications/preferences"):
                    payload = {"data": {"in_app_messages": True, "email_messages": False, "email_available": False}}
                elif url.endswith("/api/v1/notifications"):
                    payload = {"data": [], "current_page": 1, "last_page": 1, "per_page": 20, "total": 0, "unread_count": 0}
                elif url.endswith("/api/v1/artist-profile/me"):
                    payload = {"data": None}
                else:
                    payload = {"data": [], "current_page": 1, "last_page": 1, "per_page": 20, "total": 0}
                route.fulfill(status=200, content_type="application/json", body=__import__("json").dumps(payload))

            page.route("**/api/v1/**", api_fixture)
            try:
                response = page.goto(BASE_URL + route_path, wait_until="commit")
                self.assertIsNotNone(response, f"No document response for {route_path}")
                self.assertLess(response.status, 400, f"{route_path} returned HTTP {response.status}")
                page.locator("#app").get_by_role("heading").first.wait_for()
                self.assertEqual(page.locator("html").get_attribute("lang"), "fa")
                self.assertEqual(page.locator("html").get_attribute("dir"), "rtl")
                for width in VIEWPORTS:
                    page.set_viewport_size({"width": width, "height": 812})
                    page.evaluate(
                        "() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)))"
                    )
                    dimensions = page.evaluate(
                        "() => ({ viewport: document.documentElement.clientWidth, "
                        "document: document.documentElement.scrollWidth, body: document.body.scrollWidth })"
                    )
                    self.assertLessEqual(
                        dimensions["document"], dimensions["viewport"] + 1,
                        f"Horizontal document overflow on {route_path} at {width}px: {dimensions}",
                    )
                    self.assertLessEqual(
                        dimensions["body"], dimensions["viewport"] + 1,
                        f"Horizontal body overflow on {route_path} at {width}px: {dimensions}",
                    )
                    if route_path.endswith("/messages"):
                        viewport_height = page.evaluate("() => window.innerHeight")
                        shell_height = page.locator(".ra-workspace-shell").evaluate(
                            "(node) => node.getBoundingClientRect().height"
                        )
                        document_height = page.evaluate("() => document.documentElement.scrollHeight")
                        content_height = page.locator(".ra-workspace-content").evaluate(
                            "(node) => node.getBoundingClientRect().height"
                        )
                        chat_height = page.locator(".rad-messaging > .grid").evaluate(
                            "(node) => node.getBoundingClientRect().height"
                        )
                        history_overflow = page.get_by_role("log", name="پیام‌های گفتگو").evaluate(
                            "(node) => getComputedStyle(node).overflowY"
                        )
                        self.assertGreaterEqual(
                            chat_height, viewport_height - 2,
                            f"Main chat panel must be at least one browser viewport tall on {route_path} at {width}px",
                        )
                        self.assertEqual(
                            history_overflow, "auto",
                            f"Message history must remain independently scrollable on {route_path} at {width}px",
                        )
                        self.assertGreater(
                            document_height, viewport_height,
                            f"Messaging page must scroll vertically past the header and navigation on {route_path} at {width}px",
                        )
                        self.assertGreater(
                            shell_height, viewport_height,
                            f"Messaging workspace must grow naturally with the full-height chat panel on {route_path} at {width}px",
                        )
                        self.assertGreater(
                            content_height, viewport_height * 0.9,
                            f"Messaging content must not be constrained to the remaining space below the header on {route_path} at {width}px",
                        )
            finally:
                context.close()


if __name__ == "__main__":
    unittest.main()
