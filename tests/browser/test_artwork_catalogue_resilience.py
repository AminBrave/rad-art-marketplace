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


    def test_artwork_cards_recover_from_image_load_failure_and_keep_alt_text(self):
        context, page = self.new_page()
        artworks = [
            {
                "id": 910,
                "slug": "image-loaded",
                "title": "اثر با تصویر",
                "price": None,
                "image_url": "/media/loaded.svg",
                "artist": {"display_name": "هنرمند تصویر"},
                "category": {"name": "نقاشی"},
            },
            {
                "id": 911,
                "slug": "image-failed",
                "title": "اثر خراب",
                "price": None,
                "image_url": "/media/failed.svg",
                "artist": {"display_name": "هنرمند تصویر"},
                "category": {"name": "نقاشی"},
            },
            {
                "id": 912,
                "slug": "image-missing",
                "title": "اثر بدون تصویر",
                "price": None,
                "image_url": None,
                "artist": {"display_name": "هنرمند تصویر"},
                "category": {"name": "نقاشی"},
            },
        ]
        page.route(
            "**/api/v1/artworks**",
            lambda route: route.fulfill(
                status=200,
                content_type="application/json",
                body=json.dumps({
                    "data": artworks,
                    "current_page": 1,
                    "last_page": 1,
                    "per_page": 12,
                    "total": len(artworks),
                }),
            ),
        )
        page.route(
            "**/media/loaded.svg",
            lambda route: route.fulfill(
                status=200,
                content_type="image/svg+xml",
                body='<svg xmlns="http://www.w3.org/2000/svg" width="8" height="10" viewBox="0 0 8 10"><rect width="8" height="10" fill="#777777"/></svg>',
            ),
        )
        page.route("**/media/failed.svg", lambda route: route.abort())

        try:
            page.goto(BASE_URL + "/artworks", wait_until="domcontentloaded")
            page.get_by_role("heading", name="گالری آثار").wait_for()

            loaded = page.locator('img[alt="اثر با تصویر"]')
            loaded.wait_for(state="visible")
            page.wait_for_function("""() => {
                const image = document.querySelector('img[alt="اثر با تصویر"]');
                return image?.complete && image.naturalWidth > 0;
            }""")
            self.assertIsNone(loaded.locator("xpath=..").get_attribute("aria-busy"))

            page.get_by_role("img", name="اثر خراب").wait_for()
            page.get_by_role("img", name="اثر بدون تصویر").wait_for()
            self.assertEqual(page.locator('img[alt="اثر خراب"]').count(), 0)
            self.assertEqual(page.locator('img[alt="اثر بدون تصویر"]').count(), 0)
        finally:
            context.close()


    def test_artwork_image_source_change_shows_new_media_instead_of_stale_loaded_state(self):
        context, page = self.new_page()
        requests = []

        def artworks(route):
            query = route.request.url
            changed = "q=تغییر" in query or "q=%D8%AA%D8%BA%DB%8C%DB%8C%D8%B1" in query.lower()
            requests.append("changed" if changed else "initial")
            payload = artwork_payload("اثر با تصویر متغیر")
            payload["data"][0]["id"] = 920
            payload["data"][0]["image_url"] = "/media/first.svg" if not changed else "/media/second.svg"
            route.fulfill(
                status=200,
                content_type="application/json",
                body=json.dumps(payload),
            )

        page.route("**/api/v1/artworks**", artworks)
        page.route(
            "**/media/first.svg",
            lambda route: route.fulfill(
                status=200,
                content_type="image/svg+xml",
                body='<svg xmlns="http://www.w3.org/2000/svg" width="8" height="10"><rect width="8" height="10" fill="#777777"/></svg>',
            ),
        )
        page.route(
            "**/media/second.svg",
            lambda route: route.fulfill(
                status=200,
                content_type="image/svg+xml",
                body='<svg xmlns="http://www.w3.org/2000/svg" width="8" height="10"><circle cx="4" cy="5" r="4" fill="#777777"/></svg>',
            ),
        )

        try:
            page.goto(BASE_URL + "/artworks", wait_until="domcontentloaded")
            image = page.locator('img[alt="اثر با تصویر متغیر"]')
            image.wait_for(state="visible")
            page.wait_for_function("""() => {
                const image = document.querySelector('img[alt="اثر با تصویر متغیر"]');
                return image?.complete && image.naturalWidth > 0
                    && image.getAttribute('src') === '/media/first.svg';
            }""")

            search = page.get_by_role("searchbox", name="جست‌وجو در آثار و هنرمندان")
            search.fill("تغییر")
            with page.expect_response(
                lambda response: "/api/v1/artworks" in response.url
                and "q=" in response.url
                and response.request.method == "GET"
            ):
                search.press("Enter")

            page.wait_for_function("""() => {
                const image = document.querySelector('img[alt="اثر با تصویر متغیر"]');
                return image?.complete && image.naturalWidth > 0
                    && image.getAttribute('src') === '/media/second.svg';
            }""")
            self.assertEqual(requests, ["initial", "changed"])
            self.assertIsNone(image.locator("xpath=..").get_attribute("aria-busy"))
        finally:
            context.close()


if __name__ == "__main__":
    unittest.main(verbosity=2)
