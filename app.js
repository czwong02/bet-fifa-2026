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

/** @type {string|null} */
let activeMatchResultTab = null;

/** @type {Set<string>} */
const sectionTouched = new Set();

/** @type {Set<string>} */
const matchTouched = new Set();

function init() {
  if (!matches.length) matches.push(createMatch(0, 1));
  document.querySelectorAll('.lang-btn').forEach((btn) => {
    btn.addEventListener('click', () => setLang(btn.dataset.lang));
    btn.classList.toggle('active', btn.dataset.lang === currentLang);
  });
  renderGroupList();
  renderAll();
  bindEvents();
  applySectionStates();
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
    collapsed: true,
  };
}

function touchSection(key) {
  if (!key) return;
  sectionTouched.add(key);
  const el = document.querySelector(`[data-section="${key}"]`);
  if (!el) return;
  el.classList.remove('collapsed');
  el.querySelector('.section-toggle')?.setAttribute('aria-expanded', 'true');
}

function touchMatch(id) {
  if (!id) return;
  matchTouched.add(id);
  touchSection('matches');
  const m = matches.find((x) => x.id === id);
  if (m) m.collapsed = false;
  const card = document.querySelector(`[data-match-id="${id}"]`);
  if (card) {
    card.classList.remove('collapsed');
    card.querySelector('[data-toggle-match]')?.setAttribute('aria-expanded', 'true');
  }
}

function applySectionStates() {
  document.querySelectorAll('[data-section]').forEach((el) => {
    if (!sectionTouched.has(el.dataset.section)) {
      el.classList.add('collapsed');
      el.querySelector('.section-toggle')?.setAttribute('aria-expanded', 'false');
    }
  });
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
    touchSection('matches');
    matches.push(createMatch(matches.length, matches.length + 1));
    if (useGroupPool()) rebalancePoolAllocEqual();
    renderAll();
  });
  $('calculate').addEventListener('click', calculateAll);
  $('reset').addEventListener('click', resetAll);

  $('saveMember').addEventListener('click', addMember);
  $('addMember').addEventListener('click', () => {
    touchSection('group');
    $('memberName').focus();
  });
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

  $('groupResults')?.querySelector('.group-tabs')?.addEventListener('click', (e) => {
    const tab = e.target.closest('[data-group-tab]');
    if (tab) {
      touchSection('groupResults');
      setGroupTab(tab.dataset.groupTab);
    }
  });

  $('matchResults')?.addEventListener('click', (e) => {
    const tab = e.target.closest('[data-match-result-tab]');
    if (tab) {
      touchSection('matchResults');
      setMatchResultTab(tab.dataset.matchResultTab);
    }
  });

  document.querySelector('.page')?.addEventListener('click', (e) => {
    const toggle = e.target.closest('.section-toggle');
    if (!toggle) return;
    const section = toggle.closest('.collapsible-section');
    if (!section) return;
    const collapsed = section.classList.toggle('collapsed');
    toggle.setAttribute('aria-expanded', String(!collapsed));
    if (!collapsed) sectionTouched.add(section.dataset.section);
  });

  document.querySelector('.page')?.addEventListener('focusin', (e) => {
    const section = e.target.closest('[data-section]');
    if (section && !e.target.closest('.section-toggle')) touchSection(section.dataset.section);
    const card = e.target.closest('.match-card');
    if (card) touchMatch(card.dataset.matchId);
  });

  $('matchList').addEventListener('click', (e) => {
    const toggle = e.target.closest('[data-toggle-match]');
    if (toggle) {
      const m = matches.find((x) => x.id === toggle.dataset.toggleMatch);
      const card = document.querySelector(`[data-match-id="${toggle.dataset.toggleMatch}"]`);
      if (!m || !card) return;
      m.collapsed = !m.collapsed;
      if (!m.collapsed) matchTouched.add(m.id);
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
      activeMatchResultTab = null;
      return;
    }
    const addScore = e.target.closest('[data-add-score]');
    if (addScore) {
      touchMatch(addScore.dataset.addScore);
      addScoreLine(addScore.dataset.addScore);
    }
  });

  $('matchList').addEventListener('change', (e) => {
    const row = e.target.closest('.outcome-row');
    if (e.target.type === 'checkbox' && row) {
      const card = e.target.closest('.match-card');
      if (card) touchMatch(card.dataset.matchId);
      row.classList.toggle('active', e.target.checked);
      return;
    }
    const card = e.target.closest('.match-card');
    if (card) touchMatch(card.dataset.matchId);
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
    touchMatch(card.dataset.matchId);
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
  touchSection('group');
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
  if (title) title.innerHTML = typeof teamVsHtml === 'function' ? teamVsHtml(m.homeTeam, m.awayTeam) : `${m.homeTeam} vs ${m.awayTeam}`;
  const homeFlag = card.querySelector('[data-flag-for="home"]');
  const awayFlag = card.querySelector('[data-flag-for="away"]');
  if (homeFlag && typeof flagUrlForTeam === 'function') homeFlag.src = flagUrlForTeam(m.homeTeam);
  if (awayFlag && typeof flagUrlForTeam === 'function') awayFlag.src = flagUrlForTeam(m.awayTeam);
  const prefix = card.querySelector('.match-prefix');
  if (prefix) prefix.textContent = t('matchN', { n: matches.indexOf(m) + 1 });
}

function refreshTeamFlags() {
  document.querySelectorAll('.match-card[data-match-id]').forEach((card) => {
    const m = matches.find((x) => x.id === card.dataset.matchId);
    if (m) updateMatchLabels(card, m);
  });
}

window.refreshTeamFlags = refreshTeamFlags;

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
      m.collapsed = matchTouched.has(m.id) ? card.classList.contains('collapsed') : true;
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
        <span class="match-toggle-text"><span class="match-prefix">${t('matchN', { n: index + 1 })}</span> <span class="match-title">${typeof teamVsHtml === 'function' ? teamVsHtml(m.homeTeam, m.awayTeam) : `${m.homeTeam} vs ${m.awayTeam}`}</span></span>
      </button>
      ${matches.length > 1 ? `<button type="button" class="btn btn-ghost btn-sm" data-remove-match="${m.id}">${t('remove')}</button>` : ''}
    </div>
    <div class="match-body">
    <div class="field-row team-select-row">
      <label class="field team-field"><span>${t('home')}</span>
        <div class="team-select-wrap">
          <img class="team-flag" data-flag-for="home" src="${typeof flagUrlForTeam === 'function' ? flagUrlForTeam(m.homeTeam) : ''}" alt="" width="24" height="18">
          <select class="match-home">${teamOptions(m.homeTeam)}</select>
        </div>
      </label>
      <span class="vs">vs</span>
      <label class="field team-field"><span>${t('away')}</span>
        <div class="team-select-wrap">
          <img class="team-flag" data-flag-for="away" src="${typeof flagUrlForTeam === 'function' ? flagUrlForTeam(m.awayTeam) : ''}" alt="" width="24" height="18">
          <select class="match-away">${teamOptions(m.awayTeam)}</select>
        </div>
      </label>
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

function setMatchResultTab(matchId) {
  activeMatchResultTab = matchId;
  const root = $('matchResults');
  if (!root) return;
  root.querySelectorAll('[data-match-result-tab]').forEach((btn) => {
    const on = btn.dataset.matchResultTab === matchId;
    btn.classList.toggle('active', on);
    btn.setAttribute('aria-selected', String(on));
  });
  root.querySelectorAll('[data-match-result-panel]').forEach((panel) => {
    const on = panel.dataset.matchResultPanel === matchId;
    panel.classList.toggle('active', on);
    panel.hidden = !on;
  });
}

function matchResultPanelHtml(r, col) {
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
      <td data-label="${col.selection}">${escapeHtml(b.label)}</td>
      <td data-label="${col.odds}">${b.odds.toFixed(2)}</td>
      <td data-label="${col.implied}">${pct(implied(b.odds))}</td>
      <td data-label="${col.staked}">${fmt(b.stake)}</td>
      <td data-label="${col.stakePct}">${pct(stakePct)}</td>
      <td data-label="${col.ret}">${fmt(ret)}</td>
      <td class="${prof >= 0 ? 'positive' : 'negative'}" data-label="${col.profit}">${fmt(prof)}</td>
      <td class="${prof >= 0 ? 'positive' : 'negative'}" data-label="${col.profitPct}">${pct(profitPct)}</td>
      <td class="${roiPct >= 0 ? 'positive' : 'negative'}" data-label="${col.roi}">${pct(roiPct)}</td>
    </tr>`;
  }).join('');

  const scenarioHtml = scenarios.map((sc) =>
    `<div class="scenario ${sc.cls}">
      <h4>${sc.label}</h4>
      <p>${t('netPL')} <strong class="${sc.pl >= 0 ? 'positive' : 'negative'}">${fmt(sc.pl)} (${pct(roi(sc.pl, totalStake))})</strong></p>
    </div>`
  ).join('');

  return `<div class="match-result-panel-inner">
    <h3 class="match-result-title">${typeof teamVsHtml === 'function' ? teamVsHtml(m.homeTeam, m.awayTeam) : `${escapeHtml(m.homeTeam)} vs ${escapeHtml(m.awayTeam)}`}</h3>
    <div class="summary">
      <div class="stat"><div class="stat-label">${t('staked')}</div><div class="stat-value">${fmt(totalStake)}</div></div>
      <div class="stat"><div class="stat-label">${t('budgetLeft')}</div><div class="stat-value ${budgetLeft >= 0 ? 'neutral' : 'negative'}">${budget > 0 ? fmt(budgetLeft) : '—'}</div></div>
      ${useGroupPool() ? `<div class="stat"><div class="stat-label">${t('poolAllocPct')}</div><div class="stat-value">${m.poolAllocPct.toFixed(2)}%</div></div>` : ''}
      <div class="stat"><div class="stat-label">${t('impliedSum')}</div><div class="stat-value">${pct(invSum)}</div></div>
      <div class="stat"><div class="stat-label">${t('scenarioPL')}</div><div class="stat-value ${minPL >= 0 ? 'positive' : 'negative'}">${fmt(minPL)} – ${fmt(maxPL)}</div></div>
      <div class="stat"><div class="stat-label">${t('scenarioRoi')}</div><div class="stat-value">${pct(roi(minPL, totalStake))} – ${pct(roi(maxPL, totalStake))}</div></div>
    </div>
    <div class="result-viz" data-match-viz="${m.id}"></div>
    <div class="table-wrap table-cards"><table class="stakes-table">
      <thead><tr>
        <th>${t('thSelection')}</th><th>${t('odds')}</th><th>${t('thImplied')}</th><th>${t('staked')}</th><th>${t('thStakePct')}</th>
        <th>${t('thReturn')}</th><th>${t('thProfit')}</th><th>${t('thProfitPct')}</th><th>${t('thRoi')}</th>
      </tr></thead>
      <tbody>${rows}</tbody>
    </table></div>
    <div class="scenario-grid">${scenarioHtml}</div>
  </div>`;
}

function renderMatchResults(results) {
  const root = $('matchResults');
  if (!results.length) {
    root.innerHTML = '';
    activeMatchResultTab = null;
    return;
  }

  const col = {
    selection: t('thSelection'),
    odds: t('odds'),
    implied: t('thImplied'),
    staked: t('staked'),
    stakePct: t('thStakePct'),
    ret: t('thReturn'),
    profit: t('thProfit'),
    profitPct: t('thProfitPct'),
    roi: t('thRoi'),
  };

  const prevTab = activeMatchResultTab;
  const multi = results.length > 1;
  const tabs = multi ? results.map((r, i) => {
    const m = r.match;
    const title = `${m.homeTeam} vs ${m.awayTeam}`;
    const flags = typeof teamFlagImg === 'function'
      ? `${teamFlagImg(m.homeTeam, 'team-flag team-flag-sm')}<span class="match-tab-vs">vs</span>${teamFlagImg(m.awayTeam, 'team-flag team-flag-sm')}`
      : '';
    return `<button type="button" class="group-tab match-result-tab" role="tab"
      id="matchResultTab-${m.id}" data-match-result-tab="${m.id}"
      aria-selected="false" aria-controls="matchResultPanel-${m.id}"
      title="${escapeHtml(title)}">
      <span class="match-tab-n">${t('matchTab', { n: i + 1 })}</span>
      <span class="match-tab-teams">${flags}<span class="match-tab-names">${escapeHtml(m.homeTeam)} vs ${escapeHtml(m.awayTeam)}</span></span>
    </button>`;
  }).join('') : '';

  const panels = results.map((r, i) => {
    const m = r.match;
    const show = !multi || i === 0;
    return `<div class="group-tab-panel match-result-panel${show ? ' active' : ''}" role="tabpanel"
      id="matchResultPanel-${m.id}" data-match-result-panel="${m.id}"
      ${multi ? `aria-labelledby="matchResultTab-${m.id}"` : ''}${show ? '' : ' hidden'}>
      ${matchResultPanelHtml(r, col)}
    </div>`;
  }).join('');

  root.innerHTML = `<section class="card card-wide results match-results-wrap collapsible-section collapsed" data-section="matchResults">
    <button type="button" class="section-toggle" aria-expanded="false">
      <span class="chevron" aria-hidden="true"></span>
      <h2 data-i18n="matchResultsTitle">Per-match Results</h2>
    </button>
    <div class="section-body">
    ${multi ? `<div class="group-tabs match-result-tabs" role="tablist" aria-label="${t('matchResultsTitle')}">${tabs}</div>` : ''}
    <div class="group-tab-panels match-result-panels">${panels}</div>
    </div>
  </section>`;

  if (sectionTouched.has('matchResults')) touchSection('matchResults');

  results.forEach((r) => {
    const el = root.querySelector(`[data-match-viz="${r.match.id}"]`);
    if (el) renderMatchCharts(el, r);
  });

  if (multi) {
    const activeId = results.some((r) => r.match.id === prevTab) ? prevTab : results[0].match.id;
    setMatchResultTab(activeId);
  } else {
    activeMatchResultTab = results[0].match.id;
  }
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

  const col = {
    match: t('thMatch'),
    staked: t('thStaked'),
    stakePct: t('thStakePct'),
    bestProfit: t('thBestProfit'),
    bestRoi: t('thBestRoi'),
    worstProfit: t('thWorstProfit'),
    worstRoi: t('thWorstRoi'),
  };

  renderCombinedCharts(results, grandStake, grandMin, grandMax);

  $('combinedBody').innerHTML = results.map((r) => {
    const stakePct = grandStake > 0 ? r.totalStake / grandStake : 0;
    const title = typeof teamVsHtml === 'function'
      ? teamVsHtml(r.match.homeTeam, r.match.awayTeam)
      : `${escapeHtml(r.match.homeTeam)} vs ${escapeHtml(r.match.awayTeam)}`;
    return `<tr class="combined-row">
      <td data-label="${col.match}"><span class="combined-match">${title}</span></td>
      <td data-label="${col.staked}">${fmt(r.totalStake)}</td>
      <td data-label="${col.stakePct}">${pct(stakePct)}</td>
      <td class="positive" data-label="${col.bestProfit}">${fmt(r.maxPL)}</td>
      <td class="positive" data-label="${col.bestRoi}">${pct(r.maxROI)}</td>
      <td class="${r.minPL >= 0 ? 'positive' : 'negative'}" data-label="${col.worstProfit}">${fmt(r.minPL)}</td>
      <td class="${r.minROI >= 0 ? 'positive' : 'negative'}" data-label="${col.worstRoi}">${pct(r.minROI)}</td>
    </tr>`;
  }).join('') + `<tr class="total-row combined-total-row">
    <td data-label="${col.match}"><strong>${t('allMatches')}</strong></td>
    <td data-label="${col.staked}"><strong>${fmt(grandStake)}</strong></td>
    <td data-label="${col.stakePct}"><strong>100%</strong></td>
    <td class="positive" data-label="${col.bestProfit}"><strong>${fmt(grandMax)}</strong></td>
    <td class="positive" data-label="${col.bestRoi}"><strong>${pct(roi(grandMax, grandStake))}</strong></td>
    <td class="${grandMin >= 0 ? 'positive' : 'negative'}" data-label="${col.worstProfit}"><strong>${fmt(grandMin)}</strong></td>
    <td class="${roi(grandMin, grandStake) >= 0 ? 'positive' : 'negative'}" data-label="${col.worstRoi}"><strong>${pct(roi(grandMin, grandStake))}</strong></td>
  </tr>`;

  $('combinedResults').classList.remove('hidden');
  renderGroupSplit(grandStake, grandMin, grandMax);
  applySectionStates();
  $('combinedResults').scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'nearest' });
}

const VIZ_COLORS = ['#00e676', '#ffc107', '#c8102e', '#006847', '#69f0ae', '#ff5252', '#8fb5a0', '#00b85c'];

function matchChartLabel(m) {
  return `${m.homeTeam} vs ${m.awayTeam}`;
}

function buildDonutSlices(items, total, labelFn, valueFn) {
  let acc = 0;
  return items.map((item, i) => {
    const amount = valueFn(item);
    const pctVal = total > 0 ? (amount / total) * 100 : 0;
    const start = acc;
    acc += pctVal;
    return {
      color: VIZ_COLORS[i % VIZ_COLORS.length],
      start,
      end: acc,
      pctVal,
      label: labelFn(item),
      amount,
    };
  });
}

function buildRangeInner(min, max) {
  if (min < 0 && max > 0) {
    return `<div class="viz-range-worst" style="flex:${Math.abs(min)}"></div>
      <div class="viz-range-zero" aria-hidden="true"></div>
      <div class="viz-range-best" style="flex:${max}"></div>`;
  }
  if (max > 0) return `<div class="viz-range-best viz-range-only"></div>`;
  if (min < 0) return `<div class="viz-range-worst viz-range-only"></div>`;
  return `<div class="viz-range-neutral"></div>`;
}

function buildDualProfitRows(items, scale) {
  return items.map((row, i) => {
    const bestW = (row.best / scale) * 100;
    const worstW = (Math.abs(row.worst) / scale) * 100;
    const bestCls = row.best >= 0 ? 'positive' : 'negative';
    const worstCls = row.worst >= 0 ? 'positive' : 'negative';
    const color = row.color || VIZ_COLORS[i % VIZ_COLORS.length];
    return `<div class="viz-profit-row">
      <span class="viz-profit-label" style="border-left-color:${color}">${escapeHtml(row.label)}</span>
      <div class="viz-profit-pair">
        <div class="viz-bar-group">
          <span class="viz-bar-tag">${t('chartBest')}</span>
          <div class="viz-track"><div class="viz-fill viz-fill-best ${bestCls}" style="width:${bestW.toFixed(1)}%"></div></div>
          <span class="viz-bar-amt ${bestCls}">${fmt(row.best)}</span>
        </div>
        <div class="viz-bar-group">
          <span class="viz-bar-tag">${t('chartWorst')}</span>
          <div class="viz-track"><div class="viz-fill viz-fill-worst ${worstCls}" style="width:${worstW.toFixed(1)}%"></div></div>
          <span class="viz-bar-amt ${worstCls}">${fmt(row.worst)}</span>
        </div>
      </div>
    </div>`;
  }).join('');
}

function buildSingleProfitRows(items, scale) {
  return items.map((row, i) => {
    const v = row.value;
    const w = (Math.abs(v) / scale) * 100;
    const cls = v >= 0 ? 'positive' : 'negative';
    const color = row.color || VIZ_COLORS[i % VIZ_COLORS.length];
    return `<div class="viz-profit-row">
      <span class="viz-profit-label" style="border-left-color:${color}">${escapeHtml(row.label)}</span>
      <div class="viz-bar-group viz-bar-group-single">
        <div class="viz-track"><div class="viz-fill ${v >= 0 ? 'viz-fill-best' : 'viz-fill-worst'} ${cls}" style="width:${w.toFixed(1)}%"></div></div>
        <span class="viz-bar-amt ${cls}">${fmt(v)}</span>
      </div>
    </div>`;
  }).join('');
}

function vizBlockHtml(opts) {
  const {
    shareTitle, centerValue, centerLabel, shareAria,
    slices, profitTitle, profitHtml, rangeTitle, rangeMin, rangeMax, rangeHint,
  } = opts;

  const donutStyle = slices.length
    ? `background: conic-gradient(${slices.map((s) => `${s.color} ${s.start}% ${s.end}%`).join(', ')});`
    : 'background: var(--surface2);';

  const legend = slices.map((s) =>
    `<li class="viz-legend-item">
      <span class="viz-swatch" style="background:${s.color}"></span>
      <span class="viz-legend-label">${escapeHtml(s.label)}</span>
      <span class="viz-legend-val">${pct(s.pctVal / 100)} · ${fmt(s.amount)}</span>
    </li>`
  ).join('');

  return `<div class="viz-grid">
    <div class="viz-panel">
      <h3 class="viz-title">${shareTitle}</h3>
      <div class="viz-donut-wrap">
        <div class="viz-donut" style="${donutStyle}" role="img" aria-label="${shareAria || shareTitle}">
          <div class="viz-donut-hole">
            <span class="viz-donut-total">${fmt(centerValue)}</span>
            <span class="viz-donut-sub">${centerLabel}</span>
          </div>
        </div>
        <ul class="viz-legend">${legend}</ul>
      </div>
    </div>
    <div class="viz-panel viz-panel-wide">
      <h3 class="viz-title">${profitTitle}</h3>
      <div class="viz-profit-list">${profitHtml}</div>
    </div>
    <div class="viz-panel viz-panel-full">
      <h3 class="viz-title">${rangeTitle}</h3>
      <div class="viz-range">
        <span class="viz-range-end ${rangeMin >= 0 ? 'positive' : 'negative'}">${fmt(rangeMin)}</span>
        <div class="viz-range-track">${buildRangeInner(rangeMin, rangeMax)}</div>
        <span class="viz-range-end ${rangeMax >= 0 ? 'positive' : 'negative'}">${fmt(rangeMax)}</span>
      </div>
      <p class="hint viz-range-hint">${rangeHint}</p>
    </div>
  </div>`;
}

function renderVizEl(el, html) {
  if (!el) return;
  el.innerHTML = html;
  el.removeAttribute('aria-hidden');
}

function clearVizEl(el) {
  if (!el) return;
  el.innerHTML = '';
  el.setAttribute('aria-hidden', 'true');
}

function renderCombinedCharts(results, grandStake, grandMin, grandMax) {
  const slices = buildDonutSlices(
    results,
    grandStake,
    (r) => matchChartLabel(r.match),
    (r) => r.totalStake
  );
  const scale = Math.max(...results.map((r) => Math.max(r.maxPL, Math.abs(r.minPL))), 1);
  const profitRows = buildDualProfitRows(
    results.map((r, i) => ({
      label: matchChartLabel(r.match),
      best: r.maxPL,
      worst: r.minPL,
      color: VIZ_COLORS[i % VIZ_COLORS.length],
    })),
    scale
  );
  renderVizEl($('combinedCharts'), vizBlockHtml({
    shareTitle: t('chartStakeShare'),
    centerValue: grandStake,
    centerLabel: t('totalStaked'),
    slices,
    profitTitle: t('chartProfitRange'),
    profitHtml: profitRows,
    rangeTitle: t('chartTotalRange'),
    rangeMin: grandMin,
    rangeMax: grandMax,
    rangeHint: `${t('worstTotalProfit')} → ${t('bestTotalProfit')}`,
  }));
}

function renderGroupCharts(grandStake, grandMin, grandMax) {
  const pool = poolTotal();
  const slices = buildDonutSlices(
    groupMembers,
    pool,
    (m) => m.name,
    (m) => m.contribution
  );
  const members = groupMembers.map((m) => {
    const share = m.contribution / pool;
    const e = memberEarnings(share, m.contribution, grandMin, grandMax);
    return { name: m.name, ...e };
  });
  const scale = Math.max(...members.map((m) => Math.max(m.bestProfit, Math.abs(m.worstProfit))), 1);
  const profitRows = buildDualProfitRows(
    members.map((m, i) => ({
      label: m.name,
      best: m.bestProfit,
      worst: m.worstProfit,
      color: VIZ_COLORS[i % VIZ_COLORS.length],
    })),
    scale
  );
  renderVizEl($('groupCharts'), vizBlockHtml({
    shareTitle: t('chartGroupShare'),
    centerValue: pool,
    centerLabel: t('totalPool'),
    slices,
    profitTitle: t('chartMemberProfit'),
    profitHtml: profitRows,
    rangeTitle: t('chartTotalRange'),
    rangeMin: grandMin,
    rangeMax: grandMax,
    rangeHint: `${t('worstTotalProfit')} → ${t('bestTotalProfit')}`,
  }));
}

function renderMatchCharts(el, result) {
  const { bets, totalStake, scenarios, minPL, maxPL } = result;
  const slices = buildDonutSlices(
    bets,
    totalStake,
    (b) => b.label,
    (b) => b.stake
  );
  const scale = Math.max(...scenarios.map((s) => Math.abs(s.pl)), 1);
  const profitRows = buildSingleProfitRows(
    scenarios.map((s, i) => ({ label: s.label, value: s.pl, color: VIZ_COLORS[i % VIZ_COLORS.length] })),
    scale
  );
  renderVizEl(el, vizBlockHtml({
    shareTitle: t('chartBetShare'),
    centerValue: totalStake,
    centerLabel: t('staked'),
    slices,
    profitTitle: t('chartScenarioPL'),
    profitHtml: profitRows,
    rangeTitle: t('chartMatchRange'),
    rangeMin: minPL,
    rangeMax: maxPL,
    rangeHint: `${t('scenarioPL')}: ${fmt(minPL)} – ${fmt(maxPL)}`,
  }));
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

function setGroupTab(name) {
  const section = $('groupResults');
  if (!section) return;
  section.querySelectorAll('[data-group-tab]').forEach((btn) => {
    const on = btn.dataset.groupTab === name;
    btn.classList.toggle('active', on);
    btn.setAttribute('aria-selected', String(on));
  });
  section.querySelectorAll('[data-group-panel]').forEach((panel) => {
    const on = panel.dataset.groupPanel === name;
    panel.classList.toggle('active', on);
    panel.hidden = !on;
  });
}

function renderGroupSplit(grandStake, grandMin, grandMax) {
  const section = $('groupResults');
  if (!groupMembers.length) {
    section.classList.add('hidden');
    clearVizEl($('groupCharts'));
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
    const col = {
      name: t('memberName'),
      contrib: t('contribution'),
      sharePct: t('thStakePct'),
      shareStake: t('shareOfStake'),
      profit: t('profitEarned'),
      profitRoi: t('thProfitRoi'),
      payout: t('totalPayout'),
    };
    return `<tr>
      <td data-label="${col.name}">${escapeHtml(m.name)}</td>
      <td data-label="${col.contrib}">${fmt(m.contribution)}</td>
      <td data-label="${col.sharePct}">${pct(share)}</td>
      <td data-label="${col.shareStake}">${fmt(grandStake * share)}</td>
      <td data-label="${col.profit}">
        <span class="positive">${fmt(e.bestProfit)}</span>
        <span class="earn-sep"> / </span>
        <span class="${e.worstProfit >= 0 ? 'positive' : 'negative'}">${fmt(e.worstProfit)}</span>
      </td>
      <td data-label="${col.profitRoi}">
        <span class="positive">${pct(e.bestRoi)}</span>
        <span class="earn-sep"> / </span>
        <span class="${e.worstRoi >= 0 ? 'positive' : 'negative'}">${pct(e.worstRoi)}</span>
      </td>
      <td data-label="${col.payout}">
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

  renderGroupCharts(grandStake, grandMin, grandMax);
  section.classList.remove('hidden');
}

function resetAll() {
  sectionTouched.clear();
  matchTouched.clear();
  matches = [createMatch(0, 1)];
  lastResults = null;
  renderAll();
  $('combinedResults').classList.add('hidden');
  $('groupResults').classList.add('hidden');
  $('matchResults').innerHTML = '';
  activeMatchResultTab = null;
  clearVizEl($('combinedCharts'));
  clearVizEl($('groupCharts'));
  applySectionStates();
}

// ponytail: dutch self-check
(function selfCheck() {
  const test = dutchStakes([{ odds: 2 }, { odds: 4 }], 100);
  const r0 = test[0].stake * 2, r1 = test[1].stake * 4;
  console.assert(Math.abs(r0 - r1) < 0.01 && Math.abs(test[0].stake + test[1].stake - 100) < 0.01);
})();

init();
