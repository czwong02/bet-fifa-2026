/** WC 2026 Bet Calculator — multi-match, percentages */

const TEAMS = [
  'Argentina', 'Australia', 'Belgium', 'Brazil', 'Canada', 'Colombia',
  'Croatia', 'England', 'France', 'Germany', 'Italy', 'Japan',
  'Mexico', 'Morocco', 'Netherlands', 'Portugal', 'Qatar', 'Saudi Arabia',
  'Senegal', 'South Korea', 'Spain', 'Switzerland', 'USA', 'Uruguay',
];

const DEFAULT_ODDS = { home: 2.10, draw: 3.40, away: 3.50 };

/** @typedef {{ id: string, name: string, contribution: number }} GroupMember */

const STRATEGY_HINTS = {
  manual: () => strategyHint('manual'),
  dutch: () => strategyHint('dutch'),
  target: () => strategyHint('target'),
  cover: () => strategyHint('cover'),
  arbitrage: () => strategyHint('arbitrage'),
};

/** @typedef {{ id: string, home: number, away: number, odds: number, stake: number }} ScoreLine */
/** @typedef {{ id: string, homeTeam: string, awayTeam: string, budget: number, poolAllocPct: number, strategy: string, scoreLines: ScoreLine[], outcomeSnap: object, collapsed: boolean }} MatchState */

/** @type {MatchState[]} */
let matches = [];

/** @type {GroupMember[]} */
let groupMembers = [];

const $ = (id) => document.getElementById(id);

/** @type {Array<object>|null} */
let lastResults = null;

function init() {
  if (!matches.length) matches.push(createMatch(0, 1));
  document.querySelectorAll('.lang-btn').forEach((btn) => {
    btn.addEventListener('click', () => setLang(btn.dataset.lang));
    btn.classList.toggle('active', btn.dataset.lang === currentLang);
  });
  renderGroupList();
  renderAll();
  bindEvents();
}

function onLangChange() {
  renderGroupList();
  renderAll();
  if (lastResults) {
    renderMatchResults(lastResults);
    renderCombinedResults(lastResults);
  }
}

window.onLangChange = onLangChange;

function createMatch(homeIdx, awayIdx) {
  return {
    id: `m-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    homeTeam: TEAMS[homeIdx] ?? TEAMS[0],
    awayTeam: TEAMS[awayIdx] ?? TEAMS[1],
    budget: 100,
    poolAllocPct: 100,
    strategy: 'manual',
    scoreLines: [],
    outcomeSnap: {},
    collapsed: false,
  };
}

function bindEvents() {
  $('openGuide').addEventListener('click', () => openGuide(true));
  $('closeGuide').addEventListener('click', () => openGuide(false));
  $('guideOverlay').addEventListener('click', (e) => {
    if (e.target === $('guideOverlay')) openGuide(false);
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !$('guideOverlay').classList.contains('hidden')) openGuide(false);
  });

  $('addMatch').addEventListener('click', () => {
    matches.push(createMatch(matches.length, matches.length + 1));
    if (useGroupPool()) rebalancePoolAllocEqual();
    renderAll();
  });
  $('calculate').addEventListener('click', calculateAll);
  $('reset').addEventListener('click', resetAll);

  $('saveMember').addEventListener('click', addMember);
  $('addMember').addEventListener('click', () => $('memberName').focus());
  $('memberName').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') addMember();
  });
  $('groupList').addEventListener('click', (e) => {
    const rm = e.target.closest('[data-rm-member]');
    if (rm) {
      groupMembers = groupMembers.filter((m) => m.id !== rm.dataset.rmMember);
      renderGroupList();
      renderAll();
      $('groupResults').classList.add('hidden');
    }
  });

  $('matchList').addEventListener('click', (e) => {
    const toggle = e.target.closest('[data-toggle-match]');
    if (toggle) {
      const m = matches.find((x) => x.id === toggle.dataset.toggleMatch);
      const card = document.querySelector(`[data-match-id="${toggle.dataset.toggleMatch}"]`);
      if (!m || !card) return;
      m.collapsed = !m.collapsed;
      card.classList.toggle('collapsed', m.collapsed);
      toggle.setAttribute('aria-expanded', String(!m.collapsed));
      return;
    }
    const rm = e.target.closest('[data-remove-match]');
    if (rm) {
      if (matches.length <= 1) return alert(t('errKeepOne'));
      matches = matches.filter((m) => m.id !== rm.dataset.removeMatch);
      if (useGroupPool()) rebalancePoolAllocEqual();
      renderAll();
      $('combinedResults').classList.add('hidden');
      $('groupResults').classList.add('hidden');
      $('matchResults').innerHTML = '';
      return;
    }
    const addScore = e.target.closest('[data-add-score]');
    if (addScore) addScoreLine(addScore.dataset.addScore);
  });

  $('matchList').addEventListener('change', (e) => {
    const row = e.target.closest('.outcome-row');
    if (e.target.type === 'checkbox' && row) {
      row.classList.toggle('active', e.target.checked);
      return;
    }
    const card = e.target.closest('.match-card');
    if (!card) return;
    const m = matches.find((x) => x.id === card.dataset.matchId);
    if (!m) return;
    if (e.target.classList.contains('match-home')) {
      m.homeTeam = e.target.value;
      updateMatchLabels(card, m);
    }
    if (e.target.classList.contains('match-away')) {
      m.awayTeam = e.target.value;
      updateMatchLabels(card, m);
    }
    if (e.target.classList.contains('match-budget') && !useGroupPool()) {
      m.budget = parseFloat(e.target.value) || 0;
    }
    if (e.target.classList.contains('match-strategy')) {
      m.strategy = e.target.value;
      card.querySelector('.strategy-hint').textContent = STRATEGY_HINTS[m.strategy]?.() || '';
      if (m.strategy === 'cover' || m.strategy === 'arbitrage') {
        card.querySelectorAll('[data-outcome="res-home"],[data-outcome="res-draw"],[data-outcome="res-away"]').forEach((cb) => {
          cb.checked = true;
          cb.closest('.outcome-row')?.classList.add('active');
        });
      }
    }
  });

  $('matchList').addEventListener('input', (e) => {
    const card = e.target.closest('.match-card');
    if (!card) return;
    const m = matches.find((x) => x.id === card.dataset.matchId);
    if (!m) return;
    if (e.target.classList.contains('match-pool-alloc')) {
      m.poolAllocPct = parseFloat(e.target.value) || 0;
      updateMatchPoolBudget(card, m);
      renderPoolAllocSummary();
      return;
    }
    const scoreId = e.target.dataset.scoreOdds || e.target.dataset.scoreStake;
    if (scoreId) {
      const line = m.scoreLines.find((s) => s.id === scoreId);
      if (!line) return;
      if (e.target.dataset.scoreOdds) line.odds = parseFloat(e.target.value) || line.odds;
      if (e.target.dataset.scoreStake) line.stake = parseFloat(e.target.value) || 0;
    }
  });
}

function addMember() {
  const name = $('memberName').value.trim();
  const contribution = parseFloat($('memberContrib').value);
  if (!name) return alert(t('errMemberName'));
  if (!contribution || contribution <= 0) return alert(t('errMemberContrib'));
  groupMembers.push({ id: `g-${Date.now()}`, name, contribution });
  $('memberName').value = '';
  if (groupMembers.length === 1 || Math.abs(totalPoolAlloc() - 100) > 0.01) rebalancePoolAllocEqual();
  renderGroupList();
  renderAll();
}

function useGroupPool() {
  return poolTotal() > 0;
}

function totalPoolAlloc() {
  return matches.reduce((s, m) => s + (m.poolAllocPct || 0), 0);
}

function matchBudget(m) {
  if (useGroupPool()) return poolTotal() * (m.poolAllocPct || 0) / 100;
  return m.budget;
}

function rebalancePoolAllocEqual() {
  const n = matches.length;
  if (n < 1) return;
  const each = Math.floor((100 / n) * 100) / 100;
  matches.forEach((m, i) => {
    m.poolAllocPct = i === n - 1 ? +(100 - each * (n - 1)).toFixed(2) : each;
  });
}

function updateMatchPoolBudget(card, m) {
  const out = card.querySelector('.match-budget-computed');
  if (out) out.textContent = fmt(matchBudget(m));
}

function renderPoolAllocSummary() {
  const el = $('poolAllocSummary');
  if (!el) return;
  if (!useGroupPool()) {
    el.classList.add('hidden');
    return;
  }
  const sum = totalPoolAlloc();
  const ok = Math.abs(sum - 100) < 0.01;
  el.classList.remove('hidden');
  el.innerHTML = `<div class="alloc-summary ${ok ? '' : 'alloc-warn'}">
    <span>${t('allocatedTotal')}: <strong>${sum.toFixed(2)}%</strong> / 100%</span>
    ${ok ? '' : `<span class="alloc-warn-msg">${t('errAllocNot100', { sum: sum.toFixed(2) })}</span>`}
  </div>`;
}

function poolTotal() {
  return groupMembers.reduce((s, m) => s + m.contribution, 0);
}

function renderGroupList() {
  const el = $('groupList');
  const summary = $('groupSummary');
  if (!groupMembers.length) {
    el.innerHTML = `<p class="hint group-empty">${t('noMembers')}</p>`;
    summary.classList.add('hidden');
    return;
  }
  const pool = poolTotal();
  el.innerHTML = groupMembers.map((m) =>
    `<div class="group-row">
      <span class="group-name"><strong>${escapeHtml(m.name)}</strong></span>
      <span class="group-contrib">${fmt(m.contribution)}</span>
      <span class="group-pct">${pct(m.contribution / pool)}</span>
      <button type="button" class="btn btn-ghost btn-sm" data-rm-member="${m.id}" aria-label="${t('removeMember')}">${t('remove')}</button>
    </div>`
  ).join('');
  summary.classList.remove('hidden');
  summary.innerHTML = `
    <div class="stat"><div class="stat-label">${t('members')}</div><div class="stat-value">${groupMembers.length}</div></div>
    <div class="stat"><div class="stat-label">${t('totalPool')}</div><div class="stat-value">${fmt(pool)}</div></div>`;
  renderPoolAllocSummary();
}

function escapeHtml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function openGuide(show) {
  $('guideOverlay').classList.toggle('hidden', !show);
  $('guideOverlay').setAttribute('aria-hidden', String(!show));
  document.body.classList.toggle('guide-open', show);
}

function matchOutcomeLabels(m) {
  return {
    'res-home': t('homeWin', { team: m.homeTeam }),
    'res-draw': t('draw'),
    'res-away': t('awayWin', { team: m.awayTeam }),
  };
}

function updateMatchLabels(card, m) {
  for (const [key, text] of Object.entries(matchOutcomeLabels(m))) {
    const lbl = card.querySelector(`[data-label="${key}"]`);
    if (lbl) lbl.textContent = text;
  }
  const title = card.querySelector('.match-title');
  if (title) title.textContent = `${m.homeTeam} vs ${m.awayTeam}`;
  const prefix = card.querySelector('.match-prefix');
  if (prefix) prefix.textContent = t('matchN', { n: matches.indexOf(m) + 1 });
}

function snapshotMatch(card) {
  const snap = {};
  card.querySelectorAll('.outcome-row[data-outcome]').forEach((row) => {
    const id = row.dataset.outcome;
    snap[id] = {
      checked: row.querySelector('input[type=checkbox]')?.checked ?? false,
      odds: row.querySelector('[data-odds]')?.value ?? '',
      stake: row.querySelector('[data-stake]')?.value ?? '',
    };
  });
  return snap;
}

function renderAll() {
  // ponytail: snapshot state before re-render so collapse survives DOM rebuild
  matches.forEach((m) => {
    const card = document.querySelector(`[data-match-id="${m.id}"]`);
    if (card) {
      m.outcomeSnap = snapshotMatch(card);
      m.collapsed = card.classList.contains('collapsed');
      const allocInp = card.querySelector('.match-pool-alloc');
      if (allocInp) m.poolAllocPct = parseFloat(allocInp.value) || m.poolAllocPct;
      const budgetInp = card.querySelector('.match-budget');
      if (budgetInp && !useGroupPool()) m.budget = parseFloat(budgetInp.value) || m.budget;
    }
  });

  $('matchList').innerHTML = matches.map((m, i) => matchCardHtml(m, i)).join('');
  matches.forEach((m) => {
    const card = document.querySelector(`[data-match-id="${m.id}"]`);
    if (!card) return;
    restoreSnap(card, m.outcomeSnap);
    renderScoreList(card, m);
    card.querySelector('.strategy-hint').textContent = STRATEGY_HINTS[m.strategy]?.() || '';
    updateMatchLabels(card, m);
    if (useGroupPool()) updateMatchPoolBudget(card, m);
  });
  renderPoolAllocSummary();
}

function restoreSnap(card, snap) {
  for (const [id, s] of Object.entries(snap)) {
    const row = card.querySelector(`.outcome-row[data-outcome="${id}"]`);
    if (!row) continue;
    const cb = row.querySelector('input[type=checkbox]');
    const odds = row.querySelector('[data-odds]');
    const stake = row.querySelector('[data-stake]');
    if (cb) { cb.checked = s.checked; row.classList.toggle('active', s.checked); }
    if (odds && s.odds) odds.value = s.odds;
    if (stake && s.stake !== '') stake.value = s.stake;
  }
}

function teamOptions(selected) {
  return TEAMS.map((t) => `<option value="${t}"${t === selected ? ' selected' : ''}>${t}</option>`).join('');
}

function outcomeRow(outcomeKey, label, defaultOdds, snap) {
  const odds = snap?.odds || defaultOdds.toFixed(2);
  const stake = snap?.stake ?? '';
  return `<div class="outcome-row" data-outcome="${outcomeKey}">
    <label><input type="checkbox" data-outcome="${outcomeKey}"> <span data-label="${outcomeKey}">${label}</span></label>
    <span class="outcome-tag"></span>
    <input type="number" data-odds min="1.01" step="0.01" value="${odds}" aria-label="${t('odds')}">
    <input type="number" data-stake min="0" step="0.01" value="${stake}" placeholder="0" aria-label="${t('stake')}">
  </div>`;
}

function matchCardHtml(m, index) {
  const snap = m.outcomeSnap;
  const collapsed = m.collapsed ? ' collapsed' : '';
  const expanded = !m.collapsed;
  const labels = matchOutcomeLabels(m);
  const poolMode = useGroupPool();
  const budgetRow = poolMode
    ? `<div class="field-row">
      <label class="field"><span>${t('poolAllocPct')}</span>
        <input type="number" class="match-pool-alloc" min="0" max="100" step="0.01" value="${m.poolAllocPct ?? 0}">
      </label>
      <label class="field"><span>${t('budgetFromPool')}</span>
        <output class="match-budget-computed">${fmt(matchBudget(m))}</output>
      </label>
      <label class="field"><span>${t('strategy')}</span>
        <select class="match-strategy">
          <option value="manual"${m.strategy === 'manual' ? ' selected' : ''}>${t('stratManual')}</option>
          <option value="dutch"${m.strategy === 'dutch' ? ' selected' : ''}>${t('stratDutch')}</option>
          <option value="target"${m.strategy === 'target' ? ' selected' : ''}>${t('stratTarget')}</option>
          <option value="cover"${m.strategy === 'cover' ? ' selected' : ''}>${t('stratCover')}</option>
          <option value="arbitrage"${m.strategy === 'arbitrage' ? ' selected' : ''}>${t('stratArbitrage')}</option>
        </select>
      </label>
    </div>
    <p class="hint pool-alloc-hint">${t('poolAllocHint')}</p>`
    : `<div class="field-row">
      <label class="field"><span>${t('budget')}</span><input type="number" class="match-budget" min="0" step="0.01" value="${m.budget}"></label>
      <label class="field"><span>${t('strategy')}</span>
        <select class="match-strategy">
          <option value="manual"${m.strategy === 'manual' ? ' selected' : ''}>${t('stratManual')}</option>
          <option value="dutch"${m.strategy === 'dutch' ? ' selected' : ''}>${t('stratDutch')}</option>
          <option value="target"${m.strategy === 'target' ? ' selected' : ''}>${t('stratTarget')}</option>
          <option value="cover"${m.strategy === 'cover' ? ' selected' : ''}>${t('stratCover')}</option>
          <option value="arbitrage"${m.strategy === 'arbitrage' ? ' selected' : ''}>${t('stratArbitrage')}</option>
        </select>
      </label>
    </div>`;
  return `<article class="card card-wide match-card${collapsed}" data-match-id="${m.id}">
    <div class="match-header">
      <button type="button" class="match-toggle" data-toggle-match="${m.id}" aria-expanded="${expanded}">
        <span class="chevron" aria-hidden="true"></span>
        <span class="match-toggle-text"><span class="match-prefix">${t('matchN', { n: index + 1 })}</span> <span class="match-title">${m.homeTeam} vs ${m.awayTeam}</span></span>
      </button>
      ${matches.length > 1 ? `<button type="button" class="btn btn-ghost btn-sm" data-remove-match="${m.id}">${t('remove')}</button>` : ''}
    </div>
    <div class="match-body">
    <div class="field-row">
      <label class="field"><span>${t('home')}</span><select class="match-home">${teamOptions(m.homeTeam)}</select></label>
      <span class="vs">vs</span>
      <label class="field"><span>${t('away')}</span><select class="match-away">${teamOptions(m.awayTeam)}</select></label>
    </div>
    ${budgetRow}
    <p class="hint strategy-hint"></p>

    <h3 class="section-title">${t('matchResult')}</h3>
    <div class="outcome-header"><span></span><span></span><span>${t('odds')}</span><span>${t('stake')}</span></div>
    <div class="outcomes">
      ${outcomeRow('res-home', labels['res-home'], DEFAULT_ODDS.home, snap['res-home'])}
      ${outcomeRow('res-draw', labels['res-draw'], DEFAULT_ODDS.draw, snap['res-draw'])}
      ${outcomeRow('res-away', labels['res-away'], DEFAULT_ODDS.away, snap['res-away'])}
    </div>

    <h3 class="section-title">${t('correctScore')}</h3>
    <div class="score-add">
      <label class="field field-sm"><span>${t('home')}</span><input type="number" class="score-home-inp" min="0" max="9" value="1"></label>
      <span class="score-sep">–</span>
      <label class="field field-sm"><span>${t('away')}</span><input type="number" class="score-away-inp" min="0" max="9" value="0"></label>
      <label class="field field-sm"><span>${t('odds')}</span><input type="number" class="score-odds-inp" min="1.01" step="0.01" value="7.50"></label>
      <label class="field field-sm"><span>${t('stake')}</span><input type="number" class="score-stake-inp" min="0" step="0.01" value="10"></label>
      <button type="button" class="btn btn-secondary" data-add-score="${m.id}">${t('addScore')}</button>
    </div>
    <div class="score-list" data-score-list="${m.id}"></div>
    </div>
  </article>`;
}

function addScoreLine(matchId) {
  const m = matches.find((x) => x.id === matchId);
  const card = document.querySelector(`[data-match-id="${matchId}"]`);
  if (!m || !card) return;
  const h = parseInt(card.querySelector('.score-home-inp').value, 10);
  const a = parseInt(card.querySelector('.score-away-inp').value, 10);
  const odds = parseFloat(card.querySelector('.score-odds-inp').value);
  const stake = parseFloat(card.querySelector('.score-stake-inp').value) || 0;
  if (isNaN(h) || isNaN(a) || h < 0 || a < 0) return alert(t('errValidScores'));
  if (!odds || odds < 1.01) return alert(t('errMinOdds'));
  m.scoreLines.push({ id: `score-${h}-${a}-${Date.now()}`, home: h, away: a, odds, stake });
  renderScoreList(card, m);
}

function renderScoreList(card, m) {
  const el = card.querySelector(`[data-score-list="${m.id}"]`);
  el.innerHTML = m.scoreLines.map((s) =>
    `<div class="score-row">
      <span><strong>${s.home}–${s.away}</strong></span>
      <input type="number" data-score-odds="${s.id}" min="1.01" step="0.01" value="${s.odds.toFixed(2)}">
      <input type="number" data-score-stake="${s.id}" min="0" step="0.01" value="${s.stake > 0 ? s.stake : ''}" placeholder="0">
      <button type="button" class="score-rm" data-score-rm="${s.id}">×</button>
    </div>`
  ).join('');
  el.querySelectorAll('[data-score-rm]').forEach((btn) => {
    btn.addEventListener('click', () => {
      m.scoreLines = m.scoreLines.filter((s) => s.id !== btn.dataset.scoreRm);
      renderScoreList(card, m);
    });
  });
}

function readStake(row) {
  const v = parseFloat(row.querySelector('[data-stake]')?.value);
  return v > 0 ? v : 0;
}

function collectBets(card, home, away, scoreLines) {
  const map = {
    'res-home': { type: '1x2', key: 'home', label: t('homeWin', { team: home }) },
    'res-draw': { type: '1x2', key: 'draw', label: t('draw') },
    'res-away': { type: '1x2', key: 'away', label: t('awayWin', { team: away }) },
  };
  /** @type {Array<{id:string,label:string,type:string,key:string,odds:number,stake:number,active:boolean,home?:number,away?:number}>} */
  const bets = [];
  for (const [key, meta] of Object.entries(map)) {
    const row = card.querySelector(`.outcome-row[data-outcome="${key}"]`);
    if (!row?.querySelector('input[type=checkbox]')?.checked) continue;
    const odds = parseFloat(row.querySelector('[data-odds]')?.value);
    if (!odds || odds < 1.01) continue;
    bets.push({ id: key, label: meta.label, type: meta.type, key: meta.key, odds, stake: readStake(row), active: true });
  }
  for (const s of scoreLines) {
    const oddsInp = card.querySelector(`[data-score-odds="${s.id}"]`);
    const stakeInp = card.querySelector(`[data-score-stake="${s.id}"]`);
    bets.push({
      id: s.id,
      label: t('scoreLine', { home: s.home, away: s.away }),
      type: 'score',
      key: `score:${s.home}-${s.away}`,
      home: s.home,
      away: s.away,
      odds: parseFloat(oddsInp?.value) || s.odds,
      stake: parseFloat(stakeInp?.value) || s.stake || 0,
      active: true,
    });
  }
  return bets;
}

function applyStakes(card, bets, scoreLines) {
  for (const b of bets) {
    if (b.type === 'score') {
      const inp = card.querySelector(`[data-score-stake="${b.id}"]`);
      if (inp) inp.value = b.stake.toFixed(2);
      const line = scoreLines.find((s) => s.id === b.id);
      if (line) line.stake = b.stake;
    } else {
      const row = card.querySelector(`.outcome-row[data-outcome="${b.id}"]`);
      const inp = row?.querySelector('[data-stake]');
      if (inp) inp.value = b.stake.toFixed(2);
    }
  }
}

function dutchStakes(bets, budget) {
  const inv = bets.map((b) => 1 / b.odds);
  const totalInv = inv.reduce((a, b) => a + b, 0);
  return bets.map((b, i) => ({ ...b, stake: budget * (inv[i] / totalInv) }));
}

function arbitrageStakes(homeOdds, drawOdds, awayOdds, budget) {
  const inv = [1 / homeOdds, 1 / drawOdds, 1 / awayOdds];
  const totalInv = inv.reduce((a, b) => a + b, 0);
  const stakes = inv.map((v) => budget * (v / totalInv));
  return { stakes, totalInv, guaranteedReturn: budget / totalInv, profit: budget / totalInv - budget };
}

function betWins(bet, result) {
  const { homeGoals, awayGoals, outcome } = result;
  if (bet.type === '1x2') return bet.key === outcome;
  if (bet.type === 'score') return homeGoals === bet.home && awayGoals === bet.away;
  return false;
}

function netPL(bets, result) {
  const totalStake = bets.reduce((s, b) => s + b.stake, 0);
  let returns = 0;
  for (const b of bets) if (betWins(b, result)) returns += b.stake * b.odds;
  return returns - totalStake;
}

function buildScenarios(bets, home, away) {
  const scenarios = [
    { label: t('homeWin', { team: home }), outcome: 'home', homeGoals: 1, awayGoals: 0, cls: 'win-scenario' },
    { label: t('draw'), outcome: 'draw', homeGoals: 1, awayGoals: 1, cls: 'draw-scenario' },
    { label: t('awayWin', { team: away }), outcome: 'away', homeGoals: 0, awayGoals: 1, cls: 'lose-scenario' },
  ];
  for (const b of bets.filter((x) => x.type === 'score')) {
    scenarios.push({
      label: t('scoreLine', { home: b.home, away: b.away }),
      outcome: b.home > b.away ? 'home' : b.home < b.away ? 'away' : 'draw',
      homeGoals: b.home,
      awayGoals: b.away,
      cls: 'win-scenario',
    });
  }
  return scenarios.map((sc) => ({ ...sc, pl: netPL(bets, sc) }));
}

function fmt(n) { return '$' + n.toFixed(2); }
function pct(n) { return (n * 100).toFixed(2) + '%'; }
function roi(profit, stake) { return stake > 0 ? profit / stake : 0; }
function implied(odds) { return 1 / odds; }

function stratLabel(key) {
  return t(`strat${key.charAt(0).toUpperCase()}${key.slice(1)}`);
}

function resolveMatchBets(m, card) {
  m.outcomeSnap = snapshotMatch(card);
  const allocInp = card.querySelector('.match-pool-alloc');
  if (allocInp) m.poolAllocPct = parseFloat(allocInp.value) || 0;
  if (!useGroupPool()) {
    m.budget = parseFloat(card.querySelector('.match-budget')?.value) || m.budget;
  }
  const budget = matchBudget(m);
  m.strategy = card.querySelector('.match-strategy')?.value || m.strategy;
  let bets = collectBets(card, m.homeTeam, m.awayTeam, m.scoreLines);
  const ctx = { home: m.homeTeam, away: m.awayTeam };

  if (m.strategy === 'manual') {
    bets = bets.filter((b) => b.stake > 0);
    if (!bets.length) return null;
  } else {
    if (!budget || budget <= 0) return { error: t('errNeedBudget', ctx) };
    if ((m.strategy === 'cover' || m.strategy === 'arbitrage') && bets.filter((b) => b.type === '1x2').length < 3) {
      return { error: t('errNeed1x2Cover', { ...ctx, strategy: stratLabel(m.strategy) }) };
    }
    if (m.strategy === 'target') {
      const primary = bets.find((b) => b.type === '1x2');
      if (!primary) return { error: t('errNeed1x2Target', ctx) };
      bets = [{ ...primary, stake: budget }];
    } else if (m.strategy === 'arbitrage') {
      const x2 = bets.filter((b) => b.type === '1x2');
      const arb = arbitrageStakes(
        x2.find((b) => b.key === 'home').odds,
        x2.find((b) => b.key === 'draw').odds,
        x2.find((b) => b.key === 'away').odds,
        budget
      );
      bets = x2.map((b, i) => ({ ...b, stake: arb.stakes[i] }));
    } else {
      if (!bets.length) return { error: t('errNeedBet', ctx) };
      bets = dutchStakes(bets, budget);
    }
    applyStakes(card, bets, m.scoreLines);
  }
  return { bets };
}

function calculateAll() {
  if (useGroupPool()) {
    const sum = totalPoolAlloc();
    if (Math.abs(sum - 100) > 0.01) return alert(t('errAllocNot100', { sum: sum.toFixed(2) }));
  }
  const results = [];
  for (const m of matches) {
    const card = document.querySelector(`[data-match-id="${m.id}"]`);
    const resolved = resolveMatchBets(m, card);
    if (resolved?.error) return alert(resolved.error);
    if (!resolved) return alert(t('errNeedStake', { home: m.homeTeam, away: m.awayTeam }));
    const { bets } = resolved;
    const totalStake = bets.reduce((s, b) => s + b.stake, 0);
    const scenarios = buildScenarios(bets, m.homeTeam, m.awayTeam);
    const pls = scenarios.map((s) => s.pl);
    results.push({
      match: m,
      bets,
      totalStake,
      scenarios,
      minPL: Math.min(...pls),
      maxPL: Math.max(...pls),
      minROI: roi(Math.min(...pls), totalStake),
      maxROI: roi(Math.max(...pls), totalStake),
    });
  }

  lastResults = results;
  renderMatchResults(results);
  renderCombinedResults(results);
}

function renderMatchResults(results) {
  $('matchResults').innerHTML = results.map((r) => {
    const { match: m, bets, totalStake, scenarios, minPL, maxPL } = r;
    const budget = matchBudget(m);
    const budgetLeft = budget - totalStake;
    const invSum = bets.reduce((s, b) => s + 1 / b.odds, 0);

    const rows = bets.map((b) => {
      const ret = b.stake * b.odds;
      const prof = ret - totalStake;
      const stakePct = totalStake > 0 ? b.stake / totalStake : 0;
      const profitPct = b.stake > 0 ? (ret - b.stake) / b.stake : 0;
      const roiPct = totalStake > 0 ? prof / totalStake : 0;
      return `<tr>
        <td>${b.label}</td>
        <td>${b.odds.toFixed(2)}</td>
        <td>${pct(implied(b.odds))}</td>
        <td>${fmt(b.stake)}</td>
        <td>${pct(stakePct)}</td>
        <td>${fmt(ret)}</td>
        <td class="${prof >= 0 ? 'positive' : 'negative'}">${fmt(prof)}</td>
        <td class="${prof >= 0 ? 'positive' : 'negative'}">${pct(profitPct)}</td>
        <td class="${roiPct >= 0 ? 'positive' : 'negative'}">${pct(roiPct)}</td>
      </tr>`;
    }).join('');

    const scenarioHtml = scenarios.map((sc) =>
      `<div class="scenario ${sc.cls}">
        <h4>${sc.label}</h4>
        <p>${t('netPL')} <strong class="${sc.pl >= 0 ? 'positive' : 'negative'}">${fmt(sc.pl)} (${pct(roi(sc.pl, totalStake))})</strong></p>
      </div>`
    ).join('');

    return `<section class="card card-wide results">
      <h2>${m.homeTeam} vs ${m.awayTeam}</h2>
      <div class="summary">
        <div class="stat"><div class="stat-label">${t('staked')}</div><div class="stat-value">${fmt(totalStake)}</div></div>
        <div class="stat"><div class="stat-label">${t('budgetLeft')}</div><div class="stat-value ${budgetLeft >= 0 ? 'neutral' : 'negative'}">${budget > 0 ? fmt(budgetLeft) : '—'}</div></div>
        ${useGroupPool() ? `<div class="stat"><div class="stat-label">${t('poolAllocPct')}</div><div class="stat-value">${m.poolAllocPct.toFixed(2)}%</div></div>` : ''}
        <div class="stat"><div class="stat-label">${t('impliedSum')}</div><div class="stat-value">${pct(invSum)}</div></div>
        <div class="stat"><div class="stat-label">${t('scenarioPL')}</div><div class="stat-value ${minPL >= 0 ? 'positive' : 'negative'}">${fmt(minPL)} – ${fmt(maxPL)}</div></div>
        <div class="stat"><div class="stat-label">${t('scenarioRoi')}</div><div class="stat-value">${pct(roi(minPL, totalStake))} – ${pct(roi(maxPL, totalStake))}</div></div>
      </div>
      <div class="table-wrap"><table class="stakes-table">
        <thead><tr>
          <th>${t('thSelection')}</th><th>${t('odds')}</th><th>${t('thImplied')}</th><th>${t('staked')}</th><th>${t('thStakePct')}</th>
          <th>${t('thReturn')}</th><th>${t('thProfit')}</th><th>${t('thProfitPct')}</th><th>${t('thRoi')}</th>
        </tr></thead>
        <tbody>${rows}</tbody>
      </table></div>
      <div class="scenario-grid">${scenarioHtml}</div>
    </section>`;
  }).join('');
}

function renderCombinedResults(results) {
  const grandStake = results.reduce((s, r) => s + r.totalStake, 0);
  const grandMin = results.reduce((s, r) => s + r.minPL, 0);
  const grandMax = results.reduce((s, r) => s + r.maxPL, 0);
  const grandBudget = useGroupPool()
    ? poolTotal()
    : results.reduce((s, r) => s + matchBudget(r.match), 0);

  $('combinedSummary').innerHTML = `
    <div class="stat"><div class="stat-label">${t('matches')}</div><div class="stat-value">${results.length}</div></div>
    <div class="stat"><div class="stat-label">${t('totalStaked')}</div><div class="stat-value">${fmt(grandStake)}</div></div>
    <div class="stat"><div class="stat-label">${t('combinedBudgets')}</div><div class="stat-value">${fmt(grandBudget)}</div></div>
    <div class="stat"><div class="stat-label">${t('bestTotalProfit')}</div><div class="stat-value positive">${fmt(grandMax)} <span class="stat-sub">(${pct(roi(grandMax, grandStake))})</span></div></div>
    <div class="stat"><div class="stat-label">${t('worstTotalProfit')}</div><div class="stat-value ${grandMin >= 0 ? 'positive' : 'negative'}">${fmt(grandMin)} <span class="stat-sub">(${pct(roi(grandMin, grandStake))})</span></div></div>
  `;

  $('combinedBody').innerHTML = results.map((r) => {
    const stakePct = grandStake > 0 ? r.totalStake / grandStake : 0;
    const title = `${r.match.homeTeam} vs ${r.match.awayTeam}`;
    return `<tr>
      <td>${title}</td>
      <td>${fmt(r.totalStake)}</td>
      <td>${pct(stakePct)}</td>
      <td class="positive">${fmt(r.maxPL)}</td>
      <td class="positive">${pct(r.maxROI)}</td>
      <td class="${r.minPL >= 0 ? 'positive' : 'negative'}">${fmt(r.minPL)}</td>
      <td class="${r.minROI >= 0 ? 'positive' : 'negative'}">${pct(r.minROI)}</td>
    </tr>`;
  }).join('') + `<tr class="total-row">
    <td><strong>${t('allMatches')}</strong></td>
    <td><strong>${fmt(grandStake)}</strong></td>
    <td><strong>100%</strong></td>
    <td class="positive"><strong>${fmt(grandMax)}</strong></td>
    <td class="positive"><strong>${pct(roi(grandMax, grandStake))}</strong></td>
    <td class="${grandMin >= 0 ? 'positive' : 'negative'}"><strong>${fmt(grandMin)}</strong></td>
    <td class="${roi(grandMin, grandStake) >= 0 ? 'positive' : 'negative'}"><strong>${pct(roi(grandMin, grandStake))}</strong></td>
  </tr>`;

  $('combinedResults').classList.remove('hidden');
  renderGroupSplit(grandStake, grandMin, grandMax);
  $('combinedResults').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function memberEarnings(share, contribution, grandMin, grandMax) {
  const bestProfit = grandMax * share;
  const worstProfit = grandMin * share;
  return {
    bestProfit,
    worstProfit,
    bestRoi: contribution > 0 ? bestProfit / contribution : 0,
    worstRoi: contribution > 0 ? worstProfit / contribution : 0,
    bestPayout: contribution + bestProfit,
    worstPayout: contribution + worstProfit,
  };
}

function renderGroupSplit(grandStake, grandMin, grandMax) {
  const section = $('groupResults');
  if (!groupMembers.length) {
    section.classList.add('hidden');
    return;
  }
  const pool = poolTotal();
  section.querySelector('.group-alert')?.remove();
  if (grandStake > pool) {
    const div = document.createElement('div');
    div.className = 'alert alert-warn group-alert';
    div.textContent = t('errPoolShort', {
      staked: fmt(grandStake),
      pool: fmt(pool),
      shortfall: fmt(grandStake - pool),
    });
    section.querySelector('h2')?.after(div);
  }

  $('groupBody').innerHTML = groupMembers.map((m) => {
    const share = m.contribution / pool;
    const e = memberEarnings(share, m.contribution, grandMin, grandMax);
    return `<tr>
      <td>${escapeHtml(m.name)}</td>
      <td>${fmt(m.contribution)}</td>
      <td>${pct(share)}</td>
      <td>${fmt(grandStake * share)}</td>
      <td>
        <span class="positive">${fmt(e.bestProfit)}</span>
        <span class="earn-sep"> / </span>
        <span class="${e.worstProfit >= 0 ? 'positive' : 'negative'}">${fmt(e.worstProfit)}</span>
      </td>
      <td>
        <span class="positive">${pct(e.bestRoi)}</span>
        <span class="earn-sep"> / </span>
        <span class="${e.worstRoi >= 0 ? 'positive' : 'negative'}">${pct(e.worstRoi)}</span>
      </td>
      <td>
        <span class="positive">${fmt(e.bestPayout)}</span>
        <span class="earn-sep"> / </span>
        <span class="${e.worstPayout >= m.contribution ? 'positive' : 'negative'}">${fmt(e.worstPayout)}</span>
      </td>
    </tr>`;
  }).join('');

  $('groupEarnCards').innerHTML = groupMembers.map((m) => {
    const share = m.contribution / pool;
    const e = memberEarnings(share, m.contribution, grandMin, grandMax);
    return `<div class="member-earn-card">
      <h3>${t('memberEarns', { name: escapeHtml(m.name) })}</h3>
      <p class="member-contrib">${t('contribution')}: <strong>${fmt(m.contribution)}</strong> · ${t('thStakePct')} <strong>${pct(share)}</strong></p>
      <div class="earn-cases">
        <div class="earn-case earn-best">
          <span class="earn-case-label">${t('bestCase')}</span>
          <p>${t('profitLabel')}: <strong class="positive">${fmt(e.bestProfit)} (${pct(e.bestRoi)})</strong></p>
          <p>${t('receives')}: <strong class="positive">${fmt(e.bestPayout)}</strong></p>
        </div>
        <div class="earn-case earn-worst">
          <span class="earn-case-label">${t('worstCase')}</span>
          <p>${t('profitLabel')}: <strong class="${e.worstProfit >= 0 ? 'positive' : 'negative'}">${fmt(e.worstProfit)} (${pct(e.worstRoi)})</strong></p>
          <p>${t('receives')}: <strong class="${e.worstPayout >= m.contribution ? 'positive' : 'negative'}">${fmt(e.worstPayout)}</strong></p>
        </div>
      </div>
    </div>`;
  }).join('');

  section.classList.remove('hidden');
}

function resetAll() {
  matches = [createMatch(0, 1)];
  lastResults = null;
  renderAll();
  $('combinedResults').classList.add('hidden');
  $('groupResults').classList.add('hidden');
  $('matchResults').innerHTML = '';
}

// ponytail: dutch self-check
(function selfCheck() {
  const test = dutchStakes([{ odds: 2 }, { odds: 4 }], 100);
  const r0 = test[0].stake * 2, r1 = test[1].stake * 4;
  console.assert(Math.abs(r0 - r1) < 0.01 && Math.abs(test[0].stake + test[1].stake - 100) < 0.01);
})();

init();
