"""Unmocked buyer-to-artist messaging journey across React, Laravel and SQLite."""

import unittest
import uuid

from playwright.sync_api import sync_playwright

from config import BASE_URL, IGNORE_HTTPS_ERRORS


class FullStackBuyerArtistMessagingTests(unittest.TestCase):
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
            extra_http_headers={"X-Forwarded-For": "198.51.100.13"},
        )
        page = context.new_page()
        page.set_default_timeout(20000)
        page.set_default_navigation_timeout(20000)
        return context, page

    def register_buyer(self, page):
        email = f"buyer-e2e-{uuid.uuid4().hex}@example.test"
        page.goto(BASE_URL + "/register")
        page.locator('select[name="role"]').select_option("buyer")
        page.locator('input[name="name"]').fill("خریدار آزمون کامل")
        page.locator('input[name="email"]').fill(email)
        page.locator('input[name="password"]').fill("strong-password-123")
        page.locator('input[name="password_confirmation"]').fill("strong-password-123")
        page.get_by_role("button", name="ایجاد حساب").click()
        page.wait_for_url("**/dashboard/buyer")
        return email

    def login_artist(self, page):
        page.goto(BASE_URL + "/login")
        page.locator('input[name="email"]').fill("artist@rademan.test")
        page.locator('input[name="password"]').fill("Demo@12345")
        page.get_by_role("button", name="ورود به حساب").click()
        page.wait_for_url("**/dashboard/artist")

    def test_buyer_starts_direct_conversation_artist_replies_and_buyer_receives_reply(self):
        buyer_context, buyer_page = self.new_page()
        artist_context, artist_page = self.new_page()

        try:
            buyer_email = self.register_buyer(buyer_page)
            buyer_page.goto(BASE_URL + "/artists/arman-rezaei")
            buyer_page.get_by_role("heading", name="آرمان رضایی").wait_for()

            with buyer_page.expect_response(
                lambda response: response.url.endswith("/api/v1/conversations/direct")
                and response.request.method == "POST"
            ) as direct_response:
                buyer_page.get_by_role("link", name="ارسال پیام به هنرمند").click()

            buyer_page.wait_for_url("**/dashboard/buyer/messages*")
            self.assertEqual(direct_response.value.status, 201)
            conversation_id = direct_response.value.json()["data"]["id"]

            first_message = "سلام، درباره روند خلق آثار شما پرسشی دارم."
            buyer_page.get_by_label("متن پیام").fill(first_message)
            with buyer_page.expect_response(
                lambda response: response.url.endswith(f"/api/v1/conversations/{conversation_id}/messages")
                and response.request.method == "POST"
            ) as buyer_send:
                buyer_page.get_by_role("button", name="ارسال", exact=True).click()

            self.assertEqual(buyer_send.value.status, 201)
            buyer_page.get_by_role("paragraph").filter(has_text=first_message).wait_for()

            self.login_artist(artist_page)
            artist_page.goto(BASE_URL + f"/dashboard/artist/messages?conversation={conversation_id}")
            artist_page.get_by_role("paragraph").filter(has_text=first_message).wait_for()

            reply = "سلام، خوشحال می‌شوم جزئیات بیشتری درباره اثر ارائه کنم."
            artist_page.get_by_label("متن پیام").fill(reply)
            with artist_page.expect_response(
                lambda response: response.url.endswith(f"/api/v1/conversations/{conversation_id}/messages")
                and response.request.method == "POST"
            ) as artist_send:
                artist_page.get_by_role("button", name="ارسال", exact=True).click()

            self.assertEqual(artist_send.value.status, 201)
            artist_page.get_by_role("paragraph").filter(has_text=reply).wait_for()

            buyer_page.reload()
            buyer_page.get_by_role("button", name="آرمان رضایی").click()
            buyer_page.get_by_role("paragraph").filter(has_text=reply).wait_for()

            buyer_identity = buyer_page.evaluate("""async () => {
                const response = await fetch('/api/v1/auth/me', {
                    headers: { Accept: 'application/json' }, credentials: 'same-origin'
                });
                return (await response.json()).data;
            }""")
            self.assertEqual(buyer_identity["email"], buyer_email)
            self.assertEqual(buyer_identity["role"], "buyer")
        finally:
            buyer_context.close()
            artist_context.close()


if __name__ == "__main__":
    unittest.main(verbosity=2)
