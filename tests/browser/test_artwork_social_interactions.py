"""Playwright coverage for public artwork likes, comments and one-level replies."""

import json
import unittest

from playwright.sync_api import expect, sync_playwright

from config import BASE_URL, IGNORE_HTTPS_ERRORS


BUYER = {
    "id": 42,
    "name": "خریدار آزمایشی",
    "email": "buyer@example.test",
    "role": "buyer",
}

ARTWORK = {
    "id": 701,
    "slug": "social-journey-artwork",
    "title": "اثر آزمایشی تعامل اجتماعی",
    "description": "اثر عمومی برای آزمون تعامل",
    "image_url": None,
    "price": None,
    "availability": "available",
    "medium": "رنگ روغن",
    "dimensions": "۳۰ × ۴۰",
    "year": 2025,
    "category": {"name": "نقاشی"},
    "artist": {"slug": "social-journey-artist", "display_name": "هنرمند آزمایشی"},
    "likes_count": 4,
    "comments_count": 1,
    "liked_by_me": False,
}

ROOT_COMMENT = {
    "id": 100,
    "parent_id": None,
    "body": "دیدگاه ریشه‌ای برای آزمون",
    "is_mine": False,
    "is_deleted": False,
    "created_at": "2026-11-20T10:00:00Z",
    "user": {"name": "هنرمند آزمایشی"},
    "replies": [],
}


def comments_payload(replies=None):
    root = {**ROOT_COMMENT, "replies": list(replies or [])}
    return {
        "data": [root],
        "current_page": 1,
        "last_page": 1,
        "per_page": 20,
        "total": 1,
    }


def reply_resource(body):
    return {
        "id": 101,
        "parent_id": 100,
        "body": body,
        "is_mine": True,
        "is_deleted": False,
        "created_at": "2026-11-20T10:05:00Z",
        "user": {"name": BUYER["name"]},
        "replies": [],
    }


class ArtworkSocialInteractionBrowserTests(unittest.TestCase):
    """Every API call is intercepted; these tests never mutate dev records."""

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
            ignore_https_errors=IGNORE_HTTPS_ERRORS,
        )
        page = context.new_page()
        page.set_default_timeout(15000)
        page.route(
            "**/api/v1/auth/me",
            lambda route: route.fulfill(
                status=200,
                content_type="application/json",
                body=json.dumps({"data": BUYER}, ensure_ascii=False),
            ),
        )
        page.route(
            "**/api/v1/artworks/social-journey-artwork",
            lambda route: route.fulfill(
                status=200,
                content_type="application/json",
                body=json.dumps({"data": ARTWORK}, ensure_ascii=False),
            ),
        )
        return context, page

    def test_buyer_can_submit_a_root_comment_and_see_server_confirmed_result(self):
        context, page = self.new_page()
        created = []
        comments = []

        def comments_route(route):
            if route.request.method == "POST":
                payload = route.request.post_data_json
                created.append(payload)
                created_comment = {
                    **reply_resource(payload["body"]),
                    "id": 101,
                    "parent_id": None,
                    "replies": [],
                }
                comments.append(created_comment)
                route.fulfill(
                    status=201,
                    content_type="application/json",
                    body=json.dumps({"data": created_comment}, ensure_ascii=False),
                )
                return
            route.fulfill(
                status=200,
                content_type="application/json",
                body=json.dumps({
                    **comments_payload(),
                    "data": [ROOT_COMMENT, *comments],
                    "total": 1 + len(comments),
                }, ensure_ascii=False),
            )

        page.route("**/api/v1/artworks/social-journey-artwork/comments**", comments_route)
        try:
            page.goto(BASE_URL + "/artworks/social-journey-artwork", wait_until="domcontentloaded")
            page.get_by_role("heading", name="گفت‌وگو درباره اثر").wait_for()
            editor = page.get_by_label("دیدگاه شما")
            editor.fill("دیدگاه جدید از مرورگر")
            with page.expect_response(
                lambda response: response.url.endswith("/comments")
                and response.request.method == "POST",
                timeout=15000,
            ) as post_response:
                page.get_by_role("button", name="ثبت دیدگاه").click()

            self.assertEqual(post_response.value.status, 201)
            self.assertEqual(created, [{"body": "دیدگاه جدید از مرورگر"}])
            expect(page.get_by_text("دیدگاه جدید از مرورگر", exact=True)).to_be_visible()
            expect(editor).to_have_value("")
        finally:
            context.close()

    def test_buyer_reply_is_posted_with_root_parent_and_renders_after_refetch(self):
        context, page = self.new_page()
        posted_payloads = []
        replies = []

        def comments_route(route):
            if route.request.method == "POST":
                payload = route.request.post_data_json
                posted_payloads.append(payload)
                if payload.get("parent_id") == ROOT_COMMENT["id"]:
                    replies.append(reply_resource(payload["body"]))
                route.fulfill(
                    status=201,
                    content_type="application/json",
                    body=json.dumps({"data": replies[-1] if replies else {}}, ensure_ascii=False),
                )
                return
            route.fulfill(
                status=200,
                content_type="application/json",
                body=json.dumps(comments_payload(replies), ensure_ascii=False),
            )

        page.route("**/api/v1/artworks/social-journey-artwork/comments**", comments_route)
        try:
            page.goto(BASE_URL + "/artworks/social-journey-artwork", wait_until="domcontentloaded")
            page.get_by_role("heading", name="گفت‌وگو درباره اثر").wait_for()
            page.get_by_text(ROOT_COMMENT["body"], exact=True).wait_for()

            # Replies must be initiated from a root comment, not from another reply.
            page.get_by_role("button", name="پاسخ").click()
            expect(page.get_by_text("در پاسخ به هنرمند آزمایشی")).to_be_visible()
            editor = page.get_by_label("پاسخ شما")
            editor.fill("پاسخ آزمایشی خریدار")

            with page.expect_response(
                lambda response: response.url.endswith("/comments")
                and response.request.method == "POST",
                timeout=15000,
            ) as post_response:
                page.get_by_role("button", name="ثبت دیدگاه").click()

            self.assertEqual(post_response.value.status, 201)
            self.assertEqual(
                posted_payloads,
                [{"body": "پاسخ آزمایشی خریدار", "parent_id": ROOT_COMMENT["id"]}],
                "Reply must submit the selected root comment ID as parent_id.",
            )
            expect(page.get_by_text("پاسخ آزمایشی خریدار", exact=True)).to_be_visible()
            expect(page.get_by_text("در پاسخ به هنرمند آزمایشی")).to_have_count(0)
            expect(editor).to_have_count(0)

            # A rendered reply must not expose another reply action (one-level threads).
            reply_article = page.locator("#comment-101")
            expect(reply_article).to_be_visible()
            expect(reply_article.get_by_role("button", name="پاسخ")).to_have_count(0)
        finally:
            context.close()

    def test_failed_reply_keeps_draft_and_offers_retry(self):
        context, page = self.new_page()
        attempts = {"count": 0}
        replies = []

        def comments_route(route):
            if route.request.method == "POST":
                attempts["count"] += 1
                if attempts["count"] == 1:
                    route.fulfill(
                        status=503,
                        content_type="application/json",
                        body=json.dumps({"message": "Temporary failure"}),
                    )
                    return
                created_reply = reply_resource("پاسخ پس از تلاش مجدد")
                replies.append(created_reply)
                route.fulfill(
                    status=201,
                    content_type="application/json",
                    body=json.dumps({"data": created_reply}, ensure_ascii=False),
                )
                return
            route.fulfill(
                status=200,
                content_type="application/json",
                body=json.dumps(comments_payload(replies), ensure_ascii=False),
            )

        page.route("**/api/v1/artworks/social-journey-artwork/comments**", comments_route)
        try:
            page.goto(BASE_URL + "/artworks/social-journey-artwork", wait_until="domcontentloaded")
            page.get_by_role("heading", name="گفت‌وگو درباره اثر").wait_for()
            page.get_by_role("button", name="پاسخ").click()
            editor = page.get_by_label("پاسخ شما")
            editor.fill("پاسخ پس از تلاش مجدد")

            with page.expect_response(
                lambda response: response.url.endswith("/comments")
                and response.request.method == "POST"
                and response.status == 503,
                timeout=15000,
            ):
                page.get_by_role("button", name="ثبت دیدگاه").click()

            expect(page.get_by_role("alert")).to_contain_text("ثبت دیدگاه انجام نشد")
            expect(editor).to_have_value("پاسخ پس از تلاش مجدد")
            expect(page.get_by_role("button", name="ثبت دیدگاه")).to_be_enabled()

            with page.expect_response(
                lambda response: response.url.endswith("/comments")
                and response.request.method == "POST"
                and response.status == 201,
                timeout=15000,
            ):
                page.get_by_role("button", name="ثبت دیدگاه").click()

            expect(page.get_by_text("پاسخ پس از تلاش مجدد", exact=True)).to_be_visible()
            self.assertEqual(attempts["count"], 2)
        finally:
            context.close()

    def test_guest_can_read_comments_share_artwork_and_cannot_mutate_social_state(self):
        context, page = self.new_page()
        page.unroute("**/api/v1/auth/me")
        page.route(
            "**/api/v1/auth/me",
            lambda route: route.fulfill(
                status=200,
                content_type="application/json",
                body='{"data":null}',
            ),
        )
        page.add_init_script("""
            Object.defineProperty(navigator, 'share', { configurable: true, value: undefined });
            Object.defineProperty(navigator, 'clipboard', {
                configurable: true,
                value: { writeText: async (value) => { window.__copiedArtworkUrl = value; } },
            });
        """)
        page.route(
            "**/api/v1/artworks/social-journey-artwork/comments**",
            lambda route: route.fulfill(
                status=200,
                content_type="application/json",
                body=json.dumps(comments_payload(), ensure_ascii=False),
            ),
        )
        try:
            page.goto(BASE_URL + "/artworks/social-journey-artwork", wait_until="domcontentloaded")
            page.get_by_text(ROOT_COMMENT["body"], exact=True).wait_for()
            expect(page.get_by_role("link", name="برای پسندیدن وارد شوید")).to_be_visible()
            expect(page.get_by_role("button", name="پسندیدن")).to_have_count(0)
            expect(page.get_by_label("دیدگاه شما")).to_have_count(0)

            with page.expect_response(
                lambda response: response.url.endswith("/artworks/social-journey-artwork/comments")
                and response.request.method == "GET",
                timeout=15000,
            ):
                page.get_by_role("button", name="اشتراک‌گذاری اثر").click()

            expect(page.get_by_role("status")).to_contain_text("لینک اثر کپی شد")
            self.assertEqual(
                page.evaluate("window.__copiedArtworkUrl"),
                BASE_URL + "/artworks/social-journey-artwork",
            )
        finally:
            context.close()

    def test_buyer_can_like_and_unlike_artwork_with_refreshed_accessible_state(self):
        context, page = self.new_page()
        state = {"liked": False, "likes_count": 4}
        mutations = []

        def artwork_route(route):
            route.fulfill(
                status=200,
                content_type="application/json",
                body=json.dumps({"data": {
                    **ARTWORK,
                    "liked_by_me": state["liked"],
                    "likes_count": state["likes_count"],
                }}, ensure_ascii=False),
            )

        def likes_route(route):
            mutations.append(route.request.method)
            state["liked"] = route.request.method == "POST"
            state["likes_count"] += 1 if state["liked"] else -1
            route.fulfill(status=204, body="")

        page.unroute("**/api/v1/artworks/social-journey-artwork")
        page.route("**/api/v1/artworks/social-journey-artwork", artwork_route)
        page.route("**/api/v1/artworks/social-journey-artwork/likes", likes_route)
        try:
            page.goto(BASE_URL + "/artworks/social-journey-artwork", wait_until="domcontentloaded")
            like = page.get_by_role("button", name="پسندیدن")
            expect(like).to_have_attribute("aria-pressed", "false")

            with page.expect_response(
                lambda response: response.url.endswith("/likes")
                and response.request.method == "POST",
                timeout=15000,
            ):
                like.click()

            liked = page.get_by_role("button", name="پسندیده‌اید")
            expect(liked).to_have_attribute("aria-pressed", "true")
            expect(page.get_by_text("۵ پسند", exact=True)).to_be_visible()

            with page.expect_response(
                lambda response: response.url.endswith("/likes")
                and response.request.method == "DELETE",
                timeout=15000,
            ):
                liked.click()

            expect(page.get_by_role("button", name="پسندیدن")).to_have_attribute("aria-pressed", "false")
            expect(page.get_by_text("۴ پسند", exact=True)).to_be_visible()
            self.assertEqual(mutations, ["POST", "DELETE"])
        finally:
            context.close()
