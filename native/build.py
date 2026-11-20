#!/usr/bin/env python3
"""Extract the single canonical N.U background image for the XP-first host."""
import base64
import pathlib
import re
from io import BytesIO
from PIL import Image

ROOT = pathlib.Path(__file__).resolve().parents[1]
SOURCE = ROOT / "assets" / "backgrounds" / "niroo-universe-background.svg"
DIST = ROOT / "dist"

def main():
    if not SOURCE.is_file():
        raise SystemExit("Canonical N.U SVG background is missing.")
    svg = SOURCE.read_text(encoding="utf-8")
    match = re.search(r"data:image/png;base64,([A-Za-z0-9+/=]+)", svg)
    if not match:
        raise SystemExit("Canonical SVG has no embedded PNG payload.")
    png_bytes = base64.b64decode(match.group(1), validate=True)
    image = Image.open(BytesIO(png_bytes)).convert("RGB")
    if image.size != (1536, 1024):
        raise SystemExit("Unexpected canonical image dimensions: %r" % (image.size,))
    DIST.mkdir(parents=True, exist_ok=True)
    image.save(DIST / "background.bmp", format="BMP")
    (DIST / "README.txt").write_text(
        "N.U Native Runtime candidate\n"
        "Single canonical still background image; no animated layers or browser runtime.\n"
        "The executable is a host/VM smoke-test candidate, not a setup installer or playable game pack.\n"
        "Windows XP SP3 x86 runtime compatibility is not yet certified.\n",
        encoding="utf-8",
    )
    print("Extracted canonical static background: %dx%d" % image.size)

if __name__ == "__main__":
    main()
