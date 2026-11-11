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

    def test_new_york_respects_saved_light_and_dark_color_scheme(self):
        context = self.browser.new_context(
            viewport={"width": 1280, "height": 900},
            ignore_https_errors=IGNORE_HTTPS_ERRORS,
        )
        page = context.new_page()
        try:
            page.add_init_script("localStorage.setItem('rad-art-theme', 'new-york'); localStorage.setItem('rad-art-color-scheme', 'dark')")
            page.goto(BASE_URL + "/")
            self.assertEqual(page.locator("html").get_attribute("data-theme"), "new-york")
            self.assertTrue(page.locator("html").evaluate("(element) => element.classList.contains('dark')"))

            page.evaluate("localStorage.setItem('rad-art-color-scheme', 'light')")
            page.reload()
            self.assertFalse(page.locator("html").evaluate("(element) => element.classList.contains('dark')"))
        finally:
            context.close()

    def test_new_york_controls_toggle_color_scheme_and_expose_semantic_tokens(self):
        context = self.browser.new_context(
            viewport={"width": 1280, "height": 900},
            ignore_https_errors=IGNORE_HTTPS_ERRORS,
        )
        page = context.new_page()
        try:
            page.add_init_script("localStorage.setItem('rad-art-theme', 'new-york'); localStorage.setItem('rad-art-color-scheme', 'light')")
            page.goto(BASE_URL + "/login")
            self.assertEqual(page.locator("html").get_attribute("data-theme"), "new-york")
            self.assertTrue(page.locator("html").evaluate("(element) => getComputedStyle(element).getPropertyValue('--primary').trim().length > 0"))
            self.assertTrue(page.locator("html").evaluate("(element) => getComputedStyle(element).getPropertyValue('--sidebar').trim().length > 0"))
            self.assertTrue(page.locator("html").evaluate("(element) => getComputedStyle(element).getPropertyValue('--popover').trim().length > 0"))

            email = page.get_by_label("ایمیل")
            self.assertTrue(email.is_visible())
            self.assertGreater(float(email.evaluate("(element) => parseFloat(getComputedStyle(element).borderRadius)")), 0)

            page.get_by_role("button", name="تغییر به حالت تیره").click()
            page.wait_for_function("document.documentElement.classList.contains('dark') && localStorage.getItem('rad-art-color-scheme') === 'dark'")
            self.assertTrue(page.locator("html").evaluate("(element) => element.classList.contains('dark')"))

            page.get_by_role("button", name="تغییر به حالت روشن").click()
            page.wait_for_function("!document.documentElement.classList.contains('dark') && localStorage.getItem('rad-art-color-scheme') === 'light'")
            self.assertFalse(page.locator("html").evaluate("(element) => element.classList.contains('dark')"))
        finally:
            context.close()

    def test_new_york_public_routes_do_not_overflow_at_mobile_width(self):
        context = self.browser.new_context(
            viewport={"width": 320, "height": 800},
            ignore_https_errors=IGNORE_HTTPS_ERRORS,
        )
        page = context.new_page()
        try:
            page.add_init_script("localStorage.setItem('rad-art-theme', 'new-york'); localStorage.setItem('rad-art-color-scheme', 'light')")
            for route in ["/", "/artworks", "/artists", "/login", "/register"]:
                page.goto(BASE_URL + route)
                page.wait_for_load_state("domcontentloaded")
                overflow = page.evaluate("document.documentElement.scrollWidth > document.documentElement.clientWidth")
                self.assertFalse(overflow, f"Horizontal overflow at 320px on {route}")
        finally:
            context.close()

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
