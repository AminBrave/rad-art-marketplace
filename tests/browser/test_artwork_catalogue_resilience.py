"""Public artwork catalogue loading, retry and filter-degradation journeys."""

import json
import unittest

from playwright.sync_api import sync_playwright

from config import BASE_URL, IGNORE_HTTPS_ERRORS


def artwork_payload(title="اثر آزمایشی کاتالوگ"):
    return {
        "data": [{
            "id": 901,
            "slug": "catalogue-resilience-artwork",
            "title": title,
            "price": None,
            "image_url": None,
            "artist": {"display_name": "هنرمند آزمایشی"},
            "category": {"name": "نقاشی"},
        }],
        "current_page": 1,
        "last_page": 1,
        "per_page": 12,
        "total": 1,
    }


class ArtworkCatalogueResilienceTests(unittest.TestCase):
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
                body='{"data":null}',
            ),
        )
        return context, page

    def test_artwork_catalogue_error_can_be_retried_into_results(self):
        context, page = self.new_page()
        attempts = {"count": 0}

        def artworks(route):
            attempts["count"] += 1
            if attempts["count"] <= 2:
                route.fulfill(
                    status=503,
                    content_type="application/json",
                    body=json.dumps({"message": "Catalogue temporarily unavailable"}),
                )
                return

            route.fulfill(
                status=200,
                content_type="application/json",
                body=json.dumps(artwork_payload()),
            )

        page.route("**/api/v1/artworks**", artworks)
        try:
            page.goto(BASE_URL + "/artworks", wait_until="domcontentloaded")
            page.get_by_role("heading", name="گالری آثار").wait_for()
            page.get_by_role("alert").get_by_role(
                "button", name="تلاش دوباره"
            ).wait_for()

            with page.expect_response(
                lambda response: "/api/v1/artworks" in response.url
                and response.request.method == "GET"
                and response.status == 200
            ):
                page.get_by_role("button", name="تلاش دوباره").click()

            page.get_by_role("heading", name="اثر آزمایشی کاتالوگ").wait_for()
            self.assertEqual(attempts["count"], 3)
            self.assertIn("هنرمند آزمایشی", page.locator("main").inner_text())
        finally:
            context.close()

    def test_filter_metadata_failure_does_not_block_artwork_discovery(self):
        context, page = self.new_page()
        page.route(
            "**/api/v1/categories",
            lambda route: route.fulfill(
                status=200,
                content_type="application/json",
                body=json.dumps({"data": [{"id": 1, "slug": "painting", "name": "نقاشی"}]}),
            ),
        )
        page.route(
            "**/api/v1/artwork-filters",
            lambda route: route.fulfill(
                status=503,
                content_type="application/json",
                body=json.dumps({"message": "Filter metadata unavailable"}),
            ),
        )
        page.route(
            "**/api/v1/artworks**",
            lambda route: route.fulfill(
                status=200,
                content_type="application/json",
                body=json.dumps(artwork_payload("اثر با فیلترهای ناقص")),
            ),
        )
        try:
            page.goto(BASE_URL + "/artworks", wait_until="domcontentloaded")
            page.get_by_role("heading", name="گالری آثار").wait_for()
            page.get_by_text("برخی گزینه‌های فیلتر بارگذاری نشدند", exact=False).wait_for()
            page.get_by_role("heading", name="اثر با فیلترهای ناقص").wait_for()

            self.assertTrue(page.get_by_role("combobox", name="فیلتر دسته‌بندی").is_visible())
            self.assertTrue(page.get_by_role("combobox", name="فیلتر تکنیک و مواد").is_visible())
            self.assertTrue(page.get_by_role("combobox", name="فیلتر وضعیت اثر").is_visible())
        finally:
            context.close()


if __name__ == "__main__":
    unittest.main(verbosity=2)
