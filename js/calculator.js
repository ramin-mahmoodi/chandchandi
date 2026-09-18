/**
 * Neobrutalism Quick Converter & Gold Calculator
 */

class CurrencyCalculator {
  constructor() {
    this.symbolsData = {};
    this.currencyMode = 'toman'; // 'toman' or 'rial'
    this.selectedSymbol = 'usd';
    this.isSelectOpen = false;
    this.hasInitializedSelect = false;
  }

  setSymbolsData(data) {
    this.symbolsData = data || {};
    this.initCustomSelect();
    this.populateSelectOptions();
    this.recalculate();
  }

  setCurrencyMode(mode) {
    this.currencyMode = mode;
    this.recalculate();
  }

  initCustomSelect() {
    if (this.hasInitializedSelect) return;
    this.hasInitializedSelect = true;

    const trigger = document.getElementById('calc-select-trigger');
    const dropdown = document.getElementById('calc-select-dropdown');
    const searchInput = document.getElementById('calc-select-search');

    if (trigger) {
      trigger.addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggleDropdown();
      });
    }

    document.addEventListener('click', (e) => {
      const container = document.getElementById('calc-select-container');
      if (container && !container.contains(e.target)) {
        this.closeDropdown();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') this.closeDropdown();
    });

    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        const query = e.target.value.trim().toLowerCase();
        const items = document.querySelectorAll('.calc-select-item');
        items.forEach(item => {
          const text = (item.getAttribute('data-search') || '').toLowerCase();
          if (!query || text.includes(query)) {
            item.classList.remove('hidden');
          } else {
            item.classList.add('hidden');
          }
        });
      });
      searchInput.addEventListener('click', (e) => e.stopPropagation());
    }
  }

  toggleDropdown() {
    const dropdown = document.getElementById('calc-select-dropdown');
    const trigger = document.getElementById('calc-select-trigger');
    const chevron = document.getElementById('calc-select-chevron');
    const searchInput = document.getElementById('calc-select-search');
    if (!dropdown || !trigger) return;

    this.isSelectOpen = !this.isSelectOpen;
    if (this.isSelectOpen) {
      dropdown.classList.remove('hidden');
      trigger.setAttribute('aria-expanded', 'true');
      if (chevron) chevron.classList.add('rotate-180');
      if (searchInput) {
        searchInput.value = '';
        const items = document.querySelectorAll('.calc-select-item');
        items.forEach(el => el.classList.remove('hidden'));
        setTimeout(() => searchInput.focus(), 60);
      }
    } else {
      this.closeDropdown();
    }
  }

  closeDropdown() {
    const dropdown = document.getElementById('calc-select-dropdown');
    const trigger = document.getElementById('calc-select-trigger');
    const chevron = document.getElementById('calc-select-chevron');
    if (!dropdown || !trigger) return;

    this.isSelectOpen = false;
    dropdown.classList.add('hidden');
    trigger.setAttribute('aria-expanded', 'false');
    if (chevron) chevron.classList.remove('rotate-180');
  }

  selectSymbol(key) {
    this.selectedSymbol = key;
    const select = document.getElementById('calc-symbol-select');
    if (select) {
      select.value = key;
    }

    const item = this.symbolsData[key];
    if (item) {
      const label = document.getElementById('calc-selected-label');
      const icon = document.getElementById('calc-selected-icon');
      const iconSlug = (item.slug || key).toUpperCase();
      const displayName = `${item.fa_name || item.slug || key} (${iconSlug})`;

      if (label) label.textContent = displayName;
      if (icon) {
        icon.src = `assets/icons/${item.type || 'currency'}/${iconSlug}.png`;
        icon.style.display = '';
      }
    }

    const allItems = document.querySelectorAll('.calc-select-item');
    allItems.forEach(el => {
      const isSelected = el.getAttribute('data-value') === key;
      const checkIcon = el.querySelector('.check-icon');
      if (isSelected) {
        el.classList.add('bg-[#b6ace4]');
        if (checkIcon) checkIcon.classList.remove('hidden');
      } else {
        el.classList.remove('bg-[#b6ace4]');
        if (checkIcon) checkIcon.classList.add('hidden');
      }
    });

    this.closeDropdown();
    this.recalculate();
  }

  populateSelectOptions() {
    const select = document.getElementById('calc-symbol-select');
    const list = document.getElementById('calc-select-list');
    if (!select) return;

    const currentVal = this.selectedSymbol || select.value || 'usd';
    select.innerHTML = '';
    if (list) list.innerHTML = '';

    const prioritySlugs = ['usd', 'eur', 'aed', 'try', 'gbp', '18ayar', 'sekkeh', 'bahar', 'nim', 'rob', 'btc', 'eth', 'usdt', 'sol', 'ton'];
    const keys = Object.keys(this.symbolsData);

    keys.sort((a, b) => {
      const aIdx = prioritySlugs.indexOf(a);
      const bIdx = prioritySlugs.indexOf(b);
      if (aIdx !== -1 && bIdx !== -1) return aIdx - bIdx;
      if (aIdx !== -1) return -1;
      if (bIdx !== -1) return 1;
      return a.localeCompare(b);
    });

    keys.forEach(k => {
      const item = this.symbolsData[k];
      if (!item) return;
      const iconSlug = (item.slug || k).toUpperCase();
      const displayName = `${item.fa_name || item.slug || k} (${iconSlug})`;
      const isSelected = k === currentVal;

      // 1. Native hidden option
      const opt = document.createElement('option');
      opt.value = k;
      opt.textContent = displayName;
      if (isSelected) opt.selected = true;
      select.appendChild(opt);

      // 2. Neobrutal dropdown item
      if (list) {
        const itemDiv = document.createElement('div');
        itemDiv.className = `calc-select-item neo-select-item ${isSelected ? 'bg-[#b6ace4]' : ''}`;
        itemDiv.setAttribute('data-value', k);
        itemDiv.setAttribute('data-search', `${item.fa_name || ''} ${item.slug || ''} ${k} ${displayName}`);
        itemDiv.setAttribute('role', 'option');
        itemDiv.setAttribute('aria-selected', isSelected ? 'true' : 'false');

        itemDiv.innerHTML = `
          <div class="flex items-center gap-2 truncate">
            <img src="assets/icons/${item.type || 'currency'}/${iconSlug}.png" class="w-5 h-5 rounded-full border border-black shrink-0 object-contain bg-white" alt="" onerror="this.style.display='none'">
            <span class="truncate font-bold text-xs sm:text-sm">${displayName}</span>
          </div>
          <svg class="check-icon h-4 w-4 shrink-0 text-black stroke-[3] ${isSelected ? '' : 'hidden'}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        `;

        itemDiv.addEventListener('click', () => {
          this.selectSymbol(k);
        });

        list.appendChild(itemDiv);
      }
    });

    const activeKey = this.symbolsData[currentVal] ? currentVal : (this.symbolsData['usd'] ? 'usd' : keys[0]);
    if (activeKey) {
      this.selectSymbol(activeKey);
    }
  }

  recalculate() {
    const amountInput = document.getElementById('calc-amount-input');
    const symbolSelect = document.getElementById('calc-symbol-select');
    const resultDisplay = document.getElementById('calc-result-display');
    const detailsDisplay = document.getElementById('calc-details-display');

    if (!amountInput || !symbolSelect || !resultDisplay) return;

    const amount = parseFloat(amountInput.value) || 0;
    const selectedKey = symbolSelect.value;
    const symbolItem = this.symbolsData[selectedKey];

    if (!symbolItem) {
      resultDisplay.textContent = '---';
      if (detailsDisplay) detailsDisplay.textContent = '';
      return;
    }

    // Determine price in Toman
    let priceInToman = 0;
    const isCrypto = symbolItem.type === 'crypto';
    const isDollarItem = symbolItem.is_dolar === 1;

    // USD rate reference for conversion
    const usdItem = this.symbolsData['usd'];
    const usdRate = (usdItem && (usdItem.sell || usdItem.price || usdItem.buy)) || 0;

    if (isCrypto) {
      priceInToman = symbolItem.toman || ((symbolItem.price || 0) * usdRate);
    } else if (isDollarItem) {
      priceInToman = (symbolItem.price || 0) * usdRate;
    } else {
      priceInToman = symbolItem.price || symbolItem.sell || symbolItem.buy || 0;
    }

    if (this.currencyMode === 'rial') {
      priceInToman = priceInToman * 10;
    }

    const totalValue = amount * priceInToman;
    const unitLabel = this.currencyMode === 'rial' ? 'ریال' : 'تومان';

    resultDisplay.textContent = `${Math.round(totalValue).toLocaleString('fa-IR')} ${unitLabel}`;

    if (detailsDisplay) {
      const singlePriceFormatted = Math.round(priceInToman).toLocaleString('fa-IR');
      let extraInfo = '';
      if (isCrypto || isDollarItem) {
        const usdFormatted = parseFloat(symbolItem.price || 0).toLocaleString('en-US', { maximumFractionDigits: 6 });
        extraInfo = `نرخ دلاری: $${usdFormatted} • معادل هر واحد: ${singlePriceFormatted} ${unitLabel}`;
      } else {
        extraInfo = `نرخ هر واحد: ${singlePriceFormatted} ${unitLabel}`;
      }

      if (symbolItem.bubble && symbolItem.bubble > 0) {
        const bubblePer = parseFloat(symbolItem.bubble_per || 0).toLocaleString('fa-IR');
        extraInfo += ` | حباب: ${Math.round(symbolItem.bubble).toLocaleString('fa-IR')} (${bubblePer}%)`;
      }
      detailsDisplay.textContent = extraInfo;
    }

    this.recalculateGold();
  }

  recalculateGold() {
    const weightInput = document.getElementById('gold-weight-input');
    const goldResult = document.getElementById('gold-result-display');
    if (!weightInput || !goldResult) return;

    const grams = parseFloat(weightInput.value) || 0;
    const goldItem = this.symbolsData['18ayar'];
    if (!goldItem) return;

    let pricePerGram = goldItem.price || goldItem.sell || goldItem.buy || 0;
    if (this.currencyMode === 'rial') {
      pricePerGram = pricePerGram * 10;
    }

    const total = grams * pricePerGram;
    const unit = this.currencyMode === 'rial' ? 'ریال' : 'تومان';
    goldResult.textContent = `${Math.round(total).toLocaleString('fa-IR')} ${unit}`;
  }
}

window.currencyCalculator = new CurrencyCalculator();
