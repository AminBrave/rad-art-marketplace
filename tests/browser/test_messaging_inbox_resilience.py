"""Authenticated messaging inbox loading and recovery journeys."""

import json
import unittest

from playwright.sync_api import sync_playwright

from config import BASE_URL, IGNORE_HTTPS_ERRORS


class MessagingInboxResilienceTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.playwright = sync_playwright().start()
        cls.browser = cls.playwright.chromium.launch()

    @classmethod
    def tearDownClass(cls):
        cls.browser.close()
        cls.playwright.stop()

    def test_buyer_inbox_failure_can_be_retried_into_empty_state(self):
        context = self.browser.new_context(
            viewport={"width": 1280, "height": 900},
            ignore_https_errors=IGNORE_HTTPS_ERRORS,
        )
        page = context.new_page()
        page.set_default_timeout(15000)
        attempts = {"count": 0}

        page.route(
            "**/api/v1/auth/me",
            lambda route: route.fulfill(
                status=200,
                content_type="application/json",
                body=json.dumps({
                    "data": {
                        "id": 73001,
                        "name": "خریدار آزمون",
                        "email": "buyer-inbox@example.test",
                        "role": "buyer",
                    }
                }),
            ),
        )

        def conversations(route):
            attempts["count"] += 1
            if attempts["count"] == 1:
                route.fulfill(
                    status=503,
                    content_type="application/json",
                    body=json.dumps({"message": "Inbox temporarily unavailable"}),
                )
                return

            route.fulfill(
                status=200,
                content_type="application/json",
                body=json.dumps({
                    "data": [],
                    "current_page": 1,
                    "last_page": 1,
                    "per_page": 20,
                    "total": 0,
                }),
            )

        page.route("**/api/v1/buyer/conversations**", conversations)
        try:
            page.goto(BASE_URL + "/dashboard/buyer/messages", wait_until="domcontentloaded")
            page.get_by_role("heading", name="پیام‌ها").wait_for()
            inbox_alert = page.get_by_role("alert").filter(has_text="دریافت گفتگوها انجام نشد")
            inbox_alert.wait_for()
            self.assertFalse(page.get_by_text("هنوز گفتگویی ندارید.", exact=False).is_visible())

            with page.expect_response(
                lambda response: "/api/v1/buyer/conversations" in response.url
                and response.request.method == "GET"
                and response.status == 200
            ):
                inbox_alert.get_by_role("button", name="تلاش دوباره").click()

            page.get_by_text("هنوز گفتگویی ندارید.", exact=False).wait_for()
            self.assertEqual(attempts["count"], 2)
            self.assertFalse(inbox_alert.is_visible())
        finally:
            context.close()


if __name__ == "__main__":
    unittest.main(verbosity=2)
