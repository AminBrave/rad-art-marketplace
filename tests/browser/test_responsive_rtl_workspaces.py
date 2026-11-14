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
                response = page.goto(BASE_URL + route_path + ("?conversation=1" if route_path.endswith("/messages") else ""), wait_until="commit")
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
                        header = page.locator(".ra-public-header")
                        header_height = header.evaluate("(node) => node.getBoundingClientRect().height")
                        chat_page = page.locator(".ra-chat-page")
                        chat_height = chat_page.evaluate("(node) => node.getBoundingClientRect().height")
                        document_height = page.evaluate("() => document.documentElement.scrollHeight")
                        page.get_by_role("log", name="پیام‌های گفتگو").wait_for()
                        composer = page.locator(".ra-chat-layout > div > form")
                        composer.wait_for()
                        history = page.get_by_role("log", name="پیام‌های گفتگو")
                        history_overflow = history.evaluate("(node) => getComputedStyle(node).overflowY")
                        header_bottom = page.locator(".ra-chat-layout > div > header").evaluate(
                            "(node) => node.getBoundingClientRect().bottom"
                        )
                        history_top = history.evaluate("(node) => node.getBoundingClientRect().top")
                        history_bottom = history.evaluate("(node) => node.getBoundingClientRect().bottom")
                        composer_top = composer.evaluate("(node) => node.getBoundingClientRect().top")
                        composer_bottom = composer.evaluate("(node) => node.getBoundingClientRect().bottom")
                        nav_top = page.locator(".ra-workspace-bottom-nav").evaluate(
                            "(node) => node.getBoundingClientRect().top"
                        )
                        nav_height = page.locator(".ra-workspace-bottom-nav").evaluate(
                            "(node) => node.getBoundingClientRect().height"
                        )
                        self.assertGreaterEqual(
                            chat_height, viewport_height - header_height - nav_height - 2,
                            f"Chat must fill the space between the site header and bottom navigation on {route_path} at {width}px",
                        )

                        self.assertLessEqual(
                            abs((header_height + chat_height + nav_height) - viewport_height), 3,
                            f"Chat viewport must reserve space for the site header and bottom navigation on {route_path} at {width}px",
                        )
                        self.assertEqual(
                            history_overflow, "auto",
                            f"Message history must remain independently scrollable on {route_path} at {width}px",
                        )
                        self.assertLessEqual(
                            header_bottom, history_top + 1,
                            f"Conversation header must occupy its own row above messages on {route_path} at {width}px",
                        )
                        self.assertLessEqual(
                            history_bottom, composer_top + 1,
                            f"Composer must occupy its own row below messages on {route_path} at {width}px",
                        )
                        self.assertLessEqual(
                            composer_bottom, nav_top + 1,
                            f"Composer must remain above the fixed workspace navigation on {route_path} at {width}px",
                        )
                        self.assertLessEqual(
                            document_height, viewport_height + 2,
                            f"Dedicated chat page must not create outer-page scrolling on {route_path} at {width}px",
                        )
                        self.assertEqual(
                            page.locator("footer").count(), 0,
                            f"Chat page must not render the site footer on {route_path}",
                        )
                        workspace_nav = page.locator('nav[aria-label="ناوبری فضای کاربری"]')
                        self.assertEqual(
                            workspace_nav.count(), 1,
                            f"Chat page must keep one persistent workspace navigation on {route_path}",
                        )
                        self.assertEqual(
                            workspace_nav.evaluate("(node) => getComputedStyle(node).position"), "fixed",
                            f"Workspace navigation must remain fixed on chat pages on {route_path}",
                        )
                        self.assertTrue(
                            workspace_nav.get_by_role("link", name="پیام‌ها").get_attribute("aria-current") == "page",
                            f"Current chat destination must be announced as active on {route_path}",
                        )
            finally:
                context.close()


if __name__ == "__main__":
    unittest.main()
