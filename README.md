# مدیریت آموزش — Report Management System

سیستم مدیریت و ثبت گزارشات آموزشی — یک داشبورد مدیریتی مدرن، راست‌به‌چپ و
فارسی/دری برای سازمان‌های آموزشی، ساخته‌شده با React، TypeScript، Tailwind
CSS و Supabase.

## ویژگی‌ها

- ورود امن با Supabase Auth و کنترل دسترسی مبتنی بر نقش (مدیر سیستم، مدیر
  بخش، گزارش‌دهنده)
- داشبورد با کارت‌های آماری (مجموع، در انتظار، تایید شده، رد شده)
- فرم چندمرحله‌ای ثبت گزارش: اطلاعات پایه، جزئیات فعالیت، اشتراک‌کنندگان
  (با محاسبه خودکار مجموع)، نتایج، پیوست‌ها
- لیست گزارشات با اسکرول بی‌نهایت (۲۰ گزارش در هر بار)، جستجوی پیشرفته و
  خروجی Excel/PDF
- صفحات اختصاصی «امتحان‌ها» و «سمینارها»
- مدیریت کاربران (فقط مدیر سیستم)
- طراحی Glassmorphism با تم تیره سرمه‌ای و حاشیه‌های درخشان فیروزه‌ای،
  فونت Vazirmatn، کاملاً واکنش‌گرا

## پشته فناوری

- **Frontend:** React 18، TypeScript، Vite، Tailwind CSS، کامپوننت‌های
  سبک shadcn/ui روی Radix UI
- **Backend:** Supabase (PostgreSQL، Auth، Storage، Row Level Security)
- فرم‌ها: React Hook Form + Zod — دیتا: TanStack Query — تقویم: شمسی/جلالی

## راه‌اندازی

```bash
npm install
cp .env.example .env   # مقادیر Supabase را وارد کنید
npm run dev
```

راهنمای کامل ساخت پایگاه‌داده و تنظیم Supabase در
[`supabase/README.md`](./supabase/README.md) قرار دارد — خلاصه:

1. یک پروژه در supabase.com بسازید و `VITE_SUPABASE_URL` /
   `VITE_SUPABASE_ANON_KEY` را در `.env` قرار دهید.
2. محتوای `supabase/migrations/0001_init.sql` را در SQL Editor اجرا کنید
   (جداول، RLS، bucket پیوست‌ها را می‌سازد).
3. از طریق صفحه ورود ثبت‌نام کنید، سپس نقش خودتان را در جدول `users` به
   `admin` تغییر دهید.

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
`index.html` مسیرهای داخلی (مثل `/reports`) را در برابر رفرش مستقیم روی
Pages محافظت می‌کنند (تکنیک استاندارد
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
  components/layout/   سایدبار، هدر، مسیرهای محافظت‌شده
  components/reports/  فرم چندمرحله‌ای، فیلترها، لیست گزارشات
  components/dashboard/کارت‌های آماری
  context/              AuthContext (نشست، پروفایل، نقش)
  hooks/                کوئری‌ها و mutation های Supabase
  lib/                  کلاینت Supabase، تاریخ شمسی، خروجی اکسل/PDF
  pages/                صفحات هر مسیر
  types/database.ts     تایپ‌های TypeScript متناظر با پایگاه‌داده
supabase/
  migrations/0001_init.sql   شمای کامل پایگاه‌داده + RLS + Storage
```

## نقش‌ها و دسترسی‌ها

| نقش              | دسترسی                                                          |
| ----------------- | ----------------------------------------------------------------- |
| مدیر سیستم (admin)| مشاهده/ویرایش/حذف همه گزارشات، مدیریت کاربران، خروجی، آمار کامل |
| مدیر بخش (manager)| بررسی، تایید/رد گزارشات، مشاهده آمار                            |
| گزارش‌دهنده       | ثبت گزارش، مشاهده گزارشات خود، ویرایش گزارش در حالت «در انتظار» |

همه محدودیت‌ها در سطح پایگاه‌داده با Row Level Security پیاده‌سازی
شده‌اند، نه فقط در رابط کاربری.
