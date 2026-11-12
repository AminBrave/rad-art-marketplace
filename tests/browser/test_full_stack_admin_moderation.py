"""Unmocked admin moderation and role-boundary journeys."""

import unittest

from playwright.sync_api import sync_playwright

from config import BASE_URL, IGNORE_HTTPS_ERRORS


class FullStackAdminModerationTests(unittest.TestCase):
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
            viewport={"width": 1440, "height": 1000},
            ignore_https_errors=IGNORE_HTTPS_ERRORS,
            extra_http_headers={"X-Forwarded-For": "198.51.100.10"},
        )
        page = context.new_page()
        page.set_default_timeout(20000)
        page.set_default_navigation_timeout(20000)
        return context, page

    def login(self, page, email):
        page.goto(BASE_URL + "/login")
        page.locator('input[name="email"]').fill(email)
        page.locator('input[name="password"]').fill("Demo@12345")
        with page.expect_response(
            lambda response: response.url.endswith("/api/v1/auth/login")
            and response.request.method == "POST"
        ) as login_response:
            page.get_by_role("button", name="ورود به حساب").click()
        self.assertEqual(
            200,
            login_response.value.status,
            f"Admin login failed with HTTP {login_response.value.status}. "
            f"Current page: {page.url}. "
            f"Message: {page.locator('[role=\"status\"], [role=\"alert\"]').all_inner_texts()}",
        )

    def test_admin_can_approve_a_pending_artwork_through_the_real_application(self):
        context, page = self.new_page()
        try:
            self.login(page, "admin@rademan.test")
            page.wait_for_function(
                "() => window.location.pathname === '/admin' "
                "|| window.location.pathname.startsWith('/admin/')",
                timeout=20_000,
            )
            page.goto(BASE_URL + "/admin/artworks")
            page.get_by_role("heading", name="صف بررسی و انتشار").wait_for()

            first_card = page.locator("article").first
            first_card.wait_for()
            artwork_title = first_card.locator("h2").inner_text()

            with page.expect_response(
                lambda response: "/api/v1/admin/artworks/" in response.url
                and response.url.endswith("/moderation")
                and response.request.method == "PATCH"
            ) as moderation_response:
                first_card.get_by_role("button", name="تأیید و انتشار").click()

            self.assertEqual(moderation_response.value.status, 200)
            page.get_by_role("status").filter(has_text="منتشر").wait_for()
            page.wait_for_function(
                """(title) => ![...document.querySelectorAll('article h2')]
                    .some(heading => heading.textContent.trim() === title)""",
                arg=artwork_title,
            )
        finally:
            context.close()

    def test_buyer_is_redirected_from_admin_workspace_and_api_denies_access(self):
        context, page = self.new_page()
        try:
            self.login(page, "buyer-empty@rademan.test")
            page.wait_for_url("**/dashboard/buyer")
            page.goto(BASE_URL + "/admin")
            page.wait_for_url("**/unauthorized")

            status = page.evaluate("""async () => {
                const response = await fetch('/api/v1/admin/users', {
                    headers: { Accept: 'application/json' }, credentials: 'same-origin'
                });
                return response.status;
            }""")
            self.assertEqual(status, 403)
        finally:
            context.close()


if __name__ == "__main__":
    unittest.main(verbosity=2)
