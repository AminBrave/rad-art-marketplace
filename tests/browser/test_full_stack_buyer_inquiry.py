"""Unmocked buyer inquiry submission and artist-side privacy journey."""

import unittest

from playwright.sync_api import sync_playwright

from config import BASE_URL, IGNORE_HTTPS_ERRORS


class FullStackBuyerInquiryTests(unittest.TestCase):
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

    def login(self, page, email):
        page.goto(BASE_URL + "/login")
        page.locator('input[name="email"]').fill(email)
        page.locator('input[name="password"]').fill("Demo@12345")
        page.get_by_role("button", name="ورود به حساب").click()

    def test_buyer_inquiry_is_visible_to_artist_without_disclosing_buyer_email(self):
        buyer_context, buyer_page = self.new_page()
        artist_context, artist_page = self.new_page()

        try:
            self.login(buyer_page, "buyer-empty@rademan.test")
            buyer_page.wait_for_url("**/dashboard/buyer")
            buyer_page.goto(BASE_URL + "/artists/arman-rezaei")
            buyer_page.get_by_role("heading", name="آرمان رضایی").wait_for()

            subject = "پرسش درباره روند خلق اثر"
            message = "سلام، لطفاً درباره روند خلق این آثار و شرایط تهیه آن توضیح دهید."

            buyer_page.get_by_label("موضوع").fill(subject)
            buyer_page.get_by_label("متن پیام").fill(message)

            with buyer_page.expect_response(
                lambda response: response.url.endswith("/api/v1/artists/arman-rezaei/inquiries")
                and response.request.method == "POST"
            ) as inquiry_response:
                buyer_page.get_by_role("button", name="ارسال پیام", exact=True).click()

            self.assertEqual(inquiry_response.value.status, 201)
            inquiry_id = inquiry_response.value.json()["data"]["id"]
            buyer_page.get_by_role("status").filter(has_text="با موفقیت").wait_for()

            buyer_page.goto(BASE_URL + "/dashboard/buyer/inquiries")
            buyer_page.get_by_role("heading", name="درخواست‌های ارسال‌شده").wait_for()
            buyer_page.get_by_text(subject, exact=True).wait_for()

            self.login(artist_page, "artist@rademan.test")
            artist_page.wait_for_url("**/dashboard/artist")
            artist_page.goto(BASE_URL + "/dashboard/artist/inquiries")
            artist_page.get_by_role("heading", name="صندوق درخواست‌ها").wait_for()
            artist_page.get_by_text(subject, exact=True).wait_for()

            artist_view = artist_page.evaluate("""async (id) => {
                const response = await fetch('/api/v1/artist/inquiries/' + id, {
                    headers: { Accept: 'application/json' }, credentials: 'same-origin'
                });
                const result = await response.json();
                return { status: response.status, buyer: result.data?.buyer };
            }""", inquiry_id)

            self.assertEqual(artist_view["status"], 200)
            self.assertEqual(artist_view["buyer"], {"name": "خریدار بدون درخواست"})
            self.assertNotIn("email", artist_view["buyer"])
        finally:
            buyer_context.close()
            artist_context.close()


if __name__ == "__main__":
    unittest.main(verbosity=2)
