# Conversation Archive — N.U Universal Exchange & Chart Follow-up

**Date:** 2026-11-14  
**Project:** N.U / Niroo Universe  
**Branch:** `feature/nu-exchange-studio-launcher-spec`  
**Related PR:** #77 (draft; not merged)

## Owner request (faithful summary)

The owner cannot find the chart indicator and reports that the exchange chart still does not visibly show candles and bars/“میل”. They want the module designed to exchange player profiles and assets between games, using current game economies such as XP in Painting and Bubble Hunt as examples, while remaining extensible to all assets in future N.U games. They also request that this conversation be archived for future work.

## Findings recorded from source inspection

- Current local wallet fields include XP, Mana, HP, HP capsules, Mana capsules and casino credits; transaction history is local and capped.
- Current game profile selection is hard-coded in `nu-wallet.js`; it is not yet a universal player-profile bridge.
- The exchange core has a basic in-memory game registry, but no canonical asset valuation or profile bridge.
- Cross-game settlement is intentionally disabled (`SETTLEMENT_NOT_IMPLEMENTED` / `CROSS_GAME_SETTLEMENT_DISABLED`).
- Candles, high/low wicks, close/index line and volume bars are drawn only when recorded local player activity exists. With no activity, the market chart is hidden and an empty-state message appears.
- No moving-average overlay is present. The current “Index line” is the close/index polyline, not a moving average.
- Current data is browser-local; it is not a server-authoritative shared player ledger.

## Agreed implementation direction

1. Build a versioned, namespaced game/asset manifest contract for current and future N.U games.
2. Add a common N.U player identity/profile bridge, initially read-only and explicitly marked local/device-bound until authoritative identity sync exists.
3. Give every asset explicit unit, ownership/source-of-truth, valuation class, conversion eligibility, limits and policy version.
4. Distinguish shared assets from game-scoped assets. Do not assume Painting XP and Bubble Hunt XP are interchangeable until the owner/economy policy defines the mapping and ratio.
5. Add transparent quote preview (source, destination, ratio, fee, rounding, caps and expiry) before any settlement.
6. Keep actual transfer disabled until an authoritative ledger, atomic/idempotent settlement, reconciliation, audit trail and owner approval exist.
7. Make chart controls discoverable and explicitly label candles, wicks, volume bars, close/index line and SMA. Show an honest empty state when no actual activity exists; synthetic sample preview, if later added, must be opt-in and isolated from wallet/ledger.
8. Archive the source findings, decisions, unresolved policy questions and public-demo QA requirements.

## Safety and release boundaries

- Do not alter real balances or ledger as part of chart work.
- Do not enable cross-game settlement on localStorage alone.
- Do not change Gateway lock.
- No merge, production release, deployment or deployment-configuration changes are authorized by this request.
- Human acceptance must occur on a verified public N.U demo build, not GitHub source, local file or localhost.

## Next implementation sequence

1. Inventory every actual game entry point, wallet schema, asset delta and current adapter registration.
2. Add tests for universal manifests and read-only profile aggregation.
3. Add chart discoverability/SMA and empty-state behavior.
4. Add quote-preview interface with settlement still disabled.
5. Run automated checks, update PR #77, verify the candidate on the public demo only after separately authorized demo deployment, then collect human QA reports.

## Source references

- `nu-wallet.js`
- `nu-exchange-core.js`
- `exchange.html`
- `nu-exchange.js`
- `nu-market-sim.js`
- `docs/operations/NU-OPS-IMPLEMENT-01.md`
- `docs/operations/HUMAN-TEST-REPORT-TEMPLATE.md`

 
## تکمیل آرشیو — مدل XP و نردبان‌های مستقل اقتصادی (۱۴ نوامبر ۲۰۲۶)

### تصمیم مالک
- **XP_Bubble Hunt** و **XP_Studio** دو دارایی مجزا و game-scoped هستند؛ یکی‌کردن آن‌ها صرفاً به دلیل نام XP ممنوع است.
- در Bubble Hunt هر تعامل هدفمند و معتبر که بازی آن را موفق تشخیص دهد، دقیقاً **۱ واحد XP_Bubble Hunt** ایجاد می‌کند. تعامل نامعتبر، تکراری/خودکار یا صرفاً رویداد رابط کاربری پاداش ندارد.
- در Studio هر **۵۰ XP_Studio = یک Level** است.
- در Bubble Hunt هر **۱۰۰ XP_Bubble Hunt = یک Capsule** است. ادامه نردبان (تعداد کپسول برای tier بعد، پاداش‌ها و مراحل نهایی) باید از قواعد اصلی خود بازی استخراج شود؛ هیچ نسبت مفقودی حدس زده نمی‌شود.
- هر بازی نردبان اقتصادی خودش را حفظ می‌کند؛ نردبان پیشرفت داخلی به‌تنهایی نرخ تبدیل بین دو بازی نیست.

### سیاست هم‌سنگی و تبدیل
- صرافی فقط دارایی‌هایی را تبدیل می‌کند که یک مسیر هم‌سنگی مشخص و نسخه‌دار برایشان تصویب شده باشد. مقدار عددی برابر، نام مشابه یا آسان‌تر بودن کسب دارایی، به‌تنهایی اثبات هم‌ارزی نیست.
- مسیر **XP_Bubble Hunt → XP_Studio** تا زمان تصویب نسبت دقیق و تأیید هر دو adapter فعال نمی‌شود.
- مسیر **XP_Bubble Hunt → Mana ممنوع/غیرفعال** است؛ هیچ نرخ مستقیمی برای آن تعریف نشده است.
- تبدیل XP به Level، Capsule، HP یا ارز نامرتبط بدون مسیر مستقل و مصوب ممنوع است.
- هر جفت غیرمجاز باید با خطای روشن مانند PAIR_NOT_EQUIVALENT رد شود.
- تعیین نرخ باید دشواری/زمان کسب معتبر، کاربرد در نردبان، کمیابی، sinkها، سقف‌ها، reset فصل، تمرکز موجودی و ریسک تقلب را بسنجد. آسان‌تر بودن کسب یک دارایی به‌تنهایی قیمت آن را تعیین نمی‌کند.

### فهرست دارایی‌ها و وضعیت قیمت‌گذاری
| دارایی | اقتصاد/لنگر فعلی | وضعیت صرافی |
|---|---|---|
| XP_Bubble Hunt | هر تعامل هدفمند معتبر = ۱ XP؛ هر ۱۰۰ XP = یک Capsule | دارایی بومی Bubble Hunt؛ فقط مسیر هم‌سنگ مصوب |
| XP_Studio | هر ۵۰ XP = یک Level | دارایی بومی Studio؛ نرخ تبدیل به Bubble Hunt هنوز مصوب نیست |
| Bubble Hunt Capsule | ۱۰۰ XP_Bubble Hunt برای هر کپسول؛ پله‌های بعدی نیازمند بررسی منبع بازی | آیتم پیشرفت بومی؛ نرخ تبدیل بین‌بازی فرض نمی‌شود |
| Mana | کد فعلی Mana Collector برای تعامل موفق +۱ Mana ثبت می‌کند | ارز مستقل؛ تبدیل از XP_Bubble Hunt ممنوع |
| HP | فیلد موجود در wallet؛ ارزش/قابلیت انتقال تأیید نشده | غیرقابل‌تبدیل به‌صورت پیش‌فرض |
| HP Capsule | قاعده legacy فعلی خرید: ۱۰ XP مشترک؛ پیش از نگاشت به XPهای تفکیک‌شده باید بازبینی شود | با Bubble Hunt Capsule یکی نیست؛ فعلاً غیرقابل‌تبدیل |
| Mana Capsule | در wallet وجود دارد؛ نردبان مصرف/بازخرید نیازمند بررسی منبع | محدود به بازی تا تصویب سیاست |
| Casino Credits | در wallet وجود دارد؛ نرخ و sinkها نیازمند بررسی منبع | محدود به بازی تا تصویب سیاست |

### نکته مهم مهاجرت داده
در کد فعلی nu-wallet.js فقط یک فیلد legacy به نام xp وجود دارد و چند بازی در آن پاداش می‌ریزند. موجودی تاریخی نباید بدون provenance به XP_Bubble Hunt یا XP_Studio نسبت داده شود. پاداش‌های جدید باید با gameId و assetId ثبت شوند؛ موجودی قدیمیِ بدون منشأ در سبد جداگانه nu.legacy.unattributed_xp بماند و تا تعیین قاعده مهاجرت توسط مالک، قابل‌تبدیل نباشد.

### آنالیز و نمودار
تمام داده‌های نمودار باید gameId، assetId، unit، منبع رویداد، زمان، مقدار و provenance داشته باشند. نمودار پیش‌فرض برای هر بازی/دارایی جداست. مقایسه بین‌بازی فقط با شاخص نرمال‌شده‌ای مجاز است که فرمول، دوره مبنا و نسخه سیاستش نمایش داده شود؛ مقادیر خام XP بازی‌های مختلف نباید به‌عنوان قیمت‌های هم‌سنخ روی یک محور ادغام شوند.

### کارهای پیگیری
1. استخراج تمام پله‌های Capsule در Bubble Hunt و قواعد XP/Level در Studio از منبع اصلی بازی.
2. تفکیک پاداش‌های جدید XP بر اساس منشأ بازی و نگهداری XP تاریخیِ بی‌منشأ در bucket مستقل.
3. تکمیل کاتالوگ دارایی‌ها و علامت‌گذاری موارد تأییدنشده.
4. تصویب نسبت XP_Bubble Hunt ↔ XP_Studio پیش از فعال‌کردن هرگونه quote.
5. تست رد شدن مسیر XP_Bubble Hunt → Mana و سایر جفت‌های غیرهم‌سنگ.
6. settlement همچنان غیرفعال تا زمان آماده‌شدن ledger معتبر و تأییدهای لازم.

**سند معماری به‌روزشده:** https://github.com/mobinabinshun-beep/mobinabinshun-beep/blob/feature/nu-exchange-studio-launcher-spec/docs/architecture/NU-UNIVERSAL-GAME-ASSET-EXCHANGE-SPEC-2026-11-14.md
