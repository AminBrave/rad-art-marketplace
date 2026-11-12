"""Authenticated artist workspace loading and recovery journeys."""

import json
import unittest

from playwright.sync_api import sync_playwright

from config import BASE_URL, IGNORE_HTTPS_ERRORS


class ArtistWorkspaceResilienceTests(unittest.TestCase):
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
        page.set_default_timeout(15000)
        page.route(
            "**/api/v1/auth/me",
            lambda route: route.fulfill(
                status=200,
                content_type="application/json",
                body=json.dumps({
                    "data": {
                        "id": 72001,
                        "name": "هنرمند آزمون",
                        "email": "artist-workspace@example.test",
                        "role": "artist",
                    }
                }),
            ),
        )
        page.route(
            "**/api/v1/artist-profile/me",
            lambda route: route.fulfill(
                status=200,
                content_type="application/json",
                body=json.dumps({
                    "data": {
                        "display_name": "هنرمند آزمون",
                        "slug": "artist-workspace-resilience",
                        "bio": "معرفی هنری برای آزمون",
                        "city": "تهران",
                        "website_url": "https://example.test",
                        "instagram_handle": "",
                        "is_public": True,
                    }
                }),
            ),
        )
        return context, page

    def test_artist_workspace_artwork_metrics_can_recover_after_api_failure(self):
        context, page = self.new_page()
        attempts = {"count": 0}

        def artworks(route):
            attempts["count"] += 1
            if attempts["count"] == 1:
                route.fulfill(
                    status=400,
                    content_type="application/json",
                    body=json.dumps({"message": "Artist artworks temporarily unavailable"}),
                )
                return

            route.fulfill(
                status=200,
                content_type="application/json",
                body=json.dumps({
                    "data": [{
                        "id": 72010,
                        "title": "اثر بازیابی‌شده",
                        "status": "approved",
                        "category": {"name": "نقاشی"},
                    }],
                    "current_page": 1,
                    "last_page": 1,
                    "per_page": 12,
                    "total": 1,
                }),
            )

        page.route("**/api/v1/artist/artworks**", artworks)
        try:
            page.goto(BASE_URL + "/dashboard/artist", wait_until="domcontentloaded")
            page.get_by_role("heading", name="خوش آمدید، هنرمند آزمون").wait_for()
            page.get_by_role("link", name="ویرایش پروفایل").wait_for()
            # The artwork query is enabled only after the profile query supplies
            # a valid slug. Wait for that public-profile action before asserting
            # the independent artwork request's failure state.
            page.get_by_role("link", name="پیش‌نمایش عمومی").wait_for()

            # HTTP 400 is intentionally non-retryable under the shared query
            # policy, keeping this test focused on explicit user recovery.
            page.get_by_role("heading", name="بخشی از اطلاعات بارگذاری نشد").wait_for()
            self.assertEqual(attempts["count"], 1)
            retry_button = page.get_by_role("alert").filter(
                has_text="بخشی از اطلاعات بارگذاری نشد"
            ).get_by_role("button", name="تلاش دوباره")
            retry_button.wait_for()

            with page.expect_response(
                lambda response: response.url.split("?")[0].endswith("/api/v1/artist/artworks")
                and response.request.method == "GET"
                and response.status == 200
            ):
                retry_button.click()

            page.get_by_text("اثر بازیابی‌شده", exact=True).wait_for()
            self.assertEqual(attempts["count"], 2)
            self.assertTrue(page.get_by_role("progressbar", name="تکمیل فیلدهای پروفایل").is_visible())
        finally:
            context.close()


if __name__ == "__main__":
    unittest.main(verbosity=2)
