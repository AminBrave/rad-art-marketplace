"""Unmocked artist artwork submission and publication-boundary journey."""

import base64
import unittest
import uuid

from playwright.sync_api import sync_playwright

from config import BASE_URL, IGNORE_HTTPS_ERRORS


class FullStackArtistArtworkTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.playwright = sync_playwright().start()
        cls.browser = cls.playwright.chromium.launch()

    @classmethod
    def tearDownClass(cls):
        cls.browser.close()
        cls.playwright.stop()

    def test_artist_submits_artwork_and_pending_work_stays_out_of_public_search(self):
        context = self.browser.new_context(
            viewport={"width": 1280, "height": 1000},
            ignore_https_errors=IGNORE_HTTPS_ERRORS,
        )
        page = context.new_page()
        page.set_default_timeout(20000)
        page.set_default_navigation_timeout(20000)

        title = f"آزمون ثبت اثر {uuid.uuid4().hex[:8]}"

        try:
            page.goto(BASE_URL + "/login", wait_until="domcontentloaded")
            page.locator('input[name="email"]').fill("artist@rademan.test")
            page.locator('input[name="password"]').fill("Demo@12345")
            with page.expect_response(lambda response: response.url.endswith("/api/v1/auth/login") and response.request.method == "POST") as login_response:
                page.get_by_role("button", name="ورود به حساب").click()
            self.assertEqual(200, login_response.value.status, f"Artist login failed with HTTP {login_response.value.status}.")
            page.wait_for_url("**/dashboard/artist")

            page.goto(BASE_URL + "/dashboard/artist/artworks")
            page.get_by_role("heading", name="مدیریت آثار").wait_for()
            page.get_by_label("عنوان اثر").fill(title)
            page.get_by_label("دسته‌بندی").select_option(label="نقاشی")
            page.get_by_label("تکنیک / متریال").fill("آبرنگ")
            page.get_by_label("توضیحات اثر").fill("این اثر برای آزمون کامل ثبت و بررسی هنری ایجاد شده است.")
            page.locator("#artwork-image").set_input_files({
                "name": "artist-e2e.png",
                "mimeType": "image/png",
                "buffer": base64.b64decode(
                    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jq2kAAAAASUVORK5CYII="
                ),
            })
            page.get_by_alt_text("پیش‌نمایش تصویر انتخاب‌شده").wait_for()

            with page.expect_response(
                lambda response: response.url.endswith("/api/v1/artist/artworks")
                and response.request.method == "POST"
            ) as submission:
                page.get_by_role("button", name="ثبت اثر برای بررسی").click()

            self.assertEqual(submission.value.status, 201)
            artwork = submission.value.json()["data"]
            self.assertEqual(artwork["title"], title)
            self.assertEqual(artwork["status"], "pending_review")

            page.get_by_role("heading", name=title).wait_for()
            artwork_card = page.locator("article").filter(has=page.get_by_role("heading", name=title))
            artwork_card.get_by_text("در انتظار بررسی", exact=True).wait_for()

            is_public = page.evaluate("""async (title) => {
                const response = await fetch('/api/v1/artworks?q=' + encodeURIComponent(title), {
                    headers: { Accept: 'application/json' }, credentials: 'same-origin'
                });
                const result = await response.json();
                return (result.data ?? []).some((item) => item.title === title);
            }""", title)
            self.assertFalse(is_public, "Pending artwork must not appear in the public catalogue.")
        finally:
            context.close()


if __name__ == "__main__":
    unittest.main(verbosity=2)
