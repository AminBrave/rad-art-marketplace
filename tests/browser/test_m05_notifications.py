import json
import os
import unittest
from playwright.sync_api import sync_playwright

BASE_URL = os.environ.get("RAD_ART_BASE_URL", "http://127.0.0.1:8000")
BUYER = {"id": 42, "name": "Buyer QA", "email": "buyer@example.test", "role": "buyer"}
NOTIFICATION = {
    "id": "notification-uuid-1",
    "kind": "message_received",
    "conversation_id": 101,
    "message_id": 501,
    "sender_name": "هنرمند آزمایشی",
    "read_at": None,
    "created_at": "2026-11-10T10:30:00.000000Z",
}
THREAD = {
    "id": 101,
    "participant": {"name": "هنرمند آزمایشی"},
    "last_message": {"body": "سلام، درباره اثر شما توضیح بیشتری می‌دهم."},
    "last_message_at": "2026-11-10T10:30:00.000000Z",
    "unread_count": 1,
}
MESSAGE = {
    "id": 501,
    "sender_id": 84,
    "sender_name": "هنرمند آزمایشی",
    "body": "سلام، درباره اثر شما توضیح بیشتری می‌دهم.",
    "delivered_at": "2026-11-10T10:30:00.000000Z",
    "read_at": None,
    "created_at": "2026-11-10T10:30:00.000000Z",
    "reactions": [],
}


class MessageNotificationBrowserTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.playwright = sync_playwright().start()
        cls.browser = cls.playwright.chromium.launch()

    @classmethod
    def tearDownClass(cls):
        cls.browser.close()
        cls.playwright.stop()

    def new_page(self):
        context = self.browser.new_context(viewport={"width": 1280, "height": 900})
        page = context.new_page()
        page.set_default_timeout(15000)
        page.set_default_navigation_timeout(15000)
        page.route("**/api/v1/auth/me", lambda route: route.fulfill(
            status=200,
            content_type="application/json",
            body=json.dumps({"data": BUYER}, ensure_ascii=False),
        ))
        page.route("**/api/v1/notifications", lambda route: route.fulfill(
            status=200,
            content_type="application/json",
            body=json.dumps({
                "data": [NOTIFICATION],
                "current_page": 1,
                "last_page": 1,
                "per_page": 20,
                "total": 1,
                "unread_count": 1,
            }, ensure_ascii=False),
        ))

        def preferences(route):
            if route.request.method == "PATCH":
                payload = route.request.post_data_json
                route.fulfill(
                    status=200,
                    content_type="application/json",
                    body=json.dumps({"data": {
                        "in_app_messages": payload["in_app_messages"],
                        "email_messages": False,
                        "email_available": False,
                    }}),
                )
                return
            route.fulfill(
                status=200,
                content_type="application/json",
                body=json.dumps({"data": {
                    "in_app_messages": True,
                    "email_messages": False,
                    "email_available": False,
                }}),
            )
        page.route("**/api/v1/notifications/preferences", preferences)
        page.route("**/api/v1/notifications/notification-uuid-1/read", lambda route: route.fulfill(
            status=200, content_type="application/json", body='{"message":"read"}'
        ))
        page.route("**/api/v1/buyer/conversations", lambda route: route.fulfill(
            status=200,
            content_type="application/json",
            body=json.dumps({"data": [THREAD], "current_page": 1, "last_page": 1, "total": 1}, ensure_ascii=False),
        ))
        page.route("**/api/v1/conversations/101/messages", lambda route: route.fulfill(
            status=200,
            content_type="application/json",
            body=json.dumps({"data": [MESSAGE], "current_page": 1, "last_page": 1, "total": 1}, ensure_ascii=False),
        ))
        page.route("**/api/v1/conversations/101/read", lambda route: route.fulfill(
            status=200, content_type="application/json", body='{"data":{"updated_messages":1}}'
        ))
        return context, page

    def test_notification_opens_its_conversation_and_marks_it_read(self):
        context, page = self.new_page()
        try:
            page.goto(BASE_URL + "/dashboard/buyer/messages")
            page.get_by_role("heading", name="پیام‌ها").wait_for()
            page.get_by_role("button", name="اعلان‌ها").click()
            page.get_by_role("button", name="هنرمند آزمایشی پیام جدیدی فرستاد").click()
            page.wait_for_url("**/dashboard/buyer/messages?conversation=101")
            page.get_by_role("heading", name="هنرمند آزمایشی").wait_for()
            page.get_by_role("paragraph").filter(has_text=MESSAGE["body"]).wait_for()
        finally:
            context.close()

    def test_buyer_can_disable_in_app_message_notifications(self):
        context, page = self.new_page()
        try:
            page.goto(BASE_URL + "/dashboard/buyer/messages")
            page.get_by_role("button", name="اعلان‌ها").click()
            preference = page.get_by_label("اعلان پیام‌های جدید در این بخش")
            self.assertTrue(preference.is_checked())
            preference.uncheck()
            self.assertFalse(preference.is_checked())
            page.get_by_text("اعلان ایمیلی تا تأیید صف ارسال و تنظیمات میزبان غیرفعال است.").wait_for()
        finally:
            context.close()
