import binascii
import json
import os
import struct
import unittest
import zlib
from playwright.sync_api import sync_playwright

BASE_URL = os.environ.get("RAD_ART_BASE_URL", "http://127.0.0.1:8000")
ARTIST = {"id": 84, "name": "Artist QA", "email": "artist@example.test", "role": "artist"}
PRIVATE_PROFILE = {
    "id": 84, "slug": "private-qa", "display_name": "هنرمند خصوصی آزمایشی",
    "bio": "معرفی هنری برای آزمون پیش‌نمایش خصوصی.", "city": "",
    "website_url": None, "instagram_handle": "qa.artist", "is_public": False,
}
INQUIRY = {
    "id": 51, "subject": "پرسش درباره اثر", "message": "مایلم درباره جزئیات این اثر بیشتر بدانم.",
    "status": "new", "read_at": None, "created_at": "2026-11-10T10:00:00Z",
    "artist": {"display_name": "هنرمند آزمایشی", "slug": "qa-artist"},
    "buyer": {"name": "خریدار آزمایشی"}, "artwork": None,
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
        context = self.browser.new_context(viewport={"width": 1280, "height": 900})
        page = context.new_page()
        page.set_default_timeout(15000)
        page.route("**/api/v1/auth/me", lambda route: route.fulfill(
            status=200, content_type="application/json", body=json.dumps({"data": ARTIST}, ensure_ascii=False)
        ))
        return context, page

    def mock_workspace(self, page, profile=PRIVATE_PROFILE, artworks=None, inquiries=None):
        page.route("**/api/v1/artist-profile/me", lambda route: route.fulfill(
            status=200, content_type="application/json", body=json.dumps({"data": profile}, ensure_ascii=False)
        ))
        artwork_payload = {"data": artworks or [], "current_page": 1, "last_page": 1, "total": len(artworks or []), "next_page_url": None}
        page.route("**/api/v1/artist/artworks**", lambda route: route.fulfill(
            status=200, content_type="application/json", body=json.dumps(artwork_payload, ensure_ascii=False)
        ))
        inquiry_payload = {"data": inquiries or [], "current_page": 1, "last_page": 1, "total": len(inquiries or []), "next_page_url": None, "prev_page_url": None}
        page.route("**/api/v1/artist/inquiries**", lambda route: route.fulfill(
            status=200, content_type="application/json", body=json.dumps(inquiry_payload, ensure_ascii=False)
        ))

    def test_guided_onboarding_and_private_profile_preview(self):
        context, page = self.new_page()
        try:
            self.mock_workspace(page)
            page.route("**/api/v1/artists/private-qa?**", lambda route: route.fulfill(
                status=200, content_type="application/json",
                body=json.dumps({"data": {**PRIVATE_PROFILE, "artworks": [], "artworks_pagination": {"current_page": 1, "per_page": 12, "has_more": False, "next_page": None}}}, ensure_ascii=False)
            ))
            page.goto(BASE_URL + "/dashboard/artist")
            page.get_by_role("heading", name="پروفایل و اولین اثر خود را آماده کنید").wait_for()
            page.get_by_text("۳ از ۵ مورد پروفایل").wait_for()
            page.get_by_text("ثبت اولین اثر برای بررسی").wait_for()
            page.get_by_role("link", name="پیش‌نمایش پروفایل").click()
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
            page.goto(BASE_URL + "/dashboard/artist/artworks")
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

    def test_empty_artist_inbox_has_a_relevant_next_step(self):
        context, page = self.new_page()
        try:
            self.mock_workspace(page, inquiries=[])
            page.goto(BASE_URL + "/dashboard/artist/inquiries")
            page.get_by_role("heading", name="صندوق درخواست‌ها").wait_for()
            page.get_by_role("link", name="بررسی و به‌روزرسانی پروفایل هنری").click()
            page.get_by_role("heading", name="پروفایل هنرمند").wait_for()
            self.assertTrue(page.url.endswith("/dashboard/artist/profile"))
        finally:
            context.close()

    def test_inquiry_status_lifecycle_is_explained_and_updates_from_server(self):
        context, page = self.new_page()
        try:
            self.mock_workspace(page, inquiries=[INQUIRY])
            def update(route):
                self.assertEqual(route.request.post_data_json["status"], "read")
                route.fulfill(status=200, content_type="application/json", body=json.dumps({
                    "message": "وضعیت پیام به‌روزرسانی شد.", "data": {**INQUIRY, "status": "read", "read_at": "2026-11-10T11:00:00Z"}
                }, ensure_ascii=False))
            page.route("**/api/v1/artist/inquiries/51", lambda route: update(route) if route.request.method == "PATCH" else route.fulfill(
                status=200, content_type="application/json", body=json.dumps({"data": INQUIRY}, ensure_ascii=False)
            ))
            page.goto(BASE_URL + "/dashboard/artist/inquiries")
            page.get_by_role("button", name="پرسش درباره اثر").click()
            page.get_by_text("هنوز رسیدگی به این درخواست را ثبت نکرده‌اید.").wait_for()
            page.get_by_role("button", name="علامت‌گذاری به‌عنوان خوانده‌شده").click()
            page.get_by_text("این درخواست به‌عنوان خوانده‌شده ثبت شده است").wait_for()
        finally:
            context.close()
