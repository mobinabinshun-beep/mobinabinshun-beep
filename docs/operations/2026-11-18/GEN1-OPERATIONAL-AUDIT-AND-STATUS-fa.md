# وضعیت عملیاتی Generation 1 — سپر، مانا و شکاف‌های بازی

**تاریخ:** 2026-11-18  
**دامنه:** دمو عمومی Generation 1، اقتصاد Mana/N-BI/Arcane Shield و عملیات مرتبط  
**کد منتشرشده:** `27b59a2c593752ba5c9d21cfe41f43af8fb4e9b9`  
**دمو:** https://mobinabinshun-beep.github.io/mobinabinshun-beep/

## وضعیت تحویل

- PR #203 آیکون اختصاصی Material سپر را اضافه و به پنل سپر متصل کرد؛ در commit انتشار قبلی `d26e4242c713cfc6f6d06d9fa61b6be0760447cf) ادغام شد.
- PR #205 ناسازگاری سقف کپسول را اصلاح کرد: مقداردهی اولیه بازی اکنون همانند Wallet و Store سطح ظرفیت را بین 1 تا 9 محدود می‌کند. PR در commit `27b59a2c593752ba5c9d21cfe41f43af8fb4e9b9) ادغام شد.
- Pages workflow برای commit انتشار `27b59a2c593752ba5c9d21cfe41f43af8fb4e9b9` با موفقیت build و deploy شد: https://github.com/mobinabinshun-beep/mobinabinshun-beep/actions/runs/44366825247
- محتوای HTML زنده از محیط اجرایی این ممیزی قابل دریافت مستقل نبود؛ بنابراین موفقیت deploy workflow ثبت شده، اما HTTP/live-banner verification جداگانه **NOT VERIFIED** است.
- Human QA: **PENDING**؛ پذیرش مالک یا قفل محصول ثبت نشده است.

## قوانین قطعی پیاده‌سازی‌شده

- هر کپسول/ظرف یک slot دائمی با ظرفیت ثابت 10 Mana است؛ سطح ظرفیت 1–9 یعنی 1–9 slot و حداکثر 90 Mana.
- خالی‌شدن ظرف، slot را حذف نمی‌کند؛ مانای مصرف‌شده صفر می‌شود.
- Mana مستقیم از Store خریداری نمی‌شود؛ از Mana Collector (+1 در هر جمع‌آوری موفق) یا برد شرط‌بندی مجازی به دست می‌آید.
- یک X Credit ظرفیت را یک Level بالا می‌برد، یک ظرف دائمی اضافه می‌کند و 10 Mana اولیه به‌عنوان grant ارتقا می‌دهد؛ این فروش مستقیم Mana نیست.
- N-BI سطح 1: هزینه 10 Mana، خنثی‌سازی یک Chaos mass و +3 XP.
- Arcane Shield: هزینه 10 Mana، فعال‌سازی فوری 10 دفاع؛ هر برخورد یک واحد سپر مصرف می‌کند؛ بعد از صفرشدن، آسیب باقیمانده به HP می‌رسد.
- شارژ باقیمانده بین gameplay Waveها حفظ می‌شود؛ auto-refill و top-up ممنوع است.
- در هر gameplay Wave فقط یک فعال‌سازی موفق سپر مجاز است. Level 1 شارژ Store-only دارد؛ Level 2 در صورت فعال‌بودن، یک شارژ دستی داخل بازی را باز می‌کند.
- توده‌های باقی‌مانده هنگام خروج/reload باید دقیقاً یک‌بار resolve شوند.
- دو تعریف Wave حفظ می‌شود: HP completion پس از 10 تعامل موفق و Wallet-income aggregation با تسویهٔ idempotent.

## شواهد تست

- Arcane Shield/Mana focused regression: **81/81 PASS** — https://github.com/mobinabinshun-beep/mobinabinshun-beep/actions/runs/44366665981
- Full Generation 1 regression: **307/307 PASS** — https://github.com/mobinabinshun-beep/mobinabinshun-beep/actions/runs/44366666062
- HUD layout: PASS — https://github.com/mobinabinshun-beep/mobinabinshun-beep/actions/runs/44366666044
- Gateway main-game: PASS — https://github.com/mobinabinshun-beep/mobinabinshun-beep/actions/runs/44366666008
- Exchange: PASS — https://github.com/mobinabinshun-beep/mobinabinshun-beep/actions/runs/44366666137
- Studio export: PASS — https://github.com/mobinabinshun-beep/mobinabinshun-beep/actions/runs/44366666062
- Graphics preview/static: PASS — https://github.com/mobinabinshun-beep/mobinabinshun-beep/actions/runs/44366665942

Tests above ran on candidate tree `381cab60be3ce5d9b2d4adb36581ceceeb54d97a`, subsequently squash-merged as `27b59a2c593752ba5c9d21cfe41f43af8fb4e9b9`. Candidate backup: `backup/post-test-mana-capacity-candidate-2026-11-18`. Pre-change backup: `backup/pre-mana-capacity-limit-fix-2026-11-18`.

## شکاف‌های باز و مرز اجرا

1. **Shield Level 2 purchase path:** runtime gate برای level 2 وجود دارد، اما Store upgrade/purchase action برای ارتقای سپر وجود ندارد. قیمت Level 2 در تصمیم‌های جاری تأیید نشده است. هیچ قیمت یا دکمه خرید حدسی اضافه نشود.
2. **N-BI upgrade curve:** منحنی تاریخی 10 تا 1 Mana و قیمت 10 N Credits برای هر سطح، در اسناد به‌عنوان proposal/نیازمند تطبیق ثبت شده؛ هنوز قرارداد فعال/تأییدشده نیست. تا تصمیم صریح، پنهان بماند.
3. **X/N Credit earning/conversion:** روابط تاریخی 10 Level → 1 X و 100 X → 1 N، در کد جاری به‌عنوان مسیر کسب/تبدیل خودکار فعال نیستند؛ قیمت‌گذاری یا صدور جدید اختراع نشود.
4. **Wallet/Health/MHL:** داده‌ها local-demo هستند؛ همگام‌سازی ابری، حساب سرورمرجع و دفترکل تولیدی وجود ندارد. idempotency و بازیابی باید در QA بین‌ماژولی بررسی شوند.
5. **Exchange:** نمودار بازار/شبیه‌ساز از تبدیل واقعی دارایی جداست؛ نرخ، کارمزد و settlement تبدیل بدون تصمیم نهایی فعال نشود.
6. **Profile:** نمای فعلی preview محلی است، نه احراز هویت یا فضای خصوصی امن؛ از اطلاعات واقعی/رمز استفاده نشود.
7. **Background asset:** قرارداد مسیر تصویر پس‌زمینه در کد و مستندات تاریخی ناسازگار است؛ artwork اصلی بدون منبع canonical تأییدشده تغییر نکند.
8. **Gateway/controller:** قرارداد در `AGENTS.md` و `LOCKED-AREAS.md` قفل است؛ هیچ تغییر رفتاری بدون دستور مستقیمی که صریحاً Gateway/controller را نام ببرد انجام نشود.
9. **Generation 2 / Native Runtime:** مسیرهای آرشیوی/پارک‌شده‌اند و بخشی از دمو قابل‌بازی Generation 1 نیستند؛ بدون دستور جداگانه فعال یا merge نشوند.
10. **Human device QA:** دسکتاپ، موبایل، touch، keyboard, reduced-motion و reload باید روی همان build عمومی آزمایش شوند.

## Rollback

- برای اصلاح سقف ظرفیت، نقطهٔ پیش از تغییر: `backup/pre-mana-capacity-limit-fix-2026-11-18` → `d26e4242c713cfc6f6d06d9fa61b6be0760447cf`.
- Candidate تست‌شده: `backup/post-test-mana-capacity-candidate-2026-11-18` → `381cab60be3ce5d9b2d4adb36581ceceeb54d97a`.
- در صورت regression بحرانی، فقط با ثبت incident و با forward-fix ترجیحی، تغییر محدود revert شود؛ تاریخچه حذف نشود.

## گزارش انسانی

فرم/چک‌لیست پذیرش انسانی در Issue #204 نگهداری می‌شود:
https://github.com/mobinabinshun-beep/mobinabinshun-beep/issues/204

**وضعیت نهایی فعلی:** CODE-MERGED · MACHINE-TEST-PASSED · BACKUP-VERIFIED · PAGES-WORKFLOW-DEPLOY-SUCCEEDED · LIVE-HTTP-CHECK-UNVERIFIED · HUMAN-QA-PENDING · OWNER-ACCEPTANCE-PENDING.


## الحاقیهٔ اصلاح پایداری خروج/reload توده‌های Chaos — 2026-11-18

- ممیزی PRهای باز نشان داد شرط `state.game === "chaos"` در `resolveRemainingChaosMasses` می‌توانست بازیابی توده‌های pending را پس از reload و پیش از ورود مجدد به view متوقف کند.
- همچنین handler قبلی `beforeunload` بدون بررسی موفقیت resolve/persist، Wave را تسویه می‌کرد. این مسیر اکنون اصلاح شده است.
- PR #207 ادغام شد: https://github.com/mobinabinshun-beep/mobinabinshun-beep/pull/207
- merge commit: `c687e4be7c4935ebff1b82640b341d1bcd7122bb`.
- تست دقیق candidate: 83/83 focused و 309/309 full Generation 1 PASS: https://github.com/mobinabinshun-beep/mobinabinshun-beep/actions/runs/44367406189
- backup پیش از تغییر: `backup/pre-chaos-exit-persistence-fix-2026-11-18` → `27b59a2c593752ba5c9d21cfe41f43af8fb4e9b9`.
- backup کاندید تست‌شده: `backup/post-chaos-exit-persistence-candidate-2026-11-18` → `fb8b80cb1cfa44f4ce6f34ce076307dc7f0df889`.
- Pages build/deploy برای merge commit موفق شد: https://github.com/mobinabinshun-beep/mobinabinshun-beep/actions/runs/44367521993
- HTTP/live HTML verification از این محیط همچنان قابل انجام نبود؛ Human QA روی دمو عمومی همچنان PENDING است.
