#!/usr/bin/env python3
"""Cross-browser Studio smoke and color-mixing interaction checks for CI."""
import argparse
import asyncio
import re
from urllib.parse import urljoin

from playwright.async_api import async_playwright


async def cell_point(page, x, y):
    await page.locator("#pixel-canvas").evaluate("el => el.scrollIntoView({block: 'center', inline: 'center'})")
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
    drawer = page.locator("#studio-tools-drawer")
    assert await drawer.locator("#studio-dock").count() == 1, "Advanced dock must live inside the collapsible tools drawer"
    assert await drawer.locator("#studio-properties-panel").count() == 1, "Properties / Settings panel is missing from the drawer"
    assert await drawer.locator("#studio-properties-panel #vector-mode").count() == 1, "Vector settings were not moved into Properties"
    assert await drawer.locator("#studio-properties-panel #import-resolution").count() == 1, "Import settings were not moved into Properties"
    assert await drawer.locator("#studio-properties-panel #image-width").count() == 1, "Canvas dimension controls were not moved into Properties"
    assert await drawer.locator("#studio-dock #palette").count() == 1, "Palette controls must remain in the dock"
    assert await drawer.locator("#studio-dock #adv-layers").count() == 1, "Layer controls must remain in the dock"
    assert await drawer.locator("#export-svg").count() == 1, "Legacy export controls must be preserved"
    tabs = page.locator("#studio-tabs [role=tab]")
    assert await tabs.count() == 8, "All eight advanced tool tabs must be preserved"
    for tab_index in range(await tabs.count()):
        tab = tabs.nth(tab_index)
        panel_id = await tab.get_attribute("aria-controls")
        assert panel_id, f"Advanced tab {tab_index} has no aria-controls relationship"
        assert await page.locator("#" + panel_id).count() == 1, f"Advanced panel {panel_id} is missing"
    await page.wait_for_function("() => { const c=document.querySelector('#pixel-canvas'); return c && c.width>0 && c.height>0 && c.getBoundingClientRect().width>0; }", timeout=30000)
    assert await page.locator('#studio-quick-tools [data-tool="fading-brush"]').count() == 1, "Fading must remain a separate tool"
    await page.locator("#show-grid").evaluate("el => { el.checked=false; el.dispatchEvent(new Event('change',{bubbles:true})); }")

    # Fill must paint a completely transparent canvas, preserve undo/redo, and explain no-op/locked states.
    await set_color(page, "#00ff00")
    fill_toggle = page.locator("#desktop-tools-toggle" if viewport["width"] > 700 else "#mobile-tools-toggle")
    await fill_toggle.click()
    await page.locator("#studio-dock").wait_for(state="visible", timeout=5000)
    body_text = await page.locator("body").inner_text()
    assert not re.search(r"[\u0600-\u06FF]", body_text), "Studio visible UI contains non-English Persian copy"
    quick_tools = page.locator("#studio-quick-tools [data-tool]")
    assert await quick_tools.count() >= 15, "The full quick-tool set is missing"
    for tool_index in range(await quick_tools.count()):
        tool_button = quick_tools.nth(tool_index)
        label = await tool_button.get_attribute("aria-label")
        title = await tool_button.get_attribute("title")
        assert label and re.match(r"^[A-Za-z]", label), f"Tool {tool_index} has no descriptive English accessible name: {label}"
        assert title and re.match(r"^[A-Za-z]", title), f"Tool {tool_index} has no English tooltip: {title}"
    expected_tabs = ["Color", "Layers", "Fill", "Transform", "Adjust", "Compose", "Advanced", "Export"]
    for tab_index, expected_label in enumerate(expected_tabs):
        actual_label = (await page.locator("#studio-tabs [role=tab]").nth(tab_index).inner_text()).strip()
        assert actual_label.endswith(expected_label), f"Tab {tab_index} label mismatch: {actual_label}"

    context = page.locator("#studio-brush")
    assert await context.is_visible(), "Active-tool options panel is missing"
    assert await page.locator("#studio-context-title").inner_text() == "Pencil"
    assert await page.locator("#brush-size").is_visible(), "Pencil must expose brush size"
    assert await page.locator("#adv-symmetry").is_visible(), "Paint tools must expose symmetry"
    assert await page.locator("#adv-bucket").is_hidden(), "Fill settings must stay hidden for Pencil"
    assert await page.locator("#mix-brush-strength").is_hidden(), "Mixing strength must stay hidden for Pencil"

    await page.locator('#studio-quick-tools ').locator('[data-tool="fill"]').click()
    assert await page.locator("#studio-context-title").inner_text() == "Fill"
    assert await page.locator("#adv-bucket").is_visible() and await page.locator("#adv-tol").is_visible(), "Fill must expose mode and tolerance"
    assert await page.locator("#brush-size").is_hidden(), "Fill must not show brush-only settings"

    await page.locator('#studio-quick-tools ').locator('[data-tool="fading-brush"]').click()
    assert await page.locator("#studio-context-title").inner_text() == "Fading brush"
    assert await page.get_by_label("Fading brush intensity").is_visible(), "Fading Brush must expose intensity"
    assert await page.locator("#mix-brush-strength").is_hidden(), "Fading Brush must hide mixing strength"

    await page.locator('#studio-quick-tools ').locator('[data-tool="color-mix-brush"]').click()
    assert await page.locator("#mix-brush-strength").is_visible(), "Color-Mixing Brush must expose strength"
    assert await page.get_by_label("Fading brush intensity").is_hidden(), "Color-Mixing Brush must hide fading intensity"

    await page.locator('#studio-quick-tools ').locator('[data-tool="texture"]').click()
    assert await page.locator("#pro-texture").is_visible() and await page.locator("#pro-texture-density").is_visible(), "Texture Brush must expose texture type and density"
    assert await page.locator("#pro-brush-shape").is_visible(), "Texture Brush must expose brush shape"

    await page.locator('#studio-quick-tools ').locator('[data-tool="gradient"]').click()
    assert await page.locator("#pro-gradient-mode").is_visible() and await page.locator("#pro-gradient-color").is_visible(), "Gradient must expose mode and end color"
    assert await page.locator("#adv-bucket").is_hidden(), "Gradient must not show Fill settings"

    await page.locator('#studio-quick-tools ').locator('[data-tool="select-rect"]').click()
    assert await page.locator("#pro-select-all").is_visible() and await page.locator("#pro-scale-x").is_visible(), "Selection tools must expose selection actions and scale"

    await page.locator('#studio-quick-tools ').locator('[data-tool="bezier"]').click()
    assert await page.locator("#pro-curve").is_visible(), "Bezier must expose curve tension"

    await page.locator('#studio-quick-tools ').locator('[data-tool="picker"]').click()
    assert await page.locator("#studio-context-title").inner_text() == "Eyedropper"
    assert await page.locator("#brush-size").is_hidden(), "Eyedropper must not show unrelated brush controls"

    await page.locator('#studio-quick-tools ').locator('[data-tool="fill"]').click()
    assert await page.locator("#adv-bucket").is_visible(), "Fill settings must return when Fill is reselected"
    await fill_toggle.click()
    before_fill = await read_pixel(page, 0, 0)
    await click_cell(page, 0, 0)
    assert await read_pixel(page, 0, 0) == [0, 255, 0], "Fill did not color the clicked transparent pixel"
    assert await read_pixel(page, 31, 31) == [0, 255, 0], "Fill did not cover the connected transparent canvas"
    await fill_toggle.click()
    fill_button = page.locator('#studio-quick-tools [data-tool="fill"]')
    assert await fill_button.get_attribute("aria-pressed") == "true", "Fill tool lost its active state after the first fill"
    await fill_button.click()  # Explicitly reselect before verifying same-color no-op behavior.
    await fill_toggle.click()
    await click_cell(page, 31, 31)
    status = await page.locator("#studio-status").text_content()
    assert "already uses the selected color" in (status or ""), f"Same-color Fill did not explain its no-op: {status}"
    await page.locator("#undo").click()
    after_undo = await read_pixel(page, 0, 0)
    assert after_undo == before_fill, f"One Undo did not restore the pre-Fill transparent canvas: before={before_fill}, after={after_undo}"
    await page.locator("#redo").click()
    assert await read_pixel(page, 31, 31) == [0, 255, 0], "Redo did not restore the full-canvas Fill"

    # A locked active layer must not be modified by Fill.
    await page.locator("#undo").click()
    await fill_toggle.click()
    await page.locator('#studio-quick-tools [data-tool="fill"]').click()
    await page.locator("#tab-layers").click()
    lock = page.get_by_label("Lock Layer 1")
    await lock.check()
    await fill_toggle.click()
    await click_cell(page, 0, 0)
    locked_pixel = await read_pixel(page, 0, 0)
    status = await page.locator("#studio-status").text_content()
    assert locked_pixel == before_fill, "Fill changed a locked layer"
    assert "Layer is locked" in (status or ""), f"Locked Fill did not explain why it stopped: {status}"
    await fill_toggle.click()
    await page.locator("#tab-layers").click()
    await lock.uncheck()
    await fill_toggle.click()

    if require_mix:
        mix_drawer_toggle = page.locator("#desktop-tools-toggle" if viewport["width"] > 700 else "#mobile-tools-toggle")
        await mix_drawer_toggle.click()
        await page.locator("#studio-dock").wait_for(state="visible", timeout=5000)
        assert await page.locator('#studio-quick-tools [data-tool="color-mix-brush"]').count() == 1, "Color-mixing brush tool is missing"
        assert await page.locator('[aria-label="Fading brush intensity"]').count() == 1, "Fading control is missing"
        assert await page.locator('#mix-brush-strength[aria-label="Color mixing strength"]').count() == 1, "Independent mixing-strength control is missing"

        await set_color(page, "#ff0000")
        assert await page.locator("#studio-quick-tools [data-tool=\"pencil\"]").get_attribute("aria-pressed") == "true", "Foreground color change did not restore Pencil"
        await mix_drawer_toggle.click()
        await page.wait_for_function("() => getComputedStyle(document.querySelector('#studio-tools-drawer')).visibility === 'hidden'", timeout=3000)
        await click_cell(page, 8, 16)
        red_pixel = await read_pixel(page, 8, 16)
        assert red_pixel == [255, 0, 0], f"Pointer drawing did not place the first red pigment: {red_pixel}"
        await set_color(page, "#0000ff")
        await click_cell(page, 9, 16)
        blue_pixel = await read_pixel(page, 9, 16)
        assert blue_pixel == [0, 0, 255], f"Pointer drawing did not place the second blue pigment: {blue_pixel}"
        # Canvas interaction intentionally dismisses the drawer; reopen it before changing dock controls.
        await mix_drawer_toggle.click()
        await page.locator("#studio-dock").wait_for(state="visible", timeout=5000)
        await set_color(page, "#00ff00")  # foreground color must not drive smudging
        await page.locator("#mix-brush-strength").evaluate("el => { el.value='100'; el.dispatchEvent(new Event('input',{bubbles:true})); }")
        await page.locator('#studio-quick-tools [data-tool="color-mix-brush"]').click()
        await mix_drawer_toggle.click()
        await page.wait_for_function("() => getComputedStyle(document.querySelector('#studio-tools-drawer')).visibility === 'hidden'", timeout=3000)
        await drag_cells(page, (8, 16), (9, 16))
        mixed = await read_pixel(page, 9, 16)
        assert mixed[0] > 20 and mixed[2] > 20 and mixed[1] < 20, f"Brush did not mix the canvas pigments independently of foreground color: {mixed}"
        assert await read_pixel(page, 8, 16) == [255, 0, 0], "The source pigment changed unexpectedly"

        await page.locator("#undo").click()
        assert await read_pixel(page, 9, 16) == [0, 0, 255], "Undo did not restore the pre-smudge pixels"
        await page.locator("#redo").click()
        assert await read_pixel(page, 9, 16) == mixed, "Redo did not restore the color-mixed result"

        await mix_drawer_toggle.click()
        await page.locator("#studio-dock").wait_for(state="visible", timeout=5000)
        await page.locator("#tab-layers").click()
        lock = page.get_by_label("Lock Layer 1")
        await lock.check()
        assert await lock.is_checked(), "Layer lock control did not enter the locked state"
        await mix_drawer_toggle.click()
        await page.wait_for_function("() => getComputedStyle(document.querySelector('#studio-tools-drawer')).visibility === 'hidden'", timeout=3000)
        await drag_cells(page, (8, 16), (9, 16))
        assert await read_pixel(page, 9, 16) == mixed, "Color-mixing brush changed a locked layer"
        await mix_drawer_toggle.click()
        await page.locator("#studio-dock").wait_for(state="visible", timeout=5000)
        await lock.uncheck()
        await mix_drawer_toggle.click()
        await page.wait_for_function("() => getComputedStyle(document.querySelector('#studio-tools-drawer')).visibility === 'hidden'", timeout=3000)

    frame = await page.locator("#workspace-frame").bounding_box()
    canvas = await page.locator("#pixel-canvas").bounding_box()
    assert frame and canvas and frame["width"] > 0 and canvas["width"] > 0, "Responsive workspace or canvas has no measurable size"
    if viewport["width"] > 700:
        rail = page.locator("#desktop-workspace-rail")
        toggle = page.locator("#desktop-tools-toggle")
        assert await rail.is_visible(), "Desktop edge rail is not visible"
        assert await toggle.get_attribute("aria-expanded") == "false", "Desktop tools drawer should start collapsed"
        await toggle.click()
        assert await toggle.get_attribute("aria-expanded") == "true", "Desktop tools drawer did not open accessibly"
        assert await page.locator("#studio-tools-drawer").get_attribute("data-workspace-drawer-state") == "open", "Desktop drawer controller did not set its open state"
        # The drawer intentionally transitions visibility/transform over 200 ms.
        # Poll the rendered state instead of sampling visibility in the same task
        # as the click; also prove the drawer has real dimensions and is on-screen.
        await page.wait_for_function(
            """() => {
                const drawer = document.querySelector("#studio-tools-drawer");
                if (!drawer) return false;
                const style = getComputedStyle(drawer);
                const rect = drawer.getBoundingClientRect();
                const transform = new DOMMatrixReadOnly(style.transform);
                return document.body.classList.contains("nu-desktop-tools-open")
                    && drawer.dataset.workspaceDrawerState === "open"
                    && style.display !== "none"
                    && style.visibility === "visible"
                    && style.pointerEvents === "auto"
                    && rect.width > 0 && rect.height > 0
                    && rect.left >= 0 && rect.right <= window.innerWidth
                    && Math.abs(transform.m41) < 1;
            }""",
            timeout=3000,
        )
        drawer_metrics = await page.locator("#studio-tools-drawer").evaluate(
            """el => {
                const style = getComputedStyle(el);
                const rect = el.getBoundingClientRect();
                return {
                    display: style.display,
                    visibility: style.visibility,
                    transform: style.transform,
                    width: rect.width,
                    height: rect.height,
                    left: rect.left,
                    right: rect.right,
                    state: el.dataset.workspaceDrawerState
                };
            }"""
        )
        tabs = page.locator("#studio-tabs [role=tab]")
        for tab_index in range(await tabs.count()):
            tab = tabs.nth(tab_index)
            panel_id = await tab.get_attribute("aria-controls")
            await tab.click()
            assert await page.locator("#" + panel_id).is_visible(), f"Advanced panel {panel_id} did not become visible"
        await page.locator("#tab-palette").click()
        print(f"Desktop drawer open computed metrics: {drawer_metrics}")
        assert await page.locator("#studio-tools-drawer").is_visible(), (
            f"Desktop tools drawer did not render visibly: {drawer_metrics}"
        )
        canvas_box = await page.locator("#pixel-canvas").bounding_box()
        assert canvas_box, "Canvas has no bounds while desktop drawer is open"
        probe = await page.evaluate("""(r) => {
          const x0=Math.max(1,r.x), y0=Math.max(1,r.y);
          const x1=Math.min(window.innerWidth-1,r.x+r.width), y1=Math.min(window.innerHeight-1,r.y+r.height);
          if(x1<=x0||y1<=y0)return null;
          const x=(x0+x1)/2,y=(y0+y1)/2,el=document.elementFromPoint(x,y);
          return {x,y,id:el?.id||null,tag:el?.tagName||null};
        }""", canvas_box)
        assert probe, "Canvas has no visible area in the desktop viewport"
        assert probe["id"] == "pixel-canvas", f"Desktop drawer blocks visible canvas area: {probe}"
        await toggle.click()
        assert await toggle.get_attribute("aria-expanded") == "false", "Desktop tools drawer did not close"
        await page.wait_for_function(
            """() => {
                const drawer = document.querySelector("#studio-tools-drawer");
                if (!drawer) return false;
                const style = getComputedStyle(drawer);
                const rect = drawer.getBoundingClientRect();
                const transform = new DOMMatrixReadOnly(style.transform);
                return !document.body.classList.contains("nu-desktop-tools-open")
                    && drawer.dataset.workspaceDrawerState === "closed"
                    && style.display !== "none"
                    && style.visibility === "hidden"
                    && style.pointerEvents === "none"
                    && rect.width > 0 && rect.height > 0
                    && transform.m41 > rect.width;
            }""",
            timeout=3000,
        )
    if viewport["width"] <= 600:
        assert canvas["width"] <= frame["width"] + 1, "Canvas exceeds the mobile workspace frame"
        assert canvas["x"] >= 0 and canvas["x"] + canvas["width"] <= viewport["width"] + 1, f"Canvas exceeds mobile viewport width: {canvas}"
        dock = page.locator("#mobile-workspace-dock")
        assert await dock.is_visible(), "Mobile workspace dock is not visible"
        await page.locator("#mobile-tools-toggle").click()
        assert await page.locator("#mobile-tools-toggle").get_attribute("aria-expanded") == "true", "Tools drawer did not open accessibly"
        assert await page.locator("#studio-tools-drawer").is_visible(), "Mobile tools drawer did not open"
        await page.locator("#mobile-tools-toggle").click()
        assert await page.locator("#mobile-tools-toggle").get_attribute("aria-expanded") == "false", "Tools drawer did not close"
        await page.locator("#mobile-zoom-in").click()
        assert await page.locator("#workspace-zoom").input_value() == "125", "Mobile zoom-in control did not update the shared zoom state"
        await page.locator("#mobile-view-rotation").evaluate("el => { el.value='45'; el.dispatchEvent(new Event('input',{bubbles:true})); }")
        assert "rotate(45deg)" in (await page.locator("#pixel-canvas").get_attribute("style") or ""), "Viewport rotation control did not rotate the view"
        assert await page.locator("html").get_attribute("data-nu-orientation") in ("portrait","landscape-left","landscape-right"), "Orientation adaptation state is missing"
        await page.locator("#mobile-view-reset").click()
        assert "rotate(0deg)" in (await page.locator("#pixel-canvas").get_attribute("style") or ""), "Viewport reset did not return to zero degrees"
    assert not page_errors, f"Uncaught browser errors: {page_errors}"
    await context.close()


async def check_touch(browser, base_url):
    context = await browser.new_context(viewport={"width": 390, "height": 844}, device_scale_factor=2, has_touch=True, is_mobile=True)
    page = await context.new_page()
    response = await page.goto(urljoin(base_url.rstrip("/") + "/", "pixel-art-studio.html"), wait_until="domcontentloaded", timeout=60000)
    assert response and response.status == 200, "Touch context could not load the Studio page"
    await page.locator("#pixel-canvas").wait_for(state="visible", timeout=30000)
    await set_color(page, "#00ff00")
    await page.locator("#show-grid").evaluate("el => { el.checked=false; }")
    await page.evaluate("() => { const stage=document.querySelector(\".stage\"); const top=window.scrollY+stage.getBoundingClientRect().top-72; window.scrollTo(0,Math.max(0,top)); }")
    await page.locator("#pixel-canvas").scroll_into_view_if_needed()
    await page.evaluate("() => { window.__nuTouchProbe={pointer:0,touch:0}; const c=document.querySelector(\"#pixel-canvas\"); c.addEventListener(\"pointerdown\",()=>window.__nuTouchProbe.pointer++); c.addEventListener(\"touchstart\",()=>window.__nuTouchProbe.touch++); }")
    box = await page.locator("#pixel-canvas").bounding_box()
    assert box and box["width"] > 0 and box["height"] > 0, "Touch canvas has no measurable bounds"
    assert 0 <= box["x"] and box["x"] + box["width"] <= 390, f"Touch canvas exceeds mobile viewport width: {box}"
    assert 0 <= box["y"] < 844 and box["y"] + box["height"] <= 844, f"Touch canvas is not inside the mobile viewport: {box}"
    await page.locator("#pixel-canvas").tap(position={"x": 20.5 * box["width"] / 32, "y": 20.5 * box["height"] / 32})
    probe = await page.evaluate("() => ({...window.__nuTouchProbe,tool:document.querySelector(\"#studio-quick-tools [data-tool=\\\"pencil\\\"]\")?.getAttribute(\"aria-pressed\"),status:document.querySelector(\"#studio-status\")?.textContent})")
    pixel = await read_pixel(page, 20, 20)
    assert probe["pointer"] >= 1 and probe["touch"] >= 1, f"Touch input did not dispatch pointer/touch events: {probe}"
    assert pixel == [0, 255, 0], f"Touch tap did not paint on the canvas: {pixel}"
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
