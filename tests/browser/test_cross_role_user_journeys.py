"""Local Playwright journeys for real-user RAD browsing and role workflows."""

from __future__ import annotations

import unittest
import uuid

from playwright.sync_api import Browser, Page, sync_playwright

from config import BASE_URL, IGNORE_HTTPS_ERRORS


DEMO_PASSWORD = "Demo@12345"


class RealUserBrowserFlowTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.playwright = sync_playwright().start()
        cls.browser: Browser = cls.playwright.chromium.launch(headless=True)

    @classmethod
    def tearDownClass(cls) -> None:
        cls.browser.close()
        cls.playwright.stop()

    def setUp(self) -> None:
        self.context = self.browser.new_context(
            locale="fa-IR",
            viewport={"width": 1440, "height": 1000},
            ignore_https_errors=IGNORE_HTTPS_ERRORS,
            extra_http_headers={"X-Forwarded-For": f"198.51.100.{1 + (uuid.uuid4().int % 253)}"},
        )
        self.page: Page = self.context.new_page()
        self.page_errors: list[str] = []
        self.page.on("pageerror", lambda error: self.page_errors.append(str(error)))

    def tearDown(self) -> None:
        self.context.close()

    def login(self, email: str, expected_path: str) -> None:
        self.page.goto(BASE_URL + "/login", wait_until="domcontentloaded")
        self.page.get_by_label("ایمیل").fill(email)
        self.page.get_by_label("گذرواژه").fill(DEMO_PASSWORD)
        with self.page.expect_response(
            lambda response: response.url.endswith("/api/v1/auth/login")
            and response.request.method == "POST"
        ) as login_response:
            self.page.get_by_role("button", name="ورود به حساب").click()
        self.assertEqual(
            200,
            login_response.value.status,
            f"Demo login failed with HTTP {login_response.value.status}. "
            f"Current page: {self.page.url}. "
            f"Message: {self.page.locator('[role=\"status\"], [role=\"alert\"]').all_inner_texts()}",
        )
        self.page.wait_for_function(
            "(path) => window.location.pathname === path || window.location.pathname.startsWith(path + '/')",
            arg=expected_path,
            timeout=20_000,
        )

    def assert_no_uncaught_page_errors(self) -> None:
        self.assertEqual([], self.page_errors, "The browser raised uncaught JavaScript errors.")

    def test_public_discovery_routes_render_with_real_seeded_content(self) -> None:
        routes = [
            "/",
            "/artworks",
            "/artworks/demo-01-01",
            "/artists",
            "/artists/arman-rezaei",
            "/collections",
            "/collections/demo-curated-selection",
        ]

        for route in routes:
            with self.subTest(route=route):
                response = self.page.goto(BASE_URL + route, wait_until="domcontentloaded")
                self.assertIsNotNone(response)
                self.assertEqual(200, response.status)
                self.page.locator("main").first.wait_for(timeout=20_000)
                self.assertTrue(self.page.locator("body").inner_text().strip())
                self.assert_no_uncaught_page_errors()

    def test_mobile_catalogue_and_buyer_inbox_fit_the_viewport(self) -> None:
        self.page.set_viewport_size({"width": 390, "height": 844})
        self.page.goto(BASE_URL + "/artworks", wait_until="domcontentloaded")
        self.page.locator("main").first.wait_for(timeout=20_000)
        catalogue_overflow = self.page.evaluate("document.documentElement.scrollWidth > window.innerWidth")
        self.assertFalse(catalogue_overflow, "The mobile catalogue must not introduce horizontal page overflow.")

        self.login("buyer@rademan.test", "/dashboard/buyer")
        self.page.goto(BASE_URL + "/dashboard/buyer/messages", wait_until="domcontentloaded")
        self.page.get_by_text("گفتگوها", exact=True).wait_for(timeout=20_000)
        inbox_overflow = self.page.evaluate("document.documentElement.scrollWidth > window.innerWidth")
        self.assertFalse(inbox_overflow, "The mobile inbox must fit the viewport without horizontal page overflow.")
        self.assert_no_uncaught_page_errors()

    def test_anonymous_user_cannot_open_admin_workspace(self) -> None:
        self.page.goto(BASE_URL + "/admin", wait_until="domcontentloaded")
        self.page.get_by_label("ایمیل").wait_for(timeout=15_000)
        self.assertTrue(self.page.get_by_role("button", name="ورود به حساب").is_visible())
        self.assert_no_uncaught_page_errors()

    def test_empty_demo_buyer_sees_the_real_empty_inbox_state(self) -> None:
        self.login("buyer-empty@rademan.test", "/dashboard/buyer")
        self.page.goto(BASE_URL + "/dashboard/buyer/messages", wait_until="domcontentloaded")
        self.page.get_by_text("هنوز گفتگویی ندارید.", exact=False).wait_for(timeout=20_000)
        self.assert_no_uncaught_page_errors()

    def test_buyer_can_start_an_artwork_context_conversation_and_send_a_message(self) -> None:
        self.login("buyer@rademan.test", "/dashboard/buyer")
        self.page.goto(BASE_URL + "/artworks/demo-01-01", wait_until="domcontentloaded")
        self.page.get_by_role("link", name="پیام مستقیم درباره این اثر").wait_for(timeout=20_000)
        self.page.get_by_role("link", name="پیام مستقیم درباره این اثر").click()
        self.page.wait_for_url("**/dashboard/buyer/messages**", timeout=20_000)

        composer = self.page.get_by_label("متن پیام")
        composer.wait_for(timeout=20_000)
        self.page.get_by_text("پاسخ درباره این اثر").wait_for(timeout=20_000)
        message = f"پیام آزمایشی مرورگر برای بررسی ارتباط مستقیم درباره اثر {uuid.uuid4().hex[:8]}"
        composer.fill(message)
        composer.press("Enter")
        self.page.get_by_role("log", name="پیام‌های گفتگو").get_by_text(message, exact=True).wait_for(timeout=20_000)
        self.assert_no_uncaught_page_errors()

        self.context.clear_cookies()
        self.login("artist@rademan.test", "/dashboard/artist")
        self.page.goto(BASE_URL + "/dashboard/artist/messages", wait_until="domcontentloaded")
        self.page.get_by_text("مینا خریدار", exact=True).click()
        self.page.get_by_role("log", name="پیام‌های گفتگو").get_by_text(message, exact=True).wait_for(timeout=20_000)
        self.page.get_by_role("log", name="پیام‌های گفتگو").get_by_role("link", name="روایت رنگ‌ها 1", exact=True).first.wait_for(timeout=20_000)
        self.assert_no_uncaught_page_errors()

    def test_artist_and_admin_can_open_their_role_workspaces(self) -> None:
        self.login("artist@rademan.test", "/dashboard/artist")
        self.page.goto(BASE_URL + "/dashboard/artist/artworks", wait_until="domcontentloaded")
        self.page.get_by_text("مدیریت آثار", exact=True).wait_for(timeout=20_000)
        self.assert_no_uncaught_page_errors()

        self.context.clear_cookies()
        self.login("admin@rademan.test", "/admin")
        self.page.goto(BASE_URL + "/admin/artworks", wait_until="domcontentloaded")
        self.page.locator("main").first.wait_for(timeout=20_000)
        self.assertTrue(self.page.locator("main").inner_text().strip())
        self.assert_no_uncaught_page_errors()


if __name__ == "__main__":
    unittest.main(verbosity=2)
