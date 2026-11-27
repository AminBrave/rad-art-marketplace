"""Public artwork catalogue loading, retry and filter-degradation journeys."""

import json
import unittest
from urllib.parse import parse_qs, urlparse

from playwright.sync_api import sync_playwright

from config import BASE_URL, IGNORE_HTTPS_ERRORS


def artwork_payload(title="اثر آزمایشی کاتالوگ"):
    return {
        "data": [{
            "id": 901,
            "slug": "catalogue-resilience-artwork",
            "title": title,
            "price": None,
            "image_url": None,
            "artist": {"display_name": "هنرمند آزمایشی"},
            "category": {"name": "نقاشی"},
        }],
        "current_page": 1,
        "last_page": 1,
        "per_page": 12,
        "total": 1,
    }


def manual_dev_safe(test_method):
    test_method.manual_dev_safe = True
    return test_method


class ArtworkCatalogueResilienceTests(unittest.TestCase):
    # All API responses and media used by this class are intercepted in-page;
    # these journeys do not read or write application database records.
    manual_dev_safe = True
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
        page.route(
            "**/api/v1/auth/me",
            lambda route: route.fulfill(
                status=200,
                content_type="application/json",
                body='{"data":null}',
            ),
        )
        return context, page

    def test_artwork_catalogue_error_can_be_retried_into_results(self):
        context, page = self.new_page()
        attempts = {"count": 0}

        def artworks(route):
            attempts["count"] += 1
            if attempts["count"] <= 2:
                route.fulfill(
                    status=503,
                    content_type="application/json",
                    body=json.dumps({"message": "Catalogue temporarily unavailable"}),
                )
                return

            route.fulfill(
                status=200,
                content_type="application/json",
                body=json.dumps(artwork_payload()),
            )

        page.route("**/api/v1/artworks**", artworks)
        try:
            page.goto(BASE_URL + "/artworks", wait_until="domcontentloaded")
            page.get_by_role("heading", name="گالری آثار").wait_for()
            page.get_by_role("alert").get_by_role(
                "button", name="تلاش دوباره"
            ).wait_for()

            with page.expect_response(
                lambda response: "/api/v1/artworks" in response.url
                and response.request.method == "GET"
                and response.status == 200
            ):
                page.get_by_role("button", name="تلاش دوباره").click()

            page.get_by_role("heading", name="اثر آزمایشی کاتالوگ").wait_for()
            self.assertEqual(attempts["count"], 3)
            self.assertIn("هنرمند آزمایشی", page.locator("main").inner_text())
        finally:
            context.close()

    def test_filter_metadata_failure_does_not_block_artwork_discovery(self):
        context, page = self.new_page()
        page.route(
            "**/api/v1/categories",
            lambda route: route.fulfill(
                status=200,
                content_type="application/json",
                body=json.dumps({"data": [{"id": 1, "slug": "painting", "name": "نقاشی"}]}),
            ),
        )
        page.route(
            "**/api/v1/artwork-filters",
            lambda route: route.fulfill(
                status=503,
                content_type="application/json",
                body=json.dumps({"message": "Filter metadata unavailable"}),
            ),
        )
        page.route(
            "**/api/v1/artworks**",
            lambda route: route.fulfill(
                status=200,
                content_type="application/json",
                body=json.dumps(artwork_payload("اثر با فیلترهای ناقص")),
            ),
        )
        try:
            page.goto(BASE_URL + "/artworks", wait_until="domcontentloaded")
            page.get_by_role("heading", name="گالری آثار").wait_for()
            page.get_by_text("برخی گزینه‌های فیلتر بارگذاری نشدند", exact=False).wait_for()
            page.get_by_role("heading", name="اثر با فیلترهای ناقص").wait_for()

            self.assertTrue(page.get_by_role("combobox", name="فیلتر دسته‌بندی").is_visible())
            self.assertTrue(page.get_by_role("combobox", name="فیلتر تکنیک و مواد").is_visible())
            self.assertTrue(page.get_by_role("combobox", name="فیلتر وضعیت اثر").is_visible())
        finally:
            context.close()


    def test_artwork_cards_recover_from_image_load_failure_and_keep_alt_text(self):
        context, page = self.new_page()
        artworks = [
            {
                "id": 910,
                "slug": "image-loaded",
                "title": "اثر با تصویر",
                "price": None,
                "image_url": "/media/loaded.svg",
                "artist": {"display_name": "هنرمند تصویر"},
                "category": {"name": "نقاشی"},
            },
            {
                "id": 911,
                "slug": "image-failed",
                "title": "اثر خراب",
                "price": None,
                "image_url": "/media/failed.svg",
                "artist": {"display_name": "هنرمند تصویر"},
                "category": {"name": "نقاشی"},
            },
            {
                "id": 912,
                "slug": "image-missing",
                "title": "اثر بدون تصویر",
                "price": None,
                "image_url": None,
                "artist": {"display_name": "هنرمند تصویر"},
                "category": {"name": "نقاشی"},
            },
            {
                "id": 913,
                "slug": "mixed-direction-title",
                "title": "تابلو Mona Lisa 2026",
                "price": None,
                "image_url": None,
                "artist": {"display_name": "Amin Studio"},
                "category": {"name": "نقاشی / Oil painting"},
            },
        ]
        page.route(
            "**/api/v1/artworks**",
            lambda route: route.fulfill(
                status=200,
                content_type="application/json",
                body=json.dumps({
                    "data": artworks,
                    "current_page": 1,
                    "last_page": 1,
                    "per_page": 12,
                    "total": len(artworks),
                }),
            ),
        )
        page.route(
            "**/media/loaded.svg",
            lambda route: route.fulfill(
                status=200,
                content_type="image/svg+xml",
                body='<svg xmlns="http://www.w3.org/2000/svg" width="8" height="10" viewBox="0 0 8 10"><rect width="8" height="10" fill="#777777"/></svg>',
            ),
        )
        page.route("**/media/failed.svg", lambda route: route.abort())

        try:
            page.goto(BASE_URL + "/artworks", wait_until="domcontentloaded")
            page.get_by_role("heading", name="گالری آثار").wait_for()

            loaded = page.locator('img[alt="اثر با تصویر"]')
            loaded.wait_for(state="visible")
            page.wait_for_function("""() => {
                const image = document.querySelector('img[alt="اثر با تصویر"]');
                return image?.complete && image.naturalWidth > 0
                    && image.parentElement?.getAttribute('aria-busy') === 'false';
            }""")
            self.assertEqual(loaded.locator("xpath=..").get_attribute("aria-busy"), "false")

            page.get_by_role("img", name="اثر خراب").wait_for()
            page.get_by_role("img", name="اثر بدون تصویر").wait_for()
            self.assertEqual(page.locator('img[alt="اثر خراب"]').count(), 0)
            self.assertEqual(page.locator('img[alt="اثر بدون تصویر"]').count(), 0)
            page.get_by_role("heading", name="تابلو Mona Lisa 2026").wait_for()
            self.assertIn("Amin Studio", page.locator("main").inner_text())
            self.assertEqual(page.locator("html").get_attribute("dir"), "rtl")
            page.set_viewport_size({"width": 320, "height": 812})
            dimensions = page.evaluate(
                "() => ({ viewport: document.documentElement.clientWidth, "
                "document: document.documentElement.scrollWidth })"
            )
            self.assertLessEqual(
                dimensions["document"],
                dimensions["viewport"] + 1,
                f"Mixed Persian/Latin catalogue content overflows at 320px: {dimensions}",
            )
        finally:
            context.close()


    def test_artwork_image_source_change_shows_new_media_instead_of_stale_loaded_state(self):
        context, page = self.new_page()
        requests = []

        def artworks(route):
            query = parse_qs(urlparse(route.request.url).query)
            changed = query.get("q") == ["تغییر"]
            requests.append("changed" if changed else "initial")
            payload = artwork_payload("اثر با تصویر متغیر")
            payload["data"][0]["id"] = 920
            payload["data"][0]["image_url"] = "/media/first.svg" if not changed else "/media/second.svg"
            route.fulfill(
                status=200,
                content_type="application/json",
                body=json.dumps(payload),
            )

        page.route("**/api/v1/artworks**", artworks)
        page.route(
            "**/media/first.svg",
            lambda route: route.fulfill(
                status=200,
                content_type="image/svg+xml",
                body='<svg xmlns="http://www.w3.org/2000/svg" width="8" height="10"><rect width="8" height="10" fill="#777777"/></svg>',
            ),
        )
        page.route(
            "**/media/second.svg",
            lambda route: route.fulfill(
                status=200,
                content_type="image/svg+xml",
                body='<svg xmlns="http://www.w3.org/2000/svg" width="8" height="10"><circle cx="4" cy="5" r="4" fill="#777777"/></svg>',
            ),
        )

        try:
            page.goto(BASE_URL + "/artworks", wait_until="domcontentloaded")
            image = page.locator('img[alt="اثر با تصویر متغیر"]')
            image.wait_for(state="visible")
            page.wait_for_function("""() => {
                const image = document.querySelector('img[alt="اثر با تصویر متغیر"]');
                return image?.complete && image.naturalWidth > 0
                    && image.getAttribute('src') === '/media/first.svg'
                    && image.parentElement?.getAttribute('aria-busy') === 'false';
            }""")

            search = page.get_by_role("searchbox", name="جست‌وجو در آثار و هنرمندان")
            search.fill("تغییر")
            with page.expect_response(
                lambda response: "/api/v1/artworks" in response.url
                and "q=" in response.url
                and response.request.method == "GET"
            ):
                search.press("Enter")

            page.wait_for_function("""() => {
                const image = document.querySelector('img[alt="اثر با تصویر متغیر"]');
                return image?.complete && image.naturalWidth > 0
                    && image.getAttribute('src') === '/media/second.svg'
                    && image.parentElement?.getAttribute('aria-busy') === 'false';
            }""")
            self.assertEqual(requests, ["initial", "changed"])
            self.assertEqual(image.locator("xpath=..").get_attribute("aria-busy"), "false")
        finally:
            context.close()


    def test_desktop_sticky_artwork_filter_sidebar_scrolls_when_content_overflows(self):
        context, page = self.new_page()
        page.set_viewport_size({"width": 1280, "height": 560})
        page.route(
            "**/api/v1/categories",
            lambda route: route.fulfill(
                status=200,
                content_type="application/json",
                body=json.dumps({"data": [{"id": 1, "slug": "painting", "name": "نقاشی"}]}),
            ),
        )
        page.route(
            "**/api/v1/artwork-filters",
            lambda route: route.fulfill(
                status=200,
                content_type="application/json",
                body=json.dumps({
                    "data": {
                        "mediums": ["رنگ روغن"],
                        "availability": [{"value": "available", "label": "قابل استعلام", "label_en": "Available"}],
                        "sorts": [{"value": "newest", "label": "جدیدترین", "label_en": "Newest"}],
                    }
                }),
            ),
        )
        page.route(
            "**/api/v1/artworks**",
            lambda route: route.fulfill(
                status=200,
                content_type="application/json",
                body=json.dumps(artwork_payload()),
            ),
        )
        try:
            page.goto(BASE_URL + "/artworks", wait_until="domcontentloaded")
            sidebar = page.get_by_test_id("artwork-filter-sidebar")
            sidebar.wait_for(state="visible")
            page.get_by_role("combobox", name="فیلتر دسته‌بندی").wait_for()

            # Simulate unusually long filter content without changing production data.
            page.evaluate("""() => {
                const sidebar = document.querySelector('[data-testid="artwork-filter-sidebar"]');
                const content = sidebar?.querySelector(':scope > div.pt-5');
                if (!content) throw new Error('Filter content wrapper not found');
                const sections = Array.from(content.children);
                for (let copy = 0; copy < 3; copy += 1) {
                    sections.forEach((section) => content.append(section.cloneNode(true)));
                }
            }""")

            dimensions = sidebar.evaluate(
                "(element) => ({scrollHeight: element.scrollHeight, clientHeight: element.clientHeight})"
            )
            self.assertGreater(
                dimensions["scrollHeight"],
                dimensions["clientHeight"],
                f"Test setup did not create sidebar overflow: {dimensions}",
            )

            bounds = sidebar.bounding_box()
            self.assertIsNotNone(bounds)
            viewport = page.evaluate(
                "() => ({width: window.innerWidth, height: window.innerHeight})"
            )
            # Aim inside the visible filter content, near the lower edge of the
            # scrollport. A fixed y-offset can accidentally hit the sidebar
            # heading (or fall outside the viewport on shorter layouts).
            wheel_x = bounds["x"] + min(bounds["width"] - 16, bounds["width"] / 2)
            visible_bottom = min(bounds["y"] + bounds["height"], viewport["height"])
            wheel_y = max(bounds["y"] + 16, visible_bottom - 24)
            page.mouse.move(wheel_x, wheel_y)
            page.mouse.wheel(0, 500)
            page.wait_for_timeout(100)
            page.mouse.wheel(0, 500)

            try:
                page.wait_for_function("""() => {
                    const element = document.querySelector('[data-testid="artwork-filter-sidebar"]');
                    return element && element.scrollTop > 0;
                }""", timeout=5000)
            except Exception as error:
                diagnostics = sidebar.evaluate("""(element) => ({
                    scrollTop: element.scrollTop,
                    scrollHeight: element.scrollHeight,
                    clientHeight: element.clientHeight,
                    overflowY: getComputedStyle(element).overflowY,
                    position: getComputedStyle(element).position,
                    maxHeight: getComputedStyle(element).maxHeight,
                    rect: (() => {
                        const rect = element.getBoundingClientRect();
                        return {top: rect.top, bottom: rect.bottom, left: rect.left, right: rect.right};
                    })(),
                    activeElement: document.activeElement?.tagName,
                })""")
                page_scroll = page.evaluate("() => window.scrollY")
                self.fail(
                    "Mouse-wheel input did not scroll the artwork filter sidebar. "
                    f"Sidebar: {diagnostics}; document scrollY: {page_scroll}; "
                    f"wheel point: ({wheel_x}, {wheel_y}); original error: {error}"
                )

            self.assertGreater(sidebar.evaluate("(element) => element.scrollTop"), 0)
        finally:
            context.close()


    def test_mobile_filter_drawer_applies_selection_and_updates_shareable_url(self):
        context, page = self.new_page()
        page.set_viewport_size({"width": 390, "height": 844})
        page.route(
            "**/api/v1/categories",
            lambda route: route.fulfill(
                status=200,
                content_type="application/json",
                body=json.dumps({"data": [{"id": 1, "slug": "painting", "name": "نقاشی"}]}),
            ),
        )
        page.route(
            "**/api/v1/artwork-filters",
            lambda route: route.fulfill(
                status=200,
                content_type="application/json",
                body=json.dumps({
                    "data": {
                        "mediums": ["رنگ روغن"],
                        "availability": [{"value": "available", "label": "قابل استعلام", "label_en": "Available"}],
                        "sorts": [{"value": "newest", "label": "جدیدترین", "label_en": "Newest"}],
                    }
                }),
            ),
        )
        requests = []

        def artworks(route):
            query = parse_qs(urlparse(route.request.url).query)
            requests.append(query)
            route.fulfill(
                status=200,
                content_type="application/json",
                body=json.dumps(artwork_payload("اثر فیلترشده")),
            )

        page.route("**/api/v1/artworks**", artworks)
        try:
            page.goto(BASE_URL + "/artworks", wait_until="domcontentloaded")
            page.get_by_role("heading", name="گالری آثار").wait_for()
            page.get_by_role("button", name="فیلترها").click()
            page.get_by_role("dialog").wait_for()
            page.get_by_role("combobox", name="فیلتر دسته‌بندی").click()
            page.get_by_role("option", name="نقاشی").click()

            with page.expect_response(
                lambda response: "/api/v1/artworks" in response.url
                and "category=painting" in response.url
                and response.request.method == "GET"
            ):
                page.get_by_role("button", name="اعمال فیلترها").click()

            page.get_by_role("dialog").wait_for(state="hidden")
            self.assertIn("category=painting", page.url)
            self.assertTrue(any(query.get("category") == ["painting"] for query in requests))
            self.assertTrue(page.get_by_role("button", name="فیلترها").is_visible())
        finally:
            context.close()


class CurrentDevelopmentDatabaseReadOnlyTests(unittest.TestCase):
    """A public GET-only smoke journey against the running app's configured DB."""

    @classmethod
    def setUpClass(cls):
        cls.playwright = sync_playwright().start()
        cls.browser = cls.playwright.chromium.launch()

    @classmethod
    def tearDownClass(cls):
        cls.browser.close()
        cls.playwright.stop()

    @manual_dev_safe
    def test_public_artwork_catalogue_renders_from_current_development_data(self):
        context = self.browser.new_context(
            viewport={"width": 1280, "height": 900},
            ignore_https_errors=IGNORE_HTTPS_ERRORS,
        )
        page = context.new_page()
        page.set_default_timeout(30000)
        page.set_default_navigation_timeout(30000)
        page_errors = []
        page.on("pageerror", lambda error: page_errors.append(str(error)))
        try:
            # Wait for the document commit, then use the actual app heading as readiness.
            # This avoids treating delayed module loading as a navigation-event failure.
            try:
                page.goto(BASE_URL + "/artworks", wait_until="commit", timeout=30000)
            except Exception as error:
                diagnostics = page.evaluate("""() => ({
                    url: location.href,
                    title: document.title,
                    readyState: document.readyState,
                    bodyText: (document.body?.innerText || '').slice(0, 600),
                })""")
                raise AssertionError(
                    "Catalogue document did not commit; "
                    f"page errors: {page_errors}; DOM: {diagnostics}"
                ) from error
            try:
                page.get_by_role("heading", name="گالری آثار").wait_for(timeout=30000)
            except Exception as error:
                diagnostics = page.evaluate("""() => ({
                    url: location.href,
                    title: document.title,
                    bodyText: (document.body?.innerText || '').slice(0, 600),
                    appRoot: document.querySelector('#app')?.outerHTML.slice(0, 1000) ?? null,
                })""")
                raise AssertionError(
                    "Catalogue did not render from the current development database; "
                    f"page errors: {page_errors}; DOM: {diagnostics}"
                ) from error
            self.assertTrue(page.locator("main").is_visible())
        finally:
            context.close()


if __name__ == "__main__":
    unittest.main(verbosity=2)
