import os
import unittest
from playwright.sync_api import sync_playwright

BASE_URL = os.environ.get("RAD_ART_BASE_URL", "http://127.0.0.1:8000")
BUYER = {"id": 42, "name": "Buyer QA", "email": "buyer@example.test", "role": "buyer"}
ARTIST = {"id": 84, "name": "Artist QA", "email": "artist@example.test", "role": "artist"}
INQUIRY = {
    "id": 101,
    "subject": "پرسش درباره اثر آبی",
    "message": "سلام، لطفاً اطلاعات بیشتری درباره این اثر ارسال کنید.",
    "status": "new",
    "created_at": "2026-11-09T10:30:00.000000Z",
    "artist": {"display_name": "هنرمند آزمایشی", "slug": "qa-artist"},
    "artwork": {"title": "ترکیب آبی", "slug": "blue-study"},
}

class BuyerInquiryBrowserTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.playwright = sync_playwright().start()
        cls.browser = cls.playwright.chromium.launch()
    
    @classmethod
    def tearDownClass(cls):
        cls.browser.close()
        cls.playwright.stop()

    def new_page(self, user=BUYER, viewport=None):
        context = self.browser.new_context(viewport=viewport or {"width": 1280, "height": 900})
        page = context.new_page()
        page.route("**/api/v1/auth/me", lambda route: route.fulfill(
            status=200, content_type="application/json",
            body='{"data":' + (__import__("json").dumps(user, ensure_ascii=False) if user else "null") + '}'
        ))
        page.route("**/api/v1/buyer/inquiries**", lambda route: route.fulfill(
            status=200, content_type="application/json",
            body=__import__("json").dumps({
                "data": [INQUIRY], "current_page": 1, "last_page": 1,
                "per_page": 12, "total": 1
            }, ensure_ascii=False)
        ))
        page.route("**/api/v1/buyer/inquiries/101", lambda route: route.fulfill(
            status=200, content_type="application/json",
            body=__import__("json").dumps({"data": INQUIRY}, ensure_ascii=False)
        ))
        page.route("**/api/v1/buyer/inquiries/999", lambda route: route.fulfill(
            status=404, content_type="application/json",
            body='{"message":"Not found"}'
        ))
        return context, page

    def test_buyer_can_open_inquiry_from_history(self):
        context, page = self.new_page()
        try:
            page.goto(BASE_URL + "/dashboard/buyer/inquiries")
            page.get_by_role("heading", name="درخواست‌های ارسال‌شده").wait_for()
            page.get_by_role("link", name="مشاهده جزئیات").click()
            page.get_by_role("heading", name=INQUIRY["subject"]).wait_for()
            self.assertIn(INQUIRY["message"], page.locator("body").inner_text())
            self.assertIn("درخواست اولیه", page.locator("body").inner_text())
            self.assertNotIn("buyer@example.test", page.locator("body").inner_text())
        finally:
            context.close()

    def test_direct_deep_link_and_refresh_render_detail(self):
        context, page = self.new_page()
        try:
            url = BASE_URL + "/dashboard/buyer/inquiries/101"
            response = page.goto(url)
            self.assertEqual(response.status, 200)
            page.get_by_role("heading", name=INQUIRY["subject"]).wait_for()
            response = page.reload()
            self.assertEqual(response.status, 200)
            page.get_by_text(INQUIRY["message"]).wait_for()
        finally:
            context.close()

    def test_back_to_history_preserves_page_context(self):
        context, page = self.new_page()
        try:
            page.goto(BASE_URL + "/dashboard/buyer/inquiries/101?page=2")
            page.get_by_role("heading", name=INQUIRY["subject"]).wait_for()
            page.get_by_role("button", name="بازگشت به فهرست درخواست‌ها").click()
            page.wait_for_url("**/dashboard/buyer/inquiries?page=2")
            page.get_by_role("heading", name="درخواست‌های ارسال‌شده").wait_for()
        finally:
            context.close()

    def test_guest_is_redirected_to_login(self):
        context, page = self.new_page(user=None)
        try:
            page.goto(BASE_URL + "/dashboard/buyer/inquiries/101")
            page.wait_for_url("**/login")
            page.get_by_role("heading", name="ورود به حساب").wait_for()
        finally:
            context.close()

    def test_wrong_role_is_redirected_to_unauthorized(self):
        context, page = self.new_page(user=ARTIST)
        try:
            page.goto(BASE_URL + "/dashboard/buyer/inquiries/101")
            page.wait_for_url("**/unauthorized")
            page.get_by_role("heading", name="دسترسی به این بخش مجاز نیست").wait_for()
        finally:
            context.close()

    def test_missing_or_foreign_inquiry_shows_not_found_without_content_leak(self):
        context, page = self.new_page()
        try:
            page.goto(BASE_URL + "/dashboard/buyer/inquiries/999")
            page.get_by_role("heading", name="جزئیات درخواست در دسترس نیست").wait_for()
            self.assertIn("این درخواست در حساب شما پیدا نشد", page.locator("body").inner_text())
            self.assertNotIn(INQUIRY["message"], page.locator("body").inner_text())
        finally:
            context.close()

    def test_detail_has_no_horizontal_overflow_on_mobile(self):
        context, page = self.new_page(viewport={"width": 375, "height": 812})
        try:
            page.goto(BASE_URL + "/dashboard/buyer/inquiries/101")
            page.get_by_role("heading", name=INQUIRY["subject"]).wait_for()
            dimensions = page.evaluate("({width: document.documentElement.clientWidth, scrollWidth: document.documentElement.scrollWidth})")
            self.assertLessEqual(dimensions["scrollWidth"], dimensions["width"])
        finally:
            context.close()

if __name__ == "__main__":
    unittest.main(verbosity=2)
