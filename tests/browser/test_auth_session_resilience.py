import json
import unittest
import uuid

from playwright.sync_api import sync_playwright

from config import BASE_URL, IGNORE_HTTPS_ERRORS


class AuthSessionResilienceTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.playwright = sync_playwright().start()
        cls.browser = cls.playwright.chromium.launch()

    @classmethod
    def tearDownClass(cls):
        cls.browser.close()
        cls.playwright.stop()

    def new_context(self):
        context = self.browser.new_context(
            viewport={"width": 1280, "height": 900},
            ignore_https_errors=IGNORE_HTTPS_ERRORS,
        )
        page = context.new_page()
        page.set_default_timeout(15000)
        return context, page

    def test_expired_session_redirects_to_login_and_returns_to_requested_workspace_after_reauthentication(self):
        context, page = self.new_context()
        user = {
            "id": 71001,
            "name": "خریدار آزمون نشست",
            "email": "session-resilience@example.test",
            "role": "buyer",
        }

        page.route(
            "**/api/v1/auth/me",
            lambda route: route.fulfill(
                status=200,
                content_type="application/json",
                body=json.dumps({"data": user}),
            ),
        )
        page.route(
            "**/api/v1/notifications",
            lambda route: route.fulfill(
                status=401,
                content_type="application/json",
                body=json.dumps({"message": "Unauthenticated."}),
            ),
        )
        page.route(
            "**/api/v1/notifications/preferences",
            lambda route: route.fulfill(
                status=200,
                content_type="application/json",
                body=json.dumps({"data": {"in_app_messages": True, "email_available": False}}),
            ),
        )
        page.route(
            "**/api/v1/auth/login",
            lambda route: route.fulfill(
                status=200,
                content_type="application/json",
                body=json.dumps({"data": user}),
            ),
        )

        try:
            page.goto(BASE_URL + "/dashboard/buyer")
            page.get_by_role("heading", name="ورود به حساب").wait_for()
            self.assertEqual(page.url.split("?", 1)[0], BASE_URL + "/login")

            page.get_by_label("ایمیل").fill(user["email"])
            page.get_by_label("گذرواژه").fill("strong-password-123")
            with page.expect_response(
                lambda response: response.url.endswith("/api/v1/auth/login")
                and response.request.method == "POST"
                and response.status == 200
            ):
                page.get_by_role("button", name="ورود به حساب").click()

            page.wait_for_url("**/dashboard/buyer")
            page.get_by_role(
                "heading",
                name="هنر مورد علاقه‌تان را کشف کنید و گفت‌وگو را ادامه دهید.",
            ).wait_for()
        finally:
            context.close()

    def test_rapid_duplicate_registration_submission_creates_only_one_request(self):
        context, page = self.new_context()
        attempts = {"count": 0}
        email = f"duplicate-{uuid.uuid4().hex}@example.test"
        user = {
            "id": 71002,
            "name": "ثبت‌نام آزمون",
            "email": email,
            "role": "buyer",
        }

        page.route(
            "**/api/v1/auth/me",
            lambda route: route.fulfill(
                status=200,
                content_type="application/json",
                body='{"data":null}',
            ),
        )

        def register(route):
            attempts["count"] += 1
            route.fulfill(
                status=201,
                content_type="application/json",
                body=json.dumps({"data": user}),
            )

        page.route("**/api/v1/auth/register", register)

        try:
            page.goto(BASE_URL + "/register")
            page.get_by_role("heading", name="ساخت حساب کاربری").wait_for()
            page.locator('select[name="role"]').select_option("buyer")
            page.locator('input[name="name"]').fill(user["name"])
            page.locator('input[name="email"]').fill(email)
            page.locator('input[name="password"]').fill("strong-password-123")
            page.locator('input[name="password_confirmation"]').fill("strong-password-123")

            page.get_by_role("button", name="ایجاد حساب").evaluate(
                "(button) => { button.click(); button.click(); }"
            )

            page.wait_for_url("**/dashboard/buyer")
            page.get_by_role(
                "heading",
                name="هنر مورد علاقه‌تان را کشف کنید و گفت‌وگو را ادامه دهید.",
            ).wait_for()
            self.assertEqual(
                attempts["count"],
                1,
                "A rapid double activation must not submit registration twice.",
            )
        finally:
            context.close()


if __name__ == "__main__":
    unittest.main(verbosity=2)
