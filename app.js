let state = {
  members: [], matches: [], fundPayments: [],
  quarterlyContributions: [], expenses: [],
  currentTab: 'tabDashboard',
  selectedMonth: 'all',
  pendingWrites: 0,
  initialSynced: false,
  memberStatsCache: {}
};

const DEFAULT_API_URL = '';
const API_BASE = (window.location.protocol === 'file:' || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') ? 'http://localhost:3000' : '';

function safeParse(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return parsed == null ? fallback : parsed;
  } catch (e) {
    console.warn('Corrupt localStorage key', key, '— resetting');
    localStorage.removeItem(key);
    return fallback;
  }
}

function init() {
  state.apiUrl = localStorage.getItem('fc_api_url') || DEFAULT_API_URL;
  try {
    if (typeof DATA_VERSION !== 'undefined' && localStorage.getItem('fc_data_version') !== DATA_VERSION) {
      ['fc_members', 'fc_matches', 'fc_fund', 'fc_quarterly_contributions', 'fc_expenses'].forEach(k => localStorage.removeItem(k));
      localStorage.setItem('fc_data_version', DATA_VERSION);
    }
  } catch (e) { /* localStorage blocked */ }
  state.members = safeParse('fc_members', null) || [...INITIAL_MEMBERS];
  state.matches = safeParse('fc_matches', null) || [...INITIAL_MATCHES];
  state.fundPayments = safeParse('fc_fund', null) || [...INITIAL_FUND_PAYMENTS];
  state.quarterlyContributions = safeParse('fc_quarterly_contributions', null) || [...INITIAL_QUARTERLY_CONTRIBUTIONS];
  state.expenses = safeParse('fc_expenses', null) || [...INITIAL_EXPENSES];
  
  updateSyncStatus();
  renderAll();
  
  if (state.apiUrl) {
    syncFromSheet();
  }
}

function updateStatsCache() {
  const cache = {};
  state.members.forEach(m => {
    cache[normName(m.name)] = {
      name: m.name,
      status: m.status,
      played: 0,
      wins: 0,
      draws: 0,
      losses: 0,
      winRate: 0,
      lossRate: 0,
      fineCount: 0,
      fineAmount: 0,
      formHistory: []
    };
  });

  const sortedMatches = [...state.matches].sort((a, b) => a.date.localeCompare(b.date));
  
  sortedMatches.forEach(m => {
    const res = classifyResult(m.result);
    if (res === 'cancelled') return;
    
    const playedTeam = m.playedTeam || [];
    const losingTeam = m.losingTeam || [];
    
    playedTeam.forEach(name => {
      const k = normName(name);
      if (!cache[k]) {
        cache[k] = {
          name, status: 'paused', played: 0, wins: 0, draws: 0, losses: 0,
          winRate: 0, lossRate: 0, fineCount: 0, fineAmount: 0, formHistory: []
        };
      }
      
      const p = cache[k];
      p.played++;
      
      if (res === 'draw') {
        p.draws++;
        p.formHistory.push('D');
      } else {
        const isLose = losingTeam.some(l => normName(l) === k);
        if (isLose) {
          p.losses++;
          p.formHistory.push('L');
        } else {
          p.wins++;
          p.formHistory.push('W');
        }
      }
    });
  });

  state.fundPayments.forEach(pay => {
    const k = normName(pay.member);
    if (!cache[k]) {
      cache[k] = {
        name: pay.member, status: 'paused', played: 0, wins: 0, draws: 0, losses: 0,
        winRate: 0, lossRate: 0, fineCount: 0, fineAmount: 0, formHistory: []
      };
    }
    const p = cache[k];
    p.fineCount++;
    p.fineAmount += Number(pay.amount) || 0;
  });

  Object.values(cache).forEach(p => {
    p.winRate = p.played ? p.wins / p.played : 0;
    p.lossRate = p.played ? p.losses / p.played : 0;
  });

  state.memberStatsCache = cache;
}

let _saveWarnShown = false;
function save() {
  try {
    localStorage.setItem('fc_members', JSON.stringify(state.members));
    localStorage.setItem('fc_matches', JSON.stringify(state.matches));
    localStorage.setItem('fc_fund', JSON.stringify(state.fundPayments));
    localStorage.setItem('fc_quarterly_contributions', JSON.stringify(state.quarterlyContributions));
    localStorage.setItem('fc_expenses', JSON.stringify(state.expenses));
  } catch (e) {
    console.error('localStorage save failed:', e.name, e.message);
    if (!_saveWarnShown) {
      _saveWarnShown = true;
      showToast('Trình duyệt chặn lưu cục bộ — dữ liệu sẽ mất khi reload', 'error');
    }
  }
}

function fmt(n) {
  const v = Number(n) || 0;
  if (Math.abs(v) >= 1e6) return (v / 1e6).toFixed(1).replace('.0', '') + 'M';
  if (Math.abs(v) >= 1e3) return (v / 1e3).toFixed(0) + 'K';
  return v.toString();
}

function parseDateSafe(d) {
  if (!d) return null;
  if (d instanceof Date) return isNaN(d.getTime()) ? null : d;
  const s = String(d).trim().replace(' ', 'T');
  const dt = new Date(s);
  return isNaN(dt.getTime()) ? null : dt;
}

function fmtDate(d) {
  const dt = parseDateSafe(d);
  if (!dt) return String(d || '—');
  return dt.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function getMonthKey(d) { return (d || '').toString().substring(0, 7); }

const normName = (s) => String(s || '').trim().toLocaleLowerCase('vi-VN');

function safeInitial(name) {
  const s = String(name || '').trim();
  if (!s) return '?';
  const parts = s.split(/\s+/);
  const last = parts[parts.length - 1] || '';
  return (last[0] || s[0] || '?').toUpperCase();
}

function classifyResult(r) {
  const l = String(r || '').toLowerCase().trim();
  if (l.includes('thua')) return 'lose';
  if (l.includes('hòa') || l.includes('hoà')) return 'draw';
  if (l.includes('hoãn') || l.includes('hủy') || l.includes('huỷ')) return 'cancelled';
  return 'win'; // Thắng/Vắng
}

function resultLabel(r) {
  const c = classifyResult(r);
  return c === 'lose' ? 'L' : c === 'draw' ? 'D' : c === 'cancelled' ? 'C' : 'W';
}

function selectResult(res, el, prefix = '') {
  const inputId = prefix ? prefix + 'MatchResult' : 'matchResult';
  const groupId = prefix ? prefix + 'LosingTeamGroup' : 'losingTeamGroup';
  document.getElementById(inputId).value = res;
  if (el) {
    const sel = el.closest('.result-selector');
    if (sel) sel.querySelectorAll('.result-option').forEach(n => n.classList.remove('active'));
    el.classList.add('active');
  }
  const group = document.getElementById(groupId);
  if (res === 'Thua') {
    group.style.display = 'block';
  } else {
    group.style.display = 'none';
  }
}

function switchTab(el) {
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
  el.classList.add('active');
  const tabId = el.dataset.tab;
  document.getElementById(tabId).classList.add('active');
  state.currentTab = tabId;
}

function goToTab(tabId) {
  const el = document.querySelector(`.nav-item[data-tab="${tabId}"]`);
  if (el) switchTab(el);
}

function showToast(msg, type = 'success') {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = 'toast ' + type + ' show';
  setTimeout(() => t.classList.remove('show'), 2500);
}

function openModal(id) { document.getElementById(id).classList.add('active'); }
function closeModal(id) { document.getElementById(id).classList.remove('active'); }

function handleFabClick() {
  const tab = state.currentTab;
  if (tab === 'tabMatches' || tab === 'tabDashboard') {
    document.getElementById('matchDate').value = new Date().toISOString().split('T')[0];
    document.getElementById('matchNote').value = '';
    document.getElementById('matchVenue').value = '';
    selectResult('Thua', document.querySelector('#modalMatch .result-option.lose'));
    populateLosingTeamCheckboxes('matchLosingTeamCheckboxes');
    openModal('modalMatch');
  } else if (tab === 'tabFund') {
    if (state.currentSubTab === 'subtabSummary') {
      populateExpenseModal();
      openModal('modalExpense');
    } else {
      populateFundModal();
      openModal('modalFund');
    }
  } else if (tab === 'tabMembers') {
    document.getElementById('memberName').value = '';
    openModal('modalMember');
  }
}

function showSetup() {
  document.getElementById('apiUrl').value = state.apiUrl || '';
  openModal('modalSetup');
}

function populateLosingTeamCheckboxes(containerId, checkedList = []) {
  const container = document.getElementById(containerId);
  const activeMembers = state.members.filter(m => m.status === 'active');
  
  // Sort alphabetically
  const sorted = [...activeMembers].sort((a, b) => a.name.localeCompare(b.name, 'vi'));
  
  container.innerHTML = sorted.map(m => {
    const isChecked = checkedList.includes(m.name);
    return `<label style="display: flex; align-items: center; gap: 8px; font-size: 0.85rem; cursor: pointer; color: var(--text);">
      <input type="checkbox" value="${m.name}" ${isChecked ? 'checked' : ''} style="width: 16px; height: 16px; accent-color: var(--accent);">
      ${m.name}
    </label>`;
  }).join('');
}

function exportBackup() {
  const data = {
    exportedAt: new Date().toISOString(),
    note: 'Bựa FC Manager localStorage snapshot',
    members: state.members,
    matches: state.matches,
    fundPayments: state.fundPayments,
    quarterlyContributions: state.quarterlyContributions,
    expenses: state.expenses,
    counts: {
      members: (state.members || []).length,
      matches: (state.matches || []).length,
      fundPayments: (state.fundPayments || []).length,
      quarterlyContributions: (state.quarterlyContributions || []).length,
      expenses: (state.expenses || []).length,
    },
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `buafc-backup-${new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  showToast(`Đã tải backup: ${data.counts.members}m / ${data.counts.matches}t / ${data.counts.fundPayments}q / ${data.counts.quarterlyContributions}đ / ${data.counts.expenses}c`, 'success');
}
if (typeof window !== 'undefined') {
  window.exportBackup = exportBackup;
}

function toCSV(rows, columns) {
  if (!rows || rows.length === 0) return '﻿' + columns.join(',') + '\n';
  const esc = (v) => {
    const s = v == null ? '' : String(v);
    if (s.includes(',') || s.includes('"') || s.includes('\n') || s.includes('\r')) {
      return '"' + s.replace(/"/g, '""') + '"';
    }
    return s;
  };
  const head = columns.join(',');
  const body = rows.map(r => columns.map(c => esc(r[c])).join(',')).join('\n');
  return '﻿' + head + '\n' + body + '\n';
}

function downloadFile(filename, content, mime) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function exportCSV() {
  const ts = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const files = [
    { name: `buafc-members-${ts}.csv`, rows: state.members || [], cols: ['name', 'status'] },
    { name: `buafc-matches-${ts}.csv`, rows: state.matches || [], cols: ['date', 'opponent', 'result', 'note'] },
    { name: `buafc-fund-${ts}.csv`, rows: state.fundPayments || [], cols: ['timestamp', 'period', 'member', 'amount', 'note'] },
    { name: `buafc-quarterly-${ts}.csv`, rows: state.quarterlyContributions || [], cols: ['member', 'q1_amount', 'q1_date', 'q2_amount', 'q2_date', 'q3_amount', 'q3_date', 'q4_amount', 'q4_date'] },
    { name: `buafc-expenses-${ts}.csv`, rows: state.expenses || [], cols: ['name', 'quarter', 'year', 'amount', 'date', 'status'] }
  ];
  let i = 0;
  const next = () => {
    if (i >= files.length) {
      showToast(`Đã tải ${files.length} file CSV ✓`, 'success');
      return;
    }
    const f = files[i++];
    downloadFile(f.name, toCSV(f.rows, f.cols), 'text/csv;charset=utf-8');
    setTimeout(next, 400);
  };
  next();
}
if (typeof window !== 'undefined') {
  window.exportCSV = exportCSV;
}

function exportXLSX() {
  if (typeof XLSX === 'undefined') {
    showToast('Lib XLSX chưa load, thử lại sau 2s', 'error');
    return;
  }
  const fundRows = (state.fundPayments || []).map(r => ({
    timestamp: r.timestamp || '',
    period: r.period || '',
    member: r.member || '',
    amount: Number(r.amount) || 0,
    note: r.note || '',
  }));
  const memberRows = (state.members || []).map(r => ({
    name: r.name || '',
    status: r.status || '',
  }));
  const matchRows = (state.matches || []).map(r => ({
    date: r.date || '',
    opponent: r.opponent || '',
    result: r.result || '',
    losingTeam: Array.isArray(r.losingTeam) ? r.losingTeam.join(', ') : '',
    note: r.note || '',
  }));
  const quarterlyRows = (state.quarterlyContributions || []).map(r => ({
    member: r.member || '',
    q1_amount: r.q1_amount || 0,
    q1_date: r.q1_date || '',
    q2_amount: r.q2_amount || 0,
    q2_date: r.q2_date || '',
    q3_amount: r.q3_amount || 0,
    q3_date: r.q3_date || '',
    q4_amount: r.q4_amount || 0,
    q4_date: r.q4_date || '',
  }));
  const expenseRows = (state.expenses || []).map(r => ({
    name: r.name || '',
    quarter: Number(r.quarter) || 1,
    year: Number(r.year) || 2026,
    amount: Number(r.amount) || 0,
    date: r.date || '',
    status: r.status || 'normal',
  }));

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(memberRows), 'ThanhVien');
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(matchRows), 'TranDau');
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(fundRows), 'DongPhat');
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(quarterlyRows), 'DongQuy');
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(expenseRows), 'ChiTieu');

  const ts = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  XLSX.writeFile(wb, `buafc-backup-${ts}.xlsx`);
  showToast(`Đã tải XLSX thành công ✓`, 'success');
}
if (typeof window !== 'undefined') {
  window.exportXLSX = exportXLSX;
}

function importBackup() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json,.xlsx';
  input.onchange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      let parsed;
      if (file.name.endsWith('.json')) {
        const text = await file.text();
        parsed = JSON.parse(text);
      } else if (file.name.endsWith('.xlsx')) {
        if (typeof XLSX === 'undefined') {
          showToast('Lib XLSX chưa load, thử lại 2s sau', 'error');
          return;
        }
        const buf = await file.arrayBuffer();
        const wb = XLSX.read(buf);
        const sheetToRows = (name) => {
          const ws = wb.Sheets[name];
          return ws ? XLSX.utils.sheet_to_json(ws) : [];
        };
        parsed = {
          members: sheetToRows('ThanhVien'),
          matches: sheetToRows('TranDau'),
          fundPayments: sheetToRows('DongPhat'),
          quarterlyContributions: sheetToRows('DongQuy'),
          expenses: sheetToRows('ChiTieu'),
        };
      }
      
      const counts = {
        members: (parsed.members || []).length,
        matches: (parsed.matches || []).length,
        fundPayments: (parsed.fundPayments || []).length,
        quarterlyContributions: (parsed.quarterlyContributions || []).length,
        expenses: (parsed.expenses || []).length,
      };
      
      if (!confirm(`Import: ${counts.members}m / ${counts.matches}t / ${counts.fundPayments}q / ${counts.quarterlyContributions}đ / ${counts.expenses}c\n\nĐè lên dữ liệu hiện tại?`)) return;

      if (Array.isArray(parsed.members)) state.members = parsed.members;
      if (Array.isArray(parsed.matches)) {
        state.matches = parsed.matches.map(m => {
          if (typeof m.losingTeam === 'string') {
            m.losingTeam = m.losingTeam ? m.losingTeam.split(',').map(s => s.trim()) : [];
          }
          return m;
        });
      }
      if (Array.isArray(parsed.fundPayments)) state.fundPayments = parsed.fundPayments;
      if (Array.isArray(parsed.quarterlyContributions)) state.quarterlyContributions = parsed.quarterlyContributions;
      if (Array.isArray(parsed.expenses)) state.expenses = parsed.expenses;
      
      state.initialSynced = true;
      save();
      renderAll();
      showToast(`✅ Đã import thành công`, 'success');
    } catch (err) {
      console.error('Import error:', err);
      showToast(`Lỗi import: ${err.message}`, 'error');
    }
  };
  input.click();
}
if (typeof window !== 'undefined') {
  window.importBackup = importBackup;
}

function renderAll() {
  updateStatsCache();
  renderDashboard();
  renderMatches();
  renderFund();
  renderMembers();
  renderLog();
  renderCharts();
}

function renderDashboard() {
  const matches = state.matches;
  const activeMembers = state.members.filter(m => m.status === 'active');

  const totalFines = state.fundPayments.reduce((s, p) => s + (Number(p.amount) || 0), 0);
  const totalContributions = state.quarterlyContributions.reduce((s, c) => {
    const q1 = Number(c.q1_amount) || 0;
    const q2 = Number(c.q2_amount) || 0;
    const q3 = Number(c.q3_amount) || 0;
    const q4 = Number(c.q4_amount) || 0;
    return s + q1 + q2 + q3 + q4;
  }, 0);
  const totalIncome = totalContributions + totalFines;
  const totalExpenses = state.expenses.reduce((s, e) => s + (Number(e.amount) || 0), 0);
  const balance = totalIncome - totalExpenses;

  const balEl = document.getElementById('statBalance');
  balEl.textContent = fmt(balance) + 'đ';
  balEl.className = 'stat-value ' + (balance >= 0 ? 'positive' : 'negative');
  document.getElementById('statBalanceLabel').textContent = 'Số dư quỹ đội';

  document.getElementById('statMatches').textContent = matches.length;
  document.getElementById('statMembers').textContent = activeMembers.length;
  
  const tfEl = document.getElementById('statTotalFund');
  tfEl.textContent = fmt(totalIncome) + 'đ';
  tfEl.className = 'stat-value positive';

  // Count matches by type for Donut
  const finesMatches = matches.filter(m => classifyResult(m.result) === 'lose').length;
  const drawMatches = matches.filter(m => classifyResult(m.result) === 'draw').length;
  const cancelledMatches = matches.filter(m => classifyResult(m.result) === 'cancelled').length;

  renderWinRateChart(finesMatches, drawMatches, cancelledMatches);
  renderMonthlyChart();
  renderRecentMatches();
}

let winChart = null;
function renderWinRateChart(fines, draws, cancelled) {
  const canvas = document.getElementById('winRateChart');
  if (winChart) winChart.destroy();
  winChart = new Chart(canvas, {
    type: 'doughnut',
    data: {
      labels: ['Trận phạt', 'Hòa', 'Mưa hoãn'],
      datasets: [{
        data: [fines, draws, cancelled],
        backgroundColor: ['#ef4444', '#00ffff', '#6b7280'],
        borderWidth: 0, borderRadius: 4
      }]
    },
    options: {
      cutout: '65%', responsive: false,
      plugins: { legend: { display: false } }
    }
  });
  const total = fines + draws + cancelled;
  const pctF = total ? Math.round(fines / total * 100) : 0;
  const pctD = total ? Math.round(draws / total * 100) : 0;
  document.getElementById('winRateLegend').innerHTML =
    `<div class="legend-item"><span class="legend-dot" style="background:#ef4444"></span>Có phạt: ${fines} (${pctF}%)</div>` +
    `<div class="legend-item"><span class="legend-dot" style="background:#00ffff"></span>Hòa: ${draws} (${pctD}%)</div>` +
    `<div class="legend-item"><span class="legend-dot" style="background:#6b7280"></span>Hoãn: ${cancelled}</div>`;
}

let monthChart = null;
function renderMonthlyChart() {
  const thuByMonth = {};
  state.fundPayments.forEach(p => {
    const k = getMonthKey(p.timestamp);
    if (!k) return;
    thuByMonth[k] = (thuByMonth[k] || 0) + (Number(p.amount) || 0);
  });

  const keys = Object.keys(thuByMonth).sort();
  const labels = keys.map(k => { const [y, m] = k.split('-'); return `T${+m}/${y.slice(2)}`; });
  const thuData = keys.map(k => thuByMonth[k] || 0);

  const canvas = document.getElementById('monthlyChart');
  if (monthChart) monthChart.destroy();
  monthChart = new Chart(canvas, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label: 'Tiền phạt thu',
          data: thuData,
          backgroundColor: 'rgba(239,68,68,0.7)',
          borderColor: '#ef4444',
          borderWidth: 1,
          borderRadius: 4,
        }
      ]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { display: false }
      },
      scales: {
        x: { ticks: { color: '#6b7280', font: { size: 9 } }, grid: { display: false } },
        y: { ticks: { color: '#6b7280', font: { size: 9 }, callback: v => fmt(v) }, grid: { color: '#333a4a' } }
      }
    }
  });
}

function renderRecentMatches() {
  const recent = [...state.matches].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);
  document.getElementById('recentCount').textContent = `${state.matches.length} trận`;
  document.getElementById('recentMatches').innerHTML = recent.map(m => matchItemHTML(m)).join('');
}

function matchItemHTML(m) {
  const cls = classifyResult(m.result);
  const safeTs = String(m.date || '').replace(/'/g, "\\'");
  const losingCount = m.losingTeam ? m.losingTeam.length : 0;
  return `<div class="match-item" onclick="openEditMatch('${safeTs}')" style="cursor:pointer">
    <div class="match-result-badge ${cls}">${resultLabel(m.result)}</div>
    <div class="match-info">
      <div class="match-opponent">${m.opponent}${m.note ? ' · ' + m.note : ''}</div>
      <div class="match-date">${fmtDate(m.date)}${losingCount ? ' · Đội thua: ' + losingCount + ' người' : ''}</div>
    </div>
    <div class="match-cost">${losingCount ? fmt(losingCount * 20000) + 'đ' : '0đ'}</div>
  </div>`;
}

function renderMatches() {
  const months = [...new Set(state.matches.map(m => getMonthKey(m.date)))].sort().reverse();
  const sel = document.getElementById('matchMonthSelector');
  sel.innerHTML = `<div class="month-chip ${state.selectedMonth === 'all' ? 'active' : ''}" onclick="filterMonth('all')">Tất cả</div>` +
    months.map(k => {
      const [y, m] = k.split('-');
      return `<div class="month-chip ${state.selectedMonth === k ? 'active' : ''}" onclick="filterMonth('${k}')">T${+m}/${y.slice(2)}</div>`;
    }).join('');

  let filtered = state.selectedMonth === 'all' ? state.matches : state.matches.filter(m => getMonthKey(m.date) === state.selectedMonth);
  filtered = [...filtered].sort((a, b) => b.date.localeCompare(a.date));

  const totalMatches = filtered.length;
  const finesCount = filtered.reduce((s, m) => s + (m.losingTeam ? m.losingTeam.length : 0), 0);
  const totalCost = finesCount * 20000;

  document.getElementById('sumTotalMatches').textContent = totalMatches;
  document.getElementById('sumPlay').textContent = totalMatches;
  document.getElementById('sumFines').textContent = finesCount;
  document.getElementById('sumCost').textContent = fmt(totalCost) + 'đ';
  
  document.getElementById('matchList').innerHTML = filtered.map(m => matchItemHTML(m)).join('') ||
    '<div class="empty-state"><p>Chưa có trận đấu nào</p></div>';
}

function filterMonth(m) { state.selectedMonth = m; renderMatches(); }

function switchSubTab(el) {
  const container = el.closest('#tabFund');
  if (!container) return;
  container.querySelectorAll('.sub-tab-item').forEach(n => n.classList.remove('active'));
  container.querySelectorAll('.sub-tab-panel').forEach(p => p.classList.remove('active'));
  el.classList.add('active');
  const subtabId = el.dataset.subtab;
  document.getElementById(subtabId).classList.add('active');
  state.currentSubTab = subtabId;
  renderFund();
}

function filterQuarter(q) {
  state.selectedQuarter = Number(q);
  document.querySelectorAll('.quarter-chip').forEach(c => {
    c.classList.toggle('active', Number(c.dataset.quarter) === state.selectedQuarter);
  });
  renderFund();
}

function goToQuarterTab(q) {
  state.selectedQuarter = q;
  document.querySelectorAll('.quarter-chip').forEach(c => {
    c.classList.toggle('active', Number(c.dataset.quarter) === q);
  });
  const el = document.querySelector(`.sub-tab-item[data-subtab="subtabContributions"]`);
  if (el) switchSubTab(el);
}

if (typeof window !== 'undefined') {
  window.switchSubTab = switchSubTab;
  window.filterQuarter = filterQuarter;
  window.goToQuarterTab = goToQuarterTab;
}

function getQuarterByDate(dateStr) {
  if (!dateStr || dateStr.length < 7) return 1;
  const month = parseInt(dateStr.substring(5, 7), 10);
  if (month >= 1 && month <= 3) return 1;
  if (month >= 4 && month <= 6) return 2;
  if (month >= 7 && month <= 9) return 3;
  return 4;
}

function renderFund() {
  if (!state.currentSubTab) state.currentSubTab = 'subtabSummary';
  if (!state.selectedQuarter) state.selectedQuarter = 3;

  // Recalculate totals
  const totalFines = state.fundPayments.reduce((s, p) => s + (Number(p.amount) || 0), 0);
  const totalContributions = state.quarterlyContributions.reduce((s, c) => {
    const q1 = Number(c.q1_amount) || 0;
    const q2 = Number(c.q2_amount) || 0;
    const q3 = Number(c.q3_amount) || 0;
    const q4 = Number(c.q4_amount) || 0;
    return s + q1 + q2 + q3 + q4;
  }, 0);
  const totalIncome = totalContributions + totalFines;
  const totalExpenses = state.expenses.reduce((s, e) => s + (Number(e.amount) || 0), 0);
  const balance = totalIncome - totalExpenses;

  // 1. SUBTAB SUMMARY & EXPENSES
  if (state.currentSubTab === 'subtabSummary') {
    document.getElementById('fundBalance').textContent = fmt(balance) + 'đ';
    document.getElementById('fundBalance').className = 'stat-value ' + (balance >= 0 ? 'positive' : 'negative');

    // Calculate quarterly stats
    let qStats = [
      { contributions: 0, fines: 0, expenses: 0, remaining: 0 },
      { contributions: 0, fines: 0, expenses: 0, remaining: 0 },
      { contributions: 0, fines: 0, expenses: 0, remaining: 0 },
      { contributions: 0, fines: 0, expenses: 0, remaining: 0 }
    ];

    // Contributions per quarter
    state.quarterlyContributions.forEach(c => {
      qStats[0].contributions += Number(c.q1_amount) || 0;
      qStats[1].contributions += Number(c.q2_amount) || 0;
      qStats[2].contributions += Number(c.q3_amount) || 0;
      qStats[3].contributions += Number(c.q4_amount) || 0;
    });

    // Fines per quarter
    state.fundPayments.forEach(p => {
      const q = getQuarterByDate(p.timestamp.substring(0, 10));
      qStats[q - 1].fines += Number(p.amount) || 0;
    });

    // Expenses per quarter
    state.expenses.forEach(e => {
      const q = Number(e.quarter) || 1;
      qStats[q - 1].expenses += Number(e.amount) || 0;
    });

    // Cumulative remaining
    let prevRemaining = 0;
    for (let q = 1; q <= 4; q++) {
      qStats[q - 1].remaining = prevRemaining + qStats[q - 1].contributions + qStats[q - 1].fines - qStats[q - 1].expenses;
      prevRemaining = qStats[q - 1].remaining;
    }

    // Render summary grid
    document.getElementById('quartersSummaryGrid').innerHTML = qStats.map((s, idx) => {
      const q = idx + 1;
      return `<div class="quarter-summary-card" onclick="goToQuarterTab(${q})">
        <div class="quarter-summary-title">Quý ${q}/2026</div>
        <div class="quarter-summary-row" style="margin-top: 6px;">
          <span>Đóng quỹ:</span>
          <span>${fmt(s.contributions)}đ</span>
        </div>
        <div class="quarter-summary-row">
          <span>Phạt thua:</span>
          <span>${fmt(s.fines)}đ</span>
        </div>
        <div class="quarter-summary-row">
          <span>Đã chi:</span>
          <span>${fmt(s.expenses)}đ</span>
        </div>
        <div class="quarter-summary-row total-row">
          <span>Quỹ còn:</span>
          <span>${fmt(s.remaining)}đ</span>
        </div>
      </div>`;
    }).join('');

    // Render expense list
    const sortedExpenses = [...state.expenses]
      .map((e, idx) => ({ ...e, originalIndex: idx }))
      .sort((a, b) => b.date.localeCompare(a.date));

    document.getElementById('expenseCount').textContent = sortedExpenses.length;
    document.getElementById('expenseList').innerHTML = sortedExpenses.map(item => {
      const isFree = item.amount === 0;
      return `<div class="expense-item" onclick="openEditExpense(${item.originalIndex})">
        <div class="expense-icon">💸</div>
        <div class="expense-info">
          <div class="expense-name-text">${item.name} (Q${item.quarter})</div>
          <div class="expense-date-text">${fmtDate(item.date)}${item.status !== 'normal' ? ' · Status: ' + item.status : ''}</div>
        </div>
        <div class="expense-amount-val ${isFree ? 'free' : ''}">
          ${isFree ? item.status : '-' + fmt(item.amount) + 'đ'}
        </div>
      </div>`;
    }).join('') || '<div class="empty-state"><p>Chưa có khoản chi tiêu nào</p></div>';
  }

  // 2. SUBTAB CONTRIBUTIONS
  else if (state.currentSubTab === 'subtabContributions') {
    document.getElementById('totalContributions').textContent = fmt(totalContributions) + 'đ';

    const q = state.selectedQuarter;
    const amtKey = `q${q}_amount`;
    const dateKey = `q${q}_date`;

    const sortedMembers = [...state.members].sort((a, b) => a.name.localeCompare(b.name, 'vi'));

    document.getElementById('contributionsList').innerHTML = sortedMembers.map(m => {
      const c = state.quarterlyContributions.find(x => normName(x.member) === normName(m.name)) || {
        member: m.name, q1_amount: 0, q1_date: '', q2_amount: 0, q2_date: '', q3_amount: 0, q3_date: '', q4_amount: 0, q4_date: ''
      };

      const amtVal = c[amtKey];
      const dateVal = c[dateKey];

      let statusCls = 'unpaid';
      let statusLabel = 'Chưa nộp';
      let metaText = 'Hạn đóng: cuối quý';

      if (typeof amtVal === 'number' && amtVal > 0) {
        statusCls = 'paid';
        statusLabel = fmt(amtVal) + 'đ';
        metaText = dateVal ? `Đã nộp ngày ${fmtDate(dateVal)}` : 'Đã nộp';
      } else if (amtVal === 'Nghỉ' || dateVal === 'Nghỉ') {
        statusCls = 'paused';
        statusLabel = 'Nghỉ';
        metaText = 'Tạm nghỉ hoạt động quý này';
      } else if (amtVal === 'Chưa tham gia' || dateVal === 'Chưa tham gia') {
        statusCls = 'not_joined';
        statusLabel = 'Chưa vào';
        metaText = 'Chưa gia nhập câu lạc bộ';
      } else if (amtVal === 0 && dateVal !== '') {
        statusCls = 'not_joined';
        statusLabel = dateVal;
        metaText = dateVal;
      }

      const initials = safeInitial(m.name);
      const safeName = String(m.name).replace(/'/g, "\\'");

      return `<div class="contribution-card" onclick="openEditContribution('${safeName}', ${q})">
        <div class="contribution-avatar">${initials}</div>
        <div class="contribution-card-info">
          <div class="contribution-card-name">${m.name}</div>
          <div class="contribution-card-meta">${metaText}</div>
        </div>
        <div class="contribution-status-badge ${statusCls}">${statusLabel}</div>
      </div>`;
    }).join('') || '<div class="empty-state"><p>Chưa có thành viên nào</p></div>';
  }

  // 3. SUBTAB FINES
  else if (state.currentSubTab === 'subtabFines') {
    document.getElementById('fundPeriodTotal').textContent = fmt(totalFines) + 'đ';

    const sortedList = Object.values(state.memberStatsCache)
      .sort((a, b) => b.fineAmount - a.fineAmount || a.name.localeCompare(b.name, 'vi'));

    document.getElementById('fundList').innerHTML = sortedList.map(item => {
      const hasPaid = item.fineAmount > 0;
      const initials = safeInitial(item.name);
      const pausedTag = item.status === 'paused' ? ' <span class="paused-tag">(tạm nghỉ)</span>' : '';
      const statusCls = hasPaid ? 'paid' : 'unpaid';
      const statusLabel = hasPaid ? `${item.fineCount} trận` : '0 trận';
      return `<div class="fund-row">
        <div class="fund-avatar">${initials}</div>
        <div class="fund-info">
          <div class="fund-name">${item.name}${pausedTag}</div>
          <div class="fund-detail">${hasPaid ? fmt(item.fineAmount) + 'đ tiền phạt' : 'Không bị phạt'}</div>
        </div>
        <div class="fund-status ${statusCls}">${statusLabel}</div>
      </div>`;
    }).join('') || '<div class="empty-state"><p>Chưa có thành viên nào</p></div>';
  }
}

function populateExpenseModal() {
  document.getElementById('expenseModalTitle').textContent = '💸 Thêm khoản chi';
  document.getElementById('editExpenseId').value = '';
  document.getElementById('expenseName').value = '';
  document.getElementById('expenseQuarter').value = state.selectedQuarter || '3';
  document.getElementById('expenseAmount').value = '';
  document.getElementById('expenseDate').value = new Date().toISOString().split('T')[0];
  document.getElementById('expenseStatus').value = 'normal';
  document.getElementById('btnDeleteExpense').style.display = 'none';
}

function openEditExpense(idx) {
  const item = state.expenses[idx];
  if (!item) return;
  document.getElementById('expenseModalTitle').textContent = '✏️ Sửa khoản chi';
  document.getElementById('editExpenseId').value = idx;
  document.getElementById('expenseName').value = item.name || '';
  document.getElementById('expenseQuarter').value = item.quarter || '1';
  document.getElementById('expenseAmount').value = item.amount || 0;
  document.getElementById('expenseDate').value = item.date || '';
  document.getElementById('expenseStatus').value = item.status || 'normal';
  document.getElementById('btnDeleteExpense').style.display = 'block';
  openModal('modalExpense');
}

async function saveExpense() {
  const idxStr = document.getElementById('editExpenseId').value;
  const name = document.getElementById('expenseName').value.trim();
  const quarter = Number(document.getElementById('expenseQuarter').value) || 1;
  const amount = Number(document.getElementById('expenseAmount').value) || 0;
  const date = document.getElementById('expenseDate').value;
  const status = document.getElementById('expenseStatus').value.trim() || 'normal';

  if (!name) return showToast('Vui lòng nhập tên khoản chi', 'error');

  const newExpense = { name, quarter, year: 2026, amount, date, status };

  if (idxStr === '') {
    state.expenses.push(newExpense);
    showToast('Đã thêm khoản chi tiêu 💸');
  } else {
    const idx = Number(idxStr);
    state.expenses[idx] = newExpense;
    showToast('Đã cập nhật khoản chi tiêu ✏️');
  }

  save();
  renderAll();
  closeModal('modalExpense');

  await apiCall('/api/expenses', 'POST', newExpense);
}

async function deleteExpense() {
  const idxStr = document.getElementById('editExpenseId').value;
  if (idxStr === '') return;
  if (!confirm('Bạn có chắc muốn xóa khoản chi này?')) return;
  const idx = Number(idxStr);
  state.expenses.splice(idx, 1);
  save();
  renderAll();
  closeModal('modalExpense');
  showToast('Đã xóa khoản chi 🗑️');
  
  await apiCall('/api/expenses', 'DELETE', { index: idx });
}

function openEditContribution(memberName, quarter) {
  const c = state.quarterlyContributions.find(x => normName(x.member) === normName(memberName));
  if (!c) return;
  document.getElementById('editContributionMember').value = memberName;
  document.getElementById('editContributionQuarter').value = quarter;
  document.getElementById('contributionMemberName').value = memberName;
  document.getElementById('contributionQuarterLabel').value = `Quý ${quarter}/2026`;
  
  const amtKey = `q${quarter}_amount`;
  const dateKey = `q${quarter}_date`;
  
  const amtVal = c[amtKey];
  const dateVal = c[dateKey];
  
  document.getElementById('contributionAmount').value = (typeof amtVal === 'number') ? amtVal : 0;
  document.getElementById('contributionDate').value = dateVal || '';
  
  openModal('modalQuarterlyContribution');
}

async function saveQuarterlyContribution() {
  const memberName = document.getElementById('editContributionMember').value;
  const quarter = Number(document.getElementById('editContributionQuarter').value);
  const amountInput = document.getElementById('contributionAmount').value;
  const dateInput = document.getElementById('contributionDate').value.trim();

  const c = state.quarterlyContributions.find(x => normName(x.member) === normName(memberName));
  if (!c) return;

  const amtKey = `q${quarter}_amount`;
  const dateKey = `q${quarter}_date`;

  let amount = Number(amountInput);
  if (isNaN(amount)) amount = amountInput;

  c[amtKey] = amount;
  c[dateKey] = dateInput;

  save();
  renderAll();
  closeModal('modalQuarterlyContribution');
  showToast('Đã cập nhật đóng quỹ thành viên 💰');

  await apiCall('/api/contributions', 'POST', { member: memberName, quarter, amount, date: dateInput });
}

if (typeof window !== 'undefined') {
  window.openEditExpense = openEditExpense;
  window.saveExpense = saveExpense;
  window.deleteExpense = deleteExpense;
  window.openEditContribution = openEditContribution;
  window.saveQuarterlyContribution = saveQuarterlyContribution;
}

function openMonthlyReport() {
  const now = new Date();
  let pickedKey = null;
  // find recent month with data
  for (let i = 0; i < 6; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const hasData = state.fundPayments.some(p => getMonthKey(p.timestamp) === key);
    if (hasData) { pickedKey = key; break; }
    if (i === 0) pickedKey = key;
  }
  state.monthlyReportMonth = pickedKey;
  renderMonthlyReport();
  openModal('modalMonthlyReport');
}

function selectReportMonth(monthKey) {
  state.monthlyReportMonth = monthKey;
  renderMonthlyReport();
}

function renderMonthlyReport() {
  const m = state.monthlyReportMonth;
  if (!m) return;
  const [y, mm] = m.split('-');
  const labelShort = `T${parseInt(mm, 10)}/${y}`;

  document.getElementById('reportTitle').textContent = `📊 Báo cáo phạt ${labelShort}`;

  const now = new Date();
  const chips = [];
  for (let i = 0; i < 5; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const k = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    chips.push({ key: k, label: `T${d.getMonth() + 1}/${String(d.getFullYear()).slice(2)}` });
  }
  document.getElementById('reportChips').innerHTML = chips.map(c =>
    `<div class="month-chip ${c.key === m ? 'active' : ''}" onclick="selectReportMonth('${c.key}')">${c.label}</div>`
  ).join('');

  const fundRows = state.fundPayments.filter(p => getMonthKey(p.timestamp) === m);
  const thu = fundRows.reduce((s, r) => s + (Number(r.amount) || 0), 0);
  document.getElementById('reportThu').textContent = fmt(thu) + 'đ';
  document.getElementById('reportThuCount').textContent = `${fundRows.length} lượt phạt`;
  
  // Group by member for report list
  const memberReport = {};
  fundRows.forEach(r => {
    const k = r.member;
    if (!memberReport[k]) memberReport[k] = 0;
    memberReport[k] += r.amount;
  });

  const sortedList = Object.entries(memberReport).sort((a, b) => b[1] - a[1]);

  document.getElementById('reportThuList').innerHTML = sortedList
    .map(item => `<div class="report-row"><span class="report-row-name">${item[0]}</span><span class="report-row-amount negative">${fmt(item[1])}đ</span></div>`)
    .join('') || '<div class="report-empty">Không có khoản phạt nào trong tháng</div>';
}

function renderMembers() {
  const colors = ['#1e3a5f', '#3b1f5f', '#5f1e3a', '#1e5f3a', '#5f3a1e', '#3a1e5f'];
  document.getElementById('memberCount').textContent = `${state.members.length} thành viên`;

  const membersWithStats = state.members.map(m => {
    const stats = state.memberStatsCache[normName(m.name)] || {
      played: 0, wins: 0, draws: 0, losses: 0, winRate: 0, lossRate: 0, formHistory: []
    };
    return { ...m, stats };
  });

  const MIN_MATCHES = 3;
  const sorted = membersWithStats.sort((a, b) => {
    const aEnough = a.stats.played >= MIN_MATCHES ? 1 : 0;
    const bEnough = b.stats.played >= MIN_MATCHES ? 1 : 0;
    if (aEnough !== bEnough) return bEnough - aEnough;
    return b.stats.lossRate - a.stats.lossRate || b.stats.losses - a.stats.losses || a.name.localeCompare(b.name, 'vi');
  });

  document.getElementById('memberList').innerHTML = sorted.map((m, i) => {
    const initials = safeInitial(m.name);
    const bg = colors[i % colors.length];
    const s = m.stats;
    const safeName = String(m.name || '').replace(/'/g, "\\'");
    const wrPct = s.played ? (s.winRate * 100).toFixed(0) : '0';
    
    const formGuide = s.formHistory.slice(-5).map(f => {
      const cls = f === 'W' ? 'win' : f === 'D' ? 'draw' : 'lose';
      return `<span class="form-badge ${cls}" style="width:14px; height:14px; font-size:0.55rem; line-height:14px;">${f}</span>`;
    }).join('');
    
    return `<div class="member-card" onclick="openEditMember('${safeName}')">
      <div class="member-avatar" style="background:linear-gradient(135deg,${bg},${bg}cc)">${initials}</div>
      <div class="member-info">
        <div class="member-name">${m.name}</div>
        <div class="member-meta" style="margin-top: 4px; display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
          <span>${s.played} trận</span>
          <span style="color:#10b981">${s.wins}T</span>
          <span style="color:#00ffff">${s.draws}H</span>
          <span style="color:#ff005c">${s.losses}B</span>
          <span style="color:${s.winRate >= 0.5 ? '#10b981' : '#ff005c'}">${wrPct}%</span>
        </div>
        <div class="member-form-row" style="margin-top: 6px; display: flex; gap: 4px;">
          ${formGuide}
        </div>
      </div>
      <div class="member-status ${m.status || 'active'}">${m.status === 'paused' ? 'Tạm nghỉ' : 'Hoạt động'}</div>
    </div>`;
  }).join('') || '<div class="empty-state"><p>Chưa có thành viên</p></div>';
}

function renderLog() {
  const sorted = [...state.matches].sort((a, b) => b.date.localeCompare(a.date));
  const el = document.getElementById('logTimeline');
  const countEl = document.getElementById('logMatchCount');
  if (countEl) countEl.textContent = sorted.length;
  if (!el) return;

  el.innerHTML = sorted.map(m => {
    const cls = classifyResult(m.result);
    const losingTeam = m.losingTeam || [];
    const playedTeam = m.playedTeam || [];
    const winningTeam = playedTeam.filter(name => !losingTeam.some(l => normName(l) === normName(name)));

    let resultText = '';
    let resultEmoji = '';
    if (cls === 'lose') { resultText = 'Có phạt'; resultEmoji = '❌'; }
    else if (cls === 'draw') { resultText = 'Hòa'; resultEmoji = '🤝'; }
    else if (cls === 'cancelled') { resultText = 'Hoãn'; resultEmoji = '🌧️'; }

    let losingHTML = '';
    if (losingTeam.length > 0) {
      losingHTML = `
        <div class="log-losing-title">❌ Đội thua (${losingTeam.length} người · phạt ${fmt(losingTeam.length * 20000)}đ)</div>
        <div class="log-losing-grid">
          ${losingTeam.map(n => `<span class="log-losing-chip">${n}</span>`).join('')}
        </div>`;
    }

    let winningHTML = '';
    if (cls === 'lose' && winningTeam.length > 0) {
      winningHTML = `
        <div class="log-winning-title">✅ Đội thắng (${winningTeam.length} người)</div>
        <div class="log-winning-grid">
          ${winningTeam.map(n => `<span class="log-winning-chip">${n}</span>`).join('')}
        </div>`;
    }

    let noteHTML = '';
    if (m.note) {
      noteHTML = `<div class="log-note">📝 ${m.note}</div>`;
    }

    let statsHTML = '';
    if (playedTeam.length > 0) {
      statsHTML = `
        <div class="log-stats-row">
          <div class="log-stat">👥 Tham gia: <strong>${playedTeam.length}</strong></div>
          ${losingTeam.length > 0 ? `<div class="log-stat">💰 Phạt: <strong>${fmt(losingTeam.length * 20000)}đ</strong></div>` : ''}
        </div>`;
    }

    return `<div class="log-card ${cls}">
      <div class="log-card-header">
        <span class="log-date">📅 ${fmtDate(m.date)}</span>
        <span class="log-result-badge ${cls}">${resultEmoji} ${resultText}</span>
      </div>
      ${noteHTML}
      ${losingHTML}
      ${winningHTML}
      ${statsHTML}
    </div>`;
  }).join('') || '<div class="empty-state"><p>Chưa có nhật ký trận đấu</p></div>';
}

let formLineChart = null;
let costResultBarChart = null;
let memberStackedChart = null;
let memberPercentStackedChart = null;
let showAllPenalties = false;
let showAllStacked = false;
let showAllPercent = false;

function togglePenaltiesShow() {
  showAllPenalties = !showAllPenalties;
  const btn = document.getElementById('togglePenaltiesBtn');
  if (btn) {
    btn.innerHTML = showAllPenalties ? 'Thu gọn <span id="togglePenaltiesArrow">▲</span>' : 'Xem tất cả <span id="togglePenaltiesArrow">▼</span>';
  }
  renderCharts();
}

function toggleStackedShow() {
  showAllStacked = !showAllStacked;
  const btn = document.getElementById('toggleStackedBtn');
  if (btn) {
    btn.innerHTML = showAllStacked ? 'Thu gọn <span id="toggleStackedArrow">▲</span>' : 'Xem tất cả <span id="toggleStackedArrow">▼</span>';
  }
  renderCharts();
}

function togglePercentShow() {
  showAllPercent = !showAllPercent;
  const btn = document.getElementById('togglePercentBtn');
  if (btn) {
    btn.innerHTML = showAllPercent ? 'Thu gọn <span id="togglePercentArrow">▲</span>' : 'Xem tất cả <span id="togglePercentArrow">▼</span>';
  }
  renderCharts();
}

if (typeof window !== 'undefined') {
  window.togglePenaltiesShow = togglePenaltiesShow;
  window.toggleStackedShow = toggleStackedShow;
  window.togglePercentShow = togglePercentShow;
}

function createStackedBarChart(canvasEl, labels, datasets, options = {}) {
  return new Chart(canvasEl, {
    type: 'bar',
    data: { labels, datasets },
    options: Object.assign({
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: { stacked: true, grid: { color: 'rgba(255,255,255,0.05)' } },
        y: { stacked: true, ticks: { color: '#9ca3af', font: { size: 9 }, autoSkip: false }, grid: { display: false } }
      }
    }, options)
  });
}

function renderCharts() {
  // --- Form Guide (5 Trận Gần Nhất cả đội) ---
  const recentForm = [...state.matches].sort((a, b) => a.date.localeCompare(b.date)).slice(-5);
  const formGuideHtml = recentForm.map(m => {
    const res = classifyResult(m.result);
    const label = res === 'lose' ? 'L' : res === 'draw' ? 'D' : res === 'cancelled' ? 'C' : 'W';
    return `<div class="form-badge ${res}">${label}</div>`;
  }).join('');
  const fgEl = document.getElementById('recentFormGuide');
  if (fgEl) fgEl.innerHTML = formGuideHtml || '<div class="empty-state"><p>Chưa có dữ liệu</p></div>';

  // 1. Quỹ đạo kết quả trận đấu (16 trận)
  const sortedMatches = [...state.matches].sort((a, b) => a.date.localeCompare(b.date));
  const lineLabels = sortedMatches.map(m => {
    const parts = m.date.split('-');
    return `${parts[2]}/${parts[1]}`;
  });

  const lineData = sortedMatches.map(m => {
    const r = classifyResult(m.result);
    return r === 'lose' ? -1 : r === 'draw' ? 0 : r === 'cancelled' ? 0.5 : 1;
  });

  const lineColors = sortedMatches.map(m => {
    const r = classifyResult(m.result);
    return r === 'lose' ? '#ff005c' : r === 'draw' ? '#00ffff' : '#6b7280';
  });

  const ctxLine = document.getElementById('formLineChart');
  if (formLineChart) formLineChart.destroy();
  if (ctxLine) {
    formLineChart = new Chart(ctxLine, {
      type: 'line',
      data: {
        labels: lineLabels,
        datasets: [{ 
          label: 'Trận đấu', 
          data: lineData, 
          borderColor: 'rgba(255,255,255,0.2)', 
          borderWidth: 2,
          pointBackgroundColor: lineColors, 
          pointBorderColor: '#1e1e2f',
          pointBorderWidth: 2,
          pointRadius: 6,
          tension: 0.2
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: function(context) {
                const idx = context.dataIndex;
                const m = sortedMatches[idx];
                return ` Ngày: ${fmtDate(m.date)} | Kết quả: ${m.result}`;
              }
            }
          }
        },
        scales: {
          x: { ticks: { color: '#9ca3af', font: { size: 9 } }, grid: { display: false } },
          y: { 
            min: -1.5, max: 1.5,
            ticks: { 
              color: '#e2e8f0', font: { size: 10, weight: 'bold' },
              stepSize: 1,
              callback: function(value) {
                if (value === 1) return 'Xong';
                if (value === 0.5) return 'Hoãn';
                if (value === 0) return 'Hòa';
                if (value === -1) return 'Có Phạt';
                return '';
              }
            }, 
            grid: { color: 'rgba(255,255,255,0.05)' } 
          }
        }
      }
    });
  }

  // 2. Biểu đồ xếp hạng phạt thua các thành viên
  const sortedStats = Object.values(state.memberStatsCache)
    .filter(item => item.fineAmount > 0)
    .sort((a, b) => b.fineAmount - a.fineAmount || a.name.localeCompare(b.name, 'vi'));

  const displayStats = showAllPenalties ? sortedStats : sortedStats.slice(0, 10);
  const barLabels = displayStats.map((item, idx) => {
    const rank = sortedStats.findIndex(x => x.name === item.name) + 1;
    return `${rank}. ${item.name}`;
  });
  const barData = displayStats.map(item => item.fineAmount);

  const ctxBar = document.getElementById('costResultBarChart');
  if (costResultBarChart) costResultBarChart.destroy();
  if (ctxBar) {
    ctxBar.parentNode.style.height = (barLabels.length * 28 + 45) + 'px';
    costResultBarChart = new Chart(ctxBar, {
      type: 'bar',
      data: {
        labels: barLabels,
        datasets: [{ 
          label: 'Tiền phạt tích lũy', 
          data: barData, 
          backgroundColor: '#f72585', 
          borderRadius: 4
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true, maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: function(context) {
                return ` Tổng phạt: ${parseInt(context.raw).toLocaleString('vi-VN')} đ`;
              }
            }
          }
        },
        scales: {
          x: { 
            ticks: { color: '#9ca3af', font: { size: 9 }, callback: v => fmt(v) }, 
            grid: { color: 'rgba(255,255,255,0.05)' } 
          },
          y: { 
            ticks: { color: '#9ca3af', font: { size: 9 }, autoSkip: false }, 
            grid: { display: false } 
          }
        }
      }
    });
  }

  // 3. Biểu đồ Stacked Bar Chart phân tích phong độ chi tiết từng thành viên
  const memberStackedData = state.members
    .map(m => state.memberStatsCache[normName(m.name)])
    .filter(p => p && p.played > 0)
    .map(p => ({
      name: p.name,
      win: p.wins,
      draw: p.draws,
      lose: p.losses,
      played: p.played,
      winRate: p.winRate
    }));

  const MIN_MATCHES_CHART = 3;
  memberStackedData.sort((a, b) => {
    const aEnough = a.played >= MIN_MATCHES_CHART ? 1 : 0;
    const bEnough = b.played >= MIN_MATCHES_CHART ? 1 : 0;
    if (aEnough !== bEnough) return bEnough - aEnough;
    return b.winRate - a.winRate || b.win - a.win || a.name.localeCompare(b.name, 'vi');
  });

  const displayStacked = showAllStacked ? memberStackedData : memberStackedData.slice(0, 10);
  const stackedLabels = displayStacked.map(item => {
    const rank = memberStackedData.findIndex(x => x.name === item.name) + 1;
    return `${rank}. ${item.name}`;
  });
  const winData = displayStacked.map(item => item.win);
  const drawData = displayStacked.map(item => item.draw);
  const loseData = displayStacked.map(item => item.lose);

  const ctxStacked = document.getElementById('memberStackedChart');
  if (memberStackedChart) memberStackedChart.destroy();
  if (ctxStacked) {
    ctxStacked.parentNode.style.height = (stackedLabels.length * 28 + 45) + 'px';
    memberStackedChart = createStackedBarChart(ctxStacked, stackedLabels, [
      { label: 'Thắng', data: winData, backgroundColor: '#00F5D4', borderRadius: 4 },
      { label: 'Hòa', data: drawData, backgroundColor: '#FFD166', borderRadius: 4 },
      { label: 'Thua', data: loseData, backgroundColor: '#FF5A5F', borderRadius: 4 }
    ], {
      plugins: {
        legend: { display: true, position: 'top', labels: { color: '#9ca3af', font: { size: 10 } } },
        tooltip: { callbacks: { label: c => ` ${c.dataset.label}: ${c.raw} trận` } }
      },
      scales: {
        x: { stacked: true, ticks: { color: '#9ca3af', font: { size: 9 }, stepSize: 1 }, grid: { color: 'rgba(255,255,255,0.05)' } },
        y: { stacked: true, ticks: { color: '#9ca3af', font: { size: 9 }, autoSkip: false }, grid: { display: false } }
      }
    });
  }

  // 4. Biểu đồ 100% Stacked Bar Chart tỷ lệ % thắng - hòa - thua
  const displayPercent = showAllPercent ? memberStackedData : memberStackedData.slice(0, 10);
  const percentLabels = displayPercent.map(item => {
    const rank = memberStackedData.findIndex(x => x.name === item.name) + 1;
    return `${rank}. ${item.name}`;
  });
  const winPercentData = displayPercent.map(item => (item.win / item.played) * 100);
  const drawPercentData = displayPercent.map(item => (item.draw / item.played) * 100);
  const losePercentData = displayPercent.map(item => (item.lose / item.played) * 100);

  const ctxPercent = document.getElementById('memberPercentStackedChart');
  if (memberPercentStackedChart) memberPercentStackedChart.destroy();
  if (ctxPercent) {
    ctxPercent.parentNode.style.height = (percentLabels.length * 28 + 45) + 'px';
    memberPercentStackedChart = createStackedBarChart(ctxPercent, percentLabels, [
      { label: 'Thắng (%)', data: winPercentData, rawCounts: displayPercent.map(item => item.win), totalMatches: displayPercent.map(item => item.played), backgroundColor: '#4facfe', borderRadius: 4 },
      { label: 'Hòa (%)', data: drawPercentData, rawCounts: displayPercent.map(item => item.draw), totalMatches: displayPercent.map(item => item.played), backgroundColor: '#a855f7', borderRadius: 4 },
      { label: 'Thua (%)', data: losePercentData, rawCounts: displayPercent.map(item => item.lose), totalMatches: displayPercent.map(item => item.played), backgroundColor: '#f43f5e', borderRadius: 4 }
    ], {
      plugins: {
        legend: { display: true, position: 'top', labels: { color: '#9ca3af', font: { size: 10 } } },
        tooltip: {
          callbacks: {
            label: function(context) {
              const dataset = context.dataset;
              const percent = context.raw.toFixed(1);
              const rawCount = dataset.rawCounts[context.dataIndex];
              const total = dataset.totalMatches[context.dataIndex];
              return ` ${dataset.label.replace(' (%)', '')}: ${percent}% (${rawCount}/${total} trận)`;
            }
          }
        }
      },
      scales: {
        x: { stacked: true, min: 0, max: 100, ticks: { color: '#9ca3af', font: { size: 9 }, callback: v => v + '%' }, grid: { color: 'rgba(255,255,255,0.05)' } },
        y: { stacked: true, ticks: { color: '#9ca3af', font: { size: 9 }, autoSkip: false }, grid: { display: false } }
      }
    });
  }

  renderPairs();
}

function renderPairs() {
  const container = document.getElementById('pairsAnalysisContainer');
  if (!container) return;

  const membersList = state.members.map(m => m.name);
  const pairs = {};

  for (let i = 0; i < membersList.length; i++) {
    for (let j = i + 1; j < membersList.length; j++) {
      const p1 = membersList[i];
      const p2 = membersList[j];
      const key = p1 < p2 ? `${p1}_vs_${p2}` : `${p2}_vs_${p1}`;
      pairs[key] = { p1, p2, together: 0, wins: 0, draws: 0, losses: 0 };
    }
  }

  state.matches.forEach(m => {
    const res = classifyResult(m.result);
    if (res === 'cancelled') return;
    const played = m.playedTeam || [];
    const losers = m.losingTeam || [];
    const isDraw = res === 'draw';

    for (let i = 0; i < played.length; i++) {
      for (let j = i + 1; j < played.length; j++) {
        const p1 = played[i];
        const p2 = played[j];
        const key = p1 < p2 ? `${p1}_vs_${p2}` : `${p2}_vs_${p1}`;
        if (pairs[key]) {
          if (isDraw) {
            pairs[key].together++;
            pairs[key].draws++;
          } else {
            const p1Lost = losers.includes(p1);
            const p2Lost = losers.includes(p2);
            if (p1Lost === p2Lost) {
              pairs[key].together++;
              if (p1Lost) {
                pairs[key].losses++;
              } else {
                pairs[key].wins++;
              }
            }
          }
        }
      }
    }
  });

  const validPairs = Object.values(pairs).filter(p => p.together >= 3).map(p => {
    const winRate = p.together ? (p.wins / p.together) * 100 : 0;
    const ppg = p.together ? (p.wins * 3 + p.draws * 1) / p.together : 0;
    return { ...p, winRate, ppg };
  });

  const bestPairs = [...validPairs].sort((a, b) => b.winRate - a.winRate || b.ppg - a.ppg || b.together - a.together);
  const worstPairs = [...validPairs].sort((a, b) => a.winRate - b.winRate || a.ppg - b.ppg || a.together - b.together);

  const rowHTML = (p, idx, isBest) => {
    const rateClass = isBest ? 'best' : 'worst';
    return `<div class="duo-row">
      <div class="duo-names">
        <div class="duo-names-row">
          <span>${p.p1}</span>
          <span class="duo-and">&amp;</span>
          <span>${p.p2}</span>
        </div>
        <div class="duo-detail">${p.together} trận · ${p.wins}T · ${p.draws}H · ${p.losses}B</div>
      </div>
      <div class="duo-stats">
        <div class="duo-winrate ${rateClass}">${p.winRate.toFixed(1)}%</div>
        <div class="duo-detail">PPG: ${p.ppg.toFixed(2)}</div>
      </div>
    </div>`;
  };

  container.innerHTML = `
    <div class="pairs-subsection">
      <div class="pairs-subsection-title">👑 TOP CẶP BÀI TRÙNG ĂN Ý NHẤT</div>
      <div class="pairs-list">
        ${bestPairs.slice(0, 5).map((p, idx) => rowHTML(p, idx, true)).join('') || '<div class="empty-state">Chưa đủ dữ liệu</div>'}
      </div>
    </div>
    <div class="pairs-subsection" style="margin-top: 10px;">
      <div class="pairs-subsection-title">⚠️ TOP CẶP THI ĐẤU KÉM ĂN Ý</div>
      <div class="pairs-list">
        ${worstPairs.slice(0, 5).map((p, idx) => rowHTML(p, idx, false)).join('') || '<div class="empty-state">Chưa đủ dữ liệu</div>'}
      </div>
    </div>
  `;
}

async function saveMatch(btn) {
  const date = document.getElementById('matchDate').value;
  const opponent = "Nội bộ";
  const result = document.getElementById('matchResult').value;
  const note = document.getElementById('matchNote').value;
  const venue = document.getElementById('matchVenue').value;

  if (!date || !result) { showToast('Vui lòng điền ngày và kết quả', 'error'); return; }

  // Get checked losing team members
  const losingTeam = [];
  if (result === 'Thua') {
    const checkboxes = document.querySelectorAll('#matchLosingTeamCheckboxes input[type="checkbox"]:checked');
    checkboxes.forEach(cb => losingTeam.push(cb.value));
    if (losingTeam.length === 0) {
      showToast('Vui lòng chọn ít nhất một thành viên đội thua cuộc', 'error');
      return;
    }
  }

  const lock = lockButton(btn || event?.target);
  const timestamp = new Date().toISOString();
  const newMatch = { timestamp, date, opponent, result, note, venue, losingTeam };
  state.matches.push(newMatch);

  // Generate fund payments for the losing team
  if (result === 'Thua') {
    losingTeam.forEach(mem => {
      state.fundPayments.push({
        timestamp: date + " 21:00:00",
        period: "Phạt thua",
        member: mem,
        amount: 20000,
        note: `Phạt trận ngày ${date.split('-').reverse().slice(0, 2).join('/')}`,
        periodRaw: "Phạt thua"
      });
    });
  }

  save(); renderAll(); closeModal('modalMatch');

  // BFF call (mock offline first)
  const ok = await apiCall('/api/matches', 'POST', newMatch);
  if (!ok && state.apiUrl) {
    state.matches = state.matches.filter(m => m !== newMatch);
    state.fundPayments = state.fundPayments.filter(p => !p.timestamp.startsWith(date));
    save(); renderAll();
    showToast('Lỗi kết nối — đã hoàn tác', 'error');
    lock.release(); return;
  }
  showToast('Đã thêm trận đấu nội bộ ⚽');
  lock.release();
}

function populateFundModal() {
  const selM = document.getElementById('fundMember');
  selM.innerHTML = state.members.filter(m => m.status === 'active').map(m => `<option value="${m.name}">${m.name}</option>`).join('');
  document.getElementById('fundAmount').value = 20000;
  document.getElementById('fundNote').value = `Phạt đóng thêm ngày ${new Date().toISOString().split('T')[0]}`;
}

async function saveFund(btn) {
  const member = document.getElementById('fundMember').value;
  const amount = parseInt(document.getElementById('fundAmount').value) || 0;
  const note = document.getElementById('fundNote').value;
  if (!member || !amount) { showToast('Vui lòng điền đầy đủ', 'error'); return; }

  const lock = lockButton(btn || event?.target);
  const timestamp = new Date().toISOString();
  const newPayment = {
    timestamp,
    period: "Phạt thua",
    member,
    amount,
    note,
    periodRaw: "Phạt thua"
  };

  state.fundPayments.push(newPayment);
  save(); renderAll(); closeModal('modalFund');

  const ok = await apiCall('/api/funds', 'POST', newPayment);
  if (!ok && state.apiUrl) {
    state.fundPayments = state.fundPayments.filter(p => p !== newPayment);
    save(); renderAll();
    showToast('Lỗi kết nối — đã hoàn tác', 'error');
    lock.release(); return;
  }
  showToast('Đã ghi nhận đóng phạt 💰');
  lock.release();
}

async function saveMember(btn) {
  const name = document.getElementById('memberName').value.trim();
  if (!name) { showToast('Vui lòng nhập tên', 'error'); return; }
  if (state.members.find(m => m.name === name)) { showToast('Thành viên đã tồn tại', 'error'); return; }

  const lock = lockButton(btn || event?.target);
  const newMember = { name, status: 'active' };
  state.members.push(newMember);
  save(); renderAll(); closeModal('modalMember');

  const ok = await apiCall('/api/members', 'POST', newMember);
  if (!ok && state.apiUrl) {
    state.members = state.members.filter(m => m !== newMember);
    save(); renderAll();
    showToast('Lỗi mạng — đã hoàn tác', 'error');
    lock.release(); return;
  }
  showToast('Đã thêm thành viên 👤');
  lock.release();
}

function openEditMember(name) {
  const m = state.members.find(x => x.name === name);
  if (!m) return;
  document.getElementById('editMemberOriginalName').value = m.name;
  document.getElementById('editMemberName').value = m.name;
  document.getElementById('editMemberStatus').value = m.status || 'active';
  openModal('modalMemberEdit');
}

async function updateMember(btn) {
  const origName = document.getElementById('editMemberOriginalName').value;
  const name = document.getElementById('editMemberName').value.trim();
  const status = document.getElementById('editMemberStatus').value;

  if (!name) return showToast('Vui lòng nhập tên', 'error');
  const m = state.members.find(x => x.name === origName);
  if (!m) return;

  const lock = lockButton(btn || event?.target);
  const prev = { ...m };
  m.name = name; m.status = status;

  // Cascade rename in fund payments
  let renamedFunds = [];
  if (origName !== name) {
    state.fundPayments.forEach(p => {
      if (normName(p.member) === normName(origName)) { renamedFunds.push(p); p.member = name; }
    });
  }
  save(); renderAll(); closeModal('modalMemberEdit');

  const ok = await apiCall('/api/members', 'PUT', { origName, name, status });
  if (!ok && state.apiUrl) {
    Object.assign(m, prev);
    renamedFunds.forEach(p => p.member = origName);
    save(); renderAll();
    showToast('Lỗi mạng — đã hoàn tác', 'error');
    lock.release(); return;
  }
  showToast('Đã cập nhật thành viên 👤');
  lock.release();
}

async function deleteMember(btn) {
  if (!confirm('Bạn có chắc muốn xóa thành viên này?')) return;
  const origName = document.getElementById('editMemberOriginalName').value;
  const lock = lockButton(btn || event?.target);
  const prevMembers = [...state.members];
  state.members = state.members.filter(x => x.name !== origName);
  save(); renderAll(); closeModal('modalMemberEdit');

  const ok = await apiCall('/api/members', 'DELETE', { origName });
  if (!ok && state.apiUrl) {
    state.members = prevMembers;
    save(); renderAll();
    showToast('Lỗi mạng — đã hoàn tác xóa', 'error');
    lock.release(); return;
  }
  showToast('Đã xóa thành viên 🗑️');
  lock.release();
}

function openEditMatch(date) {
  const m = state.matches.find(x => x.date === date);
  if (!m) return;
  document.getElementById('editMatchId').value = m.date; // Use date as identifier for edit
  document.getElementById('editMatchDate').value = m.date;
  document.getElementById('editMatchVenue').value = m.venue || '';
  document.getElementById('editMatchResult').value = m.result || 'Thua';
  document.getElementById('editMatchNote').value = m.note || '';

  const sel = document.querySelector('#modalMatchEdit .result-selector');
  if (sel) {
    sel.querySelectorAll('.result-option').forEach(n => {
      n.classList.toggle('active', n.textContent.trim().startsWith(m.result === 'Thua' ? 'Đá xong' : m.result));
    });
  }
  
  const group = document.getElementById('editLosingTeamGroup');
  if (m.result === 'Thua') {
    group.style.display = 'block';
    populateLosingTeamCheckboxes('editMatchLosingTeamCheckboxes', m.losingTeam || []);
  } else {
    group.style.display = 'none';
  }
  
  openModal('modalMatchEdit');
}

async function updateMatch(btn) {
  const idDate = document.getElementById('editMatchId').value;
  const date = document.getElementById('editMatchDate').value;
  const result = document.getElementById('editMatchResult').value;
  const venue = document.getElementById('editMatchVenue').value.trim();
  const note = document.getElementById('editMatchNote').value.trim();

  if (!date || !result) return showToast('Vui lòng điền ngày và kết quả', 'error');
  const m = state.matches.find(x => x.date === idDate);
  if (!m) return;

  const losingTeam = [];
  if (result === 'Thua') {
    const checkboxes = document.querySelectorAll('#editMatchLosingTeamCheckboxes input[type="checkbox"]:checked');
    checkboxes.forEach(cb => losingTeam.push(cb.value));
    if (losingTeam.length === 0) {
      showToast('Vui lòng chọn ít nhất một thành viên đội thua cuộc', 'error');
      return;
    }
  }

  const lock = lockButton(btn || event?.target);
  const prev = { ...m };
  const prevFunds = [...state.fundPayments];

  // Update match details
  m.date = date; m.result = result; m.venue = venue; m.note = note; m.losingTeam = losingTeam;

  // Recalculate fund payments for this match: remove old, push new
  state.fundPayments = state.fundPayments.filter(p => !p.timestamp.startsWith(idDate));
  if (result === 'Thua') {
    losingTeam.forEach(mem => {
      state.fundPayments.push({
        timestamp: date + " 21:00:00",
        period: "Phạt thua",
        member: mem,
        amount: 20000,
        note: `Phạt trận ngày ${date.split('-').reverse().slice(0, 2).join('/')}`,
        periodRaw: "Phạt thua"
      });
    });
  }

  save(); renderAll(); closeModal('modalMatchEdit');

  const ok = await apiCall('/api/matches', 'PUT', { id: idDate, date, opponent: "Nội bộ", venue, result, note, losingTeam });
  if (!ok && state.apiUrl) {
    Object.assign(m, prev);
    state.fundPayments = prevFunds;
    save(); renderAll();
    showToast('Lỗi kết nối — đã hoàn tác', 'error');
    lock.release(); return;
  }
  showToast('Đã cập nhật trận đấu ⚽');
  lock.release();
}

async function deleteMatch(btn) {
  if (!confirm('Xóa trận đấu này và toàn bộ khoản phạt liên quan?')) return;
  const idDate = document.getElementById('editMatchId').value;
  const lock = lockButton(btn || event?.target);
  const prevMatches = [...state.matches];
  const prevFunds = [...state.fundPayments];

  state.matches = state.matches.filter(x => x.date !== idDate);
  state.fundPayments = state.fundPayments.filter(p => !p.timestamp.startsWith(idDate));

  save(); renderAll(); closeModal('modalMatchEdit');

  const ok = await apiCall('/api/matches', 'DELETE', { id: idDate });
  if (!ok && state.apiUrl) {
    state.matches = prevMatches;
    state.fundPayments = prevFunds;
    save(); renderAll();
    showToast('Lỗi kết nối — đã hoàn tác xóa', 'error');
    lock.release(); return;
  }
  showToast('Đã xóa trận đấu 🗑️');
  lock.release();
}

async function apiCall(endpoint, method, body) {
  if (!state.apiUrl) return { status: 'offline' };
  state.pendingWrites++;
  const ctrl = new AbortController();
  const timeoutId = setTimeout(() => ctrl.abort(), 15000);
  try {
    const url = state.apiUrl + (endpoint.startsWith('/') ? '' : '') + `?endpoint=${encodeURIComponent(endpoint)}`;
    const res = await fetch(url, {
      method: 'POST', // Google Apps Script redirects require POST sometimes
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ method, body }),
      signal: ctrl.signal
    });
    if (!res.ok) return null;
    const data = await res.json().catch(() => ({}));
    return data;
  } catch (e) {
    console.error('API Error:', endpoint, e);
    return null;
  } finally {
    clearTimeout(timeoutId);
    state.pendingWrites = Math.max(0, state.pendingWrites - 1);
  }
}

function lockButton(btn) {
  if (!btn || !btn.tagName) return { release: () => { } };
  const prevDisabled = btn.disabled;
  const prevText = btn.textContent;
  btn.disabled = true;
  btn.dataset._origText = prevText;
  if (!btn.textContent.includes('…')) btn.textContent = '… đang lưu';
  return {
    release: () => {
      btn.disabled = prevDisabled;
      if (btn.dataset._origText !== undefined) {
        btn.textContent = btn.dataset._origText;
        delete btn.dataset._origText;
      }
    }
  };
}

function updateSyncStatus() {
  const dot = document.getElementById('syncDot');
  const text = document.getElementById('syncText');
  if (state.apiUrl) {
    dot.style.background = '#10b981';
    text.textContent = 'Đã kết nối Sheets';
  } else {
    dot.style.background = '#6b7280';
    text.textContent = 'Chạy Offline';
  }
}

function connectApi() {
  const url = document.getElementById('apiUrl').value.trim();
  if (url) {
    localStorage.setItem('fc_api_url', url);
    state.apiUrl = url;
  } else {
    localStorage.removeItem('fc_api_url');
    state.apiUrl = '';
  }
  updateSyncStatus();
  closeModal('modalSetup');
  if (state.apiUrl) {
    syncFromSheet(true);
  }
}

async function syncFromSheet(force = false) {
  if (!state.apiUrl) return;
  if (!force && state.pendingWrites > 0) return;
  
  const ctrl = new AbortController();
  const timeoutId = setTimeout(() => ctrl.abort(), 15000);
  try {
    const res = await fetch(state.apiUrl + '?action=getAll&key=fc_manager_secret_2026', { signal: ctrl.signal });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const data = await res.json();
    
    if (data.members) state.members = data.members;
    if (data.matches) {
      state.matches = data.matches.map(m => {
        if (typeof m.losingTeam === 'string') {
          m.losingTeam = m.losingTeam ? m.losingTeam.split(',').map(s => s.trim()) : [];
        }
        return m;
      });
    }
    if (data.fundPayments) state.fundPayments = data.fundPayments;
    if (data.quarterlyContributions) state.quarterlyContributions = data.quarterlyContributions;
    if (data.expenses) state.expenses = data.expenses;

    state.initialSynced = true;
    save(); renderAll();
    showToast('Đồng bộ thành công ✅');
  } catch (e) {
    console.error('Sync error:', e);
    showToast('Không thể đồng bộ với Google Sheets', 'error');
  } finally {
    clearTimeout(timeoutId);
  }
}

document.querySelectorAll('.modal-overlay').forEach(overlay => {
  overlay.addEventListener('click', e => {
    if (e.target === overlay) overlay.classList.remove('active');
  });
});

document.addEventListener('DOMContentLoaded', init);
