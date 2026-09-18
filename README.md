<div align="center">

# چندچندی؟ (ChandChandi)

**داشبورد سبک، ایستا و لحظه‌ای نرخ طلا، سکه، ارزهای فیات و رمزارزها با معماری نئوبروتالیسم (Neobrutalism)**

<br />

<img src="assets/preview.png?v=2" alt="ChandChandi Preview" width="100%" />

</div>

## معرفی پروژه

پروژه «چندچندی؟» یک وب‌اپلیکیشن مستقل و ایستا (Client-Side / Static) است که برای استعلام و نمایش شفاف، سریع و بدون تاخیر نرخ‌های زنده بازار مالی ایران توسعه یافته است.

داده‌های قیمتی، متدهای ارتباطی و ساختار نمادهای این سیستم بر پایه مهندسی معکوس و استفاده مستقیم از API رسمی اپلیکیشن اندروید وب‌سایت [الان‌چند (alanchand.com)](https://alanchand.com/) که در [گوگل پلی استور](https://play.google.com/store/apps/details?id=com.alanchand.com) منتشر شده است، پیاده‌سازی شده و کلیه پردازش‌های امنیتی آن مستقیماً در مرورگر یا اسکریپت‌های مستقل قابل اجرا است.

---

## راهنمای جامع API، اندپوینت‌ها و الگوریتم امضای دیجیتال

این بخش به نحوی مستند شده است که هر توسعه‌دهنده‌ای بتواند بدون نیاز به بررسی کدهای این مخزن، کلاینت اختصاصی خود را در هر زبان برنامه‌نویسی (پایتون، جاوااسکریپت، گو، پی‌اچ‌پی، سی‌شارپ یا cURL) پیاده‌سازی و قیمت‌های زنده را دریافت کند.

### مشخصات و پارامترهای ارتباطی پایه

- نشانی اندپوینت استعلام قیمت‌ها (API Endpoint):
  `https://api.alanchand.com/app/v2.php`
- متد درخواست (HTTP Method):
  `GET`
- کلید عمومی کلاینت (Public Key):
  `fc6cdb49aeae4b8feea5b1f574701944`
- کلید محرمانه امضای دیجیتال (HMAC Secret Key):
  `eec8497f92e73aa5bef4960ff3af950764042f8d06df10e1ece919e895f7db30`
- نسخه اپلیکیشن مرجع (App Version):
  `3.1.0`
- پلتفرم مبدا (Platform):
  `android`
- نوع استعلام داده (Type):
  `full`
- نشانی دریافت تصاویر نمادها (Assets CDN):
  `https://api.alanchand.com/assets/{type}/{SLUG}.png`
  - نمونه فیات: `https://api.alanchand.com/assets/currency/USD.png`
  - نمونه طلا و سکه: `https://api.alanchand.com/assets/gold/18AYAR.png`
  - نمونه رمزارز: `https://api.alanchand.com/assets/crypto/BTC.png`

---

### الگوریتم گام‌به‌گام تولید امضای دیجیتال (HMAC-SHA256)

سرور اپلیکیشن برای جلوگیری از دستکاری درخواست‌ها و تضمین سلامت آن‌ها، بررسی می‌کند که پارامترهای هر درخواست با الگوریتم HMAC-SHA256 امضا شده باشند. مراحل تولید درخواست به شرح زیر است:

#### گام ۱: ساخت دیکشنری پارامترها
ابتدا مقادیر زیر گردآوری می‌شوند (برچسب زمانی باید بر حسب ثانیه باشد):
- `key`: کلید عمومی کلاینت (`fc6cdb49aeae4b8feea5b1f574701944`)
- `platform`: رشته `android`
- `v`: رشته `3.1.0`
- `type`: رشته `full`
- `ts`: زمان یونیکس فعلی سیستم به ثانیه (مانند `1726671234`)
- `slug`: نمادهای درخواستی جداشده با کاما (مانند `usd,eur,18ayar,sekkeh,btc,usdt`)

#### گام ۲: مرتب‌سازی الفبایی و تشکیل رشته معیار (Canonical Query String)
کلیدهای دیکشنری به ترتیب الفبایی مرتب می‌شوند:
`key` -> `platform` -> `slug` -> `ts` -> `type` -> `v`

سپس هر کلید و مقدار با استاندارد URL Encode کدگذاری شده و با نویسه `&` به یکدیگر متصل می‌گردند:
```text
key=fc6cdb49aeae4b8feea5b1f574701944&platform=android&slug=usd%2Ceur%2C18ayar%2Csekkeh%2Cbtc%2Cusdt&ts=1726671234&type=full&v=3.1.0
```

#### گام ۳: محاسبه هش HMAC با کلید محرمانه
رشته معیار حاصل در گام ۲، به عنوان پیام ورودی به الگوریتم HMAC-SHA256 داده می‌شود. کلید هش برابر با رشته زیر است:
`eec8497f92e73aa5bef4960ff3af950764042f8d06df10e1ece919e895f7db30`

خروجی حاصل به صورت رشته هگزادسیمال با حروف کوچک (Lowercase Hex String با طول ۶۴ کاراکتر) تولید می‌شود:
```text
7508232c69cd37cb843a57cc27cea595fe4c67356f94868c4f08fba2f54ba56e
```

#### گام ۴: افزودن امضا و ارسال درخواست نهایی
رشته امضا تحت پارامتر `sign` به انتهای پارامترها افزوده شده و نشانی نهایی برای ارسال درخواست `GET` ساخته می‌شود:
```text
https://api.alanchand.com/app/v2.php?key=fc6cdb49aeae4b8feea5b1f574701944&platform=android&slug=usd%2Ceur%2C18ayar%2Csekkeh%2Cbtc%2Cusdt&ts=1726671234&type=full&v=3.1.0&sign=7508232c69cd37cb843a57cc27cea595fe4c67356f94868c4f08fba2f54ba56e
```

---

### راه‌اندازی پروکسی اختصاصی کلادفلر (Cloudflare Worker CORS Proxy)

مرورگرهای وب به دلیل سیاست امنیتی Same-Origin و محدودیت‌های CORS مانع از فراخوانی مستقیم API الان‌چند در محیط کلاینت‌ساید می‌شوند. همچنین پروکسی‌های عمومی اشتراکی در ساعات شلوغی ممکن است دچار کندی یا قطعی مقطعی گردند. 

برای برقراری ارتباط بدون واسطه، امن و پایدار، استفاده از یک ورکر شخصی روی شبکه ابری کلادفلر (Cloudflare Edge Network) توصیه می‌شود. پلن رایگان کلادفلر روزانه ۱۰۰٬۰۰۰ درخواست را بدون هزینه و با پاسخ‌دهی در کمتر از ۵۰ میلی‌ثانیه پردازش می‌کند.

#### استقرار خودکار با یک کلیک (1-Click Deploy)

با کلیک روی نشان زیر می‌توانید این ورکر را به صورت خودکار و بدون نیاز به دانلود کدی، روی حساب کلادفلر خود مستقر کنید:

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/ramin-mahmoodi/chandchandi)

#### مراحل راه‌اندازی دستی در داشبورد کلادفلر

۱. ورود به حساب کاربری در [workers.cloudflare.com](https://workers.cloudflare.com/).
۲. رفتن به بخش **Compute (Workers)** و کلیک روی **Create Application** و سپس **Create Worker**.
۳. تعیین نام دلخواه برای ورکر (مانند `chandchandi-proxy`) و فشردن دکمه **Deploy**.
۴. ورود به بخش **Edit code** و جایگزینی محتوا با سورس کد زیر.
۵. فشردن دکمه **Save and Deploy**.
۶. کپی کردن نشانی نهایی ورکر (مانند `https://chandchandi-proxy.your-subdomain.workers.dev/?url=`) و وارد کردن آن در بخش تنظیمات وب‌سایت «چندچندی؟».

#### استقرار از طریق خط فرمان (Wrangler CLI)

توسعه‌دهندگان می‌توانند با ابزار رسمی Wrangler در محیط ترمینال اقدام به استقرار کنند:

```bash
# ورود به حساب کلادفلر
npx wrangler login

# استقرار خودکار ورکر بر روی کلادفلر
npx wrangler deploy
```

#### سورس کد ورکر (`cloudflare-worker/worker.js`)

```javascript
export default {
  async fetch(request, env, ctx) {
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Accept, User-Agent',
      'Access-Control-Max-Age': '86400',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    const url = new URL(request.url);
    const targetUrl = url.searchParams.get('url');

    if (!targetUrl) {
      return new Response(JSON.stringify({ error: 'Missing ?url= parameter' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    try {
      const response = await fetch(targetUrl, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'okhttp/4.12.0'
        }
      });

      const body = await response.text();
      return new Response(body, {
        status: response.status,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json; charset=utf-8'
        }
      });
    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  }
};
```


---

### نمونه کدهای آماده برای استفاده مستقل

#### نمونه کامل با پایتون (Python 3):

```python
import time
import hmac
import hashlib
import urllib.parse
import requests

API_URL = "https://api.alanchand.com/app/v2.php"
PUBLIC_KEY = "fc6cdb49aeae4b8feea5b1f574701944"
SECRET_KEY = "eec8497f92e73aa5bef4960ff3af950764042f8d06df10e1ece919e895f7db30"

# ۱. پارامترهای درخواست
params = {
    "platform": "android",
    "v": "3.1.0",
    "key": PUBLIC_KEY,
    "ts": str(int(time.time())),
    "type": "full",
    "slug": "usd,eur,18ayar,sekkeh,btc,usdt"
}

# ۲. مرتب‌سازی الفبایی و تولید پیام معیار
sorted_keys = sorted(params.keys())
canonical_message = "&".join(
    f"{urllib.parse.quote(k)}={urllib.parse.quote(params[k])}"
    for k in sorted_keys
)

# ۳. تولید امضای HMAC-SHA256
signature = hmac.new(
    SECRET_KEY.encode("utf-8"),
    canonical_message.encode("utf-8"),
    hashlib.sha256
).hexdigest()

params["sign"] = signature

# ۴. ارسال درخواست
response = requests.get(API_URL, params=params, timeout=10)
data = response.json()
print("وضعیت پاسخ:", data.get("status"))
print("داده‌های دریافتی:", data.get("data", {}).get("data", {}).keys())
```

#### نمونه با جاوااسکریپت (Node.js):

```javascript
const crypto = require('crypto');

const API_URL = 'https://api.alanchand.com/app/v2.php';
const PUBLIC_KEY = 'fc6cdb49aeae4b8feea5b1f574701944';
const SECRET_KEY = 'eec8497f92e73aa5bef4960ff3af950764042f8d06df10e1ece919e895f7db30';

const params = {
  platform: 'android',
  v: '3.1.0',
  key: PUBLIC_KEY,
  ts: Math.floor(Date.now() / 1000).toString(),
  type: 'full',
  slug: 'usd,eur,18ayar,sekkeh,btc,usdt'
};

const sortedKeys = Object.keys(params).sort();
const canonical = sortedKeys.map(k => `${encodeURIComponent(k)}=${encodeURIComponent(params[k])}`).join('&');
const signature = crypto.createHmac('sha256', SECRET_KEY).update(canonical).digest('hex');

params.sign = signature;
const query = Object.keys(params).map(k => `${encodeURIComponent(k)}=${encodeURIComponent(params[k])}`).join('&');
const finalUrl = `${API_URL}?${query}`;

fetch(finalUrl)
  .then(res => res.json())
  .then(result => console.log(result))
  .catch(err => console.error(err));
```

---

### ساختار داده‌های خروجی سرور (JSON Schema)

پاسخ ارسالی از سرور ساختاری استاندارد دارد:

```json
{
  "status": "success",
  "data": {
    "updated_at": "2026-09-18T14:40:00Z",
    "data": {
      "usd": {
        "slug": "usd",
        "name": "US Dollar",
        "fa_name": "دلار آمریکا",
        "price": 935000,
        "buy": 930000,
        "sell": 935000,
        "change": 2500,
        "change_per": 0.27,
        "type": "currency"
      },
      "18ayar": {
        "slug": "18ayar",
        "name": "18 Karat Gold",
        "fa_name": "طلای ۱۸ عیار",
        "price": 7450000,
        "change": 30000,
        "change_per": 0.4,
        "type": "gold"
      },
      "sekkeh": {
        "slug": "sekkeh",
        "name": "Emami Coin",
        "fa_name": "سکه امامی",
        "price": 84200000,
        "bubble": 14200000,
        "bubble_per": 16.8,
        "type": "gold"
      }
    }
  }
}
```

---

### نمادهای مهم و دسته‌بندی اسلاگ‌ها

- طلا و سکه: `18ayar` (طلای ۱۸ عیار)، `abshodeh` (آبشده)، `sekkeh` (سکه امامی)، `bahar` (بهار آزادی)، `nim` (نیم سکه)، `rob` (ربع سکه)، `gerami` (سکه گرمی)، `usd_xau` (انس جهانی طلا)، `xag` (انس جهانی نقره).
- ارزهای شاخص: `usd` (دلار آمریکا)، `eur` (یورو)، `aed` (درهم امارات)، `try` (لیر ترکیه)، `gbp` (پوند انگلیس)، `cad` (دلار کانادا)، `cny` (یوان چین).
- ارزهای منطقه‌ای و مرزی: `usd-herat` (دلار هرات)، `usd-sulaymaniyah` (دلار سلیمانیه)، `usd-ist` (دلار استانبول)، `usd-hav` (حواله دلار).
- رمزارزهای اصلی: `usdt` (تتر)، `btc` (بیت‌کوین)، `eth` (اتریوم)، `sol` (سولانا)، `ton` (تون‌کوین)، `not` (نات‌کوین)، `trx` (ترون)، `doge` (دوج‌کوین).

---

## مشخصات فنی سامانه و طراحی

- رابط کاربری Neobrutalism: خطوط مشکی واضح، کادرهای برجسته ۲ پیکسلی، سایه‌های سخت بدون محو و تم رنگی اختصاصی.
- ماشین‌حساب تبدیل زنده: محاسبه بلادرنگ ارزش هر دارایی به تومان یا ریال و ماشین‌حساب طلای ۱۸ عیار با کلیدهای استپر گام‌به‌گام.
- منوی سفارشی انتخاب ارز: منوی اختصاصی مجهز به ابزار جستجوی آنی در اسلاگ‌ها و نام‌های فارسی بدون استفاده از سلکت پیش‌فرض مرورگر.
- پایداری بدون سرور: اجرای ۱۰۰٪ مستقل کلاینت‌ساید و امکان استقرار روی بسترهای ایستا.

---

## راه‌اندازی روی سیستم محلی

1. کلون کردن مخزن:
```bash
git clone https://github.com/ramin-mahmoodi/chandchandi.git
cd chandchandi
```

2. اجرای وب‌سرور محلی ساده (با پایتون یا هر سرویس‌دهنده فایل ایستا):
```bash
python -m http.server 8000
```

3. باز کردن نشانی در مرورگر:
```text
http://localhost:8000
```
