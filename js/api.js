/**
 * Alanchand API Client for Browser (JavaScript)
 * Includes Web Crypto HMAC-SHA256 with pure JS fallback,
 * and resilient multi-proxy / fallback strategies.
 */

const ALANCHAND_CONFIG = {
  apiUrl: 'https://api.alanchand.com/app/v2.php',
  appVersion: '3.1.0',
  publicKey: 'fc6cdb49aeae4b8feea5b1f574701944',
  hmacSecret: 'eec8497f92e73aa5bef4960ff3af950764042f8d06df10e1ece919e895f7db30',
  defaultSlugs: 'usd,eur,try,aed,gbp,cad,aud,rub,azn,cny,sek,inr,thb,chf,qar,amd,krw,pkr,jpy,omr,afn,myr,iqd,gel,sar,usd-sulaymaniyah,usd-herat,usd-ist,usd-hav,eur-ist,eur-hav,ars,bhd,brl,dkk,hkd,kgs,kwd,nok,nzd,sgd,syp,tjs,tmt,abshodeh,18ayar,sekkeh,bahar,nim,rob,gerami,usd_xau,xag,usdt,btc,eth,xrp,bnb,shib,ada,doge,ton,not,sol,trx,cake,avax,dot,link,ltc,pepe,uni,xlm,fil,near,eos,aave,grt,xtz,flow,sand,mana,axs,chz,enj,zec,gala,lrc,bat,one,zen,cvc,storj'
};

// Pure JS HMAC-SHA256 implementation fallback for non-secure contexts (file://)
function jsSha256(ascii) {
  function rightRotate(value, amount) {
    return (value >>> amount) | (value << (32 - amount));
  }
  const mathPow = Math.pow;
  const maxWord = mathPow(2, 32);
  let lengthProperty = 'length';
  let i, j;
  let result = '';

  const words = [];
  const asciiBitLength = ascii[lengthProperty] * 8;

  let hash = [
    0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
    0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19
  ];

  const k = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
  ];

  for (i = 0; i < ascii[lengthProperty]; i++) {
    const j = ascii.charCodeAt(i);
    words[i >> 2] |= (j & 0xff) << ((3 - (i % 4)) * 8);
  }

  words[asciiBitLength >> 5] |= 0x80 << (24 - (asciiBitLength % 32));
  words[(((asciiBitLength + 64) >> 9) << 4) + 15] = asciiBitLength;

  for (let b = 0; b < words[lengthProperty]; b += 16) {
    const w = words.slice(b, b + 16);
    const oldHash = hash.slice(0);

    for (i = 0; i < 64; i++) {
      let s1 = rightRotate(w[i - 2], 17) ^ rightRotate(w[i - 2], 19) ^ (w[i - 2] >>> 10);
      let s0 = rightRotate(w[i - 15], 7) ^ rightRotate(w[i - 15], 18) ^ (w[i - 15] >>> 3);
      if (i >= 16) {
        w[i] = (w[i - 16] + s0 + w[i - 7] + s1) | 0;
      }

      const ch = (hash[4] & hash[5]) ^ (~hash[4] & hash[6]);
      const temp1 = (hash[7] + (rightRotate(hash[4], 6) ^ rightRotate(hash[4], 11) ^ rightRotate(hash[4], 25)) + ch + k[i] + w[i]) | 0;
      const maj = (hash[0] & hash[1]) ^ (hash[0] & hash[2]) ^ (hash[1] & hash[2]);
      const temp2 = ((rightRotate(hash[0], 2) ^ rightRotate(hash[0], 13) ^ rightRotate(hash[0], 22)) + maj) | 0;

      hash = [(temp1 + temp2) | 0, hash[0], hash[1], hash[2], (hash[3] + temp1) | 0, hash[4], hash[5], hash[6]];
    }

    for (i = 0; i < 8; i++) {
      hash[i] = (hash[i] + oldHash[i]) | 0;
    }
  }

  for (i = 0; i < 8; i++) {
    for (j = 3; j >= 0; j--) {
      const b = (hash[i] >> (8 * j)) & 255;
      result += (b < 16 ? '0' : '') + b.toString(16);
    }
  }
  return result;
}

function jsHmacSha256(key, message) {
  let blockKey = key;
  if (blockKey.length > 64) {
    // hash key
    let h = '';
    const raw = jsSha256(blockKey);
    for (let i = 0; i < raw.length; i += 2) {
      h += String.fromCharCode(parseInt(raw.substr(i, 2), 16));
    }
    blockKey = h;
  }
  while (blockKey.length < 64) {
    blockKey += '\0';
  }

  let oKeyPad = '';
  let iKeyPad = '';
  for (let i = 0; i < 64; i++) {
    oKeyPad += String.fromCharCode(blockKey.charCodeAt(i) ^ 0x5c);
    iKeyPad += String.fromCharCode(blockKey.charCodeAt(i) ^ 0x36);
  }

  const innerHashHex = jsSha256(iKeyPad + message);
  let innerHashStr = '';
  for (let i = 0; i < innerHashHex.length; i += 2) {
    innerHashStr += String.fromCharCode(parseInt(innerHashHex.substr(i, 2), 16));
  }

  return jsSha256(oKeyPad + innerHashStr);
}

class AlanchandApi {
  constructor() {
    this.customProxy = localStorage.getItem('alanchand_custom_proxy') || '';
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
    const queryParts = sortedKeys.map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`);
    const canonicalMessage = queryParts.join('&');

    // Try Web Crypto API if available
    if (window.crypto && window.crypto.subtle) {
      try {
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
      } catch (e) {
        console.warn('Web Crypto failed, using pure JS fallback', e);
      }
    }

    // Fallback to pure JS
    return jsHmacSha256(ALANCHAND_CONFIG.hmacSecret, canonicalMessage);
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
      .map(k => `${encodeURIComponent(k)}=${encodeURIComponent(params[k])}`)
      .join('&');

    return `${ALANCHAND_CONFIG.apiUrl}?${query}`;
  }

  async fetchPrices(slug = ALANCHAND_CONFIG.defaultSlugs, requestType = 'full') {
    const rawUrl = await this.buildSignedUrl(slug, requestType);
    let targetUrls = [];

    if (this.customProxy) {
      const formatted = this.customProxy.includes('{url}')
        ? this.customProxy.replace('{url}', encodeURIComponent(rawUrl))
        : `${this.customProxy.replace(/\/?$/, '/')}${encodeURIComponent(rawUrl)}`;
      targetUrls.push(formatted);
    }

    // Direct and proxies
    targetUrls.push(rawUrl);
    targetUrls.push(`https://api.allorigins.win/raw?url=${encodeURIComponent(rawUrl)}`);
    targetUrls.push(`https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(rawUrl)}`);

    for (const url of targetUrls) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3500);

        const resp = await fetch(url, {
          method: 'GET',
          signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (resp.ok) {
          const data = await resp.json();
          if (data && data.status === 'success' && data.data) {
            try {
              localStorage.setItem('alanchand_cached_data', JSON.stringify({
                timestamp: Date.now(),
                data: data
              }));
            } catch (e) {}
            return { source: 'live', data: data };
          }
        }
      } catch (err) {
        // Continue to next proxy
      }
    }

    // Local Storage cache fallback
    try {
      const cached = localStorage.getItem('alanchand_cached_data');
      if (cached) {
        const parsed = JSON.parse(cached);
        return { source: 'cache', data: parsed.data, cachedAt: parsed.timestamp };
      }
    } catch (e) {}

    // Bundled fallback data from window.ALANCHAND_FALLBACK_DATA
    if (window.ALANCHAND_FALLBACK_DATA) {
      return {
        source: 'bundled',
        data: {
          status: 'success',
          data: window.ALANCHAND_FALLBACK_DATA,
          updated_at: window.ALANCHAND_UPDATED_AT || 'امروز'
        }
      };
    }

    throw new Error('All data sources unavailable');
  }
}

window.alanchandApi = new AlanchandApi();
