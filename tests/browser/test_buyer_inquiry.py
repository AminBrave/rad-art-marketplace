import json
import unittest
from playwright.sync_api import sync_playwright

from config import BASE_URL, IGNORE_HTTPS_ERRORS

BUYER = {"id": 42, "name": "Buyer QA", "email": "buyer@example.test", "role": "buyer"}
ARTIST = {"id": 84, "name": "Artist QA", "email": "artist@example.test", "role": "artist"}


class InquiryDisabledBrowserTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.playwright = sync_playwright().start()
        cls.browser = cls.playwright.chromium.launch()

    @classmethod
    def tearDownClass(cls):
        cls.browser.close()
        cls.playwright.stop()

    def new_page(self, user=BUYER):
        context = self.browser.new_context(
            viewport={"width": 1280, "height": 900},
            ignore_https_errors=IGNORE_HTTPS_ERRORS,
        )
        page = context.new_page()
        page.set_default_timeout(15000)
        page.set_default_navigation_timeout(15000)
        page.route("**/api/v1/auth/me", lambda route: route.fulfill(
            status=200, content_type="application/json",
            body=json.dumps({"data": user}, ensure_ascii=False),
        ))
        page.route("**/api/v1/notifications", lambda route: route.fulfill(
            status=200, content_type="application/json",
            body='{"data":[],"current_page":1,"last_page":1,"per_page":20,"total":0,"unread_count":0}',
        ))
        page.route("**/api/v1/notifications/preferences", lambda route: route.fulfill(
            status=200, content_type="application/json",
            body='{"data":{"in_app_messages":true,"email_messages":false,"email_available":false}}',
        ))
        return context, page

    def test_buyer_inquiry_deep_link_is_not_registered_in_the_client_router(self):
        context, page = self.new_page()
        try:
            page.goto(BASE_URL + "/dashboard/buyer/inquiries")
            page.get_by_role("heading", name="این صفحه پیدا نشد").wait_for()
            self.assertNotIn("درخواست‌های ارسال‌شده", page.locator("body").inner_text())
        finally:
            context.close()

    def test_artist_inquiry_deep_link_is_not_registered_in_the_client_router(self):
        context, page = self.new_page(user=ARTIST)
        try:
            page.goto(BASE_URL + "/dashboard/artist/inquiries")
            page.get_by_role("heading", name="این صفحه پیدا نشد").wait_for()
            self.assertNotIn("صندوق درخواست‌ها", page.locator("body").inner_text())
        finally:
            context.close()

    def test_artist_overview_does_not_request_inquiry_data_and_keeps_messaging_link(self):
        context, page = self.new_page(user=ARTIST)
        inquiry_requests = []
        page.on("request", lambda request: inquiry_requests.append(request.url)
                if "/api/v1/artist/inquiries" in request.url else None)
        try:
            page.route("**/api/v1/artist-profile/me", lambda route: route.fulfill(
                status=200, content_type="application/json",
                body=json.dumps({"data": {
                    "slug": "qa-artist", "display_name": "هنرمند آزمایشی",
                    "is_public": True,
                }}, ensure_ascii=False),
            ))
            page.route("**/api/v1/artist/artworks", lambda route: route.fulfill(
                status=200, content_type="application/json",
                body='{"data":[],"total":0,"current_page":1,"last_page":1}',
            ))
            page.goto(BASE_URL + "/dashboard/artist")
            page.get_by_role("heading", name="خوش آمدید، Artist QA").wait_for()
            page.get_by_role("link", name="پیام‌های مستقیم").first.wait_for()
            self.assertEqual(inquiry_requests, [])
        finally:
            context.close()

    def test_artist_profile_hides_inquiry_form_but_keeps_direct_message_entry(self):
        context, page = self.new_page()
        try:
            page.route("**/api/v1/artists/qa-artist**", lambda route: route.fulfill(
                status=200, content_type="application/json",
                body=json.dumps({"data": {
                    "slug": "qa-artist",
                    "display_name": "هنرمند آزمایشی",
                    "bio": "معرفی هنری",
                    "city": "",
                    "website_url": None,
                    "instagram_handle": None,
                    "artworks": [],
                    "artworks_pagination": {
                        "current_page": 1, "per_page": 12,
                        "has_more": False, "next_page": None,
                    },
                }}, ensure_ascii=False),
            ))
            page.goto(BASE_URL + "/artists/qa-artist")
            page.get_by_role("heading", name="هنرمند آزمایشی").wait_for()
            page.get_by_role("link", name="پیام مستقیم").wait_for()
            self.assertEqual(page.get_by_label("موضوع").count(), 0)
            self.assertEqual(page.get_by_label("متن پیام").count(), 0)
        finally:
            context.close()


if __name__ == "__main__":
    unittest.main(verbosity=2)
