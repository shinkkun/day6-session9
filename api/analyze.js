const { runAnalysis } = require('./_analyze-core');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const payload = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const result = await runAnalysis(payload, {
      apiKey: process.env.GPT_API_KEY || process.env.OPENAI_API_KEY,
      model: process.env.OPENAI_MODEL,
    });
    return res.status(200).json(result);
  } catch (e) {
    return res.status(e.statusCode || 500).json({ error: e.message || '분석 실패' });
  }
};
