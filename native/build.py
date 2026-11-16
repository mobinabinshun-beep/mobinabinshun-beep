#!/usr/bin/env python3
import base64
import pathlib
import re
from PIL import Image
from io import BytesIO
import shutil

ROOT = pathlib.Path(__file__).resolve().parents[1]
SOURCE = ROOT / "assets" / "backgrounds" / "niroo-universe-background.svg"
MODULES = ROOT / "native" / "modules"
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
    module_out = DIST / "modules"
    module_out.mkdir(parents=True, exist_ok=True)
    module = MODULES / "hello.nup"
    if not module.is_file():
        raise SystemExit("The Generation 1 sample module is missing.")
    shutil.copy2(module, module_out / module.name)
    (DIST / "README.txt").write_text(
        "N.U Launcher — browser-independent native runtime preview\n"
        "Architecture: 32-bit Win32, single static background image.\n"
        "The shell uses internal nu:// navigation and does not launch a system browser.\n"
        "The bundled NUVM/1 module is declarative and instruction-limited.\n"
        "Windows XP SP3 x86 compatibility is NOT VERIFIED until tested on XP.\n",
        encoding="utf-8",
    )
    print("Extracted canonical image %dx%d and bundled NUVM/1 sample module" % image.size)

if __name__ == "__main__":
    main()
