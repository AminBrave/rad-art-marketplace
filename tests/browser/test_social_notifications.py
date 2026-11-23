"""Playwright coverage for social notifications and existing message alerts."""

import json
import re
import unittest

from playwright.sync_api import expect, sync_playwright

from config import BASE_URL, IGNORE_HTTPS_ERRORS


BUYER = {
    "id": 42,
    "name": "خریدار آزمایشی",
    "email": "buyer@example.test",
    "role": "buyer",
}

SOCIAL_NOTIFICATION = {
    "id": "social-reply-notification-1",
    "kind": "artwork_comment_replied",
    "title": "هنرمند به دیدگاه پاسخ داد",
    "artwork_title": "اثر آزمایشی",
    "comment_preview": "پاسخ هنرمند به دیدگاه شما",
    "target_url": "/artworks/notification-artwork#comment-100",
    "read_at": None,
    "created_at": "2026-11-20T10:30:00.000000Z",
}

CONVERSATION = {
    "id": 101,
    "participant": {"name": "هنرمند آزمایشی"},
    "last_message": {"body": "پیام آزمایشی"},
    "last_message_at": "2026-11-20T10:30:00.000000Z",
    "unread_count": 0,
}

MESSAGE = {
    "id": 501,
    "sender_id": 84,
    "sender_name": "هنرمند آزمایشی",
    "body": "پیام آزمایشی",
    "delivered_at": "2026-11-20T10:30:00.000000Z",
    "read_at": None,
    "created_at": "2026-11-20T10:30:00.000000Z",
    "reactions": [],
}


NOTIFICATIONS_ROUTE = re.compile(r".*/api/v1/notifications(?:\?.*)?$")


def install_auth_bootstrap(page, user):
    """Replace the real Blade auth payload before the React entry point runs."""
    payload = json.dumps(user, ensure_ascii=False)

    def rewrite_navigation(route):
        if not route.request.is_navigation_request():
            route.continue_()
            return

        response = route.fetch()
        html = response.text()
        html, replacements = re.subn(
            r'<script\b[^>]*\bid=["\']rad-auth-bootstrap["\'][^>]*>.*?</script>',
            lambda _: f'<script type="application/json" id="rad-auth-bootstrap">{payload}</script>',
            html,
            count=1,
            flags=re.DOTALL,
        )
        if replacements != 1:
            raise AssertionError("The app shell must contain exactly one Blade auth bootstrap script.")

        route.fulfill(response=response, body=html)

    page.route("**/*", rewrite_navigation)


class SocialNotificationBrowserTests(unittest.TestCase):
    """All API calls are intercepted; no application records are changed."""

    manual_dev_safe = True

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
            viewport={"width": 390, "height": 844},
            is_mobile=True,
            has_touch=True,
            ignore_https_errors=True,
        )
        page = context.new_page()
        page.set_default_timeout(15000)
        install_auth_bootstrap(page, BUYER)
        page.route(
            NOTIFICATIONS_ROUTE,
            lambda route: route.fulfill(
                status=200,
                content_type="application/json",
                body=json.dumps({
                    "data": [SOCIAL_NOTIFICATION],
                    "current_page": 1,
                    "last_page": 1,
                    "per_page": 20,
                    "total": 1,
                    "unread_count": 1,
                }, ensure_ascii=False),
            ),
        )
        page.route(
            "**/api/v1/notifications/preferences",
            lambda route: route.fulfill(
                status=200,
                content_type="application/json",
                body=json.dumps({"data": {
                    "in_app_messages": True,
                    "in_app_follows": True,
                    "in_app_artwork_likes": True,
                    "in_app_artwork_comments": True,
                    "in_app_comment_replies": True,
                    "email_available": False,
                }}),
            ),
        )
        page.route(
            "**/api/v1/notifications/social-reply-notification-1/read",
            lambda route: route.fulfill(
                status=200,
                content_type="application/json",
                body='{"message":"read"}',
            ),
        )
        page.route(
            "**/api/v1/buyer/conversations**",
            lambda route: route.fulfill(
                status=200,
                content_type="application/json",
                body=json.dumps({"data": [CONVERSATION], "current_page": 1, "last_page": 1, "total": 1}, ensure_ascii=False),
            ),
        )
        page.route(
            "**/api/v1/conversations/101/messages**",
            lambda route: route.fulfill(
                status=200,
                content_type="application/json",
                body=json.dumps({"data": [MESSAGE], "current_page": 1, "last_page": 1, "total": 1}, ensure_ascii=False),
            ),
        )
        page.route(
            "**/api/v1/conversations/101/read",
            lambda route: route.fulfill(status=200, content_type="application/json", body='{"data":{"updated_messages":0}}'),
        )
        page.route(
            "**/api/v1/conversations/101/safety",
            lambda route: route.fulfill(
                status=200,
                content_type="application/json",
                body='{"data":{"blocked_by_me":false,"blocked_by_other":false}}',
            ),
        )
        return context, page

    def test_reply_notification_marks_read_and_opens_the_canonical_comment_deep_link(self):
        context, page = self.new_page()
        try:
            page.goto(BASE_URL + "/dashboard/buyer/messages", wait_until="domcontentloaded")
            page.get_by_role("heading", name="پیام‌ها").wait_for()
            expect(page.get_by_role("link", name="پیام‌ها")).to_be_visible()
            expect(page.get_by_test_id("authenticated-bottom-navigation").get_by_text("پیام‌ها", exact=True)).to_be_visible()
            page.get_by_role("button", name=re.compile("^اعلان‌ها")).click()
            dialog = page.get_by_role("dialog")
            expect(dialog).to_be_visible()
            expect(dialog.get_by_role("heading", name="اعلان‌ها", exact=True)).to_be_visible()

            notification = page.get_by_role(
                "button",
                name=re.compile("هنرمند به دیدگاه پاسخ داد"),
            )
            expect(notification).to_be_visible()
            expect(notification).to_contain_text("اثر آزمایشی")
            expect(notification).to_contain_text("پاسخ هنرمند به دیدگاه شما")

            with page.expect_response(
                lambda response: response.url.endswith(
                    "/api/v1/notifications/social-reply-notification-1/read"
                )
                and response.request.method == "PATCH",
                timeout=15000,
            ) as read_response:
                notification.click()

            self.assertEqual(read_response.value.status, 200)
            page.wait_for_url("**/artworks/notification-artwork#comment-100")
            self.assertEqual(
                url_hash(page.url),
                "#comment-100",
                "A reply notification must deep-link to its root thread, not only the artwork.",
            )
        finally:
            context.close()

    def test_follow_like_comment_and_reply_notifications_are_all_rendered(self):
        context, page = self.new_page()
        social_items = [
            {**SOCIAL_NOTIFICATION, "id": "follow-1", "kind": "artist_followed", "title": "خریدار شما را دنبال کرد"},
            {**SOCIAL_NOTIFICATION, "id": "like-1", "kind": "artwork_liked", "title": "خریدار اثر شما را پسندید"},
            {**SOCIAL_NOTIFICATION, "id": "comment-1", "kind": "artwork_commented", "title": "خریدار درباره اثر شما دیدگاه نوشت"},
            SOCIAL_NOTIFICATION,
        ]
        page.unroute(NOTIFICATIONS_ROUTE)
        page.route(
            NOTIFICATIONS_ROUTE,
            lambda route: route.fulfill(
                status=200,
                content_type="application/json",
                body=json.dumps({
                    "data": social_items,
                    "current_page": 1,
                    "last_page": 1,
                    "per_page": 20,
                    "total": len(social_items),
                    "unread_count": len(social_items),
                }, ensure_ascii=False),
            ),
        )
        try:
            page.goto(BASE_URL + "/dashboard/buyer/messages", wait_until="domcontentloaded")
            page.get_by_role("heading", name="پیام‌ها").wait_for()
            expect(page.get_by_role("link", name="پیام‌ها")).to_be_visible()
            expect(page.get_by_test_id("authenticated-bottom-navigation").get_by_text("پیام‌ها", exact=True)).to_be_visible()
            page.get_by_role("button", name=re.compile("^اعلان‌ها")).click()
            for title in (
                "خریدار شما را دنبال کرد",
                "خریدار اثر شما را پسندید",
                "خریدار درباره اثر شما دیدگاه نوشت",
                SOCIAL_NOTIFICATION["title"],
            ):
                expect(page.get_by_role("button", name=re.compile(title))).to_be_visible()
        finally:
            context.close()

    def test_buyer_can_disable_reply_notifications_without_changing_message_preference(self):
        context, page = self.new_page()
        preference_updates = []

        def preferences_route(route):
            if route.request.method == "PATCH":
                payload = route.request.post_data_json
                preference_updates.append(payload)
                route.fulfill(
                    status=200,
                    content_type="application/json",
                    body=json.dumps({"data": {
                        "in_app_messages": True,
                        "in_app_follows": True,
                        "in_app_artwork_likes": True,
                        "in_app_artwork_comments": True,
                        "in_app_comment_replies": payload["in_app_comment_replies"],
                        "email_available": False,
                    }}),
                )
                return
            route.fulfill(
                status=200,
                content_type="application/json",
                body=json.dumps({"data": {
                    "in_app_messages": True,
                    "in_app_follows": True,
                    "in_app_artwork_likes": True,
                    "in_app_artwork_comments": True,
                    "in_app_comment_replies": True,
                    "email_available": False,
                }}),
            )

        page.unroute("**/api/v1/notifications/preferences")
        page.route("**/api/v1/notifications/preferences", preferences_route)
        try:
            page.goto(BASE_URL + "/dashboard/buyer/messages", wait_until="domcontentloaded")
            page.get_by_role("button", name=re.compile("^اعلان‌ها")).click()
            preference = page.get_by_role(
                "checkbox",
                name=re.compile("^پاسخ به دیدگاه‌ها"),
            )
            expect(preference).to_be_checked()

            with page.expect_response(
                lambda response: response.url.endswith("/api/v1/notifications/preferences")
                and response.request.method == "PATCH",
                timeout=15000,
            ):
                preference.click()

            expect(preference).not_to_be_checked()
            self.assertEqual(preference_updates, [{"in_app_comment_replies": False}])
            message_preference = page.get_by_role(
                "checkbox",
                name=re.compile("^اعلان پیام‌های جدید"),
            )
            expect(message_preference).to_be_checked()
        finally:
            context.close()


def url_hash(url):
    from urllib.parse import urlparse

    return urlparse(url).fragment and "#" + urlparse(url).fragment
