#!/usr/bin/env python3
# SPDX-License-Identifier: GPL-2.0-or-later
"""Build the Kodi add-on repository of this tree into a directory.

Every top-level directory holding an addon.xml becomes <id>/<id>-<version>.zip
with a .sha256 next to it; addons.xml and addons.xml.sha256 list them all.
Each earlier version of an add-on is built from the commit before the one
that replaced it, so a Kodi still holding an older addons.xml installs it.
Where that commit has a common/, its files go into each web app lacking
them, @ADDON_ID@ replaced, so that the version keeps the settings it was
released with.
"""

import hashlib
import html
import os
import subprocess
import sys
import xml.etree.ElementTree as ET
import zipfile

ZIP_DATE = (1980, 1, 1, 0, 0, 0)
TEXT_SUFFIXES = (".xml", ".po")


def files_list(top):
    found = []
    for root, dirs, names in os.walk(top):
        dirs.sort()
        for name in sorted(names):
            path = os.path.join(root, name)
            found.append(os.path.relpath(path, top))
    return found


def addon_files(src):
    return {rel: open(os.path.join(src, rel), "rb").read() for rel in files_list(src)}


def zip_write(path, addon_id, files):
    with zipfile.ZipFile(path, "w", zipfile.ZIP_DEFLATED) as zf:
        for rel in sorted(files):
            info = zipfile.ZipInfo(addon_id + "/" + rel, ZIP_DATE)
            info.compress_type = zipfile.ZIP_DEFLATED
            info.external_attr = 0o644 << 16
            zf.writestr(info, files[rel])


def sha256_write(path):
    digest = hashlib.sha256(open(path, "rb").read()).hexdigest()
    with open(path + ".sha256", "w") as f:
        f.write("%s  %s\n" % (digest, os.path.basename(path)))


def index_write(directory, entries):
    links = "".join('<li><a href="%s">%s</a></li>\n' % (html.escape(e), html.escape(e))
                    for e in entries)
    with open(os.path.join(directory, "index.html"), "w") as f:
        f.write("<!DOCTYPE html>\n<html><head><meta charset=\"utf-8\">"
                "<title>Index</title></head><body><ul>\n%s</ul></body></html>\n" % links)


def git(tree, *args):
    return subprocess.run(["git", "-C", tree, *args], check=True,
                          capture_output=True).stdout


def git_files(tree, commit, top):
    names = git(tree, "ls-tree", "-r", "--name-only", commit, "--", top + "/")
    return {os.path.relpath(name, top): git(tree, "show", "%s:%s" % (commit, name))
            for name in names.decode().splitlines()}


def addon_files_at(tree, commit, name, addon_id, is_webapp):
    files = {}
    for rel, data in (git_files(tree, commit, "common") if is_webapp else {}).items():
        if rel.endswith(TEXT_SUFFIXES):
            data = data.replace(b"@ADDON_ID@", addon_id.encode())
        files[rel] = data
    files.update(git_files(tree, commit, name))
    return files


def earlier_versions(tree, name):
    commits = git(tree, "log", "--reverse", "--format=%H", "--", name + "/addon.xml")
    versions = []
    previous = None
    for commit in commits.decode().split():
        manifest = ET.fromstring(git(tree, "show", "%s:%s/addon.xml" % (commit, name)))
        version = manifest.get("version")
        if previous and version != previous:
            versions.append((previous, commit + "^"))
        previous = version
    return versions


def zip_publish(target, zip_name, addon_id, files):
    zip_write(os.path.join(target, zip_name), addon_id, files)
    sha256_write(os.path.join(target, zip_name))
    return [zip_name, zip_name + ".sha256"]


def addon_dirs(tree):
    for name in sorted(os.listdir(tree)):
        if os.path.isfile(os.path.join(tree, name, "addon.xml")):
            yield name


def main():
    if len(sys.argv) != 2:
        sys.exit("usage: build-repo.py <output directory>")
    tree = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    out = sys.argv[1]
    manifests = []
    top_entries = []

    os.makedirs(out, exist_ok=True)
    for name in addon_dirs(tree):
        src = os.path.join(tree, name)
        manifest = ET.parse(os.path.join(src, "addon.xml")).getroot()
        addon_id = manifest.get("id")
        version = manifest.get("version")
        if addon_id != name:
            sys.exit("%s: add-on id %s differs from its directory" % (name, addon_id))

        target = os.path.join(out, addon_id)
        os.makedirs(target, exist_ok=True)
        is_webapp = manifest.find("extension[@point='kodi.webapp']") is not None
        entries = zip_publish(target, "%s-%s.zip" % (addon_id, version), addon_id,
                              addon_files(src))
        for old, commit in earlier_versions(tree, name):
            if old != version:
                entries += zip_publish(target, "%s-%s.zip" % (addon_id, old), addon_id,
                                       addon_files_at(tree, commit, name, addon_id,
                                                      is_webapp))
        index_write(target, entries)

        manifests.append(ET.tostring(manifest, encoding="unicode").strip())
        top_entries.append(addon_id + "/")

    addons_xml = os.path.join(out, "addons.xml")
    with open(addons_xml, "w", encoding="utf-8") as f:
        f.write('<?xml version="1.0" encoding="UTF-8"?>\n<addons>\n')
        for m in manifests:
            f.write(m + "\n")
        f.write("</addons>\n")
    sha256_write(addons_xml)
    index_write(out, top_entries + ["addons.xml", "addons.xml.sha256"])


if __name__ == "__main__":
    main()
