"""Playwright coverage for artist follow/unfollow and profile visibility."""

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


def artist_payload(is_following=False, followers_count=12, is_own_profile=False):
    return {
        "display_name": "هنرمند قابل دنبال‌کردن",
        "slug": "qa-follow-artist",
        "bio": "پروفایل عمومی برای آزمون دنبال‌کردن",
        "city": "تهران",
        "followers_count": followers_count,
        "is_following": is_following,
        "is_own_profile": is_own_profile,
        "artworks": [],
        "artworks_pagination": {
            "has_more": False,
            "next_page": None,
        },
    }


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


class ArtistFollowBrowserTests(unittest.TestCase):
    """All API responses are intercepted; these tests do not mutate dev data."""

    manual_dev_safe = True

    @classmethod
    def setUpClass(cls):
        cls.playwright = sync_playwright().start()
        cls.browser = cls.playwright.chromium.launch()

    @classmethod
    def tearDownClass(cls):
        cls.browser.close()
        cls.playwright.stop()

    def new_page(self, auth_user=BUYER):
        context = self.browser.new_context(
            viewport={"width": 390, "height": 844},
            is_mobile=True,
            has_touch=True,
            ignore_https_errors=IGNORE_HTTPS_ERRORS,
        )
        page = context.new_page()
        page.set_default_timeout(15000)
        install_auth_bootstrap(page, auth_user)
        return context, page

    def test_buyer_can_follow_then_unfollow_public_artist(self):
        context, page = self.new_page()
        state = {"following": False, "followers": 12}
        mutations = []

        def profile_route(route):
            route.fulfill(
                status=200,
                content_type="application/json",
                body=json.dumps({"data": artist_payload(
                    is_following=state["following"],
                    followers_count=state["followers"],
                )}, ensure_ascii=False),
            )

        def follow_route(route):
            mutations.append(route.request.method)
            if route.request.method == "POST":
                state["following"] = True
                state["followers"] += 1
            elif route.request.method == "DELETE":
                state["following"] = False
                state["followers"] -= 1
            route.fulfill(status=204, body="")

        page.route(re.compile(r".*/api/v1/artists/qa-follow-artist(?:\?.*)?$"), profile_route)
        page.route("**/api/v1/artists/qa-follow-artist/follow", follow_route)
        try:
            page.goto(BASE_URL + "/artists/qa-follow-artist", wait_until="domcontentloaded")
            follow = page.get_by_role("button", name="دنبال کردن هنرمند")
            expect(follow).to_have_attribute("aria-pressed", "false")
            expect(page.get_by_text("۱۲ دنبال‌کننده", exact=True)).to_be_visible()

            with page.expect_response(
                lambda response: response.url.endswith("/follow")
                and response.request.method == "POST",
                timeout=15000,
            ):
                follow.click()

            followed = page.get_by_role("button", name="دنبال می‌کنید")
            expect(followed).to_have_attribute("aria-pressed", "true")
            expect(page.get_by_text("۱۳ دنبال‌کننده", exact=True)).to_be_visible()

            with page.expect_response(
                lambda response: response.url.endswith("/follow")
                and response.request.method == "DELETE",
                timeout=15000,
            ):
                followed.click()

            unfollowed = page.get_by_role("button", name="دنبال کردن هنرمند")
            expect(unfollowed).to_have_attribute("aria-pressed", "false")
            expect(page.get_by_text("۱۲ دنبال‌کننده", exact=True)).to_be_visible()
            self.assertEqual(mutations, ["POST", "DELETE"])
        finally:
            context.close()

    def test_guest_sees_login_entry_point_instead_of_follow_mutation(self):
        context, page = self.new_page(auth_user=None)
        page.route(
            re.compile(r".*/api/v1/artists/qa-follow-artist(?:\?.*)?$"),
            lambda route: route.fulfill(
                status=200,
                content_type="application/json",
                body=json.dumps({"data": artist_payload(
                    is_following=False,
                    followers_count=12,
                )}, ensure_ascii=False),
            ),
        )
        try:
            page.goto(BASE_URL + "/artists/qa-follow-artist", wait_until="domcontentloaded")
            expect(page.get_by_role("link", name="برای دنبال کردن وارد شوید")).to_be_visible()
            expect(page.get_by_role("button", name="دنبال کردن هنرمند")).to_have_count(0)
        finally:
            context.close()

    def test_artist_cannot_follow_own_profile(self):
        artist_user = {
            "id": 84,
            "name": "مالک پروفایل",
            "email": "artist@example.test",
            "role": "artist",
        }
        context, page = self.new_page(auth_user=artist_user)
        page.route(
            "**/api/v1/artists/qa-follow-artist*",
            lambda route: route.fulfill(
                status=200,
                content_type="application/json",
                body=json.dumps({"data": artist_payload(
                    is_following=False,
                    followers_count=None,
                    is_own_profile=True,
                )}, ensure_ascii=False),
            ),
        )
        try:
            page.goto(BASE_URL + "/artists/qa-follow-artist", wait_until="domcontentloaded")
            page.get_by_role("heading", name="هنرمند قابل دنبال‌کردن").wait_for()
            expect(page.get_by_role("button", name="دنبال کردن هنرمند")).to_have_count(0)
            expect(page.get_by_text("دنبال‌کننده", exact=False)).to_have_count(0)
        finally:
            context.close()
