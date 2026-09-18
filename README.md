# چندچندی؟ (ChandChandi)

> داشبورد قیمت لحظه‌ای ارز، طلا و رمزارز با طراحی رترو **Neobrutalism** (الهام‌گرفته از [neobrutal-ui](https://github.com/bridgetamana/neobrutal-ui)).  
> کنایه‌ای به نوسانات ثانیه‌ای بازار و سردرگمی همیشگی: *«الان چندچندی با خودت؟!»*

[![GitHub Pages](https://img.shields.io/badge/Live-GitHub%20Pages-00F5D4?style=for-the-badge&logo=github&logoColor=black)](https://ramin-mahmoodi.github.io/chandchandi/)
[![Style](https://img.shields.io/badge/Style-Neobrutalism-FFE600?style=for-the-badge&logoColor=black)](https://github.com/ramin-mahmoodi/chandchandi)
[![License](https://img.shields.io/badge/License-MIT-B8C0FF?style=for-the-badge)](https://github.com/ramin-mahmoodi/chandchandi/blob/main/LICENSE)

---

## ⚡ امکانات و ویژگی‌ها

- **طراحی مدرن Neobrutalism:** حاشیه‌های ضخیم مشکی، سایه‌های شارپ و بدون محو، دکمه‌های با فیدبک کلیک و پالت رنگی رترو پرانرژی.
- **۹۳ نماد کامل بازار مالی:**
  - **طلا و سکه:** ۱۸ عیار، آبشده، سکه امامی، بهار آزادی، نیم سکه، ربع سکه، سکه گرمی، انس طلا و نقره + محاسبه حباب سکه.
  - **ارزهای فیات:** دلار، یورو، درهم، پوند، لیر و نرخ‌های بازارهای مرزی و منطقه‌ای (سلیمانیه، هرات، استانبول و حواله).
  - **رمزارزها:** ۴۰ ارز دیجیتال برتر (تتر، بیت‌کوین، اتریوم، سولانا، تون‌کوین، نات‌کوین و...).
- **ماشین‌حساب تبدیل سریع:** تبدیل نرخ هر ارز/رمزارز به تومان/ریال و محاسبه‌گر ارزش وزنی طلای ۱۸ عیار خام.
- **نشان‌کردن علاقه‌مندی‌ها (⭐):** پین کردن سریع نمادها با ذخیره در حافظه مرورگر (`localStorage`).
- **تغییر واحد ریال / تومان:** سوئیچ با یک کلیک بین تومان و ریال در کل سایت.
- **جستجوی آنی:** فیلتر بر اساس نام فارسی، انگلیسی یا اسلاگ نمادها.
- **تایمر به‌روزرسانی زنده:** ریفرش خودکار هر ۳۰ ثانیه به همراه ثانیه‌شمار زنده.
- **مقاوم در برابر آفلاین (Fallback Cache):** ذخیره آخرین دیتا در حافظه محلی + دیتاست آفلاین همراه برای تضمین در دسترس بودن دائمی سایت.

---

## 🌐 مشاهده آنلاین (Live Demo)

سایت به طور خودکار روی گیت‌هاب پیجز به آدرس زیر منتشر می‌شود:  
👉 **[https://ramin-mahmoodi.github.io/chandchandi/](https://ramin-mahmoodi.github.io/chandchandi/)**

---

## 💻 اجرای محلی (Local Development)

```bash
git clone https://github.com/ramin-mahmoodi/chandchandi.git
cd chandchandi
python -m http.server 8000
```
سپس آدرس `http://localhost:8000` را در مرورگر باز کنید.

---

## 🚀 استقرار روی GitHub Pages

این مخزن شامل اکشن خودکار `.github/workflows/gh-pages.yml` است:
1. در صفحه مخزن خود در گیت‌هاب وارد **Settings** > **Pages** شوید.
2. گزینه **Source** را روی **GitHub Actions** تنظیم کنید.
3. با هر بار Push روی شاخه `main`، وب‌سایت به صورت خودکار بیلد و منتشر می‌شود.

---

## 🛡️ پروکسی CORS و کلودفلر

به دلیل محدودیت‌های CORS مرورگر، برنامه از پروکسی‌های کلاینت‌ساید استفاده می‌کند. در صورت تمایل می‌توانید با اسکریپت آماده در پوشه `cloudflare-worker/worker.js`، پروکسی اختصاصی خود را روی دامنه شخصی در کلودفلر راه‌اندازی کرده و در بخش تنظیمات (⚙️) سایت وارد کنید.
