/** Match reference — reads cached data from /api/sports-data (no client API key) */

const REF_COLLAPSED_STORAGE = 'ref-collapsed';

function initReference() {
  const collapsed = localStorage.getItem(REF_COLLAPSED_STORAGE) === '1';
  setRefCollapsed(collapsed);

  document.getElementById('toggleRef')?.addEventListener('click', () => {
    const hidden = document.getElementById('refWidgets')?.classList.contains('hidden');
    setRefCollapsed(!hidden);
  });

  loadReferenceData();
}

function setRefCollapsed(collapsed) {
  const panel = document.getElementById('refWidgets');
  const btn = document.getElementById('toggleRef');
  if (!panel || !btn) return;
  panel.classList.toggle('hidden', collapsed);
  localStorage.setItem(REF_COLLAPSED_STORAGE, collapsed ? '1' : '0');
  btn.textContent = typeof t === 'function' ? t(collapsed ? 'refShow' : 'refHide') : (collapsed ? 'Show' : 'Hide');
}

async function loadReferenceData() {
  const leagueEl = document.getElementById('refLeague');
  const fixturesEl = document.getElementById('refFixtures');
  const standingsEl = document.getElementById('refStandings');
  const metaEl = document.getElementById('refMeta');
  if (!leagueEl) return;

  const loading = typeof t === 'function' ? t('refLoading') : 'Loading…';
  leagueEl.innerHTML = `<p class="hint">${loading}</p>`;
  fixturesEl.innerHTML = '';
  standingsEl.innerHTML = '';

  try {
    const res = await fetch('/api/sports-data');
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || res.statusText);

    if (metaEl && data.updatedAt) {
      const when = new Date(data.updatedAt).toLocaleString();
      metaEl.textContent = typeof t === 'function' ? t('refUpdated', { time: when }) : `Updated ${when}`;
    }

    renderLeague(leagueEl, data.league);
    renderFixtures(fixturesEl, data.fixtures);
    renderStandings(standingsEl, data.standings);
  } catch (err) {
    const msg = typeof t === 'function' ? t('refError') : 'Could not load reference data.';
    leagueEl.innerHTML = `<p class="hint ref-error">${msg}</p>`;
    if (metaEl) metaEl.textContent = '';
  }
}

function renderLeague(el, league) {
  if (!league) {
    el.innerHTML = `<p class="hint">—</p>`;
    return;
  }
  const l = league.league || league;
  const c = league.country?.name || '';
  el.innerHTML = `
    <div class="ref-league-info">
      ${l.logo ? `<img src="${l.logo}" alt="" class="ref-logo" width="48" height="48">` : ''}
      <div>
        <strong>${escapeHtml(l.name || 'World Cup')}</strong>
        <p class="hint">${escapeHtml(c)} · ${l.season || '2026'}</p>
      </div>
    </div>`;
}

function renderFixtures(el, fixtures) {
  if (!fixtures?.length) {
    el.innerHTML = `<p class="hint">${typeof t === 'function' ? t('refNoFixtures') : 'No fixtures.'}</p>`;
    return;
  }
  const sorted = [...fixtures].sort((a, b) => new Date(a.fixture.date) - new Date(b.fixture.date));
  el.innerHTML = sorted.slice(0, 40).map((f) => {
    const home = f.teams.home.name;
    const away = f.teams.away.name;
    const gh = f.goals.home;
    const ga = f.goals.away;
    const score = gh != null ? `${gh} – ${ga}` : 'vs';
    const date = new Date(f.fixture.date).toLocaleString(undefined, {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
    });
    const status = f.fixture.status.short;
    return `<button type="button" class="ref-fixture" data-home="${escapeAttr(home)}" data-away="${escapeAttr(away)}" title="${typeof t === 'function' ? t('refApplyTeams') : 'Use teams in calculator'}">
      <span class="ref-fixture-date">${date}</span>
      <span class="ref-fixture-teams">${escapeHtml(home)} <span class="ref-score">${score}</span> ${escapeHtml(away)}</span>
      <span class="ref-fixture-status">${escapeHtml(status)}</span>
    </button>`;
  }).join('');

  el.querySelectorAll('.ref-fixture').forEach((btn) => {
    btn.addEventListener('click', () => applyTeamsToFirstMatch(btn.dataset.home, btn.dataset.away));
  });
}

function renderStandings(el, leagueStandings) {
  const groups = leagueStandings?.standings;
  if (!groups?.length) {
    el.innerHTML = `<p class="hint">${typeof t === 'function' ? t('refNoStandings') : 'No standings.'}</p>`;
    return;
  }
  el.innerHTML = groups.map((group, gi) => {
    const rows = group.map((row) =>
      `<tr>
        <td>${row.rank}</td>
        <td>${escapeHtml(row.team.name)}</td>
        <td>${row.all.played}</td>
        <td>${row.all.win}-${row.all.draw}-${row.all.lose}</td>
        <td>${row.all.goals.for}:${row.all.goals.against}</td>
        <td><strong>${row.points}</strong></td>
      </tr>`
    ).join('');
    const label = group[0]?.group || `Group ${gi + 1}`;
    return `<div class="ref-standings-group">
      <h4>${escapeHtml(label)}</h4>
      <table class="ref-table">
        <thead><tr>
          <th>#</th><th>${typeof t === 'function' ? t('refTeam') : 'Team'}</th>
          <th>${typeof t === 'function' ? t('refPlayed') : 'P'}</th><th>W-D-L</th><th>GD</th>
          <th>${typeof t === 'function' ? t('refPoints') : 'Pts'}</th>
        </tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>`;
  }).join('');
}

function applyTeamsToFirstMatch(home, away) {
  if (!home || !away || typeof matches === 'undefined') return;
  const m = matches[0];
  if (!m) return;
  if (TEAMS.includes(home)) m.homeTeam = home;
  if (TEAMS.includes(away)) m.awayTeam = away;
  renderAll();
  document.getElementById('matchList')?.scrollIntoView({ behavior: 'smooth' });
}

function escapeHtml(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function escapeAttr(s) {
  return String(s).replace(/"/g, '&quot;');
}

function onWidgetLangChange() {
  const btn = document.getElementById('toggleRef');
  const collapsed = document.getElementById('refWidgets')?.classList.contains('hidden');
  if (btn && typeof t === 'function') btn.textContent = t(collapsed ? 'refShow' : 'refHide');
  loadReferenceData();
}

window.onWidgetLangChange = onWidgetLangChange;

document.addEventListener('DOMContentLoaded', initReference);
