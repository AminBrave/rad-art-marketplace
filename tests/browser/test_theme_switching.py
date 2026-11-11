"""Application-wide theme switching and preference persistence."""

import unittest
from playwright.sync_api import sync_playwright

from config import BASE_URL, IGNORE_HTTPS_ERRORS


class ThemeSwitchingBrowserTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.playwright = sync_playwright().start()
        cls.browser = cls.playwright.chromium.launch()

    @classmethod
    def tearDownClass(cls):
        cls.browser.close()
        cls.playwright.stop()

    def test_theme_switch_persists_across_public_routes(self):
        context = self.browser.new_context(
            viewport={"width": 1280, "height": 900},
            ignore_https_errors=IGNORE_HTTPS_ERRORS,
        )
        page = context.new_page()
        page.set_default_timeout(15000)
        try:
            page.add_init_script("localStorage.setItem('rad-art-theme', 'new-york')")
            page.goto(BASE_URL + "/")
            selector = page.get_by_label("انتخاب پوسته")
            selector.wait_for()
            self.assertEqual(selector.input_value(), "new-york")
            self.assertEqual(page.locator("html").get_attribute("data-theme"), "new-york")

            selector.select_option("editorial")
            self.assertEqual(page.locator("html").get_attribute("data-theme"), "editorial")
            self.assertEqual(page.evaluate("localStorage.getItem('rad-art-theme')"), "editorial")

            selector.select_option("new-york")
            page.goto(BASE_URL + "/artworks")
            page.get_by_label("انتخاب پوسته").wait_for()
            self.assertEqual(page.locator("html").get_attribute("data-theme"), "new-york")
            self.assertEqual(page.evaluate("localStorage.getItem('rad-art-theme')"), "new-york")
        finally:
            context.close()


if __name__ == "__main__":
    unittest.main(verbosity=2)
