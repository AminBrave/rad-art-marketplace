import json
import unittest
from urllib.parse import parse_qs, urlparse

from playwright.sync_api import sync_playwright

from config import BASE_URL, IGNORE_HTTPS_ERRORS


class ArtistDirectoryResilienceTests(unittest.TestCase):
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

    def test_artist_directory_error_can_be_retried_into_empty_state(self):
        context, page = self.new_page()
        attempts = {"count": 0}

        def artists(route):
            attempts["count"] += 1
            if attempts["count"] == 1:
                route.fulfill(
                    status=422,
                    content_type="application/json",
                    body=json.dumps({"message": "Invalid query"}),
                )
                return

            route.fulfill(
                status=200,
                content_type="application/json",
                body=json.dumps({
                    "data": [],
                    "current_page": 1,
                    "last_page": 1,
                    "per_page": 12,
                    "total": 0,
                }),
            )

        page.route("**/api/v1/artists**", artists)
        try:
            page.goto(BASE_URL + "/artists")
            page.get_by_role("heading", name="هنرمند را کشف کنید.").wait_for()
            page.get_by_role("alert").get_by_role(
                "button", name="تلاش دوباره"
            ).wait_for()

            with page.expect_response(
                lambda response: "/api/v1/artists" in response.url
                and response.request.method == "GET"
                and response.status == 200
            ):
                page.get_by_role("button", name="تلاش دوباره").click()

            page.get_by_role("heading", name="هنرمندی پیدا نشد").wait_for()
            self.assertEqual(attempts["count"], 2)
        finally:
            context.close()

    def test_artist_directory_renders_a_clear_empty_state_for_zero_results(self):
        context, page = self.new_page()
        page.route(
            "**/api/v1/artists**",
            lambda route: route.fulfill(
                status=200,
                content_type="application/json",
                body=json.dumps({
                    "data": [],
                    "current_page": 1,
                    "last_page": 1,
                    "per_page": 12,
                    "total": 0,
                }),
            ),
        )
        try:
            page.goto(BASE_URL + "/artists")
            page.get_by_role("heading", name="هنرمند را کشف کنید.").wait_for()
            page.get_by_role("heading", name="هنرمندی پیدا نشد").wait_for()
            self.assertIn("نام یا شهر دیگری را جست‌وجو کنید", page.locator("main").inner_text())
        finally:
            context.close()

    def test_artist_search_is_keyboard_submittable_and_keeps_query_in_url(self):
        context, page = self.new_page()
        requested_queries = []

        def artists(route):
            query = parse_qs(urlparse(route.request.url).query)
            requested_queries.append(query.get("q", [""])[0])
            route.fulfill(
                status=200,
                content_type="application/json",
                body=json.dumps({
                    "data": [],
                    "current_page": 1,
                    "last_page": 1,
                    "per_page": 12,
                    "total": 0,
                }),
            )

        page.route("**/api/v1/artists**", artists)
        try:
            page.goto(BASE_URL + "/artists")
            search = page.get_by_role("searchbox", name="جست‌وجوی هنرمند")
            search.fill("آبرنگ")
            with page.expect_response(
                lambda response: "/api/v1/artists" in response.url
                and parse_qs(urlparse(response.url).query).get("q") == ["آبرنگ"]
            ):
                search.press("Enter")

            self.assertEqual(page.evaluate(
                "() => new URL(window.location.href).searchParams.get('q')"
            ), "آبرنگ")
            self.assertIn("آبرنگ", requested_queries)
        finally:
            context.close()


if __name__ == "__main__":
    unittest.main(verbosity=2)
