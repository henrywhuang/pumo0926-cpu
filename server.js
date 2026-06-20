import crypto from "node:crypto";
import fs from "node:fs/promises";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = __dirname;
const STORE_DIR = path.join(ROOT, "data", "server-store");
const USERS_FILE = path.join(STORE_DIR, "users.json");
const SESSIONS_FILE = path.join(STORE_DIR, "sessions.json");
const EVENTS_FILE = path.join(STORE_DIR, "events.json");
const PROGRESS_FILE = path.join(STORE_DIR, "progress.json");
const PORT = Number(process.env.PORT || 4173);
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 30;

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon"
};

await ensureStore();

const server = http.createServer(async (req, res) => {
  try {
    if (req.url.startsWith("/api/")) {
      await handleApi(req, res);
      return;
    }
    await serveStatic(req, res);
  } catch (error) {
    console.error(error);
    sendJson(res, 500, { error: "server_error", message: "服务暂时不可用" });
  }
});

server.listen(PORT, () => {
  console.log(`H5 vocab server running at http://127.0.0.1:${PORT}/`);
});

async function handleApi(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const route = `${req.method} ${url.pathname}`;

  if (route === "POST /api/auth/register") return register(req, res);
  if (route === "POST /api/auth/login") return login(req, res);
  if (route === "POST /api/auth/logout") return logout(req, res);
  if (route === "GET /api/auth/me") return me(req, res);
  if (route === "GET /api/progress") return getProgress(req, res);
  if (route === "POST /api/progress") return saveProgress(req, res);
  if (route === "POST /api/events") return saveEvent(req, res);
  if (route === "GET /api/analytics/me") return myAnalytics(req, res);
  if (route === "GET /api/admin/analytics") return adminAnalytics(req, res);

  sendJson(res, 404, { error: "not_found", message: "接口不存在" });
}

async function register(req, res) {
  const body = await readBody(req);
  const name = String(body.name || "").trim();
  const email = normalizeEmail(body.email);
  const password = String(body.password || "");
  if (name.length < 2) return sendJson(res, 400, { error: "bad_name", message: "请输入至少 2 个字的昵称" });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return sendJson(res, 400, { error: "bad_email", message: "请输入有效邮箱" });
  if (password.length < 6) return sendJson(res, 400, { error: "bad_password", message: "密码至少 6 位" });

  const users = await readJson(USERS_FILE, []);
  if (users.some((user) => user.email === email)) {
    return sendJson(res, 409, { error: "email_exists", message: "该邮箱已注册" });
  }
  const user = {
    id: crypto.randomUUID(),
    name,
    email,
    password: hashPassword(password),
    createdAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString()
  };
  users.push(user);
  await writeJson(USERS_FILE, users);
  const session = await createSession(user.id);
  await appendEvent(user.id, "register", { source: "h5" });
  sendJson(res, 201, { token: session.token, user: publicUser(user) });
}

async function login(req, res) {
  const body = await readBody(req);
  const email = normalizeEmail(body.email);
  const password = String(body.password || "");
  const users = await readJson(USERS_FILE, []);
  const user = users.find((item) => item.email === email);
  if (!user || !verifyPassword(password, user.password)) {
    return sendJson(res, 401, { error: "invalid_credentials", message: "邮箱或密码不正确" });
  }
  user.lastLoginAt = new Date().toISOString();
  await writeJson(USERS_FILE, users);
  const session = await createSession(user.id);
  await appendEvent(user.id, "login", { source: "h5" });
  sendJson(res, 200, { token: session.token, user: publicUser(user) });
}

async function logout(req, res) {
  const token = readToken(req);
  if (token) {
    const sessions = await readJson(SESSIONS_FILE, []);
    await writeJson(SESSIONS_FILE, sessions.filter((session) => session.token !== token));
  }
  sendJson(res, 200, { ok: true });
}

async function me(req, res) {
  const auth = await requireUser(req, res);
  if (!auth) return;
  sendJson(res, 200, { user: publicUser(auth.user) });
}

async function getProgress(req, res) {
  const auth = await requireUser(req, res);
  if (!auth) return;
  const progress = await readJson(PROGRESS_FILE, {});
  sendJson(res, 200, { progress: progress[auth.user.id] || null });
}

async function saveProgress(req, res) {
  const auth = await requireUser(req, res);
  if (!auth) return;
  const body = await readBody(req);
  const progress = await readJson(PROGRESS_FILE, {});
  progress[auth.user.id] = {
    value: body.progress || {},
    updatedAt: new Date().toISOString()
  };
  await writeJson(PROGRESS_FILE, progress);
  await appendEvent(auth.user.id, "progress_sync", {
    learnedCount: Object.values(body.progress?.records || {}).filter((record) => record?.learned).length,
    planBookId: body.progress?.plan?.bookId || ""
  });
  sendJson(res, 200, { ok: true, updatedAt: progress[auth.user.id].updatedAt });
}

async function saveEvent(req, res) {
  const auth = await requireUser(req, res);
  if (!auth) return;
  const body = await readBody(req);
  await appendEvent(auth.user.id, String(body.type || "event"), body.payload || {});
  sendJson(res, 201, { ok: true });
}

async function myAnalytics(req, res) {
  const auth = await requireUser(req, res);
  if (!auth) return;
  const events = (await readJson(EVENTS_FILE, [])).filter((event) => event.userId === auth.user.id);
  sendJson(res, 200, { analytics: buildUserAnalytics(auth.user, events) });
}

async function adminAnalytics(req, res) {
  const auth = await requireUser(req, res);
  if (!auth) return;
  const users = await readJson(USERS_FILE, []);
  const events = await readJson(EVENTS_FILE, []);
  const dailyActive = groupByDay(events);
  const userRows = users.map((user) => buildUserAnalytics(user, events.filter((event) => event.userId === user.id)));
  sendJson(res, 200, {
    analytics: {
      totalUsers: users.length,
      totalEvents: events.length,
      activeUsersToday: new Set(events.filter((event) => event.day === todayKey()).map((event) => event.userId)).size,
      dailyActive,
      users: userRows.sort((a, b) => String(b.lastActiveAt || "").localeCompare(String(a.lastActiveAt || "")))
    }
  });
}

function buildUserAnalytics(user, events) {
  const learned = events.filter((event) => event.type === "word_completed" && event.payload?.taskType === "new").length;
  const reviewed = events.filter((event) => event.type === "word_completed" && event.payload?.taskType !== "new").length;
  const activeDays = new Set(events.map((event) => event.day)).size;
  const taskStarts = events.filter((event) => event.type === "task_started").length;
  return {
    user: publicUser(user),
    totalEvents: events.length,
    activeDays,
    learnedWords: learned,
    reviewedWords: reviewed,
    taskStarts,
    lastActiveAt: events.at(-1)?.createdAt || user.lastLoginAt || user.createdAt,
    daily: groupByDay(events)
  };
}

function groupByDay(events) {
  const map = new Map();
  for (const event of events) {
    if (!map.has(event.day)) {
      map.set(event.day, { day: event.day, events: 0, learnedWords: 0, reviews: 0, taskStarts: 0 });
    }
    const row = map.get(event.day);
    row.events += 1;
    if (event.type === "word_completed" && event.payload?.taskType === "new") row.learnedWords += 1;
    if (event.type === "word_completed" && event.payload?.taskType !== "new") row.reviews += 1;
    if (event.type === "task_started") row.taskStarts += 1;
  }
  return [...map.values()].sort((a, b) => a.day.localeCompare(b.day));
}

async function createSession(userId) {
  const sessions = await readJson(SESSIONS_FILE, []);
  const session = {
    token: crypto.randomBytes(32).toString("hex"),
    userId,
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + SESSION_TTL_MS).toISOString()
  };
  sessions.push(session);
  await writeJson(SESSIONS_FILE, sessions.filter((item) => new Date(item.expiresAt).getTime() > Date.now()));
  return session;
}

async function requireUser(req, res) {
  const token = readToken(req);
  if (!token) {
    sendJson(res, 401, { error: "missing_token", message: "请先登录" });
    return null;
  }
  const sessions = await readJson(SESSIONS_FILE, []);
  const session = sessions.find((item) => item.token === token && new Date(item.expiresAt).getTime() > Date.now());
  if (!session) {
    sendJson(res, 401, { error: "expired_token", message: "登录已过期，请重新登录" });
    return null;
  }
  const users = await readJson(USERS_FILE, []);
  const user = users.find((item) => item.id === session.userId);
  if (!user) {
    sendJson(res, 401, { error: "missing_user", message: "用户不存在" });
    return null;
  }
  return { user, session };
}

async function appendEvent(userId, type, payload = {}) {
  const events = await readJson(EVENTS_FILE, []);
  events.push({
    id: crypto.randomUUID(),
    userId,
    type,
    payload,
    day: todayKey(),
    createdAt: new Date().toISOString()
  });
  await writeJson(EVENTS_FILE, events.slice(-20000));
}

function publicUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt,
    lastLoginAt: user.lastLoginAt
  };
}

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(password, salt, 120000, 32, "sha256").toString("hex");
  return `pbkdf2$${salt}$${hash}`;
}

function verifyPassword(password, stored) {
  const [, salt, hash] = String(stored || "").split("$");
  if (!salt || !hash) return false;
  const input = crypto.pbkdf2Sync(password, salt, 120000, 32, "sha256").toString("hex");
  return crypto.timingSafeEqual(Buffer.from(input, "hex"), Buffer.from(hash, "hex"));
}

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function readToken(req) {
  const auth = req.headers.authorization || "";
  if (auth.startsWith("Bearer ")) return auth.slice(7);
  return "";
}

async function readBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  if (!chunks.length) return {};
  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    return {};
  }
}

async function serveStatic(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const decoded = decodeURIComponent(url.pathname);
  const target = decoded === "/" ? "/index.html" : decoded;
  const filePath = path.normalize(path.join(ROOT, target));
  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }
  try {
    const stat = await fs.stat(filePath);
    if (stat.isDirectory()) return sendFile(res, path.join(filePath, "index.html"));
    await sendFile(res, filePath);
  } catch {
    await sendFile(res, path.join(ROOT, "index.html"));
  }
}

async function sendFile(res, filePath) {
  const ext = path.extname(filePath);
  const body = await fs.readFile(filePath);
  res.writeHead(200, {
    "Content-Type": mimeTypes[ext] || "application/octet-stream",
    "Cache-Control": ext === ".html" ? "no-store" : "public, max-age=300"
  });
  res.end(body);
}

function sendJson(res, status, body) {
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store"
  });
  res.end(JSON.stringify(body));
}

async function ensureStore() {
  await fs.mkdir(STORE_DIR, { recursive: true });
  await Promise.all([
    ensureFile(USERS_FILE, []),
    ensureFile(SESSIONS_FILE, []),
    ensureFile(EVENTS_FILE, []),
    ensureFile(PROGRESS_FILE, {})
  ]);
}

async function ensureFile(file, fallback) {
  try {
    await fs.access(file);
  } catch {
    await writeJson(file, fallback);
  }
}

async function readJson(file, fallback) {
  try {
    return JSON.parse(await fs.readFile(file, "utf8"));
  } catch {
    return fallback;
  }
}

async function writeJson(file, value) {
  await fs.writeFile(file, `${JSON.stringify(value, null, 2)}\n`);
}

function todayKey() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
