import re

with open('app.js', 'r', encoding='utf-8') as f:
    code = f.read()

# Remove old saveMatch
code = re.sub(r'async function saveMatch\(btn\) \{[\s\S]*?lock\.release\(\);\n\}', '', code)
# Remove old updateMatch
code = re.sub(r'async function updateMatch\(btn\) \{[\s\S]*?lock\.release\(\);\n\}', '', code)
# Remove openEditMatch
code = re.sub(r'function openEditMatch\(date\) \{[\s\S]*?openModal\(\'modalMatchEdit\'\);\n\}', '', code)

# We might want to remove deleteMatch too or just leave it
# For now, let's leave deleteMatch as is.

# Append wizard functions at the end of the file before DOMContentLoaded
wizardCode = """
// --- WIZARD & SCORERS ---
let currentWizardStep = 1;
let wizardMatchData = {};

function openMatchWizard(editDate) {
  currentWizardStep = 1;
  const isEdit = !!editDate;
  
  if (isEdit) {
    const m = state.matches.find(x => x.date === editDate);
    if (!m) return;
    document.getElementById('wizardMatchId').value = m.date;
    document.getElementById('wizardMatchDate').value = m.date;
    document.getElementById('wizardMatchVenue').value = m.venue || '';
    document.getElementById('wizardMatchNote').value = m.note || '';
    
    selectResult(m.result || 'Thua', document.querySelector('#modalMatchWizard .result-option.' + classifyResult(m.result)), 'wizard');
    
    populateMemberCheckboxes('wizardMatchWinningTeamCheckboxes', m.winningTeam || []);
    populateMemberCheckboxes('wizardMatchLosingTeamCheckboxes', m.losingTeam || []);
    populateMemberCheckboxes('wizardMatchDrawTeamCheckboxes', m.playedTeam || []);
    
    wizardMatchData = {
      scoreA: m.scoreA || 0,
      scoreB: m.scoreB || 0,
      scorers: m.scorers ? JSON.parse(JSON.stringify(m.scorers)) : {}
    };
  } else {
    document.getElementById('wizardMatchId').value = '';
    document.getElementById('wizardMatchDate').value = new Date().toISOString().split('T')[0];
    document.getElementById('wizardMatchVenue').value = '';
    document.getElementById('wizardMatchNote').value = '';
    
    selectResult('Thua', document.querySelector('#modalMatchWizard .result-option.lose'), 'wizard');
    
    populateMemberCheckboxes('wizardMatchWinningTeamCheckboxes', []);
    populateMemberCheckboxes('wizardMatchLosingTeamCheckboxes', []);
    populateMemberCheckboxes('wizardMatchDrawTeamCheckboxes', []);
    
    wizardMatchData = { scoreA: 0, scoreB: 0, scorers: {} };
  }
  
  updateWizardUI();
  wizardGoStep(1);
  openModal('modalMatchWizard');
}

function wizardGoStep(n) {
  currentWizardStep = n;
  document.querySelectorAll('.wizard-step-panel').forEach((p, i) => {
    p.classList.toggle('active', i + 1 === n);
  });
  document.querySelectorAll('#wizardSteps .step-dot').forEach((d, i) => {
    d.classList.toggle('active', i + 1 <= n);
  });
  
  if (n === 2) {
    const winTeam = Array.from(document.querySelectorAll('#wizardMatchWinningTeamCheckboxes input:checked')).map(i => i.value);
    const loseTeam = Array.from(document.querySelectorAll('#wizardMatchLosingTeamCheckboxes input:checked')).map(i => i.value);
    document.getElementById('wizardCountWin').textContent = winTeam.length + ' người';
    document.getElementById('wizardCountLose').textContent = loseTeam.length + ' người';
  }
  
  if (n === 3) {
    renderWizardScorers();
  }
}

function adjustScore(side, delta) {
  const key = 'score' + side;
  wizardMatchData[key] = Math.max(0, (wizardMatchData[key] || 0) + delta);
  updateWizardUI();
}

function adjustGoal(name, delta) {
  const current = wizardMatchData.scorers[name] || 0;
  wizardMatchData.scorers[name] = Math.max(0, current + delta);
  renderWizardScorers();
}

function updateWizardUI() {
  document.getElementById('wizardScoreA').textContent = wizardMatchData.scoreA || 0;
  document.getElementById('wizardScoreB').textContent = wizardMatchData.scoreB || 0;
}

function renderWizardScorers() {
  const winTeam = Array.from(document.querySelectorAll('#wizardMatchWinningTeamCheckboxes input:checked')).map(i => i.value);
  const loseTeam = Array.from(document.querySelectorAll('#wizardMatchLosingTeamCheckboxes input:checked')).map(i => i.value);
  
  let winSum = 0;
  let loseSum = 0;
  
  const buildList = (team, side) => {
    return team.map(name => {
      const g = wizardMatchData.scorers[name] || 0;
      if (side === 'A') winSum += g; else loseSum += g;
      return `<div class="scorer-row">
        <div class="name">${name}</div>
        <div class="controls">
          <button class="score-btn" onclick="adjustGoal('${name.replace(/'/g, "\\'")}', -1)">−</button>
          <span class="val">${g}</span>
          <button class="score-btn" onclick="adjustGoal('${name.replace(/'/g, "\\'")}', 1)">+</button>
        </div>
      </div>`;
    }).join('');
  };
  
  document.getElementById('scorerListWin').innerHTML = buildList(winTeam, 'A');
  document.getElementById('scorerListLose').innerHTML = buildList(loseTeam, 'B');
  
  const scoreA = wizardMatchData.scoreA || 0;
  const scoreB = wizardMatchData.scoreB || 0;
  
  const pw = document.getElementById('progressWin');
  pw.textContent = `Đã ghi: ${winSum}/${scoreA} bàn`;
  pw.className = `scorer-progress ${winSum === scoreA ? 'valid' : winSum > scoreA ? 'invalid' : ''}`;
  
  const pl = document.getElementById('progressLose');
  pl.textContent = `Đã ghi: ${loseSum}/${scoreB} bàn`;
  pl.className = `scorer-progress ${loseSum === scoreB ? 'valid' : loseSum > scoreB ? 'invalid' : ''}`;
}

function wizardValidateAndNext() {
  const result = document.getElementById('wizardMatchResult').value;
  
  if (currentWizardStep === 1) {
    if (result === 'Thua') {
      const wCount = document.querySelectorAll('#wizardMatchWinningTeamCheckboxes input:checked').length;
      const lCount = document.querySelectorAll('#wizardMatchLosingTeamCheckboxes input:checked').length;
      if (wCount === 0 || lCount === 0) return showToast('Chọn đủ đội thắng và thua', 'error');
      wizardGoStep(2);
    } else if (result === 'Hòa') {
      const dCount = document.querySelectorAll('#wizardMatchDrawTeamCheckboxes input:checked').length;
      if (dCount === 0) return showToast('Chọn thành viên tham gia', 'error');
      wizardSave();
    } else {
      wizardSave();
    }
  } else if (currentWizardStep === 2) {
    const a = wizardMatchData.scoreA || 0;
    const b = wizardMatchData.scoreB || 0;
    if (a <= b) return showToast('Điểm đội thắng phải > đội thua', 'error');
    wizardGoStep(3);
  }
}

function wizardBack() {
  if (currentWizardStep > 1) wizardGoStep(currentWizardStep - 1);
}

function wizardSkipScorers() {
  wizardMatchData.scorers = {};
  wizardSave();
}

async function wizardSave(btn) {
  const idDate = document.getElementById('wizardMatchId').value;
  const isEdit = !!idDate;
  const date = document.getElementById('wizardMatchDate').value;
  const result = document.getElementById('wizardMatchResult').value;
  const venue = document.getElementById('wizardMatchVenue').value.trim();
  const note = document.getElementById('wizardMatchNote').value.trim();
  
  if (!date) return showToast('Vui lòng chọn ngày', 'error');
  if (!isEdit && state.matches.some(m => m.date === date)) {
    return showToast('Đã có trận vào ngày này', 'error');
  }

  const winningTeam = [];
  const losingTeam = [];
  const playedTeam = [];
  
  if (result === 'Thua') {
    document.querySelectorAll('#wizardMatchWinningTeamCheckboxes input:checked').forEach(cb => winningTeam.push(cb.value));
    document.querySelectorAll('#wizardMatchLosingTeamCheckboxes input:checked').forEach(cb => losingTeam.push(cb.value));
    playedTeam.push(...winningTeam, ...losingTeam);
  } else if (result === 'Hòa') {
    document.querySelectorAll('#wizardMatchDrawTeamCheckboxes input:checked').forEach(cb => playedTeam.push(cb.value));
  }
  
  const scoreA = result === 'Thua' ? (wizardMatchData.scoreA || 0) : null;
  const scoreB = result === 'Thua' ? (wizardMatchData.scoreB || 0) : null;
  const scorers = result === 'Thua' ? (wizardMatchData.scorers || {}) : {};

  const lock = lockButton(btn || event?.target);
  const prevMatches = [...state.matches];
  const prevFunds = [...state.fundPayments];
  
  let m;
  if (isEdit) {
    m = state.matches.find(x => x.date === idDate);
    if (!m) { lock.release(); return; }
    state.fundPayments = state.fundPayments.filter(p => !p.timestamp.startsWith(idDate));
  } else {
    m = { timestamp: new Date().toISOString() };
    state.matches.push(m);
  }
  
  m.date = date; 
  m.opponent = "Nội bộ";
  m.venue = venue; 
  m.result = result; 
  m.note = note; 
  m.losingTeam = losingTeam;
  m.winningTeam = winningTeam;
  m.playedTeam = playedTeam;
  m.scoreA = scoreA;
  m.scoreB = scoreB;
  m.scorers = scorers;

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

  save(); renderAll(); closeModal('modalMatchWizard');
  showToast(isEdit ? 'Đã cập nhật trận đấu ⚽' : 'Đã lưu trận đấu ⚽');
  
  if (state.apiUrl) {
    const ok = await apiCall('/api/matches', isEdit ? 'PUT' : 'POST', m);
    if (!ok) {
      state.matches = prevMatches;
      state.fundPayments = prevFunds;
      save(); renderAll();
      showToast('Lỗi kết nối — đã hoàn tác', 'error');
    }
  }
  lock.release();
}

function renderTopScorers() {
  const card = document.getElementById('topScorerCard');
  if (!card) return;
  
  const stats = {};
  state.matches.forEach(m => {
    if (m.result === 'Thua' && m.scorers) {
      Object.entries(m.scorers).forEach(([name, goals]) => {
        if (goals > 0) {
          if (!stats[name]) stats[name] = { goals: 0, matches: 0 };
          stats[name].goals += goals;
          stats[name].matches += 1;
        }
      });
    }
  });
  
  const entries = Object.entries(stats).sort((a, b) => b[1].goals - a[1].goals);
  
  if (entries.length === 0) {
    card.style.display = 'none';
    return;
  }
  
  card.style.display = 'block';
  const medals = ['🥇', '🥈', '🥉'];
  
  document.getElementById('topScorerList').innerHTML = entries.map((e, idx) => {
    const rank = idx < 3 ? medals[idx] : (idx + 1);
    return `<div class="top-scorer-row">
      <div class="rank">${rank}</div>
      <div class="info">
        <div class="name">${e[0]}</div>
        <div class="matches">${e[1].matches} trận ghi bàn</div>
      </div>
      <div class="goals">${e[1].goals}</div>
    </div>`;
  }).join('');
}
"""

code = code.replace("document.addEventListener('DOMContentLoaded', init);", wizardCode + "\n\ndocument.addEventListener('DOMContentLoaded', init);")

with open('app.js', 'w', encoding='utf-8') as f:
    f.write(code)
