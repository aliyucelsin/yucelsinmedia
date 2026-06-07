/* ════════════════════════════════════════════════════════════════
 * ALİYÜCELSİN HEDEF — Otomasyon Backend
 * Sıfır bağımlılık (saf Node.js). Instagram Graph API ile zamanlanmış
 * otomatik paylaşım yapar.
 *
 * Çalıştır:   node server.js     →  http://localhost:8090
 * Sağlık:     GET  /api/health
 *
 * GEREKLİ (META-KURULUM.md'ye bak):
 *   - Instagram hesabı Creator/Business + bir Facebook Sayfasına bağlı
 *   - Uzun ömürlü access token + IG User ID  (config.json'a yazılır)
 *   - Backend PUBLIC bir adreste olmalı (Instagram medyayı URL'den çeker).
 *     Yerelde test için: ngrok / cloudflared tüneli, ya da Render/Railway.
 * ════════════════════════════════════════════════════════════════ */
'use strict';
const http  = require('http');
const https = require('https');
const fs    = require('fs');
const path  = require('path');
const crypto= require('crypto');

const ROOT        = __dirname;
const UPLOAD_DIR  = path.join(ROOT, 'uploads');
const CONFIG_FILE = path.join(ROOT, 'config.json');
const POSTS_FILE  = path.join(ROOT, 'posts.json');
const GRAPH_VER   = 'v21.0';

if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

/* ---------- config & state ---------- */
function readJSON(file, fallback) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch (_) { return fallback; }
}
function writeJSON(file, data) { fs.writeFileSync(file, JSON.stringify(data, null, 2)); }

function getConfig() {
  const c = readJSON(CONFIG_FILE, {});
  return {
    port:          process.env.PORT          || c.port          || 8090,
    igUserId:      process.env.IG_USER_ID     || c.igUserId      || '',
    accessToken:   process.env.IG_TOKEN       || c.accessToken   || '',
    apiToken:      process.env.API_TOKEN      || c.apiToken      || '',   // uygulamanın backend'e erişim anahtarı
    publicBaseUrl: process.env.PUBLIC_BASE_URL|| c.publicBaseUrl || '',   // örn. https://xxx.ngrok.io
    allowOrigin:   process.env.ALLOW_ORIGIN   || c.allowOrigin   || '*'
  };
}
function saveConfig(patch) {
  const c = readJSON(CONFIG_FILE, {});
  Object.assign(c, patch);
  writeJSON(CONFIG_FILE, c);
  return c;
}
function getPosts()  { return readJSON(POSTS_FILE, []); }
function savePosts(p){ writeJSON(POSTS_FILE, p); }

/* ---------- http helpers ---------- */
function send(res, code, type, body, extra) {
  const cfg = getConfig();
  const headers = Object.assign({
    'Content-Type': type,
    'Access-Control-Allow-Origin':  cfg.allowOrigin,
    'Access-Control-Allow-Headers': 'Content-Type, X-Api-Token',
    'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS'
  }, extra || {});
  res.writeHead(code, headers);
  res.end(body);
}
function json(res, code, obj, extra) { send(res, code, 'application/json; charset=utf-8', JSON.stringify(obj), extra); }

function readBody(req) {
  return new Promise(function (resolve, reject) {
    let body = '', tooBig = false;
    req.on('data', function (c) { body += c; if (body.length > 60e6) { tooBig = true; req.destroy(); } }); // 60MB
    req.on('end', function () {
      if (tooBig) return reject(new Error('payload too large'));
      try { resolve(body ? JSON.parse(body) : {}); } catch (e) { reject(new Error('invalid json')); }
    });
    req.on('error', reject);
  });
}

/* uygulamanın backend'e erişimini doğrula (apiToken set ise) */
function authOK(req) {
  const cfg = getConfig();
  if (!cfg.apiToken) return true; // henüz token belirlenmediyse açık (ilk kurulum)
  return (req.headers['x-api-token'] || '') === cfg.apiToken;
}

/* ---------- Graph API (https modülü ile) ---------- */
function graph(method, endpoint, params) {
  return new Promise(function (resolve, reject) {
    const qs = new URLSearchParams(params || {}).toString();
    const isGet = method === 'GET';
    const pathStr = '/' + GRAPH_VER + '/' + endpoint + (isGet && qs ? '?' + qs : '');
    const data = isGet ? null : qs;
    const opts = {
      hostname: 'graph.facebook.com',
      path: pathStr,
      method: method,
      headers: isGet ? {} : {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(data)
      }
    };
    const r = https.request(opts, function (resp) {
      let buf = '';
      resp.on('data', function (c) { buf += c; });
      resp.on('end', function () {
        let parsed; try { parsed = JSON.parse(buf); } catch (_) { parsed = { raw: buf }; }
        if (resp.statusCode >= 400 || (parsed && parsed.error)) {
          const msg = parsed && parsed.error ? parsed.error.message : ('HTTP ' + resp.statusCode);
          reject(new Error(msg));
        } else resolve(parsed);
      });
    });
    r.on('error', reject);
    if (data) r.write(data);
    r.end();
  });
}
function sleep(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }

/* tek bir gönderiyi Instagram'a yayınla */
async function publishPost(post) {
  const cfg = getConfig();
  if (!cfg.accessToken || !cfg.igUserId) throw new Error('Token / IG User ID ayarlı değil (config.json).');
  if (!post.mediaUrl) throw new Error('Medya URL yok.');

  const isVideo = post.mediaType === 'REELS' || post.mediaType === 'VIDEO' || /\.(mp4|mov)$/i.test(post.mediaUrl);
  const params = { access_token: cfg.accessToken, caption: post.caption || '' };
  if (isVideo) { params.media_type = 'REELS'; params.video_url = post.mediaUrl; }
  else         { params.image_url = post.mediaUrl; }

  // 1) container oluştur
  const created = await graph('POST', cfg.igUserId + '/media', params);
  const creationId = created.id;

  // 2) video ise hazır olana kadar bekle (max ~90sn)
  if (isVideo) {
    for (let i = 0; i < 30; i++) {
      await sleep(3000);
      const st = await graph('GET', creationId, { fields: 'status_code', access_token: cfg.accessToken });
      if (st.status_code === 'FINISHED') break;
      if (st.status_code === 'ERROR') throw new Error('Medya işleme hatası (Instagram).');
    }
  }

  // 3) yayınla
  const pub = await graph('POST', cfg.igUserId + '/media_publish', {
    access_token: cfg.accessToken, creation_id: creationId
  });
  return pub.id; // yayınlanan medya id
}

/* ---------- scheduler: her 60 sn'de zamanı gelenleri yayınla ---------- */
async function tick() {
  const posts = getPosts();
  const now = Date.now();
  let changed = false;
  for (const p of posts) {
    if (p.status !== 'scheduled') continue;
    if (new Date(p.scheduledAt).getTime() > now) continue;
    p.status = 'publishing'; savePosts(posts); changed = false;
    try {
      const mediaId = await publishPost(p);
      p.status = 'published'; p.igMediaId = mediaId; p.publishedAt = new Date().toISOString(); p.error = '';
      console.log('[yayınlandı] ' + (p.title || p.id) + '  →  ig:' + mediaId);
    } catch (e) {
      p.status = 'error'; p.error = e.message; p.attempts = (p.attempts || 0) + 1;
      console.error('[hata] ' + (p.title || p.id) + '  →  ' + e.message);
    }
    savePosts(posts); changed = true;
  }
  if (changed) savePosts(posts);
}
setInterval(function () { tick().catch(function (e) { console.error('tick:', e.message); }); }, 60 * 1000);

/* ---------- request router ---------- */
const MIME = { '.jpg':'image/jpeg', '.jpeg':'image/jpeg', '.png':'image/png', '.webp':'image/webp', '.mp4':'video/mp4', '.mov':'video/quicktime' };

const server = http.createServer(async function (req, res) {
  const url = req.url || '/';
  const method = req.method || 'GET';

  if (method === 'OPTIONS') return send(res, 204, 'text/plain', '');

  // statik: yüklenen medyayı public sun (Instagram buradan çeker)
  if (url.indexOf('/uploads/') === 0) {
    const rel = decodeURIComponent(url.split('?')[0]);
    const fp = path.normalize(path.join(ROOT, rel));
    if (!fp.startsWith(UPLOAD_DIR)) return send(res, 403, 'text/plain', 'Forbidden');
    return fs.readFile(fp, function (err, buf) {
      if (err) return send(res, 404, 'text/plain', 'Not found');
      send(res, 200, MIME[path.extname(fp).toLowerCase()] || 'application/octet-stream', buf);
    });
  }

  // sağlık & yapılandırma durumu (token sızdırmaz)
  if (url === '/api/health') {
    const cfg = getConfig();
    return json(res, 200, {
      ok: true,
      configured: !!(cfg.accessToken && cfg.igUserId),
      hasPublicUrl: !!cfg.publicBaseUrl,
      igUserId: cfg.igUserId ? '…' + String(cfg.igUserId).slice(-4) : '',
      apiTokenSet: !!cfg.apiToken,
      pending: getPosts().filter(function (p) { return p.status === 'scheduled'; }).length,
      graphVersion: GRAPH_VER
    });
  }

  // token bağlantısını test et (Graph'a hesabı sorar)
  if (url === '/api/verify' && method === 'POST') {
    if (!authOK(req)) return json(res, 401, { ok: false, error: 'yetkisiz' });
    try {
      const cfg = getConfig();
      const me = await graph('GET', cfg.igUserId, { fields: 'username,followers_count', access_token: cfg.accessToken });
      return json(res, 200, { ok: true, account: me });
    } catch (e) { return json(res, 400, { ok: false, error: e.message }); }
  }

  // config kaydet (token, ig id, public url) — sadece kurulum için
  if (url === '/api/config' && method === 'POST') {
    if (!authOK(req)) return json(res, 401, { ok: false, error: 'yetkisiz' });
    try {
      const body = await readBody(req);
      const patch = {};
      ['igUserId','accessToken','apiToken','publicBaseUrl','allowOrigin'].forEach(function (k) {
        if (typeof body[k] === 'string' && body[k] !== '') patch[k] = body[k];
      });
      saveConfig(patch);
      return json(res, 200, { ok: true });
    } catch (e) { return json(res, 400, { ok: false, error: e.message }); }
  }

  // medya yükle (base64) → uploads klasörüne yaz, public URL döndür
  if (url === '/api/upload' && method === 'POST') {
    if (!authOK(req)) return json(res, 401, { ok: false, error: 'yetkisiz' });
    try {
      const body = await readBody(req);                 // { filename, dataBase64 }
      const cfg = getConfig();
      if (!cfg.publicBaseUrl) return json(res, 400, { ok: false, error: 'publicBaseUrl ayarlı değil — Instagram medyayı çekemez.' });
      const ext = (path.extname(body.filename || '') || '.jpg').toLowerCase();
      const name = crypto.randomBytes(10).toString('hex') + ext;
      const b64 = String(body.dataBase64 || '').replace(/^data:[^;]+;base64,/, '');
      fs.writeFileSync(path.join(UPLOAD_DIR, name), Buffer.from(b64, 'base64'));
      return json(res, 200, { ok: true, url: cfg.publicBaseUrl.replace(/\/$/, '') + '/uploads/' + name });
    } catch (e) { return json(res, 400, { ok: false, error: e.message }); }
  }

  // gönderileri listele
  if (url === '/api/posts' && method === 'GET') {
    if (!authOK(req)) return json(res, 401, { ok: false, error: 'yetkisiz' });
    return json(res, 200, { ok: true, posts: getPosts() });
  }

  // gönderi zamanla / ekle
  if (url === '/api/posts' && method === 'POST') {
    if (!authOK(req)) return json(res, 401, { ok: false, error: 'yetkisiz' });
    try {
      const body = await readBody(req);
      if (!body.mediaUrl) return json(res, 422, { ok: false, error: 'mediaUrl gerekli' });
      const post = {
        id: crypto.randomBytes(8).toString('hex'),
        title: (body.title || '').toString().slice(0, 200),
        caption: (body.caption || '').toString().slice(0, 2200),
        mediaUrl: body.mediaUrl.toString(),
        mediaType: (body.mediaType || 'IMAGE').toString().toUpperCase(),
        scheduledAt: body.scheduledAt || new Date().toISOString(),
        status: 'scheduled',
        createdAt: new Date().toISOString()
      };
      const posts = getPosts(); posts.push(post); savePosts(posts);
      console.log('[zamanlandı] ' + (post.title || post.id) + '  @ ' + post.scheduledAt);
      return json(res, 200, { ok: true, post: post });
    } catch (e) { return json(res, 400, { ok: false, error: e.message }); }
  }

  // hemen yayınla
  const mPub = url.match(/^\/api\/publish\/([a-f0-9]+)$/);
  if (mPub && method === 'POST') {
    if (!authOK(req)) return json(res, 401, { ok: false, error: 'yetkisiz' });
    const posts = getPosts(); const p = posts.find(function (x) { return x.id === mPub[1]; });
    if (!p) return json(res, 404, { ok: false, error: 'bulunamadı' });
    try {
      const mediaId = await publishPost(p);
      p.status = 'published'; p.igMediaId = mediaId; p.publishedAt = new Date().toISOString(); savePosts(posts);
      return json(res, 200, { ok: true, igMediaId: mediaId });
    } catch (e) { p.status = 'error'; p.error = e.message; savePosts(posts); return json(res, 400, { ok: false, error: e.message }); }
  }

  // gönderi sil
  const mDel = url.match(/^\/api\/posts\/([a-f0-9]+)$/);
  if (mDel && method === 'DELETE') {
    if (!authOK(req)) return json(res, 401, { ok: false, error: 'yetkisiz' });
    let posts = getPosts(); const before = posts.length;
    posts = posts.filter(function (x) { return x.id !== mDel[1]; });
    savePosts(posts);
    return json(res, 200, { ok: true, removed: before - posts.length });
  }

  return json(res, 404, { ok: false, error: 'bilinmeyen uç nokta' });
});

const cfg = getConfig();
server.listen(cfg.port, function () {
  console.log('────────────────────────────────────────────────');
  console.log('  ALİYÜCELSİN HEDEF — Otomasyon Backend');
  console.log('  Port      →  http://localhost:' + cfg.port);
  console.log('  Sağlık    →  http://localhost:' + cfg.port + '/api/health');
  console.log('  Yapılandırma: ' + (cfg.accessToken && cfg.igUserId ? '✓ token + IG ID ayarlı' : '✗ config.json eksik (META-KURULUM.md)'));
  console.log('  Public URL : ' + (cfg.publicBaseUrl || '✗ yok — Instagram medya çekemez (ngrok/Render gerekli)'));
  console.log('  Zamanlayıcı: her 60sn kontrol ediyor');
  console.log('────────────────────────────────────────────────');
});
