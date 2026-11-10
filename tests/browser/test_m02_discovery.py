import base64
import json
import os
import unittest
from urllib.parse import urlparse, parse_qs
from playwright.sync_api import sync_playwright

BASE_URL = os.environ.get("RAD_ART_BASE_URL", "http://127.0.0.1:8000")

ARTIST = {"id": 84, "name": "Artist QA", "email": "artist@example.test", "role": "artist"}
ARTWORK = {
    "id": 101, "slug": "blue-study", "title": "مطالعه آبی", "description": "شرح اثر آزمایشی",
    "medium": "آبرنگ", "dimensions": "۴۰ × ۶۰ سانتی‌متر", "year": 2025, "price": None,
    "availability": "available", "image_url": "/api/v1/artworks/blue-study/image",
    "category": {"id": 1, "name": "نقاشی", "slug": "painting"},
    "artist": {"display_name": "هنرمند آزمایشی", "slug": "qa-artist"},
}
RELATED = {
    "id": 102, "slug": "related-study", "title": "مطالعه مرتبط", "price": 0,
    "image_url": "/api/v1/artworks/related-study/image", "category": ARTWORK["category"],
    "artist": ARTWORK["artist"],
}

class DiscoveryBrowserTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.playwright = sync_playwright().start()
        cls.browser = cls.playwright.chromium.launch()

    @classmethod
    def tearDownClass(cls):
        cls.browser.close()
        cls.playwright.stop()

    def new_page(self, viewport=None, user=None):
        context = self.browser.new_context(viewport=viewport or {"width": 1280, "height": 900})
        page = context.new_page()
        page.set_default_timeout(15000)
        page.set_default_navigation_timeout(15000)
        page.route("**/api/v1/auth/me", lambda route: route.fulfill(
            status=200, content_type="application/json",
            body=json.dumps({"data": user}, ensure_ascii=False)
        ))
        return context, page

    def test_homepage_exposes_editorial_discovery_and_real_artist_spotlight(self):
        context, page = self.new_page()
        try:
            page.route("**/api/v1/artworks**", lambda route: route.fulfill(
                status=200, content_type="application/json",
                body=json.dumps({"data": [ARTWORK], "current_page": 1, "last_page": 1, "total": 1}, ensure_ascii=False)
            ))
            page.route("**/api/v1/artworks/*/image", lambda route: route.fulfill(
                status=200, content_type="image/png",
                body=base64.b64decode("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jq2kAAAAASUVORK5CYII=")
            ))
            page.route("**/api/v1/categories", lambda route: route.fulfill(
                status=200, content_type="application/json",
                body=json.dumps({"data": [{"id": 1, "name": "نقاشی", "slug": "painting"}]}, ensure_ascii=False)
            ))
            page.route("**/api/v1/artists**", lambda route: route.fulfill(
                status=200, content_type="application/json",
                body=json.dumps({"data": [{"id": 84, "slug": "qa-artist", "display_name": "هنرمند آزمایشی", "bio": "روایت هنری آزمایشی", "city": "تهران"}]}, ensure_ascii=False)
            ))
            page.goto(BASE_URL + "/")
            page.get_by_role("heading", name="هنر را کشف کنید؛ فراتر از قاب.").wait_for()
            page.get_by_role("heading", name="تازه در گالری").wait_for()
            page.locator('img[alt="مطالعه آبی"]').wait_for()
            self.assertEqual(page.locator("img").first.get_attribute("fetchpriority"), "high")
            page.get_by_role("heading", name="از کجا شروع کنیم؟").wait_for()
            page.get_by_role("heading", name="هنرمندان راد آرت").wait_for()
            page.get_by_role("link", name="ورود به پورتفولیو").wait_for()
            page.get_by_role("link", name="نقاشی").wait_for()
        finally:
            context.close()

    def test_catalogue_filters_are_shareable_and_survive_refresh(self):
        context, page = self.new_page()
        try:
            page.route("**/api/v1/categories", lambda route: route.fulfill(
                status=200, content_type="application/json",
                body=json.dumps({"data": [{"id": 1, "name": "نقاشی", "slug": "painting"}]}, ensure_ascii=False)
            ))
            page.route("**/api/v1/artwork-filters", lambda route: route.fulfill(
                status=200, content_type="application/json",
                body=json.dumps({"data": {
                    "mediums": ["آبرنگ"], "availability": [{"value": "available", "label": "قابل استعلام"}],
                    "sorts": [{"value": "newest", "label": "جدیدترین"}, {"value": "year_desc", "label": "سال خلق: جدید به قدیم"}]
                }}, ensure_ascii=False)
            ))
            def artworks(route):
                query = parse_qs(urlparse(route.request.url).query)
                payload = {"data": [ARTWORK], "current_page": 1, "last_page": 1, "per_page": 12, "total": 1}
                route.fulfill(status=200, content_type="application/json", body=json.dumps(payload, ensure_ascii=False))
            page.route("**/api/v1/artworks?**", artworks)
            page.goto(BASE_URL + "/artworks")
            page.get_by_role("heading", name="گالری آثار").wait_for()
            search = page.get_by_label("جست‌وجو در آثار و هنرمندان")
            search.fill("آبرنگ")
            page.get_by_role("button", name="جست‌وجو").click()
            page.get_by_label("فیلتر دسته‌بندی").select_option("painting")
            page.get_by_label("فیلتر تکنیک و مواد").select_option("آبرنگ")
            page.get_by_label("فیلتر وضعیت اثر").select_option("available")
            page.get_by_label("مرتب‌سازی آثار", exact=True).select_option("year_desc")
            self.assertIn("q=%D8%A2%D8%A8%D8%B1%D9%86%DA%AF", page.url)
            self.assertIn("category=painting", page.url)
            self.assertIn("medium=", page.url)
            self.assertIn("availability=available", page.url)
            self.assertIn("sort=year_desc", page.url)
            page.reload()
            page.get_by_role("heading", name="گالری آثار").wait_for()
            self.assertIn("sort=year_desc", page.url)
            page.get_by_role("link", name="مطالعه آبی").wait_for()
        finally:
            context.close()

    def test_artwork_detail_displays_context_and_related_works(self):
        context, page = self.new_page()
        try:
            payload = {**ARTWORK, "related_artworks": [RELATED]}
            page.route("**/api/v1/artworks/*/image", lambda route: route.fulfill(
                status=200, content_type="image/png",
                body=base64.b64decode("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jq2kAAAAASUVORK5CYII=")
            ))
            page.route("**/api/v1/artworks/blue-study", lambda route: route.fulfill(
                status=200, content_type="application/json",
                body=json.dumps({"data": payload}, ensure_ascii=False)
            ))
            page.goto(BASE_URL + "/artworks/blue-study")
            page.get_by_role("heading", name="مطالعه آبی").wait_for()
            page.locator('img[alt="مطالعه آبی"]').wait_for()
            self.assertEqual(page.locator("img").first.get_attribute("fetchpriority"), "high")
            page.get_by_text("قیمت اعلام نشده").wait_for()
            page.get_by_text("قابل استعلام از هنرمند").wait_for()
            page.get_by_role("heading", name="آثار مرتبط").wait_for()
            page.get_by_role("link", name="مطالعه مرتبط").wait_for()
            page.get_by_role("link", name="هنرمند آزمایشی", exact=True).wait_for()
        finally:
            context.close()

    def test_artist_portfolio_can_filter_by_category_and_load_more(self):
        context, page = self.new_page()
        try:
            first_page = {
                "data": {
                    "id": 84, "slug": "qa-artist", "display_name": "هنرمند آزمایشی",
                    "bio": "روایت هنری", "city": "تهران", "website_url": None, "instagram_handle": None,
                    "artworks": [
                        {**ARTWORK, "id": 201, "slug": "portfolio-painting", "title": "اثر نقاشی"},
                        {**ARTWORK, "id": 202, "slug": "portfolio-sculpture", "title": "اثر مجسمه", "category": {"id": 2, "name": "مجسمه", "slug": "sculpture"}},
                    ],
                    "artworks_pagination": {"current_page": 1, "per_page": 12, "has_more": True, "next_page": 2}
                }
            }
            second_page = {"data": {
                **first_page["data"],
                "artworks": [{**ARTWORK, "id": 203, "slug": "portfolio-more", "title": "اثر بیشتر"}],
                "artworks_pagination": {"current_page": 2, "per_page": 12, "has_more": False, "next_page": None}
            }}
            page.route("**/api/v1/artists/qa-artist**", lambda route: route.fulfill(
                status=200, content_type="application/json",
                body=json.dumps(second_page if "artworks_page=2" in route.request.url else first_page, ensure_ascii=False)
            ))
            page.goto(BASE_URL + "/artists/qa-artist")
            page.get_by_role("heading", name="هنرمند آزمایشی").wait_for()
            page.get_by_role("button", name="نقاشی").click()
            page.get_by_role("link", name="اثر نقاشی").wait_for()
            self.assertNotIn("اثر مجسمه", page.locator("body").inner_text())
            page.get_by_role("button", name="همه دسته‌ها").click()
            page.get_by_role("button", name="نمایش آثار بیشتر").click()
            page.get_by_role("link", name="اثر بیشتر").wait_for()
        finally:
            context.close()


    def test_discovery_to_artwork_to_artist_to_inquiry_journey(self):
        buyer = {"id": 42, "name": "Buyer QA", "email": "buyer@example.test", "role": "buyer"}
        context, page = self.new_page(user=buyer)
        submissions = []
        try:
            page.route("**/api/v1/artworks**", lambda route: route.fulfill(
                status=200, content_type="application/json",
                body=json.dumps({"data": [ARTWORK], "current_page": 1, "last_page": 1, "total": 1}, ensure_ascii=False)
            ))
            page.route("**/api/v1/categories", lambda route: route.fulfill(
                status=200, content_type="application/json",
                body=json.dumps({"data": [{"id": 1, "name": "نقاشی", "slug": "painting"}]}, ensure_ascii=False)
            ))
            page.route("**/api/v1/artists**", lambda route: route.fulfill(
                status=200, content_type="application/json",
                body=json.dumps({"data": [{"id": 84, "slug": "qa-artist", "display_name": "هنرمند آزمایشی", "bio": "روایت هنری", "city": "تهران"}]}, ensure_ascii=False)
            ))
            page.route("**/api/v1/artworks/blue-study", lambda route: route.fulfill(
                status=200, content_type="application/json",
                body=json.dumps({"data": {**ARTWORK, "related_artworks": []}}, ensure_ascii=False)
            ))
            profile = {"data": {
                "id": 84, "slug": "qa-artist", "display_name": "هنرمند آزمایشی",
                "bio": "روایت هنری", "city": "تهران", "website_url": None, "instagram_handle": None,
                "artworks": [], "artworks_pagination": {"current_page": 1, "per_page": 12, "has_more": False, "next_page": None}
            }}
            page.route("**/api/v1/artists/qa-artist**", lambda route: route.fulfill(
                status=200, content_type="application/json",
                body=json.dumps(profile, ensure_ascii=False)
            ))
            def submit_inquiry(route):
                submissions.append(route.request.post_data_json)
                route.fulfill(status=201, content_type="application/json", body=json.dumps({"message": "درخواست شما ثبت شد."}, ensure_ascii=False))
            page.route("**/api/v1/artists/qa-artist/inquiries", submit_inquiry)

            page.goto(BASE_URL + "/")
            page.get_by_role("heading", name="هنر را کشف کنید؛ فراتر از قاب.").wait_for()
            page.evaluate("document.documentElement.style.minHeight = '2000px'")
            page.evaluate("window.scrollTo(0, 900)")
            page.wait_for_function("window.scrollY > 0")
            self.assertGreater(page.evaluate("window.scrollY"), 0)
            page.get_by_role("link", name="مطالعه آبی").first.click()
            page.get_by_role("heading", name="مطالعه آبی").wait_for()
            self.assertEqual(page.evaluate("window.scrollY"), 0)
            page.evaluate("window.scrollTo(0, 700)")
            page.wait_for_function("window.scrollY > 0")
            self.assertGreater(page.evaluate("window.scrollY"), 0)
            page.get_by_role("link", name="هنرمند آزمایشی", exact=True).click()
            page.get_by_role("heading", name="هنرمند آزمایشی").wait_for()
            self.assertEqual(page.evaluate("window.scrollY"), 0)
            page.get_by_label("موضوع").fill("پرسش درباره آثار")
            page.get_by_label("متن پیام").fill("سلام، مایلم درباره مسیر هنری و آثار شما بیشتر بدانم.")
            page.get_by_role("button", name="ارسال پیام").click()
            page.get_by_text("درخواست شما ثبت شد.").wait_for()
            self.assertEqual(len(submissions), 1)
            self.assertEqual(submissions[0]["subject"], "پرسش درباره آثار")
            self.assertEqual(submissions[0]["artwork_id"], None)
        finally:
            context.close()

    def test_artwork_detail_inquiry_preserves_artwork_context(self):
        buyer = {"id": 42, "name": "Buyer QA", "email": "buyer@example.test", "role": "buyer"}
        context, page = self.new_page(user=buyer)
        submissions = []
        try:
            page.route("**/api/v1/artworks/blue-study", lambda route: route.fulfill(
                status=200, content_type="application/json",
                body=json.dumps({"data": {**ARTWORK, "related_artworks": []}}, ensure_ascii=False)
            ))
            def submit_inquiry(route):
                submissions.append(route.request.post_data_json)
                route.fulfill(status=201, content_type="application/json", body=json.dumps({"message": "درخواست شما ثبت شد."}, ensure_ascii=False))
            page.route("**/api/v1/artists/qa-artist/inquiries", submit_inquiry)
            page.goto(BASE_URL + "/artworks/blue-study")
            page.get_by_role("heading", name="مطالعه آبی").wait_for()
            page.get_by_label("موضوع").fill("پرسش درباره این اثر")
            page.get_by_label("متن پیام").fill("سلام، لطفاً اطلاعات بیشتری درباره این اثر ارائه کنید.")
            page.get_by_role("button", name="ارسال پیام").click()
            page.get_by_text("درخواست شما ثبت شد.").wait_for()
            self.assertEqual(submissions[0]["artwork_id"], ARTWORK["id"])
        finally:
            context.close()

    def test_catalogue_has_no_horizontal_overflow_across_viewport_matrix(self):
        for width in [320, 375, 768, 1024, 1440]:
            with self.subTest(width=width):
                context, page = self.new_page(viewport={"width": width, "height": 900})
                try:
                    page.route("**/api/v1/categories", lambda route: route.fulfill(status=200, content_type="application/json", body='{"data":[]}'))
                    page.route("**/api/v1/artwork-filters", lambda route: route.fulfill(status=200, content_type="application/json", body='{"data":{"mediums":[],"availability":[],"sorts":[]}}'))
                    page.route("**/api/v1/artworks**", lambda route: route.fulfill(status=200, content_type="application/json", body='{"data":[],"current_page":1,"last_page":1,"total":0}'))
                    page.goto(BASE_URL + "/artworks")
                    page.get_by_role("heading", name="گالری آثار").wait_for()
                    dimensions = page.evaluate("({width: document.documentElement.clientWidth, scrollWidth: document.documentElement.scrollWidth})")
                    self.assertLessEqual(dimensions["scrollWidth"], dimensions["width"])
                finally:
                    context.close()

if __name__ == "__main__":
    unittest.main(verbosity=2)
