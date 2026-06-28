const BASE = 'https://v3.football.api-sports.io';
const LEAGUE_ID = 1;
const SEASON = 2026;
const CACHE_KEY = 'sports:wc2026';

async function apiFetch(path) {
  const key = process.env.API_SPORTS_KEY;
  if (!key) throw new Error('API_SPORTS_KEY not configured');

  const res = await fetch(`${BASE}${path}`, {
    headers: { 'x-apisports-key': key },
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json?.errors || `API HTTP ${res.status}`);
  return json;
}

async function fetchSportsData() {
  const [leagueRes, fixturesRes, standingsRes] = await Promise.all([
    apiFetch(`/leagues?id=${LEAGUE_ID}`),
    apiFetch(`/fixtures?league=${LEAGUE_ID}&season=${SEASON}&timezone=UTC`),
    apiFetch(`/standings?league=${LEAGUE_ID}&season=${SEASON}`),
  ]);

  return {
    updatedAt: new Date().toISOString(),
    league: leagueRes.response?.[0] ?? null,
    fixtures: fixturesRes.response ?? [],
    standings: standingsRes.response?.[0]?.league ?? null,
  };
}

async function getKv() {
  if (!process.env.KV_REST_API_URL) return null;
  const { kv } = await import('@vercel/kv');
  return kv;
}

async function readCache() {
  const kv = await getKv();
  if (!kv) return null;
  return kv.get(CACHE_KEY);
}

async function writeCache(data) {
  const kv = await getKv();
  if (!kv) return false;
  await kv.set(CACHE_KEY, data);
  return true;
}

async function getSportsData() {
  const cached = await readCache();
  if (cached) return cached;
  const fresh = await fetchSportsData();
  await writeCache(fresh);
  return fresh;
}

module.exports = {
  CACHE_KEY,
  fetchSportsData,
  readCache,
  writeCache,
  getSportsData,
};
