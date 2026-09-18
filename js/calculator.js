/**
 * Neobrutalism Quick Converter & Gold Calculator
 */

class CurrencyCalculator {
  constructor() {
    this.symbolsData = {};
    this.currencyMode = 'toman'; // 'toman' or 'rial'
  }

  setSymbolsData(data) {
    this.symbolsData = data || {};
    this.populateSelectOptions();
    this.recalculate();
  }

  setCurrencyMode(mode) {
    this.currencyMode = mode;
    this.recalculate();
  }

  populateSelectOptions() {
    const select = document.getElementById('calc-symbol-select');
    if (!select) return;

    const currentVal = select.value;
    select.innerHTML = '';

    const prioritySlugs = ['usd', 'eur', 'aed', 'try', 'gbp', '18ayar', 'sekkeh', 'bahar', 'nim', 'rob', 'btc', 'eth', 'usdt', 'sol', 'ton'];
    const keys = Object.keys(this.symbolsData);

    // Sort with priority slugs first
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
      const opt = document.createElement('option');
      opt.value = k;
      opt.textContent = ${item.fa_name || item.slug} ();
      select.appendChild(opt);
    });

    if (currentVal && this.symbolsData[currentVal]) {
      select.value = currentVal;
    } else if (this.symbolsData['usd']) {
      select.value = 'usd';
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

    // Get price in Toman
    let priceInToman = 0;
    if (symbolItem.type === 'crypto') {
      priceInToman = symbolItem.toman || 0;
    } else {
      priceInToman = symbolItem.price || symbolItem.sell || 0;
    }

    if (this.currencyMode === 'rial') {
      priceInToman = priceInToman * 10;
    }

    const totalValue = amount * priceInToman;
    const unitLabel = this.currencyMode === 'rial' ? 'ریال' : 'تومان';

    resultDisplay.textContent = ${totalValue.toLocaleString('fa-IR')} ;

    if (detailsDisplay) {
      const singlePriceFormatted = priceInToman.toLocaleString('fa-IR');
      let extraInfo = نرخ هر واحد:  ;
      if (symbolItem.bubble && symbolItem.bubble > 0) {
        extraInfo +=  | حباب:   (%);
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

    let pricePerGram = goldItem.price || goldItem.sell || 0;
    if (this.currencyMode === 'rial') {
      pricePerGram = pricePerGram * 10;
    }

    const total = grams * pricePerGram;
    const unit = this.currencyMode === 'rial' ? 'ریال' : 'تومان';
    goldResult.textContent = ${Math.round(total).toLocaleString('fa-IR')} ;
  }
}

window.currencyCalculator = new CurrencyCalculator();
