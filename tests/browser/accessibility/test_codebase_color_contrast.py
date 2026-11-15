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

from playwright.sync_api import sync_playwright

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
        response = page.goto(BASE_URL + route, wait_until="domcontentloaded")
        self.assertIsNotNone(response, f"No document response for {route}")
        self.assertLess(response.status, 400, f"{route} returned HTTP {response.status}")

        page.locator("#app main").first.wait_for(state="visible")
        page.wait_for_function(
            """() => {
                const root = document.querySelector('#app');
                const main = root?.querySelector('main');
                return Boolean(main && !main.matches('[aria-busy="true"]'));
            }""",
            timeout=20000,
        )
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
            self.assertEqual(
                result["failures"],
                [],
                f"Computed WCAG contrast failures on {route} ({viewport_name}): {result['failures']}",
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
            sitemap_response = context.request.get(BASE_URL + "/sitemap.xml")
            self.assertLess(
                sitemap_response.status,
                400,
                f"Sitemap returned HTTP {sitemap_response.status}",
            )
            sitemap = ET.fromstring(sitemap_response.text())
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
