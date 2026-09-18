/**
 * Main Application Controller for ChandChandi
 * Handles 93 symbols, USD/Crypto display, Toman/Rial conversion, and Neobrutalism UI.
 */

document.addEventListener('DOMContentLoaded', () => {
  const app = {
    data: {},
    currentCategory: 'all',
    searchQuery: '',
    currencyMode: localStorage.getItem('alanchand_currency_mode') || 'toman',
    favorites: new Set(JSON.parse(localStorage.getItem('alanchand_favs') || '["usd", "18ayar", "sekkeh", "btc", "usdt"]')),
    autoRefreshInterval: 30,
    countdown: 30,
    timerId: null,
    isLoading: false,

    init() {
      // 1. Instantly load full 93 symbols data
      const cached = localStorage.getItem('alanchand_cached_data');
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          this.data = parsed.data.data || parsed.data;
          this.updateTimestamp(parsed.data.updated_at || parsed.data.updatedAt);
        } catch (e) {
          this.data = window.ALANCHAND_FALLBACK_DATA || {};
          this.updateTimestamp(window.ALANCHAND_UPDATED_AT);
        }
      } else {
        this.data = window.ALANCHAND_FALLBACK_DATA || {};
        this.updateTimestamp(window.ALANCHAND_UPDATED_AT);
      }

      this.bindEvents();
      this.updateCurrencyToggleButton();
      this.renderGrid();
      this.updateTicker();

      if (window.currencyCalculator) {
        window.currencyCalculator.setSymbolsData(this.data);
      }

      const statusBadge = document.getElementById('connection-status-badge');
      if (statusBadge) {
        statusBadge.innerHTML = '<span class="pulse-green"></span> وضعیت: آنلاین (آماده)';
      }

      // 2. Start timer and background refresh
      this.startCountdownTimer();
      this.loadData(false);
    },

    bindEvents() {
      // Search input
      const searchInput = document.getElementById('search-input');
      if (searchInput) {
        searchInput.addEventListener('input', (e) => {
          this.searchQuery = e.target.value.trim().toLowerCase();
          this.renderGrid();
        });
      }

      // Filter tabs
      const tabs = document.querySelectorAll('.category-tab');
      tabs.forEach(tab => {
        tab.addEventListener('click', () => {
          tabs.forEach(t => t.classList.remove('active'));
          tab.classList.add('active');
          this.currentCategory = tab.dataset.category;
          this.renderGrid();
        });
      });

      // Refresh button
      const refreshBtn = document.getElementById('refresh-btn');
      if (refreshBtn) {
        refreshBtn.addEventListener('click', () => {
          this.loadData(true);
        });
      }

      // Currency Unit Toggle
      const currencyToggle = document.getElementById('currency-toggle-btn');
      if (currencyToggle) {
        currencyToggle.addEventListener('click', () => {
          this.currencyMode = this.currencyMode === 'toman' ? 'rial' : 'toman';
          localStorage.setItem('alanchand_currency_mode', this.currencyMode);
          this.updateCurrencyToggleButton();
          this.renderGrid();
          this.updateTicker();
          if (window.currencyCalculator) {
            window.currencyCalculator.setCurrencyMode(this.currencyMode);
          }
        });
      }

      // Calculator inputs
      const calcAmount = document.getElementById('calc-amount-input');
      const calcSelect = document.getElementById('calc-symbol-select');
      const goldWeight = document.getElementById('gold-weight-input');

      if (calcAmount) calcAmount.addEventListener('input', () => window.currencyCalculator.recalculate());
      if (calcSelect) calcSelect.addEventListener('change', () => window.currencyCalculator.recalculate());
      if (goldWeight) goldWeight.addEventListener('input', () => window.currencyCalculator.recalculateGold());

      // Modal close handlers
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') this.closeModals();
      });

      const modalCloseButtons = document.querySelectorAll('[data-close-modal]');
      modalCloseButtons.forEach(btn => {
        btn.addEventListener('click', () => this.closeModals());
      });

      // Settings Modal triggers
      const openSettingsBtn = document.getElementById('open-settings-btn');
      if (openSettingsBtn) {
        openSettingsBtn.addEventListener('click', () => {
          const proxyInput = document.getElementById('settings-proxy-input');
          if (proxyInput) {
            proxyInput.value = window.alanchandApi.getCustomProxy();
          }
          this.openModal('settings-modal');
        });
      }

      const saveSettingsBtn = document.getElementById('save-settings-btn');
      if (saveSettingsBtn) {
        saveSettingsBtn.addEventListener('click', () => {
          const proxyInput = document.getElementById('settings-proxy-input');
          if (proxyInput) {
            window.alanchandApi.setCustomProxy(proxyInput.value);
            this.closeModals();
            this.loadData(true);
          }
        });
      }
    },

    updateCurrencyToggleButton() {
      const btn = document.getElementById('currency-toggle-btn');
      if (!btn) return;
      const label = document.getElementById('currency-toggle-label');
      if (label) {
        label.textContent = this.currencyMode === 'toman' ? 'تومان' : 'ریال';
      }
    },

    startCountdownTimer() {
      if (this.timerId) clearInterval(this.timerId);
      this.countdown = this.autoRefreshInterval;
      const display = document.getElementById('countdown-display');

      this.timerId = setInterval(() => {
        this.countdown--;
        if (display) {
          display.textContent = `${this.countdown}s`;
        }
        if (this.countdown <= 0) {
          this.countdown = this.autoRefreshInterval;
          this.loadData(false);
        }
      }, 1000);
    },

    async loadData(manual = false) {
      if (this.isLoading) return;
      this.isLoading = true;
      const refreshIcon = document.getElementById('refresh-icon');
      if (refreshIcon) refreshIcon.classList.add('animate-spin');

      const statusBadge = document.getElementById('connection-status-badge');
      if (statusBadge && manual) {
        statusBadge.innerHTML = '<span class="pulse-green"></span> در حال به‌روزرسانی...';
      }

      try {
        const result = await window.alanchandApi.fetchPrices();
        if (result && result.data && result.data.data) {
          this.data = result.data.data;
          this.updateTimestamp(result.data.updated_at || result.data.updatedAt);
          this.renderGrid();
          this.updateTicker();

          if (window.currencyCalculator) {
            window.currencyCalculator.setSymbolsData(this.data);
          }

          if (statusBadge) {
            const isLive = result.source === 'live';
            statusBadge.innerHTML = isLive
              ? '<span class="pulse-green"></span> وضعیت: زنده (سرور)'
              : '<span class="pulse-green"></span> وضعیت: داده‌های ذخیره‌شده';
          }
        }
      } catch (err) {
        console.warn('Could not fetch live, keeping current prices', err);
        if (statusBadge) {
          statusBadge.innerHTML = '<span class="pulse-green"></span> وضعیت: پایدار (آفلاین)';
        }
      } finally {
        this.isLoading = false;
        if (refreshIcon) refreshIcon.classList.remove('animate-spin');
        this.countdown = this.autoRefreshInterval;
      }
    },

    updateTimestamp(timestampStr) {
      const el = document.getElementById('last-update-text');
      if (!el) return;
      if (timestampStr) {
        try {
          const d = new Date(timestampStr);
          if (!isNaN(d.getTime())) {
            const timePart = d.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' });
            const datePart = d.toLocaleDateString('fa-IR');
            el.textContent = `آخرین بروزرسانی بازار: ساعت ${timePart} (${datePart})`;
            return;
          }
        } catch (e) {}
        el.textContent = `آخرین بروزرسانی بازار: ${timestampStr}`;
      } else {
        const now = new Date();
        const timePart = now.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' });
        el.textContent = `آخرین بروزرسانی: ساعت ${timePart}`;
      }
    },

    formatPrice(val) {
      if (val === null || val === undefined || isNaN(val)) return '---';
      let num = parseFloat(val);
      if (this.currencyMode === 'rial') {
        num = num * 10;
      }
      return Math.round(num).toLocaleString('fa-IR');
    },

    getUnitLabel() {
      return this.currencyMode === 'rial' ? 'ریال' : 'تومان';
    },

    formatCryptoUsd(usdVal, decRound) {
      const num = parseFloat(usdVal) || 0;
      if (num === 0) return '0.00';
      let maxDigits = 2;
      let minDigits = 2;
      if (decRound !== undefined && decRound !== null) {
        maxDigits = Math.max(2, Math.min(parseInt(decRound) || 2, 8));
        minDigits = Math.min(2, maxDigits);
      } else if (num < 1) {
        maxDigits = 6;
        minDigits = 2;
      }
      return num.toLocaleString('en-US', {
        minimumFractionDigits: minDigits,
        maximumFractionDigits: maxDigits
      });
    },

    renderGrid() {
      const container = document.getElementById('cards-grid');
      const countDisplay = document.getElementById('filtered-count');
      const totalCountDisplay = document.getElementById('total-symbols-count');
      if (!container) return;

      const keys = Object.keys(this.data);
      if (totalCountDisplay && keys.length > 0) {
        totalCountDisplay.textContent = keys.length.toLocaleString('fa-IR');
      }

      if (keys.length === 0) {
        container.innerHTML = `
          <div class="col-span-full neo-card text-center p-8 bg-white">
            <div class="text-2xl font-black mb-2 flex items-center justify-center gap-2">
              <svg class="w-6 h-6 animate-spin stroke-[2.5]" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10" stroke-opacity="0.25"/><path d="M12 2a10 10 0 0 1 10 10"/></svg>
              <span>در حال بارگذاری...</span>
            </div>
            <p class="text-gray-700 font-bold">داده‌های بازار در حال واکشی هستند.</p>
          </div>
        `;
        return;
      }

      container.innerHTML = '';

      // Filter
      const filteredKeys = keys.filter(key => {
        const item = this.data[key];
        const isFav = this.favorites.has(key);

        if (this.currentCategory === 'fav' && !isFav) return false;
        if (this.currentCategory === 'gold' && item.type !== 'gold') return false;
        if (this.currentCategory === 'fx' && item.type !== 'fx') return false;
        if (this.currentCategory === 'crypto' && item.type !== 'crypto') return false;

        if (this.searchQuery) {
          const q = this.searchQuery;
          const matchKey = key.toLowerCase().includes(q);
          const matchSlug = (item.slug || '').toLowerCase().includes(q);
          const matchFa = (item.fa_name || '').toLowerCase().includes(q);
          const matchEn = (item.en_name || '').toLowerCase().includes(q);
          if (!matchKey && !matchSlug && !matchFa && !matchEn) return false;
        }

        return true;
      });

      if (countDisplay) {
        countDisplay.textContent = `${filteredKeys.length.toLocaleString('fa-IR')} نماد`;
      }

      if (filteredKeys.length === 0) {
        container.innerHTML = `
          <div class="col-span-full neo-card text-center p-8 bg-white">
            <div class="text-xl sm:text-2xl font-black mb-2 flex items-center justify-center gap-2">
              <svg class="w-6 h-6 stroke-[2.5]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
              <span>موردی یافت نشد!</span>
            </div>
            <p class="text-gray-700 font-bold text-sm">با عبارت جستجوی وارد شده یا فیلتر فعلی نمادی پیدا نشد.</p>
          </div>
        `;
        return;
      }

      // Sort favorites first, then by app_order
      filteredKeys.sort((a, b) => {
        const aFav = this.favorites.has(a) ? 1 : 0;
        const bFav = this.favorites.has(b) ? 1 : 0;
        if (aFav !== bFav) return bFav - aFav;
        const aOrder = this.data[a].app_order ?? 999;
        const bOrder = this.data[b].app_order ?? 999;
        return aOrder - bOrder;
      });

      const unit = this.getUnitLabel();

      filteredKeys.forEach(key => {
        const item = this.data[key];
        const isFav = this.favorites.has(key);
        const isCrypto = item.type === 'crypto';
        const isDollarGold = item.is_dolar === 1; // Ounces: usd_xau, xag

        // 1. Calculate Change Percentage
        let changePercent = 0;
        if (isCrypto) {
          changePercent = item.change_24h ?? item.toman24hchange ?? 0;
        } else {
          changePercent = item.dayChangePer ?? 0;
        }
        changePercent = parseFloat(changePercent) || 0;

        const isPositive = changePercent > 0;
        const isNegative = changePercent < 0;
        let changeBadgeHtml = '';
        if (isPositive) {
          changeBadgeHtml = `
            <span class="neo-badge neo-badge-green font-bold text-xs">
              <svg class="w-3.5 h-3.5 stroke-[3]" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="m18 15-6-6-6 6"/></svg>
              <span class="font-num font-black">${changePercent.toLocaleString('fa-IR')}%+</span>
            </span>
          `;
        } else if (isNegative) {
          changeBadgeHtml = `
            <span class="neo-badge neo-badge-red font-bold text-xs">
              <svg class="w-3.5 h-3.5 stroke-[3]" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="m6 9 6 6 6-6"/></svg>
              <span class="font-num font-black">${Math.abs(changePercent).toLocaleString('fa-IR')}%-</span>
            </span>
          `;
        } else {
          changeBadgeHtml = `
            <span class="neo-badge neo-badge-gray font-bold text-xs">
              <svg class="w-3.5 h-3.5 stroke-[3]" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M5 12h14"/></svg>
              <span class="font-num font-black">۰%</span>
            </span>
          `;
        }

        // 2. Determine Category Tag Color & SVG Icon
        let categoryColor = 'bg-[#88c5ee] text-black'; // Sky Blue
        let categoryName = 'ارز فیات';
        let categoryIcon = `<svg class="w-3.5 h-3.5 stroke-[2.5]" viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect width="20" height="12" x="2" y="6" rx="2"/><circle cx="12" cy="12" r="2"/><path d="M6 12h.01M18 12h.01"/></svg>`;

        if (item.type === 'gold') {
          categoryColor = 'bg-[#fed170] text-black'; // Sunny Lemon Gold
          categoryName = 'طلا و سکه';
          categoryIcon = `<svg class="w-3.5 h-3.5 stroke-[2.5]" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="8" cy="8" r="6"/><path d="M18.09 10.37A6 6 0 1 1 10.34 18"/><path d="M7 6h1v4"/><path d="m16.71 13.88.7.71-2.82 2.82"/></svg>`;
        } else if (item.type === 'crypto') {
          categoryColor = 'bg-[#b6ace4] text-black'; // Soft Lilac
          categoryName = 'رمزارز';
          categoryIcon = `<svg class="w-3.5 h-3.5 stroke-[2.5]" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10"/><path d="M9.5 8h4a2 2 0 0 1 0 4h-4m0 0h4.5a2 2 0 0 1 0 4H9.5M9.5 6v12M12 6v2M12 16v2"/></svg>`;
        }

        // 3. Build Price Display Block
        let priceHtml = '';
        if (isCrypto) {
          // Crypto: Main price is in USD ($)
          const formattedUsd = this.formatCryptoUsd(item.price, item.dec_round);
          const tomanVal = item.toman ? this.formatPrice(item.toman) : null;

          priceHtml = `
            <div class="flex items-baseline justify-between gap-1 mb-1">
              <span class="text-xs font-bold text-gray-600">قیمت (دلار):</span>
              <div class="flex items-baseline gap-1">
                <span class="text-xl font-black text-black font-mono tracking-tight">$ ${formattedUsd}</span>
              </div>
            </div>
            ${tomanVal ? `
              <div class="flex items-baseline justify-between gap-1 text-xs font-bold text-gray-800 bg-gray-50 px-2 py-1 border border-black/20 rounded-[5px]">
                <span class="text-gray-500 text-[11px]">معادل تومانی:</span>
                <div class="flex items-baseline gap-1">
                  <span class="font-num font-black text-black">${tomanVal}</span>
                  <span class="text-[11px] font-bold text-gray-600">${unit}</span>
                </div>
              </div>
            ` : ''}
          `;
        } else if (isDollarGold) {
          // Ounces in USD ($)
          const usdVal = parseFloat(item.price || 0).toLocaleString('en-US', { minimumFractionDigits: 2 });
          priceHtml = `
            <div class="flex items-baseline justify-between gap-1 mb-1">
              <span class="text-xs font-bold text-gray-600">قیمت دلاری (انس):</span>
              <div class="flex items-baseline gap-1">
                <span class="text-xl font-black text-black font-mono tracking-tight">$ ${usdVal}</span>
              </div>
            </div>
          `;
        } else {
          // Fiat FX & Iranian Gold/Coins in Toman/Rial
          const mainPrice = item.price ?? item.sell ?? item.buy ?? 0;
          priceHtml = `
            <div class="flex items-baseline justify-between gap-1 mb-1">
              <span class="text-xs font-bold text-gray-600">قیمت:</span>
              <div class="flex items-baseline gap-1">
                <span class="text-xl font-black text-black font-num">${this.formatPrice(mainPrice)}</span>
                <span class="text-xs font-black text-black">${unit}</span>
              </div>
            </div>
          `;

          // If buy & sell available (e.g. FX)
          if (item.buy && item.sell) {
            priceHtml += `
              <div class="flex items-center justify-between text-xs font-bold text-gray-700 px-1 pt-1 border-t border-black/10">
                <span class="flex items-center gap-1">
                  <svg class="w-3.5 h-3.5 text-emerald-700 stroke-[2.5]" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="m19 5-14 14m0 0h10m-10 0V9"/></svg>
                  خرید: <strong class="font-num font-black text-black">${this.formatPrice(item.buy)}</strong>
                </span>
                <span class="flex items-center gap-1">
                  <svg class="w-3.5 h-3.5 text-rose-700 stroke-[2.5]" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M5 19 19 5m0 0H9m10 0v10"/></svg>
                  فروش: <strong class="font-num font-black text-black">${this.formatPrice(item.sell)}</strong>
                </span>
              </div>
            `;
          }
        }

        // 4. Coin Bubble Badge (if exists)
        let bubbleBadge = '';
        if (item.bubble_per !== undefined && item.bubble_per !== null && item.bubble_per !== 0) {
          bubbleBadge = `
            <span class="neo-badge bg-[#fed170] text-[10px] font-bold text-amber-950" title="حباب سکه">
              <svg class="w-3 h-3 stroke-[2.5]" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>
              حباب: <span class="font-num font-black">${parseFloat(item.bubble_per).toLocaleString('fa-IR')}%</span>
            </span>
          `;
        }

        // 5. Star SVG Icon
        const starSvg = isFav
          ? `<svg class="w-5 h-5 text-amber-500 fill-amber-300 stroke-black stroke-2" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`
          : `<svg class="w-5 h-5 text-gray-400 fill-white stroke-black stroke-2 hover:fill-amber-100" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`;

        // 6. Currency Icon URL
        const iconSlug = (item.slug || key).toUpperCase();
        const iconSrc = `assets/icons/${item.type}/${iconSlug}.png`;
        const fallbackIcon = item.icon || '';

        const card = document.createElement('div');
        card.className = 'neo-card flex flex-col justify-between cursor-pointer bg-white';
        card.innerHTML = `
          <div>
            <div class="flex items-center justify-between mb-3">
              <div class="flex items-center gap-1.5 flex-wrap">
                <span class="neo-badge ${categoryColor} font-extrabold flex items-center gap-1">
                  ${categoryIcon}
                  <span>${categoryName}</span>
                </span>
                <span class="font-mono font-black text-xs px-2 py-0.5 border-2 border-black rounded-[5px] bg-white shadow-[1px_1px_0px_#000]">${(item.slug || key).toUpperCase()}</span>
                ${bubbleBadge}
              </div>
              <button class="fav-star-btn p-1 transition-transform hover:scale-125 focus:outline-none" data-key="${key}" title="علاقه‌مندی">
                ${starSvg}
              </button>
            </div>

            <!-- Currency Official Icon & Title -->
            <div class="flex items-center gap-3 mb-4">
              <div class="w-11 h-11 rounded-[5px] border-2 border-black bg-white shadow-[2px_2px_0px_#000] p-1 flex items-center justify-center flex-shrink-0">
                <img src="${iconSrc}" alt="${item.fa_name || key}" class="w-full h-full object-contain" onerror="this.onerror=null; if('${fallbackIcon}') { this.src='${fallbackIcon}'; } else { this.style.display='none'; }" loading="lazy" />
              </div>
              <div class="flex-1 min-w-0">
                <h3 class="text-base sm:text-lg font-black text-black leading-tight truncate">${item.fa_name || key}</h3>
                <div class="text-xs font-bold text-gray-500 font-mono truncate mt-0.5">${item.en_name || ''}</div>
              </div>
            </div>
          </div>

          <div class="pt-3 border-t-2 border-black border-dashed">
            ${priceHtml}

            <div class="flex items-center justify-between text-xs font-bold mt-2 pt-1 border-t border-black/10">
              <span class="text-gray-500">تغییر ۲۴س:</span>
              ${changeBadgeHtml}
            </div>
          </div>
        `;

        card.addEventListener('click', (e) => {
          if (e.target.closest('.fav-star-btn')) {
            e.stopPropagation();
            this.toggleFavorite(key);
            return;
          }
          this.openDetailModal(key);
        });

        container.appendChild(card);
      });
    },

    toggleFavorite(key) {
      if (this.favorites.has(key)) {
        this.favorites.delete(key);
      } else {
        this.favorites.add(key);
      }
      localStorage.setItem('alanchand_favs', JSON.stringify(Array.from(this.favorites)));
      this.renderGrid();
    },

    updateTicker() {
      const tickerContainer = document.getElementById('ticker-content');
      if (!tickerContainer) return;

      const priorityKeys = ['usd', '18ayar', 'sekkeh', 'bahar', 'btc', 'usdt', 'eth', 'eur', 'aed', 'try'];
      const unit = this.getUnitLabel();
      let html = '';

      priorityKeys.forEach(k => {
        const item = this.data[k];
        if (!item) return;

        let displayPrice = '';
        if (item.type === 'crypto') {
          const formattedUsd = this.formatCryptoUsd(item.price, item.dec_round);
          displayPrice = `$${formattedUsd}`;
          if (item.toman) {
            displayPrice += ` (${this.formatPrice(item.toman)} ${unit})`;
          }
        } else if (item.is_dolar === 1) {
          displayPrice = `$${parseFloat(item.price || 0).toLocaleString('en-US')}`;
        } else {
          const p = item.price ?? item.sell ?? item.buy ?? 0;
          displayPrice = `${this.formatPrice(p)} ${unit}`;
        }

        const iconSlug = (item.slug || k).toUpperCase();
        const iconSrc = `assets/icons/${item.type}/${iconSlug}.png`;
        const changePercent = parseFloat(item.change_24h ?? item.dayChangePer ?? 0);
        const changeSign = changePercent > 0 ? '+' : '';
        const color = changePercent > 0 ? 'text-emerald-900' : (changePercent < 0 ? 'text-rose-900' : 'text-gray-900');

        html += `
          <div class="ticker-item">
            <img src="${iconSrc}" alt="" class="w-4 h-4 inline-block ml-1.5 align-text-bottom" onerror="this.style.display='none';" />
            <span class="font-black text-black">${item.fa_name || k}:</span>
            <span class="font-num font-black text-black">${displayPrice}</span>
            <span class="font-num text-xs font-black ${color}">(${changeSign}${Math.abs(changePercent).toLocaleString('fa-IR')}%)</span>
            <span class="w-1.5 h-1.5 bg-black border border-black inline-block mx-2.5"></span>
          </div>
        `;
      });

      tickerContainer.innerHTML = html + html;
    },

    openDetailModal(key) {
      const item = this.data[key];
      if (!item) return;

      const unit = this.getUnitLabel();
      const modalTitle = document.getElementById('modal-title');
      const modalSubtitle = document.getElementById('modal-subtitle');
      const modalSlug = document.getElementById('modal-slug');
      const modalIcon = document.getElementById('modal-icon');
      const modalContent = document.getElementById('modal-details-body');

      const iconSlug = (item.slug || key).toUpperCase();
      const iconSrc = `assets/icons/${item.type}/${iconSlug}.png`;
      if (modalIcon) {
        modalIcon.src = iconSrc;
        modalIcon.alt = item.fa_name || key;
        modalIcon.onerror = function() {
          this.onerror = null;
          if (item.icon) this.src = item.icon;
        };
      }

      if (modalTitle) modalTitle.textContent = item.fa_name || key;
      if (modalSubtitle) modalSubtitle.textContent = item.en_name || '';
      if (modalSlug) modalSlug.textContent = (item.slug || key).toUpperCase();

      const isCrypto = item.type === 'crypto';
      const isDollarGold = item.is_dolar === 1;

      let changePercent = parseFloat(isCrypto ? (item.change_24h ?? item.toman24hchange ?? 0) : (item.dayChangePer ?? 0));
      let changeAmount = item.dayChange !== undefined ? item.dayChange : (item.changeAmount || 0);

      let priceBoxHtml = '';
      if (isCrypto) {
        const usdVal = this.formatCryptoUsd(item.price, item.dec_round);
        priceBoxHtml = `
          <div class="neo-box p-3 bg-[#b6ace4]">
            <div class="text-xs font-bold text-gray-800 mb-1">قیمت دلاری:</div>
            <div class="text-xl font-black font-mono tracking-tight text-black">$ ${usdVal}</div>
            ${item.toman ? `<div class="text-xs font-bold text-gray-800 mt-1">معادل: <span class="font-num font-black text-black">${this.formatPrice(item.toman)}</span> ${unit}</div>` : ''}
          </div>
        `;
      } else if (isDollarGold) {
        priceBoxHtml = `
          <div class="neo-box p-3 bg-[#88c5ee]">
            <div class="text-xs font-bold text-gray-800 mb-1">قیمت دلاری (انس):</div>
            <div class="text-xl font-black font-mono tracking-tight text-black">$ ${parseFloat(item.price || 0).toLocaleString('en-US')}</div>
          </div>
        `;
      } else {
        const p = item.price ?? item.sell ?? item.buy ?? 0;
        const bgPriceColor = item.type === 'gold' ? 'bg-[#fed170]' : 'bg-[#88c5ee]';
        priceBoxHtml = `
          <div class="neo-box p-3 ${bgPriceColor}">
            <div class="text-xs font-bold text-gray-800 mb-1">قیمت فعلی:</div>
            <div class="text-xl font-black text-black font-num">${this.formatPrice(p)} <span class="text-xs font-bold">${unit}</span></div>
          </div>
        `;
      }

      let detailsHtml = `
        <div class="grid grid-cols-2 gap-3 mb-4">
          ${priceBoxHtml}
          <div class="neo-box p-3 ${changePercent >= 0 ? 'bg-[#97ee88]' : 'bg-[#ff88a5]'}">
            <div class="text-xs font-bold text-gray-800 mb-1">تغییرات ۲۴ ساعته:</div>
            <div class="text-lg font-black font-num text-black">${changePercent >= 0 ? '+' : '-'}${Math.abs(changePercent).toLocaleString('fa-IR')}%</div>
            ${changeAmount ? `<div class="text-xs font-num font-bold text-gray-800">${this.formatPrice(changeAmount)} ${unit}</div>` : ''}
          </div>
        </div>
      `;

      // Buy & Sell (if available)
      if (item.buy || item.sell) {
        detailsHtml += `
          <div class="grid grid-cols-2 gap-3 mb-4">
            <div class="neo-box p-3 bg-white">
              <div class="text-xs font-bold text-gray-600 mb-1">قیمت خرید:</div>
              <div class="text-base font-black font-num text-emerald-700">${item.buy ? this.formatPrice(item.buy) + ' ' + unit : 'نامشخص'}</div>
            </div>
            <div class="neo-box p-3 bg-white">
              <div class="text-xs font-bold text-gray-600 mb-1">قیمت فروش:</div>
              <div class="text-base font-black font-num text-rose-700">${item.sell ? this.formatPrice(item.sell) + ' ' + unit : 'نامشخص'}</div>
            </div>
          </div>
        `;
      }

      // Coin bubble
      if (item.bubble !== undefined && item.bubble !== null && item.bubble !== 0) {
        detailsHtml += `
          <div class="neo-box p-3 bg-[#fed170] mb-4">
            <div class="flex justify-between items-center">
              <div>
                <div class="text-xs font-black text-amber-950">حباب سکه:</div>
                <div class="text-base font-black font-num mt-0.5">${this.formatPrice(item.bubble)} ${unit}</div>
              </div>
              <div class="neo-badge bg-white font-num font-black text-amber-950">
                ${parseFloat(item.bubble_per || 0).toLocaleString('fa-IR')}% حباب
              </div>
            </div>
          </div>
        `;
      }

      // Dollar rate
      if (item.dolar_rate) {
        detailsHtml += `
          <div class="neo-box p-3 bg-[#88c5ee] mb-4 flex justify-between items-center">
            <span class="text-xs font-bold text-black">نرخ دلار مبنای محاسبه:</span>
            <span class="font-num font-black text-black">${this.formatPrice(item.dolar_rate)} ${unit}</span>
          </div>
        `;
      }

      if (modalContent) {
        modalContent.innerHTML = detailsHtml;
      }

      this.openModal('detail-modal');
    },

    openModal(modalId) {
      const modal = document.getElementById(modalId);
      if (modal) modal.classList.remove('hidden');
    },

    closeModals() {
      const modals = document.querySelectorAll('.neo-modal-backdrop');
      modals.forEach(m => m.classList.add('hidden'));
    }
  };

  window.alanchandApp = app;
  app.init();
});
