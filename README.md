# مدیریت آموزش — Report Management System

سیستم مدیریت و ثبت گزارشات آموزشی — یک داشبورد مدیریتی مدرن، راست‌به‌چپ و
فارسی/دری برای سازمان‌های آموزشی، ساخته‌شده با React، TypeScript، Tailwind
CSS و Supabase. بدون صفحه ورود — با باز کردن لینک مستقیم داشبورد نمایش
داده می‌شود.

## ویژگی‌ها

- بدون لاگین — هرکسی که لینک را دارد مستقیم وارد داشبورد می‌شود
- داشبورد یکپارچه: کارت‌های آماری، شمارش گزارشات بر اساس نوع، و لیست کامل
  همه‌ی گزارش‌ها با اسکرول بی‌نهایت، جستجوی پیشرفته و خروجی Excel/PDF
- روی هر گزارش یک تیک «انجام شده؟» — تا زده نشود، گزارش «در انتظار» می‌ماند
- منوی «گزارش جدید»: فرم چندمرحله‌ای (اطلاعات پایه، جزئیات فعالیت،
  اشتراک‌کنندگان با محاسبه خودکار مجموع، نتایج، پیوست‌ها) و دکمه «ایجاد
  گزارش»؛ فیلدهای تکراری (نام گزارش‌دهنده/ولایت/ولسوالی/مرکز) از آخرین
  گزارش همان مرورگر خودکار پر می‌شوند
- طراحی Glassmorphism با تم تیره سرمه‌ای و حاشیه‌های درخشان فیروزه‌ای،
  فونت Vazirmatn، کاملاً واکنش‌گرا

## پشته فناوری

- **Frontend:** React 18، TypeScript، Vite، Tailwind CSS، کامپوننت‌های
  سبک shadcn/ui روی Radix UI
- **Backend:** Supabase (PostgreSQL، Storage، توابع دیتابیسی برای ذخیره
  اتمیک گزارش) — بدون Auth، دسترسی به‌صورت باز (RLS فعال ولی همه اجازه
  دارند)
- فرم‌ها: React Hook Form + Zod — دیتا: TanStack Query — تقویم: شمسی/جلالی

## راه‌اندازی

```bash
npm install
cp .env.example .env   # مقادیر Supabase را وارد کنید
npm run dev
```

راهنمای کامل ساخت پایگاه‌داده در [`supabase/README.md`](./supabase/README.md)
قرار دارد — خلاصه:

1. یک پروژه در supabase.com بسازید و `VITE_SUPABASE_URL` /
   `VITE_SUPABASE_ANON_KEY` را در `.env` قرار دهید.
2. به‌ترتیب محتوای فایل‌های `supabase/migrations/0001_init.sql`،
   `0002_atomic_report_save.sql` و `0003_open_access_no_auth.sql` را در
   SQL Editor اجرا کنید.

## استقرار روی GitHub Pages

یک workflow آماده در `.github/workflows/deploy.yml` قرار دارد که با هر
push به `main`، اپ را build کرده و روی GitHub Pages منتشر می‌کند. برای
فعال‌سازی (فقط یک‌بار لازم است):

1. به **Settings → Pages** بروید و **Source** را روی **GitHub Actions**
   بگذارید (نه «Deploy from a branch»).
2. مقادیر `VITE_SUPABASE_URL` و `VITE_SUPABASE_ANON_KEY` را به‌صورت
   **Repository secret** در **Settings → Secrets and variables → Actions**
   اضافه کنید (workflow از قبل این دو secret را در مرحله build می‌خواند؛
   بدون آن‌ها اپ build می‌شود ولی به Supabase وصل نمی‌شود).
3. با merge شدن به `main`، آدرس سایت
   `https://<username>.github.io/<repo-name>/` خواهد بود.

چون این یک SPA با React Router است، `public/404.html` و اسکریپت داخل
`index.html` مسیرهای داخلی (مثل `/reports/:id`) را در برابر رفرش مستقیم
روی Pages محافظت می‌کنند (تکنیک استاندارد
[spa-github-pages](https://github.com/rafgraph/spa-github-pages)).

## اسکریپت‌ها

| دستور             | توضیح                              |
| ------------------ | ----------------------------------- |
| `npm run dev`      | اجرای سرور توسعه                   |
| `npm run build`    | بررسی تایپ + ساخت نسخه تولید       |
| `npm run preview`  | پیش‌نمایش نسخه ساخته‌شده           |

## ساختار پروژه

```
src/
  components/ui/       کامپوننت‌های پایه (دکمه، کارت، دیالوگ، جدول، ...)
  components/layout/   سایدبار (داشبورد + گزارش جدید)، هدر
  components/reports/  فرم چندمرحله‌ای، فیلترها، لیست گزارشات، تیک «انجام شده»
  components/dashboard/کارت‌های آماری
  hooks/                کوئری‌ها و mutation های Supabase
  lib/                  کلاینت Supabase، تاریخ شمسی، خروجی اکسل/PDF، حافظه فرم
  pages/                صفحات هر مسیر (داشبورد، فرم گزارش، جزئیات گزارش)
  types/database.ts     تایپ‌های TypeScript متناظر با پایگاه‌داده
supabase/
  migrations/0001_init.sql               شمای پایه پایگاه‌داده
  migrations/0002_atomic_report_save.sql ذخیره اتمیک گزارش (RPC)
  migrations/0003_open_access_no_auth.sql حذف نیاز به ورود، دسترسی باز
```

## امنیت

چون اپ بدون ورود کار می‌کند، هر کسی که لینک اپ (و کلید anon عمومی
Supabase) را داشته باشد می‌تواند گزارش ثبت/ویرایش/حذف کند. اگر لینک را
فقط برای افراد داخل سازمان خصوصی نگه دارید، این مدل کفایت می‌کند؛ برای
دسترسی عمومی/اینترنتی گسترده‌تر، بازگرداندن Auth و RLS مبتنی بر نقش
توصیه می‌شود.
