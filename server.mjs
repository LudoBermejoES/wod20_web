// Production entry for the WoD20 site (Astro @astrojs/node `middleware` mode).
//
// A thin Node HTTP server that gates EVERY request behind HTTP Basic Auth, then serves:
//   1. the prerendered static pages from dist/client/ (via sirv), and
//   2. the on-demand routes (e.g. /api/search) via the Astro request `handler`.
//
// The gate lives here (not in Astro middleware) because the site is prerendered: Astro
// middleware runs at build time for static routes and so can't password-protect them at
// request time. Wrapping the handler covers static pages AND the API in one place.
//
// Credentials come from the environment (WOD20_AUTH_USER / WOD20_AUTH_PASS) — kept in the
// server's .env (gitignored, injected at deploy), never committed. If WOD20_AUTH_PASS is
// unset, the gate is DISABLED (open site) and a warning is logged, so a misconfig fails
// open loudly rather than locking you out silently in dev.
import http from 'node:http';
import { timingSafeEqual } from 'node:crypto';
import sirv from 'sirv';
import { handler as astroHandler } from './dist/server/entry.mjs';

const HOST = process.env.HOST ?? '0.0.0.0';
const PORT = Number(process.env.PORT ?? 4321);
const USER = process.env.WOD20_AUTH_USER ?? 'amigo';
const PASS = process.env.WOD20_AUTH_PASS ?? '';
const REALM = 'Di amigo y entra';
const GATE = PASS.length > 0;

if (!GATE) {
  console.warn('[wod20] WOD20_AUTH_PASS is empty — password gate DISABLED (site is open).');
}

// Serve the prerendered client build; fall through (next) to the Astro handler.
const serveStatic = sirv('./dist/client/', { etag: true, maxAge: 3600, gzip: true, brotli: true });

// Constant-time credential check (avoids leaking length/among-equal-prefix via timing).
function eq(a, b) {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  return ab.length === bb.length && timingSafeEqual(ab, bb);
}

function isAuthorized(req) {
  const header = req.headers['authorization'];
  if (!header || !header.startsWith('Basic ')) return false;
  let decoded;
  try {
    decoded = Buffer.from(header.slice(6), 'base64').toString('utf8');
  } catch {
    return false;
  }
  const i = decoded.indexOf(':');
  if (i < 0) return false;
  const user = decoded.slice(0, i);
  const pass = decoded.slice(i + 1);
  // evaluate both comparisons regardless, then AND — no early-out on the username
  const okUser = eq(user, USER);
  const okPass = eq(pass, PASS);
  return okUser && okPass;
}

function requestAuth(res) {
  res.writeHead(401, {
    'WWW-Authenticate': `Basic realm="${REALM}", charset="UTF-8"`,
    'Content-Type': 'text/plain; charset=utf-8',
  });
  res.end('Autenticación requerida.');
}

const server = http.createServer((req, res) => {
  if (GATE && !isAuthorized(req)) return requestAuth(res);
  serveStatic(req, res, () => astroHandler(req, res));
});

server.listen(PORT, HOST, () => {
  console.log(`[wod20] listening on http://${HOST}:${PORT} (gate: ${GATE ? 'on' : 'OFF'})`);
});
