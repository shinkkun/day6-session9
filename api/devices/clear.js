const fs = require('fs');

const TMP_FILE = '/tmp/devices_db.json';

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(204).end();

  if (req.method === 'POST') {
    const db = { devices: [], importedAt: new Date().toISOString(), count: 0 };
    fs.writeFileSync(TMP_FILE, JSON.stringify(db, null, 2), 'utf8');
    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
};
