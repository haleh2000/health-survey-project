# پرسشنامه سلامت — فرانت‌اند

React 19 + TypeScript + Vite + Tailwind v4، با معماری لایه‌ای (Clean Architecture).

## اجرا

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # tsc -b && vite build (تایپ‌چک هم همین‌جاست)
npm run lint     # ESLint + قوانین مرزبندی لایه‌ها
```

بک‌اند باید همزمان بالا باشد:

```bash
cd ../backend
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload      # http://127.0.0.1:8000
```

آدرس API از `VITE_API_URL` خوانده می‌شود (`.env.development` / `.env.production`).

## لایه‌ها

```
src/
├── core/            ابزار عمومی و مستقل از دامنه (Result، خطاها، HttpClient، تقویم جلالی)
├── design-system/   توکن‌های تم و کامپوننت‌های پایه — بدون هیچ دانشی از پرسشنامه
├── modules/survey/
│   ├── domain/          قواعد کسب‌وکار خالص: مدل سوال، اعتبارسنجی، نمایش شرطی، Value Objectها
│   ├── application/     Use Caseها: ارسال پرسشنامه، اعتبارسنجی مرحله، محاسبه پیشرفت
│   ├── infrastructure/  آداپتورها: قرارداد بک‌اند، مپرها، ریپازیتوری HTTP، محتوای سوال‌ها
│   └── presentation/    React: صفحه، کامپوننت‌ها، state ویزارد
└── app/             Composition Root — تنها جایی که همه لایه‌ها را می‌شناسد
```

**قانون وابستگی:** فلش‌ها فقط به سمت داخل‌اند.

```
presentation   ┐
               ├─→ application ─→ domain ─→ core
infrastructure ┘
```

`domain` هیچ‌وقت `react` یا `axios` را import نمی‌کند؛ `application` فقط به پورت‌های
`domain` وابسته است، نه به آداپتور. این قوانین در `eslint.config.js` با
`no-restricted-imports` اجباری شده‌اند، پس `npm run lint` نقض مرز را رد می‌کند.

هر لایه یک alias دارد (`@core`, `@ds`, `@survey`, `@app`)، بنابراین وابستگی
غیرمجاز از روی خود خط import پیداست.

## قرارداد با بک‌اند

بک‌اند فقط کلیدهای فارسی (`Field(alias=...)`) را می‌پذیرد و بیشتر پاسخ‌ها را با
`dict.get(value, 0)` امتیاز می‌دهد — یعنی یک فاصله یا رقم فارسیِ متفاوت **بدون
هیچ خطایی** صفر امتیاز می‌گیرد. برای همین:

- `infrastructure/contract/backend-contract.ts` رشته‌های دقیق بک‌اند را نگه می‌دارد
  (مستقیماً از سورس پایتون استخراج شده، نه تایپ دستی).
- `infrastructure/mappers/backend-value.map.ts` متن نمایشی UI را به مقدار مورد
  انتظار بک‌اند ترجمه می‌کند، تا متن فارسی UI اسیر تایپوهای بک‌اند نشود.
- `assertContractCoverage` هنگام بالا آمدن اپ بررسی می‌کند هیچ گزینه‌ای بدون
  ترجمه نمانده باشد. در حالت dev استثنا پرتاب می‌کند.
- `python3 ../backend/tools/check_contract.py` همین را از سمت پایتون چک می‌کند و
  برای CI مناسب است.

اگر متن یک سوال یا گزینه را عوض کردید، همین فایل‌ها را با هم به‌روز کنید.

## تم

توکن‌ها در `design-system/styles/theme.css` تعریف شده‌اند: یک لایه رنگ خام
(`--color-brand-*`) و یک لایه معنایی (`--color-surface`, `--color-ink`, …) که با
`@theme inline` به متغیرهای CSS وصل است و در حالت تیره عوض می‌شود.

حالت تیره کلاس‌محور است (`.dark` روی `<html>`) و `useThemeMode` بین
سیستم/روشن/تیره جابه‌جا می‌کند و انتخاب را در `localStorage` نگه می‌دارد.
