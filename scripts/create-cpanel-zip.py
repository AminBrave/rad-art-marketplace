#!/usr/bin/env python3
"""Create and validate a root-layout cPanel deployment ZIP."""

import json
import os
import sys
import zipfile


def fail(message):
    raise SystemExit(message)


def archive_tree(stage, output):
    with zipfile.ZipFile(
        output,
        "w",
        compression=zipfile.ZIP_DEFLATED,
        compresslevel=9,
        allowZip64=True,
    ) as archive:
        for current, directories, files in os.walk(stage):
            directories.sort()
            files.sort()
            for name in directories:
                path = os.path.join(current, name)
                if os.path.islink(path):
                    fail("Refusing to archive symbolic link: " + path)
                relative = os.path.relpath(path, stage).replace(os.sep, "/") + "/"
                archive.write(path, relative)
            for name in files:
                path = os.path.join(current, name)
                if os.path.islink(path) or not os.path.isfile(path):
                    fail("Refusing to archive non-regular file: " + path)
                relative = os.path.relpath(path, stage).replace(os.sep, "/")
                archive.write(path, relative)


def validate_archive(output):
    with zipfile.ZipFile(output, "r") as archive:
        bad_entry = archive.testzip()
        if bad_entry:
            fail("ZIP integrity check failed at: " + bad_entry)

        names = set(archive.namelist())
        required = {
            ".htaccess",
            "index.php",
            "artisan",
            "composer.json",
            "composer.lock",
            "vendor/autoload.php",
            "build/manifest.json",
        }
        missing = sorted(required - names)
        if missing:
            fail("ZIP is missing required root entries: " + ", ".join(missing))

        forbidden = []
        for name in names:
            normalized = name.rstrip("/")
            parts = normalized.split("/")
            if normalized == ".env" or (
                normalized.startswith(".env.") and normalized != ".env.example"
            ):
                forbidden.append(name)
            if any(part in {".git", "node_modules"} for part in parts) or parts[0] == "tests":
                forbidden.append(name)
            if normalized.startswith(
                ("storage/app/private/", "storage/app/public/", "storage/logs/")
            ):
                forbidden.append(name)
            if normalized.startswith(
                (
                    "storage/framework/cache/",
                    "storage/framework/sessions/",
                    "storage/framework/views/",
                )
            ):
                forbidden.append(name)
            if normalized.endswith((".sqlite", ".sqlite3", ".db")):
                forbidden.append(name)
        if forbidden:
            fail(
                "ZIP contains excluded development or private paths: "
                + ", ".join(sorted(set(forbidden))[:20])
            )

        try:
            manifest = json.loads(archive.read("build/manifest.json"))
        except (KeyError, json.JSONDecodeError):
            fail("ZIP contains an unreadable Vite manifest.")
        if not isinstance(manifest, dict):
            fail("ZIP Vite manifest must be a JSON object.")

        referenced = set()
        for entry in manifest.values():
            if not isinstance(entry, dict):
                continue
            if isinstance(entry.get("file"), str):
                referenced.add("build/" + entry["file"].lstrip("/"))
            for key in ("css", "assets"):
                for item in entry.get(key, []):
                    if isinstance(item, str):
                        referenced.add("build/" + item.lstrip("/"))
        missing_assets = sorted(path for path in referenced if path not in names)
        if missing_assets:
            fail(
                "ZIP is missing manifest assets: "
                + ", ".join(missing_assets[:20])
            )


if __name__ == "__main__":
    if len(sys.argv) != 3:
        fail("Usage: create-cpanel-zip.py STAGING_DIRECTORY OUTPUT_ZIP")
    archive_tree(sys.argv[1], sys.argv[2])
    validate_archive(sys.argv[2])
