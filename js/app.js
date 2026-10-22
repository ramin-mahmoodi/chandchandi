/* ==========================================================================
   ChandChandi Application Logic
   - 93 Symbols (Gold & Coins, FX, Crypto)
   - Live signed API requests with multi-proxy fallback
   - Safe delegated image fallback (no inline handlers)
   - Interactive SVG sparklines and full SVG chart modal
   - Currency & 18K Gold calculators
   ========================================================================== */

document.documentElement.lang = 'fa';
document.documentElement.dir = 'rtl';

/* ZWNJ Ligature Fix for Persian Typography */
var ZW = '\u200C';
function zwNode(n) {
  var d = n.data;
  if (!d || !/\S/.test(d)) return;
  var p = n.parentNode;
  if (!p) return;
  var tn = p.nodeName;
  if (tn === 'SCRIPT' || tn === 'STYLE' || tn === 'OPTION' || tn === 'TEXTAREA' || tn === 'TITLE') return;
  var i = d.search(/\s*$/);
  if (d.charAt(i - 1) !== ZW) n.data = d.slice(0, i) + ZW + d.slice(i);
}
function zwTree(root) {
  var w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT), n, a = [];
  while ((n = w.nextNode())) a.push(n);
  a.forEach(zwNode);
}
new MutationObserver(function(ms) {
  ms.forEach(function(m) {
    if (m.type === 'characterData') zwNode(m.target);
    else m.addedNodes.forEach(function(x) {
      if (x.nodeType === 3) zwNode(x);
      else if (x.nodeType === 1) zwTree(x);
    });
  });
}).observe(document.body, { childList: true, subtree: true, characterData: true });
zwTree(document.body);

/* ---------- Catalogue: 93 symbols in 3 categories / 14 groups ---------- */
var RAW = `abshodeh|آبشده (مثقال طلا)|Raw 24K Gold
18ayar|گرم طلای ۱۸ عیار|18K Gold per Gram
sekkeh|سکه امامی|Full Coin
bahar|سکه بهار آزادی|Bahar Azadi Coin
nim|نیم سکه|Half Coin
rob|ربع سکه|Quarter Coin
gerami|سکه گرمی|Gram Coin
usd_xau|انس طلا|Gold Ounce
xag|انس نقره|Silver Ounce
usd|دلار آمریکا|US Dollar
eur|یورو|Euro
gbp|پوند انگلیس|British Pound
aed|درهم امارات|UAE Dirham
try|لیر ترکیه|Turkish Lira
usd-hav|حواله دلار|US Dollar Remittance
eur-hav|حواله یورو|Euro Remittance
usd-ist|دلار استانبول|US Dollar Istanbul
eur-ist|یورو استانبول|Euro Istanbul
usd-herat|دلار هرات|US Dollar Herat
usd-sulaymaniyah|دلار سلیمانیه|US Dollar Sulaymaniyah
azn|منات آذربایجان|Azerbaijani Manat
amd|درام ارمنستان|Armenian Dram
iqd|دینار عراق|Iraqi Dinar
afn|افغانی|Afghan Afghani
pkr|روپیه پاکستان|Pakistani Rupee
gel|لاری گرجستان|Georgian Lari
kgs|سوم قرقیزستان|Kyrgyzstani Som
tjs|سامانی تاجیکستان|Tajikistani Somoni
tmt|منات ترکمنستان|Turkmenistani Manat
syp|پوند سوریه|Syrian Pound
qar|ریال قطر|Qatari Riyal
omr|ریال عمان|Omani Rial
sar|ریال عربستان|Saudi Riyal
bhd|دینار بحرین|Bahraini Dinar
kwd|دینار کویت|Kuwaiti Dinar
cny|یوان چین|Chinese Yuan
inr|روپیه هند|Indian Rupee
thb|بات تایلند|Thai Baht
krw|وون کره جنوبی|South Korean Won
jpy|ین ژاپن|Japanese Yen
myr|رینگیت مالزی|Malaysian Ringgit
hkd|دلار هنگ‌کنگ|Hong Kong Dollar
sgd|دلار سنگاپور|Singapore Dollar
aud|دلار استرالیا|Australian Dollar
nzd|دلار نیوزلند|New Zealand Dollar
cad|دلار کانادا|Canadian Dollar
chf|فرانک سوئیس|Swiss Franc
sek|کرون سوئد|Swedish Krona
nok|کرون نروژ|Norwegian Krone
dkk|کرون دانمارک|Danish Krone
rub|روبل روسیه|Russian Ruble
ars|پزو آرژانتین|Argentine Peso
brl|رئال برزیل|Brazilian Real
usdt|تتر|Tether
btc|بیت‌کوین|Bitcoin
eth|اتریوم|Ethereum
bnb|بایننس کوین|Binance Coin
sol|سولانا|Solana
xrp|ریپل|Ripple
ton|تون‌کوین|Toncoin
trx|ترون|TRON
ada|کاردانو|Cardano
ltc|لایت‌کوین|Litecoin
doge|دوج‌کوین|Dogecoin
shib|شیبا|Shiba Inu
pepe|پپه|Pepe
not|نات‌کوین|Notcoin
link|چین‌لینک|Chainlink
uni|یونی‌سواپ|Uniswap
aave|آوه|Aave
cake|پنکیک‌سواپ|PancakeSwap
grt|گراف|The Graph
lrc|لوپرینگ|Loopring
fil|فایل‌کوین|Filecoin
storj|استورج|Storj
bat|بت|Basic Attention Token
cvc|سیویک|Civic
sand|سندباکس|The Sandbox
mana|دی‌سنترالند|Decentraland
axs|اکسی اینفینیتی|Axie Infinity
gala|گالا|Gala
enj|انجین کوین|Enjin Coin
chz|چیلیز|Chiliz
flow|فلو|Flow
avax|آوالانچ|Avalanche
dot|پولکادات|Polkadot
near|نیر پروتکل|NEAR Protocol
xlm|استلار|Stellar
eos|ایاس|EOS
xtz|تزوس|Tezos
zec|زدکش|Zcash
one|هارمونی|Harmony
zen|هورایزن|Horizen`;

var META = {};
RAW.split('\n').forEach(function(l) {
  var p = l.split('|');
  META[p[0]] = { fa: p[1], en: p[2] };
});

var AV = { abshodeh: 'Au', '18ayar': '18K', sekkeh: '۱', bahar: 'B', nim: '½', rob: '¼', gerami: 'g', usd_xau: 'XAU', xag: 'XAG' };

var CATS = [
  {
    id: 'gold', name: 'طلا و سکه', type: 'gold', groups: [
      { name: 'طلا و فلزات گرانبها', s: ['18ayar', 'abshodeh', 'usd_xau', 'xag'] },
      { name: 'سکه', s: ['sekkeh', 'bahar', 'nim', 'rob', 'gerami'] }
    ]
  },
  {
    id: 'fx', name: 'ارز', type: 'fx', groups: [
      { name: 'ارزهای شاخص', s: ['usd', 'eur', 'gbp', 'aed', 'try'] },
      { name: 'حواله و بازار مرزی', s: ['usd-hav', 'eur-hav', 'usd-ist', 'eur-ist', 'usd-herat', 'usd-sulaymaniyah'] },
      { name: 'همسایگان و منطقه', s: ['azn', 'amd', 'iqd', 'afn', 'pkr', 'gel', 'kgs', 'tjs', 'tmt', 'syp'] },
      { name: 'خلیج فارس', s: ['qar', 'omr', 'sar', 'bhd', 'kwd'] },
      { name: 'آسیا و اقیانوسیه', s: ['cny', 'inr', 'thb', 'krw', 'jpy', 'myr', 'hkd', 'sgd', 'aud', 'nzd'] },
      { name: 'اروپا و آمریکا', s: ['cad', 'chf', 'sek', 'nok', 'dkk', 'rub', 'ars', 'brl'] }
    ]
  },
  {
    id: 'crypto', name: 'رمزارز', type: 'crypto', groups: [
      { name: 'ارزهای اصلی', s: ['usdt', 'btc', 'eth', 'bnb', 'sol', 'xrp', 'ton', 'trx', 'ada', 'ltc'] },
      { name: 'میم‌کوین', s: ['doge', 'shib', 'pepe', 'not'] },
      { name: 'دیفای و زیرساخت', s: ['link', 'uni', 'aave', 'cake', 'grt', 'lrc', 'fil', 'storj', 'bat', 'cvc'] },
      { name: 'بازی و متاورس', s: ['sand', 'mana', 'axs', 'gala', 'enj', 'chz', 'flow'] },
      { name: 'شبکه‌های لایه‌یک', s: ['avax', 'dot', 'near', 'xlm', 'eos', 'xtz', 'zec', 'one', 'zen'] }
    ]
  }
];

var TYPE = {}, CATOF = {};
CATS.forEach(function(c) {
  c.groups.forEach(function(g) {
    g.s.forEach(function(s) {
      TYPE[s] = c.type;
      CATOF[s] = c.id;
    });
  });
});

var USD_UNIT = { usd_xau: 1, xag: 1 };
var HOME_TILES = ['eur', 'sekkeh', 'btc', 'usdt'];

/* ---------- Data Model & Normalization ---------- */
function pts(a) {
  return (a || []).map(function(p) {
    return Array.isArray(p) ? { l: p[0], v: p[1] } : p;
  });
}

function norm(s, x, map) {
  if (!x) return null;
  var T = TYPE[s], o = { chart: null }, c = x.chart;
  if (c) {
    var m = pts(c.month), y = pts(c.year), a = pts(c.all);
    if (m.length && y.length && a.length >= 3) {
      var dup = (m.length === y.length && m[0].l === y[0].l) || ((y[y.length - 1].l - y[0].l) < 55 * 86400);
      if (dup) {
        var lt = a[a.length - 1].l, f = a.filter(function(q) { return q.l >= lt - 370 * 86400; });
        if (f.length >= 3) y = f;
      }
    }
    o.chart = { month: m, year: y, all: a };
  }
  if (T === 'crypto') {
    var ut = (map.usdt && map.usdt.toman) ? map.usdt.toman : ((map.usd && map.usd.sell) || 0);
    o.usd = Number(x.price) || 0;
    o.p = x.toman > 0 ? Number(x.toman) : ((o.usd && ut) ? o.usd * ut : null);
    o.ch = x.change_24h != null ? Number(x.change_24h) : (x.toman24hchange != null ? Number(x.toman24hchange) : 0);
    o.c1h = x.change_1h; o.c7 = x.change_7d; o.c30 = x.change_30d; o.c90 = x.change_90d; o.c365 = x.change_365d;
  } else if (T === 'gold') {
    o.p = Number(x.price) || 0;
    o.ch = Number(x.dayChangePer) || 0;
    o.real = Number(x.real_price) || 0;
    o.bub = x.bubble;
    o.bubp = x.bubble_per;
  } else {
    o.p = Number(x.sell != null ? x.sell : x.price) || 0;
    o.sell = x.sell != null ? Number(x.sell) : null;
    o.buy = x.buy != null ? Number(x.buy) : null;
    o.ch = Number(x.dayChangePer) || 0;
  }
  return o;
}

function applyMap(map) {
  var d = {};
  Object.keys(META).forEach(function(s) {
    var n = norm(s, map[s], map);
    if (n) d[s] = n;
  });
  S.data = d;
}

/* ---------- State Management ---------- */
var S = {
  sort: 'def',
  collapsed: {},
  tab: 'home',
  group: { gold: -1, fx: -1, crypto: -1 },
  unit: 'toman',
  data: {},
  live: false,
  stale: null,
  snapT: null,
  err: false,
  flash: {},
  updated: null,
  favs: [],
  proxy: '',
  interval: 30
};

function lsGet(k, d) {
  try {
    var v = localStorage.getItem(k);
    return v == null ? d : v;
  } catch(e) {
    return d;
  }
}
function lsSet(k, v) {
  try { localStorage.setItem(k, v); } catch(e) {}
}

try { S.favs = JSON.parse(lsGet('cc_favs', '[]')) || []; } catch(e) { S.favs = []; }
S.proxy = lsGet('cc_proxy', '');
S.interval = parseInt(lsGet('cc_interval', '30'), 10);
S.unit = lsGet('cc_unit', 'toman');
var thm = lsGet('cc_theme', '');
if (thm) document.documentElement.setAttribute('data-theme', thm);

/* ---------- Formatting & Sanitization ---------- */
function toEn(s) {
  return String(s || '').replace(/[۰-۹]/g, function(c) {
    return c.charCodeAt(0) - 1776;
  }).replace(/[٠-٩]/g, function(c) {
    return c.charCodeAt(0) - 1632;
  }).replace(/[٬,،\s]/g, '').replace(/٫/g, '.');
}

function fmt(v, max) {
  return Number(v).toLocaleString('fa-IR', { maximumFractionDigits: max == null ? 0 : max });
}

function fmtPrice(v) {
  var a = Math.abs(v);
  if (a > 0 && a < 1) return Number(v.toPrecision(3)).toLocaleString('fa-IR', { maximumFractionDigits: 12 });
  return fmt(v, a >= 1000 ? 0 : 2);
}

function priceOf(s) {
  var d = S.data[s];
  return d && d.p != null ? Number(d.p) : null;
}

function disp(s, v) {
  return USD_UNIT[s] ? v : (S.unit === 'rial' ? v * 10 : v);
}

function unitLabel(s) {
  return USD_UNIT[s] ? 'دلار' : (S.unit === 'rial' ? 'ریال' : 'تومان');
}

function pill(ch) {
  if (ch == null || isNaN(ch)) return '<span class="pill flat">—</span>';
  var c = ch > 0.004 ? 'up' : (ch < -0.004 ? 'down' : 'flat');
  var a = c === 'up' ? '▲' : (c === 'down' ? '▼' : '●');
  return '<span class="pill ' + c + ' num">' + a + ' ' + fmt(Math.abs(ch), 2) + '٪</span>';
}

function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, function(c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
  });
}

/* ---------- UI Components & Rendering ---------- */
var ICONS = {};
var SYM = {
  usd: '$', eur: '€', gbp: '£', try: '₺', jpy: '¥', cny: '¥', inr: '₹', krw: '₩', rub: '₽', thb: '฿',
  btc: '₿', eth: 'Ξ', usdt: '₮', ltc: 'Ł', doge: 'Ð', pkr: '₨', afn: '؋', azn: '₼', amd: '֏', gel: '₾',
  brl: 'R$', aud: 'A$', cad: 'C$', nzd: 'NZ$', hkd: 'HK$', sgd: 'S$', chf: 'Fr', myr: 'RM', sek: 'kr',
  nok: 'kr', dkk: 'kr', 'usd-hav': '$', 'usd-ist': '$', 'usd-herat': '$', 'usd-sulaymaniyah': '$',
  'eur-hav': '€', 'eur-ist': '€', abshodeh: 'Au', '18ayar': '۱۸', sekkeh: '۱', bahar: 'B', nim: '½',
  rob: '¼', gerami: 'g', usd_xau: 'Au', xag: 'Ag'
};

function avatar(s) {
  var code = (AV[s] || s.split(/[-_]/)[0]).toUpperCase().slice(0, 4);
  var g = SYM[s] || code;
  var T = TYPE[s];
  var F = s.toUpperCase();
  return '<div class="av t-' + T + '" aria-hidden="true">' +
    '<span class="g' + (g.length > 2 ? ' sm' : '') + '">' + esc(g) + '</span>' +
    '<span class="c">' + esc(code) + '</span>' +
    '<img alt="" loading="lazy" src="' + (ICONS[s] || ('assets/icons/' + T + '/' + F + '.png')) + '" data-n="https://api.alanchand.com/assets/' + T + '/' + F + '.png">' +
    '</div>';
}

/* Safe image fallback without inline handlers */
function imgFail(i) {
  var n = i.dataset.n;
  if (!n) { i.remove(); return; }
  i.dataset.n = '';
  i.src = n;
}
document.addEventListener('error', function(e) {
  var i = e.target;
  if (i && i.tagName === 'IMG') imgFail(i);
}, true);
document.addEventListener('load', function(e) {
  var i = e.target;
  if (i && i.tagName === 'IMG') i.style.opacity = '1';
}, true);

function pv(s, p, k) {
  return p == null ? '' : ' data-pv="' + disp(s, p) + '" data-pk="' + k + '"';
}

function openAttrs(s) {
  return ' data-open="' + s + '" tabindex="0" role="button" aria-label="نمودار ' + esc(META[s].fa) + '"';
}

var SPID = 0;
function spark(s) {
  var c = S.data[s] && S.data[s].chart, pp = c && c.month;
  if (!pp || pp.length < 2) return '';
  var ys = pp.map(function(q) { return q.v; });
  var xs = pp.map(function(q) { return q.l; });
  var mn = Math.min.apply(null, ys);
  var mx = Math.max.apply(null, ys);
  if (mx === mn) { mx += 1; mn -= 1; }
  var W = 100, H = 36, x0 = xs[0], x1 = xs[xs.length - 1], d = '', i;
  for (i = 0; i < ys.length; i++) {
    d += (i ? 'L' : 'M') + ((xs[i] - x0) / (x1 - x0 || 1) * W).toFixed(1) + ' ' + (3 + (1 - (ys[i] - mn) / (mx - mn)) * (H - 6)).toFixed(1);
  }
  var id = 'sg' + (++SPID);
  var up = ys[ys.length - 1] >= ys[0];
  return '<svg class="sp ' + (up ? 'up' : 'down') + '" viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="none" aria-hidden="true">' +
    '<defs><linearGradient id="' + id + '" x1="0" y1="0" x2="0" y2="1">' +
    '<stop offset="0" stop-color="currentColor" stop-opacity=".35"/>' +
    '<stop offset="1" stop-color="currentColor" stop-opacity="0"/>' +
    '</linearGradient></defs>' +
    '<path d="' + d + 'L' + W + ' ' + H + 'L0 ' + H + 'Z" fill="url(#' + id + ')"/>' +
    '<path class="sl" d="' + d + '" fill="none"/>' +
    '</svg>';
}

function fl(s) {
  return S.flash && S.flash[s] ? ' fl-' + S.flash[s] : '';
}

function row(s) {
  var m = META[s], d = S.data[s], p = priceOf(s), fav = S.favs.indexOf(s) > -1, ch = d && d.ch;
  var rc = ch == null ? 'flat' : (ch > 0.004 ? 'up' : (ch < -0.004 ? 'down' : 'flat'));
  var sub = '';
  if (d && d.buy != null && d.sell != null && d.buy !== d.sell) {
    sub = '<span class="buy num">خرید ' + fmtPrice(disp(s, d.buy)) + '</span>';
  } else if (d && TYPE[s] === 'crypto' && d.usd) {
    sub = '<span class="buy num" dir="ltr">$' + fmtPrice(d.usd) + '</span>';
  }
  return '<article class="row ' + rc + ' t-' + TYPE[s] + (USD_UNIT[s] ? ' usdu' : '') + '"' + openAttrs(s) + '>' +
    avatar(s) +
    '<div class="nm"><b>' + esc(m.fa) + '</b><small>' + esc(m.en) + '</small>' + sub + '</div>' +
    '<div class="pr"><b class="num' + fl(s) + '"' + pv(s, p, 'row') + '>' + (p == null ? '—' : fmtPrice(disp(s, p))) + '<em>' + unitLabel(s) + '</em></b><span class="pl"><span class="spk">' + spark(s) + '</span>' + pill(d && d.ch) + '</span></div>' +
    '<button class="star" data-star="' + s + '" aria-pressed="' + fav + '" aria-label="' + (fav ? 'حذف از علاقه‌مندی‌ها' : 'افزودن به علاقه‌مندی‌ها') + '">' + (fav ? '★' : '☆') + '</button>' +
    '</article>';
}

function hero(s) {
  var m = META[s], d = S.data[s], p = priceOf(s);
  var sub = '<span dir="ltr">' + esc(m.en) + '</span>';
  if (d && d.buy != null && d.sell != null && d.buy !== d.sell) {
    sub = '<span>خرید <b class="num">' + fmtPrice(disp(s, d.buy)) + '</b></span><span>فروش <b class="num">' + fmtPrice(disp(s, d.sell)) + '</b></span>';
  } else if (d && d.real > 0) {
    sub = '<span>ارزش ذاتی <b class="num">' + fmtPrice(disp(s, d.real)) + '</b></span><span>حباب <b class="num" dir="ltr">' + fmt(d.bubp, 2) + '٪</b></span>';
  }
  return '<div class="hero t-' + TYPE[s] + '"' + openAttrs(s) + '>' +
    spark(s) +
    '<div class="hl">' + avatar(s) +
    '<div class="ht"><small>' + (TYPE[s] === 'gold' ? 'بازار طلا' : 'بازار ارز') + '، ۳۰ روز اخیر</small><b>' + esc(m.fa) + '</b></div>' +
    pill(d && d.ch) +
    '</div>' +
    '<div class="hp num' + fl(s) + '"' + pv(s, p, 'hero') + '>' + (p == null ? '—' : fmtPrice(disp(s, p))) + '<em>' + unitLabel(s) + '</em></div>' +
    '<div class="hs">' + sub + '</div>' +
    '</div>';
}

function tile(s) {
  var m = META[s], p = priceOf(s), d = S.data[s];
  return '<div class="tile t-' + TYPE[s] + '"' + openAttrs(s) + '>' +
    '<div class="l">' + avatar(s) + '<span>' + esc(m.fa) + '</span></div>' +
    '<b class="num' + fl(s) + '"' + pv(s, p, 'tile') + '>' + (p == null ? '—' : fmtPrice(disp(s, p))) + '<em>' + unitLabel(s) + '</em></b>' +
    '<div class="tl">' + pill(d && d.ch) + '<span class="tsp">' + spark(s) + '</span></div>' +
    '</div>';
}

function chg(s) {
  var d = S.data[s];
  return d && d.ch != null ? Number(d.ch) : 0;
}

function sortSlugs(a) {
  var b = a.slice();
  if (S.sort === 'up') b.sort(function(x, y) { return chg(y) - chg(x); });
  else if (S.sort === 'down') b.sort(function(x, y) { return chg(x) - chg(y); });
  else if (S.sort === 'price') b.sort(function(x, y) { return (priceOf(y) || 0) - (priceOf(x) || 0); });
  return b;
}

function groupSection(name, slugs, type) {
  var up = 0, dn = 0;
  slugs.forEach(function(s) {
    var c = chg(s);
    if (c > 0.004) up++;
    else if (c < -0.004) dn++;
  });
  var open = !S.collapsed[name];
  return '<section class="grp t-' + type + '">' +
    '<button class="gh" data-gh="' + esc(name) + '" aria-expanded="' + open + '">' +
    '<span class="gt">' + esc(name) + '</span>' +
    '<span class="gs"><span class="up num">▲ ' + fmt(up) + '</span><span class="down num">▼ ' + fmt(dn) + '</span></span>' +
    '<svg viewBox="0 0 24 24"><path d="M6 9l6 6 6-6"/></svg>' +
    '</button>' +
    (open ? '<div class="list">' + sortSlugs(slugs).map(row).join('') + '</div>' : '') +
    '</section>';
}

/* Auto-fit long numbers gracefully */
function compactNum(v) {
  var a = Math.abs(v);
  if (a >= 1e9) return fmt(v / 1e9, 2) + ' میلیارد';
  if (a >= 1e6) return fmt(v / 1e6, 2) + ' میلیون';
  if (a >= 1e4) return fmt(v / 1e3, 1) + ' هزار';
  return fmtPrice(v);
}

function setPrice(b, compact) {
  var v = Number(b.dataset.pv), n = b.firstChild;
  if (n && n.nodeType === 3) n.nodeValue = compact ? compactNum(v) : fmtPrice(v);
}

function lineH(e) {
  var c = getComputedStyle(e), l = parseFloat(c.lineHeight);
  return isNaN(l) ? parseFloat(c.fontSize) * 1.4 : l;
}

function pmetric(b) {
  if (b.dataset.pk === 'row') {
    var r = b.closest('.row'), nb = r && r.querySelector('.nm b');
    if (!r || !nb) return 0;
    return (r.scrollWidth > r.clientWidth + 1 ? 1000 : 0) + nb.getBoundingClientRect().height;
  }
  return b.getBoundingClientRect().height;
}

function pthresh(b) {
  if (b.dataset.pk === 'row') {
    var nb = b.closest('.row') && b.closest('.row').querySelector('.nm b');
    return nb ? lineH(nb) * 1.5 : 24;
  }
  return lineH(b) * 1.6;
}

function fitPrices(root) {
  var list = (root || document).querySelectorAll('[data-pv]'), i, b, m0, m1;
  for (i = 0; i < list.length; i++) {
    b = list[i];
    if (b.offsetParent === null) continue;
    setPrice(b, false);
    m0 = pmetric(b);
    if (m0 <= pthresh(b)) continue;
    setPrice(b, true);
    m1 = pmetric(b);
    if (!(m1 < m0)) setPrice(b, false);
  }
}

var fitT = null;
function fitSoon() {
  clearTimeout(fitT);
  fitT = setTimeout(function() { fitPrices(); }, 80);
}
window.addEventListener('resize', fitSoon);
try {
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function() { fitPrices(); });
  if (document.fonts) document.fonts.addEventListener('loadingdone', fitSoon);
} catch(e) {}

/* ---------- Views Rendering ---------- */
function renderChips() {
  var box = document.getElementById('chips');
  var cat = CATS.filter(function(c) { return c.id === S.tab; })[0];
  if (!cat) {
    box.hidden = true;
    box.innerHTML = '';
    return;
  }
  box.hidden = false;
  var total = 0;
  cat.groups.forEach(function(g) { total += g.s.length; });
  var h = '<button data-g="-1" aria-pressed="' + (S.group[cat.id] === -1) + '">همه<small class="num">' + fmt(total) + '</small></button>';
  cat.groups.forEach(function(g, i) {
    h += '<button data-g="' + i + '" aria-pressed="' + (S.group[cat.id] === i) + '">' + esc(g.name) + '<small class="num">' + fmt(g.s.length) + '</small></button>';
  });
  box.innerHTML = h;
}

function renderView() {
  renderView0();
  fitPrices(document.getElementById('view'));
}

function renderView0() {
  var v = document.getElementById('view'), h = '';
  document.getElementById('filters').hidden = (['gold', 'fx', 'crypto'].indexOf(S.tab) < 0);
  renderChips();

  if (S.tab === 'tools') {
    v.innerHTML = toolsHTML();
    bindTools();
    return;
  }

  if (S.tab === 'home') {
    var cu = 0, cd = 0, cf = 0, all0 = Object.keys(META);
    all0.forEach(function(s) {
      var c = chg(s);
      if (c > 0.004) cu++;
      else if (c < -0.004) cd++;
      else cf++;
    });
    var mood = cu > cd * 1.6 ? 'بازار امروز صعودی است' : (cd > cu * 1.6 ? 'بازار امروز نزولی است' : 'بازار امروز آرام است');
    h += '<div class="pulse">' +
      '<h2 class="mood"><span>' + mood + '</span><small>' + fmt(all0.length) + ' نماد در ۲۴ ساعت</small></h2>' +
      '<div class="bar" role="img" aria-label="' + cu + ' صعودی، ' + cd + ' نزولی">' +
      '<i class="u" style="width:' + (cu / all0.length * 100) + '%"></i>' +
      '<i class="f" style="width:' + (cf / all0.length * 100) + '%"></i>' +
      '<i class="d" style="width:' + (cd / all0.length * 100) + '%"></i>' +
      '</div>' +
      '<div class="legend">' +
      '<span><b class="num">' + fmt(cu) + '</b> صعودی</span>' +
      '<span><b class="num">' + fmt(cf) + '</b> بدون تغییر</span>' +
      '<span><b class="num">' + fmt(cd) + '</b> نزولی</span>' +
      '</div></div>';

    h += '<div class="heroes">' + hero('usd') + hero('18ayar') + '</div>';
    h += '<div class="tiles">' + HOME_TILES.map(tile).join('') + '</div>';

    var all = Object.keys(META).filter(function(s) { return S.data[s] && S.data[s].ch != null; });
    all.sort(function(a, b) { return S.data[b].ch - S.data[a].ch; });
    var up = all.slice(0, 4), dn = all.slice(-4).reverse();

    h += '<div class="two">' +
      '<section class="grp" style="--cat:var(--up)"><h2>بیشترین رشد <small>در ۲۴ ساعت</small></h2><div class="list" style="grid-template-columns:1fr">' + up.map(row).join('') + '</div></section>' +
      '<section class="grp" style="--cat:var(--down)"><h2>بیشترین افت <small>در ۲۴ ساعت</small></h2><div class="list" style="grid-template-columns:1fr">' + dn.map(row).join('') + '</div></section>' +
      '</div>';

    h += '<section class="grp" style="--cat:var(--gold)"><h2>علاقه‌مندی‌ها <small>' + fmt(S.favs.length) + ' نماد</small></h2>' +
      (S.favs.length ? '<div class="list">' + S.favs.filter(function(s) { return META[s]; }).map(row).join('') + '</div>' : '<div class="empty">روی ستاره‌ی کنار هر نماد بزنید تا در این بخش ذخیره شود.</div>') +
      '</section>';

    v.innerHTML = h;
    return;
  }

  var cat = CATS.filter(function(c) { return c.id === S.tab; })[0], gi = S.group[cat.id];
  cat.groups.forEach(function(g, i) {
    if (gi === -1 || gi === i) h += groupSection(g.name, g.s, cat.type);
  });
  v.innerHTML = h;
}

function toolsHTML() {
  var opts = '';
  CATS.forEach(function(c) {
    if (c.id === 'gold') return;
    opts += '<optgroup label="' + esc(c.name) + '">';
    c.groups.forEach(function(g) {
      g.s.forEach(function(s) {
        opts += '<option value="' + s + '"' + (s === 'usd' ? ' selected' : '') + '>' + esc(META[s].fa) + ' (' + s.toUpperCase() + ')</option>';
      });
    });
    opts += '</optgroup>';
  });

  return '<div class="cards">' +
    '<div class="card"><h2>تبدیل ارز و رمزارز</h2><p class="sub">ارزش هر نماد به تومان و ریال بر پایه نرخ زنده</p>' +
    '<label class="f"><span>مقدار</span><input id="c-amt" type="text" inputmode="decimal" value="1" autocomplete="off"></label>' +
    '<label class="f"><span>نماد</span><select id="c-sym">' + opts + '</select></label>' +
    '<div class="result"><span>مبلغ نهایی</span><b class="num" id="c-out">—</b></div></div>' +
    '<div class="card"><h2>ارزش طلای ۱۸ عیار</h2><p class="sub">بر پایه نرخ لحظه‌ای هر گرم، بدون اجرت و مالیات</p>' +
    '<div class="f2"><label class="f"><span>وزن</span><input id="g-amt" type="text" inputmode="decimal" value="1" autocomplete="off"></label>' +
    '<label class="f"><span>واحد</span><select id="g-unit"><option value="1">گرم</option><option value="4.6083">مثقال</option><option value="0.01">سوت</option></select></label></div>' +
    '<div class="result"><span>ارزش طلای خام</span><b class="num" id="g-out">—</b></div></div></div>';
}

function bindTools() {
  var ca = document.getElementById('c-amt'), cs = document.getElementById('c-sym'), co = document.getElementById('c-out');
  var ga = document.getElementById('g-amt'), gu = document.getElementById('g-unit'), go = document.getElementById('g-out');
  if (!ca || !cs || !co || !ga || !gu || !go) return;

  function calcC() {
    var a = parseFloat(toEn(ca.value)), p = priceOf(cs.value);
    if (isNaN(a) || p == null) { co.textContent = '—'; return; }
    var t = a * p;
    co.innerHTML = fmt(t, t < 100 ? 2 : 0) + ' تومان<br><small style="font-weight:700;opacity:0.8">' + fmt(t * 10, t < 10 ? 2 : 0) + ' ریال</small>';
  }

  function calcG() {
    var a = parseFloat(toEn(ga.value)), p = priceOf('18ayar');
    if (isNaN(a) || p == null) { go.textContent = '—'; return; }
    var t = a * parseFloat(gu.value) * p;
    go.innerHTML = fmt(t) + ' تومان<br><small style="font-weight:700;opacity:0.8">' + fmt(t * 10) + ' ریال</small>';
  }

  ca.oninput = cs.onchange = calcC;
  ga.oninput = gu.onchange = calcG;
  calcC();
  calcG();
}

/* ---------- Top Bar & Navigation Chrome ---------- */
function renderChrome() {
  document.querySelectorAll('#tabs button').forEach(function(b) {
    b.setAttribute('aria-selected', b.dataset.tab === S.tab);
  });
  document.getElementById('u-toman').setAttribute('aria-pressed', S.unit === 'toman');
  document.getElementById('u-rial').setAttribute('aria-pressed', S.unit === 'rial');

  var u = document.getElementById('updated');
  var fd = function(x) { return new Date(x).toLocaleString('fa-IR', { dateStyle: 'medium', timeStyle: 'short' }); };
  if (S.live && S.updated) {
    u.textContent = 'بروزرسانی ' + S.updated.toLocaleTimeString('fa-IR');
  } else if (S.stale) {
    u.textContent = 'آخرین قیمت: ' + fd(S.stale) + (S.err ? ' (آفلاین)' : '');
  } else if (S.snapT) {
    u.textContent = 'آخرین قیمت: ' + fd(S.snapT) + (S.err ? ' (آفلاین)' : '');
  } else {
    u.textContent = '';
  }
}

function go(tab) {
  S.tab = tab;
  try { history.replaceState(null, '', '#' + tab); } catch(e) {}
  renderChrome();
  renderView();
  window.scrollTo({ top: 0 });
}

function fixSpacer() {
  var tb = document.getElementById('topbar');
  if (!tb) return;
  var inset = parseFloat(getComputedStyle(document.documentElement).paddingTop) || 0;
  document.getElementById('spacer').style.height = Math.max(0, tb.offsetHeight - inset) + 'px';
}

function renderAll() {
  renderChrome();
  renderView();
  fixSpacer();
  var ds = document.getElementById('dsheet');
  if (ds && !ds.hidden) renderDetail();
}

/* ---------- Live Data Sync with HMAC Signature & Multi-Proxy Fallback ---------- */
var API = 'https://api.alanchand.com/app/v2.php';
var PUB = 'fc6cdb49aeae4b8feea5b1f574701944';
var SEC = 'eec8497f92e73aa5bef4960ff3af950764042f8d06df10e1ece919e895f7db30';
var DEFAULT_PROXY = 'https://cors-get-proxy.sirjosh.workers.dev/?url=';

function hex(buf) {
  return Array.prototype.map.call(new Uint8Array(buf), function(b) {
    return ('0' + b.toString(16)).slice(-2);
  }).join('');
}

async function signedUrl(slugs) {
  var p = { key: PUB, platform: 'android', v: '3.1.0', type: 'full', ts: String(Math.floor(Date.now() / 1000)), slug: slugs };
  var msg = Object.keys(p).sort().map(function(k) {
    return encodeURIComponent(k) + '=' + encodeURIComponent(p[k]);
  }).join('&');
  var enc = new TextEncoder();
  var key = await crypto.subtle.importKey('raw', enc.encode(SEC), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  var sig = hex(await crypto.subtle.sign('HMAC', key, enc.encode(msg)));
  return API + '?' + msg + '&sign=' + sig;
}

function viaUrl(proxy, url) {
  proxy = (proxy || '').trim();
  if (!proxy) return url;
  if (proxy.indexOf('{url}') > -1) return proxy.replace('{url}', encodeURIComponent(url));
  if (/[=?]$/.test(proxy)) return proxy + encodeURIComponent(url);
  return proxy.replace(/\/?$/, '/') + encodeURIComponent(url);
}

async function fetchLive(customProxy) {
  var raw = await signedUrl(Object.keys(META).join(','));
  var tries = [];
  if (customProxy) tries.push(['پروکسی شما', viaUrl(customProxy, raw)]);
  tries.push(['پروکسی پیش‌فرض', viaUrl(DEFAULT_PROXY, raw)]);
  tries.push(['اتصال مستقیم', raw]);

  var lastErr = null;
  for (var i = 0; i < tries.length; i++) {
    var ctl = new AbortController(), tm = setTimeout(function() { ctl.abort(); }, 6000);
    try {
      var r = await fetch(tries[i][1], { signal: ctl.signal });
      clearTimeout(tm);
      if (!r.ok) throw new Error('HTTP ' + r.status);
      var j = await r.json();
      var map = j && j.status === 'success' && j.data;
      if (!map || !map.usd) throw new Error('پاسخ نامعتبر از سرور');
      return { map: map, via: tries[i][0], updated: j.updated_at || null };
    } catch(e) {
      clearTimeout(tm);
      lastErr = e;
    }
  }
  throw lastErr || new Error('خطای شبکه');
}

async function refresh(manual) {
  var b = document.getElementById('btn-refresh');
  b.classList.add('spin');
  try {
    var r = await fetchLive(S.proxy);
    var old = S.data;
    applyMap(r.map);
    S.live = true;
    S.err = false;
    S.updated = new Date();
    S.flash = {};
    Object.keys(S.data).forEach(function(k) {
      var a = old[k], n = S.data[k];
      if (a && n && a.p !== n.p) S.flash[k] = n.p > a.p ? 'up' : 'down';
    });
    setTimeout(function() { S.flash = {}; }, 1800);
    try { localStorage.setItem('cc_cache2', JSON.stringify({ t: Date.now(), d: S.data })); } catch(e) {}
  } catch(e) {
    S.err = true;
  }
  b.classList.remove('spin');
  renderAll();
}

function loadSnap(raw) {
  if (!raw || !raw.data) return;
  S.snapT = raw.updated_at || null;
  if (!S.live && !S.stale) {
    applyMap(raw.data);
    renderAll();
  }
}

var timer = null;
function schedule() {
  if (timer) clearInterval(timer);
  if (S.interval > 0) timer = setInterval(refresh, S.interval * 1000);
}

/* ---------- Detail Sheet with Interactive SVG Chart ---------- */
var PERIODS = [['month', '۳۰ روزه'], ['year', '۱ ساله'], ['all', 'کل دوره']];
var DT = { slug: null, period: 'month' };

function cscale(s) {
  return (TYPE[s] === 'crypto' || USD_UNIT[s]) ? 1 : (S.unit === 'rial' ? 10 : 1);
}

function cunit(s) {
  return (TYPE[s] === 'crypto' || USD_UNIT[s]) ? 'دلار' : (S.unit === 'rial' ? 'ریال' : 'تومان');
}

function axisFmt(v) {
  var a = Math.abs(v);
  if (a >= 1e9) return fmt(v / 1e9, 1) + ' میلیارد';
  if (a >= 1e6) return fmt(v / 1e6, 1) + ' میلیون';
  if (a >= 1e4) return fmt(v / 1e3, 0) + ' هزار';
  if (a >= 100) return fmt(v, 0);
  if (a >= 1) return fmt(v, 2);
  return fmtPrice(v);
}

function factHTML(l, v, c) {
  return '<div class="fact"><span>' + esc(l) + '</span><b class="num' + (c ? ' ' + c : '') + '">' + v + '</b></div>';
}

function pc(v) {
  if (v == null || isNaN(v)) return '—';
  v = Number(v);
  return '<span dir="ltr">' + (v > 0 ? '+' : '') + fmt(v, 2) + '٪</span>';
}

function pcCls(v) {
  v = Number(v);
  return v > 0.004 ? 'up' : (v < -0.004 ? 'down' : '');
}

function dfacts(s) {
  var d = S.data[s], T = TYPE[s], h = '';
  if (T === 'fx') {
    if (d.buy != null) h += factHTML('قیمت خرید', fmtPrice(disp(s, d.buy)) + ' ' + unitLabel(s));
    if (d.sell != null) h += factHTML('قیمت فروش', fmtPrice(disp(s, d.sell)) + ' ' + unitLabel(s));
  } else if (T === 'gold') {
    if (d.real > 0) {
      h += factHTML('ارزش ذاتی', fmtPrice(disp(s, d.real)) + ' ' + unitLabel(s));
      h += factHTML('حباب', pc(d.bubp), pcCls(d.bubp));
    }
  } else {
    if (d.usd) h += factHTML('قیمت دلاری', '$' + fmtPrice(d.usd));
    [['۱ ساعت', d.c1h], ['۷ روز', d.c7], ['۳۰ روز', d.c30], ['۹۰ روز', d.c90], ['۱ سال', d.c365]].forEach(function(x) {
      if (x[1] != null) h += factHTML(x[0], pc(x[1]), pcCls(x[1]));
    });
  }
  return h;
}

function renderDetail() {
  var s = DT.slug, m = META[s], d = S.data[s], body = document.getElementById('dbody');
  if (!s || !m || !d) return;

  var tabs = PERIODS.map(function(q) {
    return '<button data-per="' + q[0] + '" aria-pressed="' + (DT.period === q[0]) + '">' + q[1] + '</button>';
  }).join('');

  body.innerHTML = '<div class="dh">' + avatar(s) +
    '<div class="ht"><b>' + esc(m.fa) + '</b><small>' + esc(m.en) + '</small></div>' +
    '<button class="dx" id="dclose" aria-label="بستن">✕</button></div>' +
    '<div class="dp"><b class="num"' + pv(s, d.p, 'dp') + '>' + (d.p == null ? '—' : fmtPrice(disp(s, d.p))) + '</b><em>' + unitLabel(s) + '</em>' + pill(d.ch) + '</div>' +
    '<div class="facts">' + dfacts(s) + '</div>' +
    '<div class="ptabs" id="ptabs">' + tabs + '</div>' +
    '<p class="cap">نمودار قیمت بر حسب <b>' + cunit(s) + '</b></p>' +
    '<div class="cwrap" id="dchart"></div><div class="facts" id="dstats"></div>';

  drawChart();
  fitPrices(body);
}

function drawChart() {
  var host = document.getElementById('dchart'), st = document.getElementById('dstats'), s = DT.slug;
  if (!host || !s) return;
  var c = S.data[s] && S.data[s].chart, pp = c && c[DT.period];
  if (!pp || pp.length < 2) {
    host.innerHTML = '<div class="empty">برای این بازه نموداری موجود نیست.</div>';
    st.innerHTML = '';
    return;
  }

  var k = cscale(s), W = Math.max(260, host.clientWidth || 340), H = 230, pl = 6, pr = 6, pt = 16, pb = 26;
  var xs = pp.map(function(q) { return q.l; }), ys = pp.map(function(q) { return q.v * k; });
  var x0 = xs[0], x1 = xs[xs.length - 1], lo = Math.min.apply(null, ys), hi = Math.max.apply(null, ys), mn = lo, mx = hi;
  if (mx === mn) { mx += Math.abs(mx) * 0.01 || 1; mn -= Math.abs(mn) * 0.01 || 1; }
  var pad = (mx - mn) * 0.08;
  mn -= pad; mx += pad;

  function X(t) { return pl + (t - x0) / (x1 - x0 || 1) * (W - pl - pr); }
  function Y(v) { return pt + (1 - (v - mn) / (mx - mn)) * (H - pt - pb); }

  var d = '', i;
  for (i = 0; i < xs.length; i++) {
    d += (i ? 'L' : 'M') + X(xs[i]).toFixed(1) + ' ' + Y(ys[i]).toFixed(1);
  }
  var area = d + 'L' + X(x1).toFixed(1) + ' ' + (H - pb) + 'L' + X(x0).toFixed(1) + ' ' + (H - pb) + 'Z';

  var grid = '', j, v, y;
  for (j = 0; j < 4; j++) {
    v = mn + (mx - mn) * j / 3;
    y = Y(v);
    grid += '<line class="gl" x1="' + pl + '" x2="' + (W - pr) + '" y1="' + y.toFixed(1) + '" y2="' + y.toFixed(1) + '"/>' +
      '<text class="gt" x="' + (pl + 2) + '" y="' + (y - 4).toFixed(1) + '">' + axisFmt(v) + '</text>';
  }

  var dopt = DT.period === 'month' ? { month: 'short', day: 'numeric' } : { year: 'numeric', month: 'short' }, xl = '';
  for (j = 0; j < 4; j++) {
    var tt = x0 + (x1 - x0) * j / 3;
    xl += '<text class="gt" x="' + (pl + (W - pl - pr) * j / 3).toFixed(1) + '" y="' + (H - 8) + '" text-anchor="' + (j === 0 ? 'start' : (j === 3 ? 'end' : 'middle')) + '">' +
      new Date(tt * 1000).toLocaleDateString('fa-IR', dopt) + '</text>';
  }

  var up = ys[ys.length - 1] >= ys[0];
  host.innerHTML = '<svg class="ch ' + (up ? 'up' : 'down') + '" width="' + W + '" height="' + H + '" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="نمودار قیمت">' +
    '<defs><linearGradient id="cg" x1="0" y1="0" x2="0" y2="1">' +
    '<stop offset="0" stop-color="currentColor" stop-opacity=".35"/>' +
    '<stop offset="1" stop-color="currentColor" stop-opacity="0"/>' +
    '</linearGradient></defs>' +
    grid + xl + '<path d="' + area + '" fill="url(#cg)"/>' +
    '<path class="ln" d="' + d + '" fill="none"/>' +
    '<circle cx="' + X(x1).toFixed(1) + '" cy="' + Y(ys[ys.length - 1]).toFixed(1) + '" r="4.5" fill="currentColor"/>' +
    '<g id="cross" opacity="0"><line class="cl" y1="' + pt + '" y2="' + (H - pb) + '" x1="0" x2="0"/><circle class="cd" r="5" cx="0" cy="0"/></g>' +
    '</svg><div class="tip"></div>';

  var svg = host.querySelector('svg'), tip = host.querySelector('.tip'), cr = svg.querySelector('#cross');
  function mv(e) {
    var r = svg.getBoundingClientRect();
    var px = (e.clientX - r.left) * (W / r.width);
    var t = x0 + (px - pl) / (W - pl - pr) * (x1 - x0);
    var bi = 0, bd = 1e18, n;
    for (n = 0; n < xs.length; n++) {
      var dd = Math.abs(xs[n] - t);
      if (dd < bd) { bd = dd; bi = n; }
    }
    var cx = X(xs[bi]), cy = Y(ys[bi]);
    cr.setAttribute('opacity', '1');
    var ln = cr.querySelector('line'), cd = cr.querySelector('circle');
    ln.setAttribute('x1', cx); ln.setAttribute('x2', cx);
    cd.setAttribute('cx', cx); cd.setAttribute('cy', cy);
    tip.innerHTML = new Date(xs[bi] * 1000).toLocaleDateString('fa-IR', { year: 'numeric', month: 'long', day: 'numeric' }) +
      '<br><b class="num">' + fmtPrice(ys[bi]) + '</b> ' + cunit(s);
    tip.style.opacity = '1';
    var tw = tip.offsetWidth, left = cx * (r.width / W) - tw / 2;
    tip.style.left = Math.max(0, Math.min(left, r.width - tw)) + 'px';
  }

  function lv() {
    cr.setAttribute('opacity', '0');
    tip.style.opacity = '0';
  }

  svg.addEventListener('pointermove', mv);
  svg.addEventListener('pointerdown', mv);
  svg.addEventListener('pointerleave', lv);
  svg.addEventListener('pointercancel', lv);

  var chv = (ys[ys.length - 1] - ys[0]) / (ys[0] || 1) * 100;
  st.innerHTML = factHTML('کمترین', fmtPrice(lo)) + factHTML('بیشترین', fmtPrice(hi)) + factHTML('تغییر بازه', pc(chv), pcCls(chv));
}

function openDetail(s) {
  if (!META[s] || !S.data[s]) return;
  DT.slug = s;
  DT.period = 'month';
  document.getElementById('dsheet').hidden = false;
  renderDetail();
}

function closeDetail() {
  document.getElementById('dsheet').hidden = true;
}

/* ---------- Global Event Listeners ---------- */
document.getElementById('tabs').addEventListener('click', function(e) {
  var b = e.target.closest('button[data-tab]');
  if (b) go(b.dataset.tab);
});

document.getElementById('chips').addEventListener('click', function(e) {
  var b = e.target.closest('button[data-g]');
  if (!b) return;
  S.group[S.tab] = parseInt(b.dataset.g, 10);
  renderView();
});

document.getElementById('view').addEventListener('click', function(e) {
  var gh = e.target.closest('button[data-gh]');
  if (gh) {
    var k = gh.dataset.gh;
    S.collapsed[k] = !S.collapsed[k];
    renderView();
    return;
  }
  var b = e.target.closest('button[data-star]');
  if (b) {
    var s = b.dataset.star, i = S.favs.indexOf(s);
    if (i > -1) S.favs.splice(i, 1);
    else S.favs.push(s);
    lsSet('cc_favs', JSON.stringify(S.favs));
    renderView();
    return;
  }
  var o = e.target.closest('[data-open]');
  if (o) openDetail(o.dataset.open);
});

document.getElementById('view').addEventListener('keydown', function(e) {
  if (e.key !== 'Enter' && e.key !== ' ') return;
  var o = e.target.closest && e.target.closest('[data-open]');
  if (o && e.target === o) {
    e.preventDefault();
    openDetail(o.dataset.open);
  }
});

var dsheet = document.getElementById('dsheet');
dsheet.addEventListener('click', function(e) {
  if (e.target === dsheet || e.target.closest('#dclose')) {
    closeDetail();
    return;
  }
  var pb = e.target.closest('button[data-per]');
  if (pb) {
    DT.period = pb.dataset.per;
    document.querySelectorAll('#ptabs button').forEach(function(x) {
      x.setAttribute('aria-pressed', x === pb);
    });
    drawChart();
  }
});

window.addEventListener('resize', function() {
  if (!dsheet.hidden) drawChart();
});

document.getElementById('sort').addEventListener('change', function(e) {
  S.sort = e.target.value;
  renderView();
});

document.getElementById('u-toman').onclick = function() {
  S.unit = 'toman';
  lsSet('cc_unit', 'toman');
  renderAll();
};

document.getElementById('u-rial').onclick = function() {
  S.unit = 'rial';
  lsSet('cc_unit', 'rial');
  renderAll();
};

document.getElementById('btn-refresh').onclick = function() {
  refresh(true);
};

document.getElementById('btn-theme').onclick = function() {
  var cur = document.documentElement.getAttribute('data-theme');
  var dark = cur ? cur === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
  var nx = dark ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', nx);
  lsSet('cc_theme', nx);
};

/* Settings Dialog */
var sheet = document.getElementById('sheet');
function openSheet() {
  document.getElementById('proxy').value = S.proxy;
  document.getElementById('interval').value = String(S.interval);
  document.getElementById('testout').textContent = '';
  sheet.hidden = false;
}
function closeSheet() {
  sheet.hidden = true;
}

document.getElementById('btn-settings').onclick = openSheet;
document.getElementById('s-close').onclick = closeSheet;

sheet.addEventListener('click', function(e) {
  if (e.target === sheet) closeSheet();
});

document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    closeSheet();
    closeDetail();
  }
});

document.getElementById('s-save').onclick = function() {
  S.proxy = document.getElementById('proxy').value.trim();
  S.interval = parseInt(document.getElementById('interval').value, 10);
  lsSet('cc_proxy', S.proxy);
  lsSet('cc_interval', String(S.interval));
  closeSheet();
  schedule();
  refresh(true);
};

document.getElementById('s-test').onclick = async function() {
  var o = document.getElementById('testout');
  o.className = 'testout';
  o.textContent = 'در حال تست اتصال…';
  var t0 = performance.now();
  try {
    var r = await fetchLive(document.getElementById('proxy').value.trim());
    var u = r.map.usd && r.map.usd.sell;
    o.className = 'testout ok';
    o.textContent = 'اتصال موفق (' + r.via + ') — ' + fmt(Math.round(performance.now() - t0)) + ' میلی‌ثانیه' + (u != null ? (' — دلار ' + fmt(u)) : '');
  } catch(e) {
    o.className = 'testout bad';
    o.textContent = 'اتصال ناموفق: ' + (e && e.message ? e.message : 'خطای شبکه') + '. پروکسی سفارشی خود را بررسی کنید.';
  }
};

/* ---------- Bootstrapping ---------- */
var h0 = (location.hash || '').replace('#', '');
if (['home', 'gold', 'fx', 'crypto', 'tools'].indexOf(h0) > -1) {
  S.tab = h0;
}

try {
  var cc = JSON.parse(lsGet('cc_cache2', 'null'));
  if (cc && cc.d && Object.keys(cc.d).length) {
    S.data = cc.d;
    S.stale = cc.t;
  }
} catch(e) {}

if (window.ALANCHAND_FALLBACK_DATA) {
  loadSnap({ status: 'success', data: window.ALANCHAND_FALLBACK_DATA });
} else {
  try {
    fetch('data/fallback_prices.json').then(function(r) { return r.json(); }).then(loadSnap).catch(function() {});
  } catch(e) {}
}

renderAll();
refresh(false);
schedule();

if (window.ResizeObserver) {
  new ResizeObserver(fixSpacer).observe(document.getElementById('topbar'));
}
window.addEventListener('resize', fixSpacer);
fixSpacer();
