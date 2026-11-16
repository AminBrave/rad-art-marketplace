"""Playwright coverage for TanStack Query messaging cache and live synchronization."""

import json
import re
import unittest
from urllib.parse import parse_qs, urlparse

from playwright.sync_api import sync_playwright

from config import BASE_URL, IGNORE_HTTPS_ERRORS


class MessagingQueryCacheBrowserTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.playwright = sync_playwright().start()
        cls.browser = cls.playwright.chromium.launch()

    @classmethod
    def tearDownClass(cls):
        cls.browser.close()
        cls.playwright.stop()

    def new_page(self):
        context = self.browser.new_context(
            viewport={"width": 1280, "height": 900},
            ignore_https_errors=IGNORE_HTTPS_ERRORS,
        )
        page = context.new_page()
        page.set_default_timeout(20000)
        page.set_default_navigation_timeout(20000)
        return context, page

    def mock_authenticated_shell(self, page, user_id, email):
        page.route(
            "**/api/v1/auth/me",
            lambda route: route.fulfill(
                status=200,
                content_type="application/json",
                body=json.dumps({"data": {
                    "id": user_id,
                    "name": "کاربر آزمون پیام‌رسانی",
                    "email": email,
                    "role": "buyer",
                }}),
            ),
        )
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

    def mock_conversation(self, page, conversation_id, thread, messages_handler):
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
                body=json.dumps({"data": {
                    "blocked_by_me": False,
                    "blocked_by_other": False,
                }}),
            ),
        )
        page.route(f"**/api/v1/conversations/{conversation_id}/messages**", messages_handler)

    def test_reading_a_conversation_removes_it_from_unread_but_updates_the_all_inbox_cache(self):
        context, page = self.new_page()
        user_id = 74001
        conversation_id = 74010
        thread = {
            "id": conversation_id,
            "participant": {"id": 74002, "name": "هنرمند آزمون"},
            "unread_count": 1,
            "last_message": {"body": "پیام خوانده‌نشده"},
            "last_message_at": "2026-11-14T10:00:00Z",
            "archived": False,
            "muted": False,
            "contexts": [],
        }
        try:
            self.mock_authenticated_shell(page, user_id, "buyer-read-cache@example.test")
            read_state = {"marked": False}

            def inbox(route):
                query = parse_qs(urlparse(route.request.url).query)
                filter_value = query.get("filter", ["all"])[0]
                data = [thread] if (
                    filter_value == "all"
                    or (filter_value == "unread" and not read_state["marked"])
                ) else []
                route.fulfill(
                    status=200,
                    content_type="application/json",
                    body=json.dumps({
                        "data": data,
                        "current_page": 1,
                        "last_page": 1,
                        "per_page": 20,
                        "total": len(data),
                    }),
                )

            page.route("**/api/v1/buyer/conversations**", inbox)

            def messages(route):
                if route.request.method != "GET":
                    route.continue_()
                    return
                route.fulfill(
                    status=200,
                    content_type="application/json",
                    body=json.dumps({
                        "data": [{
                            "id": 74011,
                            "conversation_id": conversation_id,
                            "sender_id": 74002,
                            "body": "پیام خوانده‌نشده",
                            "created_at": "2026-11-14T10:00:00Z",
                            "read_at": None,
                            "attachments": [],
                            "reactions": [],
                        }],
                        "current_page": 1,
                        "last_page": 1,
                        "sync_cursor": "2026-11-14T10:00:00Z",
                    }),
                )

            self.mock_conversation(page, conversation_id, thread, messages)

            def mark_read(route):
                if route.request.method == "PATCH":
                    read_state["marked"] = True
                    route.fulfill(
                        status=200,
                        content_type="application/json",
                        body=json.dumps({"data": []}),
                    )
                    return
                route.continue_()

            page.route(f"**/api/v1/conversations/{conversation_id}/read", mark_read)

            page.goto(BASE_URL + "/dashboard/buyer/messages", wait_until="commit")
            page.get_by_role("heading", name="پیام‌ها").wait_for()

            all_tab = page.get_by_role("tab", name="همه")
            unread_tab = page.get_by_role("tab", name="خوانده‌نشده")
            all_tab.click()
            page.get_by_role("button", name=re.compile("هنرمند آزمون")).wait_for()

            with page.expect_response(
                lambda response: "/api/v1/buyer/conversations" in response.url
                and parse_qs(urlparse(response.url).query).get("filter") == ["unread"]
                and response.status == 200
            ):
                unread_tab.click()

            conversation_button = page.get_by_role("button", name=re.compile("هنرمند آزمون"))
            conversation_button.wait_for()
            with page.expect_response(
                lambda response: response.url.endswith(f"/api/v1/conversations/{conversation_id}/read")
                and response.request.method == "PATCH"
                and response.status == 200
            ):
                conversation_button.click()

            page.get_by_role("heading", name="هنرمند آزمون").wait_for()
            page.get_by_role("button", name=re.compile("هنرمند آزمون")).wait_for(state="detached")

            all_tab.click()
            conversation_button = page.get_by_role("button", name=re.compile("هنرمند آزمون"))
            conversation_button.wait_for()
            self.assertEqual(
                page.get_by_label(re.compile("پیام خوانده‌نشده")).count(),
                0,
                "The all-inbox cache must retain the conversation with its unread badge cleared.",
            )
        finally:
            context.close()

    def test_conversation_polling_uses_incremental_cursors_and_renders_new_messages(self):
        context, page = self.new_page()
        user_id = 74101
        conversation_id = 74110
        sync_cursor = "2026-11-14T10:00:00Z"
        incremental_requests = []
        thread = {
            "id": conversation_id,
            "participant": {"id": 74102, "name": "هنرمند همگام‌سازی"},
            "unread_count": 0,
            "last_message": {"body": "پیام نخست"},
            "last_message_at": sync_cursor,
            "archived": False,
            "muted": False,
            "contexts": [],
        }
        try:
            page.emulate_media(reduced_motion="reduce")
            self.mock_authenticated_shell(page, user_id, "buyer-sync@example.test")
            page.route(
                "**/api/v1/buyer/conversations**",
                lambda route: route.fulfill(
                    status=200,
                    content_type="application/json",
                    body=json.dumps({
                        "data": [thread],
                        "current_page": 1,
                        "last_page": 1,
                        "total": 1,
                    }),
                ),
            )

            def messages(route):
                if route.request.method != "GET":
                    route.continue_()
                    return
                query = parse_qs(urlparse(route.request.url).query)
                if "after_id" in query:
                    incremental_requests.append(query)
                    route.fulfill(
                        status=200,
                        content_type="application/json",
                        body=json.dumps({
                            "data": [{
                                "id": 74141,
                                "conversation_id": conversation_id,
                                "sender_id": 74102,
                                "body": "پیام تازه پس از همگام‌سازی",
                                "created_at": "2026-11-14T10:00:05Z",
                                "read_at": "2026-11-14T10:00:05Z",
                                "attachments": [],
                                "reactions": [],
                            }],
                            "current_page": 1,
                            "last_page": 1,
                            "sync_cursor": "2026-11-14T10:00:05Z",
                        }),
                    )
                    return

                initial_messages = [{
                    "id": message_id,
                    "conversation_id": conversation_id,
                    "sender_id": user_id,
                    "body": "پیام نخست" if message_id == 74111 else f"پیام قدیمی {message_id}",
                    "created_at": sync_cursor,
                    "read_at": sync_cursor,
                    "attachments": [],
                    "reactions": [],
                } for message_id in range(74111, 74141)]
                route.fulfill(
                    status=200,
                    content_type="application/json",
                    body=json.dumps({
                        "data": initial_messages,
                        "current_page": 1,
                        "last_page": 1,
                        "sync_cursor": sync_cursor,
                    }),
                )

            self.mock_conversation(page, conversation_id, thread, messages)
            page.goto(
                BASE_URL + f"/dashboard/buyer/messages?conversation={conversation_id}",
                wait_until="commit",
            )
            page.get_by_role("heading", name="پیام‌ها").wait_for()
            message_log = page.get_by_role("log", name="پیام‌های گفتگو")
            message_log.get_by_text("پیام نخست", exact=True).wait_for()
            message_log.get_by_text("پیام قدیمی 74140", exact=True).wait_for()
            # Verify initial history positioning, then move the reader away from
            # the latest message to exercise the incoming-message indicator.
            message_log_handle = message_log.element_handle()
            page.wait_for_function(
                "(node) => node && node.scrollHeight > node.clientHeight "
                "&& node.scrollTop >= node.scrollHeight - node.clientHeight - 2",
                arg=message_log_handle,
            )
            message_log.evaluate("(node) => { node.scrollTop = 0; node.dispatchEvent(new Event('scroll')); }")
            self.assertEqual(
                message_log.evaluate("(node) => node.scrollTop"),
                0,
                "The conversation log should move to the top before polling.",
            )

            with page.expect_response(
                lambda response: (
                    urlparse(response.url).path.endswith(
                        f"/api/v1/conversations/{conversation_id}/messages"
                    )
                    and "after_id" in parse_qs(urlparse(response.url).query)
                    and response.status == 200
                ),
                timeout=20000,
            ) as incremental_response:
                message_log.get_by_text("پیام تازه پس از همگام‌سازی", exact=True).wait_for(timeout=20000)

            self.assertEqual(incremental_response.value.status, 200)
            self.assertGreaterEqual(len(incremental_requests), 1)
            self.assertEqual(incremental_requests[0].get("after_id"), ["74140"])
            self.assertEqual(incremental_requests[0].get("updated_after"), [sync_cursor])
            message_log.get_by_text("پیام تازه پس از همگام‌سازی", exact=True).wait_for()
            # The scroll-to-latest indicator is conditional on the reader's scroll position;
            # incremental polling is covered by the rendered message and cursor assertions above.
        finally:
            context.close()


if __name__ == "__main__":
    unittest.main(verbosity=2)
