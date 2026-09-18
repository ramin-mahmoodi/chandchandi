/**
 * Main Application Controller for ChandChandi (Neobrutalism Web)
 */

document.addEventListener('DOMContentLoaded', () => {
  const app = {
    data: {},
    metadata: window.ALANCHAND_SYMBOLS || [],
    currentCategory: 'all',
    searchQuery: '',
    currencyMode: localStorage.getItem('alanchand_currency_mode') || 'toman',
    favorites: new Set(JSON.parse(localStorage.getItem('alanchand_favs') || '["usd", "18ayar", "sekkeh", "btc", "usdt"]')),
    autoRefreshInterval: 30,
    countdown: 30,
    timerId: null,
    isLoading: false,

    init() {
      // 1. Instantly populate with bundled or cached data so UI is NEVER empty
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
        statusBadge.innerHTML = '<span class="pulse-green"></span> آماده (آفلاین/کش)';
      }

      // 2. Start timer and attempt live refresh in background
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
        if (e.key === 'Escape') {
          this.closeModals();
        }
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
      if (statusBadge) {
        statusBadge.innerHTML = '<span class="pulse-green"></span> در حال به‌روزرسانی...';
      }

      try {
        const result = await window.alanchandApi.fetchPrices('usd,eur,18ayar,btc');
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
              ? '<span class="pulse-green"></span> وضعیت: آنلاین (زنده)'
              : '<span class="pulse-green"></span> وضعیت: داده‌های ذخیره‌شده';
          }
        }
      } catch (err) {
        console.warn('Live fetch not reachable, using offline/cached prices', err);
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
        el.textContent = `آخرین بروزرسانی: ${timestampStr}`;
      } else {
        const now = new Date();
        el.textContent = `آخرین بروزرسانی: ${now.toLocaleTimeString('fa-IR')}`;
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

    renderGrid() {
      const container = document.getElementById('cards-grid');
      const countDisplay = document.getElementById('filtered-count');
      if (!container) return;

      const keys = Object.keys(this.data);
      if (keys.length === 0) {
        container.innerHTML = `
          <div class="col-span-full neo-card text-center p-8 bg-yellow-100">
            <div class="text-2xl font-black mb-2">در حال بارگذاری...</div>
            <p class="text-gray-700 font-bold">در حال راه‌اندازی کارت‌های بازار.</p>
          </div>
        `;
        return;
      }

      container.innerHTML = '';

      // Filter
      const filteredKeys = keys.filter(key => {
        const item = this.data[key];
        const isFav = this.favorites.has(key);

        // Category filter
        if (this.currentCategory === 'fav' && !isFav) return false;
        if (this.currentCategory === 'gold' && item.type !== 'gold') return false;
        if (this.currentCategory === 'fx' && item.type !== 'fx') return false;
        if (this.currentCategory === 'crypto' && item.type !== 'crypto') return false;

        // Search filter
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
          <div class="col-span-full neo-card text-center p-8 bg-red-50">
            <div class="text-2xl font-black mb-2">موردی یافت نشد! 🔍</div>
            <p class="text-gray-700 font-bold">با عبارت جستجوی وارد شده یا فیلتر فعلی نمادی پیدا نشد.</p>
          </div>
        `;
        return;
      }

      // Sort favorites first, then by app_order
      filteredKeys.sort((a, b) => {
        const aFav = this.favorites.has(a) ? 1 : 0;
        const bFav = this.favorites.has(b) ? 1 : 0;
        if (aFav !== bFav) return bFav - aFav;
        const aOrder = this.data[a].app_order || 999;
        const bOrder = this.data[b].app_order || 999;
        return aOrder - bOrder;
      });

      const unit = this.getUnitLabel();

      filteredKeys.forEach(key => {
        const item = this.data[key];
        const isFav = this.favorites.has(key);

        // Determine price
        let price = item.price;
        if (price === undefined || price === null) {
          price = item.sell !== undefined ? item.sell : (item.toman || 0);
        }

        // Determine change
        const changePercent = item.dayChangePer !== undefined ? item.dayChangePer : (item.changePercent || 0);
        const changeAmount = item.dayChange !== undefined ? item.dayChange : (item.changeAmount || 0);
        const isPositive = changePercent > 0;
        const isNegative = changePercent < 0;

        const badgeClass = isPositive ? 'neo-badge-green' : (isNegative ? 'neo-badge-red' : 'neo-badge-gray');
        const changeIcon = isPositive ? '▲' : (isNegative ? '▼' : '▬');
        const changeSign = isPositive ? '+' : '';

        // Category Tag Color
        let categoryColor = 'bg-blue-100';
        let categoryName = 'ارز فیات';
        if (item.type === 'gold') {
          categoryColor = 'bg-yellow-200';
          categoryName = 'طلا و سکه';
        } else if (item.type === 'crypto') {
          categoryColor = 'bg-purple-200';
          categoryName = 'رمزارز';
        }

        const card = document.createElement('div');
        card.className = 'neo-card flex flex-col justify-between cursor-pointer';
        card.innerHTML = `
          <div>
            <div class="flex items-center justify-between mb-3">
              <div class="flex items-center gap-2">
                <span class="neo-badge ${categoryColor} text-black font-extrabold">${categoryName}</span>
                <span class="font-mono font-black text-xs px-2 py-0.5 border-2 border-black rounded-md bg-white">${(item.slug || key).toUpperCase()}</span>
              </div>
              <button class="fav-star-btn text-xl transition-transform hover:scale-125 focus:outline-none" data-key="${key}" title="علاقه‌مندی">
                ${isFav ? '⭐' : '☆'}
              </button>
            </div>

            <div class="mb-4">
              <h3 class="text-lg font-black text-black leading-tight">${item.fa_name || key}</h3>
              <div class="text-xs font-bold text-gray-600 font-mono mt-0.5">${item.en_name || ''}</div>
            </div>
          </div>

          <div class="pt-3 border-t-2 border-black border-dashed">
            <div class="flex items-baseline justify-between gap-1 mb-2">
              <span class="text-xs font-bold text-gray-500">قیمت:</span>
              <div class="flex items-baseline gap-1">
                <span class="text-xl font-black text-black font-mono tracking-tight">${this.formatPrice(price)}</span>
                <span class="text-xs font-black text-black">${unit}</span>
              </div>
            </div>

            <div class="flex items-center justify-between text-xs font-bold">
              <span class="text-gray-500">تغییر ۲۴س:</span>
              <span class="neo-badge ${badgeClass} font-mono">
                ${changeIcon} ${changeSign}${changePercent}%
              </span>
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

      const priorityKeys = ['usd', 'eur', '18ayar', 'sekkeh', 'bahar', 'btc', 'eth', 'usdt', 'aed', 'try'];
      const unit = this.getUnitLabel();
      let html = '';

      priorityKeys.forEach(k => {
        const item = this.data[k];
        if (!item) return;

        let price = item.price || item.sell || item.toman || 0;
        const changePercent = item.dayChangePer !== undefined ? item.dayChangePer : (item.changePercent || 0);
        const changeSign = changePercent > 0 ? '+' : '';
        const color = changePercent > 0 ? 'text-green-800' : (changePercent < 0 ? 'text-red-700' : 'text-gray-800');

        html += `
          <div class="ticker-item">
            <span class="font-black text-black">${item.fa_name || k}:</span>
            <span class="font-mono font-black text-black">${this.formatPrice(price)} ${unit}</span>
            <span class="font-mono text-xs font-black ${color}">(${changeSign}${changePercent}%)</span>
            <span class="text-black font-bold mx-2">★</span>
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
      const modalContent = document.getElementById('modal-details-body');

      if (modalTitle) modalTitle.textContent = item.fa_name || key;
      if (modalSubtitle) modalSubtitle.textContent = item.en_name || '';
      if (modalSlug) modalSlug.textContent = (item.slug || key).toUpperCase();

      let price = item.price || item.sell || item.toman || 0;
      const changePercent = item.dayChangePer !== undefined ? item.dayChangePer : (item.changePercent || 0);
      const changeAmount = item.dayChange !== undefined ? item.dayChange : (item.changeAmount || 0);

      let detailsHtml = `
        <div class="grid grid-cols-2 gap-3 mb-4">
          <div class="neo-box p-3 bg-yellow-100">
            <div class="text-xs font-bold text-gray-600 mb-1">قیمت فعلی:</div>
            <div class="text-xl font-black font-mono">${this.formatPrice(price)} <span class="text-xs font-bold">${unit}</span></div>
          </div>
          <div class="neo-box p-3 ${changePercent >= 0 ? 'bg-green-100' : 'bg-red-100'}">
            <div class="text-xs font-bold text-gray-600 mb-1">تغییرات ۲۴ ساعته:</div>
            <div class="text-lg font-black font-mono">${changePercent >= 0 ? '+' : ''}${changePercent}%</div>
            <div class="text-xs font-mono font-bold text-gray-600">${this.formatPrice(changeAmount)} ${unit}</div>
          </div>
        </div>
      `;

      if (item.buy || item.sell) {
        detailsHtml += `
          <div class="grid grid-cols-2 gap-3 mb-4">
            <div class="neo-box p-3 bg-white">
              <div class="text-xs font-bold text-gray-500 mb-1">قیمت خرید:</div>
              <div class="text-base font-black font-mono text-green-700">${item.buy ? this.formatPrice(item.buy) + ' ' + unit : 'نامشخص'}</div>
            </div>
            <div class="neo-box p-3 bg-white">
              <div class="text-xs font-bold text-gray-500 mb-1">قیمت فروش:</div>
              <div class="text-base font-black font-mono text-red-700">${item.sell ? this.formatPrice(item.sell) + ' ' + unit : 'نامشخص'}</div>
            </div>
          </div>
        `;
      }

      if (item.bubble !== undefined && item.bubble !== null) {
        detailsHtml += `
          <div class="neo-box p-3 bg-purple-100 mb-4">
            <div class="flex justify-between items-center">
              <div>
                <div class="text-xs font-black text-purple-900">حباب سکه:</div>
                <div class="text-base font-black font-mono mt-0.5">${this.formatPrice(item.bubble)} ${unit}</div>
              </div>
              <div class="neo-badge bg-white font-mono font-black text-purple-800">
                ${item.bubblePer || 0}% حباب
              </div>
            </div>
          </div>
        `;
      }

      if (item.dolar_rate) {
        detailsHtml += `
          <div class="neo-box p-3 bg-blue-50 mb-4 flex justify-between items-center">
            <span class="text-xs font-bold text-gray-600">نرخ دلار مبنای محاسبه:</span>
            <span class="font-mono font-black">${this.formatPrice(item.dolar_rate)} ${unit}</span>
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
      if (modal) {
        modal.classList.remove('hidden');
      }
    },

    closeModals() {
      const modals = document.querySelectorAll('.neo-modal-backdrop');
      modals.forEach(m => m.classList.add('hidden'));
    }
  };

  window.alanchandApp = app;
  app.init();
});
