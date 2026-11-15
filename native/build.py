#!/usr/bin/env python3
import base64
import pathlib
import re
import sys
from PIL import Image
from io import BytesIO

ROOT = pathlib.Path(__file__).resolve().parents[1]
SOURCE = ROOT / "assets" / "backgrounds" / "niroo-universe-background.svg"
DIST = ROOT / "dist"

def main():
    if not SOURCE.is_file():
        raise SystemExit("Canonical N.U SVG background is missing.")
    svg = SOURCE.read_text(encoding="utf-8")
    match = re.search(r"data:image/png;base64,([A-Za-z0-9+/=]+)", svg)
    if not match:
        raise SystemExit("The canonical SVG does not contain the expected PNG payload.")
    png_bytes = base64.b64decode(match.group(1), validate=True)
    image = Image.open(BytesIO(png_bytes)).convert("RGB")
    if image.size != (1536, 1024):
        raise SystemExit("Unexpected canonical image dimensions: %r" % (image.size,))
    DIST.mkdir(parents=True, exist_ok=True)
    image.save(DIST / "background.bmp", format="BMP")
    (DIST / "README.txt").write_text(
        "N.U Launcher — XP-first native preview\n"
        "Architecture: 32-bit Win32, single static background image.\n"
        "The launcher samples processor count and physical memory and selects a conservative local profile.\n"
        "The web demo opens in the system browser; compatibility of that browser/game with Windows XP is not guaranteed.\n"
        "This preview does not install a browser, modify Windows settings, or require network access to open the native launcher.\n",
        encoding="utf-8",
    )
    print("Extracted canonical image %dx%d to dist/background.bmp" % image.size)

if __name__ == "__main__":
    main()
