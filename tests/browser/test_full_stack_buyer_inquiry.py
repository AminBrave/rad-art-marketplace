"""Verify Inquiry is disabled while direct messaging remains operational."""

import unittest

from playwright.sync_api import sync_playwright

from config import BASE_URL, IGNORE_HTTPS_ERRORS


class InquiryDisabledFullStackTests(unittest.TestCase):
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
        page.set_default_timeout(20000)
        page.set_default_navigation_timeout(20000)
        return context, page

    def login_buyer(self, page):
        page.goto(BASE_URL + "/login")
        page.locator('input[name="email"]').fill("buyer-empty@rademan.test")
        page.locator('input[name="password"]').fill("Demo@12345")
        page.get_by_role("button", name="ورود به حساب").click()
        page.wait_for_url("**/dashboard/buyer")

    def test_inquiry_api_is_closed_and_direct_conversation_can_still_start(self):
        context, page = self.new_page()
        try:
            self.login_buyer(page)
            page.goto(BASE_URL + "/artists/arman-rezaei")
            page.get_by_role("heading", name="آرمان رضایی").wait_for()

            self.assertEqual(page.get_by_label("موضوع").count(), 0)
            self.assertEqual(page.get_by_label("متن پیام").count(), 0)

            inquiry_response = page.evaluate("""async () => {
                const response = await fetch('/api/v1/buyer/inquiries', {
                    headers: { Accept: 'application/json' }, credentials: 'same-origin'
                });
                return response.status;
            }""")
            self.assertEqual(inquiry_response, 404)

            with page.expect_response(
                lambda response: response.url.endswith("/api/v1/conversations/direct")
                and response.request.method == "POST"
            ) as direct_response:
                page.get_by_role("link", name="پیام مستقیم").click()

            self.assertEqual(direct_response.value.status, 201)
            page.wait_for_url("**/dashboard/buyer/messages*")
            page.get_by_label("متن پیام").wait_for()
        finally:
            context.close()


if __name__ == "__main__":
    unittest.main(verbosity=2)
