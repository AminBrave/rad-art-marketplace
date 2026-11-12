"""Authenticated conversation message-history loading and recovery journeys."""

import json
import unittest

from playwright.sync_api import sync_playwright

from config import BASE_URL, IGNORE_HTTPS_ERRORS


class MessagingHistoryResilienceTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.playwright = sync_playwright().start()
        cls.browser = cls.playwright.chromium.launch()

    @classmethod
    def tearDownClass(cls):
        cls.browser.close()
        cls.playwright.stop()

    def test_selected_conversation_history_can_be_retried_without_losing_context(self):
        context = self.browser.new_context(
            viewport={"width": 1280, "height": 900},
            ignore_https_errors=IGNORE_HTTPS_ERRORS,
        )
        page = context.new_page()
        page.set_default_timeout(15000)
        message_attempts = {"count": 0}
        conversation_id = 73010

        page.route(
            "**/api/v1/auth/me",
            lambda route: route.fulfill(
                status=200,
                content_type="application/json",
                body=json.dumps({
                    "data": {
                        "id": 73001,
                        "name": "خریدار آزمون",
                        "email": "buyer-history@example.test",
                        "role": "buyer",
                    }
                }),
            ),
        )

        thread = {
            "id": conversation_id,
            "participant": {"id": 73002, "name": "هنرمند گفتگو"},
            "unread_count": 1,
            "last_message": {"body": "پیام قبلی"},
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
                body=json.dumps({
                    "data": [thread],
                    "current_page": 1,
                    "last_page": 1,
                    "per_page": 20,
                    "total": 1,
                }),
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
                body=json.dumps({
                    "data": {"blocked_by_me": False, "blocked_by_other": False}
                }),
            ),
        )

        def message_history(route):
            message_attempts["count"] += 1
            if message_attempts["count"] == 1:
                route.fulfill(
                    status=503,
                    content_type="application/json",
                    body=json.dumps({"message": "Message history temporarily unavailable"}),
                )
                return

            route.fulfill(
                status=200,
                content_type="application/json",
                body=json.dumps({
                    "data": [{
                        "id": 73011,
                        "conversation_id": conversation_id,
                        "sender_id": 73002,
                        "body": "پیام بازیابی‌شده از تاریخچه گفتگو",
                        "created_at": "2026-11-12T10:00:00Z",
                        "read_at": None,
                        "attachments": [],
                        "reactions": [],
                    }],
                    "current_page": 1,
                    "last_page": 1,
                    "sync_cursor": "2026-11-12T10:00:00Z",
                }),
            )

        page.route(f"**/api/v1/conversations/{conversation_id}/messages", message_history)
        page.route(
            f"**/api/v1/conversations/{conversation_id}/read",
            lambda route: route.fulfill(
                status=200,
                content_type="application/json",
                body=json.dumps({"data": []}),
            ),
        )
        try:
            page.goto(
                BASE_URL + f"/dashboard/buyer/messages?conversation={conversation_id}",
                wait_until="commit",
            )
            page.get_by_role("heading", name="پیام‌ها").wait_for()
            page.get_by_role("heading", name="هنرمند گفتگو").wait_for()
            history_alert = page.get_by_role("alert").filter(has_text="دریافت پیام‌ها انجام نشد")
            history_alert.wait_for()
            self.assertFalse(page.get_by_text("هنوز پیامی در این گفتگو وجود ندارد.", exact=False).is_visible())
            self.assertIn(f"conversation={conversation_id}", page.url)

            with page.expect_response(
                lambda response: response.url.endswith(f"/api/v1/conversations/{conversation_id}/messages")
                and response.request.method == "GET"
                and response.status == 200
            ):
                history_alert.get_by_role("button", name="تلاش دوباره").click()

            page.get_by_text("پیام بازیابی‌شده از تاریخچه گفتگو", exact=True).wait_for()
            self.assertEqual(message_attempts["count"], 2)
            self.assertIn(f"conversation={conversation_id}", page.url)
            page.get_by_role("heading", name="هنرمند گفتگو").wait_for()
            self.assertFalse(history_alert.is_visible())
        finally:
            context.close()


if __name__ == "__main__":
    unittest.main(verbosity=2)
