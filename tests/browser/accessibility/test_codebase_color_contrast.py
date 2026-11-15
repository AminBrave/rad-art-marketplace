"""Repository-wide rendered color contrast coverage for every routed application screen.

Public dynamic detail routes come from the live development sitemap. Authenticated
workspace routes are rendered for each supported role with API responses stubbed,
so this suite remains read-only against the current development database.
"""

import json
import re
import unittest
import xml.etree.ElementTree as ET
from pathlib import Path
from urllib.parse import urlparse

from playwright.sync_api import TimeoutError as PlaywrightTimeoutError, sync_playwright

from config import BASE_URL, IGNORE_HTTPS_ERRORS


ROOT = Path(__file__).resolve().parents[3]
APP_ROUTER_SOURCE = (ROOT / "resources" / "js" / "app" / "AppRouter.jsx").read_text(encoding="utf-8")
AUDIT_SOURCE = (ROOT / "resources" / "js" / "lib" / "colorAccessibility.js").read_text(encoding="utf-8")
AUDIT_SCRIPT = AUDIT_SOURCE.replace("export function ", "function ")
AUDIT_SCRIPT += "\nwindow.__radColorAccessibilityAudit = auditColorAccessibility;"

# These declarations mirror every concrete route in AppRouter, including nested
# route segments. The inventory test below fails when a route is added without
# adding it to this browser audit.
REQUIRED_ROUTE_DECLARATIONS = (
    'path="/"',
    'path="/artworks"',
    'path="/collections"',
    'path="/collections/:slug"',
    'path="/artworks/:slug"',
    'path="/artists"',
    'path="/artists/:slug"',
    'path="/about"',
    'path="/help"',
    'path="/contact"',
    'path="/login"',
    'path="/register"',
    'path="/unauthorized"',
    'path="/dashboard"',
    'path="/dashboard/artist"',
    'path="profile"',
    'path="artworks"',
    'path="messages"',
    'path="/dashboard/buyer"',
    'path="/admin"',
    'path="users"',
    'path="artworks"',
    'path="message-reports"',
    'path="editorial"',
    'path="*"',
)

PUBLIC_STATIC_ROUTES = (
    "/",
    "/artworks",
    "/artists",
    "/collections",
    "/about",
    "/help",
    "/contact",
    "/login",
    "/register",
    "/unauthorized",
    "/__rad_a11y_unknown_route__",
    # The development-only specimen mounts the shared component library.
    "/?design-system",
)

ROLE_ROUTES = {
    "buyer": (
        "/dashboard",
        "/dashboard/buyer",
        "/dashboard/buyer/messages",
    ),
    "artist": (
        "/dashboard",
        "/dashboard/artist",
        "/dashboard/artist/profile",
        "/dashboard/artist/artworks",
        "/dashboard/artist/messages",
    ),
    "admin": (
        "/dashboard",
        "/admin",
        "/admin/users",
        "/admin/artworks",
        "/admin/message-reports",
        "/admin/editorial",
    ),
}


def _user_for_role(role):
    return {
        "id": {"buyer": 81001, "artist": 81002, "admin": 81003}[role],
        "name": "Color accessibility audit",
        "email": f"a11y-{role}@example.test",
        "role": role,
    }


def _api_payload(path, role):
    if path == "/api/v1/auth/me":
        return {"data": _user_for_role(role)}
    if path == "/api/v1/artist-profile/me":
        return {
            "data": {
                "id": 82001,
                "display_name": "Color audit artist",
                "bio": "",
                "city": "",
                "website_url": "",
                "instagram_handle": "",
                "is_public": True,
            }
        }
    if path == "/api/v1/admin/editorial/options":
        return {"data": {"artworks": [], "artists": []}}
    if path.endswith("/admin/editorial/collections"):
        return {"data": []}
    if path.endswith("/admin/editorial/featured-artists"):
        return {"data": []}
    return {
        "data": [],
        "meta": {"current_page": 1, "last_page": 1, "total": 0, "per_page": 20},
    }


class CodebaseRenderedColorContrastTests(unittest.TestCase):
    """Audit every routed screen and every visible rendered element."""

    manual_dev_safe = True

    @classmethod
    def setUpClass(cls):
        cls.playwright = sync_playwright().start()
        cls.browser = cls.playwright.chromium.launch()

    @classmethod
    def tearDownClass(cls):
        cls.browser.close()
        cls.playwright.stop()

    def new_page(self, role=None):
        context = self.browser.new_context(
            viewport={"width": 1440, "height": 1000},
            ignore_https_errors=IGNORE_HTTPS_ERRORS,
        )
        page = context.new_page()
        page.set_default_timeout(20000)
        page.add_init_script(script=AUDIT_SCRIPT)

        if role:
            def mock_api(route):
                request_path = urlparse(route.request.url).path
                payload = _api_payload(request_path, role)
                route.fulfill(
                    status=200,
                    content_type="application/json",
                    body=json.dumps(payload, ensure_ascii=False),
                )

            page.route("**/api/v1/**", mock_api)

        return context, page

    def audit_route(self, page, route):
        page_errors = []
        page.on("pageerror", lambda error: page_errors.append(str(error)))
        response = page.goto(BASE_URL + route, wait_until="domcontentloaded")
        self.assertIsNotNone(response, f"No document response for {route}")
        self.assertLess(response.status, 400, f"{route} returned HTTP {response.status}")

        # The server-side loading skeleton has no readable text. Waiting for
        # body text avoids assumptions about root IDs and semantic landmarks.
        try:
            page.wait_for_function(
                "() => document.body && document.body.innerText.trim().length > 0",
                timeout=20000,
            )
            if route == "/?design-system":
                page.locator("#shared-components").wait_for(state="visible")
        except PlaywrightTimeoutError as error:
            diagnostics = page.evaluate(
                """() => ({
                    url: location.href,
                    title: document.title,
                    bodyText: (document.body?.innerText || '').slice(0, 500),
                    appRoot: document.querySelector('#app')?.outerHTML.slice(0, 1200) ?? null,
                })"""
            )
            raise AssertionError(
                f"Application content did not render for {route}; "
                f"browser page errors: {page_errors}; DOM diagnostics: {diagnostics}"
            ) from error
        results = {}
        for viewport_name, width, height in (
            ("desktop", 1440, 1000),
            ("mobile", 390, 844),
        ):
            page.set_viewport_size({"width": width, "height": height})
            result = page.evaluate("() => window.__radColorAccessibilityAudit(document)")
            self.assertGreater(
                result["textChecks"],
                0,
                f"No visible text was checked on {route} ({viewport_name}): {result}",
            )
            if result["failures"]:
                diagnostics = page.evaluate(
                    """(labels) => {
                        const describe = (element) => {
                            const chain = [];
                            for (let node = element; node && node.nodeType === 1; node = node.parentElement) {
                                const style = getComputedStyle(node);
                                chain.push({
                                    tag: node.tagName.toLowerCase(),
                                    classes: typeof node.className === 'string' ? node.className : '',
                                    color: style.color,
                                    backgroundColor: style.backgroundColor,
                                    backgroundImage: style.backgroundImage,
                                    opacity: style.opacity,
                                });
                            }
                            return chain;
                        };
                        const label = (element) => {
                            const tag = element.tagName.toLowerCase();
                            const id = element.id ? '#' + element.id : '';
                            const classes = typeof element.className === 'string'
                                ? element.className.trim().split(/\\s+/).filter(Boolean).slice(0, 3).map((name) => '.' + name).join('')
                                : '';
                            return tag + id + classes;
                        };
                        const all = [...document.querySelectorAll('*')];
                        return labels.map((wanted) => {
                            const matches = all.filter((element) => label(element) === wanted);
                            return {
                                label: wanted,
                                matches: matches.slice(0, 5).map((element) => describe(element)),
                                totalMatches: matches.length,
                            };
                        });
                    }""",
                    list(dict.fromkeys(failure["element"] for failure in result["failures"])),
                )
                self.fail(
                    f"Computed WCAG contrast failures on {route} ({viewport_name}): "
                    f"{result['failures']}; ancestor diagnostics: {diagnostics}"
                )
            results[viewport_name] = result
        return results

    def test_every_app_router_route_is_registered_in_the_audit_inventory(self):
        missing = [
            declaration
            for declaration in REQUIRED_ROUTE_DECLARATIONS
            if declaration not in APP_ROUTER_SOURCE
        ]
        self.assertEqual(
            missing,
            [],
            "AppRouter route declarations changed. Update the repository-wide "
            f"color-audit route inventory and route tests: {missing}",
        )

    def test_all_static_and_sitemap_public_routes_have_no_contrast_failures(self):
        context, page = self.new_page()
        audited = []
        try:
            # Navigate through Chromium rather than APIRequestContext: browser
            # navigation honors the context's ignore_https_errors setting for
            # locally trusted/development certificates.
            sitemap_response = page.goto(BASE_URL + "/sitemap.xml", wait_until="domcontentloaded")
            self.assertIsNotNone(sitemap_response, "No response for /sitemap.xml")
            self.assertLess(
                sitemap_response.status,
                400,
                f"Sitemap returned HTTP {sitemap_response.status}",
            )
            sitemap = ET.fromstring(page.evaluate("() => document.documentElement.outerHTML"))
            dynamic_routes = []
            for node in sitemap.findall(".//{*}loc"):
                location = urlparse(node.text or "")
                path = location.path or "/"
                if re.match(r"^/(artworks|artists|collections)/[^/]+$", path):
                    dynamic_routes.append(path)

            routes = list(dict.fromkeys((*PUBLIC_STATIC_ROUTES, *dynamic_routes)))
            self.assertGreaterEqual(len(routes), len(PUBLIC_STATIC_ROUTES))
            for route in routes:
                self.audit_route(page, route)
                audited.append(route)
        finally:
            context.close()

        self.assertTrue(audited, "No public routes were audited.")


    def test_shared_component_library_and_interactive_states_have_no_contrast_failures(self):
        context, page = self.new_page()
        try:
            self.audit_route(page, "/?design-system")

            def assert_current_state(label):
                result = page.evaluate("() => window.__radColorAccessibilityAudit(document)")
                self.assertEqual(
                    result["failures"],
                    [],
                    f"Computed WCAG contrast failures in component showcase state {label}: {result['failures']}",
                )

            # Exercise representative interactive states from the shared UI
            # component showcase: hover, dropdown, dialog and selected tab.
            for label in ("اقدام اصلی", "ثانویه", "خطی", "ساده", "حذف"):
                page.get_by_role("button", name=label, exact=True).hover()
                assert_current_state(f"hover:{label}")

            page.get_by_role("button", name="باز کردن منو").click()
            page.get_by_role("menu").wait_for(state="visible")
            assert_current_state("dropdown-open")
            # Escape closes the portalled Radix menu deterministically without
            # depending on collision-based placement or item-selection side effects.
            page.keyboard.press("Escape")
            page.get_by_role("menu").wait_for(state="hidden")
            assert_current_state("dropdown-closed")

            page.get_by_role("button", name="باز کردن دیالوگ").click()
            page.get_by_role("dialog").wait_for(state="visible")
            assert_current_state("dialog-open")
            page.get_by_role("button", name="بستن", exact=True).click()
            page.get_by_role("dialog").wait_for(state="hidden")
            assert_current_state("dialog-closed")

            page.get_by_role("tab", name="جزئیات").click()
            self.assertTrue(page.get_by_role("tab", name="جزئیات").get_attribute("aria-selected") == "true")
            assert_current_state("tab-selected")

            # Keyboard traversal activates :focus-visible styling on actual
            # controls and links in the component gallery.
            for index in range(20):
                page.keyboard.press("Tab")
                assert_current_state(f"keyboard-focus-{index + 1}")
        finally:
            context.close()

    def test_notification_panel_stays_in_viewport_and_can_be_dismissed(self):
        context, page = self.new_page(role="buyer")
        try:
            page.goto(BASE_URL + "/dashboard", wait_until="domcontentloaded")
            page.get_by_role("button", name="اعلان‌ها").wait_for(state="visible")

            for viewport_name, width, height in (
                ("desktop", 1440, 1000),
                ("mobile", 390, 844),
            ):
                page.set_viewport_size({"width": width, "height": height})
                main = page.locator("main").first
                main_before = main.bounding_box()
                width_before = page.evaluate("() => document.documentElement.scrollWidth")

                page.get_by_role("button", name="اعلان‌ها").click()
                panel = page.get_by_role("dialog", name="اعلان‌های پیام")
                panel.wait_for(state="visible")

                self.assertLessEqual(
                    page.evaluate("() => document.documentElement.scrollWidth"),
                    width,
                    f"Opening the notification panel caused horizontal page overflow on {viewport_name}",
                )
                self.assertEqual(
                    main.bounding_box()["x"],
                    main_before["x"],
                    f"Opening the notification panel shifted page content on {viewport_name}",
                )
                self.assertEqual(
                    page.evaluate("() => document.documentElement.scrollWidth"),
                    width_before,
                    f"Opening the notification panel changed document width on {viewport_name}",
                )

                bounds = panel.bounding_box()
                self.assertIsNotNone(bounds, f"Notification panel has no box on {viewport_name}")
                self.assertGreaterEqual(bounds["x"], 0, f"Notification panel overflows left on {viewport_name}: {bounds}")
                self.assertLessEqual(
                    bounds["x"] + bounds["width"],
                    width,
                    f"Notification panel overflows right on {viewport_name}: {bounds}",
                )
                result = page.evaluate("() => window.__radColorAccessibilityAudit(document)")
                self.assertEqual(
                    result["failures"],
                    [],
                    f"Notification panel has contrast failures on {viewport_name}: {result['failures']}",
                )

                page.get_by_role("button", name="بستن اعلان‌ها").click()
                panel.wait_for(state="hidden")

            page.get_by_role("button", name="اعلان‌ها").click()
            page.get_by_role("dialog", name="اعلان‌های پیام").wait_for(state="visible")
            page.keyboard.press("Escape")
            page.get_by_role("dialog", name="اعلان‌های پیام").wait_for(state="hidden")
        finally:
            context.close()

    def test_all_authenticated_role_workspace_routes_have_no_contrast_failures(self):
        for role, routes in ROLE_ROUTES.items():
            context, page = self.new_page(role=role)
            try:
                for route in routes:
                    self.audit_route(page, route)
            finally:
                context.close()


if __name__ == "__main__":
    unittest.main(verbosity=2)
