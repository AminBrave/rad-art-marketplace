import unittest
import uuid

from playwright.sync_api import sync_playwright

from config import BASE_URL, IGNORE_HTTPS_ERRORS


class FullStackAuthenticationTests(unittest.TestCase):
    """Unmocked journey through React, Laravel session auth and SQLite."""

    @classmethod
    def setUpClass(cls):
        cls.playwright = sync_playwright().start()
        cls.browser = cls.playwright.chromium.launch()

    @classmethod
    def tearDownClass(cls):
        cls.browser.close()
        cls.playwright.stop()

    def test_buyer_registration_creates_session_and_survives_refresh(self):
        context = self.browser.new_context(
            viewport={"width": 1280, "height": 900},
            ignore_https_errors=IGNORE_HTTPS_ERRORS,
        )
        page = context.new_page()
        page.set_default_timeout(20000)
        try:
            email = f"buyer-{uuid.uuid4().hex}@example.test"
            page.goto(BASE_URL + "/register")
            page.get_by_role("heading", name="ساخت حساب کاربری").wait_for()
            page.locator('select[name="role"]').select_option("buyer")
            page.locator('input[name="name"]').fill("خریدار آزمون یکپارچه")
            page.locator('input[name="email"]').fill(email)
            page.locator('input[name="password"]').fill("strong-password-123")
            page.locator('input[name="password_confirmation"]').fill("strong-password-123")
            with page.expect_response(
                lambda response: response.url.endswith("/api/v1/auth/register")
                and response.request.method == "POST",
                timeout=20_000,
            ) as registration_response:
                page.get_by_role("button", name="ایجاد حساب").click()
            self.assertEqual(
                201,
                registration_response.value.status,
                f"Registration failed with HTTP {registration_response.value.status}.",
            )
            page.wait_for_function(
                "() => window.location.pathname === '/dashboard/buyer' "
                "|| window.location.pathname.startsWith('/dashboard/buyer/')",
                timeout=20_000,
            )
            page.get_by_role("heading", name="هنر مورد علاقه‌تان را کشف کنید و گفت‌وگو را ادامه دهید.").wait_for()

            response = page.reload()
            self.assertEqual(response.status, 200)
            page.get_by_role("heading", name="هنر مورد علاقه‌تان را کشف کنید و گفت‌وگو را ادامه دهید.").wait_for()
            auth = page.evaluate("""async () => {
                const response = await fetch('/api/v1/auth/me', {
                    headers: { Accept: 'application/json' }, credentials: 'same-origin'
                });
                return { status: response.status, body: await response.json() };
            }""")
            self.assertEqual(auth["status"], 200)
            self.assertEqual(auth["body"]["data"]["email"], email)
            self.assertEqual(auth["body"]["data"]["role"], "buyer")
        finally:
            context.close()

    def test_guest_cannot_access_buyer_conversations_without_a_session(self):
        context = self.browser.new_context(ignore_https_errors=IGNORE_HTTPS_ERRORS)
        page = context.new_page()
        try:
            page.goto(BASE_URL + "/login", wait_until="domcontentloaded")
            status = page.evaluate("""async () => {
                const response = await fetch('/api/v1/buyer/conversations', {
                    headers: { Accept: 'application/json' }, credentials: 'same-origin'
                });
                return response.status;
            }""")
            self.assertIn(status, [401, 403])
        finally:
            context.close()


if __name__ == "__main__":
    unittest.main(verbosity=2)
