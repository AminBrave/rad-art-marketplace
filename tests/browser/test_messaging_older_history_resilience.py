"""Older-message pagination failure, retry, de-duplication and scroll recovery."""

import json
import unittest
import re
from urllib.parse import parse_qs, urlparse

from playwright.sync_api import sync_playwright

from config import BASE_URL, IGNORE_HTTPS_ERRORS


class MessagingOlderHistoryResilienceTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.playwright = sync_playwright().start()
        cls.browser = cls.playwright.chromium.launch()

    @classmethod
    def tearDownClass(cls):
        cls.browser.close()
        cls.playwright.stop()

    def test_older_message_failure_can_retry_without_losing_messages_or_scroll_context(self):
        context = self.browser.new_context(
            viewport={"width": 1280, "height": 600},
            ignore_https_errors=IGNORE_HTTPS_ERRORS,
        )
        page = context.new_page()
        page.set_default_timeout(30000)
        page.set_default_navigation_timeout(30000)
        browser_errors = []
        api_responses = []
        page.on("pageerror", lambda error: browser_errors.append(str(error)))
        page.on("response", lambda response: api_responses.append(
            f"{response.request.method} {response.url} -> {response.status}"
        ) if "/api/v1/" in response.url else None)
        conversation_id = 73100
        older_attempts = {"count": 0}
        initial_messages = [{
            "id": 73110 + index,
            "conversation_id": conversation_id,
            "sender_id": 73102,
            "body": f"پیام موجود {index + 1} " + ("متن بلند برای ایجاد ارتفاع قابل پیمایش در تاریخچه گفتگو " * 10),
            "created_at": f"2026-11-{10 + (index // 5):02d}T10:{index % 60:02d}:00Z",
            "read_at": "2026-11-12T10:00:00Z",
            "attachments": [],
            "reactions": [],
        } for index in range(30)]

        page.route(
            "**/api/v1/auth/me",
            lambda route: route.fulfill(
                status=200,
                content_type="application/json",
                body=json.dumps({"data": {
                    "id": 73101,
                    "name": "خریدار صفحه‌بندی",
                    "email": "buyer-pagination@example.test",
                    "role": "buyer",
                }}),
            ),
        )

        # WorkspaceLayout loads notifications for every authenticated workspace.
        # Keep these shared shell requests authenticated so they cannot trigger
        # AuthContext's global 401 session-expiry handler in an otherwise mocked journey.
        page.route(
            "**/api/v1/notifications",
            lambda route: route.fulfill(
                status=200,
                content_type="application/json",
                body=json.dumps({"data": [], "unread_count": 0}),
            ),
        )
        page.route(
            "**/api/v1/notifications/preferences",
            lambda route: route.fulfill(
                status=200,
                content_type="application/json",
                body=json.dumps({"data": {
                    "in_app_messages": True,
                    "email_available": False,
                }}),
            ),
        )

        thread = {
            "id": conversation_id,
            "participant": {"id": 73102, "name": "هنرمند صفحه‌بندی"},
            "unread_count": 0,
            "last_message": {"body": "آخرین پیام موجود"},
            "last_message_at": "2026-11-12T10:00:00Z",
            "archived": False,
            "muted": False,
            "contexts": [],
        }
        page.route(
            "**/api/v1/buyer/conversations**",
            lambda route: route.fulfill(
                status=200,
                content_type="application/json",
                body=json.dumps({"data": [thread], "current_page": 1, "last_page": 1, "total": 1}),
            ),
        )
        page.route(
            f"**/api/v1/conversations/{conversation_id}",
            lambda route: route.fulfill(
                status=200,
                content_type="application/json",
                body=json.dumps({"data": thread}),
            ) if route.request.method == "GET" else route.continue_(),
        )
        page.route(
            f"**/api/v1/conversations/{conversation_id}/safety",
            lambda route: route.fulfill(
                status=200,
                content_type="application/json",
                body=json.dumps({"data": {"blocked_by_me": False, "blocked_by_other": False}}),
            ),
        )

        def message_history(route):
            query = parse_qs(urlparse(route.request.url).query)
            if "before_id" not in query:
                route.fulfill(
                    status=200,
                    content_type="application/json",
                    body=json.dumps({
                        "data": initial_messages,
                        "current_page": 1,
                        "last_page": 2,
                        "sync_cursor": "2026-11-12T10:00:00Z",
                    }),
                )
                return

            older_attempts["count"] += 1
            if older_attempts["count"] == 1:
                route.fulfill(
                    status=503,
                    content_type="application/json",
                    body=json.dumps({"message": "Older messages temporarily unavailable"}),
                )
                return

            older_messages = [{
                "id": 73100 + index,
                "conversation_id": conversation_id,
                "sender_id": 73102,
                "body": f"پیام قدیمی {index} " + ("متن قدیمی برای حفظ جایگاه پیمایش " * 3),
                "created_at": f"2026-11-09T10:0{index}:00Z",
                "read_at": "2026-11-12T10:00:00Z",
                "attachments": [],
                "reactions": [],
            } for index in range(1, 4)]
            # Include an overlap deliberately: the UI must not duplicate an existing message.
            older_messages.append(initial_messages[0])
            route.fulfill(
                status=200,
                content_type="application/json",
                body=json.dumps({
                    "data": older_messages,
                    "current_page": 1,
                    "last_page": 3,
                }),
            )

        page.route(re.compile(rf".*/api/v1/conversations/{conversation_id}/messages(?:\?.*)?$"), message_history)
        page.route(
            f"**/api/v1/conversations/{conversation_id}/read",
            lambda route: route.fulfill(
                status=200,
                content_type="application/json",
                body=json.dumps({"data": []}),
            ),
        )
        try:
            page.goto(BASE_URL + f"/dashboard/buyer/messages?conversation={conversation_id}", wait_until="commit")
            try:
                page.get_by_role("heading", name="پیام‌ها").wait_for()
            except Exception as failure:
                raise AssertionError(
                    "Messaging route did not render its heading. "
                    f"URL={page.url}; title={page.title()}; "
                    f"body={page.locator('body').inner_text()[:2000]!r}; "
                    f"browser_errors={browser_errors!r}; api_responses={api_responses[-20:]!r}"
                ) from failure
            page.get_by_role("heading", name="هنرمند صفحه‌بندی").wait_for()
            page.get_by_text(re.compile(r"^پیام موجود 1 ")).first.wait_for()
            log = page.locator('[role="log"][aria-label="پیام‌های گفتگو"]')
            log.wait_for(state="visible")
            page.wait_for_function(
                "() => { const node = document.querySelector('[role=log][aria-label=\"پیام‌های گفتگو\"]');"
                "return node && node.querySelectorAll('article').length === 30"
                " && node.scrollHeight > node.clientHeight + 100; }"
            )
            # Start from the bottom explicitly, then exercise native browser
            # scroll events to reach the older-history threshold deterministically.
            log.evaluate("(node) => { node.scrollTop = node.scrollHeight; }")
            page.wait_for_function(
                "() => { const node = document.querySelector('[role=log][aria-label=\"پیام‌های گفتگو\"]');"
                "return node && node.scrollTop > 72; }"
            )
            older_alert = page.get_by_role("alert").filter(has_text="دریافت پیام‌های قدیمی‌تر انجام نشد")
            try:
                log.evaluate("(node) => { node.scrollTop = 120; }")
                page.wait_for_function(
                    "() => { const node = document.querySelector('[role=log][aria-label=\"پیام‌های گفتگو\"]');"
                    "return node && node.scrollTop >= 100; }"
                )
                # The failed request must leave a visible error state. Further
                # scroll events must not silently retry it; recovery is user-triggered.
                log.evaluate("(node) => { node.scrollTop = 0; }")
                older_alert.wait_for()
            except Exception as failure:
                if log.count():
                    metrics = log.evaluate("(node) => ({scrollTop: node.scrollTop, scrollHeight: node.scrollHeight, clientHeight: node.clientHeight, articleCount: node.querySelectorAll('article').length})")
                else:
                    metrics = {"log_count": 0}
                raise AssertionError(
                    "Older-history pagination did not reach its expected failure state. "
                    f"scroll_metrics={metrics!r}; older_attempts={older_attempts['count']}; "
                    f"browser_errors={browser_errors!r}; api_responses={api_responses[-25:]!r}; "
                    f"URL={page.url}; body={page.locator('body').inner_text()[-1200:]!r}"
                ) from failure
            self.assertEqual(older_attempts["count"], 1)
            self.assertEqual(log.locator("article").count(), len(initial_messages))
            self.assertTrue(page.get_by_text(re.compile(r"^پیام موجود 1 ")).first.is_visible())

            with page.expect_response(
                lambda response: urlparse(response.url).path.endswith(f"/api/v1/conversations/{conversation_id}/messages")
                and "before_id" in parse_qs(urlparse(response.url).query)
                and response.request.method == "GET"
                and response.status == 200
            ) as retry_response:
                older_alert.get_by_role("button", name="تلاش دوباره").evaluate("(button) => button.click()")

            response_payload = retry_response.value.json()
            self.assertTrue(
                any(message.get("body", "").startswith("پیام قدیمی 1") for message in response_payload.get("data", [])),
                f"Retry endpoint did not return the expected older message: {response_payload!r}",
            )
            try:
                page.wait_for_function(
                    "() => { const node = document.querySelector('[role=log][aria-label=\"پیام‌های گفتگو\"]');"
                    "return node && node.querySelectorAll('article').length === 33"
                    " && node.innerText.includes('پیام قدیمی 1'); }"
                )
            except Exception as failure:
                metrics = log.evaluate("(node) => ({scrollTop: node.scrollTop, articleCount: node.querySelectorAll('article').length, text: node.innerText.slice(0, 1200)})")
                raise AssertionError(
                    "The retry returned older messages but the conversation UI did not merge/render them. "
                    f"payload={response_payload!r}; attempts={older_attempts['count']}; "
                    f"metrics={metrics!r}; browser_errors={browser_errors!r}; "
                    f"api_responses={api_responses[-20:]!r}"
                ) from failure

            self.assertEqual(older_attempts["count"], 2)
            self.assertEqual(log.locator("article").count(), len(initial_messages) + 3)
            self.assertEqual(page.get_by_text(re.compile(r"^پیام موجود 1 ")).count(), 1)
            self.assertGreater(log.evaluate("(node) => node.scrollTop"), 0)
            self.assertTrue(page.get_by_text(re.compile(r"^پیام موجود 1 "), exact=False).first.is_visible())
            self.assertFalse(older_alert.is_visible())
            self.assertIn(f"conversation={conversation_id}", page.url)
        finally:
            context.close()


if __name__ == "__main__":
    unittest.main(verbosity=2)
