const fs = require('fs');
const path = require('path');

const TMP_FILE = '/tmp/devices_db.json';
const STATIC_DB = path.join(process.cwd(), 'devices_db.json');

function readDB() {
  if (fs.existsSync(TMP_FILE)) {
    try { return JSON.parse(fs.readFileSync(TMP_FILE, 'utf8')); } catch (_) {}
  }
  try { return JSON.parse(fs.readFileSync(STATIC_DB, 'utf8')); } catch (_) {}
  return { devices: [], importedAt: null, count: 0 };
}

function writeDB(data) {
  fs.writeFileSync(TMP_FILE, JSON.stringify(data, null, 2), 'utf8');
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(204).end();

  if (req.method === 'GET') {
    return res.status(200).json(readDB());
  }

  if (req.method === 'POST') {
    const { devices } = req.body;
    if (!Array.isArray(devices)) {
      return res.status(400).json({ error: 'devices 배열 필요' });
    }
    const db = { devices, importedAt: new Date().toISOString(), count: devices.length };
    writeDB(db);
    return res.status(200).json({ success: true, count: devices.length });
  }

  return res.status(405).json({ error: 'Method not allowed' });
};
