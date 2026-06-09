/**
 * 열수송관 IoT 온도센서 모니터링 - 로컬 서버
 * Node.js 내장 모듈만 사용 (npm install 불필요)
 * 실행: node server.js
 */

const http = require('http');
const fs   = require('fs');
const path = require('path');
const { runAnalysis } = require('./api/_analyze-core');

const PORT    = 3000;
const DIR     = __dirname;
const DB_FILE = path.join(DIR, 'devices_db.json');

// ── .env 로더 (의존성 없이 KEY=VALUE 파싱) ────────────
function loadEnv() {
  try {
    const txt = fs.readFileSync(path.join(DIR, '.env'), 'utf8');
    for (const line of txt.split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
      if (m && !(m[1] in process.env)) {
        process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
      }
    }
  } catch { /* .env 없으면 무시 */ }
}
loadEnv();

// ── MIME ──────────────────────────────────────────────
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js':   'application/javascript; charset=utf-8',
  '.css':  'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.ico':  'image/x-icon',
};

// ── DB helpers ────────────────────────────────────────
function readDB() {
  try {
    if (!fs.existsSync(DB_FILE)) return { devices: [], importedAt: null, count: 0 };
    return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
  } catch (e) {
    console.error('[DB] 읽기 오류:', e.message);
    return { devices: [], importedAt: null, count: 0 };
  }
}

function writeDB(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
}

// ── Helpers ───────────────────────────────────────────
function sendJSON(res, status, data) {
  const body = JSON.stringify(data);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(body),
  });
  res.end(body);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', c => chunks.push(c));
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

// ── HTTP Server ───────────────────────────────────────
const server = http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

  const url      = new URL(req.url, `http://localhost:${PORT}`);
  const pathname = url.pathname;

  try {
    // ── API: 장비 목록 조회 ────────────────────────────
    if (pathname === '/api/devices' && req.method === 'GET') {
      sendJSON(res, 200, readDB());
      return;
    }

    // ── API: 장비 목록 저장 (전체 교체) ──────────────────
    if (pathname === '/api/devices' && req.method === 'POST') {
      const body = await readBody(req);
      const { devices } = JSON.parse(body);
      if (!Array.isArray(devices)) { sendJSON(res, 400, { error: 'devices 배열 필요' }); return; }
      const db = { devices, importedAt: new Date().toISOString(), count: devices.length };
      writeDB(db);
      console.log(`[DB] ${devices.length}개 장비 저장 → ${DB_FILE}`);
      sendJSON(res, 200, { success: true, count: devices.length });
      return;
    }

    // ── API: AI 분석 (브리핑 / 급변 감지 / 우선순위) ────
    if (pathname === '/api/analyze' && req.method === 'POST') {
      try {
        const payload = JSON.parse(await readBody(req));
        const result = await runAnalysis(payload, {
          apiKey: process.env.OPENAI_API_KEY,
          model:  process.env.OPENAI_MODEL,
        });
        sendJSON(res, 200, result);
      } catch (e) {
        console.error('[AI] 분석 오류:', e.message);
        sendJSON(res, e.statusCode || 500, { error: e.message || '분석 실패' });
      }
      return;
    }

    // ── API: 장비 DB 초기화 ────────────────────────────
    if (pathname === '/api/devices/clear' && req.method === 'POST') {
      const db = { devices: [], importedAt: new Date().toISOString(), count: 0 };
      writeDB(db);
      console.log('[DB] 장비 DB 초기화');
      sendJSON(res, 200, { success: true });
      return;
    }

    // ── 정적 파일 서빙 ─────────────────────────────────
    let filePath = pathname === '/' ? '/monitoring.html' : pathname;
    filePath = path.join(DIR, filePath.replace(/\.\./g, ''));

    if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('404 Not Found');
      return;
    }

    const ext  = path.extname(filePath).toLowerCase();
    const data = fs.readFileSync(filePath);
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
    res.end(data);

  } catch (e) {
    console.error('[Server] 오류:', e.message);
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('Internal Server Error');
  }
});

server.listen(PORT, '127.0.0.1', () => {
  console.log('');
  console.log('╔══════════════════════════════════════════════════╗');
  console.log('║  열수송관 IoT 온도센서 모니터링 서버 시작        ║');
  console.log('╠══════════════════════════════════════════════════╣');
  console.log(`║  URL  : http://localhost:${PORT}                    ║`);
  console.log(`║  DB   : devices_db.json                          ║`);
  console.log('╚══════════════════════════════════════════════════╝');
  console.log('');
});
