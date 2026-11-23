"use strict";

import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const { chromium, firefox, webkit } = require("playwright");

const browserName = process.env.STUDIO_BASELINE_BROWSER || "chromium";
const outputRoot = process.env.STUDIO_BASELINE_OUTPUT || path.join("artifacts", "studio-live-baseline", browserName);
const browserType = ({ chromium, firefox, webkit })[browserName];
if (!browserType) throw new Error("Unsupported browser: " + browserName);
fs.mkdirSync(outputRoot, { recursive: true });

const targets = [
  { id: "library", url: "https://mobinabinshun-beep.github.io/mobinabinshun-beep/index.html#library-section" },
  { id: "pixel-art-studio", url: "https://mobinabinshun-beep.github.io/mobinabinshun-beep/pixel-art-studio.html" }
];
const viewports = [
  { id: "desktop-1440x900", width: 1440, height: 900, touch: false },
  { id: "mobile-portrait-390x844", width: 390, height: 844, touch: true },
  { id: "mobile-landscape-844x390", width: 844, height: 390, touch: true }
];

(async () => {
  const browser = await browserType.launch({ headless: true });
  const results = [];
  let failed = false;

  try {
    for (const viewport of viewports) {
      const context = await browser.newContext({
        viewport: { width: viewport.width, height: viewport.height },
        hasTouch: viewport.touch && browserName !== "firefox",
        isMobile: viewport.touch && (browserName === "chromium" || browserName === "webkit")
      });

      for (const target of targets) {
        const page = await context.newPage();
        const pageErrors = [];
        const consoleErrors = [];
        const requestFailures = [];
        page.on("pageerror", error => pageErrors.push(String(error)));
        page.on("console", message => {
          if (message.type() === "error") consoleErrors.push(message.text());
        });
        page.on("requestfailed", request => requestFailures.push({
          url: request.url(),
          error: request.failure()?.errorText || "unknown"
        }));

        const record = {
          browser: browserName,
          target: target.id,
          url: target.url,
          viewport,
          capturedAt: new Date().toISOString()
        };

        try {
          const response = await page.goto(target.url, { waitUntil: "domcontentloaded", timeout: 60000 });
          await page.waitForLoadState("load", { timeout: 30000 }).catch(() => {});
          await page.waitForTimeout(1200);

          const body = response ? await response.body().catch(() => Buffer.from("")) : Buffer.from("");
          const dom = await page.content().catch(() => "");
          const observed = await page.evaluate(() => ({
            title: document.title,
            readyState: document.readyState,
            href: location.href,
            viewport: { width: innerWidth, height: innerHeight, dpr: devicePixelRatio },
            canvasCount: document.querySelectorAll("canvas").length,
            buttonCount: document.querySelectorAll("button,[role=button]").length,
            linkCount: document.querySelectorAll("a[href]").length,
            librarySectionPresent: Boolean(document.querySelector("#library-section")),
            studioCandidateText: document.body?.innerText?.includes("TEST CANDIDATE") || false
          }));

          record.httpStatus = response?.status() ?? null;
          record.responseHeaders = response ? await response.allHeaders() : {};
          record.responseBodySha256 = crypto.createHash("sha256").update(body).digest("hex");
          record.responseBodyBytes = body.length;
          record.observed = observed;
          record.pageErrors = pageErrors;
          record.consoleErrors = consoleErrors;
          record.requestFailures = requestFailures;

          const stem = target.id + "__" + viewport.id;
          fs.writeFileSync(path.join(outputRoot, stem + ".response.html"), body);
          fs.writeFileSync(path.join(outputRoot, stem + ".dom.html"), dom);
          await page.screenshot({ path: path.join(outputRoot, stem + ".png"), fullPage: true }).catch(error => {
            record.screenshotError = String(error);
          });

          if (!response || response.status() < 200 || response.status() >= 400) failed = true;
          if (target.id === "pixel-art-studio" && observed.canvasCount < 1) failed = true;
        } catch (error) {
          record.navigationError = String(error);
          record.pageErrors = pageErrors;
          record.consoleErrors = consoleErrors;
          record.requestFailures = requestFailures;
          failed = true;
        }

        results.push(record);
        fs.writeFileSync(path.join(outputRoot, target.id + "__" + viewport.id + ".json"), JSON.stringify(record, null, 2));
        await page.close();
      }
      await context.close();
    }
  } finally {
    await browser.close();
  }

  const summary = {
    browser: browserName,
    capturedAt: new Date().toISOString(),
    targetCount: targets.length,
    viewportCount: viewports.length,
    runCount: results.length,
    navigationAndCanvasGate: failed ? "FAIL" : "PASS",
    note: "Automated browser/viewport evidence only. Emulated mobile viewport is not a physical-device test. Console/page errors and failed requests are recorded, not silently discarded.",
    results
  };
  fs.writeFileSync(path.join(outputRoot, "summary.json"), JSON.stringify(summary, null, 2));
  if (failed) process.exitCode = 1;
})().catch(error => {
  fs.mkdirSync(outputRoot, { recursive: true });
  fs.writeFileSync(path.join(outputRoot, "fatal-error.txt"), String(error?.stack || error));
  console.error(error);
  process.exitCode = 1;
});
