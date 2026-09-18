#!/usr/bin/env python3
import time
import hmac
import hashlib
import json
import urllib.parse
import urllib.request
import urllib.error

API_URL = "https://api.alanchand.com/app/v2.php"
APP_VERSION = "3.1.0"
PUBLIC_KEY = "fc6cdb49aeae4b8feea5b1f574701944"
HMAC_SECRET = "eec8497f92e73aa5bef4960ff3af950764042f8d06df10e1ece919e895f7db30"

def fetch_prices(slug="usd,eur,18ayar,btc"):
    ts = str(int(time.time()))
    params = {
        "platform": "android",
        "type": "full",
        "v": APP_VERSION,
        "key": PUBLIC_KEY,
        "ts": ts,
        "slug": slug
    }
    
    sorted_items = sorted(params.items(), key=lambda x: x[0])
    query_str = "&".join(f"{urllib.parse.quote(k, safe='')}={urllib.parse.quote(v, safe='')}" for k, v in sorted_items)
    sign = hmac.new(HMAC_SECRET.encode('utf-8'), query_str.encode('utf-8'), hashlib.sha256).hexdigest()
    params["sign"] = sign

    url = f"{API_URL}?{urllib.parse.urlencode(params)}"
    req = urllib.request.Request(url, headers={"User-Agent": "okhttp/4.12.0", "Accept": "application/json"})

    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            data = resp.read().decode('utf-8')
            parsed = json.loads(data)
            if parsed.get("status") == "success" and "data" in parsed:
                return parsed
    except Exception as e:
        print("Error fetching prices:", e)
    return None

def main():
    data = fetch_prices()
    if not data:
        print("Fetch failed, keeping existing data.")
        return 1

    # Save to data/fallback_prices.json
    with open("data/fallback_prices.json", "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    # Save to js/fallback-data.js
    js_content = '/**\n * Bundled Instant Fallback & Offline Market Data\n * Auto-updated by GitHub Actions\n */\n'
    js_content += 'window.ALANCHAND_FALLBACK_DATA = ' + json.dumps(data.get('data', {}), ensure_ascii=False, indent=2) + ';\n'
    js_content += 'window.ALANCHAND_UPDATED_AT = ' + json.dumps(data.get('updated_at', 'لحظاتی پیش'), ensure_ascii=False) + ';\n'

    with open("js/fallback-data.js", "w", encoding="utf-8") as f:
        f.write(js_content)

    print(f"Successfully updated {len(data.get('data', {}))} symbols!")
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
