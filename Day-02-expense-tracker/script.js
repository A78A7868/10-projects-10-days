// TrackFi Expense Tracker - Client Logic

// Initial Default State & Presets
const DEFAULT_TRANSACTIONS = [
  { id: '1', merchant: 'Salary Direct Deposit', amount: 3500.00, type: 'income', category: 'Income', date: '2026-07-01', notes: 'Monthly Paycheck' },
  { id: '2', merchant: 'Oishi Sushi Bar', amount: 48.50, type: 'expense', category: 'Dining', date: '2026-07-18', notes: 'Auto Tagged' },
  { id: '3', merchant: 'Whole Foods Market', amount: 84.20, type: 'expense', category: 'Groceries', date: '2026-07-19', notes: 'Scanned via Receipt Reader' },
  { id: '4', merchant: 'Uber Ride', amount: 24.50, type: 'expense', category: 'Transport', date: '2026-07-20', notes: 'Airport Transit' },
  { id: '5', merchant: 'Apple Store', amount: 129.00, type: 'expense', category: 'Electronics', date: '2026-07-20', notes: 'MagSafe Charger' }
];

const CATEGORY_CONFIG = {
  'Dining': { color: '#f87171', icon: '🍣', budget: 300 },
  'Groceries': { color: '#fbbf24', icon: '🥦', budget: 400 },
  'Transport': { color: '#38bdf8', icon: '🚕', budget: 200 },
  'Electronics': { color: '#a855f7', icon: '💻', budget: 300 },
  'Utilities': { color: '#34d399', icon: '⚡', budget: 250 },
  'Income': { color: '#c0ef28', icon: '💰', budget: 0 },
  'Other': { color: '#94a3b8', icon: '🏷️', budget: 200 }
};

let state = {
  transactions: JSON.parse(localStorage.getItem('trackfi-transactions')) || DEFAULT_TRANSACTIONS,
  searchQuery: '',
  categoryFilter: 'all',
  typeFilter: 'all'
};

// DOM References
const totalBalanceEl = document.getElementById('total-balance');
const totalIncomeEl = document.getElementById('total-income');
const totalExpensesEl = document.getElementById('total-expenses');
const savingsPercentEl = document.getElementById('savings-percent');
const savingsProgressFill = document.getElementById('savings-progress-fill');

const donutChartSvg = document.getElementById('donut-chart-svg');
const chartTotalSpend = document.getElementById('chart-total-spend');
const chartLegend = document.getElementById('chart-legend');
const budgetMetersList = document.getElementById('budget-meters-list');

const tableBody = document.getElementById('transaction-table-body');
const countBadge = document.getElementById('transaction-count-badge');

const searchInput = document.getElementById('transaction-search');
const categoryFilterSelect = document.getElementById('category-filter');
const typeFilterSelect = document.getElementById('type-filter');

const addModal = document.getElementById('transaction-modal');
const receiptModal = document.getElementById('receipt-modal');
const addForm = document.getElementById('add-transaction-form');

// Helper Functions
function saveState() {
  localStorage.setItem('trackfi-transactions', JSON.stringify(state.transactions));
  renderDashboard();
}

function formatCurrency(num) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(num);
}

function getCategoryConfig(category) {
  return CATEGORY_CONFIG[category] || CATEGORY_CONFIG['Other'];
}

// Render Core Dashboard Suite
function renderDashboard() {
  let incomeTotal = 0;
  let expenseTotal = 0;
  const categoryTotals = {};

  state.transactions.forEach(t => {
    const amt = parseFloat(t.amount);
    if (t.type === 'income') {
      incomeTotal += amt;
    } else {
      expenseTotal += amt;
      categoryTotals[t.category] = (categoryTotals[t.category] || 0) + amt;
    }
  });

  const netBalance = incomeTotal - expenseTotal;
  const savingsRate = incomeTotal > 0 ? Math.max(0, Math.min(100, Math.round(((incomeTotal - expenseTotal) / incomeTotal) * 100))) : 0;

  if (totalBalanceEl) totalBalanceEl.textContent = formatCurrency(netBalance);
  if (totalIncomeEl) totalIncomeEl.textContent = formatCurrency(incomeTotal);
  if (totalExpensesEl) totalExpensesEl.textContent = formatCurrency(expenseTotal);
  if (savingsPercentEl) savingsPercentEl.textContent = `${savingsRate}%`;
  if (savingsProgressFill) savingsProgressFill.style.width = `${savingsRate}%`;

  renderDonutChart(expenseTotal, categoryTotals);
  renderBudgetMeters(categoryTotals);
  renderTransactionFeed();
}

// Render Donut Chart SVG
function renderDonutChart(totalSpend, categoryTotals) {
  if (!donutChartSvg || !chartLegend) return;
  
  if (chartTotalSpend) chartTotalSpend.textContent = formatCurrency(totalSpend);

  donutChartSvg.innerHTML = '';
  chartLegend.innerHTML = '';

  if (totalSpend === 0) {
    donutChartSvg.innerHTML = `<circle cx="100" cy="100" r="70" stroke="rgba(255,255,255,0.08)" stroke-width="22" fill="none" />`;
    chartLegend.innerHTML = `<span style="font-size:12px; color:var(--text-muted); text-align:center;">No expense data available</span>`;
    return;
  }

  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  let cumulativePercent = 0;

  Object.entries(categoryTotals).forEach(([cat, amt]) => {
    const percent = amt / totalSpend;
    const strokeDasharray = `${percent * circumference} ${circumference}`;
    const strokeDashoffset = -cumulativePercent * circumference;
    const config = getCategoryConfig(cat);

    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', '100');
    circle.setAttribute('cy', '100');
    circle.setAttribute('r', radius.toString());
    circle.setAttribute('stroke', config.color);
    circle.setAttribute('stroke-width', '22');
    circle.setAttribute('stroke-dasharray', strokeDasharray);
    circle.setAttribute('stroke-dashoffset', strokeDashoffset.toString());
    circle.setAttribute('fill', 'none');
    circle.setAttribute('style', 'transition: stroke-dasharray 0.4s ease, stroke-dashoffset 0.4s ease;');

    donutChartSvg.appendChild(circle);

    const legendItem = document.createElement('div');
    legendItem.className = 'legend-item';
    legendItem.innerHTML = `
      <div class="legend-dot-name">
        <span class="legend-dot" style="background: ${config.color};"></span>
        <span>${config.icon} ${cat}</span>
      </div>
      <span class="legend-val">${formatCurrency(amt)}</span>
    `;
    chartLegend.appendChild(legendItem);

    cumulativePercent += percent;
  });
}

// Render Category Budget Progress Meters
function renderBudgetMeters(categoryTotals) {
  if (!budgetMetersList) return;
  budgetMetersList.innerHTML = '';

  Object.entries(CATEGORY_CONFIG).forEach(([cat, config]) => {
    if (cat === 'Income') return;
    const spent = categoryTotals[cat] || 0;
    const budget = config.budget;
    const percent = Math.min(100, Math.round((spent / budget) * 100));

    const item = document.createElement('div');
    item.className = 'budget-meter-item';
    item.innerHTML = `
      <div class="meter-header">
        <span>${config.icon} ${cat}</span>
        <span>${formatCurrency(spent)} / ${formatCurrency(budget)} (${percent}%)</span>
      </div>
      <div class="meter-track">
        <div class="meter-fill" style="width: ${percent}%; background: ${percent > 90 ? 'var(--accent-red)' : config.color};"></div>
      </div>
    `;
    budgetMetersList.appendChild(item);
  });
}

// Filter & Render Transaction Feed Table
function renderTransactionFeed() {
  if (!tableBody) return;

  const filtered = state.transactions.filter(t => {
    const query = state.searchQuery.toLowerCase();
    const matchesSearch = t.merchant.toLowerCase().includes(query) ||
                          t.notes.toLowerCase().includes(query) ||
                          t.category.toLowerCase().includes(query);

    const matchesCategory = state.categoryFilter === 'all' || t.category === state.categoryFilter;
    const matchesType = state.typeFilter === 'all' || t.type === state.typeFilter;

    return matchesSearch && matchesCategory && matchesType;
  });

  if (countBadge) countBadge.textContent = `${filtered.length} Items`;

  tableBody.innerHTML = '';

  if (filtered.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="5" style="text-align: center; padding: 24px; color: var(--text-muted);">
          No matching transactions found. Try adding a new entry or adjusting filters.
        </td>
      </tr>
    `;
    return;
  }

  filtered.forEach(t => {
    const config = getCategoryConfig(t.category);
    const tr = document.createElement('tr');

    tr.innerHTML = `
      <td>
        <div class="merchant-cell">
          <div class="merchant-icon">${config.icon}</div>
          <div>
            <span class="merchant-name">${escapeHtml(t.merchant)}</span>
            <span class="merchant-note">${escapeHtml(t.notes || 'TrackFi Entry')}</span>
          </div>
        </div>
      </td>
      <td>
        <span class="cat-badge" style="border-left: 3px solid ${config.color};">${t.category}</span>
      </td>
      <td>${t.date}</td>
      <td class="text-right ${t.type === 'income' ? 'amount-income' : 'amount-expense'}">
        ${t.type === 'income' ? '+' : '-'}${formatCurrency(t.amount)}
      </td>
      <td class="text-center">
        <button class="delete-btn" data-id="${t.id}" title="Delete Transaction">&times;</button>
      </td>
    `;

    tableBody.appendChild(tr);
  });

  // Bind Delete Buttons
  tableBody.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.target.getAttribute('data-id');
      state.transactions = state.transactions.filter(t => t.id !== id);
      saveState();
    });
  });
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// Receipt Scanner Simulation
function simulateAIReceiptScan(merchant, amount, category, notes) {
  if (!receiptModal) return;

  const paperMerchant = document.getElementById('paper-merchant');
  const paperTotal = document.getElementById('paper-total');
  const statusText = document.getElementById('scan-status-text');

  if (paperMerchant) paperMerchant.textContent = merchant;
  if (paperTotal) paperTotal.textContent = formatCurrency(amount);
  if (statusText) statusText.textContent = 'TrackFi OCR extracting receipt parameters...';

  receiptModal.classList.remove('hidden');

  setTimeout(() => {
    if (statusText) statusText.textContent = 'Categorizing transaction details...';
  }, 700);

  setTimeout(() => {
    const newTrans = {
      id: Date.now().toString(),
      merchant: merchant,
      amount: amount,
      type: 'expense',
      category: category,
      date: new Date().toISOString().split('T')[0],
      notes: notes || 'Scanned via Receipt Reader'
    };

    state.transactions.unshift(newTrans);
    saveState();

    receiptModal.classList.add('hidden');

    const dashSec = document.getElementById('dashboard');
    if (dashSec) dashSec.scrollIntoView({ behavior: 'smooth' });
  }, 1600);
}

// Voice Input Prompt Parser
function processVoicePrompt(text) {
  if (!text.trim()) return;

  const amountMatch = text.match(/\$?([0-9]+(\.[0-9]{1,2})?)/);
  const amount = amountMatch ? parseFloat(amountMatch[1]) : 25.00;

  let category = 'Other';
  const lower = text.toLowerCase();

  if (lower.includes('coffee') || lower.includes('sushi') || lower.includes('dinner') || lower.includes('bistro') || lower.includes('food') || lower.includes('lunch')) {
    category = 'Dining';
  } else if (lower.includes('grocery') || lower.includes('foods') || lower.includes('trader')) {
    category = 'Groceries';
  } else if (lower.includes('uber') || lower.includes('gas') || lower.includes('shell') || lower.includes('transit')) {
    category = 'Transport';
  } else if (lower.includes('apple') || lower.includes('tech') || lower.includes('gadget')) {
    category = 'Electronics';
  }

  const newTrans = {
    id: Date.now().toString(),
    merchant: text.substring(0, 30),
    amount: amount,
    type: 'expense',
    category: category,
    date: new Date().toISOString().split('T')[0],
    notes: 'Voice Entry'
  };

  state.transactions.unshift(newTrans);
  saveState();

  const dashSec = document.getElementById('dashboard');
  if (dashSec) dashSec.scrollIntoView({ behavior: 'smooth' });
}

// CSV Export Utility
function exportCSV() {
  if (state.transactions.length === 0) {
    alert('No transactions available to export.');
    return;
  }

  let csvContent = 'data:text/csv;charset=utf-8,ID,Merchant,Amount,Type,Category,Date,Notes\n';

  state.transactions.forEach(t => {
    const row = [
      t.id,
      `"${t.merchant.replace(/"/g, '""')}"`,
      t.amount,
      t.type,
      t.category,
      t.date,
      `"${(t.notes || '').replace(/"/g, '""')}"`
    ].join(',');
    csvContent += row + '\n';
  });

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `trackfi-transactions-${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Event Listeners Setup
document.addEventListener('DOMContentLoaded', () => {
  const transDateInput = document.getElementById('trans-date');
  if (transDateInput) transDateInput.value = new Date().toISOString().split('T')[0];

  renderDashboard();

  // Search & Filters
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      state.searchQuery = e.target.value;
      renderTransactionFeed();
    });
  }

  if (categoryFilterSelect) {
    categoryFilterSelect.addEventListener('change', (e) => {
      state.categoryFilter = e.target.value;
      renderTransactionFeed();
    });
  }

  if (typeFilterSelect) {
    typeFilterSelect.addEventListener('change', (e) => {
      state.typeFilter = e.target.value;
      renderTransactionFeed();
    });
  }

  // Capability Tabs Switcher
  const tabBtns = document.querySelectorAll('.ai-tab-btn');
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const targetTab = btn.getAttribute('data-tab');
      document.querySelectorAll('.ai-tab-panel').forEach(panel => {
        if (panel.id === `panel-${targetTab}`) {
          panel.classList.add('active');
        } else {
          panel.classList.remove('active');
        }
      });
    });
  });

  // Sample Receipt Buttons & Presets
  const chipCoffee = document.getElementById('chip-sample-coffee');
  const chipGroceries = document.getElementById('chip-sample-groceries');
  const chipUber = document.getElementById('chip-sample-uber');
  const dropzone = document.getElementById('ocr-dropzone');
  const heroScanBtn = document.getElementById('hero-scan-btn');
  const openReceiptModalBtn = document.getElementById('open-receipt-scan-modal');

  if (chipCoffee) {
    chipCoffee.addEventListener('click', () => simulateAIReceiptScan('Starcups Coffee', 4.95, 'Dining', 'Scanned Receipt'));
  }
  if (chipGroceries) {
    chipGroceries.addEventListener('click', () => simulateAIReceiptScan('Whole Foods Market', 84.20, 'Groceries', 'Scanned Receipt'));
  }
  if (chipUber) {
    chipUber.addEventListener('click', () => simulateAIReceiptScan('Uber Transit', 24.50, 'Transport', 'Scanned Receipt'));
  }
  if (dropzone) {
    dropzone.addEventListener('click', () => simulateAIReceiptScan('Bistro Lumiere', 62.80, 'Dining', 'Dropzone Scan'));
  }
  if (heroScanBtn) {
    heroScanBtn.addEventListener('click', () => simulateAIReceiptScan('Target Store', 38.90, 'Electronics', 'Quick Scan'));
  }
  if (openReceiptModalBtn) {
    openReceiptModalBtn.addEventListener('click', () => simulateAIReceiptScan('Blue Bottle Coffee', 6.50, 'Dining', 'Receipt Reader Scan'));
  }

  // Voice Prompt Submit
  const voiceSubmitBtn = document.getElementById('voice-submit-btn');
  const voiceInputSim = document.getElementById('voice-input-sim');
  if (voiceSubmitBtn && voiceInputSim) {
    voiceSubmitBtn.addEventListener('click', () => {
      processVoicePrompt(voiceInputSim.value);
    });
  }

  // Add Transaction Modal Controls
  const openAddBtn = document.getElementById('open-add-modal-btn');
  const closeAddBtn = document.getElementById('close-add-modal');
  const cancelAddBtn = document.getElementById('cancel-add-modal');

  if (openAddBtn && addModal) {
    openAddBtn.addEventListener('click', () => addModal.classList.remove('hidden'));
  }
  if (closeAddBtn && addModal) {
    closeAddBtn.addEventListener('click', () => addModal.classList.add('hidden'));
  }
  if (cancelAddBtn && addModal) {
    cancelAddBtn.addEventListener('click', () => addModal.classList.add('hidden'));
  }

  const closeReceiptBtn = document.getElementById('close-receipt-modal');
  if (closeReceiptBtn && receiptModal) {
    closeReceiptBtn.addEventListener('click', () => receiptModal.classList.add('hidden'));
  }

  // Close modals when clicking background overlay
  [addModal, receiptModal].forEach(modal => {
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          modal.classList.add('hidden');
        }
      });
    }
  });

  // Form Submission
  if (addForm) {
    addForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const merchant = document.getElementById('trans-merchant').value.trim();
      const amount = parseFloat(document.getElementById('trans-amount').value);
      const type = document.getElementById('trans-type').value;
      const category = document.getElementById('trans-category').value;
      const date = document.getElementById('trans-date').value;
      const notes = document.getElementById('trans-notes').value.trim();

      const newTrans = {
        id: Date.now().toString(),
        merchant,
        amount,
        type,
        category,
        date,
        notes: notes || 'Manual Entry'
      };

      state.transactions.unshift(newTrans);
      saveState();

      addForm.reset();
      if (transDateInput) transDateInput.value = new Date().toISOString().split('T')[0];
      if (addModal) addModal.classList.add('hidden');
    });
  }

  // Export CSV
  const exportBtn = document.getElementById('export-csv-btn');
  if (exportBtn) {
    exportBtn.addEventListener('click', exportCSV);
  }
});
