import json
import unittest
from playwright.sync_api import sync_playwright

from config import BASE_URL, IGNORE_HTTPS_ERRORS

ADMIN = {"id": 1, "name": "Admin QA", "email": "admin@example.test", "role": "admin"}

class EditorialBrowserTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.playwright = sync_playwright().start()
        cls.browser = cls.playwright.chromium.launch()

    @classmethod
    def tearDownClass(cls):
        cls.browser.close()
        cls.playwright.stop()

    def new_page(self, user=None):
        context = self.browser.new_context(viewport={"width": 1280, "height": 900}, ignore_https_errors=IGNORE_HTTPS_ERRORS)
        page = context.new_page()
        page.set_default_timeout(15000)
        page.route("**/api/v1/auth/me", lambda route: route.fulfill(
            status=200, content_type="application/json",
            body=json.dumps({"data": user}, ensure_ascii=False)
        ))
        return context, page

    def test_public_collection_list_and_detail_are_navigable(self):
        context, page = self.new_page()
        try:
            page.route("**/api/v1/collections", lambda route: route.fulfill(
                status=200, content_type="application/json",
                body=json.dumps({"data": [{
                    "id": 3, "slug": "quiet-forms", "title": "فرم‌های آرام",
                    "intro": "روایتی از سکوت و فرم", "artwork_count": 2
                }], "current_page": 1, "last_page": 1, "total": 1}, ensure_ascii=False)
            ))
            page.route("**/api/v1/collections/quiet-forms", lambda route: route.fulfill(
                status=200, content_type="application/json",
                body=json.dumps({"data": {
                    "id": 3, "slug": "quiet-forms", "title": "فرم‌های آرام",
                    "intro": "روایتی از سکوت و فرم", "artwork_count": 0, "artworks": []
                }}, ensure_ascii=False)
            ))
            page.goto(BASE_URL + "/collections")
            page.get_by_role("heading", name="مجموعه‌های منتخب").wait_for()
            page.get_by_role("heading", name="فرم‌های آرام").wait_for()
            page.get_by_role("link", name="مشاهده مجموعه").click()
            page.get_by_role("heading", name="فرم‌های آرام").wait_for()
            page.get_by_text("روایتی از سکوت و فرم").wait_for()
        finally:
            context.close()

    def test_admin_can_create_a_collection_draft(self):
        context, page = self.new_page(ADMIN)
        try:
            page.route("**/api/v1/admin/editorial/options", lambda route: route.fulfill(
                status=200, content_type="application/json",
                body=json.dumps({"data": {
                    "artworks": [{"id": 10, "title": "مطالعه آبی", "artist": "هنرمند آزمایشی"}],
                    "artists": [{"id": 8, "display_name": "هنرمند آزمایشی", "slug": "qa-artist"}]
                }}, ensure_ascii=False)
            ))
            page.route("**/api/v1/admin/editorial/collections", lambda route: route.fulfill(
                status=200, content_type="application/json",
                body=json.dumps({"data": [], "current_page": 1, "last_page": 1, "total": 0})
            ))
            page.route("**/api/v1/admin/editorial/featured-artists", lambda route: route.fulfill(
                status=200, content_type="application/json", body=json.dumps({"data": []})
            ))
            def create(route):
                payload = route.request.post_data_json
                self.assertEqual(payload["title"], "فرم‌های آرام")
                self.assertEqual(payload["artwork_ids"], [10])
                route.fulfill(status=201, content_type="application/json", body=json.dumps({
                    "message": "مجموعه ایجاد شد.", "data": {
                        "id": 4, "slug": "quiet-forms", "title": "فرم‌های آرام",
                        "intro": "روایت سردبیر", "status": "draft", "artwork_ids": [10], "artwork_count": 1
                    }
                }, ensure_ascii=False))
            page.route("**/api/v1/admin/editorial/collections", lambda route: create(route) if route.request.method == "POST" else route.fulfill(
                status=200, content_type="application/json",
                body=json.dumps({"data": [], "current_page": 1, "last_page": 1, "total": 0})
            ))
            page.goto(BASE_URL + "/admin/editorial")
            page.get_by_role("heading", name="مجموعه‌ها و هنرمندان منتخب").wait_for()
            page.get_by_label("عنوان مجموعه").fill("فرم‌های آرام")
            page.get_by_label("مقدمه سردبیر").fill("روایت سردبیر")
            page.get_by_label("مطالعه آبی").check()
            page.get_by_role("button", name="ذخیره پیش‌نویس").click()
            page.get_by_text("مجموعه ایجاد شد.").wait_for()
        finally:
            context.close()
