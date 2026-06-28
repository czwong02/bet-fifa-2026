const { getSportsData } = require('../lib/sports');

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const data = await getSportsData();
    res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate=3600');
    return res.status(200).json(data);
  } catch (err) {
    console.error('sports-data failed:', err);
    return res.status(503).json({ error: err.message || 'Data unavailable' });
  }
};
