# چک‌لیست پذیرش ماشینی N.U Launcher

وضعیت اولیهٔ همهٔ موارد جدید: **NOT IMPLEMENTED / NOT VERIFIED** تا وقتی تست خودکار دارای log و نتیجهٔ قابل بازتولید اضافه شود.

| حوزه | تست ماشینی لازم | معیار PASS |
|---|---|---|
| پک اول | parse manifest | دقیقاً سه شناسهٔ ثابت و یکتا؛ default-enabled |
| حذف بازی | شبیه‌سازی uninstall/reinstall | payload حذف؛ save/profile باقی؛ نصب مجدد ممکن |
| مترجم | registry و انتخاب adapter | انتخاب بر اساس generation/game/API؛ رد adapter ناشناخته |
| IR | serialize/deserialize | خروجی deterministic و نسخه‌دار |
| میان‌بر | cache replay در برابر reference | خروجی یکسان؛ mismatch باعث invalidation و fallback |
| Pulse CPU | نبود/خطای probe | گزارش unsupported و سیاست محافظه‌کارانه |
| Pulse RAM | سقف process/job | accepted/effective جداگانه ثبت شود |
| Pulse GPU | نبود API کنترل | hard-cap=false؛ عدم گزارش موفقیت ساختگی |
| Quiesce | صف رویداد و timeout | no lost event، resume/abort امن |
| Budget | مصرف بالاتر از سقف | yield/stop؛ هیچ child budget سقف Core را افزایش ندهد |
| Package integrity | hash/signature | hash یا امضای نادرست رد شود |
| Path safety | مسیرهای traversal و symlink | نصب خارج از staging رد شود |
| Atomic install | قطع فرایند وسط نصب | بستهٔ نیمه‌نصب‌شده فعال نشود |
| Rollback | ارتقای خراب | نسخهٔ قبلی قابل بازیابی باشد |
| Regression | NUVM/1 فعلی | تست‌های قبلی همچنان PASS |

## قالب گزارش تست
- Commit و branch دقیق
- OS و معماری runner
- ابزار و نسخهٔ compiler
- نام تست، ورودی، خروجی و exit code
- log و artifact
- نتیجهٔ جداگانه برای hard cap و soft budget
- هیچ نتیجهٔ ماشینی جای تست انسانی روی XP SP3 و سخت‌افزار واقعی را نمی‌گیرد.

## دروازهٔ انسانی (تیم مالک)
- نصب/حذف/نصب مجدد هر بازی و حفظ save
- کنترل صحت ورودی/خروجی هر بازی
- روانی UI و واکنش‌پذیری زیر بار
- رفتار زمان کمبود RAM و GPU
- Resume پس از کالیبراسیون
- Windows XP SP3 واقعی/VM و سیستم‌های جدید
- گزارش موارد crash، افت فریم، خطای تصویر، از دست‌رفتن داده و مصرف منابع