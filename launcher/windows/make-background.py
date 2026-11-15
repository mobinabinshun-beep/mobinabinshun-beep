import base64
import re
from pathlib import Path
from PIL import Image

source = Path("assets/backgrounds/niroo-universe-background.svg")
target = Path("build/launcher-background.bmp")
svg = source.read_text(encoding="utf-8")
match = re.search(r'href="data:image/png;base64,([^"]+)"', svg)
if not match:
    raise SystemExit("Embedded PNG artwork not found in canonical background SVG")
import io
image = Image.open(io.BytesIO(base64.b64decode(match.group(1)))).convert("RGB")
target.parent.mkdir(parents=True, exist_ok=True)
image.save(target, format="BMP")
print(f"Prepared single still background: {target} ({image.width}x{image.height})")
