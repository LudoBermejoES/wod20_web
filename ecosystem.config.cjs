// PM2 process definition for the WoD20 reading site.
//
// The site is a static Astro build wrapped by a thin Node server (server.mjs, using the
// @astrojs/node `middleware` handler): it enforces a site-wide password gate, serves the
// prerendered pages, and handles the ONE dynamic route — the semantic search endpoint
// (src/pages/api/search.ts), which keeps a BGE-M3 embedder resident and opens the LanceDB
// index at request time. That resident model is why a long-lived Node process is needed.
//
// Build first, then run:
//   npm run build
//   npm run start:prod        # pm2-runtime (foreground; for Docker/systemd)
//   # or, for a managed daemon:
//   pm2 start ecosystem.config.cjs --env production
//
// server.mjs reads HOST/PORT + WOD20_AUTH_USER/WOD20_AUTH_PASS from the environment.
// The auth password is NOT stored here (it would be committed) — it lives in the
// server's .env (gitignored, injected at deploy), loaded via --env-file-if-exists below.
module.exports = {
  apps: [
    {
      name: 'wod20-web',
      script: 'server.mjs',
      // Load the server-side .env (auth password etc.) if present — keeps secrets out of
      // this committed file. -if-exists so local/dev runs without a .env don't crash.
      node_args: '--env-file-if-exists=.env',
      // Pin cwd to this file's dir so the relative build path, the .env, and the LanceDB
      // default resolve no matter where pm2 is invoked from.
      cwd: __dirname,
      instances: 1,
      // fork (not cluster): the endpoint holds the embedding model resident in memory;
      // one warm process is the whole point — clustering would multiply the model's
      // RAM and cold-start each worker separately.
      exec_mode: 'fork',
      env_production: {
        NODE_ENV: 'production',
        HOST: '0.0.0.0',
        PORT: 4321,
        // Prebuilt LanceDB index and model cache live INSIDE the deploy dir so the
        // deploy workflow preserves them across releases (see .github/workflows/
        // deploy.yml). These absolute server paths assume DEPLOY_PATH=/var/www/wod20.
        // For a local prod-preview, override both to your checkout's paths.
        WOD20_LANCEDB_DIR: '/var/www/wod20/derived/lancedb',
        WOD20_MODEL_CACHE: '/var/www/wod20/.model-cache',
        // WOD20_EMBED_MODEL defaults to 'Xenova/bge-m3' in the endpoint.
      },
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      error_file: 'logs/pm2-error.log',
      out_file: 'logs/pm2-out.log',
      merge_logs: true,
      // BGE-M3 (fp32) stays resident by design; a restart cold-loads it and defeats the
      // keep-warm goal, so this ceiling is generous — a real leak still trips it, normal
      // model residency does not.
      max_memory_restart: '2G',
      watch: false,
      autorestart: true,
    },
  ],
};
