import binascii
import json
import struct
import unittest
import zlib
from playwright.sync_api import sync_playwright

from config import BASE_URL, IGNORE_HTTPS_ERRORS

ARTIST = {"id": 84, "name": "Artist QA", "email": "artist@example.test", "role": "artist"}
PRIVATE_PROFILE = {
    "id": 84, "slug": "private-qa", "display_name": "هنرمند خصوصی آزمایشی",
    "bio": "معرفی هنری برای آزمون پیش‌نمایش خصوصی.", "city": "",
    "website_url": None, "instagram_handle": "qa.artist", "is_public": False,
}
def png_bytes(width, height):
    def chunk(kind, data):
        payload = kind + data
        return struct.pack(">I", len(data)) + payload + struct.pack(">I", binascii.crc32(payload) & 0xffffffff)
    header = struct.pack(">IIBBBBB", width, height, 8, 2, 0, 0, 0)
    raw = b"\x00" + (b"\x00\x00\x00" * width)
    return b"\x89PNG\r\n\x1a\n" + chunk(b"IHDR", header) + chunk(b"IDAT", zlib.compress(raw)) + chunk(b"IEND", b"")

class ArtistExperienceBrowserTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.playwright = sync_playwright().start()
        cls.browser = cls.playwright.chromium.launch()

    @classmethod
    def tearDownClass(cls):
        cls.browser.close()
        cls.playwright.stop()

    def new_page(self):
        context = self.browser.new_context(viewport={"width": 1280, "height": 900}, ignore_https_errors=IGNORE_HTTPS_ERRORS)
        page = context.new_page()
        page.set_default_timeout(15000)
        page.route("**/api/v1/auth/me", lambda route: route.fulfill(
            status=200, content_type="application/json", body=json.dumps({"data": ARTIST}, ensure_ascii=False)
        ))
        page.route("**/api/v1/notifications", lambda route: route.fulfill(
            status=200, content_type="application/json",
            body='{"data":[],"current_page":1,"last_page":1,"per_page":20,"total":0,"unread_count":0}'
        ))
        page.route("**/api/v1/notifications/preferences", lambda route: route.fulfill(
            status=200, content_type="application/json",
            body='{"data":{"in_app_messages":true,"email_messages":false,"email_available":false}}'
        ))
        return context, page

    def mock_workspace(self, page, profile=PRIVATE_PROFILE, artworks=None):
        page.route("**/api/v1/artist-profile/me", lambda route: route.fulfill(
            status=200, content_type="application/json", body=json.dumps({"data": profile}, ensure_ascii=False)
        ))
        artwork_payload = {"data": artworks or [], "current_page": 1, "last_page": 1, "total": len(artworks or []), "next_page_url": None}
        page.route("**/api/v1/artist/artworks**", lambda route: route.fulfill(
            status=200, content_type="application/json", body=json.dumps(artwork_payload, ensure_ascii=False)
        ))

    def test_guided_onboarding_and_private_profile_preview(self):
        context, page = self.new_page()
        try:
            self.mock_workspace(page)
            page.route("**/api/v1/artists/private-qa?**", lambda route: route.fulfill(
                status=200, content_type="application/json",
                body=json.dumps({"data": {**PRIVATE_PROFILE, "artworks": [], "artworks_pagination": {"current_page": 1, "per_page": 12, "has_more": False, "next_page": None}}}, ensure_ascii=False)
            ))
            page.goto(BASE_URL + "/dashboard/artist", wait_until="domcontentloaded")
            page.get_by_role("heading", name="خوش آمدید، Artist QA").wait_for()
            page.get_by_text("۳ از ۵ بخش تکمیل شده").wait_for()
            page.get_by_text("ثبت اولین اثر برای بررسی").wait_for()
            page.get_by_role("link", name="پیش‌نمایش خصوصی").click()
            page.get_by_role("heading", name="هنرمند خصوصی آزمایشی").wait_for()
            self.assertIn("/artists/private-qa", page.url)
        finally:
            context.close()

    def test_artwork_feedback_is_actionable_and_oversized_dimensions_are_rejected(self):
        artwork = {
            "id": 31, "slug": "qa-work", "title": "اثر نیازمند اصلاح", "category": {"id": 1, "name": "نقاشی"},
            "status": "changes_requested", "rejection_note": "لطفاً تصویر واضح‌تری بارگذاری کنید.",
            "image_url": "/api/v1/artworks/qa-work/image",
        }
        context, page = self.new_page()
        try:
            self.mock_workspace(page, profile={**PRIVATE_PROFILE, "is_public": True}, artworks=[artwork])
            page.route("**/api/v1/categories", lambda route: route.fulfill(
                status=200, content_type="application/json", body=json.dumps({"data": [{"id": 1, "name": "نقاشی"}]}, ensure_ascii=False)
            ))
            page.goto(BASE_URL + "/dashboard/artist/artworks", wait_until="domcontentloaded")
            page.get_by_role("heading", name="مدیریت آثار").wait_for()
            page.get_by_text("مدیر برای این اثر اصلاحاتی درخواست کرده است.", exact=False).wait_for()
            page.get_by_text("لطفاً تصویر واضح‌تری بارگذاری کنید.").wait_for()
            page.locator("#artwork-image").set_input_files({
                "name": "oversized.png", "mimeType": "image/png", "buffer": png_bytes(6001, 1)
            })
            page.get_by_role("alert").filter(has_text="ابعاد تصویر نباید").wait_for()
            self.assertEqual(page.locator("#artwork-image").input_value(), "")
        finally:
            context.close()


