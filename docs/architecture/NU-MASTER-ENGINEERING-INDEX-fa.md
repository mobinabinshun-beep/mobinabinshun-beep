# سند مادر و نقشه یکپارچه مهندسی N.U Launcher

- Revision: 1.0-candidate
- Date: 2026-11-18
- Status: مرجع یکپارچه توسعه؛ نه اعلام انتشار
- Product owner: N.U project owner
- Engineering owner: N.U runtime engineering

## 1. هدف واحد محصول

N.U یک محیط اجرای مستقل و افزونه‌پذیر است. سیستم‌عامل فقط میزبان پنجره، ورودی/خروجی و APIهای پلتفرم است؛ مالک چرخه عمر ماژول، قرارداد اجرا، مترجم‌ها، سیاست منابع، نصب/ارتقا و داده‌های کاربر خود N.U است. استفاده از مرورگر عمومی یا WebView برای اجرای هسته محصول مجاز نیست.

نسخهٔ اول باید روی سخت‌افزار ضعیف و Windows XP-era x86 به‌عنوان معیار محافظه‌کارانه مهندسی شود؛ اما PE subsystem 5.01 یا cross-build به‌تنهایی اثبات سازگاری XP نیست. هر نسخهٔ سیستم‌عامل باید در زمان اجرا capability probe شود و نتیجهٔ واقعی گزارش شود.

## 2. این سند مرجع است؛ ترتیب اعتبار اسناد

در صورت تعارض، این ترتیب اعمال می‌شود:

1. تصمیم صریح و جدید مالک محصول.
2. همین سند مادر برای مرزهای مشترک محصول و واژگان.
3. قرارداد تخصصی هر حوزه که در بخش 3 لینک شده است.
4. کد و تست‌های همان commit که قابلیت را واقعاً پیاده کرده‌اند.
5. گزارش‌های تاریخ‌دار و توضیحات PR صرفاً سابقه‌اند و نمی‌توانند قابلیت منتشرنشده را فعال‌شده نشان دهند.

یک قابلیت فقط وقتی «پیاده‌سازی‌شده» است که کد، تست ماشینی و مسیر اتصال واقعی داشته باشد. متن manifest یا سند معماری به‌تنهایی قابلیت اجرایی ایجاد نمی‌کند.

## 3. اسناد تخصصی مرجع

- [مشخصات یکپارچه Generation 1 و Runtime](./NU-GEN1-UNIFIED-ENGINEERING-SPEC.md)
- [قرارداد چرخه نصب، ارتقا، حذف و ذخیره‌سازی پک اول](./NU-PACK-1-USER-LIFECYCLE.md)
- [مانیفست شناسه‌های رسمی پک Generation 1](../../native/NU-GEN1-PACK-MANIFEST.json)
- [قرارداد مترجم‌های نسل، Pulse و سیاست منابع](../../native/NU-LAUNCHER-GEN1-TRANSLATOR-RESOURCE-ARCHITECTURE-fa.md)
- [چک‌لیست پذیرش ماشینی و انسانی](../../native/NU-LAUNCHER-MACHINE-ACCEPTANCE-fa.md)
- [قرارداد ماژول و VM نسل اول](../../native/NUVM-1-GENERATION-1-MODULE-CONTRACT.md)
- [گزارش پایهٔ Runtime و وضعیت پیاده‌سازی](../operations/2026-11-18/NU-NATIVE-RUNTIME-GEN1-FOUNDATION.md)

گزارش‌های تاریخی حذف نمی‌شوند؛ فقط به‌عنوان سابقه نگهداری می‌شوند. این سند از تکثیر مشخصات رقیب جلوگیری می‌کند.

## 4. نقشه واقعی مخازن و شاخه‌های موازی بررسی‌شده

### PR #151 — Native Runtime Shell
شامل پوسته Win32، تصویر ثابت، ناوبری داخلی، منوی Library/Modules/Settings و یک VM نمونهٔ متنی است. ارزش قابل استفاده: پوستهٔ بومی و مسیر UI. محدودیت: نمونهٔ VM آن با باینری هسته PR #195 یکسان نیست؛ بازی‌های وب به آن متصل نشده‌اند و XP واقعی تأیید نشده است.

### PR #183 — Pack / Translator / Resource Contract
شامل شناسه‌های رسمی سه بازی، قرارداد مترجم چندنسلی، IR، Pulse، سیاست hard/soft resource budget و تست پذیرش. این اسناد اکنون به شاخهٔ مرجع PR #195 منتقل شده‌اند. manifest فعلی صریحاً می‌گوید payload هر سه بازی هنوز به بستهٔ Native متصل نیست.

### PR #195 — Portable Runtime Foundation
مبنای فعلی توسعهٔ هسته است: C90 portable core، NUPK/1 container حامل NUVM bytecode، translator subset، disk cache، parser ساختاری manifest، dependency resolver، cleanup planner، component reconciliation و مدل وضعیت journal. میزبان Win32 اکنون تصویر ثابت canonical را با GDI نمایش می‌دهد و کنترل‌های پایهٔ Open/Exit دارد؛ اما Library کامل، نصب‌کنندهٔ واقعی و بازی Native ندارد. CI برای commit ثبت‌شده موفق است.

### PR #175 — Installer Preview
دارای پروژهٔ C++/Win32 و دستور Inno Setup است. workflow آن با runner و toolchain جدیدتر اجرا می‌شود؛ وجود build script جداگانهٔ MSVC 2010 به معنی تولید و تأیید artifact نهایی XP نیست. قرارداد uninstall آن نیز هنوز تجربهٔ سه‌مرحله‌ای و حفاظت/انتقال دادهٔ کامل را پیاده نمی‌کند.

### PR #145 و #143
مسیر تصویر ثابت و launcher installer XP-first را ثبت می‌کنند. ارزش آن‌ها در asset و تصمیم «یک تصویر ثابت بدون لایه‌های تزئینی» است؛ با این حال تست مدرن Windows جایگزین تست XP SP3 واقعی نیست.

## 5. تعارض فنی مهمی که قبل از ادغام باید حل شود

در شاخه‌های مختلف، عبارت `NUVM/1` برای قالب‌های ناسازگار استفاده شده است:

- PR #151: فایل متنی declarative با سطرهایی مثل `GENERATION=1` و `TEXT=...`.
- PR #175: فایل `.numod` به‌علاوهٔ برنامهٔ متنی `.nuvm` با دستورهای `CLEAR/RECT/TEXT`.
- PR #195: ظرف باینری با magic برابر `NUVM`، header شانزده‌بایتی و bytecode عددی.

این‌ها یک ABI نیستند. ادغام مستقیم آن‌ها ممنوع است. پیش از اتصال shell و بازی‌ها، نام‌گذاری و نسخه‌بندی باید به این تفکیک برسد:

- `NUPK/1`: ظرف بستهٔ باینری و header بسته؛ پسوند فایل توزیع می‌تواند `.nup` باقی بماند.
- `NUMOD/1`: manifest ماژول، شناسه، نسل، ABI، وابستگی‌ها و capabilityها.
- `NUVM/1`: فقط ISA/bytecode runtime؛ نسخهٔ ISA از نسخهٔ container مستقل است.
- `NUPACK-MANIFEST/1`: فهرست کامل اجزای یک انتشار و سیاست نصب.

در همین شاخهٔ پیش‌انتشار، ظرف باینری به NUPK/1 با header بیست‌بایتی مهاجرت داده شد و NUVM/1 فقط شناسهٔ ISA/bytecode باقی ماند. validator قالب باینری قدیمی با magic=NUVM را رد می‌کند. نمونه‌های متنی PR #151/#175 همچنان قالب‌های legacy جدا هستند و به‌صورت خودکار تبدیل نمی‌شوند. Golden fixtures و تست interoperability بین hostها هنوز لازم است. تا پیش از این اصلاح، shellهای PR #151/#175 به‌عنوان hostهای جداگانه و غیرقابل ترکیب باقی می‌مانند.

## 6. قرارداد معماری واحد

جهت وابستگی:

`Platform Host → N.U Core → Resource Controller / Package Manager → Runtime Host → Generation Adapter → Canonical IR → Renderer & Input Services`

- Platform Host: ایجاد پنجره، پیام‌های OS، فایل‌سیستم و قابلیت‌های پلتفرم.
- Core: session، lifecycle، سیاست امنیت و بودجه.
- Package Manager: کشف میزبان قبلی، inventory، اعتبارسنجی، dependency، staging، activation و rollback.
- Runtime Host: اجرای محدود و deterministic؛ تنها ماژول فعال منابع اجرایی را نگه می‌دارد.
- Translator: adapter مستقل و نسخه‌دار برای هر نسل/بازی.
- Canonical IR: قرارداد خنثی از OS و GPU؛ renderer و input فقط از API مجاز استفاده می‌کنند.
- Cache: دادهٔ موقت و الگوهای تکرارشوندهٔ تأییدشده؛ cache هرگز مرجع حقیقت یا محل اجرای native code نیست.

ماژول حق ندارد سقف منابع Core را افزایش دهد یا مستقیم Win32/driver را صدا بزند. قابلیت‌های خطرناک مثل شبکه، فایل و صدا از capability broker عبور می‌کنند.

## 7. سیاست منابع مبنا

- پروفایل پایه: 1 GiB RAM فیزیکی، یک پردازندهٔ منطقی و GPU ضعیف/نامشخص.
- سقف هدف RAM داخلی: `min(physical RAM / 2, currently available RAM / 2, 250 MiB)`.
- بودجهٔ shared cache حداکثر 250 MiB؛ در سقف کامل، 125 MiB کوتاه‌مدت و 125 MiB الگوهای تکرارشونده.
- سقف staging روی دیسک: 1 GiB؛ این حافظهٔ نصب/دیسک است، نه RAM.
- CPU: زمان‌بندی تعاونی و bounded slice؛ یک slot از هر دو slot زمان‌بندی N.U، نه ادعای 50% hard cap سراسری.
- GPU: بدون API قابل‌اعتماد و مستقل از سازنده، فقط محدودیت تعداد/اندازهٔ منابع، کیفیت، نرخ ارسال و صف کار؛ درصد GPU hard cap ادعا نمی‌شود.
- «پالس» باید workloadهای N.U را در مرز امن quiesce کند، نه اینکه سیستم‌عامل را freeze کند.
- سقف‌ها فقط زمانی hard گزارش می‌شوند که API سیستم‌عامل واقعاً پذیرفته و اثر آن اندازه‌گیری شده باشد؛ در غیر این صورت soft budget/unsupported اعلام می‌شود.

## 8. قرارداد پک اول

شناسه‌های ثابت:
- `nu.gen1.bubble-hunt`
- `nu.gen1.mana-collector`
- `nu.gen1.chaos-attack`

هر سه در پک کامل اولیه default-enabled هستند و باید جداگانه قابل نصب/حذف/نصب مجدد باشند. حذف payload بازی نباید Save، Wallet یا Profile را حذف کند. در حال حاضر این شناسه‌ها در manifest ثبت‌اند، اما payloadهای بومی به installer/runtime متصل نشده‌اند؛ بنابراین هنوز «سه بازی قابل بازی در لانچر» وجود ندارد.

ترتیب پورت: Bubble Hunt، سپس Mana Collector، سپس Chaos Attack؛ هر بازی باید قبل از شروع بازی بعدی تست deterministic، save round-trip و budget را بگذراند.

## 9. چرخهٔ نصب/ارتقا/حذف

- نخستین دانلود یک پک کامل offline است.
- نصب‌کننده باید نصب قبلی را فقط با شناسهٔ معتبر N.U کشف کند، نه حدس نام پوشه.
- نسخهٔ کامل جدید همچنان از نصب پاک پشتیبانی می‌کند؛ در میزبان موجود فقط componentهای جدید/تغییرکرده اعمال می‌شوند.
- ارتقا ابتدا staging و verify، سپس activation اتمی و rollbackپذیر است.
- حذف سه‌مرحله‌ای: انتخاب اقدام؛ انتخاب اجزا/داده؛ مرور نتیجه و تأیید.
- Core، بازی‌ها، cache، save، wallet/profile، user assets و settings inventory مستقل دارند.
- Save/Wallet/Profile/Assets به‌صورت پیش‌فرض حفظ می‌شوند و امکان خروجی شناسنامه‌دار و import اعتبارسنجی‌شده دارند.
- فایل دانلودی installer خارج از install root است و حتی با «حذف همه» حذف نمی‌شود؛ حذف آن فقط از اقدام مستقل با تأیید دوم مجاز است.
- فایل ناشناخته، symlink یا مسیر خارج از root متعلق به N.U هرگز حذف نمی‌شود.
- حذف‌کننده باید پس از عملیات inventory را دوباره بررسی کند و باقیمانده‌ها را گزارش دهد.

## 10. وضعیت انتشار در این commit

### موجود و آزموده‌شده
- هستهٔ portable C90، VM محدود و translator subset.
- cache دیسکی FIFO با CRC و قطعه‌های محدود.
- parser ساختاری manifest با مرز fail-closed برای crypto provider.
- dependency graph resolver محدود.
- cleanup planning و component reconciliation.
- مدل in-memory journal.
- build/test portable و cross-build میزبان Win32 با PE subsystem 5.01؛ استخراج تصویر ثابت canonical و نمایش GDI نیز در build آزموده شده است.

### طراحی/ثبت شده، اما هنوز اجرایی نیست
- مترجم‌های واقعی بازی، Canonical IR کامل و registry.
- Pulse probes و تثبیت پروفایل واقعی CPU/RAM/GPU.
- hard cap واقعی CPU/GPU و اتصال کامل RAM ledger به همهٔ allocationها.
- signature verification تولیدی و trust roots.
- installer تراکنشی، journal پایدار، کشف نصب قبلی، activation/rollback واقعی.
- UI سه‌مرحله‌ای نصب/حذف و export/import بستهٔ داده.
- اتصال سه بازی به Native Runtime و تست بازی واقعی.
- renderer/input نهایی و تست XP واقعی.

### انتشار عمومی
این شاخه یک development candidate است، نه نسخهٔ قابل نصب و بازی. artifact فعلی PR #195 یک executable آزمایشی host/VM است، نه setup installer و نه بازی. XP subsystem metadata اثبات سازگاری واقعی نیست.

## 11. نقشهٔ اجرایی واحد

1. تثبیت format naming و migration golden tests برای حل تعارض NUVM/1.
2. ادغام پوستهٔ تصویر ثابت/ناوبری با هستهٔ portable بدون آوردن VM دوم.
3. اتصال pack manifest به Package Manager و پیاده‌سازی inventory واقعی.
4. journal پایدار، staging، activation اتمی و rollback واقعی.
5. UI سه‌مرحله‌ای نصب/حذف و data bundle شناسنامه‌دار؛ installer archive خارج از محدودهٔ حذف.
6. اتصال کامل RAM ledger، bounded CPU slices و adaptive capability report.
7. Canonical IR و translator registry نسخه‌دار.
8. پورت Bubble Hunt و چرخهٔ کامل نصب/بازی/ذخیره/حذف/نصب مجدد.
9. افزودن Mana Collector و Chaos Attack به‌صورت افزونه‌های مستقل.
10. بسته‌بندی XP-first با toolchain قدیمی و آزمون VM واقعی؛ سپس تست نسخه‌های جدید Windows.
11. فقط پس از همهٔ gates، ساخت دمو عمومی آزمایشی و ارائهٔ artifact دانلودی.

## 12. مرز اعتماد و داده

CRC فقط خطای تصادفی را تشخیص می‌دهد، امضای ناشر نیست. parser ساختاری به‌تنهایی اعتماد ایجاد نمی‌کند. هیچ package unsigned نباید authenticated معرفی شود. تا قبل از crypto provider واقعی، نصب عمومی باید به بسته‌های development کنترل‌شده محدود بماند.

هر تغییر مخرب باید journal و rollback داشته باشد. دادهٔ کاربر هیچ‌وقت در کنار فایل‌های اجرایی versioned نگهداری نمی‌شود. cache قابل بازسازی است و در پاک‌سازی قابل حذف؛ installer archive مستقل و تحت اختیار کاربر باقی می‌ماند.


### NUPK/1 format correction applied

The C90 package builder and validator now use a distinct NUPK/1 container (20-byte header) with separate container version, generation, flags and NUVM ABI fields. CRC32 protects against accidental corruption only. Unit tests cover unsupported container version, unsupported VM ABI minor, legacy NUVM container-magic rejection and payload CRC failure. The old pre-release binary format is intentionally not treated as a published compatibility target.


### Static image host increment
The PR #195 host now extracts and displays the canonical still image through GDI StretchBlt, with aspect-preserving scaling. No animation/decorative layers or browser engine are used. The build artifact includes the EXE and its BMP/README/checksum sidecars. This is a test payload, not a setup installer or game renderer.


## 13. انتقال ذخیرهٔ نسخهٔ وب به Native

نسخهٔ وب فعلی از localStorage با کلید `nu-world-save-v1` استفاده می‌کند و Wallet/transaction ledger، XP/Mana/HP، وضعیت Shield، شناسه‌های reward و Wave را نگه می‌دارد. پردازش Native به localStorage مرورگر دسترسی مستقیم ندارد. برای حفظ پیشرفت، export کاربرمحور از مرورگر و import اعتبارسنجی‌شده به بستهٔ داده لازم است؛ تا آن زمان نباید ادعای انتقال خودکار Save یا Wallet شود. جزئیات در قرارداد Pack 1 آمده است.


## 14. NUDb/1 data bundle primitive

A portable C90 serializer/parser now defines a bounded NUDb/1 user-data container for Save, Wallet, Profile, User Assets and Settings. It rejects executable/cache/installer classes, unsafe or duplicate stable IDs, unknown classes/versions, invalid lengths and CRC mismatch. This is a serialization/validation primitive only; host filesystem export/import, atomic write, migration from browser localStorage and UI remain pending. CRC32 is not authenticity protection.

Each NUDb/1 entry carries independent schema major/minor fields, so Save, Wallet, Profile and Settings can migrate independently while retaining a common product-tagged bundle container.


## 15. Owner authorization and cross-repository audit record

The explicit owner scope for native Generation-1 launcher/runtime and Pack 1, together with the cross-repository inventory and reuse-first findings, is recorded in the archive: [NU-NATIVE-LAUNCHER-REPOSITORY-AUDIT-AND-OWNER-SCOPE-fa.md](https://github.com/mobinabinshun-beep/Repository/blob/main/Operations/2026-11-18/NU-NATIVE-LAUNCHER-REPOSITORY-AUDIT-AND-OWNER-SCOPE-fa.md). This current owner directive supersedes the earlier FUTURE-2026-002 archive-only authorization only for the stated native launcher/Pack 1 scope. FUTURE-2026-004 full graphics platform remains parked; Generation 2 remains quarantined.


## 16. NUJR/1 transaction journal serialization

The install journal state model now has a fixed 24-byte NUJR/1 encoder/decoder with transaction ID, state, total/completed item counts and CRC32. Unit tests cover round-trip, insufficient output capacity and corruption rejection. It is not yet a durable journal: the Win32 host does not persist it, flush it, recover it on startup or execute rollback file operations.
