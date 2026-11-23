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
                if route_path == "/":
                    self.assertTrue(page.locator("#home-hero-title").is_visible())
                    landmarks_valid = page.locator("main section[aria-labelledby]").evaluate_all(
                        "(sections) => sections.every((section) => Boolean(document.getElementById(section.getAttribute(\"aria-labelledby\"))))"
                    )
                    self.assertTrue(landmarks_valid, "Editorial section landmarks must reference existing headings.")
                    page.set_viewport_size({"width": 375, "height": 812})
                    self.assertFalse(page.get_by_role("navigation", name="ناوبری اصلی").is_visible())
                    self.assertTrue(page.get_by_role("button", name="باز کردن منوی اصلی").is_visible())
                    page.set_viewport_size({"width": 1024, "height": 812})
                    self.assertTrue(page.get_by_role("navigation", name="ناوبری اصلی").is_visible())
                    self.assertFalse(page.get_by_role("button", name="باز کردن منوی اصلی").is_visible())
        finally:
            context.close()

    def test_messaging_mobile_conversation_transition_and_desktop_split_view(self):
        context = self.browser.new_context(
            viewport={"width": 375, "height": 812},
            reduced_motion="reduce",
            ignore_https_errors=IGNORE_HTTPS_ERRORS,
        )
        page = context.new_page()
        page.set_default_timeout(15000)
        thread = {
            "id": 7,
            "participant": {"id": 2, "name": "هنرمند آزمایشی"},
            "last_message": {"body": "برای شروع گفتگو پیام بفرستید"},
            "last_message_at": "2026-11-24T08:00:00Z",
            "unread_count": 0,
            "contexts": [],
        }

        def api_fixture(route):
            url = route.request.url
            method = route.request.method
            if url.endswith("/api/v1/auth/me"):
                payload = {"data": {"id": 1, "name": "خریدار آزمایشی", "email": "buyer@example.test", "role": "buyer"}}
            elif url.endswith("/api/v1/notifications/preferences"):
                payload = {"data": {"in_app_messages": True, "email_messages": False, "email_available": False}}
            elif url.endswith("/api/v1/notifications"):
                payload = {"data": [], "current_page": 1, "last_page": 1, "per_page": 20, "total": 0, "unread_count": 0}
            elif url.endswith("/api/v1/buyer/conversations"):
                payload = {"data": [thread], "current_page": 1, "last_page": 1, "per_page": 20, "total": 1}
            elif url.endswith("/api/v1/conversations/7/messages"):
                payload = {"data": [], "current_page": 1, "last_page": 1, "sync_cursor": None}
            elif url.endswith("/api/v1/conversations/7/safety"):
                payload = {"data": {"blocked_by_me": False, "blocked_by_other": False}}
            elif url.endswith("/api/v1/conversations/7"):
                payload = {"data": thread}
            elif url.endswith("/api/v1/conversations/7/read") and method == "PATCH":
                payload = {"data": None}
            else:
                payload = {"data": []}
            route.fulfill(status=200, content_type="application/json", body=__import__("json").dumps(payload))

        page.route("**/api/v1/**", api_fixture)
        try:
            response = page.goto(BASE_URL + "/dashboard/buyer/messages", wait_until="commit")
            self.assertIsNotNone(response, "No document response for buyer messaging")
            page.locator("aside[aria-label='فهرست گفتگوها']").wait_for(state="visible")
            thread_button = page.locator("aside[aria-label='فهرست گفتگوها'] button").filter(has_text="هنرمند آزمایشی").first
            thread_button.wait_for(state="visible")
            self.assertFalse(page.get_by_role("button", name="بازگشت به گفتگوها").is_visible())

            thread_button.click()
            page.get_by_role("button", name="بازگشت به گفتگوها").wait_for(state="visible")
            self.assertFalse(page.locator("aside[aria-label='فهرست گفتگوها']").is_visible())
            self.assertTrue(page.get_by_role("heading", name="هنرمند آزمایشی").is_visible())

            page.set_viewport_size({"width": 1024, "height": 812})
            page.evaluate("() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)))")
            self.assertTrue(page.locator("aside[aria-label='فهرست گفتگوها']").is_visible())
            dimensions = page.evaluate(
                "() => ({ viewport: document.documentElement.clientWidth, document: document.documentElement.scrollWidth })"
            )
            self.assertLessEqual(dimensions["document"], dimensions["viewport"] + 1, dimensions)

            page.set_viewport_size({"width": 375, "height": 812})
            page.get_by_role("button", name="بازگشت به گفتگوها").click()
            page.locator("aside[aria-label='فهرست گفتگوها']").wait_for(state="visible")
            self.assertFalse(page.get_by_role("button", name="بازگشت به گفتگوها").is_visible())
        finally:
            context.close()

    def test_message_attachment_failure_keeps_file_and_retries_idempotently(self):
        context = self.browser.new_context(
            viewport={"width": 1024, "height": 812},
            reduced_motion="reduce",
            ignore_https_errors=IGNORE_HTTPS_ERRORS,
        )
        page = context.new_page()
        page.set_default_timeout(15000)
        thread = {
            "id": 7,
            "participant": {"id": 2, "name": "هنرمند آزمایشی"},
            "last_message": {"body": "برای شروع گفتگو پیام بفرستید"},
            "last_message_at": "2026-11-24T08:00:00Z",
            "unread_count": 0,
            "contexts": [],
        }
        message_client_ids = []
        attachment_attempts = 0

        def api_fixture(route):
            nonlocal attachment_attempts
            url = route.request.url
            method = route.request.method
            if url.endswith("/api/v1/auth/me"):
                payload = {"data": {"id": 1, "name": "خریدار آزمایشی", "email": "buyer@example.test", "role": "buyer"}}
            elif url.endswith("/api/v1/notifications/preferences"):
                payload = {"data": {"in_app_messages": True, "email_messages": False, "email_available": False}}
            elif url.endswith("/api/v1/notifications"):
                payload = {"data": [], "current_page": 1, "last_page": 1, "per_page": 20, "total": 0, "unread_count": 0}
            elif url.endswith("/api/v1/buyer/conversations"):
                payload = {"data": [thread], "current_page": 1, "last_page": 1, "per_page": 20, "total": 1}
            elif url.endswith("/api/v1/conversations/7/messages") and method == "GET":
                payload = {"data": [], "current_page": 1, "last_page": 1, "sync_cursor": None}
            elif url.endswith("/api/v1/conversations/7/messages") and method == "POST":
                import json
                message_client_ids.append(json.loads(route.request.post_data)["client_message_id"])
                payload = {"data": {
                    "id": 71,
                    "conversation_id": 7,
                    "sender_user_id": 1,
                    "body": "فایل پیوست",
                    "created_at": "2026-11-24T08:01:00Z",
                    "sender": {"id": 1, "name": "خریدار آزمایشی"},
                    "attachments": [],
                    "reactions": [],
                    "reply_to": None,
                }}
            elif url.endswith("/api/v1/conversations/7/messages/71/attachments") and method == "POST":
                attachment_attempts += 1
                if attachment_attempts == 1:
                    route.fulfill(status=500, content_type="application/json", body='{"message":"Upload failed"}')
                    return
                payload = {"data": {
                    "id": 91,
                    "name": "reference.pdf",
                    "mime_type": "application/pdf",
                    "size_bytes": 12,
                }}
            elif url.endswith("/api/v1/conversations/7/safety"):
                payload = {"data": {"blocked_by_me": False, "blocked_by_other": False}}
            elif url.endswith("/api/v1/conversations/7"):
                payload = {"data": thread}
            elif url.endswith("/api/v1/conversations/7/read") and method == "PATCH":
                payload = {"data": None}
            else:
                payload = {"data": []}
            route.fulfill(status=200, content_type="application/json", body=__import__("json").dumps(payload))

        page.route("**/api/v1/**", api_fixture)
        try:
            response = page.goto(BASE_URL + "/dashboard/buyer/messages?conversation=7", wait_until="commit")
            self.assertIsNotNone(response, "No document response for buyer messaging")
            page.get_by_role("button", name="ارسال پیام").wait_for(state="visible")
            page.locator('input[type="file"][accept*="application/pdf"]').set_input_files({
                "name": "reference.pdf",
                "mimeType": "application/pdf",
                "buffer": b"%PDF-1.4\\n%%EOF",
            })

            page.get_by_role("button", name="ارسال پیام").click()
            page.get_by_text("پیام ذخیره شد، اما بارگذاری پیوست انجام نشد.", exact=False).wait_for(state="visible")
            self.assertEqual(attachment_attempts, 1)
            self.assertTrue(page.get_by_text("reference.pdf").is_visible())

            page.get_by_role("button", name="ارسال پیام").click()
            self.assertEqual(page.locator('input[type="file"]').evaluate("(element) => element.files.length"), 0)
            self.assertEqual(attachment_attempts, 2)
            self.assertEqual(len(message_client_ids), 2)
            self.assertEqual(message_client_ids[0], message_client_ids[1], "Retry must reuse the idempotency key")
        finally:
            context.close()

    def test_authenticated_workspaces_respect_rtl_and_viewport_widths(self):
        workspace_roles = (
            ("/dashboard/buyer", "buyer"),
            ("/dashboard/artist", "artist"),
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
            finally:
                context.close()


if __name__ == "__main__":
    unittest.main()
