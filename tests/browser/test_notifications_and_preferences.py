import json
import re
import unittest
from playwright.sync_api import expect, sync_playwright

from config import BASE_URL, IGNORE_HTTPS_ERRORS
from diagnostics import save_failure_diagnostics, start_page_diagnostics, stop_page_diagnostics

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
INBOX_CONVERSATIONS_ROUTE = re.compile(r".*/api/v1/buyer/conversations(?:\?.*)?$")
MESSAGES_ROUTE = re.compile(r".*/api/v1/conversations/101/messages/?(?:\?.*)?$")
READ_ROUTE = re.compile(r".*/api/v1/conversations/101/read/?(?:\?.*)?$")
SAFETY_ROUTE = re.compile(r".*/api/v1/conversations/101/safety/?(?:\?.*)?$")

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
        context = self.browser.new_context(viewport={"width": 1280, "height": 900}, ignore_https_errors=IGNORE_HTTPS_ERRORS)
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
        page.route(INBOX_CONVERSATIONS_ROUTE, lambda route: route.fulfill(
            status=200,
            content_type="application/json",
            body=json.dumps({"data": [THREAD], "current_page": 1, "last_page": 1, "total": 1}, ensure_ascii=False),
        ))
        page.route(MESSAGES_ROUTE, lambda route: route.fulfill(
            status=200,
            content_type="application/json",
            body=json.dumps({"data": [MESSAGE], "current_page": 1, "last_page": 1, "total": 1}, ensure_ascii=False),
        ))
        page.route(READ_ROUTE, lambda route: route.fulfill(
            status=200, content_type="application/json", body='{"data":{"updated_messages":1}}'
        ))
        page.route(SAFETY_ROUTE, lambda route: route.fulfill(
            status=200, content_type="application/json", body=json.dumps({"data": {"blocked_by_me": False, "blocked_by_other": False}})
        ))
        return context, page

    def test_inbox_fixture_does_not_match_nested_conversation_routes(self):
        self.assertIsNotNone(INBOX_CONVERSATIONS_ROUTE.match("http://localhost/api/v1/buyer/conversations?search=test"))
        self.assertIsNone(INBOX_CONVERSATIONS_ROUTE.match("http://localhost/api/v1/buyer/conversations/101/messages"))
        self.assertIsNotNone(MESSAGES_ROUTE.match("http://localhost/api/v1/conversations/101/messages?page=2"))
        self.assertIsNone(MESSAGES_ROUTE.match("http://localhost/api/v1/conversations/101/messages/attachments"))

    def test_conversation_filter_tabs_support_rtl_arrow_home_and_end_keys(self):
        context, page = self.new_page()
        try:
            page.goto(BASE_URL + "/dashboard/buyer/messages", wait_until="domcontentloaded")
            page.get_by_role("heading", name="پیام‌ها").wait_for()

            tabs = page.get_by_role("tablist", name="فیلتر گفتگوها")
            all_tab = tabs.get_by_role("tab", name="همه")
            unread_tab = tabs.get_by_role("tab", name="خوانده‌نشده")
            archived_tab = tabs.get_by_role("tab", name="بایگانی")

            all_tab.focus()
            self.assertEqual(page.evaluate("document.activeElement.id"), "conversation-filter-all")
            page.keyboard.press("ArrowLeft")
            self.assertEqual(page.evaluate("document.activeElement.id"), "conversation-filter-unread")
            self.assertEqual(unread_tab.get_attribute("aria-selected"), "true")
            self.assertEqual(unread_tab.get_attribute("tabindex"), "0")
            self.assertEqual(all_tab.get_attribute("tabindex"), "-1")

            page.keyboard.press("ArrowRight")
            self.assertEqual(page.evaluate("document.activeElement.id"), "conversation-filter-all")
            self.assertEqual(all_tab.get_attribute("aria-selected"), "true")

            page.keyboard.press("End")
            self.assertEqual(page.evaluate("document.activeElement.id"), "conversation-filter-archived")
            self.assertEqual(archived_tab.get_attribute("aria-selected"), "true")

            page.keyboard.press("Home")
            self.assertEqual(page.evaluate("document.activeElement.id"), "conversation-filter-all")
            self.assertEqual(all_tab.get_attribute("aria-selected"), "true")
        finally:
            context.close()

    def test_notification_opens_its_conversation_and_marks_it_read(self):
        context, page = self.new_page()
        try:
            page.goto(BASE_URL + "/dashboard/buyer/messages")
            page.get_by_role("heading", name="پیام‌ها").wait_for()
            api_requests = []
            page.on("request", lambda request: api_requests.append(request.url))
            page.get_by_role("button", name="اعلان‌ها").click()
            with page.expect_response(lambda response: "/api/v1/conversations/101/messages" in response.url and response.request.method == "GET", timeout=15_000) as messages_response:
                page.get_by_role("button", name="هنرمند آزمایشی پیام جدیدی فرستاد").click()
            page.wait_for_url("**/dashboard/buyer/messages?conversation=101")
            page.get_by_role("heading", name="هنرمند آزمایشی").wait_for()
            self.assertEqual(200, messages_response.value.status)
            self.assertTrue(
                any("/api/v1/conversations/101/messages" in url for url in api_requests),
                f"Conversation message endpoint was not requested. Requests: {api_requests}",
            )
            page.get_by_role("paragraph").filter(has_text=MESSAGE["body"]).wait_for()
        finally:
            context.close()

    def test_buyer_can_disable_in_app_message_notifications(self):
        context, page = self.new_page()
        diagnostics = start_page_diagnostics(context, page, self.id())
        preference_requests = []
        page.on(
            "request",
            lambda request: preference_requests.append(request.method)
            if "/api/v1/notifications/preferences" in request.url
            else None,
        )
        try:
            page.goto(BASE_URL + "/dashboard/buyer/messages", wait_until="domcontentloaded")
            page.get_by_role("button", name="اعلان‌ها").click()
            preference = page.get_by_label("اعلان پیام‌های جدید در این بخش")
            expect(preference).to_be_checked()

            # Observe the actual persistence request instead of letting uncheck()
            # hide whether React rejected an optimistic update or the API failed.
            with page.expect_response(
                lambda response: "/api/v1/notifications/preferences" in response.url
                and response.request.method == "PATCH",
                timeout=15_000,
            ) as patch_response:
                preference.click()

            response = patch_response.value
            self.assertEqual(
                response.status,
                200,
                f"Preference PATCH failed. Requests: {preference_requests}",
            )
            self.assertEqual(
                response.request.post_data_json,
                {"in_app_messages": False},
                "The checkbox click did not submit the expected disabled preference.",
            )
            expect(preference).not_to_be_checked(timeout=5_000)
            self.assertEqual(
                preference_requests,
                ["GET", "PATCH"],
                "The preference query was unexpectedly refetched after the successful PATCH.",
            )
            self.assertFalse(
                page.get_by_role("alert").count(),
                "The UI reported a preference-save error after a successful PATCH.",
            )
            page.get_by_text("اعلان ایمیلی تا تأیید صف ارسال و تنظیمات میزبان غیرفعال است.").wait_for()
        except Exception as error:
            artifact_dir = save_failure_diagnostics(context, page, diagnostics, error)
            error.add_note(f"Playwright failure artifacts: {artifact_dir}")
            raise
        finally:
            stop_page_diagnostics(context, diagnostics)
            context.close()
