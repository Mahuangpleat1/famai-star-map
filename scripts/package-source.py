#!/usr/bin/env python3
"""Create an allowlisted source release from the current working tree, never Git history.
Run from any directory: python3 scripts/package-source.py
Output: release/famai-star-map-source.zip + SHA-256 inventory JSON.
This controls included paths, not copyright/secret provenance of arbitrary source text.
Review the inventory and contents before publishing.
"""
import hashlib
import json
from pathlib import Path
import zipfile

ROOT_FILES = {
    "LICENSE", "README.md", "README.en.md", "CONTRIBUTING.md", "SECURITY.md", ".gitignore", ".gitattributes",
    ".editorconfig", ".npmrc", ".nvmrc", "package.json", "package-lock.json", "index.html",
    "vite.config.ts", "playwright.config.ts", "eslint.config.mjs", "lighthouse-budget.json",
    "tsconfig.json", "tsconfig.app.json", "tsconfig.node.json",
}
PUBLIC_DOCS = {"SECURITY.md", "PRIVACY.md", "TERMS.md", "DEPLOYMENT.md", "OPEN-SOURCE-READINESS.md", "CHANGELOG.md"}
SOURCE_DIRS = {"src", "data", "scripts", "tests", "public", "examples", ".github"}
SUFFIXES = {".ts", ".tsx", ".js", ".mjs", ".cjs", ".json", ".css", ".html", ".md", ".txt", ".py", ".yml", ".yaml", ".svg", ".png", ".webmanifest", ".xml", ".woff", ".woff2"}
EXCLUDED_PARTS = {"node_modules", "dist", "build", "__pycache__", "references", "private", "internal", "test-results", "playwright-report", "coverage", ".git", ".superpowers"}

def included(path: Path) -> bool:
    parts = path.parts
    if any(part in EXCLUDED_PARTS or part.startswith(".env") or part == ".DS_Store" for part in parts):
        return False
    if path.as_posix() in ROOT_FILES:
        return True
    if parts[0] == "docs":
        return len(parts) == 2 and path.name in PUBLIC_DOCS or len(parts) == 3 and parts[1] == "screenshots" and path.name in {"overview.png", "focus.png", "command-palette.png"}
    if parts[0] not in SOURCE_DIRS or any(part.startswith(".") for part in parts[1:]):
        return False
    return path.suffix in SUFFIXES

def package_source(root: Path) -> tuple[Path, Path]:
    root = root.resolve()
    output = root / "release"
    output.mkdir(exist_ok=True)
    archive = output / "famai-star-map-source.zip"
    manifest = output / "famai-star-map-source.manifest.json"
    inventory = []
    candidates = [root / name for name in ROOT_FILES]
    for name in SOURCE_DIRS | {"docs"}:
        folder = root / name
        if folder.is_dir() and not folder.is_symlink():
            candidates.extend(folder.rglob("*"))
    with zipfile.ZipFile(archive, "w", compression=zipfile.ZIP_DEFLATED) as bundle:
        for path in sorted(set(candidates)):
            relative = path.relative_to(root)
            if not included(relative) or not path.is_file() or path.is_symlink():
                continue
            if any(parent.is_symlink() for parent in path.parents if parent != root and root in parent.parents):
                continue
            content = path.read_bytes()
            # Fixed archive timestamps permit byte-for-byte comparisons of unchanged inputs.
            entry = zipfile.ZipInfo(f"famai-star-map/{relative.as_posix()}", date_time=(2026, 1, 1, 0, 0, 0))
            entry.compress_type = zipfile.ZIP_DEFLATED
            entry.external_attr = 0o100644 << 16
            bundle.writestr(entry, content)
            inventory.append({"path": relative.as_posix(), "bytes": len(content), "sha256": hashlib.sha256(content).hexdigest()})
    manifest.write_text(json.dumps({"archive": archive.name, "archive_sha256": hashlib.sha256(archive.read_bytes()).hexdigest(), "files": inventory}, ensure_ascii=False, indent=2) + "\n")
    return archive, manifest

if __name__ == "__main__":
    archive, manifest = package_source(Path(__file__).resolve().parents[1])
    print(f"Created {archive.name} and {manifest.name} in release/")
    print("Review the inventory before publishing; Git history and reference files remain local.")
