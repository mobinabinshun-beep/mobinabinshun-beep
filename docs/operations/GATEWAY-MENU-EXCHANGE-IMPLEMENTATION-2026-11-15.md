# پیاده‌سازی قرارداد جدید Gateway، منوی مرکزی و سیاست Exchange

**شناسه:** NU-G1-GATEWAY-MENU-EXCHANGE-2026-11-15  
**نسخه:** 1.0  
**وضعیت:** CANDIDATE — شاخهٔ کاندید؛ CI و آزمون انسانی در انتظار  
**تاریخ:** 2026-11-15  
**مخزن:** mobinabinshun-beep/mobinabinshun-beep

## 1. درخواست مالک

مالک تعریف قبلی Gateway را اصلاح و این الزامات را برای اجرا تعیین کرد:

1. هدف Gateway خلوت‌کردن فضای عملیاتی و جایگزینی کلیک‌های ناوبری پراکنده با یک درگاه واحد است.
2. Gateway سه فرمان عملیاتی دارد: **Back، Menu، Profile**.
3. بازشدن Gateway باید راند و تمام رندرهای پس‌زمینه را تا تصمیم کاربر متوقف کند.
4. هر فرمان Gateway با یک کلیک/لمس اجرا شود؛ تأیید دوم و فعال‌سازی خودکار با hover حذف شود.
5. در صفحهٔ بازی، دکمه‌های ناوبری تکراری از مدار نمایش/تعامل خارج شوند و همان مسیرها از Gateway در دسترس باشند.
6. منو یک پنجرهٔ مرکزیِ فهرست ماژول‌هاست؛ فقط عنوان کوتاه و نشان صفحه‌کلیدمحور هر ماژول را نمایش می‌دهد. محتوای ماژول در مقصد خودش می‌ماند.
7. ترتیب منو: Store، Profile، Exchange، Wallet؛ سپس بازی‌ها: Painting، Random Game، Bubble Hunt، Mana Collector، Chaos Attack.
8. Random Game فقط از سه بازی اصلی انتخاب تصادفی می‌کند؛ Painting بخشی از random pool نیست.
9. دارایی‌های خریداری‌شده از Store در Exchange قابل چنج نیستند و باید از انتخاب‌گرها، نمودار موجودی و شبیه‌ساز بازار Exchange خارج بمانند.
10. Gatewayهای مشابه برای سایر بخش‌ها در آینده ممکن‌اند، اما با مجوز و سطح دسترسی جداگانه؛ اکنون فقط بخش بازی‌ها در دامنه است.

## 2. دامنه و عدم‌دامنه

### در دامنهٔ این تغییر
- Gateway در صفحهٔ بازی اصلی Generation 1.
- منوی مرکزی در index.html.
- ترتیب فهرست بازی‌ها در کتابخانهٔ صفحهٔ اصلی.
- توقف/ازسرگیری رندرهای پس‌زمینهٔ موجود در حالت Gateway.
- تشخیص دارایی‌های خریداری‌شده و جلوگیری از نمایش/چنج آن‌ها در Exchange.
- تست‌های مرتبط، مانیفست و مستندات.

### خارج از دامنه
- فعال‌کردن Gateway در Casino، Launcher، Creative Studio، Pixel Art Studio، Wallet یا Exchange.
- ساخت Gateway برای سایر صفحات.
- تغییر قوانین بازی، مقادیر XP/Mana/HP یا ساختارهای موجود ذخیره‌سازی؛ تنها یک فهرست افزایشی و پایدار `nonExchangeableAssets` برای دارایی‌های غیرقابل‌چنج به save افزوده شده است.
- تغییر HUD کلاسیک LV/XP/Mana؛ این ناحیه طبق LOCKED-AREAS همچنان قفل است.
- تبدیل Painting به بازی تصادفی؛ Painting به‌عنوان ماژول هنری مستقل به Pixel Art Studio متصل می‌شود.
- تغییر محتوای صفحات مقصد یا انتقال کد آن‌ها به داخل منو.

## 3. تصمیم‌های اجرایی

### 3.1 Gateway
- گزینه‌ها به Back، Menu و Profile محدود شدند.
- فعال‌سازی گزینه با یک کلیک ماوس، لمس یا Enter انجام می‌شود.
- hover فقط برای مشخص‌کردن گزینه است و به‌تنهایی فرمان را اجرا نمی‌کند.
- هنگام بازشدن، کنترل Pause موجود راند را متوقف می‌کند؛ اگر راند پیش‌تر توسط بازیکن Pause شده باشد، Gateway آن را به‌اشتباه Resume نمی‌کند.
- رویداد Gateway، رندر اصلی، Pixel World، لایه‌های پویا و Background Engine را متوقف می‌کند.
- هنگام انتخاب Menu یا Profile، وضعیت مکث حفظ می‌شود تا منو/پروفایل باز شود؛ با بستن بدون انتخاب یا بازگشت از Profile، وضعیت قبلی بازی بازیابی می‌شود.
- دکمه‌های تکراری Menu و Back در قاب بازی مخفی می‌شوند؛ کنترل Pause/Resume و کنترل‌های واقعی بازی حذف نمی‌شوند.

### 3.2 منوی مرکزی
- منو به پنجره‌ای مرکزی و واکنش‌گرا تبدیل شد.
- توضیح‌ها و زیرعنوان‌های غیرضروری از آیتم‌ها حذف شدند.
- هر آیتم فقط عنوان و keycap دارد.
- گروه Player بالاتر از Games قرار دارد.
- ترتیب Player: Store، Profile، Exchange، Wallet.
- ترتیب Games: Painting، Random Game، Bubble Hunt، Mana Collector، Chaos Attack.
- محتوای Store/Profile/Wallet در viewهای موجود باقی می‌ماند؛ Exchange و Painting به صفحه‌های موجود خودشان هدایت می‌شوند.
- Random Game به‌صورت تصادفی فقط از سه بازی Bubble Hunt، Mana Collector و Chaos Attack انتخاب می‌کند.

### 3.3 توقف پس‌زمینه
در حالت Gateway، موارد زیر متوقف می‌شوند:
- راند بازی و حلقهٔ انیمیشن بازی.
- N.U Background Engine.
- N.U Dynamic Layers.
- N.U Pixel World.

لایهٔ blur فقط روی پس‌زمینه‌های تزئینی اعمال می‌شود؛ HUD و محتوای پیش‌زمینه تار یا غیرفعال نمی‌شوند. هنگام بازشدن منوی مرکزی از داخل Gateway، حالت توقف حفظ می‌شود تا کاربر مقصد را انتخاب کند.

### 3.4 دارایی‌های Store و Exchange
- در هر تراکنش خرید، کلید دارایی دریافت‌شده به‌عنوان غیرقابل‌چنج ثبت و در فیلد پایدار save نگهداری می‌شود.
- کلید دارایی‌های خریداری‌شده در فیلد پایدار `nonExchangeableAssets` ذخیره می‌شود تا با چرخش تاریخچهٔ محدود 24 تراکنشی از بین نرود. برای سازگاری با ذخیره‌های قدیمی، هر تراکنش تاریخی با kind برابر purchase و delta مثبت نیز تا زمانی که در تاریخچه وجود دارد به‌عنوان نشانهٔ غیرقابل‌چنج‌بودن استفاده می‌شود.
- API جدید `NUWallet.exchangeAssetRows` فقط دارایی‌های واجد شرایط را به Exchange می‌دهد.
- Exchange از این API برای انتخاب‌گر و نمودار تاریخچه استفاده می‌کند.
- شبیه‌ساز بازار مجازی نیز دارایی‌های خریداری‌شده را از فهرست و build حذف می‌کند.
- کلید کش Exchange به v3 تغییر کرد تا دادهٔ کش‌شدهٔ قبلی که ممکن است دارایی خریداری‌شده را نمایش دهد، دوباره استفاده نشود.
- خود دارایی خریداری‌شده همچنان در Wallet و موجودی بازیکن باقی می‌ماند؛ فقط قابلیت چنج/نمایش معاملاتی آن محدود می‌شود. این نشان پایدار است و به حضور تراکنش خرید در پنجرهٔ 24تایی وابسته نیست. هزینهٔ خرید (مثلاً XP) همچنان در تاریخچه ثبت می‌شود.

## 4. فایل‌های تغییرکرده

### کد و UI
- `index.html` — منوی مرکزی، ترتیب ماژول‌ها، سه گزینهٔ Gateway و نسخه‌های cache.
- `nu-hex-gateway.js` — Back/Menu/Profile، اجرای یک‌کلیکی و حفظ مکث در مسیر منو/پروفایل.
- `nu-hex-gateway.css` — مخفی‌کردن کلیک‌های ناوبری تکراری هنگام بازی.
- `nu-world.css` — چیدمان منوی مرکزی، فهرست ساده و keycapها.
- `nu-games.js` — فریز/ازسرگیری رندرها، انتقال امن viewها، ترتیب کتابخانه و Random Game.
- `nu-graphics-runtime.js` — هماهنگی freeze برای Background Engine، Dynamic Layers و Pixel World در حالت‌های modal.
- `nu-wallet.js` — ثبت دارایی‌های غیرقابل‌چنج خریداری‌شده و API فیلتر Exchange.
- `nu-exchange.js` — استفاده از فهرست فیلترشده در refresh/replay و کش v3.
- `nu-exchange-replay.js` و `nu-exchange.css` — حفظ برچسب‌های بدون عدد و کنترل‌های نمودار نسخهٔ عمومی جدید.
- `exchange.html` — نسخه‌های cache مربوط به Wallet و Exchange.
- `nu-market-sim.js` — حذف دارایی خریداری‌شده از انتخاب‌گر و شبیه‌ساز بازار.

### تست‌ها
- `tests/nu-hex-gateway.test.js`
- `tests/nu-wallet.test.js`
- `tests/nu-exchange-runtime.test.js`
- `tests/nu-market-sim.test.js`
- `tests/nu-hp-pill-interaction.test.js` و `tests/nu-world-entry-calibration.test.js` — همگام‌سازی assertionهای نسخهٔ cache باندل پس از تغییر نام نسخهٔ nu-games.

### پیکربندی و مستندات
- `NU-GENERATION-1-MANIFEST.json`
- `docs/operations/NU-OPS-IMPLEMENT-01.md` — به‌روزرسانی قفل Gateway با قرارداد جدید مالک.
- `docs/operations/NU-EXCHANGE-CHART-CONTROLS-2026-11-15.md` — حفظ سند کنترل‌های نمودار Exchange نسخهٔ عمومی.
- `README.md` — فهرست‌کردن قرارداد اجرایی جدید.
- این گزارش اجرایی.

## 5. بکاپ، شاخه‌ها و آرشیو

- SHA دقیق مبنای بررسی: `471dadbd9c795465c27b386137eefab4c9668b10`
- شاخهٔ بکاپ کاندید قبلی: `backup/pre-gateway-menu-exchange-2026-11-15` (مبنای اولیهٔ `471dadbd9c795465c27b386137eefab4c9668b10`).
- شاخهٔ بکاپ آخرین نسخهٔ عمومی پیش از ادغام: `backup/pre-gateway-menu-exchange-mainline-2026-11-15` (SHA: `d52a38074b19260c677379344e52042279239015`).
- شاخهٔ کاندید نهایی: `feature/gateway-menu-exchange-2026-11-15`.
- آخرین commit عمومی Exchange با حفظ کنترل‌های نمودار (zoom، grid، wick، volume، moving average، theme، palette و parametric bands) به‌عنوان parent دوم ادغام شد: `ebbd1c031d223ef173cda9ee8ad3c0bf11c0999b`.
- شاخهٔ پیش‌فرض دست‌کاری نشده است؛ تغییرات روی شاخهٔ کاندید انجام شده‌اند.
- snapshot فایل‌های اصلی و تست‌های پیش از تغییر در مسیر زیر نگهداری می‌شوند:
  `archive/pre-change/2026-11-15/gateway-menu-exchange/`
- snapshot فایل‌های نسخهٔ عمومی جدیدتر Exchange پیش از ادغام در مسیر زیر نگهداری می‌شوند:
  `archive/latest-default-before-merge/2026-11-15/`
- snapshotها شامل index، Gateway JS/CSS، nu-world.css، nu-games، wallet، exchange، exchange.html، market simulator، graphics runtime، README، پروتکل اجرایی، تست‌های Gateway/Wallet/Exchange/Market و Generation 1 manifest هستند؛ snapshot آزمون world-entry نیز پس از کشف وابستگی نسخه‌ای اضافه شد. مجموعهٔ latest-default-before-merge نیز نسخهٔ جدید Exchange، replay، CSS، manifest، مستندات و تست‌های آن را ثبت می‌کند.
- شاخهٔ قبلی `feature/gateway-main-game-focused-2026-11-15` دست‌نخورده باقی مانده است.

## 6. آزمون و وضعیت پذیرش

### پوشش تستی افزوده/به‌روزشده
- محدودبودن Gateway به بازی فعال.
- دقیقاً سه فرمان Back/Menu/Profile.
- اجرای یک‌کلیکی و حذف تأیید دوم.
- فریز راند و تمام رندرهای پس‌زمینه.
- حفظ مکث هنگام انتقال به Menu/Profile.
- ترتیب Player modules و Games.
- نمایش عنوان و keycap بدون توضیحات اضافی.
- ترتیب Painting سپس Random Game و انتخاب تصادفی فقط از سه بازی.
- حذف دارایی خریداری‌شده از Exchange و market simulation.
- حفظ دارایی خریداری‌شده در Wallet.

### وضعیت فعلی — آخرین CI برای SHA `6b48b6813903c263b6091cfc959124abefaf9354`

| Workflow | نتیجه |
|---|---|
| Gateway main-game regression | PASS |
| Generation 1 HUD layout regression | PASS |
| Graphics integrity | PASS |
| Graphics preview smoke checks | PASS |
| Wallet/Profile regression | FAIL — دو assertion مربوط به preview عکس پروفایل |
| Studio export regression gates | FAIL — همان دو assertion مربوط به preview عکس پروفایل |

دو شکست باقی‌مانده به قابلیت Gateway یا Exchange مربوط نیستند: تست‌های `nu-profile-preview.test.js` انتظار یک ورودی فایل و هشت گزینهٔ جایگاه عکس را دارند، درحالی‌که این عناصر در `index.html` نسخهٔ عمومیِ مبنا نیز وجود ندارند. بخش Profile در این تغییر بازنویسی نشده است؛ بنابراین این دو مورد خارج از دامنه باقی مانده‌اند و برای رفع آن‌ها مجوز تغییر Profile لازم است.

- JavaScript و فایل‌های تست از نظر syntax: PASS.
- منطق کیف پول و بازار به‌صورت مستقیم بررسی شد: دارایی خریداری‌شده در Wallet باقی می‌ماند، در Exchange و بازار نمایش داده نمی‌شود و پس از عبور از 24 تراکنش نیز مستثنا می‌ماند: PASS.
- برچسب‌های replay بدون عدد و کنترل‌های جدید نمودار Exchange حفظ شده‌اند: PASS.
- PR #114 باز و mergeable است؛ merge انجام نشده است.
- آزمون مرورگر واقعی، ماوس، لمس، صفحه‌کلید و اندازه‌های واکنش‌گرا هنوز انجام نشده است.
- Human QA: PENDING.
- Merge: NOT PERFORMED.
- Deployment: NOT PERFORMED.

دو شکست Profile عمداً در این تغییر اصلاح نشده‌اند تا بدون مجوز، دامنهٔ Profile گسترش پیدا نکند.

## 7. معیار پذیرش نهایی

- [ ] در صفحهٔ بازی فقط Gateway نقطهٔ ناوبری باشد؛ دکمه‌های Menu/Back تکراری مخفی باشند.
- [ ] Gateway سه فرمان Back، Menu، Profile داشته باشد.
- [ ] هر فرمان با یک کلیک/لمس فعال شود.
- [ ] بازشدن Gateway راند و تمام رندرهای پس‌زمینه را متوقف کند.
- [ ] انتخاب Menu یا Profile تا زمان تصمیم کاربر، مکث را حفظ کند.
- [ ] منوی مرکزی فقط عنوان و keycap نمایش دهد.
- [ ] ترتیب Player و Games دقیقاً مطابق این سند باشد.
- [ ] Random Game فقط سه بازی اصلی را تصادفی انتخاب کند.
- [ ] Painting در random pool نباشد.
- [ ] دارایی‌های خریداری‌شده از Store در Exchange و market simulator قابل چنج/انتخاب نباشند.
- [ ] HUD کلاسیک و قوانین بازی بدون تغییر باقی بمانند.
- [ ] تست CI و Human QA جداگانه ثبت شوند.

## 8. بازگشت (Rollback)

برای بازگشت، PR/commit شاخهٔ کاندید revert شود یا نسخهٔ دقیق قبل از تغییر از شاخهٔ زیر بازیابی شود:
`backup/pre-gateway-menu-exchange-2026-11-15`

هیچ force-push یا تغییری روی شاخهٔ پیش‌فرض انجام نشده است.


## 9. دیباگ چرخهٔ توقف Gateway و بازگشت از تب — 2026-11-15

**شاخهٔ پشتیبان:** `backup/pre-debug-gateway-visibility-2026-11-15`  
**شاخهٔ اصلاح:** `fix/gateway-visibility-freeze-2026-11-15`

### مشکل بازتولیدپذیر از روی کد
- شنوندهٔ `visibilitychange` در `nu-games.js` هنگام visible شدن تب، موتور بازی را بدون بررسی بازبودن Gateway دوباره `resume()` می‌کرد.
- `NUDynamicLayers.resume()` در `nu-dynamic-layers.js` حتی در وضعیت `frozen` یا `document.hidden` یک رندر ایستا اجرا می‌کرد.
- رویداد resize و تغییر mode نیز می‌توانستند هنگام freeze، لایهٔ پویا را دوباره رسم کنند.

### اصلاح محدود
- بازگشت تب فقط وقتی Gateway بسته است، موتور بازی و حلقهٔ راند را ازسرمی‌گیرد.
- لایهٔ پویا هنگام freeze/hidden هیچ فریم تازه‌ای رسم نمی‌کند.
- resize یا mode change در زمان freeze فقط به‌عنوان کار معوق ثبت می‌شود و پس از رفع freeze اعمال می‌گردد.
- هیچ تغییری در قوانین بازی، XP/Mana/HP، Wallet، save schema، Exchange یا HUD کلاسیک انجام نشده است.

### فایل‌های اصلاح‌شده
- `nu-games.js`
- `nu-dynamic-layers.js`
- `tests/nu-hex-gateway.test.js`
- `.github/workflows/gateway-main-game.yml`
- این سند اجرایی

### آزمون‌ها
- تست رگرسیون برای بازگشت از تب در حالی که Gateway باز است افزوده شد.
- تست رگرسیون برای جلوگیری از render در حالت frozen/hidden افزوده شد.
- workflow اکنون با تغییر renderer lifecycle هم اجرا می‌شود و syntax هر سه فایل را بررسی می‌کند.
- وضعیت CI این شاخه پس از بازشدن PR باید ثبت شود؛ Human QA همچنان جداگانه در انتظار است.


## 10. دیباگ ماژول Visuals در Exchange — 2026-11-15

### خطای مشاهده‌شده در CI
چهار تست در `tests/nu-exchange-visuals.test.js` با خطای `visuals.ambientMarket is not a function` شکست می‌خوردند. تابع `ambientMarket` در فایل پیاده‌سازی وجود داشت، اما از API ماژول export نشده بود. علاوه بر آن، صفحهٔ `exchange.html` فایل `nu-exchange-visuals.js` را پیش از `nu-exchange.js` بارگذاری نمی‌کرد؛ بنابراین ابزارهای ترسیم و جریان پس‌زمینه در مرورگر نیز به ماژول دسترسی نداشتند.

### اصلاح
- `ambientMarket` به API عمومی ماژول افزوده شد.
- `exchange.html` اکنون `nu-exchange-visuals.js` را پیش از `nu-exchange.js` بارگذاری می‌کند.
- تست API و ترتیب بارگذاری اسکریپت افزوده شد.
- تابع‌های شبیه‌سازی و قواعد احتمالاتی تغییر نکرده‌اند؛ هیچ داده‌ای در Wallet یا تاریخچهٔ تراکنش نوشته نمی‌شود.

### فایل‌های افزوده‌شده به دامنهٔ این دیباگ
- `nu-exchange-visuals.js`
- `exchange.html`
- `tests/nu-exchange-visuals.test.js`
- این سند اجرایی


## 11. نتیجهٔ CI پس از اصلاحات — 2026-11-15

کد اصلاح‌شده روی commit `213739788f215c9ae3932f8a13d9c5f45a4bf574` بررسی شد. چهار workflow زیر با نتیجهٔ موفق پایان یافتند:

| Workflow | نتیجه | Run |
|---|---|---|
| Gateway main-game regression | PASS | 174 |
| Wallet and Profile regression | PASS | 202 |
| Generation 1 HUD layout regression | PASS | 197 |
| Studio export regression gates | PASS | 672 |

این نتیجه، خطای قبلی `ambientMarket is not a function` را پس از export کردن API و افزودن script load order برطرف‌شده نشان می‌دهد. همچنین تست Gateway freeze و Dynamic Layers در workflow مربوطه موفق شد.

- Machine CI: **PASSED** برای commit بالا.
- Human browser/device QA: **PENDING**.
- Merge به شاخهٔ پیش‌فرض: **NOT PERFORMED**.
- Public Pages deployment: **NOT PERFORMED**.
