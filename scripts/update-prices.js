const fs = require('fs');
const crypto = require('crypto');

const ALANCHAND_CONFIG = {
  apiUrl: 'https://api.alanchand.com/app/v2.php',
  appVersion: '3.1.0',
  publicKey: 'fc6cdb49aeae4b8feea5b1f574701944',
  hmacSecret: 'eec8497f92e73aa5bef4960ff3af950764042f8d06df10e1ece919e895f7db30',
  defaultSlugs: 'usd,eur,try,aed,gbp,cad,aud,rub,azn,cny,sek,inr,thb,chf,qar,amd,krw,pkr,jpy,omr,afn,myr,iqd,gel,sar,usd-sulaymaniyah,usd-herat,usd-ist,usd-hav,eur-ist,eur-hav,ars,bhd,brl,dkk,hkd,kgs,kwd,nok,nzd,sgd,syp,tjs,tmt,abshodeh,18ayar,sekkeh,bahar,nim,rob,gerami,usd_xau,xag,usdt,btc,eth,xrp,bnb,shib,ada,doge,ton,not,sol,trx,cake,avax,dot,link,ltc,pepe,uni,xlm,fil,near,eos,aave,grt,xtz,flow,sand,mana,axs,chz,enj,zec,gala,lrc,bat,one,zen,cvc,storj'
};

async function updateMarketData() {
  const ts = Math.floor(Date.now() / 1000).toString();
  const params = {
    platform: 'android',
    type: 'full',
    v: ALANCHAND_CONFIG.appVersion,
    key: ALANCHAND_CONFIG.publicKey,
    ts: ts,
    slug: ALANCHAND_CONFIG.defaultSlugs
  };

  const sortedKeys = Object.keys(params).sort();
  const queryParts = sortedKeys.map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`);
  params.sign = crypto.createHmac('sha256', ALANCHAND_CONFIG.hmacSecret).update(queryParts.join('&')).digest('hex');

  const query = Object.keys(params).map(k => `${encodeURIComponent(k)}=${encodeURIComponent(params[k])}`).join('&');
  const targetUrl = `${ALANCHAND_CONFIG.apiUrl}?${query}`;

  console.log(`[Update] Connecting to Alanchand API...`);
  const response = await fetch(targetUrl, {
    headers: {
      'Accept': 'application/json',
      'User-Agent': 'okhttp/4.12.0'
    },
    signal: AbortSignal.timeout(10000)
  });

  if (!response.ok) {
    throw new Error(`API responded with status: ${response.status}`);
  }

  const json = await response.json();
  if (json.status !== 'success' || !json.data) {
    throw new Error(`Invalid response format from API: ${JSON.stringify(json)}`);
  }

  const symbolCount = Object.keys(json.data).length;
  console.log(`[Update] Successfully retrieved ${symbolCount} market symbols. Timestamp: ${json.updated_at}`);

  const content = `/**
 * Bundled Complete 93 Symbols Market Data (Auto-Updated Snapshot)
 * Updated At: ${json.updated_at}
 */
window.ALANCHAND_FALLBACK_DATA = ${JSON.stringify(json.data)};
window.ALANCHAND_UPDATED_AT = ${JSON.stringify(json.updated_at)};
`;

  fs.writeFileSync('js/fallback-data.js', content, 'utf8');
  console.log(`[Update] js/fallback-data.js successfully written.`);
}

updateMarketData().catch(err => {
  console.error('[Error]', err.message);
  process.exit(1);
});
