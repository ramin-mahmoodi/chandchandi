/**
 * Alanchand API Client for Browser (JavaScript)
 * Replicates the Android APK HMAC-SHA256 signing and query generation.
 */

const ALANCHAND_CONFIG = {
  apiUrl: 'https://api.alanchand.com/app/v2.php',
  appVersion: '3.1.0',
  publicKey: 'fc6cdb49aeae4b8feea5b1f574701944',
  hmacSecret: 'eec8497f92e73aa5bef4960ff3af950764042f8d06df10e1ece919e895f7db30',
  defaultSlugs: 'usd,eur,18ayar,btc'
};

class AlanchandApi {
  constructor() {
    this.customProxy = localStorage.getItem('alanchand_custom_proxy') || '';
    this.proxyIndex = 0;
    this.proxies = [
      (url) => https://api.allorigins.win/raw?url=,
      (url) => https://corsproxy.io/?url=,
      (url) => url // Direct attempt
    ];
  }

  setCustomProxy(proxyUrl) {
    this.customProxy = (proxyUrl || '').trim();
    if (this.customProxy) {
      localStorage.setItem('alanchand_custom_proxy', this.customProxy);
    } else {
      localStorage.removeItem('alanchand_custom_proxy');
    }
  }

  getCustomProxy() {
    return this.customProxy;
  }

  /**
   * Generates the APK-matching canonical query string and HMAC-SHA256 signature.
   */
  async makeSignature(params) {
    const sortedKeys = Object.keys(params).sort();
    const queryParts = sortedKeys.map(key => ${encodeURIComponent(key)}=);
    const canonicalMessage = queryParts.join('&');

    const encoder = new TextEncoder();
    const keyBytes = encoder.encode(ALANCHAND_CONFIG.hmacSecret);
    const msgBytes = encoder.encode(canonicalMessage);

    const cryptoKey = await window.crypto.subtle.importKey(
      'raw',
      keyBytes,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );

    const signature = await window.crypto.subtle.sign('HMAC', cryptoKey, msgBytes);
    const hashArray = Array.from(new Uint8Array(signature));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Builds the signed URL with all query parameters.
   */
  async buildSignedUrl(slug = ALANCHAND_CONFIG.defaultSlugs, requestType = 'full') {
    const ts = Math.floor(Date.now() / 1000).toString();
    const params = {
      platform: 'android',
      type: requestType,
      v: ALANCHAND_CONFIG.appVersion,
      key: ALANCHAND_CONFIG.publicKey,
      ts: ts,
      slug: slug
    };

    const signature = await this.makeSignature(params);
    params.sign = signature;

    const query = Object.keys(params)
      .map(k => ${encodeURIComponent(k)}=)
      .join('&');

    return ${ALANCHAND_CONFIG.apiUrl}?;
  }

  /**
   * Fetches latest prices using a resilient fallback strategy:
   * 1. Custom proxy (if set)
   * 2. Public CORS Proxies
   * 3. Cached localStorage data
   * 4. Bundled fallback_prices.json
   */
  async fetchPrices(slug = ALANCHAND_CONFIG.defaultSlugs, requestType = 'full') {
    const rawUrl = await this.buildSignedUrl(slug, requestType);
    let targetUrls = [];

    if (this.customProxy) {
      const formatted = this.customProxy.includes('{url}')
        ? this.customProxy.replace('{url}', encodeURIComponent(rawUrl))
        : ${this.customProxy.replace(/\/?$/, '/')};
      targetUrls.push(formatted);
    }

    // Add standard proxies
    targetUrls.push(this.proxies[0](rawUrl));
    targetUrls.push(this.proxies[1](rawUrl));
    targetUrls.push(this.proxies[2](rawUrl));

    let lastError = null;

    for (const url of targetUrls) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 12000);

        const resp = await fetch(url, {
          method: 'GET',
          signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (!resp.ok) {
          throw new Error(HTTP );
        }

        const data = await resp.json();
        if (data && data.status === 'success' && data.data) {
          // Cache successful response in localStorage
          try {
            localStorage.setItem('alanchand_cached_data', JSON.stringify({
              timestamp: Date.now(),
              data: data
            }));
          } catch (e) {
            console.warn('Could not cache in localStorage', e);
          }
          return { source: 'live', data: data };
        }
      } catch (err) {
        lastError = err;
        console.warn(Proxy failed: , err.message);
      }
    }

    // Attempt localStorage cache
    try {
      const cached = localStorage.getItem('alanchand_cached_data');
      if (cached) {
        const parsed = JSON.parse(cached);
        console.info('Serving from local cached data');
        return { source: 'cache', data: parsed.data, cachedAt: parsed.timestamp };
      }
    } catch (e) {
      console.warn('Failed reading localStorage cache', e);
    }

    // Fallback to static data file
    try {
      const resp = await fetch('data/fallback_prices.json');
      if (resp.ok) {
        const fallbackData = await resp.json();
        console.info('Serving from bundled fallback_prices.json');
        return { source: 'fallback', data: fallbackData };
      }
    } catch (e) {
      console.error('Failed reading fallback_prices.json', e);
    }

    throw new Error(lastError ? lastError.message : 'Unable to fetch prices from any source');
  }
}

window.alanchandApi = new AlanchandApi();
