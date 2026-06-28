/** Team flags — API logos when available, else flagcdn by ISO */

const TEAM_ISO = {
  Argentina: 'ar',
  Australia: 'au',
  Belgium: 'be',
  Brazil: 'br',
  Canada: 'ca',
  Colombia: 'co',
  Croatia: 'hr',
  England: 'gb-eng',
  France: 'fr',
  Germany: 'de',
  Italy: 'it',
  Japan: 'jp',
  Mexico: 'mx',
  Morocco: 'ma',
  Netherlands: 'nl',
  Portugal: 'pt',
  Qatar: 'qa',
  'Saudi Arabia': 'sa',
  Senegal: 'sn',
  'South Korea': 'kr',
  Spain: 'es',
  Switzerland: 'ch',
  USA: 'us',
  Uruguay: 'uy',
};

const TEAM_ALIASES = {
  'Korea Republic': 'South Korea',
  'Republic of Korea': 'South Korea',
  'United States': 'USA',
};

const teamLogos = {};

function canonicalTeam(name) {
  return TEAM_ALIASES[name] || name;
}

function flagUrlForTeam(name) {
  const key = canonicalTeam(name);
  if (teamLogos[key]) return teamLogos[key];
  if (teamLogos[name]) return teamLogos[name];
  const iso = TEAM_ISO[key];
  return iso ? `https://flagcdn.com/w40/${iso}.png` : '';
}

function mergeTeamLogosFromApi(fixtures, standings) {
  fixtures?.forEach((f) => {
    const h = f.teams?.home;
    const a = f.teams?.away;
    if (h?.name && h.logo) teamLogos[canonicalTeam(h.name)] = h.logo;
    if (a?.name && a.logo) teamLogos[canonicalTeam(a.name)] = a.logo;
  });
  standings?.standings?.flat()?.forEach((row) => {
    const t = row.team;
    if (t?.name && t.logo) teamLogos[canonicalTeam(t.name)] = t.logo;
  });
}

function teamFlagImg(name, className = 'team-flag') {
  const url = flagUrlForTeam(name);
  if (!url) return '';
  const safe = String(url).replace(/"/g, '&quot;');
  return `<img src="${safe}" alt="" class="${className}" width="24" height="18" loading="lazy">`;
}

function teamVsHtml(home, away) {
  const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return `${teamFlagImg(home)} <span>${esc(home)}</span> <span class="vs-inline">vs</span> ${teamFlagImg(away)} <span>${esc(away)}</span>`;
}

function teamLabelHtml(name) {
  const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return `<span class="team-line">${teamFlagImg(name, 'team-flag team-flag-sm')}${esc(name)}</span>`;
}

window.flagUrlForTeam = flagUrlForTeam;
window.teamFlagImg = teamFlagImg;
window.teamVsHtml = teamVsHtml;
window.teamLabelHtml = teamLabelHtml;
window.mergeTeamLogosFromApi = mergeTeamLogosFromApi;
window.canonicalTeam = canonicalTeam;
