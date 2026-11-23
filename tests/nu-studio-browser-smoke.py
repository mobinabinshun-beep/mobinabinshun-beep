#!/usr/bin/env python3
"""Cross-browser Studio smoke and color-mixing interaction checks for CI."""
import argparse
import asyncio
from urllib.parse import urljoin

from playwright.async_api import async_playwright


async def cell_point(page, x, y):
    await page.locator("#pixel-canvas").scroll_into_view_if_needed()
    return await page.locator("#pixel-canvas").evaluate(
        "(canvas, p) => { const r=canvas.getBoundingClientRect(); return {x:r.left+(p.x+.5)*r.width/canvas.width,y:r.top+(p.y+.5)*r.height/canvas.height}; }",
        {"x": x, "y": y},
    )


async def set_color(page, color):
    await page.locator("#custom-color").evaluate(
        "(el, value) => { el.value=value; el.dispatchEvent(new Event('input',{bubbles:true})); }",
        color,
    )


async def read_pixel(page, x, y):
    return await page.locator("#pixel-canvas").evaluate(
        "(canvas, p) => Array.from(canvas.getContext('2d').getImageData(p.x,p.y,1,1).data).slice(0,3)",
        {"x": x, "y": y},
    )


async def click_cell(page, x, y):
    point = await cell_point(page, x, y)
    target = await page.evaluate("(p) => document.elementFromPoint(p.x,p.y)?.id", point)
    assert target == "pixel-canvas", f"Pointer target is not the canvas: {target}"
    await page.mouse.click(point["x"], point["y"])


async def drag_cells(page, start, end):
    a = await cell_point(page, *start)
    b = await cell_point(page, *end)
    target = await page.evaluate("(p) => document.elementFromPoint(p.x,p.y)?.id", a)
    assert target == "pixel-canvas", f"Stroke start target is not the canvas: {target}"
    await page.mouse.move(a["x"], a["y"])
    await page.mouse.down()
    await page.mouse.move(b["x"], b["y"], steps=3)
    await page.mouse.up()


async def check_entry_pages(browser, base_url, viewport):
    page = await browser.new_page(viewport=viewport)
    response = await page.goto(urljoin(base_url.rstrip("/") + "/", "index.html#library-section"), wait_until="domcontentloaded", timeout=60000)
    assert response and response.status == 200, f"Library page did not return HTTP 200: {response.status if response else 'no response'}"
    await page.locator("#library-section").wait_for(state="attached", timeout=20000)
    assert await page.locator('a[href="./pixel-art-studio.html"]').count() > 0, "Studio entry link is missing from the library page"
    await page.close()


async def check_studio(browser, base_url, viewport, require_mix, touch_test=False):
    context = await browser.new_context(viewport=viewport, has_touch=touch_test, is_mobile=touch_test)
    page = await context.new_page()
    page_errors = []
    page.on("pageerror", lambda error: page_errors.append(str(error)))
    response = await page.goto(urljoin(base_url.rstrip("/") + "/", "pixel-art-studio.html"), wait_until="domcontentloaded", timeout=60000)
    assert response and response.status == 200, f"Studio page did not return HTTP 200: {response.status if response else 'no response'}"
    await page.locator("#pixel-canvas").wait_for(state="visible", timeout=30000)
    await page.wait_for_function("() => !!document.querySelector('#studio-quick-tools [data-tool=\"fading-brush\"]')", timeout=30000)
    await page.wait_for_function("() => { const c=document.querySelector('#pixel-canvas'); return c && c.width>0 && c.height>0 && c.getBoundingClientRect().width>0; }", timeout=30000)
    assert await page.locator('#studio-quick-tools [data-tool="fading-brush"]').count() == 1, "Fading must remain a separate tool"
    await page.locator("#show-grid").evaluate("el => { el.checked=false; }")

    if require_mix:
        assert await page.locator('#studio-quick-tools [data-tool="color-mix-brush"]').count() == 1, "Color-mixing brush tool is missing"
        assert await page.locator('[aria-label="Fading brush intensity"]').count() == 1, "Fading control is missing"
        assert await page.locator('#mix-brush-strength[aria-label="Color mixing strength"]').count() == 1, "Independent mixing-strength control is missing"

        await set_color(page, "#ff0000")
        assert await page.locator("#studio-quick-tools [data-tool=\"pencil\"]").get_attribute("aria-pressed") == "true", "Foreground color change did not restore Pencil"
        await click_cell(page, 8, 16)
        red_pixel = await read_pixel(page, 8, 16)
        assert red_pixel == [255, 0, 0], f"Pointer drawing did not place the first red pigment: {red_pixel}"
        await set_color(page, "#0000ff")
        await click_cell(page, 9, 16)
        blue_pixel = await read_pixel(page, 9, 16)
        assert blue_pixel == [0, 0, 255], f"Pointer drawing did not place the second blue pigment: {blue_pixel}"
        await set_color(page, "#00ff00")  # foreground color must not drive smudging
        await page.locator("#mix-brush-strength").evaluate("el => { el.value='100'; el.dispatchEvent(new Event('input',{bubbles:true})); }")
        await page.locator('#studio-quick-tools [data-tool="color-mix-brush"]').click()
        await drag_cells(page, (8, 16), (9, 16))
        mixed = await read_pixel(page, 9, 16)
        assert mixed[0] > 20 and mixed[2] > 20 and mixed[1] < 20, f"Brush did not mix the canvas pigments independently of foreground color: {mixed}"
        assert await read_pixel(page, 8, 16) == [255, 0, 0], "The source pigment changed unexpectedly"

        await page.locator("#undo").click()
        assert await read_pixel(page, 9, 16) == [0, 0, 255], "Undo did not restore the pre-smudge pixels"
        await page.locator("#redo").click()
        assert await read_pixel(page, 9, 16) == mixed, "Redo did not restore the color-mixed result"

        await page.locator("#tab-layers").click()
        lock = page.get_by_label("Lock Layer 1")
        await lock.check()
        assert await lock.is_checked(), "Layer lock control did not enter the locked state"
        await drag_cells(page, (8, 16), (9, 16))
        assert await read_pixel(page, 9, 16) == mixed, "Color-mixing brush changed a locked layer"
        await lock.uncheck()

    frame = await page.locator("#workspace-frame").bounding_box()
    canvas = await page.locator("#pixel-canvas").bounding_box()
    assert frame and canvas and frame["width"] > 0 and canvas["width"] > 0, "Responsive workspace or canvas has no measurable size"
    if viewport["width"] <= 600:
        assert canvas["width"] <= frame["width"] + 1, "Canvas exceeds the mobile workspace frame"
    assert not page_errors, f"Uncaught browser errors: {page_errors}"
    await context.close()


async def check_touch(browser, base_url):
    context = await browser.new_context(viewport={"width": 390, "height": 844}, device_scale_factor=2, has_touch=True, is_mobile=True)
    page = await context.new_page()
    response = await page.goto(urljoin(base_url.rstrip("/") + "/", "pixel-art-studio.html"), wait_until="domcontentloaded", timeout=60000)
    assert response and response.status == 200, "Touch context could not load the Studio page"
    await page.locator("#pixel-canvas").wait_for(state="visible", timeout=30000)
    await set_color(page, "#00ff00")
    point = await cell_point(page, 20, 20)
    await page.touchscreen.tap(point["x"], point["y"])
    assert await read_pixel(page, 20, 20) == [0, 255, 0], "Touch tap did not paint on the canvas"
    await context.close()


async def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--base-url", default="http://127.0.0.1:8765")
    parser.add_argument("--browser", choices=["chromium", "firefox", "webkit"], default="chromium")
    parser.add_argument("--require-mix", action="store_true")
    parser.add_argument("--live", action="store_true", help="Run against the public demo.")
    args = parser.parse_args()

    async with async_playwright() as p:
        browser_type = getattr(p, args.browser)
        browser = await browser_type.launch(headless=True)
        try:
            await check_entry_pages(browser, args.base_url, {"width": 1280, "height": 900})
            await check_studio(browser, args.base_url, {"width": 1280, "height": 900}, args.require_mix)
            await check_studio(browser, args.base_url, {"width": 390, "height": 844}, args.require_mix)
            if args.browser == "chromium" and not args.live:
                await check_touch(browser, args.base_url)
        finally:
            await browser.close()
    print(f"PASS: {args.browser} desktop/mobile smoke; color-mix={'PASS' if args.require_mix else 'not required'}; live={args.live}")


if __name__ == "__main__":
    asyncio.run(main())
