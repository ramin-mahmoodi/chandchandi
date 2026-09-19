/**
 * Neobrutalism Quick Converter & Gold Calculator
 * Follows neobrutalui.live select component behavior
 */

class CurrencyCalculator {
  constructor() {
    this.symbolsData = {};
    this.currencyMode = 'toman'; // 'toman' or 'rial'
    this.selectedSymbol = 'usd';
    this.hasInitializedSelect = false;
  }

  setSymbolsData(data) {
    this.symbolsData = data || {};
    this.initCustomSelect();
    const isCurrentlyOpen = this.isDropdownOpen();
    this.populateSelectOptions(!isCurrentlyOpen);
    this.recalculate();
  }

  setCurrencyMode(mode) {
    this.currencyMode = mode;
    this.recalculate();
  }

  isDropdownOpen() {
    const dropdown = document.getElementById('calc-select-dropdown');
    if (!dropdown) return false;
    return !dropdown.classList.contains('hidden') && dropdown.style.display !== 'none';
  }

  initCustomSelect() {
    if (this.hasInitializedSelect) return;
    this.hasInitializedSelect = true;

    this.initSteppers();

    const trigger = document.getElementById('calc-select-trigger');
    const searchInput = document.getElementById('calc-select-search');
    const container = document.getElementById('calc-select-container');

    // Handle clicks on trigger button
    if (trigger) {
      trigger.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.toggleDropdown();
      });
    }

    // Handle clicks outside container
    document.addEventListener('click', (e) => {
      if (container && !container.contains(e.target)) {
        this.closeDropdown();
      }
    });

    // Handle Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') this.closeDropdown();
    });

    // Search filter input
    if (searchInput) {
      searchInput.addEventListener('click', (e) => e.stopPropagation());
      searchInput.addEventListener('input', (e) => {
        const query = e.target.value.trim().toLowerCase();
        const items = document.querySelectorAll('.calc-select-item');
        items.forEach(item => {
          const text = (item.getAttribute('data-search') || '').toLowerCase();
          if (!query || text.includes(query)) {
            item.classList.remove('hidden');
            item.style.display = 'flex';
          } else {
            item.classList.add('hidden');
            item.style.display = 'none';
          }
        });
      });
    }
  }

  toggleDropdown() {
    if (this.isDropdownOpen()) {
      this.closeDropdown();
    } else {
      this.openDropdown();
    }
  }

  openDropdown() {
    const dropdown = document.getElementById('calc-select-dropdown');
    const trigger = document.getElementById('calc-select-trigger');
    const chevron = document.getElementById('calc-select-chevron');
    const searchInput = document.getElementById('calc-select-search');
    if (!dropdown) return;

    dropdown.classList.remove('hidden');
    dropdown.style.display = 'block';
    if (trigger) trigger.setAttribute('aria-expanded', 'true');
    if (chevron) chevron.classList.add('rotate-180');

    if (searchInput) {
      searchInput.value = '';
      const items = document.querySelectorAll('.calc-select-item');
      items.forEach(el => {
        el.classList.remove('hidden');
        el.style.display = 'flex';
      });
      setTimeout(() => searchInput.focus(), 50);
    }
  }

  closeDropdown() {
    const dropdown = document.getElementById('calc-select-dropdown');
    const trigger = document.getElementById('calc-select-trigger');
    const chevron = document.getElementById('calc-select-chevron');
    if (!dropdown) return;

    dropdown.classList.add('hidden');
    dropdown.style.display = 'none';
    if (trigger) trigger.setAttribute('aria-expanded', 'false');
    if (chevron) chevron.classList.remove('rotate-180');
  }

  selectSymbol(key, shouldClose = true) {
    if (!key) return;
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
        icon.src = `assets/icons/${item.type || 'fx'}/${iconSlug}.png`;
        icon.style.display = '';
      }
    }

    // Highlight selected item in list
    const allItems = document.querySelectorAll('.calc-select-item');
    allItems.forEach(el => {
      const isSelected = el.getAttribute('data-value') === key;
      const checkIcon = el.querySelector('.check-icon');
      if (isSelected) {
        el.classList.add('bg-neoMain', 'is-selected');
        el.setAttribute('aria-selected', 'true');
        if (checkIcon) checkIcon.classList.remove('hidden');
      } else {
        el.classList.remove('bg-neoMain', 'is-selected');
        el.setAttribute('aria-selected', 'false');
        if (checkIcon) checkIcon.classList.add('hidden');
      }
    });

    if (shouldClose) {
      this.closeDropdown();
    }
    this.recalculate();
  }

  populateSelectOptions(autoSelectFirst = true) {
    const select = document.getElementById('calc-symbol-select');
    const list = document.getElementById('calc-select-list');
    if (!select || !list) return;

    const currentVal = this.selectedSymbol || select.value || 'usd';
    select.innerHTML = '';
    list.innerHTML = '';

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
      const itemDiv = document.createElement('div');
      itemDiv.className = `calc-select-item neo-select-item ${isSelected ? 'bg-neoMain is-selected' : ''}`;
      itemDiv.setAttribute('data-value', k);
      itemDiv.setAttribute('data-search', `${item.fa_name || ''} ${item.slug || ''} ${k} ${displayName}`);
      itemDiv.setAttribute('role', 'option');
      itemDiv.setAttribute('aria-selected', isSelected ? 'true' : 'false');

      itemDiv.innerHTML = `
        <div class="flex items-center gap-2 truncate pointer-events-none">
          <img src="assets/icons/${item.type || 'fx'}/${iconSlug}.png" class="w-5 h-5 rounded-full border border-black shrink-0 object-contain bg-white" alt="" onerror="this.style.display='none'">
          <span class="truncate font-bold text-xs sm:text-sm">${displayName}</span>
        </div>
        <svg class="check-icon h-4 w-4 shrink-0 text-black stroke-[3] pointer-events-none ${isSelected ? '' : 'hidden'}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
      `;

      itemDiv.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.selectSymbol(k, true);
      });

      list.appendChild(itemDiv);
    });

    const activeKey = this.symbolsData[currentVal] ? currentVal : (this.symbolsData['usd'] ? 'usd' : keys[0]);
    if (activeKey) {
      this.selectSymbol(activeKey, false);
    }
  }

  recalculate() {
    const amountInput = document.getElementById('calc-amount-input');
    const resultDisplay = document.getElementById('calc-result-display');
    const detailsDisplay = document.getElementById('calc-details-display');

    if (!amountInput || !resultDisplay) return;

    const amount = parseFloat(amountInput.value) || 0;
    const selectedKey = this.selectedSymbol || document.getElementById('calc-symbol-select')?.value || 'usd';
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

  initSteppers() {
    const bindStepper = (inputId, upBtnId, downBtnId, step, min = 0) => {
      const input = document.getElementById(inputId);
      const upBtn = document.getElementById(upBtnId);
      const downBtn = document.getElementById(downBtnId);
      if (!input || !upBtn || !downBtn) return;

      const stepValue = (delta) => {
        let val = parseFloat(input.value) || 0;
        let next = Math.max(min, Math.round((val + delta) * 100) / 100);
        input.value = next;
        input.dispatchEvent(new Event('input', { bubbles: true }));
      };

      upBtn.onclick = (e) => {
        e.preventDefault();
        stepValue(step);
      };

      downBtn.onclick = (e) => {
        e.preventDefault();
        stepValue(-step);
      };
    };

    bindStepper('gold-weight-input', 'gold-weight-up', 'gold-weight-down', 0.5, 0);
    bindStepper('calc-amount-input', 'calc-amount-up', 'calc-amount-down', 1, 0);
  }
}

window.currencyCalculator = new CurrencyCalculator();

// Safety fallback for early DOM readiness
document.addEventListener('DOMContentLoaded', () => {
  if (window.currencyCalculator) {
    window.currencyCalculator.initCustomSelect();
    window.currencyCalculator.initSteppers();
  }
});
