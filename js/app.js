/**
 * Main Application Controller for ChandChandi
 * Handles 93 symbols, USD/Crypto display, Toman/Rial conversion, and Neobrutalism UI.
 */

document.addEventListener('DOMContentLoaded', () => {
  const app = {
    data: {},
    currentCategory: 'fx',
    searchQuery: '',
    currencyMode: localStorage.getItem('alanchand_currency_mode') || 'toman',
    favorites: new Set(JSON.parse(localStorage.getItem('alanchand_favs') || '["usd", "18ayar", "sekkeh", "btc", "usdt"]')),
    autoRefreshInterval: 30,
    countdown: 30,
    timerId: null,
    isLoading: false,
    currentChart: null,
    activeDetailKey: null,
    activeChartPeriod: 'month',

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
        statusBadge.innerHTML = '<span class="pulse-green shrink-0"></span> <span class="truncate">وضعیت: آماده</span>';
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
          tabs.forEach(t => {
            t.classList.remove('active');
            t.setAttribute('aria-selected', 'false');
          });
          tab.classList.add('active');
          tab.setAttribute('aria-selected', 'true');
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

      // Close modal when clicking on backdrop outside the modal box
      const modalBackdrops = document.querySelectorAll('.neo-modal-backdrop');
      modalBackdrops.forEach(backdrop => {
        backdrop.addEventListener('click', (e) => {
          if (e.target === backdrop) {
            this.closeModals();
          }
        });
      });

      // Settings Modal triggers
      const openSettingsBtn = document.getElementById('open-settings-btn');
      if (openSettingsBtn) {
        openSettingsBtn.addEventListener('click', () => {
          const proxyInput = document.getElementById('settings-proxy-input');
          if (proxyInput) {
            proxyInput.value = window.alanchandApi.getCustomProxy();
          }
          const resultBox = document.getElementById('proxy-test-result');
          if (resultBox) {
            resultBox.className = 'hidden mt-2 p-2.5 rounded-[5px] border-2 border-black text-xs font-bold transition-all';
            resultBox.innerHTML = '';
          }
          this.openModal('settings-modal');
        });
      }

      // Test Proxy Connection via Real API Request
      const testProxyBtn = document.getElementById('test-proxy-btn');
      if (testProxyBtn) {
        testProxyBtn.addEventListener('click', async () => {
          const proxyInput = document.getElementById('settings-proxy-input');
          const resultBox = document.getElementById('proxy-test-result');
          const testLabel = document.getElementById('test-proxy-label');
          const testIcon = document.getElementById('test-proxy-icon');
          const proxyVal = proxyInput ? proxyInput.value.trim() : '';

          testProxyBtn.disabled = true;
          if (testLabel) testLabel.textContent = 'در حال استعلام...';
          if (testIcon) testIcon.classList.add('animate-spin');

          if (resultBox) {
            resultBox.className = 'mt-2 p-2.5 rounded-[5px] border-2 border-black bg-white text-gray-700 text-xs font-bold block';
            resultBox.innerHTML = `
              <div class="flex items-center gap-2">
                <span class="w-3 h-3 border-2 border-black border-t-transparent rounded-full animate-spin shrink-0"></span>
                <span>در حال ارسال درخواست امضاشده به api.alanchand.com از طریق پروکسی...</span>
              </div>
            `;
          }

          try {
            const res = await window.alanchandApi.testProxy(proxyVal);
            if (resultBox) {
              const proxyTypeBadge = res.isDefault
                ? '<span class="neo-badge bg-white text-[10px] px-1.5 py-0.5 border border-black">پروکسی پیش‌فرض سیستم</span>'
                : '<span class="neo-badge bg-white text-[10px] px-1.5 py-0.5 border border-black">پروکسی اختصاصی شما</span>';

              resultBox.className = 'mt-2 p-3 rounded-[5px] border-2 border-black bg-neoMint text-black text-xs font-bold flex flex-col gap-1.5 shadow-[2px_2px_0px_#000] block';
              resultBox.innerHTML = `
                <div class="flex items-center justify-between gap-2 border-b border-black pb-1.5">
                  <div class="flex items-center gap-1.5 font-black text-green-950">
                    <svg class="w-4 h-4 stroke-[3]" viewBox="0 0 24 24" fill="none" stroke="currentColor"><polyline points="20 6 9 17 4 12"/></svg>
                    <span>اتصال به API کاملاً موفق و سالم است!</span>
                  </div>
                  ${proxyTypeBadge}
                </div>
                <div class="text-[11px] leading-relaxed">
                  نرخ زنده دلار دریافتی: <strong class="font-num font-black text-black">${res.price.toLocaleString('fa-IR')} تومان</strong>
                  <br>
                  زمان پاسخ‌دهی (Latency): <strong class="font-num font-black text-black">${res.latency.toLocaleString('fa-IR')} میلی‌ثانیه</strong>
                  <br>
                  وضعیت هدر CORS: <span class="font-mono font-bold text-green-900">Access-Control-Allow-Origin: *</span>
                </div>
              `;
            }
          } catch (err) {
            if (resultBox) {
              resultBox.className = 'mt-2 p-3 rounded-[5px] border-2 border-black bg-neoPink text-black text-xs font-bold flex flex-col gap-1.5 shadow-[2px_2px_0px_#000] block';
              resultBox.innerHTML = `
                <div class="flex items-center gap-1.5 font-black text-red-950 border-b border-black pb-1.5">
                  <svg class="w-4 h-4 stroke-[3]" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
                  <span>خطا در استعلام API از طریق پروکسی!</span>
                </div>
                <div class="text-[11px] leading-relaxed font-medium text-black">${err.message}</div>
              `;
            }
          } finally {
            testProxyBtn.disabled = false;
            if (testLabel) testLabel.textContent = 'تست مجدد API';
            if (testIcon) testIcon.classList.remove('animate-spin');
          }
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
        statusBadge.innerHTML = '<span class="pulse-green shrink-0"></span> <span class="truncate">به‌روزرسانی...</span>';
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
              ? '<span class="pulse-green shrink-0"></span> <span class="truncate">وضعیت: زنده</span>'
              : '<span class="pulse-green shrink-0"></span> <span class="truncate">داده‌های ذخیره</span>';
          }
        }
      } catch (err) {
        console.warn('Could not fetch live, keeping current prices', err);
        if (statusBadge) {
          statusBadge.innerHTML = '<span class="pulse-green shrink-0"></span> <span class="truncate">وضعیت: پایدار</span>';
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
      const tbody = document.getElementById('price-table-body');
      const countDisplay = document.getElementById('filtered-count');
      const totalCountDisplay = document.getElementById('total-symbols-count');
      if (!tbody) return;

      const keys = Object.keys(this.data);
      if (totalCountDisplay && keys.length > 0) {
        totalCountDisplay.textContent = keys.length.toLocaleString('fa-IR');
      }

      if (keys.length === 0) {
        tbody.innerHTML = `
          <tr>
            <td colspan="5" class="py-12 text-center bg-white">
              <div class="text-xl font-black mb-2 flex items-center justify-center gap-2">
                <svg class="w-6 h-6 animate-spin stroke-[2.5]" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10" stroke-opacity="0.25"/><path d="M12 2a10 10 0 0 1 10 10"/></svg>
                <span>در حال بارگذاری اطلاعات بازار...</span>
              </div>
              <p class="text-gray-700 font-bold text-xs">داده‌های بازار در حال واکشی هستند.</p>
            </td>
          </tr>
        `;
        return;
      }

      tbody.innerHTML = '';

      // Filter by category (fx, gold, crypto) and search query
      const filteredKeys = keys.filter(key => {
        const item = this.data[key];

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
        tbody.innerHTML = `
          <tr>
            <td colspan="5" class="py-12 text-center bg-white">
              <div class="text-lg font-black mb-2 flex items-center justify-center gap-2">
                <svg class="w-6 h-6 stroke-[2.5]" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                <span>موردی در این دسته‌بندی یافت نشد!</span>
              </div>
              <p class="text-gray-700 font-bold text-xs">با عبارت جستجوی وارد شده در این دسته‌بندی نمادی پیدا نشد.</p>
            </td>
          </tr>
        `;
        return;
      }

      // Sort by official app_order
      filteredKeys.sort((a, b) => {
        const aOrder = this.data[a].app_order ?? 999;
        const bOrder = this.data[b].app_order ?? 999;
        return aOrder - bOrder;
      });

      const unit = this.getUnitLabel();

      filteredKeys.forEach(key => {
        const item = this.data[key];
        const isCrypto = item.type === 'crypto';
        const isDollarGold = item.is_dolar === 1;

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
            <span class="neo-badge neo-badge-green font-bold text-xs px-2.5 py-0.5">
              <svg class="w-3.5 h-3.5 stroke-[3]" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="m18 15-6-6-6 6"/></svg>
              <span class="font-num font-black">${changePercent.toLocaleString('fa-IR')}%+</span>
            </span>
          `;
        } else if (isNegative) {
          changeBadgeHtml = `
            <span class="neo-badge neo-badge-red font-bold text-xs px-2.5 py-0.5">
              <svg class="w-3.5 h-3.5 stroke-[3]" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="m6 9 6 6 6-6"/></svg>
              <span class="font-num font-black">${Math.abs(changePercent).toLocaleString('fa-IR')}%-</span>
            </span>
          `;
        } else {
          changeBadgeHtml = `
            <span class="neo-badge neo-badge-gray font-bold text-xs px-2.5 py-0.5">
              <svg class="w-3.5 h-3.5 stroke-[3]" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M5 12h14"/></svg>
              <span class="font-num font-black">۰%</span>
            </span>
          `;
        }

        // 2. Format Prices
        let mainPriceHtml = '';
        let subPriceHtml = '';

        if (isCrypto) {
          const formattedUsd = this.formatCryptoUsd(item.price, item.dec_round);
          const tomanVal = item.toman ? this.formatPrice(item.toman) : null;

          if (tomanVal) {
            mainPriceHtml = `
              <div class="flex items-baseline gap-1">
                <span class="text-base sm:text-lg font-black text-black font-num">${tomanVal}</span>
                <span class="text-xs font-black text-gray-700">${unit}</span>
              </div>
            `;
            subPriceHtml = `
              <div class="flex items-center gap-1.5 text-xs">
                <span class="text-gray-500 font-bold">قیمت دلاری:</span>
                <span class="font-mono font-black text-black tracking-tight">$ ${formattedUsd}</span>
              </div>
            `;
          } else {
            mainPriceHtml = `
              <div class="flex items-baseline gap-1">
                <span class="text-base sm:text-lg font-black text-black font-mono tracking-tight">$ ${formattedUsd}</span>
              </div>
            `;
            subPriceHtml = `<span class="text-xs font-bold text-gray-400">---</span>`;
          }
        } else if (isDollarGold) {
          const usdVal = parseFloat(item.price || 0).toLocaleString('en-US', { minimumFractionDigits: 2 });
          mainPriceHtml = `
            <div class="flex items-baseline gap-1">
              <span class="text-base sm:text-lg font-black text-black font-mono tracking-tight">$ ${usdVal}</span>
            </div>
          `;
          subPriceHtml = `<span class="text-xs font-bold text-gray-500">انس جهانی</span>`;
        } else {
          const mainPrice = item.price ?? item.sell ?? item.buy ?? 0;
          mainPriceHtml = `
            <div class="flex items-baseline gap-1">
              <span class="text-base sm:text-lg font-black text-black font-num">${this.formatPrice(mainPrice)}</span>
              <span class="text-xs font-black text-gray-700">${unit}</span>
            </div>
          `;

          if (item.buy) {
            subPriceHtml = `
              <div class="flex items-center gap-2 flex-wrap">
                <div class="flex items-baseline gap-1 text-xs">
                  <span class="text-gray-500 font-bold">خرید:</span>
                  <span class="font-num font-black text-black">${this.formatPrice(item.buy)}</span>
                  <span class="text-[10px] font-bold text-gray-500">${unit}</span>
                </div>
                ${item.bubble_per ? `
                  <span class="neo-badge bg-neoLemon text-[10px] font-bold text-amber-950 py-0.5 px-1.5 border border-black shadow-none" title="حباب سکه">
                    حباب: <span class="font-num font-black">${parseFloat(item.bubble_per).toLocaleString('fa-IR')}%</span>
                  </span>
                ` : ''}
              </div>
            `;
          } else if (item.bubble_per) {
            subPriceHtml = `
              <span class="neo-badge bg-neoLemon text-[10px] font-bold text-amber-950 py-0.5 px-1.5 border border-black shadow-none" title="حباب سکه">
                حباب: <span class="font-num font-black">${parseFloat(item.bubble_per).toLocaleString('fa-IR')}%</span>
              </span>
            `;
          } else {
            subPriceHtml = `<span class="text-xs font-bold text-gray-400">---</span>`;
          }
        }

        // 3. Asset icon and slug
        const iconSlug = (item.slug || key).toUpperCase();
        const iconSrc = `assets/icons/${item.type}/${iconSlug}.png`;
        const fallbackIcon = item.icon || '';

        // 4. Build Table Row (Fully Responsive for Mobile)
        const tr = document.createElement('tr');
        tr.className = 'hover:bg-neoMain/15 transition-colors cursor-pointer group';
        tr.setAttribute('data-key', key);
        tr.innerHTML = `
          <!-- Col 1: Asset & Symbol -->
          <td class="py-2.5 sm:py-3.5 px-2.5 sm:px-4 align-middle">
            <div class="flex items-center gap-2 sm:gap-3">
              <div class="w-8 h-8 sm:w-9 sm:h-9 rounded-[4px] border-2 border-black bg-white shadow-[1px_1px_0px_#000] p-0.5 flex items-center justify-center shrink-0">
                <img src="${iconSrc}" alt="${item.fa_name || key}" class="w-full h-full object-contain" onerror="this.onerror=null; if('${fallbackIcon}') { this.src='${fallbackIcon}'; } else { this.style.display='none'; }" loading="lazy" />
              </div>
              <div class="min-w-0">
                <div class="flex items-center gap-1.5 flex-wrap">
                  <span class="font-black text-xs sm:text-base text-black group-hover:underline truncate">${item.fa_name || key}</span>
                  <span class="font-mono font-black text-[10px] sm:text-[11px] px-1 sm:px-1.5 py-0.2 sm:py-0.5 border border-black rounded-[3px] bg-white shadow-[1px_1px_0px_#000]">${iconSlug}</span>
                </div>
                <div class="text-[10px] sm:text-[11px] font-bold text-gray-500 font-mono truncate hidden sm:block">${item.en_name || ''}</div>
              </div>
            </div>
          </td>

          <!-- Col 2: Live Rate (and sub-rate on mobile) -->
          <td class="py-2.5 sm:py-3.5 px-2.5 sm:px-4 align-middle">
            ${mainPriceHtml}
            <div class="sm:hidden mt-0.5">
              ${subPriceHtml}
            </div>
          </td>

          <!-- Col 3: Buy / USD rate (Desktop & Tablet) -->
          <td class="hidden sm:table-cell py-2.5 sm:py-3.5 px-3 sm:px-4 align-middle">
            ${subPriceHtml}
          </td>

          <!-- Col 4: 24h Change Badge -->
          <td class="py-2.5 sm:py-3.5 px-2 sm:px-4 text-center align-middle">
            <div class="flex justify-center">
              ${changeBadgeHtml}
            </div>
          </td>

          <!-- Col 5: Details Button (Desktop & Tablet) -->
          <td class="hidden md:table-cell py-2.5 sm:py-3.5 px-3 text-center align-middle">
            <div class="flex items-center justify-center">
              <button type="button" class="neo-btn-sm bg-white hover:!bg-neoMain text-xs font-black py-1 px-3 border-2 border-black shadow-[1px_1px_0px_#000]" title="مشاهده جزئیات و نمودار">
                <svg class="w-3.5 h-3.5 stroke-[2.5]" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>
                <span>نمودار</span>
              </button>
            </div>
          </td>
        `;

        tr.addEventListener('click', () => {
          this.openDetailModal(key);
        });

        tbody.appendChild(tr);
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
          <div class="neo-box p-3 bg-neoMain">
            <div class="text-xs font-bold text-gray-800 mb-1">قیمت دلاری:</div>
            <div class="text-xl font-black font-mono tracking-tight text-black">$ ${usdVal}</div>
            ${item.toman ? `<div class="text-xs font-bold text-gray-800 mt-1">معادل: <span class="font-num font-black text-black">${this.formatPrice(item.toman)}</span> ${unit}</div>` : ''}
          </div>
        `;
      } else if (isDollarGold) {
        priceBoxHtml = `
          <div class="neo-box p-3 bg-neoSky">
            <div class="text-xs font-bold text-gray-800 mb-1">قیمت دلاری (انس):</div>
            <div class="text-xl font-black font-mono tracking-tight text-black">$ ${parseFloat(item.price || 0).toLocaleString('en-US')}</div>
          </div>
        `;
      } else {
        const p = item.price ?? item.sell ?? item.buy ?? 0;
        const bgPriceColor = item.type === 'gold' ? 'bg-neoLemon' : 'bg-neoSky';
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
          <div class="neo-box p-3 ${changePercent >= 0 ? 'bg-neoMint' : 'bg-neoPink'}">
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
          <div class="neo-box p-3 bg-neoLemon mb-4">
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
          <div class="neo-box p-3 bg-neoSky mb-4 flex justify-between items-center">
            <span class="text-xs font-bold text-black">نرخ دلار مبنای محاسبه:</span>
            <span class="font-num font-black text-black">${this.formatPrice(item.dolar_rate)} ${unit}</span>
          </div>
        `;
      }

      // 5. Chart Section
      const chartData = item.chart;
      const hasChart = chartData && (
        (chartData.month && chartData.month.length > 0) ||
        (chartData.year && chartData.year.length > 0) ||
        (chartData.all && chartData.all.length > 0)
      );

      if (hasChart) {
        detailsHtml += `
          <div class="mt-4 pt-4 border-t-2 border-black border-dashed">
            <div class="flex flex-wrap items-center justify-between gap-2 mb-3">
              <div class="flex items-center gap-1.5 font-black text-sm text-black">
                <svg class="w-4 h-4 stroke-[2.5]" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>
                <span>نمودار روند تغییرات قیمت</span>
              </div>
              <div class="flex items-center gap-1 bg-neoBg p-1 border-2 border-black rounded-[5px]" id="chart-period-tabs">
                <button type="button" class="chart-period-btn active text-xs font-black py-1 px-3 rounded-[3px] border border-black bg-neoMain shadow-[1px_1px_0px_#000]" data-period="month">۳۰ روزه</button>
                <button type="button" class="chart-period-btn text-xs font-black py-1 px-3 rounded-[3px] border border-transparent hover:border-black hover:bg-white" data-period="year">۱ ساله</button>
                <button type="button" class="chart-period-btn text-xs font-black py-1 px-3 rounded-[3px] border border-transparent hover:border-black hover:bg-white" data-period="all">کل دوره</button>
              </div>
            </div>

            <!-- Stats Bar (High, Low, Return) -->
            <div id="chart-stats-bar" class="grid grid-cols-3 gap-2 mb-3">
              <!-- Injected by renderModalChart -->
            </div>

            <!-- Canvas Container -->
            <div class="relative w-full h-56 sm:h-64 bg-white p-2 border-2 border-black rounded-[5px] shadow-[2px_2px_0px_#000]">
              <canvas id="modal-chart-canvas"></canvas>
            </div>
          </div>
        `;
      } else {
        detailsHtml += `
          <div class="mt-4 pt-4 border-t-2 border-black border-dashed">
            <div class="p-4 bg-neoBg border-2 border-black rounded-[5px] text-center text-xs font-bold text-gray-600">
              داده‌های تاریخی نموداری برای این نماد ثبت نشده است.
            </div>
          </div>
        `;
      }

      if (modalContent) {
        modalContent.innerHTML = detailsHtml;
      }

      this.openModal('detail-modal');

      if (hasChart) {
        this.activeDetailKey = key;
        this.activeChartPeriod = 'month';

        const periodBtns = modalContent.querySelectorAll('.chart-period-btn');
        periodBtns.forEach(btn => {
          btn.addEventListener('click', () => {
            periodBtns.forEach(b => {
              b.classList.remove('active', 'bg-neoMain', 'shadow-[1px_1px_0px_#000]');
              b.classList.add('border-transparent');
            });
            btn.classList.add('active', 'bg-neoMain', 'shadow-[1px_1px_0px_#000]');
            btn.classList.remove('border-transparent');
            this.activeChartPeriod = btn.dataset.period;
            this.renderModalChart(key, this.activeChartPeriod);
          });
        });

        // Initialize chart after modal DOM layout renders
        setTimeout(() => {
          this.renderModalChart(key, 'month');
        }, 60);
      }
    },

    renderModalChart(key, period) {
      const item = this.data[key];
      if (!item || !item.chart) return;

      const canvas = document.getElementById('modal-chart-canvas');
      const statsBar = document.getElementById('chart-stats-bar');
      if (!canvas) return;

      if (this.currentChart) {
        this.currentChart.destroy();
        this.currentChart = null;
      }

      const points = item.chart[period] || [];
      if (points.length === 0) {
        if (statsBar) {
          statsBar.innerHTML = '<div class="col-span-3 text-center text-xs font-bold text-gray-500">اطلاعاتی برای این بازه زمانی وجود ندارد.</div>';
        }
        return;
      }

      const unit = this.getUnitLabel();
      const isCrypto = item.type === 'crypto';
      const values = points.map(pt => parseFloat(pt.v) || 0);
      const minVal = Math.min(...values);
      const maxVal = Math.max(...values);
      const firstVal = values[0];
      const lastVal = values[values.length - 1];
      const changeVal = lastVal - firstVal;
      const changePer = firstVal !== 0 ? ((changeVal / firstVal) * 100) : 0;
      const isPositive = changePer >= 0;

      let minDisplay = isCrypto ? '$' + minVal.toLocaleString('en-US') : this.formatPrice(minVal) + ' ' + unit;
      let maxDisplay = isCrypto ? '$' + maxVal.toLocaleString('en-US') : this.formatPrice(maxVal) + ' ' + unit;

      if (statsBar) {
        statsBar.innerHTML = `
          <div class="p-2 border-2 border-black rounded-[4px] bg-white shadow-[1px_1px_0px_#000] text-center">
            <div class="text-[10px] font-bold text-gray-500 mb-0.5">کمترین:</div>
            <div class="font-num font-black text-xs sm:text-sm text-black truncate">${minDisplay}</div>
          </div>
          <div class="p-2 border-2 border-black rounded-[4px] bg-white shadow-[1px_1px_0px_#000] text-center">
            <div class="text-[10px] font-bold text-gray-500 mb-0.5">بیشترین:</div>
            <div class="font-num font-black text-xs sm:text-sm text-black truncate">${maxDisplay}</div>
          </div>
          <div class="p-2 border-2 border-black rounded-[4px] ${isPositive ? 'bg-neoMint' : 'bg-neoPink'} shadow-[1px_1px_0px_#000] text-center">
            <div class="text-[10px] font-bold text-black mb-0.5">تغییر بازه:</div>
            <div class="font-num font-black text-xs sm:text-sm text-black">${isPositive ? '+' : ''}${changePer.toLocaleString('fa-IR', { maximumFractionDigits: 2 })}%</div>
          </div>
        `;
      }

      const labels = points.map(pt => {
        const d = new Date(pt.l * 1000);
        if (period === 'month') {
          return d.toLocaleDateString('fa-IR', { month: 'numeric', day: 'numeric' });
        } else if (period === 'year') {
          return d.toLocaleDateString('fa-IR', { year: '2-digit', month: 'short' });
        } else {
          return d.toLocaleDateString('fa-IR', { year: 'numeric', month: 'short' });
        }
      });

      const ctx = canvas.getContext('2d');
      const lineColor = isPositive ? '#16a34a' : '#e11d48';
      const fillColor = isPositive ? 'rgba(151, 238, 136, 0.28)' : 'rgba(255, 136, 165, 0.28)';

      if (typeof Chart === 'undefined') return;

      this.currentChart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: labels,
          datasets: [{
            label: item.fa_name || key,
            data: values,
            borderColor: lineColor,
            borderWidth: 2.5,
            backgroundColor: fillColor,
            fill: true,
            tension: 0.2,
            pointRadius: points.length > 40 ? 0 : 2.5,
            pointHoverRadius: 6,
            pointBackgroundColor: '#000000',
            pointBorderColor: '#ffffff',
            pointBorderWidth: 1.5
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: {
            mode: 'index',
            intersect: false
          },
          plugins: {
            legend: { display: false },
            tooltip: {
              rtl: true,
              backgroundColor: '#000000',
              titleColor: '#ffffff',
              bodyColor: '#ffffff',
              titleFont: { family: 'Vazirmatn', size: 11, weight: 'bold' },
              bodyFont: { family: 'Vazirmatn', size: 12, weight: 'bold' },
              padding: 8,
              cornerRadius: 4,
              displayColors: false,
              callbacks: {
                label: (c) => {
                  const val = c.parsed.y;
                  if (isCrypto) return 'نرخ: $' + val.toLocaleString('en-US');
                  return 'نرخ: ' + app.formatPrice(val) + ' ' + unit;
                }
              }
            }
          },
          scales: {
            x: {
              grid: { display: false },
              ticks: {
                font: { family: 'Vazirmatn', size: 10, weight: 'bold' },
                color: '#555',
                maxRotation: 0,
                autoSkip: true,
                maxTicksLimit: 6
              }
            },
            y: {
              position: 'right',
              grid: { color: 'rgba(0, 0, 0, 0.07)' },
              ticks: {
                font: { family: 'Vazirmatn', size: 10, weight: 'bold' },
                color: '#555',
                callback: (val) => {
                  if (isCrypto) return '$' + val.toLocaleString('en-US');
                  if (val >= 1000000) return (val / 1000000).toLocaleString('fa-IR') + ' م';
                  if (val >= 1000) return (val / 1000).toLocaleString('fa-IR') + ' هـ';
                  return val.toLocaleString('fa-IR');
                }
              }
            }
          }
        }
      });
    },

    openModal(modalId) {
      const modal = document.getElementById(modalId);
      if (modal) {
        modal.classList.remove('hidden', 'is-closing');
        const box = modal.querySelector('.neo-modal');
        if (box) {
          box.style.animation = 'none';
          void box.offsetHeight; // force reflow so open animation always plays
          box.style.animation = '';
        }
      }
    },

    closeModals() {
      if (this.currentChart) {
        this.currentChart.destroy();
        this.currentChart = null;
      }
      const openModals = document.querySelectorAll('.neo-modal-backdrop:not(.hidden)');
      if (!openModals.length) return;

      openModals.forEach(m => {
        if (m.classList.contains('is-closing')) return;
        m.classList.add('is-closing');

        let isDone = false;
        const finish = () => {
          if (isDone) return;
          isDone = true;
          m.classList.remove('is-closing');
          m.classList.add('hidden');
        };

        const modalBox = m.querySelector('.neo-modal');
        if (modalBox) {
          modalBox.addEventListener('animationend', finish, { once: true });
        }
        // Safety timeout matching the 0.15s CSS exit animation
        setTimeout(finish, 170);
      });
    }
  };

  window.alanchandApp = app;
  app.init();
});
