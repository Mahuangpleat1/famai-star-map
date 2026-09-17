"""Working-tree release boundary tests. Synthetic contents only."""
import importlib.util
from pathlib import Path
import tempfile
import unittest
import zipfile
import hashlib

spec = importlib.util.spec_from_file_location("package_source", Path(__file__).parents[1] / "package-source.py")
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)

class PackageSourceTest(unittest.TestCase):
    def test_only_allowlisted_working_tree_files_enter_archive(self):
        output = Path(__file__).parents[2] / "release"
        output.mkdir(exist_ok=True)
        with tempfile.TemporaryDirectory(dir=output) as folder:
            root = Path(folder)
            files = {
                "package.json": '{"name":"synthetic"}', "src/current.ts": "// uncommitted learning feature",
                "LICENSE": "synthetic license", "docs/PRIVACY.md": "public privacy",
                "examples/learning.md": "synthetic lesson", ".github/workflows/ci.yml": "name: Test",
                "references/private.png": "third-party", "docs/superpowers/internal.md": "internal",
                ".git/config": "history", "src/.env.local": "secret", "src/key.pem": "secret",
                "src/.DS_Store": "local", "src/__pycache__/cache.pyc": "bytecode",
                "dist/assets/a.js": "built", "node_modules/a.js": "dependency", "user-notes.md": "private"
            }
            for name, body in files.items():
                path = root / name; path.parent.mkdir(parents=True, exist_ok=True); path.write_text(body)
            (root / "src/link.ts").symlink_to(root / "user-notes.md")
            archive, manifest = module.package_source(root)
            with zipfile.ZipFile(archive) as bundle:
                names = {name.removeprefix("famai-star-map/") for name in bundle.namelist()}
                self.assertEqual(names, {"package.json", "src/current.ts", "LICENSE", "docs/PRIVACY.md", "examples/learning.md", ".github/workflows/ci.yml"})
                self.assertEqual(bundle.read("famai-star-map/src/current.ts").decode(), files["src/current.ts"])
            import json
            entries = json.loads(manifest.read_text())["files"]
            item = next(entry for entry in entries if entry["path"] == "src/current.ts")
            self.assertEqual(item["sha256"], hashlib.sha256(files["src/current.ts"].encode()).hexdigest())
            self.assertTrue((root / "references/private.png").exists())

if __name__ == "__main__": unittest.main()
