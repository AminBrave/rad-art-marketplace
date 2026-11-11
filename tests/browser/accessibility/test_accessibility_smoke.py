"""Accessibility smoke checks for essential public/authentication screens.

These checks catch missing document direction, landmarks and accessible names.
They complement—not replace—a full axe-core audit and manual keyboard testing.
"""

import unittest

from playwright.sync_api import sync_playwright

from config import BASE_URL, IGNORE_HTTPS_ERRORS


class AccessibilitySmokeTests(unittest.TestCase):
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
        )
        page = context.new_page()
        page.set_default_timeout(15000)
        return context, page

    def assert_document_accessible_basics(self, page):
        self.assertEqual(page.locator("html").get_attribute("lang"), "fa")
        self.assertEqual(page.locator("html").get_attribute("dir"), "rtl")
        self.assertGreaterEqual(page.locator("main").count(), 1)

        unnamed = page.evaluate("""() => {
            const visible = (element) => {
                const style = getComputedStyle(element);
                const rect = element.getBoundingClientRect();
                return style.visibility !== 'hidden' && style.display !== 'none'
                    && rect.width > 0 && rect.height > 0;
            };
            const nameOf = (element) => {
                const labelledBy = element.getAttribute('aria-labelledby');
                const labelledText = labelledBy
                    ? labelledBy.split(/\\s+/).map(id => document.getElementById(id)?.innerText || '').join(' ')
                    : '';
                const associatedLabels = element.labels
                    ? [...element.labels].map(label => label.innerText).join(' ')
                    : '';
                return [
                    element.getAttribute('aria-label'),
                    labelledText,
                    associatedLabels,
                    element.getAttribute('title'),
                    element.innerText,
                    element.getAttribute('alt'),
                    element.value,
                ].filter(Boolean).join(' ').trim();
            };
            return [...document.querySelectorAll('a, button, input, select, textarea')]
                .filter(element => visible(element)
                    && element.getAttribute('type') !== 'hidden'
                    && !element.disabled
                    && !element.closest('[aria-hidden="true"]'))
                .filter(element => !nameOf(element))
                .map(element => ({
                    tag: element.tagName.toLowerCase(),
                    type: element.getAttribute('type'),
                    html: element.outerHTML.slice(0, 180),
                }));
        }""")
        self.assertEqual(unnamed, [], f"Visible interactive controls without accessible names: {unnamed}")

        images_without_alt = page.locator("img:not([alt])").count()
        self.assertEqual(images_without_alt, 0, "Every image must declare alt text (empty is valid for decorative images).")

    def test_login_and_registration_forms_have_accessible_labels_and_landmarks(self):
        context, page = self.new_page()
        try:
            for route in ("/login", "/register"):
                response = page.goto(BASE_URL + route)
                self.assertIsNotNone(response)
                self.assertLess(response.status, 400)
                page.get_by_role("main").wait_for()
                self.assert_document_accessible_basics(page)
                page.get_by_label("ایمیل").wait_for()
                page.get_by_label("گذرواژه", exact=True).wait_for()
                page.get_by_role("button", name="ایجاد حساب" if route == "/register" else "ورود به حساب").wait_for()
        finally:
            context.close()

    def test_artwork_catalogue_has_accessible_search_and_filter_controls(self):
        context, page = self.new_page()
        try:
            response = page.goto(BASE_URL + "/artworks")
            self.assertIsNotNone(response)
            self.assertLess(response.status, 400)
            page.get_by_role("heading", name="گالری آثار").wait_for()
            self.assert_document_accessible_basics(page)
            page.get_by_label("جست‌وجو در آثار و هنرمندان").wait_for()
            page.get_by_label("فیلتر دسته‌بندی").wait_for()
            page.get_by_label("فیلتر تکنیک و مواد").wait_for()
            page.get_by_label("فیلتر وضعیت اثر").wait_for()
            page.get_by_label("مرتب‌سازی آثار", exact=True).wait_for()
        finally:
            context.close()


if __name__ == "__main__":
    unittest.main(verbosity=2)
