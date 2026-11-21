"""Browser-level admin unified-content moderation states with API fixtures."""

import unittest

from playwright.sync_api import sync_playwright

from config import BASE_URL, IGNORE_HTTPS_ERRORS


class AdminContentModerationBrowserTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.playwright = sync_playwright().start()
        cls.browser = cls.playwright.chromium.launch(headless=True)

    @classmethod
    def tearDownClass(cls):
        cls.browser.close()
        cls.playwright.stop()

    def setUp(self):
        self.context = self.browser.new_context(
            locale="fa-IR",
            viewport={"width": 1440, "height": 1000},
            ignore_https_errors=IGNORE_HTTPS_ERRORS,
        )
        self.page = self.context.new_page()
        self.page.set_default_timeout(20_000)

    def tearDown(self):
        self.context.close()

    def login_as_admin(self):
        self.page.goto(BASE_URL + "/login", wait_until="domcontentloaded")
        self.page.get_by_label("ایمیل").fill("admin@rademan.test")
        self.page.get_by_label("گذرواژه").fill("Demo@12345")
        with self.page.expect_response(
            lambda response: response.url.endswith("/api/v1/auth/login")
            and response.request.method == "POST"
        ) as login_response:
            self.page.get_by_role("button", name="ورود به حساب").click()
        self.assertEqual(200, login_response.value.status)
        self.page.wait_for_url("**/admin**", timeout=20_000)

    def test_admin_note_validation_failure_retry_and_unavailable_source_controls(self):
        moderation = {
            "id": 88001,
            "title": "اثر آزمایشی برای بررسی",
            "description": "محتوای نمونه برای آزمون گردش نظارت.",
            "source": "native",
            "moderation_status": "pending_review",
            "publication_status": "draft",
            "artist_approved_at": None,
            "created_at": "2026-11-21T10:00:00Z",
            "artist": {"display_name": "هنرمند آزمایشی"},
        }
        unavailable = {
            "id": 88002,
            "title": "محتوای منبع خارجی",
            "description": None,
            "source": "instagram",
            "moderation_status": "unavailable",
            "publication_status": "draft",
            "artist_approved_at": None,
            "created_at": "2026-11-21T10:00:00Z",
            "artist": {"display_name": "هنرمند آزمایشی"},
        }
        state = {"decision_saved": False, "patch_attempts": 0}

        def admin_contents(route):
            request = route.request
            if request.method == "PATCH":
                state["patch_attempts"] += 1
                if state["patch_attempts"] == 1:
                    route.fulfill(
                        status=422,
                        json={
                            "message": "توضیح معتبر نیست.",
                            "errors": {"note": ["توضیح برای ثبت تصمیم الزامی است."]},
                        },
                    )
                    return
                state["decision_saved"] = True
                route.fulfill(status=200, json={"message": "تصمیم نظارتی ثبت شد."})
                return

            if "moderation_status=unavailable" in request.url:
                rows = [unavailable]
            else:
                rows = [] if state["decision_saved"] else [moderation]
            route.fulfill(
                status=200,
                json={
                    "data": rows,
                    "current_page": 1,
                    "last_page": 1,
                    "total": len(rows),
                },
            )

        self.context.route("**/api/v1/admin/contents**", admin_contents)
        self.login_as_admin()
        self.page.goto(BASE_URL + "/admin/contents", wait_until="domcontentloaded")
        self.page.get_by_role("heading", name="بررسی کتابخانه محتوا").wait_for()

        card = self.page.locator("article").filter(has_text="اثر آزمایشی برای بررسی")
        card.wait_for()
        card.get_by_role("button", name="رد محتوا").click()
        self.page.get_by_text(
            "برای رد محتوا یا درخواست اصلاح، نوشتن توضیح الزامی است.",
            exact=True,
        ).wait_for()
        self.assertEqual(0, state["patch_attempts"], "Client-side note validation must block an empty decision.")

        card.get_by_label("توضیح برای هنرمند").fill("لطفاً اطلاعات اثر را تکمیل کنید.")
        with self.page.expect_response(
            lambda response: response.url.endswith("/api/v1/admin/contents/88001/moderation")
            and response.request.method == "PATCH"
        ) as failed_decision:
            card.get_by_role("button", name="رد محتوا").click()
        self.assertEqual(422, failed_decision.value.status)
        self.page.get_by_role("heading", name="عملیات انجام نشد").wait_for()
        self.page.get_by_text("توضیح برای ثبت تصمیم الزامی است.", exact=True).wait_for()

        with self.page.expect_response(
            lambda response: response.url.endswith("/api/v1/admin/contents/88001/moderation")
            and response.request.method == "PATCH"
        ) as retried_decision:
            card.get_by_role("button", name="رد محتوا").click()
        self.assertEqual(200, retried_decision.value.status)
        self.page.get_by_text("تصمیم نظارتی ثبت شد.", exact=True).wait_for()
        self.page.get_by_text("محتوایی در این وضعیت وجود ندارد", exact=True).wait_for()

        self.page.get_by_role("button", name="فعلاً قابل بررسی نیست").click()
        self.page.wait_for_url("**/admin/contents?status=unavailable")
        unavailable_card = self.page.locator("article").filter(has_text="محتوای منبع خارجی")
        unavailable_card.wait_for()
        self.assertFalse(unavailable_card.get_by_role("button", name="تأیید").count())
        self.assertFalse(unavailable_card.get_by_role("button", name="درخواست اصلاح").count())
        self.assertFalse(unavailable_card.get_by_role("button", name="رد محتوا").count())


if __name__ == "__main__":
    unittest.main(verbosity=2)
