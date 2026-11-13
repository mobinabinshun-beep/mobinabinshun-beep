#!/usr/bin/env python3
"""Build reproducible, unsigned offline source bundles for N.U Launcher modules."""
from __future__ import annotations
import hashlib
import json
import shutil
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PACKAGES = [
    ("nu-game-generation-1", "nu.game.generation-1"),
    ("nu-creative-studio", "nu.creative.studio"),
]
DIST = ROOT / "dist" / "packages"


def sha256(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as stream:
        for chunk in iter(lambda: stream.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()


def build(folder: str, expected_id: str) -> Path:
    base = ROOT / "packages" / folder
    manifest_path = base / "manifest.json"
    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    if manifest.get("id") != expected_id:
        raise SystemExit(f"{folder}: package id mismatch")
    entry = base / manifest["runtime"]["entry"]
    if not entry.is_file():
        raise SystemExit(f"{folder}: missing entry {entry.relative_to(ROOT)}")
    listed = manifest["payload"]["entryFiles"]
    if not listed or len(listed) != len(set(listed)):
        raise SystemExit(f"{folder}: empty or duplicate payload list")
    files = [base / name for name in listed]
    missing = [str(p.relative_to(ROOT)) for p in files if not p.is_file()]
    if missing:
        raise SystemExit(f"{folder}: missing payload files: {', '.join(missing)}")
    engine = base / "runtime" / "nu-engine.js"
    if not engine.is_file():
        raise SystemExit(f"{folder}: frozen engine missing")
    if folder == "nu-game-generation-1":
        # Git blob SHA for the frozen engine is part of the accepted baseline.
        blob = b"blob " + str(engine.stat().st_size).encode() + b"\\0" + engine.read_bytes()
        git_blob = hashlib.sha1(blob).hexdigest()
        expected = manifest["protectedComponents"]["nu-engine.js"]["sha256GitBlob"]
        if git_blob != expected:
            raise SystemExit("Frozen nu-engine.js differs from the approved baseline")

    DIST.mkdir(parents=True, exist_ok=True)
    name = f"{folder}-{manifest['version']}.zip"
    output = DIST / name
    checksum_lines = []
    for path in files:
        checksum_lines.append(f"{sha256(path)}  {path.relative_to(base).as_posix()}")
    checksum_text = "\n".join(checksum_lines) + "\n"
    with zipfile.ZipFile(output, "w", compression=zipfile.ZIP_DEFLATED, compresslevel=9) as archive:
        archive.write(manifest_path, "manifest.json")
        for path in sorted(files):
            archive.write(path, path.relative_to(base).as_posix())
        archive.writestr("SHA256SUMS.txt", checksum_text)
        archive.writestr("BUNDLE-NOTICE.txt",
            "N.U Launcher offline source bundle preview. Unsigned; not a native installer. "
            "Install only through a trusted development workflow after review.\n")
    # Verify archive readability and every embedded checksum before reporting success.
    with zipfile.ZipFile(output, "r") as archive:
        bad = archive.testzip()
        if bad:
            raise SystemExit(f"{name}: corrupt member {bad}")
        for line in archive.read("SHA256SUMS.txt").decode().splitlines():
            digest, rel = line.split("  ", 1)
            if hashlib.sha256(archive.read(rel)).hexdigest() != digest:
                raise SystemExit(f"{name}: checksum mismatch for {rel}")
    print(f"BUILT {output.relative_to(ROOT)} ({output.stat().st_size} bytes)")
    return output


if __name__ == "__main__":
    if DIST.exists():
        shutil.rmtree(DIST)
    for folder, package_id in PACKAGES:
        build(folder, package_id)
