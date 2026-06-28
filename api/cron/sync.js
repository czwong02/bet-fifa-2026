const { fetchSportsData, writeCache } = require('../../lib/sports');

module.exports = async function handler(req, res) {
  const auth = req.headers.authorization;
  if (process.env.CRON_SECRET && auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const data = await fetchSportsData();
    const stored = await writeCache(data);
    return res.status(200).json({
      ok: true,
      stored,
      updatedAt: data.updatedAt,
      fixtures: data.fixtures.length,
    });
  } catch (err) {
    console.error('cron sync failed:', err);
    return res.status(500).json({ error: err.message || 'Sync failed' });
  }
};
