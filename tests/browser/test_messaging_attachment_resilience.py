"""Message attachment upload failure and idempotent retry browser journey."""

import json
import unittest

from playwright.sync_api import sync_playwright

from config import BASE_URL, IGNORE_HTTPS_ERRORS


class MessagingAttachmentResilienceTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.playwright = sync_playwright().start()
        cls.browser = cls.playwright.chromium.launch()

    @classmethod
    def tearDownClass(cls):
        cls.browser.close()
        cls.playwright.stop()

    def test_failed_attachment_upload_can_retry_without_duplicate_message_or_losing_draft(self):
        context = self.browser.new_context(
            viewport={"width": 1280, "height": 900},
            ignore_https_errors=IGNORE_HTTPS_ERRORS,
        )
        page = context.new_page()
        page.set_default_timeout(15000)
        conversation_id = 73020
        message_id = 73021
        message_attempts = []
        attachment_attempts = {"count": 0}

        page.route(
            "**/api/v1/auth/me",
            lambda route: route.fulfill(
                status=200,
                content_type="application/json",
                body=json.dumps({
                    "data": {
                        "id": 73001,
                        "name": "خریدار آزمون",
                        "email": "buyer-attachment@example.test",
                        "role": "buyer",
                    }
                }),
            ),
        )

        thread = {
            "id": conversation_id,
            "participant": {"id": 73002, "name": "هنرمند گفتگو"},
            "unread_count": 0,
            "last_message": {"body": "گفتگوی آزمایشی"},
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
        page.route(
            f"**/api/v1/conversations/{conversation_id}/read",
            lambda route: route.fulfill(
                status=200,
                content_type="application/json",
                body=json.dumps({"data": []}),
            ),
        )

        def create_message(route):
            payload = route.request.post_data_json
            message_attempts.append(payload.get("client_message_id"))
            route.fulfill(
                status=201,
                content_type="application/json",
                body=json.dumps({
                    "data": {
                        "id": message_id,
                        "conversation_id": conversation_id,
                        "sender_id": 73001,
                        "body": payload.get("body"),
                        "created_at": "2026-11-12T10:01:00Z",
                        "read_at": None,
                        "attachments": [],
                        "reactions": [],
                    }
                }),
            )

        def messages_endpoint(route):
            if route.request.method == "GET":
                route.fulfill(
                    status=200,
                    content_type="application/json",
                    body=json.dumps({
                        "data": [],
                        "current_page": 1,
                        "last_page": 1,
                        "sync_cursor": "2026-11-12T10:00:00Z",
                    }),
                )
            elif route.request.method == "POST":
                create_message(route)
            else:
                route.fulfill(
                    status=200,
                    content_type="application/json",
                    body=json.dumps({"data": []}),
                )

        page.route(
            f"**/api/v1/conversations/{conversation_id}/messages",
            messages_endpoint,
        )

        def upload_attachment(route):
            attachment_attempts["count"] += 1
            if attachment_attempts["count"] == 1:
                route.fulfill(
                    status=503,
                    content_type="application/json",
                    body=json.dumps({"message": "Attachment storage temporarily unavailable"}),
                )
                return

            route.fulfill(
                status=201,
                content_type="application/json",
                body=json.dumps({
                    "data": {
                        "id": 73022,
                        "name": "reference.pdf",
                        "mimeType": "application/pdf",
                        "size_bytes": 1024,
                    }
                }),
            )

        page.route(
            f"**/api/v1/conversations/{conversation_id}/messages/{message_id}/attachments",
            upload_attachment,
        )
        try:
            page.goto(
                BASE_URL + f"/dashboard/buyer/messages?conversation={conversation_id}",
                wait_until="commit",
            )
            page.get_by_role("heading", name="پیام‌ها").wait_for()
            page.get_by_role("heading", name="هنرمند گفتگو").wait_for()
            composer = page.locator('textarea[aria-label="متن پیام"]')
            composer.wait_for(state="visible")
            composer.fill("لطفاً این فایل را بررسی کنید.")
            page.get_by_label("انتخاب تصویر یا فایل PDF").set_input_files({
                "name": "reference.pdf",
                "mimeType": "application/pdf",
                "buffer": b"%PDF-1.4\\n%%EOF",
            })
            page.get_by_text("reference.pdf", exact=True).wait_for()

            # Submit through the form's native API to avoid a pointer-action race
            # with the composer's asynchronous preview/state updates.
            with page.expect_response(
                lambda response: response.url.endswith(
                    f"/api/v1/conversations/{conversation_id}/messages/{message_id}/attachments"
                ) and response.request.method == "POST" and response.status == 503
            ):
                send_button = page.get_by_role("button", name="ارسال پیام")
                send_button.wait_for(state="visible")
                send_button.evaluate("(button) => button.form.requestSubmit()")

            page.get_by_text("ارسال پیام یا پیوست انجام نشد", exact=False).wait_for()
            self.assertEqual(composer.input_value(), "لطفاً این فایل را بررسی کنید.")
            page.get_by_text("reference.pdf", exact=True).wait_for()
            self.assertEqual(len(message_attempts), 1)
            self.assertEqual(attachment_attempts["count"], 1)

            with page.expect_response(
                lambda response: response.url.endswith(
                    f"/api/v1/conversations/{conversation_id}/messages/{message_id}/attachments"
                ) and response.request.method == "POST" and response.status == 201
            ):
                send_button = page.get_by_role("button", name="ارسال پیام")
                send_button.wait_for(state="visible")
                send_button.evaluate("(button) => button.form.requestSubmit()")

            page.get_by_role("paragraph").filter(
                has_text="لطفاً این فایل را بررسی کنید."
            ).wait_for()
            page.get_by_role("link", name="دانلود reference.pdf").wait_for()
            self.assertEqual(
                page.get_by_role("article").filter(
                    has_text="لطفاً این فایل را بررسی کنید."
                ).count(),
                1,
            )
            self.assertEqual(len(message_attempts), 2)
            self.assertTrue(message_attempts[0])
            self.assertEqual(message_attempts[0], message_attempts[1])
            self.assertEqual(attachment_attempts["count"], 2)
            self.assertEqual(
                page.get_by_role("link", name="دانلود reference.pdf").get_attribute("href"),
                f"/api/v1/conversations/{conversation_id}/messages/{message_id}/attachments/73022",
            )
            self.assertEqual(composer.input_value(), "")
            self.assertFalse(page.get_by_role("button", name="حذف پیوست").is_visible())
        finally:
            context.close()


if __name__ == "__main__":
    unittest.main(verbosity=2)
